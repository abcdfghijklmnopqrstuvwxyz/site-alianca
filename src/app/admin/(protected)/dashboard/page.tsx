import { prisma } from '@/lib/db';
import { Users, Radio, Crown, Activity, MousePointerClick } from 'lucide-react';

async function getStats() {
  const [totalGroups, totalChannels, vipGroups, vipChannels, activeCommunities, totalClicks, topGroup, topChannel, clicksLast7d] =
    await Promise.all([
      prisma.community.count({ where: { type: 'GROUP' } }),
      prisma.community.count({ where: { type: 'CHANNEL' } }),
      prisma.community.count({ where: { type: 'GROUP', vip: true } }),
      prisma.community.count({ where: { type: 'CHANNEL', vip: true } }),
      prisma.community.count({ where: { active: true } }),
      prisma.community.aggregate({ _sum: { clicks: true } }),
      prisma.community.findFirst({ where: { type: 'GROUP' }, orderBy: { clicks: 'desc' } }),
      prisma.community.findFirst({ where: { type: 'CHANNEL' }, orderBy: { clicks: 'desc' } }),
      prisma.community.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

  return {
    totalGroups,
    totalChannels,
    vipGroups,
    vipChannels,
    activeCommunities,
    totalClicks: totalClicks._sum.clicks ?? 0,
    topGroup,
    topChannel,
    recentAdded: clicksLast7d,
  };
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
      <div className="mb-2 flex items-center gap-2 text-bone-muted">
        <Icon size={16} className="text-blood-bright" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold text-bone">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Total de grupos" value={stats.totalGroups} />
        <StatCard icon={Radio} label="Total de canais" value={stats.totalChannels} />
        <StatCard icon={Crown} label="Grupos VIP" value={stats.vipGroups} />
        <StatCard icon={Crown} label="Canais VIP" value={stats.vipChannels} />
        <StatCard icon={Activity} label="Comunidades ativas" value={stats.activeCommunities} />
        <StatCard icon={MousePointerClick} label="Total de cliques" value={stats.totalClicks.toLocaleString('pt-BR')} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-bone-muted/70">Grupo mais acessado</p>
          <p className="text-bone">
            {stats.topGroup ? `🔥 ${stats.topGroup.name} — ${stats.topGroup.clicks.toLocaleString('pt-BR')} cliques` : 'Nenhum grupo ainda'}
          </p>
        </div>
        <div className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <p className="mb-1 text-xs uppercase tracking-wide text-bone-muted/70">Canal mais acessado</p>
          <p className="text-bone">
            {stats.topChannel ? `📢 ${stats.topChannel.name} — ${stats.topChannel.clicks.toLocaleString('pt-BR')} cliques` : 'Nenhum canal ainda'}
          </p>
        </div>
      </div>
    </div>
  );
}
