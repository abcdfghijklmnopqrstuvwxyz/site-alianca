'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

const defaults = {
  allianceName: 'INFERNUM',
  logo: '',
  favicon: '',
  banner: '',
  description: 'Onde as comunidades se encontram.',
  primaryColor: '#c40000',
  secondaryColor: '#3d0000',
  background: '',
  particlesOn: true,
  musicUrl: '',
  musicEnabled: false,
  musicVolume: 0.4,
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
};

export default function AdminConfiguracoesPage() {
  const [form, setForm] = useState({ ...defaults });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            ...defaults,
            ...data,
            logo: data.logo ?? '',
            favicon: data.favicon ?? '',
            banner: data.banner ?? '',
            background: data.background ?? '',
            musicUrl: data.musicUrl ?? '',
            seoTitle: data.seoTitle ?? '',
            seoDescription: data.seoDescription ?? '',
            seoImage: data.seoImage ?? '',
          });
        }
      })
      .catch(() => null);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/admin/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        logo: form.logo || null,
        favicon: form.favicon || null,
        banner: form.banner || null,
        background: form.background || null,
        musicUrl: form.musicUrl || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoImage: form.seoImage || null,
      }),
    });
    setMsg(res.ok ? 'Configurações salvas com sucesso.' : 'Erro ao salvar. Verifique os campos.');
    setSaving(false);
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Configurações</h1>

      <form onSubmit={save} className="max-w-2xl space-y-6">
        <fieldset className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <legend className="px-2 text-sm uppercase text-bone-muted">Identidade</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder="Nome da Aliança" value={form.allianceName} onChange={(e) => setForm({ ...form, allianceName: e.target.value })} className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
            <input placeholder="URL do logo" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
            <input placeholder="URL do favicon" value={form.favicon} onChange={(e) => setForm({ ...form, favicon: e.target.value })} className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
            <input placeholder="URL do banner" value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
          </div>
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" rows={2} />
        </fieldset>

        <fieldset className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <legend className="px-2 text-sm uppercase text-bone-muted">Aparência</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="text-xs text-bone-muted/70">Cor principal
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="mt-1 h-9 w-full rounded" />
            </label>
            <label className="text-xs text-bone-muted/70">Cor secundária
              <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="mt-1 h-9 w-full rounded" />
            </label>
          </div>
          <input placeholder="URL do background" value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} className="mt-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
          <label className="mt-3 flex items-center gap-2 text-xs text-bone-muted">
            <input type="checkbox" checked={form.particlesOn} onChange={(e) => setForm({ ...form, particlesOn: e.target.checked })} /> Ativar partículas
          </label>
        </fieldset>

        <fieldset className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <legend className="px-2 text-sm uppercase text-bone-muted">Música</legend>
          <input placeholder="URL da música" value={form.musicUrl} onChange={(e) => setForm({ ...form, musicUrl: e.target.value })} className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-bone-muted">
              <input type="checkbox" checked={form.musicEnabled} onChange={(e) => setForm({ ...form, musicEnabled: e.target.checked })} /> Ativar música
            </label>
            <label className="flex items-center gap-2 text-xs text-bone-muted">
              Volume
              <input type="range" min={0} max={1} step={0.05} value={form.musicVolume} onChange={(e) => setForm({ ...form, musicVolume: Number(e.target.value) })} />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
          <legend className="px-2 text-sm uppercase text-bone-muted">SEO</legend>
          <input placeholder="Título" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="mb-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
          <textarea placeholder="Descrição" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="mb-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" rows={2} />
          <input placeholder="Imagem de compartilhamento (URL)" value={form.seoImage} onChange={(e) => setForm({ ...form, seoImage: e.target.value })} className="w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright" />
        </fieldset>

        {msg && <p className="text-xs text-bone-muted">{msg}</p>}

        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg border border-blood-bright bg-blood-bright/90 px-6 py-2.5 text-sm font-bold uppercase text-white shadow-glow hover:bg-blood-bright disabled:opacity-60">
          <Save size={14} /> {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  );
}
