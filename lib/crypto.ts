// 임시 구현 — 팀원의 security 브랜치 구현으로 교체될 예정. 시그니처만 맞춰 둠.
import { normalizeClue } from './normalize';
import type { ClueType } from './types';

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256OfBlob = async (file: Blob) => hex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));

let keyPromise: Promise<CryptoKey> | null = null;
function getKey() {
  const pepper = process.env.NEXT_PUBLIC_CLUE_PEPPER;
  if (!pepper) throw new Error('NEXT_PUBLIC_CLUE_PEPPER 가 설정되지 않았습니다 (.env.local)');
  keyPromise ??= crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return keyPromise;
}

/** 정규화 → HMAC-SHA256(`type:value`). 정규화 결과가 비면 빈 문자열 */
export async function makeClueHash(type: ClueType, raw: string): Promise<string> {
  const n = normalizeClue(type, raw);
  if (!n) return '';
  return hex(await crypto.subtle.sign('HMAC', await getKey(), enc.encode(`${type}:${n}`)));
}

/** 증거 봉인: 파일 SHA-256 + 시각 */
export async function sealEvidence(file: Blob): Promise<{ sha256: string; sealedAt: string }> {
  return { sha256: await sha256OfBlob(file), sealedAt: new Date().toISOString() };
}

/** 봉인 확인: 파일 해시가 봉인 해시와 같은지 */
export async function checkSeal(file: Blob, sha256: string): Promise<boolean> {
  return (await sha256OfBlob(file)) === sha256;
}

/** 합산 피해액 공개 여부: 3명 이상일 때만 (2명이면 상대 금액 역산 가능) */
export function canShowTotal(memberCount: number): boolean {
  return memberCount >= 3;
}
