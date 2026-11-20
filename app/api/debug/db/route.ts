import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

// 데모용: 메모리 저장소 전체 (증거 dataUrl은 앞 50자만)
export async function GET() {
  const s = await db();
  return NextResponse.json({
    ...s,
    evidence: s.evidence.map((e) => ({ ...e, dataUrl: e.dataUrl.slice(0, 50) + '…' })),
  });
}
