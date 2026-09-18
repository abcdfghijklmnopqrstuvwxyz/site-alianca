'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldEllipsis } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [requires2fa, setRequires2fa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, twoFaCode: twoFaCode || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requires2fa) {
          setRequires2fa(true);
          setError('Digite o código do seu aplicativo autenticador.');
        } else {
          setError(data.error ?? 'Credenciais inválidas.');
        }
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-blood-dark/50 bg-ash/90 p-8 shadow-glow"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <ShieldEllipsis size={32} className="text-blood-bright" />
          <h1 className="font-display text-xl uppercase tracking-widest text-blood-bright text-glow">
            Painel do Dono
          </h1>
          <p className="text-xs text-bone-muted/70">Acesso restrito e monitorado.</p>
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-bone-muted">E-mail</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-bone outline-none focus:border-blood-bright"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-bone-muted">Senha</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-bone outline-none focus:border-blood-bright"
          />
        </label>

        {requires2fa && (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-bone-muted">Código do autenticador</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value)}
              className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 tracking-[0.3em] text-bone outline-none focus:border-blood-bright"
            />
          </label>
        )}

        {error && <p className="mb-3 text-xs text-blood-bright">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blood-bright bg-blood-bright/90 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-blood-bright disabled:opacity-60"
        >
          <Lock size={14} /> {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
