// Gera partículas com posições/tempos pseudo-aleatórios mas determinísticos,
// para não divergir entre server e client (evita erro de hydration).
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Particles({ count = 26 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => {
    const left = seededRandom(i * 12.9898) * 100;
    const duration = 8 + seededRandom(i * 78.233) * 10;
    const delay = seededRandom(i * 37.719) * 10;
    const size = 2 + seededRandom(i * 4.61) * 3;
    return { left, duration, delay, size, key: i };
  });

  return (
    <div className="particles absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((p) => (
        <span
          key={p.key}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
