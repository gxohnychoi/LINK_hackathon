import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

// 데모용: 메모리 저장소 전체. 증거는 암호문(enc:v1:…) 상태 그대로 앞 60자만 보여줌
export async function GET() {
  const s = await db();
  return NextResponse.json({
    ...s,
    evidence: s.evidence.map((e) => ({ ...e, dataUrl: e.dataUrl.slice(0, 60) + '…' })),
  });
}
