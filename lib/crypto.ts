import { normalizeClue } from './normalize';
import type { ClueType } from './types';

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256OfBlob = async (file: Blob) => hex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));

/*
 * HMAC 키(pepper)
 * 일반 SHA-256은 계좌·전화번호처럼 경우의 수가 적은 값을 전부 대입하면 원문이 복원된다.
 * 비밀키가 있어야 계산되는 HMAC을 써서, DB만 유출돼서는 원문을 역추적할 수 없게 한다.
 * [알려진 한계] 데모는 브라우저에서 계산하므로 키가 클라이언트 번들에 노출된다.
 *  → 실서비스: OPRF(서버가 키를 쥐되 원문은 못 보는 방식) 또는 PSI로 전환.
 */
let keyPromise: Promise<CryptoKey> | null = null;
function getKey() {
  const pepper = process.env.NEXT_PUBLIC_CLUE_PEPPER;
  if (!pepper) throw new Error('NEXT_PUBLIC_CLUE_PEPPER 가 설정되지 않았습니다 (.env.local)');
  keyPromise ??= crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return keyPromise;
}

/** 정규화 → HMAC-SHA256(`type:value`). 타입을 붙여 계좌/전화처럼 숫자가 같아도 섞이지 않게 함. 비면 빈 문자열 */
export async function makeClueHash(type: ClueType, raw: string): Promise<string> {
  const n = normalizeClue(type, raw);
  if (!n) return '';
  return hex(await crypto.subtle.sign('HMAC', await getKey(), enc.encode(`${type}:${n}`)));
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
