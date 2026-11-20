export function won(n: number) {
  if (n >= 10000 && n % 10000 === 0) return `${(n / 10000).toLocaleString('ko-KR')}만 원`;
  return `${n.toLocaleString('ko-KR')}원`;
}
export function kDate(iso: string) {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00+09:00` : iso);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}
export function kDateTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' });
}
