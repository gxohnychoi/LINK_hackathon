'use client';
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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

const btn = 'block w-full rounded-2xl py-3.5 text-center font-bold';

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
  if (!g) return <p className="text-slate-400">불러오는 중…</p>;

  const cardStatus = (c: GroupView['cards'][number]) => {
    if (c.isRep) return g.status === 'rep_confirmed' ? '⭐ 대표' : '대표 신청';
    if (g.status === 'rep_pending') return c.approved ? '승인 ✓' : '대기';
    return c.delegated ? '위임 ✓' : '';
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">같은 사기범에게 당한 피해자 {g.size}명</p>
        {canShowTotal(g.size) && g.totalAmount !== null ? (
          <>
            <p className="mt-1 text-4xl font-black tracking-tight">{won(g.totalAmount)}</p>
            <p className="mt-1 text-sm opacity-80">합산 피해액 · 혼자가 아니에요</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-2xl font-black">🔒 3명 이상 모이면 공개돼요</p>
            <p className="mt-1 text-sm opacity-80">합산 피해액 · 혼자가 아니에요</p>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.entries(g.sharedClues) as [ClueType, number][]).map(([t, n]) => (
            <span key={t} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">겹친 {CLUE_LABEL[t]} {n}개</span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-slate-700">연결된 피해자</h2>
        {g.cards.map((c) => (
          <div key={c.alias} className={`flex items-center justify-between rounded-xl border p-3 ${c.isMe ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-lg">👤</span>
              <span className="font-semibold">
                {c.alias} · {kDate(c.sentAt)} {c.isMe && <span className="text-xs text-indigo-600">(나)</span>}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">{cardStatus(c)}</span>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        {g.status === 'open' && (
          <>
            <p className="text-sm text-slate-500">대표 피해자 한 명이 모든 증거를 모아 경찰에 제출해요.</p>
            <button onClick={() => post('rep-request')} className={`${btn} bg-indigo-600 text-white`}>제가 대표할게요</button>
          </>
        )}
        {g.status === 'rep_pending' && g.me.isRep && (
          <p className="rounded-xl bg-amber-50 p-3 text-center font-semibold text-amber-800">
            다른 피해자들의 승인을 기다리는 중 ({g.approvedCount}/{g.approvalNeeded})
          </p>
        )}
        {g.status === 'rep_pending' && !g.me.isRep && (g.me.approved ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-center font-semibold text-emerald-700">
            승인 완료 · 다른 피해자 대기 중 ({g.approvedCount}/{g.approvalNeeded})
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600"><b>{g.repAlias}</b>님이 대표를 신청했어요.</p>
            <button onClick={() => post('approve', { approved: true })} className={`${btn} bg-indigo-600 text-white`}>대표 승인하기</button>
            <button onClick={() => post('approve', { approved: false })} className={`${btn} bg-slate-100 text-slate-600`}>거절</button>
          </>
        ))}
        {g.status === 'rep_confirmed' && g.me.isRep && (
          <Link href={`/groups/${id}/bundle`} className={`${btn} bg-emerald-600 text-white`}>📦 증거 묶음 보기</Link>
        )}
        {g.status === 'rep_confirmed' && !g.me.isRep && (g.me.delegated ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-center font-semibold text-emerald-700">✓ 대표({g.repAlias})에게 증거 위임 완료</p>
        ) : (
          <Link href={`/groups/${id}/delegate`} className={`${btn} bg-indigo-600 text-white`}>증거 위임하기</Link>
        ))}
        <Link href={`/report/${g.me.caseId}/evidence`} className="block pt-2 text-center text-sm font-semibold text-slate-600 underline">
          내 증거 관리
        </Link>
      </section>
    </div>
  );
}
