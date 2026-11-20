import { newId } from './id';
import type { Store, Group, ClueType } from './types';

/** 전체 Clue를 hmac 기준 Union-Find → 2건 이상 연결된 집합마다 Group 생성·병합 */
export function recomputeGroups(s: Store) {
  const parent = new Map<string, string>();
  for (const c of s.cases) parent.set(c.id, c.id);
  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  };
  const firstByHmac = new Map<string, string>();
  for (const cl of s.clues) {
    const prev = firstByHmac.get(cl.hmac);
    if (prev) parent.set(find(cl.caseId), find(prev));
    else firstByHmac.set(cl.hmac, cl.caseId);
  }

  const comps = new Map<string, string[]>();
  for (const c of s.cases) {
    const r = find(c.id);
    comps.set(r, [...(comps.get(r) ?? []), c.id]); // 등록 순서 유지
  }

  const next: Group[] = [];
  for (const c of s.cases) { c.groupId = undefined; c.alias = undefined; }

  for (const ids of comps.values()) {
    if (ids.length < 2) continue;
    // 기존 그룹 재사용 (구성원이 속했던 첫 그룹)
    const existing = s.groups.filter((g) => g.caseIds.some((id) => ids.includes(id)));
    const base: Group = existing[0]
      ? { ...existing[0] }
      : { id: newId('g'), caseIds: [], status: 'open', approvals: {}, delegations: {} };
    for (const other of existing.slice(1)) Object.assign(base.delegations, other.delegations);
    base.caseIds = ids;
    if (base.status === 'rep_pending') {
      for (const id of ids) if (id !== base.repCaseId && !(id in base.approvals)) base.approvals[id] = false;
    }
    ids.forEach((id, i) => {
      const c = s.cases.find((x) => x.id === id)!;
      c.groupId = base.id;
      c.alias = `피해자 ${String.fromCharCode(65 + i)}`;
    });
    next.push(base);
  }
  s.groups = next;
}

/** 그룹 내에서 2건 이상 겹친 단서의 유형별 개수 */
export function sharedClueCounts(s: Store, g: Group): Partial<Record<ClueType, number>> {
  const byHmac = new Map<string, { type: ClueType; cases: Set<string> }>();
  for (const cl of s.clues) {
    if (!g.caseIds.includes(cl.caseId)) continue;
    const e = byHmac.get(cl.hmac) ?? { type: cl.type, cases: new Set<string>() };
    e.cases.add(cl.caseId);
    byHmac.set(cl.hmac, e);
  }
  const out: Partial<Record<ClueType, number>> = {};
  for (const e of byHmac.values()) if (e.cases.size >= 2) out[e.type] = (out[e.type] ?? 0) + 1;
  return out;
}
