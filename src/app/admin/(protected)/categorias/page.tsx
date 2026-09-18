'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🔥');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/categorias');
    if (res.ok) setCategories(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon }),
    });
    if (!res.ok) {
      setError('Não foi possível criar a categoria.');
      return;
    }
    setName('');
    setIcon('🔥');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta categoria?')) return;
    await fetch(`/api/admin/categorias/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-widest text-blood-bright text-glow">Categorias</h1>

      <form onSubmit={create} className="mb-6 flex flex-wrap gap-2 rounded-xl border border-blood-dark/40 bg-ash/70 p-4">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-16 rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-center text-sm outline-none focus:border-blood-bright"
        />
        <input
          required
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-blood-dark/50 bg-void/80 px-3 py-2 text-sm outline-none focus:border-blood-bright"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg border border-blood-bright bg-blood-bright/90 px-4 py-2 text-xs font-bold uppercase text-white shadow-glow hover:bg-blood-bright"
        >
          <Plus size={14} /> Adicionar
        </button>
      </form>

      {error && <p className="mb-3 text-xs text-blood-bright">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c.id} className="flex items-center gap-2 rounded-full border border-blood-dark/50 bg-ash/70 px-4 py-2 text-sm">
            {c.icon} {c.name}
            <button onClick={() => remove(c.id)} className="text-bone-muted/70 hover:text-blood-bright">
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
