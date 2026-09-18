import Link from 'next/link';
import { ShieldEllipsis } from 'lucide-react';

function Pentagram({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-blood-bright">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" opacity="0.85" />
      <path
        d="M50 8 L64 62 L16 28 L84 28 L36 62 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}

export default function Navbar({ allianceName }: { allianceName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-blood-dark/40 bg-void/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Pentagram />
          <span className="font-display text-lg tracking-[0.15em] text-bone">{allianceName}</span>
        </Link>

        <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-bone-muted md:flex">
          <Link href="/" className="text-ember transition hover:text-ember">Início</Link>
          <Link href="/grupos" className="transition hover:text-ember">Grupos</Link>
          <Link href="/canais" className="transition hover:text-ember">Canais</Link>
          <Link href="/sobre" className="transition hover:text-ember">Sobre</Link>
        </div>

        <Link
          href="/admin/login"
          className="flex items-center text-bone-muted/40 transition hover:text-blood-bright"
          title="Acesso administrativo"
        >
          <ShieldEllipsis size={18} />
        </Link>
      </nav>
    </header>
  );
}
