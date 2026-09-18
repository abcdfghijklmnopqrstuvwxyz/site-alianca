// Ilustração 100% original em SVG: silhueta chifruda estilizada + tentáculos de fumaça/chama
// e brilho de olhos sutil, pensada pra ficar atrás do título do hero sem atrapalhar a leitura.
export default function HeroBeast() {
  return (
    <svg
      viewBox="0 0 900 700"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-90 sm:h-full sm:w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="glowCore" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#8a0000" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#3d0000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#050303" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="silhouette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2b0000" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#050303" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="tendril" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8a0000" stopOpacity="0" />
          <stop offset="45%" stopColor="#8a0000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff3b1f" stopOpacity="0.15" />
        </linearGradient>
        <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="wideBlur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="eyeGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <circle cx="450" cy="260" r="320" fill="url(#glowCore)" />

      <g filter="url(#wideBlur)">
        {[
          'M450,700 C420,560 480,470 400,360 C340,280 380,180 340,80',
          'M450,700 C480,560 420,470 500,360 C560,280 520,180 560,80',
          'M300,700 C260,540 340,480 260,380 C210,300 250,200 200,120',
          'M600,700 C640,540 560,480 640,380 C690,300 650,200 700,120',
        ].map((d, i) => (
          <path key={i} d={d} stroke="url(#tendril)" strokeWidth="26" fill="none" strokeLinecap="round" opacity={0.55 - i * 0.06} />
        ))}
      </g>

      <g filter="url(#softBlur)" opacity="0.85">
        <path
          d="M450,260 C420,190 380,150 330,60 C365,140 380,190 400,255 Z"
          fill="url(#silhouette)"
        />
        <path
          d="M450,260 C480,190 520,150 570,60 C535,140 520,190 500,255 Z"
          fill="url(#silhouette)"
        />
        <path
          d="M450,220 C510,225 545,270 540,335 C535,410 500,460 450,480 C400,460 365,410 360,335 C355,270 390,225 450,220 Z"
          fill="url(#silhouette)"
        />
      </g>

      <g filter="url(#eyeGlow)">
        <ellipse cx="418" cy="330" rx="6" ry="4" fill="#ff3b1f" opacity="0.85" />
        <ellipse cx="482" cy="330" rx="6" ry="4" fill="#ff3b1f" opacity="0.85" />
      </g>
    </svg>
  );
}
