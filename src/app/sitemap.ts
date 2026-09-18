import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://exemplo.com';

  const communities = await prisma.community.findMany({
    where: { active: true },
    select: { slug: true, type: true, updatedAt: true },
  }).catch(() => []);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/grupos`, lastModified: new Date() },
    { url: `${base}/canais`, lastModified: new Date() },
    { url: `${base}/sobre`, lastModified: new Date() },
    ...communities.map((c) => ({
      url: `${base}/${c.type === 'GROUP' ? 'grupo' : 'canal'}/${c.slug}`,
      lastModified: c.updatedAt,
    })),
  ];
}
