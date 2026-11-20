export type UserId = 'A' | 'B' | 'C' | 'D';
export const USERS: UserId[] = ['A', 'B', 'C', 'D'];
export type ClueType = 'account' | 'phone' | 'nick' | 'kakao' | 'url';
export const CLUE_TYPES: ClueType[] = ['account', 'phone', 'nick', 'kakao', 'url'];
export const CLUE_LABEL: Record<ClueType, string> = {
  account: '계좌번호', phone: '전화번호', nick: '중고거래 닉네임', kakao: '카톡 ID', url: '사이트 주소',
};

export type Case = {
  id: string; userId: UserId;
  platform: string; itemName: string; amount: number; sentAt: string;
  groupId?: string; alias?: string;
};
export type Clue = { caseId: string; type: ClueType; hmac: string };
export type EvidenceKind = 'transfer' | 'chat' | 'listing';
export const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  transfer: '이체확인증', chat: '대화 캡처', listing: '판매글 캡처',
};
export type Evidence = {
  id: string; caseId: string; kind: EvidenceKind;
  fileName: string; dataUrl: string; sha256: string; sealedAt: string;
};
export type Group = {
  id: string; caseIds: string[];
  status: 'open' | 'rep_pending' | 'rep_confirmed';
  repCaseId?: string;
  approvals: Record<string, boolean>;
  delegations: Record<string, { name: string; at: string }>;
};
export type Store = { cases: Case[]; clues: Clue[]; evidence: Evidence[]; groups: Group[] };
