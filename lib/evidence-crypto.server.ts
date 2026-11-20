// 서버 전용: 증거 파일 저장 시 암호화 (AES-256-GCM). 클라이언트 컴포넌트에서 import 금지.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  // EVIDENCE_KEY(서버 전용) 권장. 없으면 단서 키에서 용도를 구분해 파생 (데모 편의)
  const secret = process.env.EVIDENCE_KEY ?? `evidence:${process.env.CLUE_PEPPER ?? process.env.NEXT_PUBLIC_CLUE_PEPPER ?? ''}`;
  if (secret === 'evidence:') throw new Error('EVIDENCE_KEY 또는 CLUE_PEPPER 가 설정되지 않았습니다 (.env.local)');
  return createHash('sha256').update(secret).digest(); // 32바이트 키
}

/** 증거(dataUrl)를 암호화해 저장용 문자열로: enc:v1:<iv>:<tag>:<암호문> (base64) */
export function encryptEvidence(dataUrl: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const ct = Buffer.concat([cipher.update(dataUrl, 'utf8'), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), ct].map((b) => b.toString('base64')).join(':');
}

/** 저장된 문자열을 dataUrl로 복호화. 암호문이 1비트라도 바뀌면 GCM 인증 실패로 예외 */
export function decryptEvidence(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // 이전 형식 호환
  const [iv, tag, ct] = stored.slice(PREFIX.length).split(':').map((s) => Buffer.from(s, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}
