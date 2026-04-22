import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { getAllSlugs, getArticle } from "@/lib/articles";

const SITE_URL = "https://assainissement-pro.fr";
const SITE_NAME = "Assainissement Pro";

// Palette
const PRIMARY = "#0D9488";
const PRIMARY_SOFT = "#F0FDFA";
const PRIMARY_BORDER = "#CCFBF1";
const PRIMARY_CONTRAST = "#CCFBF1"; // text sur fond sombre primaire
const PRIMARY_MUTED = "#99F6E4";       // texte secondaire sur hero
const PRIMARY_DARK = "#0F766E";         // badge catégorie fond

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article introuvable" };
  const canonical = `${SITE_URL}/blog/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    robots: article.draft
      ? { index: false, follow: false, nocache: true }
      : undefined,
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      locale: "fr_FR",
      siteName: SITE_NAME,
      ...(article.date ? { publishedTime: article.date } : {}),
      ...(article.image ? { images: [{ url: article.image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function extractTocItems(content: string): { id: string; label: string }[] {
  const slugger = new GithubSlugger();
  const items: { id: string; label: string }[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      const label = match[1].replace(/[*_`]/g, "").trim();
      if (label) {
        items.push({ id: slugger.slug(label), label });
      }
    }
  }
  return items;
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.draft) notFound();

  const tocItems = extractTocItems(article.content);
  const hasFaqs = !!article.faqs && article.faqs.length > 0;
  const canonical = `${SITE_URL}/blog/${slug}`;

  // JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image ? [article.image] : undefined,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: canonical,
  };

  const faqJsonLd = hasFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs!.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.reponse },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Hero */}
      <section style={{ backgroundColor: PRIMARY }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav className="text-sm mb-6" style={{ color: PRIMARY_MUTED }}>
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: PRIMARY_CONTRAST }}>{article.title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.15] mb-4">
            {article.title}
          </h1>
          {(article.category || article.date || article.readingTime) && (
            <div className="flex items-center gap-3 mt-4 text-sm flex-wrap" style={{ color: PRIMARY_MUTED }}>
              {article.category && (
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
                  style={{ backgroundColor: PRIMARY_DARK, color: PRIMARY_CONTRAST }}
                >
                  {article.category}
                </span>
              )}
              {article.category && article.date && (
                <span className="w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: PRIMARY_MUTED }} />
              )}
              {article.date && (
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
              {article.readingTime && (
                <>
                  <span className="w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: PRIMARY_MUTED }} />
                  <span>{article.readingTime} de lecture</span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Layout 2 colonnes : article + sommaire sticky */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex gap-12">
          <article className="flex-1 min-w-0 article-content prose prose-lg max-w-none">
            {/* Bloc Points clés */}
            {article.keyPoints && article.keyPoints.length > 0 && (
              <div
                className="not-prose rounded-xl p-6 mb-10 border"
                style={{ backgroundColor: PRIMARY_SOFT, borderColor: PRIMARY_BORDER }}
              >
                <p className="font-bold text-stone-900 text-base mb-3">
                  Points clés à retenir
                </p>
                <ul className="text-sm text-stone-700 leading-relaxed space-y-2">
                  {article.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: PRIMARY }}>
                        {i + 1}.
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {article.content}
            </ReactMarkdown>

            {/* FAQ accordion */}
            {hasFaqs && (
              <section id="faq" className="scroll-mt-24 mt-12">
                <h2>Questions fréquentes</h2>
                <div className="space-y-3 not-prose">
                  {article.faqs!.map((faq, i) => (
                    <details
                      key={i}
                      className="group border border-stone-200 rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-4 bg-white hover:bg-stone-50 transition-colors duration-200 text-stone-900 font-semibold text-base">
                        {faq.question}
                        <svg
                          className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4">
                        <p className="text-base text-stone-500 leading-relaxed">
                          {faq.reponse}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sommaire sticky (desktop uniquement) */}
          {tocItems.length > 0 && (
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <nav aria-label="Sommaire" className="text-sm">
                  <p className="font-semibold text-stone-900 mb-3 uppercase tracking-wider text-xs">
                    Sommaire
                  </p>
                  <ul className="space-y-2">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block text-stone-500 hover:text-stone-900 transition-colors duration-200 leading-snug"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
