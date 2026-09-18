import CommunityManager from '@/components/CommunityManager';

export default function AdminGruposPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Grupos</h1>
      <CommunityManager type="GROUP" apiPath="/api/admin/grupos" />
    </div>
  );
}
