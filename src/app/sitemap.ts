import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://assainissement-pro.fr";

  const articleEntries: MetadataRoute.Sitemap = getAllArticles(false).map(
    (a) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const blogIndex: MetadataRoute.Sitemap =
    articleEntries.length > 0
      ? [
          {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          },
        ]
      : [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...blogIndex,
    ...articleEntries,
  ];
}
