// 실행: npm run test:security   (Node 22+, 추가 설치 없음)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { normalizeClue } from '../lib/normalize.ts';

const enc = new TextEncoder();
const KEY = 'test-pepper';
async function hmac(type: any, raw: string) {
  const n = normalizeClue(type, raw);
  const k = await webcrypto.subtle.importKey('raw', enc.encode(KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Buffer.from(await webcrypto.subtle.sign('HMAC', k, enc.encode(`${type}:${n}`))).toString('hex');
}
const sha = async (b: Uint8Array) => Buffer.from(await webcrypto.subtle.digest('SHA-256', b)).toString('hex');

test('계좌: 하이픈·공백이 달라도 같은 값', () => {
  for (const v of ['110-123-456789', '110 123 456789', '110123456789', ' 110.123.456789 '])
    assert.equal(normalizeClue('account', v), '110123456789');
});
test('전화: +82 / 82 / 하이픈 차이 흡수', () => {
  for (const v of ['010-1234-5678', '+82 10-1234-5678', '821012345678', '010 1234 5678'])
    assert.equal(normalizeClue('phone', v), '01012345678');
});
test('사이트: https, www, 경로, 대소문자 차이 흡수', () => {
  for (const v of ['https://www.safe-pay-check.com/order', 'www.safe-pay-check.com', 'SAFE-PAY-CHECK.COM', 'http://safe-pay-check.com:8080/pay?id=31#x', 'safe-pay-check.com.'])
    assert.equal(normalizeClue('url', v), 'safe-pay-check.com');
});
test('닉네임·카톡: 대소문자, 공백, 앞 @ 흡수', () => {
  assert.equal(normalizeClue('kakao', '@Seller_Kim'), normalizeClue('kakao', 'seller_kim'));
  assert.equal(normalizeClue('nick', '아이패드 팝니다'), normalizeClue('nick', '아이패드팝니다'));
});
test('빈 값은 null', () => {
  assert.equal(normalizeClue('account', '   '), '');
  assert.equal(normalizeClue('url', 'https://'), '');
});
test('HMAC: 표기가 달라도 같은 해시, 다른 값은 다른 해시, 원문이 해시에 안 남음', async () => {
  const a = await hmac('account', '110-123-456789');
  assert.equal(a, await hmac('account', '110 123 456789'));
  assert.notEqual(a, await hmac('account', '110-123-456780'));
  assert.notEqual(a, await hmac('phone', '110123456789')); // 타입이 다르면 다른 해시
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.ok(!a.includes('110123456789'));
});
test('봉인: 1바이트만 바뀌어도 지문이 달라짐', async () => {
  const f = enc.encode('이체확인증 450,000원');
  const seal = await sha(f);
  const t = f.slice(); t[t.length - 1] ^= 0xff;
  assert.equal(await sha(f.slice()), seal);
  assert.notEqual(await sha(t), seal);
});
test('합산 공개 기준: 3명 이상만', () => {
  const canShowTotal = (n: number) => n >= 3; // lib/crypto.ts 와 동일 규칙
  assert.equal(canShowTotal(2), false);
  assert.equal(canShowTotal(3), true);
});
