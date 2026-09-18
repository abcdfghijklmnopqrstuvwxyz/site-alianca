'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldOff, QrCode } from 'lucide-react';

export default function AdminSegurancaPage() {
  const [step, setStep] = useState<'idle' | 'setup' | 'done'>('idle');
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function startSetup() {
    setError(null);
    const res = await fetch('/api/admin/2fa');
    if (!res.ok) {
      setError('Não foi possível iniciar a configuração.');
      return;
    }
    const data = await res.json();
    setQr(data.qr);
    setSecret(data.secret);
    setStep('setup');
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, token }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Código inválido.');
      return;
    }
    setRecoveryCodes(data.recoveryCodes);
    setStep('done');
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/2fa', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Não foi possível desativar.');
      return;
    }
    setStep('idle');
    setDisablePassword('');
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Segurança</h1>

      {step === 'idle' && (
        <div className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <p className="mb-4 text-sm text-bone-muted">
            Ative a autenticação em dois fatores (2FA) para adicionar uma camada extra de proteção ao painel.
          </p>
          <button onClick={startSetup} className="flex items-center gap-2 rounded-lg border border-blood-bright bg-blood-bright/90 px-5 py-2 text-xs font-bold uppercase text-white shadow-glow hover:bg-blood-bright">
            <ShieldCheck size={14} /> Ativar 2FA
          </button>

          <form onSubmit={disable} className="mt-8 border-t border-blood-dark/40 pt-4">
            <p className="mb-2 text-xs text-bone-muted/70">Já tem 2FA ativo e quer desativar? Confirme com sua senha:</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Senha atual"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="flex-1 rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
              />
              <button type="submit" className="flex items-center gap-1 rounded-lg border border-blood-dark/50 px-3 py-2 text-xs uppercase text-bone-muted hover:border-blood-bright">
                <ShieldOff size={14} /> Desativar
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'setup' && qr && (
        <form onSubmit={confirmSetup} className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <p className="mb-3 flex items-center gap-2 text-sm text-bone-muted">
            <QrCode size={16} /> Escaneie o QR code no Google Authenticator, Microsoft Authenticator ou Authy:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code 2FA" className="mx-auto mb-4 h-48 w-48 rounded-lg border border-blood-dark/40" />
          <input
            placeholder="Código de 6 dígitos"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-center tracking-[0.3em] text-sm outline-none focus:border-blood-bright"
          />
          <button type="submit" className="mt-4 w-full rounded-lg border border-blood-bright bg-blood-bright/90 py-2 text-xs font-bold uppercase text-white shadow-glow hover:bg-blood-bright">
            Confirmar ativação
          </button>
        </form>
      )}

      {step === 'done' && recoveryCodes && (
        <div className="rounded-xl border border-blood-bright/60 bg-ash/70 p-5">
          <p className="mb-3 text-sm text-bone-muted">
            2FA ativado! Guarde estes códigos de recuperação em um lugar seguro — eles não serão mostrados novamente:
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs text-blood-bright">
            {recoveryCodes.map((c) => (
              <span key={c} className="rounded bg-void/80 px-2 py-1">{c}</span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-xs text-blood-bright">{error}</p>}
    </div>
  );
}
