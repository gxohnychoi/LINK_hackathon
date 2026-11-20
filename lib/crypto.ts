import { normalizeClue } from './normalize';
import type { ClueType } from './types';

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256OfBlob = async (file: Blob) => hex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));

/*
 * 단서 해시 (HMAC-SHA256)
 * 일반 SHA-256은 계좌·전화번호처럼 경우의 수가 적은 값을 전부 대입하면 원문이 복원된다.
 * 비밀키가 있어야 계산되는 HMAC을 쓰고, 그 키는 서버에만 둔다(lib/clue-hash.server.ts).
 * 브라우저는 /api/clue-hash 에 요청해 해시만 받고, 서버는 원문을 저장하지 않는다.
 * [남은 한계] 원문이 서버를 한 번 지나간다 → 실서비스: OPRF로 서버도 원문을 못 보게.
 */
export async function makeClueHash(type: ClueType, raw: string): Promise<string> {
  if (!normalizeClue(type, raw)) return '';
  const r = await fetch('/api/clue-hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, raw }),
  });
  if (!r.ok) throw new Error('단서 해시 계산에 실패했어요');
  return (await r.json()).hmac as string;
}

/** 증거 봉인: 등록 순간의 파일 지문(SHA-256) + 시각 */
export async function sealEvidence(file: Blob): Promise<{ sha256: string; sealedAt: string }> {
  return { sha256: await sha256OfBlob(file), sealedAt: new Date().toISOString() };
}

/** 봉인 확인: 지금 파일 지문이 봉인 당시와 같은지. 1바이트만 바뀌어도 false */
export async function checkSeal(file: Blob, sha256: string): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/i.test(sha256)) return false;
  return (await sha256OfBlob(file)) === sha256.toLowerCase();
}

/** 합산 피해액 공개 여부: 3명 이상일 때만 (2명이면 "합산 − 내 금액 = 상대 금액"으로 역산 가능) */
export const MIN_TOTAL_MEMBERS = 3;
export function canShowTotal(memberCount: number): boolean {
  return memberCount >= MIN_TOTAL_MEMBERS;
}

/** 자유 입력(메모 등)에 섞인 휴대폰·계좌·이메일 가리기 */
export function maskPersonalInfo(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => m[0] + '***@***')
    .replace(/(01[016789])[-\s.]?(\d{3,4})[-\s.]?(\d{4})/g, '$1-****-$3')
    .replace(/\b\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}\b/g, (m) => m.replace(/\d(?=[\d-\s]{4})/g, '*'));
}
