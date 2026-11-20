import { NextResponse } from 'next/server';
import { membership } from '@/lib/access';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = await membership((await params).id);
  if ('error' in m) return m.error;
  const { g, me } = m;
  if (g.status !== 'rep_confirmed') return NextResponse.json({ error: '대표가 아직 확정되지 않았어요' }, { status: 409 });
  if (g.repCaseId === me.id) return NextResponse.json({ error: '대표는 위임할 필요가 없어요' }, { status: 409 });
  const { name } = await req.json().catch(() => ({ name: '' }));
  if (!String(name ?? '').trim()) return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 });
  g.delegations[me.id] = { name: String(name).trim().slice(0, 30), at: new Date().toISOString() };
  return NextResponse.json({ ok: true });
}
