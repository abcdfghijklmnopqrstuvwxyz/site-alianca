import HeroBeast from '@/components/HeroBeast';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import Particles from '@/components/Particles';
import CommunityCard from '@/components/CommunityCard';
import AllianceStats from '@/components/AllianceStats';
import { prisma } from '@/lib/db';

async function getData() {
  const [settings, featured, recent, totalGroups, totalChannels, totalVip] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 'main' } }),
    prisma.community.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      orderBy: { order: 'asc' },
      take: 4,
    }),
    prisma.community.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.community.count({ where: { type: 'GROUP', active: true } }),
    prisma.community.count({ where: { type: 'CHANNEL', active: true } }),
    prisma.community.count({ where: { vip: true, active: true } }),
  ]).catch(() => [null, [], [], 0, 0, 0] as const);

  return {
    allianceName: settings?.allianceName ?? 'INFERNUM',
    description: settings?.description ?? 'Onde as comunidades se encontram.',
    featured,
    recent,
    totalGroups,
    totalChannels,
    totalVip,
  };
}

export default async function HomePage() {
  const { allianceName, description, featured, recent, totalGroups, totalChannels, totalVip } = await getData();

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <Particles />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,0,0,0.3),transparent_62%)]" />

        <div className="relative z-10 animate-fadeIn">
          <h1 className="animate-flicker font-display text-6xl font-bold uppercase tracking-wide text-bone text-glow sm:text-8xl">
            {allianceName}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.35em] text-bone-muted sm:text-sm">
            {description}
          </p>

          <Link
            href="/grupos"
            className="mt-10 inline-flex items-center gap-2 rounded border border-blood-bright/80 px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-bone-muted transition hover:bg-blood-bright/10 hover:text-ember hover:shadow-glow"
          >
            <Flame size={14} className="text-blood-bright" />
            Entrar na Aliança
          </Link>
        </div>
      </section>

      {/* ESTATÍSTICAS */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <AllianceStats groups={totalGroups} channels={totalChannels} vip={totalVip} />
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl uppercase tracking-widest text-bone text-glow">
            Destaques da Aliança
          </h2>
          <p className="mt-2 rune-divider text-xs uppercase tracking-[0.3em] text-gold-dim">
            As comunidades escolhidas pelo conselho
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-sm text-bone-muted/60">Nenhum destaque definido ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>

      {/* EXPLORAR */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase tracking-widest text-bone">
            Explorar Comunidades
          </h2>
          <div className="hidden gap-4 text-xs uppercase tracking-widest text-bone-muted sm:flex">
            <Link href="/grupos" className="hover:text-ember">Ver grupos</Link>
            <Link href="/canais" className="hover:text-ember">Ver canais</Link>
          </div>
        </div>

        {recent.length === 0 ? (
          <p className="text-center text-bone-muted/60">
            Nenhuma comunidade cadastrada ainda. Acesse o painel administrativo para começar.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
