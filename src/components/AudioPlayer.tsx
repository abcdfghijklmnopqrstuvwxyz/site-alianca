'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ url, volume = 0.4, enabled = true }: { url?: string | null; volume?: number; enabled?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!enabled || !url || !audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setBlocked(true)); // autoplay bloqueado pelo navegador — mostra botão discreto
  }, [enabled, url, volume]);

  if (!enabled || !url) return null;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true);
          setBlocked(false);
        })
        .catch(() => setBlocked(true));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="none" />
      <button
        onClick={toggle}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-blood-dark/60 bg-ash/90 px-3 py-2 text-xs text-bone-muted shadow-glow backdrop-blur transition hover:border-blood-bright"
        aria-label={playing ? 'Desativar som' : 'Ativar som'}
      >
        {playing ? <Volume2 size={16} className="text-blood-bright" /> : <VolumeX size={16} />}
        {blocked && !playing && <span>Ativar som</span>}
      </button>
    </>
  );
}
