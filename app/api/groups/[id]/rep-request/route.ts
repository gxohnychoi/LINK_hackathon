import { NextResponse } from 'next/server';
import { membership } from '@/lib/access';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await membership((await params).id);
  if ('error' in m) return m.error;
  const { g, me } = m;
  if (g.status !== 'open') return NextResponse.json({ error: '이미 대표 신청이 진행 중이에요' }, { status: 409 });
  g.status = 'rep_pending';
  g.repCaseId = me.id;
  g.approvals = Object.fromEntries(g.caseIds.filter((id) => id !== me.id).map((id) => [id, false]));
  return NextResponse.json({ ok: true });
}
