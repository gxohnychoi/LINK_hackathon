'use client';
import { use, useEffect, useState } from 'react';
import { Ban, FlaskConical, Lock, Package, ShieldAlert, ShieldCheck, Siren, Star } from 'lucide-react';
import SealBadge from '@/components/SealBadge';
import { checkSeal, canShowTotal } from '@/lib/crypto';
import { won, kDate } from '@/lib/format';
import { CLUE_LABEL, EVIDENCE_LABEL, type ClueType, type EvidenceKind } from '@/lib/types';

type Ev = { id: string; kind: EvidenceKind; fileName: string; dataUrl: string; sha256: string; sealedAt: string };
type Bundle = {
  summary: {
    delegatedCount: number; groupSize: number; totalAmount: number | null;
    sharedClues: Partial<Record<ClueType, number>>;
    timeline: { alias: string; name: string; sentAt: string; platform: string; itemName: string }[];
  };
  victims: { alias: string; name: string; isRep: boolean; evidence: Ev[] }[];
};

const toBlob = (dataUrl: string) => fetch(dataUrl).then((r) => r.blob());

export default function BundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [b, setB] = useState<Bundle | null>(null);
  const [err, setErr] = useState('');
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [tamper, setTamper] = useState<Record<string, boolean>>({});

  // 변조 테스트: 증거 사본의 1바이트를 바꾼 뒤 봉인 확인 (원본은 그대로)
  async function tamperTest(e: Ev) {
    const bytes = new Uint8Array(await (await toBlob(e.dataUrl)).arrayBuffer());
    const copy = bytes.slice();
    copy[Math.floor(copy.length / 2)] ^= 0xff;
    const ok = await checkSeal(new Blob([copy]), e.sha256);
    setTamper((t) => ({ ...t, [e.id]: ok }));
  }

  useEffect(() => {
    fetch(`/api/groups/${id}/bundle`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) { setErr(j.error); return; }
      setB(j);
      // 봉인 확인: 받은 파일의 SHA-256을 다시 계산해 봉인 해시와 비교
      const res: Record<string, boolean> = {};
      for (const v of j.victims as Bundle['victims']) {
        for (const e of v.evidence) res[e.id] = await checkSeal(await toBlob(e.dataUrl), e.sha256);
      }
      setCheck(res);
    });
  }, [id]);

  if (err) return <p className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 font-semibold text-red-700"><Ban className="h-5 w-5 shrink-0" /> {err}</p>;
  if (!b) return <p className="text-neutral-400">불러오는 중…</p>;
  const s = b.summary;
  const allEv = b.victims.flatMap((v) => v.evidence);
  const okCount = allEv.filter((e) => check[e.id]).length;

  return (
    <div className="space-y-8">
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        ⚠️ 이 앱은 착수금이나 수수료를 절대 요구하지 않습니다. 돈을 요구하는 대표·업체는 2차 사기예요.
      </p>
      <section className="rounded-[28px] bg-ink p-6 text-white">
        <p className="flex items-center gap-1.5 text-sm text-neutral-400"><Package className="h-4 w-4" /> 사건 요약 · 대표 전용</p>
        {canShowTotal(s.delegatedCount) && s.totalAmount !== null ? (
          <p className="mt-3 text-[40px] font-black leading-tight tracking-tight text-gold">{won(s.totalAmount)}</p>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-2xl font-black text-gold"><Lock className="h-6 w-6 shrink-0" /> 3명 이상 모이면 공개돼요</p>
        )}
        <p className="mt-4 text-sm text-neutral-400">위임 피해자 {s.delegatedCount}명 (전체 {s.groupSize}명) 합산 피해액</p>
      </section>

      {Object.keys(s.sharedClues).length > 0 && (
        <div className="-mt-3 flex flex-wrap gap-3">
          {(Object.entries(s.sharedClues) as [ClueType, number][]).map(([t, n]) => (
            <span key={t} className="rounded-xl bg-chip px-4 py-2 text-sm font-bold text-chip-ink">겹친 {CLUE_LABEL[t]} {n}개</span>
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-5 text-xl font-black">피해 타임라인</h2>
        <ol className="ml-2 space-y-7 border-l-2 border-neutral-200 pl-6">
          {s.timeline.map((t) => (
            <li key={t.alias} className="relative flex gap-4">
              <span className="absolute -left-[34px] top-0.5 h-4 w-4 rounded-full bg-gold" />
              <span className="w-14 shrink-0 text-sm text-neutral-400">{kDate(t.sentAt)}</span>
              <div className="min-w-0">
                <p className="font-bold">{t.alias} ({t.name})</p>
                <p className="text-sm text-neutral-500">{t.platform} · {t.itemName}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">증거 목록</h2>
          <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${okCount === allEv.length ? 'bg-chip text-chip-ink' : 'bg-red-100 text-red-700'}`}>
            봉인 확인 {okCount}/{allEv.length}
          </span>
        </div>
        {b.victims.map((v) => (
          <div key={v.alias} className="space-y-4 rounded-3xl bg-sand p-5">
            <p className="flex items-center gap-1.5 font-bold">
              {v.alias} · {v.name}
              {v.isRep && <span className="flex items-center gap-0.5 text-xs text-gold-deep"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> 대표</span>}
            </p>
            {v.evidence.length === 0 && <p className="text-sm text-neutral-400">증거 없음</p>}
            {v.evidence.map((e) => (
              <div key={e.id} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.dataUrl} alt={e.fileName} className="h-20 w-24 shrink-0 rounded-xl bg-white object-cover" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-bold">{EVIDENCE_LABEL[e.kind]}</p>
                  <SealBadge sealedAt={e.sealedAt} />
                  <p className="truncate font-mono text-[10px] text-neutral-400">{e.sha256}</p>
                  {e.id in check ? (
                    check[e.id]
                      ? <p className="flex items-center gap-1 text-sm font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> 변경 없음 ✓</p>
                      : <p className="flex items-center gap-1 text-sm font-bold text-red-600"><ShieldAlert className="h-4 w-4" /> 변경됨 ⚠</p>
                  ) : <p className="text-sm text-neutral-400">확인 중…</p>}
                  {e.id in tamper ? (
                    <p className="text-xs font-bold text-red-600">
                      변조 사본(1바이트 수정): {tamper[e.id] ? '변경 없음 ✓' : '변경됨 ⚠'}
                    </p>
                  ) : (
                    <button onClick={() => tamperTest(e)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-0.5 text-xs font-semibold text-red-600">
                      <FlaskConical className="h-3.5 w-3.5" /> 변조 테스트
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      <p className="flex items-start gap-3 rounded-3xl bg-ink p-5 text-sm font-semibold text-gold">
        <Siren className="h-5 w-5 shrink-0" /> 경찰서 방문 시 이 묶음을 제출하세요. 여러 피해를 한 사건으로 병합해 접수할 수 있어요.
      </p>
    </div>
  );
}
