import { prisma } from '@/lib/db';

const EVENT_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: 'Login realizado',
  LOGIN_FAILED: 'Login falhou',
  LOGOUT: 'Logout',
  PASSWORD_CHANGED: 'Senha alterada',
  TWOFA_ENABLED: '2FA ativado',
  TWOFA_DISABLED: '2FA desativado',
  COMMUNITY_CREATED: 'Comunidade criada',
  COMMUNITY_UPDATED: 'Comunidade atualizada',
  COMMUNITY_DELETED: 'Comunidade excluída',
  VIP_CHANGED: 'VIP alterado',
  SETTINGS_UPDATED: 'Configurações alteradas',
  UPLOAD: 'Upload realizado',
  BLOCKED_ATTEMPT: 'Tentativa bloqueada',
};

export default async function AdminLogsPage() {
  // Logs são apenas leitura no painel — nunca exibimos senha, token, código 2FA ou cookies (item 47).
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { admin: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Logs de ações</h1>

      <div className="overflow-x-auto rounded-xl border border-blood-dark/40 bg-ash/70">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-blood-dark/40 text-xs uppercase text-bone-muted/70">
            <tr>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Resultado</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-blood-dark/20 text-bone-muted">
                <td className="px-4 py-2">{EVENT_LABELS[log.event] ?? log.event}</td>
                <td className="px-4 py-2 text-bone-muted/70">{log.admin?.email ?? '—'}</td>
                <td className="px-4 py-2 text-bone-muted/70">{log.ip ?? '—'}</td>
                <td className="px-4 py-2 text-bone-muted/70">{log.result}</td>
                <td className="px-4 py-2 text-bone-muted/70">{log.createdAt.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-bone-muted/70">Nenhum evento registrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
