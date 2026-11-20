import type { ClueType } from './types';

/**
 * 단서 정규화. 같은 단서를 다르게 써도 같은 값이 되도록 맞춘다. 유효한 값이 없으면 빈 문자열.
 *  - account   : 숫자만 (110-123-456789 = 110 123 456789)
 *  - phone     : 숫자만, +82 / 82 국가번호 → 0 (010-1234-5678 = +82 10 1234 5678)
 *  - nick/kakao: 소문자, 공백·앞쪽 @ 제거 (@Seller_Kim = seller_kim)
 *  - url       : 도메인만 (https://www.a.com:8080/pay?id=1 = a.com)
 */
export function normalizeClue(type: ClueType, raw: string): string {
  const v = (raw ?? '').normalize('NFC').trim();
  if (!v) return '';
  switch (type) {
    case 'account':
      return v.replace(/\D/g, '');
    case 'phone': {
      const d = v.replace(/\D/g, '');
      return d.startsWith('82') && d.length >= 11 ? '0' + d.slice(2) : d;
    }
    case 'nick':
    case 'kakao':
      return v.toLowerCase().replace(/\s+/g, '').replace(/^@+/, '');
    case 'url':
      return v
        .toLowerCase()
        .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
        .replace(/^[^@/]*@/, '')
        .split(/[/?#:]/)[0]
        .replace(/^www\./, '')
        .replace(/\.+$/, '');
  }
  return '';
}
