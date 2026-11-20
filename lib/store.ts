import type { Store } from './types';

// 모듈 단위 메모리 저장소. dev HMR에도 유지되도록 globalThis에 보관.
const g = globalThis as unknown as { __linkStore?: Promise<Store> };

async function seed(): Promise<Store> {
  return { cases: [], clues: [], evidence: [], groups: [] };
}

export function db(): Promise<Store> {
  if (!g.__linkStore) g.__linkStore = seed();
  return g.__linkStore;
}

export const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
