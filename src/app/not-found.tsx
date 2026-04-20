import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <div className="text-center max-w-lg mx-auto px-6">
        <p className="font-heading text-6xl text-teal-600 mb-4">404</p>
        <h1 className="font-heading text-2xl text-gray-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-10" style={{ lineHeight: 1.7 }}>
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="btn-cta bg-teal-600 text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-teal-700 transition"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
