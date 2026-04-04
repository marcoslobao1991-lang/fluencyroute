import type { MetadataRoute } from "next";

const SUPA_URL = "https://petrtewismhpzidcmmwb.supabase.co";
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fluencyroute.com.br";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/vsl`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/blog_posts?select=slug,published_at&status=eq.published&order=published_at.desc`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const posts = await res.json();
      blogPages = posts.map((p: any) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  return [...staticPages, ...blogPages];
}
