'use client';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { ui } from '@/components/ui';

export default function DebugPage() {
  const [data, setData] = useState<unknown>(null);
  const [q, setQ] = useState('');
  useEffect(() => { fetch('/api/debug/db').then((r) => r.json()).then(setData); }, []);
  const text = useMemo(() => (data ? JSON.stringify(data, null, 2) : ''), [data]);
  const hits = useMemo(() => {
    if (!q.trim()) return [];
    return text.split('\n').filter((l) => l.includes(q.trim()));
  }, [q, text]);

  return (
    <div className="space-y-4">
      <PageHeader title="서버 저장소 뷰어" />
      <p className="text-sm text-muted">서버 메모리에 저장된 모든 데이터입니다. 사기범 단서는 해시값으로만 존재해요.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="예: 110123456789" className={ui.input} />
      {q.trim() && (
        <div className={`${ui.card} p-4 text-sm font-semibold ${hits.length ? 'text-red-700' : 'text-emerald-700'}`}>
          검색 결과 {hits.length}건
          {hits.slice(0, 20).map((h, i) => <div key={i} className="mt-1 break-all font-mono text-xs font-normal">{h.trim()}</div>)}
        </div>
      )}
      <pre className="max-h-[60vh] overflow-auto rounded-2xl bg-ink p-4 text-[11px] leading-relaxed text-white/90">{text || '불러오는 중…'}</pre>
    </div>
  );
}
