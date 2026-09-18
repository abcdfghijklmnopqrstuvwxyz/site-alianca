import { redirect } from 'next/navigation';
import { getSessionAdmin } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();

  // Página de login fica fora deste guard (ver src/app/admin/login/page.tsx, que não usa este layout de conteúdo protegido).
  // Aqui tratamos qualquer outra rota /admin/* como exigindo sessão válida (dupla checagem além do middleware).
  if (!admin) redirect('/admin/login');

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <AdminSidebar email={admin.email} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
