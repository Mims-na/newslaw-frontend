import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newslaw",
  description: "Veille juridique augmentée",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-[#02040a] text-white">
          {children}

          <footer className="border-t border-white/10 bg-[#02040a] px-6 py-6 text-sm text-white/50 md:px-10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
              <Link
                href="/mentions-legales"
                className="transition hover:text-white"
              >
                Mentions légales
              </Link>

              <Link
                href="/confidentialite"
                className="transition hover:text-white"
              >
                Confidentialité
              </Link>

              <Link
                href="/cookies"
                className="transition hover:text-white"
              >
                Cookies
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
