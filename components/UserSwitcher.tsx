'use client';
import { USERS, type UserId } from '@/lib/types';

export default function UserSwitcher({ current }: { current: UserId }) {
  return (
    <select
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
      value={current}
      onChange={(e) => {
        document.cookie = `demoUser=${e.target.value}; path=/; max-age=86400`;
        window.location.href = '/home';
      }}
    >
      {USERS.map((u) => <option key={u} value={u}>데모 유저 {u}</option>)}
    </select>
  );
}
