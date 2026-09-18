import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import CommunityCard from '@/components/CommunityCard';
import SearchFilterBar from '@/components/SearchFilterBar';

export const metadata = { title: 'Canais' };

async function getChannels(q: string, filter: string) {
  return prisma.community.findMany({
    where: {
      type: 'CHANNEL',
      active: true,
      ...(filter === 'vip' ? { vip: true } : filter === 'normal' ? { vip: false } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: [{ vip: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  });
}

export default async function CanaisPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string };
}) {
  const q = searchParams.q ?? '';
  const filter = searchParams.filter ?? '';
  const channels = await getChannels(q, filter).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-3xl uppercase tracking-widest text-blood-bright text-glow">Canais</h1>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      {channels.length === 0 ? (
        <p className="text-bone-muted/70">Nenhum canal encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}
    </div>
  );
}
