'use client';
import { use, useEffect, useState } from 'react';
import SealBadge from '@/components/SealBadge';
import { dataUrlToBytes, sha256Hex } from '@/lib/clue';
import { won, kDate } from '@/lib/format';
import { CLUE_LABEL, EVIDENCE_LABEL, type ClueType, type EvidenceKind } from '@/lib/types';

type Ev = { id: string; kind: EvidenceKind; fileName: string; dataUrl: string; sha256: string; sealedAt: string };
type Bundle = {
  summary: {
    delegatedCount: number; groupSize: number; totalAmount: number;
    sharedClues: Partial<Record<ClueType, number>>;
    timeline: { alias: string; name: string; sentAt: string; platform: string; itemName: string }[];
  };
  victims: { alias: string; name: string; isRep: boolean; evidence: Ev[] }[];
};

export default function BundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [b, setB] = useState<Bundle | null>(null);
  const [err, setErr] = useState('');
  const [check, setCheck] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/groups/${id}/bundle`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) { setErr(j.error); return; }
      setB(j);
      // 봉인 확인: 받은 파일의 SHA-256을 다시 계산해 봉인 해시와 비교
      const res: Record<string, boolean> = {};
      for (const v of j.victims as Bundle['victims']) {
        for (const e of v.evidence) res[e.id] = (await sha256Hex(dataUrlToBytes(e.dataUrl))) === e.sha256;
      }
      setCheck(res);
    });
  }, [id]);

  if (err) return <p className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">🚫 {err}</p>;
  if (!b) return <p className="text-slate-400">불러오는 중…</p>;
  const s = b.summary;
  const allEv = b.victims.flatMap((v) => v.evidence);
  const okCount = allEv.filter((e) => check[e.id]).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
        <p className="text-sm text-slate-300">📦 사건 요약 · 대표 전용</p>
        <p className="mt-2 text-4xl font-black">{won(s.totalAmount)}</p>
        <p className="mt-1 text-sm text-slate-300">위임 피해자 {s.delegatedCount}명 (전체 {s.groupSize}명) 합산 피해액</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.entries(s.sharedClues) as [ClueType, number][]).map(([t, n]) => (
            <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">겹친 {CLUE_LABEL[t]} {n}개</span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bold">피해 타임라인</h2>
        <ol className="space-y-3 border-l-2 border-indigo-200 pl-4">
          {s.timeline.map((t) => (
            <li key={t.alias} className="relative">
              <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-indigo-500" />
              <p className="text-xs text-slate-500">{kDate(t.sentAt)} · {t.platform}</p>
              <p className="font-semibold">{t.alias} ({t.name}) · {t.itemName}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">증거 목록</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${okCount === allEv.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
            봉인 확인 {okCount}/{allEv.length}
          </span>
        </div>
        {b.victims.map((v) => (
          <div key={v.alias} className="space-y-2 rounded-2xl border border-slate-200 p-3">
            <p className="font-semibold">{v.alias} · {v.name} {v.isRep && <span className="text-xs text-indigo-600">⭐ 대표</span>}</p>
            {v.evidence.length === 0 && <p className="text-sm text-slate-400">증거 없음</p>}
            {v.evidence.map((e) => (
              <div key={e.id} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.dataUrl} alt={e.fileName} className="h-20 w-24 shrink-0 rounded-lg border bg-slate-50 object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold">{EVIDENCE_LABEL[e.kind]}</p>
                  <SealBadge sealedAt={e.sealedAt} />
                  <p className="truncate font-mono text-[10px] text-slate-400">{e.sha256}</p>
                  {e.id in check ? (
                    check[e.id]
                      ? <p className="text-sm font-bold text-emerald-600">변경 없음 ✓</p>
                      : <p className="text-sm font-bold text-red-600">변경됨 ⚠</p>
                  ) : <p className="text-sm text-slate-400">확인 중…</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        👮 경찰서 방문 시 이 묶음을 제출하세요. 여러 피해를 한 사건으로 병합해 접수할 수 있어요.
      </p>
    </div>
  );
}
