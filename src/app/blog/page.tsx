import Link from "next/link";
import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conseils, guides et actualités sur les Assainissement Pro.",
  alternates: {
    canonical: "https://assainissement-pro.fr/blog",
  },
};

export default function BlogIndex() {
  const articles = getAllArticles(false);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-sora text-4xl font-bold mb-4">Blog</h1>
      <p className="text-gray-600 mb-12">
        Conseils, guides et actualités sur les adoucisseurs d&apos;eau.
      </p>

      {articles.length === 0 ? (
        <p className="text-gray-500">Aucun article publié pour le moment.</p>
      ) : (
        <ul className="space-y-8">
          {articles.map((a) => (
            <li key={a.slug} className="border-b border-gray-100 pb-6">
              <Link
                href={`/blog/${a.slug}`}
                className="block group"
              >
                <h2 className="font-sora text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {a.title}
                </h2>
                {a.description && (
                  <p className="mt-2 text-gray-600">{a.description}</p>
                )}
                {a.date && (
                  <time className="mt-2 block text-sm text-gray-400">
                    {new Date(a.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
