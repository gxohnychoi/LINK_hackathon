import type { ClueType } from './types';

/** 단서 정규화. 유효한 값이 없으면 null */
export function normalizeClue(type: ClueType, raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  let out = '';
  switch (type) {
    case 'account':
      out = v.replace(/\D/g, '');
      break;
    case 'phone': {
      let d = v.replace(/[^\d+]/g, '');
      if (d.startsWith('+82')) d = '0' + d.slice(3);
      out = d.replace(/\D/g, '');
      break;
    }
    case 'nick':
    case 'kakao':
      out = v.toLowerCase().replace(/\s+/g, '');
      break;
    case 'url':
      out = v.toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#:]/)[0];
      break;
  }
  return out || null;
}

const enc = new TextEncoder();
let keyPromise: Promise<CryptoKey> | null = null;
function getKey() {
  const pepper = process.env.NEXT_PUBLIC_CLUE_PEPPER;
  if (!pepper) throw new Error('NEXT_PUBLIC_CLUE_PEPPER 가 설정되지 않았습니다 (.env.local)');
  keyPromise ??= crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return keyPromise;
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

/** 정규화 → HMAC-SHA256(`type:value`). 브라우저/서버(시드) 공용 */
export async function hmacClue(type: ClueType, raw: string): Promise<string | null> {
  const n = normalizeClue(type, raw);
  if (!n) return null;
  return hex(await crypto.subtle.sign('HMAC', await getKey(), enc.encode(`${type}:${n}`)));
}

export async function sha256Hex(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', bytes as BufferSource));
}

/** data URL → 원본 바이트 */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
