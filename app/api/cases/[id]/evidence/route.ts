import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { db, newId } from '@/lib/store';
import { currentUser } from '@/lib/user';
import type { EvidenceKind } from '@/lib/types';

const KINDS: EvidenceKind[] = ['transfer', 'chat', 'listing'];

async function ownCase(id: string) {
  const user = await currentUser();
  const s = await db();
  const c = s.cases.find((x) => x.id === id && x.userId === user);
  return { s, c };
}

// 내 피해 건의 증거 목록
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { s, c } = await ownCase((await params).id);
  if (!c) return NextResponse.json({ error: '내 피해 건이 아니에요' }, { status: 403 });
  return NextResponse.json({
    case: { id: c.id, itemName: c.itemName, groupId: c.groupId ?? null },
    evidence: s.evidence.filter((e) => e.caseId === c.id),
  });
}

// 증거 업로드 = 봉인: 서버가 받은 파일로 SHA-256을 다시 계산해 브라우저 값과 대조한 뒤, 서버 시각과 함께 기록
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { s, c } = await ownCase((await params).id);
  if (!c) return NextResponse.json({ error: '내 피해 건이 아니에요' }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!KINDS.includes(b?.kind) || typeof b?.dataUrl !== 'string' || !b.dataUrl.startsWith('data:image/') || typeof b?.sha256 !== 'string' || !b.sha256 || b.sha256.length > 256) {
    return NextResponse.json({ error: '잘못된 증거 형식이에요' }, { status: 400 });
  }
  if (b.dataUrl.length > 8_000_000) return NextResponse.json({ error: '파일이 너무 커요 (최대 약 5MB)' }, { status: 413 });
  // 봉인 지문은 서버가 직접 계산 (클라이언트가 보낸 해시를 그대로 믿지 않음)
  const bytes = Buffer.from(b.dataUrl.slice(b.dataUrl.indexOf(',') + 1), 'base64');
  const serverSha = createHash('sha256').update(bytes).digest('hex');
  if (serverSha !== String(b.sha256).toLowerCase()) {
    return NextResponse.json({ error: '전송 중 파일이 바뀌었어요 (봉인 지문 불일치)' }, { status: 400 });
  }
  const ev = {
    id: newId('e'), caseId: c.id, kind: b.kind as EvidenceKind, fileName: String(b.fileName ?? 'evidence'),
    dataUrl: b.dataUrl, sha256: serverSha, sealedAt: new Date().toISOString(),
  };
  s.evidence.push(ev);
  return NextResponse.json({ id: ev.id, sealedAt: ev.sealedAt });
}
