import Link from 'next/link';
import Image from 'next/image';
import { Crown, Users, Flame } from 'lucide-react';

export interface CommunityCardData {
  slug: string;
  type: 'GROUP' | 'CHANNEL';
  name: string;
  description: string;
  image: string | null;
  vip: boolean;
  featured?: boolean;
  clicks: number;
  category?: { name: string; icon: string } | null;
}

export default function CommunityCard({ community }: { community: CommunityCardData }) {
  const href = community.type === 'GROUP' ? `/grupo/${community.slug}` : `/canal/${community.slug}`;

  return (
    <Link
      href={href}
      className={`card-hover group relative flex flex-col overflow-hidden rounded-xl border bg-ash/80 ${
        community.vip ? 'border-blood-bright/70 shadow-glow' : 'border-blood-dark/40'
      }`}
    >
      {community.vip && (
        <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-blood-bright/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow">
          <Crown size={12} /> VIP
        </span>
      )}

      <div className="relative aspect-video w-full bg-gradient-to-br from-blood-dark/40 to-void">
        {community.image ? (
          <Image src={community.image} alt={community.name} fill className="object-cover opacity-90 transition group-hover:opacity-100" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-blood-dark/70">
            <Flame size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-bone group-hover:text-blood-bright">
          {community.category?.icon ?? '🔥'} {community.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-bone-muted">{community.description}</p>

        <div className="mt-2 flex items-center justify-between text-xs text-bone-muted/60">
          <span className="flex items-center gap-1">
            <Users size={12} /> {community.clicks.toLocaleString('pt-BR')} acessos
          </span>
          <span className="rounded border border-blood-bright/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blood-bright transition group-hover:bg-blood-bright/10 group-hover:shadow-glow">
            {community.type === 'GROUP' ? 'Entrar' : 'Acessar'}
          </span>
        </div>
      </div>
    </Link>
  );
}
