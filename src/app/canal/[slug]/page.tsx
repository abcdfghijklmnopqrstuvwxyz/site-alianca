import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Crown, Users, Flame } from 'lucide-react';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const group = await prisma.community.findUnique({ where: { slug: params.slug } });
  if (!group) return {};
  return { title: group.name, description: group.description };
}

export default async function CanalPage({ params }: { params: { slug: string } }) {
  const group = await prisma.community.findFirst({
    where: { slug: params.slug, type: 'CHANNEL', active: true },
    include: { category: true },
  });

  if (!group) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-blood-dark/50 bg-ash/80 shadow-glow">
        <div className="relative aspect-video w-full bg-gradient-to-br from-blood-dark/40 to-black">
          {group.image ? (
            <Image src={group.image} alt={group.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-blood-dark/70">
              <Flame size={64} />
            </div>
          )}
          {group.vip && (
            <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-blood-bright/90 px-3 py-1 text-xs font-bold uppercase text-white shadow-glow">
              <Crown size={14} /> VIP
            </span>
          )}
        </div>

        <div className="p-8 text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-bone-muted/70">
            {group.category?.icon} {group.category?.name ?? 'Geral'}
          </p>
          <h1 className="font-display text-3xl font-bold text-blood-bright text-glow">{group.name}</h1>
          <p className="mx-auto mt-4 max-w-xl text-bone-muted">{group.description}</p>

          <p className="mt-4 flex items-center justify-center gap-1 text-xs text-bone-muted/70">
            <Users size={12} /> {group.clicks.toLocaleString('pt-BR')} acessos
          </p>

          <a
            href={`/api/click/canal/${group.slug}`}
            className="mt-8 inline-block rounded border border-blood-bright/80 px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-bone-muted transition hover:bg-blood-bright/10 hover:text-ember hover:shadow-glow-lg"
          >
            🔥 Acessar o canal
          </a>
        </div>
      </div>
    </div>
  );
}
