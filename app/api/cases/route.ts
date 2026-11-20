import { NextResponse } from 'next/server';
import { db, newId } from '@/lib/store';
import { currentUser } from '@/lib/user';
import { recomputeGroups } from '@/lib/groups';
import { CLUE_TYPES, type Clue, type ClueType } from '@/lib/types';

export async function POST(req: Request) {
  const user = await currentUser();
  const b = await req.json().catch(() => null);
  const amount = Number(b?.amount);
  if (!b?.platform || !b?.itemName || !b?.sentAt || !(amount > 0)) {
    return NextResponse.json({ error: '피해 정보를 모두 입력해주세요' }, { status: 400 });
  }
  const clues: { type: ClueType; hmac: string }[] = (Array.isArray(b.clues) ? b.clues : []).filter(
    (c: { type: ClueType; hmac: string }) => CLUE_TYPES.includes(c?.type) && /^[0-9a-f]{64}$/.test(c?.hmac),
  );
  if (!clues.length) return NextResponse.json({ error: '단서를 하나 이상 입력해주세요' }, { status: 400 });

  const s = await db();
  const id = newId('c');
  s.cases.push({ id, userId: user, platform: String(b.platform), itemName: String(b.itemName), amount, sentAt: String(b.sentAt) });
  const seen = new Set<string>();
  for (const c of clues) {
    if (seen.has(c.hmac)) continue;
    seen.add(c.hmac);
    s.clues.push({ caseId: id, type: c.type, hmac: c.hmac } satisfies Clue);
  }
  recomputeGroups(s);
  const mine = s.cases.find((c) => c.id === id)!;
  return NextResponse.json({ id, groupId: mine.groupId ?? null });
}
