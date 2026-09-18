function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-lg border border-blood-dark/50 bg-ash/70 px-8 py-6 text-center">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-bone-muted">{label}</p>
      <p className="font-display text-3xl font-bold text-blood-bright text-glow">{value}</p>
    </div>
  );
}

export default function AllianceStats({
  groups,
  channels,
  vip,
}: {
  groups: number;
  channels: number;
  vip: number;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row">
      <StatBox label="Grupos" value={groups} />
      <StatBox label="Canais" value={channels} />
      <StatBox label="VIP" value={vip} />
    </div>
  );
}
