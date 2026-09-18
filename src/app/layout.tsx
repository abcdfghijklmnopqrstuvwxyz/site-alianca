import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import { prisma } from '@/lib/db';

async function getSettings() {
  // Settings é singleton (id "main"); cria com defaults se ainda não existir.
  const settings = await prisma.settings.findUnique({ where: { id: 'main' } }).catch(() => null);
  return (
    settings ?? {
      allianceName: process.env.NEXT_PUBLIC_DEFAULT_ALLIANCE_NAME ?? 'INFERNUM',
      description: 'Onde as comunidades se encontram.',
      seoTitle: null,
      seoDescription: null,
      seoImage: null,
      musicUrl: null,
      musicEnabled: false,
      musicVolume: 0.4,
      favicon: null,
    }
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seoTitle || settings.allianceName;
  const description = settings.seoDescription || settings.description;

  return {
    title: { default: title, template: `%s | ${settings.allianceName}` },
    description,
    icons: settings.favicon ? [{ url: settings.favicon }] : undefined,
    openGraph: {
      title,
      description,
      images: settings.seoImage ? [settings.seoImage] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="pt-BR" className="dark">
      <body>
        <div className="grunge-overlay" />
        <Navbar allianceName={settings.allianceName} />
        <main className="relative z-10 min-h-[70vh]">{children}</main>
        <Footer allianceName={settings.allianceName} />
        <AudioPlayer url={settings.musicUrl} volume={settings.musicVolume} enabled={settings.musicEnabled} />
      </body>
    </html>
  );
}
