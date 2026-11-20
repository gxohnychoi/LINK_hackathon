import { NextResponse } from 'next/server';
import { makeClueHashServer } from '@/lib/clue-hash.server';
import { CLUE_TYPES, type ClueType } from '@/lib/types';

// 단서 해시 계산 전용. 키는 서버에만 있고, 받은 원문은 저장·로그하지 않고 해시만 돌려준다.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const type = b?.type as ClueType;
  const raw = b?.raw;
  if (!CLUE_TYPES.includes(type) || typeof raw !== 'string' || raw.length > 200) {
    return NextResponse.json({ error: '잘못된 단서 형식이에요' }, { status: 400 });
  }
  return NextResponse.json({ hmac: makeClueHashServer(type, raw) }, { headers: { 'Cache-Control': 'no-store' } });
}
