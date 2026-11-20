import { NextResponse } from 'next/server';
import { membership } from '@/lib/access';
import { sharedClueCounts } from '@/lib/groups';
import { canShowTotal } from '@/lib/crypto';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await membership((await params).id);
  if ('error' in m) return m.error;
  const { s, g, me } = m;
  const members = g.caseIds.map((id) => s.cases.find((c) => c.id === id)!);
  const rep = members.find((c) => c.id === g.repCaseId);
  // 타인의 개별 금액·단서·이름은 포함하지 않음
  return NextResponse.json({
    id: g.id,
    size: members.length,
    // 3명 미만이면 합산액도 숨김 (내 금액을 빼면 상대 금액이 드러남)
    totalAmount: canShowTotal(members.length) ? members.reduce((a, c) => a + c.amount, 0) : null,
    sharedClues: sharedClueCounts(s, g),
    status: g.status,
    repAlias: rep?.alias ?? null,
    me: {
      caseId: me.id, alias: me.alias, isRep: g.repCaseId === me.id,
      approved: g.approvals[me.id] ?? false, delegated: !!g.delegations[me.id],
    },
    approvedCount: Object.values(g.approvals).filter(Boolean).length,
    approvalNeeded: Math.max(members.length - 1, 0),
    cards: members.map((c) => ({
      alias: c.alias, sentAt: c.sentAt, isMe: c.id === me.id, isRep: c.id === g.repCaseId,
      approved: g.approvals[c.id] ?? false, delegated: !!g.delegations[c.id],
    })),
  });
}
