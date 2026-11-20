import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { currentUser } from '@/lib/user';

export async function GET() {
  const user = await currentUser();
  const s = await db();
  const cases = s.cases.filter((c) => c.userId === user).map((c) => {
    const g = s.groups.find((x) => x.id === c.groupId);
    return {
      ...c,
      evidenceCount: s.evidence.filter((e) => e.caseId === c.id).length,
      group: g ? { id: g.id, size: g.caseIds.length, status: g.status, isRep: g.repCaseId === c.id } : null,
    };
  });
  return NextResponse.json({ user, cases });
}
