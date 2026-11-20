import { NextResponse } from 'next/server';
import { membership } from '@/lib/access';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await membership((await params).id);
  if ('error' in m) return m.error;
  const { g, me } = m;
  if (g.status !== 'rep_pending' || g.repCaseId === me.id) {
    return NextResponse.json({ error: '승인할 대표 신청이 없어요' }, { status: 409 });
  }
  const { approved } = await req.json().catch(() => ({ approved: false }));
  if (!approved) {
    // 한 명이라도 거절하면 신청 취소
    g.status = 'open'; g.repCaseId = undefined; g.approvals = {};
    return NextResponse.json({ ok: true, status: g.status });
  }
  g.approvals[me.id] = true;
  if (g.caseIds.every((id) => id === g.repCaseId || g.approvals[id])) g.status = 'rep_confirmed';
  return NextResponse.json({ ok: true, status: g.status });
}
