'use client';

import { useEffect, useState } from 'react';
import { Crown, Star, Trash2, Eye, EyeOff, Link as LinkIcon, Save } from 'lucide-react';

type CommunityType = 'GROUP' | 'CHANNEL';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  image: string | null;
  link: string;
  vip: boolean;
  featured: boolean;
  active: boolean;
  order: number;
  clicks: number;
  categoryId: string | null;
  category?: Category | null;
}

const emptyForm = {
  link: '',
  name: '',
  description: '',
  image: '',
  categoryId: '',
  vip: false,
  featured: false,
  active: true,
  order: 0,
};

export default function CommunityManager({ type, apiPath }: { type: CommunityType; apiPath: string }) {
  const [items, setItems] = useState<Community[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [identifying, setIdentifying] = useState(false);
  const [identifyMsg, setIdentifyMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [itemsRes, catsRes] = await Promise.all([fetch(apiPath), fetch('/api/admin/categorias')]);
    if (itemsRes.ok) setItems(await itemsRes.json());
    if (catsRes.ok) setCategories(await catsRes.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function identify() {
    if (!form.link) return;
    setIdentifying(true);
    setIdentifyMsg(null);
    try {
      const res = await fetch('/api/admin/identificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.link }),
      });
      const data = await res.json();
      if (data.identified) {
        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          description: data.description ?? f.description,
          image: data.image ?? f.image,
        }));
        setIdentifyMsg('Informações identificadas automaticamente. Revise antes de salvar.');
      } else {
        setIdentifyMsg(data.message ?? 'Não foi possível identificar automaticamente. Preencha manualmente.');
      }
    } catch {
      setIdentifyMsg('Erro ao identificar o link. Preencha manualmente.');
    } finally {
      setIdentifying(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
          image: form.image || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Não foi possível salvar. Verifique os campos.');
        return;
      }
      setForm({ ...emptyForm });
      setIdentifyMsg(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, field: 'vip' | 'featured' | 'active', current: boolean) {
    await fetch(`${apiPath}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !current }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta comunidade? Essa ação não pode ser desfeita.')) return;
    await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="rounded-xl border border-blood-dark/40 bg-ash/70 p-5">
        <h2 className="mb-4 font-display text-lg text-blood-bright">
          Adicionar {type === 'GROUP' ? 'grupo' : 'canal'}
        </h2>

        <div className="mb-3 flex gap-2">
          <input
            placeholder={`https://chat.whatsapp.com/...`}
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="flex-1 rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
          />
          <button
            type="button"
            onClick={identify}
            disabled={identifying || !form.link}
            className="flex items-center gap-1 rounded-lg border border-blood-dark/50 px-3 py-2 text-xs uppercase text-bone-muted transition hover:border-blood-bright disabled:opacity-50"
          >
            <LinkIcon size={14} /> {identifying ? 'Identificando...' : 'Identificar'}
          </button>
        </div>
        {identifyMsg && <p className="mb-3 text-xs text-bone-muted">{identifyMsg}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="Descrição"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
          rows={2}
        />

        <input
          placeholder="URL da imagem (opcional)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="mt-3 w-full rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
        />

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-bone-muted">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} /> VIP
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destaque
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-blood-bright">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-lg border border-blood-bright bg-blood-bright/90 px-5 py-2 text-xs font-bold uppercase text-white shadow-glow transition hover:bg-blood-bright disabled:opacity-60"
        >
          <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-blood-dark/40 bg-ash/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-bone">
                {item.name} {item.vip && <Crown size={14} className="inline text-blood-bright" />}
              </p>
              <p className="line-clamp-1 max-w-md text-xs text-bone-muted/70">{item.description}</p>
              <p className="text-[11px] text-bone-muted/50">{item.clicks} acessos · {item.category?.name ?? 'Sem categoria'}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(item.id, 'vip', item.vip)}
                title="Alternar VIP"
                className={`rounded-lg border p-2 transition ${item.vip ? 'border-blood-bright text-blood-bright' : 'border-blood-dark/50 text-bone-muted/70 hover:border-blood-bright'}`}
              >
                <Crown size={14} />
              </button>
              <button
                onClick={() => toggle(item.id, 'featured', item.featured)}
                title="Alternar destaque"
                className={`rounded-lg border p-2 transition ${item.featured ? 'border-blood-bright text-blood-bright' : 'border-blood-dark/50 text-bone-muted/70 hover:border-blood-bright'}`}
              >
                <Star size={14} />
              </button>
              <button
                onClick={() => toggle(item.id, 'active', item.active)}
                title="Ativar/ocultar"
                className={`rounded-lg border p-2 transition ${item.active ? 'border-blood-dark/50 text-bone-muted' : 'border-blood-dark/50 text-bone-muted/50'}`}
              >
                {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => remove(item.id)}
                title="Excluir"
                className="rounded-lg border border-blood-dark/50 p-2 text-bone-muted/70 transition hover:border-blood-bright hover:text-blood-bright"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-bone-muted/70">Nenhum item cadastrado ainda.</p>}
      </div>
    </div>
  );
}
