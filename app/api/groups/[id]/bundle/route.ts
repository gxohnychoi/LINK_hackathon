import { NextResponse } from 'next/server';
import { membership } from '@/lib/access';
import { sharedClueCounts } from '@/lib/groups';

// 대표 전용: 사건 요약 + 위임자별 증거 + 봉인 해시
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await membership((await params).id);
  if ('error' in m) return m.error;
  const { s, g, me } = m;
  if (g.status !== 'rep_confirmed' || g.repCaseId !== me.id) {
    return NextResponse.json({ error: '대표만 볼 수 있어요' }, { status: 403 });
  }
  // 포함 대상: 대표 본인 + 위임한 피해자
  const included = g.caseIds
    .map((id) => s.cases.find((c) => c.id === id)!)
    .filter((c) => c.id === me.id || g.delegations[c.id]);

  const victims = included.map((c) => ({
    alias: c.alias,
    name: c.id === me.id ? '대표 본인' : g.delegations[c.id].name,
    isRep: c.id === me.id,
    delegatedAt: g.delegations[c.id]?.at ?? null,
    sentAt: c.sentAt, platform: c.platform, itemName: c.itemName,
    evidence: s.evidence.filter((e) => e.caseId === c.id)
      .map(({ id, kind, fileName, dataUrl, sha256, sealedAt }) => ({ id, kind, fileName, dataUrl, sha256, sealedAt })),
  }));

  return NextResponse.json({
    summary: {
      delegatedCount: included.length,
      groupSize: g.caseIds.length,
      totalAmount: included.reduce((a, c) => a + c.amount, 0),
      sharedClues: sharedClueCounts(s, g),
      timeline: [...victims].sort((a, b) => a.sentAt.localeCompare(b.sentAt))
        .map(({ alias, name, sentAt, platform, itemName }) => ({ alias, name, sentAt, platform, itemName })),
    },
    victims,
  });
}
