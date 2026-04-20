import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://assainissement-pro.fr"),
  title: {
    default: "Assainissement Pro",
    template: "%s | Assainissement Pro",
  },
  description: "Comparez les devis d'assainissement et trouvez un pro qualifie pres de chez vous.",
  alternates: {
    canonical: "https://assainissement-pro.fr",
  },
  openGraph: {
    title: "Assainissement Pro",
    description: "Comparez les devis d'assainissement et trouvez un pro qualifie pres de chez vous.",
    type: "website",
    locale: "fr_FR",
    url: "https://assainissement-pro.fr",
    siteName: "Assainissement Pro",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
