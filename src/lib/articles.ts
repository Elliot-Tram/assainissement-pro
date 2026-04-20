import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

export interface ArticleFrontmatter {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  draft?: boolean;
  keywords?: string[];
  image?: string;
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  content: string;
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx|md)$/, ""));
}

export function getArticle(slug: string): Article | null {
  const mdx = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const md = path.join(ARTICLES_DIR, `${slug}.md`);
  const file = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : null;
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const rawDate = data.date;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : typeof rawDate === "string"
      ? rawDate
      : undefined;
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: data.description as string | undefined,
    date,
    author: data.author as string | undefined,
    draft: data.draft === true,
    keywords: data.keywords as string[] | undefined,
    image: data.image as string | undefined,
    content,
  };
}

export function getAllArticles(includeDrafts = false): Article[] {
  return getAllSlugs()
    .map((s) => getArticle(s))
    .filter((a): a is Article => a !== null)
    .filter((a) => includeDrafts || !a.draft)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
