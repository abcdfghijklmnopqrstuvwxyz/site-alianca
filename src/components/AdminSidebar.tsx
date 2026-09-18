'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Radio, Tags, Star, Settings, Music,
  ShieldCheck, FileClock, LogOut,
} from 'lucide-react';

const ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/grupos', label: 'Grupos', icon: Users },
  { href: '/admin/canais', label: 'Canais', icon: Radio },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/admin/seguranca', label: 'Segurança', icon: ShieldCheck },
  { href: '/admin/logs', label: 'Logs de ações', icon: FileClock },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-1 rounded-xl border border-blood-dark/40 bg-ash/70 p-4 md:flex">
      <div className="mb-4 border-b border-blood-dark/40 pb-3">
        <p className="text-[10px] uppercase tracking-widest text-bone-muted/70">Dono da Aliança</p>
        <p className="truncate text-sm text-bone-muted">{email}</p>
      </div>

      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            pathname === href
              ? 'bg-blood-bright/90 text-white shadow-glow'
              : 'text-bone-muted hover:bg-blood-dark/30 hover:text-bone'
          }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bone-muted/70 transition hover:bg-blood-dark/30 hover:text-blood-bright"
      >
        <LogOut size={16} /> Sair
      </button>
    </aside>
  );
}
