import { NextResponse } from 'next/server';
import { db } from './store';
import { currentUser } from './user';

/** 현재 유저가 속한 그룹과 내 피해 건. 구성원이 아니면 error 응답 */
export async function membership(groupId: string) {
  const user = await currentUser();
  const s = await db();
  const g = s.groups.find((x) => x.id === groupId);
  if (!g) return { error: NextResponse.json({ error: '그룹을 찾을 수 없어요' }, { status: 404 }) } as const;
  const me = s.cases.find((c) => c.userId === user && g.caseIds.includes(c.id));
  if (!me) return { error: NextResponse.json({ error: '이 그룹의 구성원이 아니에요' }, { status: 403 }) } as const;
  return { s, g, me, user } as const;
}
