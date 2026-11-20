import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sealEvidence } from './crypto';
import { makeClueHashServer } from './clue-hash.server';
import { encryptEvidence } from './evidence-crypto.server';
import { recomputeGroups } from './groups';
import type { Store, Case, ClueType, EvidenceKind, UserId } from './types';

// 모듈 단위 메모리 저장소. dev HMR에도 유지되도록 globalThis에 보관.
const g = globalThis as unknown as { __linkStore?: Promise<Store> };

export { newId } from './id';
import { newId } from './id';

type SeedRow = {
  userId: UserId; platform: string; itemName: string; amount: number; sentAt: string;
  clues: [ClueType, string][]; evidence: [EvidenceKind, string][];
};
const SEED: SeedRow[] = [
  { userId: 'A', platform: '중고나라', itemName: '아이패드 에어 5', amount: 450000, sentAt: '2026-11-03',
    clues: [['account', '110-123-456789'], ['nick', '아이패드팝니다']],
    evidence: [['transfer', 'a_transfer.svg'], ['chat', 'a_chat.svg']] },
  { userId: 'B', platform: '번개장터', itemName: '아이패드 프로 11', amount: 420000, sentAt: '2026-11-07',
    clues: [['account', '110123456789'], ['url', 'https://safe-pay-check.com/order']],
    evidence: [['transfer', 'b_transfer.svg'], ['listing', 'b_listing.svg']] },
  { userId: 'C', platform: '당근', itemName: '갤럭시탭 S9', amount: 480000, sentAt: '2026-11-12',
    clues: [['url', 'www.safe-pay-check.com'], ['phone', '010-1234-5678']],
    evidence: [['transfer', 'c_transfer.svg'], ['chat', 'c_chat.svg']] },
  { userId: 'D', platform: '중고나라', itemName: '에어팟 프로 2', amount: 300000, sentAt: '2026-11-15',
    clues: [['phone', '010-9999-0000']],
    evidence: [['transfer', 'd_transfer.svg']] },
];

async function seed(): Promise<Store> {
  const s: Store = { cases: [], clues: [], evidence: [], groups: [] };
  for (const row of SEED) {
    const c: Case = { id: newId('c'), userId: row.userId, platform: row.platform, itemName: row.itemName, amount: row.amount, sentAt: row.sentAt };
    s.cases.push(c);
    for (const [type, raw] of row.clues) {
      const hmac = makeClueHashServer(type, raw); // 시드도 화면과 같은 함수로 해시 (원문 미보관)
      if (hmac) s.clues.push({ caseId: c.id, type, hmac });
    }
    for (const [kind, file] of row.evidence) {
      const bytes = readFileSync(path.join(process.cwd(), 'public', 'demo', file));
      s.evidence.push({
        id: newId('e'), caseId: c.id, kind, fileName: file,
        dataUrl: encryptEvidence(`data:image/svg+xml;base64,${bytes.toString('base64')}`), // 저장 시 암호화
        sha256: (await sealEvidence(new Blob([new Uint8Array(bytes)]))).sha256,
        sealedAt: new Date(`${row.sentAt}T21:00:00+09:00`).toISOString(),
      });
    }
  }
  recomputeGroups(s);
  return s;
}

export function db(): Promise<Store> {
  if (!g.__linkStore) g.__linkStore = seed();
  return g.__linkStore;
}
