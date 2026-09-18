import CommunityManager from '@/components/CommunityManager';

export default function AdminCanaisPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Canais</h1>
      <CommunityManager type="CHANNEL" apiPath="/api/admin/canais" />
    </div>
  );
}
