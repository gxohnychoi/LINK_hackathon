// 임시 구현 — 팀원의 security 브랜치 구현으로 교체될 예정. 시그니처만 맞춰 둠.
import type { ClueType } from './types';

/** 단서 정규화. 유효한 값이 없으면 빈 문자열 */
export function normalizeClue(type: ClueType, raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  switch (type) {
    case 'account':
      return v.replace(/\D/g, '');
    case 'phone': {
      let d = v.replace(/[^\d+]/g, '');
      if (d.startsWith('+82')) d = '0' + d.slice(3);
      return d.replace(/\D/g, '');
    }
    case 'nick':
    case 'kakao':
      return v.toLowerCase().replace(/\s+/g, '');
    case 'url':
      return v.toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#:]/)[0];
  }
  return '';
}
