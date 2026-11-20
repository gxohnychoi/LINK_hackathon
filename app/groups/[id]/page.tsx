'use client';
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Clock, FolderOpen, Lock, Package, Star, User } from 'lucide-react';
import { won, kDate } from '@/lib/format';
import { canShowTotal } from '@/lib/crypto';
import { CLUE_LABEL, type ClueType } from '@/lib/types';

type GroupView = {
  id: string; size: number; totalAmount: number | null; sharedClues: Partial<Record<ClueType, number>>;
  status: 'open' | 'rep_pending' | 'rep_confirmed'; repAlias: string | null;
  me: { caseId: string; alias: string; isRep: boolean; approved: boolean; delegated: boolean };
  approvedCount: number; approvalNeeded: number;
  cards: { alias: string; sentAt: string; isMe: boolean; isRep: boolean; approved: boolean; delegated: boolean }[];
};

const btn = 'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-center text-lg font-bold';
const darkBtn = `${btn} bg-ink text-gold`;
const note = 'flex items-center justify-center gap-2 rounded-2xl bg-sand p-4 text-center font-semibold text-chip-ink';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [g, setG] = useState<GroupView | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => {
    fetch(`/api/groups/${id}`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) setErr(j.error); else setG(j);
    });
  }, [id]);
  useEffect(load, [load]);

  async function post(path: string, body?: object) {
    const r = await fetch(`/api/groups/${id}/${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}),
    });
    if (!r.ok) alert((await r.json()).error);
    load();
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!g) return <p className="text-neutral-400">불러오는 중…</p>;

  const cardStatus = (c: GroupView['cards'][number]) => {
    if (c.isRep) return g.status === 'rep_confirmed' ? '대표' : '대표 신청';
    if (g.status === 'rep_pending') return c.approved ? '승인 ✓' : '대기';
    return c.delegated ? '위임 ✓' : '';
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] bg-ink p-6 text-white">
        <p className="text-sm text-neutral-400">같은 사기범에게 당한 피해자 {g.size}명</p>
        {canShowTotal(g.size) && g.totalAmount !== null ? (
          <p className="mt-3 text-[40px] font-black leading-tight tracking-tight text-gold">{won(g.totalAmount)}</p>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-2xl font-black text-gold">
            <Lock className="h-6 w-6 shrink-0" /> 3명 이상 모이면 공개돼요
          </p>
        )}
        <p className="mt-2 text-sm">합산 피해액 · 혼자가 아니에요</p>
      </section>

      {Object.keys(g.sharedClues).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {(Object.entries(g.sharedClues) as [ClueType, number][]).map(([t, n]) => (
            <span key={t} className="rounded-xl bg-chip px-4 py-2 text-sm font-bold text-chip-ink">겹친 {CLUE_LABEL[t]} {n}개</span>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-black">연결된 피해자</h2>
        {g.cards.map((c) => (
          <div key={c.alias}
            className={`flex items-center justify-between gap-2 rounded-3xl bg-sand px-5 py-5 ${c.isMe ? 'ring-2 ring-gold' : ''}`}>
            <div className="flex min-w-0 items-center gap-3">
              <User className="h-5 w-5 shrink-0 text-gold-deep" />
              <span className="font-bold">
                {c.alias} · {kDate(c.sentAt)} {c.isMe && <span className="text-xs text-gold-deep">(나)</span>}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm text-neutral-500">
              {c.isRep && g.status === 'rep_confirmed' && <Star className="h-4 w-4 fill-gold text-gold" />}
              {cardStatus(c)}
            </span>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        {g.status === 'open' && (
          <>
            <button onClick={() => post('rep-request')} className={darkBtn}>제가 대표할게요</button>
            <p className="text-center text-sm text-neutral-500">대표 피해자 한 명이 모든 증거를 모아 경찰에 제출해요.</p>
          </>
        )}
        {g.status === 'rep_pending' && g.me.isRep && (
          <p className={note}>
            <Clock className="h-5 w-5 shrink-0" /> 다른 피해자들의 승인을 기다리는 중 ({g.approvedCount}/{g.approvalNeeded})
          </p>
        )}
        {g.status === 'rep_pending' && !g.me.isRep && (g.me.approved ? (
          <p className={note}>
            <Check className="h-5 w-5 shrink-0" /> 승인 완료 · 다른 피해자 대기 중 ({g.approvedCount}/{g.approvalNeeded})
          </p>
        ) : (
          <>
            <p className="text-center text-neutral-600"><b>{g.repAlias}</b>님이 대표를 신청했어요.</p>
            <button onClick={() => post('approve', { approved: true })} className={darkBtn}>대표 승인하기</button>
            <button onClick={() => post('approve', { approved: false })} className={`${btn} bg-sand text-neutral-600`}>거절</button>
          </>
        ))}
        {g.status === 'rep_confirmed' && g.me.isRep && (
          <Link href={`/groups/${id}/bundle`} className={darkBtn}><Package className="h-5 w-5" /> 증거 묶음 보기</Link>
        )}
        {g.status === 'rep_confirmed' && !g.me.isRep && (g.me.delegated ? (
          <p className={note}><Check className="h-5 w-5 shrink-0" /> 대표({g.repAlias})에게 증거 위임 완료</p>
        ) : (
          <Link href={`/groups/${id}/delegate`} className={darkBtn}>증거 위임하기</Link>
        ))}
        <Link href={`/report/${g.me.caseId}/evidence`}
          className="flex items-center justify-center gap-1.5 pt-1 text-sm font-semibold text-neutral-500">
          <FolderOpen className="h-4 w-4" /> 내 증거 관리
        </Link>
      </section>
    </div>
  );
}
