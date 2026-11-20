// 서버 전용: HMAC 키는 이 파일에서만 읽는다. 클라이언트 컴포넌트에서 import 금지.
import { createHmac } from 'node:crypto';
import { normalizeClue } from './normalize';
import type { ClueType } from './types';

function getPepper(): string {
  // CLUE_PEPPER(서버 전용) 권장. 기존 .env.local 호환을 위해 NEXT_PUBLIC_ 값도 서버에서만 읽어 사용
  const pepper = process.env.CLUE_PEPPER ?? process.env.NEXT_PUBLIC_CLUE_PEPPER;
  if (!pepper) throw new Error('CLUE_PEPPER 가 설정되지 않았습니다 (.env.local)');
  return pepper;
}

/** 정규화 → HMAC-SHA256(`type:value`). 비면 빈 문자열 */
export function makeClueHashServer(type: ClueType, raw: string): string {
  const n = normalizeClue(type, raw);
  if (!n) return '';
  return createHmac('sha256', getPepper()).update(`${type}:${n}`).digest('hex');
}
