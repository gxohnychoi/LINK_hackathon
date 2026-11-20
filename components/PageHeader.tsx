'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

/** 왼쪽 뒤로가기 + 제목, 아래 1px 구분선 */
export default function PageHeader({ title }: { title?: string }) {
  const router = useRouter();
  return (
    <div className="-mx-5 flex items-center gap-1 border-b border-line px-3 pb-3">
      <button type="button" aria-label="뒤로가기" className="p-2 text-ink"
        onClick={() => (window.history.length > 1 ? router.back() : router.push('/home'))}>
        <ChevronLeft className="h-6 w-6" />
      </button>
      {title && <h1 className="text-xl font-bold">{title}</h1>}
    </div>
  );
}
