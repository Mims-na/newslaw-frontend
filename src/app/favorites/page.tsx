"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteNewsItem = {
  id: string;
  title: string;
  source: string | null;
  published_at: string | null;
  category: string | null;
  document_type: string | null;
  apport_title: string | null;
  practical_impact: string | null;
  importance: string | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConnected, setNotConnected] = useState(false);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;

      if (!userId) {
        setNotConnected(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          news_items (
            id,
            title,
            source,
            published_at,
            category,
            document_type,
            apport_title,
            practical_impact,
            importance
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement favoris :", error);
        setItems([]);
        setLoading(false);
        return;
      }

      const mapped =
        data?.map((row: any) => row.news_items).filter(Boolean) ?? [];

      setItems(mapped);
      setLoading(false);
    }

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-white/60">Chargement...</p>
        </div>
      </main>
    );
  }

  if (notConnected) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
          >
            ← Retour à l’accueil
          </Link>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#020817] p-8">
            <h1 className="text-3xl font-semibold text-white">Mes favoris</h1>
            <p className="mt-4 text-white/70">
              Connecte-toi pour accéder à tes favoris.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
          >
            ← Retour à l’accueil
          </Link>

          <h1 className="text-3xl font-semibold text-white">Mes favoris</h1>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#020817] p-8">
            <p className="text-white/70">Aucun favori pour le moment.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block rounded-[2rem] border border-white/10 bg-[#020817] p-8 transition hover:border-white/20 hover:bg-[#06101f]"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                  {item.category && <span>{item.category}</span>}
                  {item.document_type && <span>• {item.document_type}</span>}
                  {item.source && <span>• {item.source}</span>}
                  {item.importance === "important" && <span>• IMPORTANT</span>}
                </div>

                <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">
                  {item.title}
                </h2>

                {item.apport_title && (
                  <p className="mt-4 text-lg font-medium text-white/90">
                    {item.apport_title}
                  </p>
                )}

                {item.practical_impact && (
                  <p className="mt-4 line-clamp-4 text-white/75">
                    {item.practical_impact}
                  </p>
                )}

                {item.published_at && (
                  <p className="mt-5 text-sm text-white/50">
                    {formatDate(item.published_at)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}