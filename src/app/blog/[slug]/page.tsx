import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getArticle, getAllArticles } from "@/lib/articles";

export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllArticles(true).map((a) => ({ slug: a.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article introuvable" };

  const canonical = `https://assainissement-pro.fr/blog/${article.slug}`;
  const noIndex = article.draft === true;

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : undefined,
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      publishedTime: article.date,
    },
  };
}

function readingTime(md: string): number {
  const words = md.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

// ── Helpers ─────────────────────────────────────────────────────────

function extractText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object") {
    const n = node as { props?: { children?: unknown } };
    if (n.props && "children" in n.props) return extractText(n.props.children);
  }
  return "";
}

// ── Custom markdown components ──────────────────────────────────────

const components: Components = {
  // H2 — accent trait for visual rhythm
  h2: ({ children, ...props }) => (
    <h2 {...props} className="heading-accent font-heading">
      {children}
    </h2>
  ),

  // H3 — "Étape N" gets a teal number badge
  h3: ({ children, ...props }) => {
    const text = extractText(children);
    const match = text.match(/^Étape\s+(\d+)\s*[:\-–—.]?\s*(.*)$/i);
    if (match) {
      const [, num, rest] = match;
      return (
        <h3 {...props} className="font-heading flex items-center">
          <span className="inline-flex items-center justify-center size-8 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mr-3 shrink-0">
            {num}
          </span>
          <span>{rest || `Étape ${num}`}</span>
        </h3>
      );
    }
    return (
      <h3 {...props} className="font-heading">
        {children}
      </h3>
    );
  },

  // Blockquote — detect leading emoji for warning / legal
  blockquote: ({ children, ...props }) => {
    const text = extractText(children).trim();
    if (text.startsWith("⚠️") || text.startsWith("⚠")) {
      return (
        <blockquote
          {...props}
          className="not-prose my-6 border-l-4 border-amber-400 bg-amber-50 text-amber-900 px-6 py-4 rounded-r-lg"
        >
          {children}
        </blockquote>
      );
    }
    if (text.startsWith("📖")) {
      return (
        <blockquote
          {...props}
          className="not-prose my-6 border-l-4 border-teal-500 bg-teal-50 text-teal-900 px-6 py-4 rounded-r-lg italic"
        >
          {children}
        </blockquote>
      );
    }
    return (
      <blockquote
        {...props}
        className="border-l-4 border-teal-500 bg-teal-50/50 px-6 py-4 rounded-r-lg not-italic text-gray-700 font-normal"
      >
        {children}
      </blockquote>
    );
  },

  // Links — external get target=_blank
  a: ({ href, children, ...props }) => {
    const url = href || "";
    const isExternal =
      url.startsWith("http") && !url.includes("assainissement-pro.fr");
    if (isExternal) {
      return (
        <a
          {...props}
          href={url}
          target="_blank"
          rel="noopener"
          className="text-teal-600 no-underline hover:underline font-medium"
        >
          {children}
        </a>
      );
    }
    return (
      <a
        {...props}
        href={url}
        className="text-teal-600 no-underline hover:underline font-medium"
      >
        {children}
      </a>
    );
  },

  // Tables — responsive wrapper + visual hierarchy
  table: ({ children, ...props }) => (
    <div className="not-prose my-8 overflow-x-auto rounded-lg border border-[#E8E6E3]">
      <table {...props} className="w-full border-collapse text-left">
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead {...props} className="bg-teal-50">
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="px-4 py-3 text-teal-700 font-semibold uppercase tracking-wider text-xs border-b border-[#E8E6E3]"
    >
      {children}
    </th>
  ),
  tr: ({ children, ...props }) => (
    <tr {...props} className="table-row-hover border-t border-[#E8E6E3]">
      {children}
    </tr>
  ),
  td: ({ children, ...props }) => {
    const text = extractText(children).trim();
    if (text === "✅") {
      return (
        <td {...props} className="px-4 py-3 text-green-600 text-xl text-center">
          ✅
        </td>
      );
    }
    if (text === "❌") {
      return (
        <td {...props} className="px-4 py-3 text-red-500 text-xl text-center">
          ❌
        </td>
      );
    }
    return (
      <td {...props} className="px-4 py-3 text-gray-700 align-top">
        {children}
      </td>
    );
  },

  // Lists — if items start with ✅/❌, render with custom markers
  ul: ({ children, ...props }) => {
    const arr = Array.isArray(children) ? children : [children];
    const hasMarkers = arr.some((child) => {
      const t = extractText(child).trim();
      return t.startsWith("✅") || t.startsWith("❌");
    });
    if (hasMarkers) {
      return (
        <ul {...props} className="not-prose my-6 space-y-2 list-none pl-0">
          {children}
        </ul>
      );
    }
    return <ul {...props}>{children}</ul>;
  },
  li: ({ children, ...props }) => {
    const text = extractText(children).trim();
    if (text.startsWith("✅")) {
      // strip the leading ✅ from children rendering via text replacement
      return (
        <li
          {...props}
          className="flex items-start gap-3 text-gray-700 leading-relaxed"
        >
          <span className="text-green-600 text-lg shrink-0 leading-tight">
            ✅
          </span>
          <span className="flex-1">
            {stripLeadingEmoji(children, "✅") as ReactNode}
          </span>
        </li>
      );
    }
    if (text.startsWith("❌")) {
      return (
        <li
          {...props}
          className="flex items-start gap-3 text-gray-700 leading-relaxed"
        >
          <span className="text-red-500 text-lg shrink-0 leading-tight">
            ❌
          </span>
          <span className="flex-1">
            {stripLeadingEmoji(children, "❌") as ReactNode}
          </span>
        </li>
      );
    }
    return <li {...props}>{children}</li>;
  },
};

// Strip a leading emoji from the first text child of a ReactNode tree.
function stripLeadingEmoji(children: unknown, emoji: string): unknown {
  if (typeof children === "string") {
    return children.replace(new RegExp(`^\\s*${emoji}\\s*`), "");
  }
  if (Array.isArray(children)) {
    const copy = [...children];
    for (let i = 0; i < copy.length; i++) {
      const t = extractText(copy[i]);
      if (t.trim().length === 0) continue;
      copy[i] = stripLeadingEmoji(copy[i], emoji) as typeof copy[number];
      return copy;
    }
    return copy;
  }
  if (children && typeof children === "object") {
    const el = children as {
      props?: { children?: unknown };
      type?: unknown;
    };
    if (el.props && "children" in el.props) {
      // Best-effort: return as-is if we can't safely rewrite
      return children;
    }
  }
  return children;
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const mins = readingTime(article.content);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {article.draft && (
        <div className="mb-8 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Brouillon — cette page n&apos;est pas indexée par les moteurs de
          recherche.
        </div>
      )}

      <header className="mb-12">
        <p className="label-style text-teal-600 mb-4">Blog</p>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight leading-tight mb-6">
          {article.title}
        </h1>
        {article.description && (
          <p className="text-lg text-gray-500 leading-relaxed mb-6" style={{ lineHeight: 1.7 }}>
            {article.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {article.date && (
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
          <span aria-hidden>·</span>
          <span>{mins} min de lecture</span>
          {article.author && (
            <>
              <span aria-hidden>·</span>
              <span>{article.author}</span>
            </>
          )}
        </div>
      </header>

      <article
        className="
          prose prose-lg max-w-none
          prose-headings:font-heading prose-headings:text-gray-900 prose-headings:tracking-tight
          prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:scroll-mt-20
          prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:scroll-mt-20
          prose-p:text-gray-600 prose-p:leading-[1.8]
          prose-strong:text-gray-900
          prose-code:bg-gray-100 prose-code:text-teal-700 prose-code:px-1.5 prose-code:py-0.5
          prose-code:rounded prose-code:text-sm prose-code:before:hidden prose-code:after:hidden
          prose-ul:text-gray-600 prose-ol:text-gray-600
          prose-li:marker:text-teal-500
          prose-hr:border-[#E8E6E3] prose-hr:my-12
          prose-img:rounded-xl prose-img:shadow-sm
        "
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={components}
        >
          {article.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
