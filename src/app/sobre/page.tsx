import { prisma } from '@/lib/db';

export const metadata = { title: 'Sobre' };

export default async function SobrePage() {
  const settings = await prisma.settings.findUnique({ where: { id: 'main' } }).catch(() => null);
  const allianceName = settings?.allianceName ?? 'INFERNUM';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="mb-4 font-display text-3xl uppercase tracking-widest text-blood-bright text-glow">
        Sobre {allianceName}
      </h1>
      <p className="text-bone-muted">
        {settings?.description ?? 'Central oficial de grupos e canais da Aliança.'}
      </p>
      <p className="mt-6 text-sm text-bone-muted/70">
        Este texto pode ser editado futuramente pelo painel administrativo, na área de Configurações.
      </p>
    </div>
  );
}
