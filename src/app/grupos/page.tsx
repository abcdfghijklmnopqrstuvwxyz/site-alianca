import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import CommunityCard from '@/components/CommunityCard';
import SearchFilterBar from '@/components/SearchFilterBar';

export const metadata = { title: 'Grupos' };

async function getGroups(q: string, filter: string) {
  return prisma.community.findMany({
    where: {
      type: 'GROUP',
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

export default async function GruposPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string };
}) {
  const q = searchParams.q ?? '';
  const filter = searchParams.filter ?? '';
  const groups = await getGroups(q, filter).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-3xl uppercase tracking-widest text-blood-bright text-glow">Grupos</h1>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      {groups.length === 0 ? (
        <p className="text-bone-muted/70">Nenhum grupo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <CommunityCard key={g.id} community={g} />
          ))}
        </div>
      )}
    </div>
  );
}
