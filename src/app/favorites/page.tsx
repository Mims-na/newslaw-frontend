"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteNewsItem = {
  id: string;
  title: string;
  summary: string | null;
  source: string | null;
  published_at: string | null;
  category: string | null;
  sub_category: string | null;
  importance: string | null;
};

type FavoriteRow = {
  id: string;
  created_at: string;
  news_items: FavoriteNewsItem | FavoriteNewsItem[] | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeNewsItem(
  value: FavoriteNewsItem | FavoriteNewsItem[] | null
): FavoriteNewsItem | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erreur profil :", profileError);
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (profile?.subscription_plan !== "premium") {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          id,
          created_at,
          news_items (
            id,
            title,
            summary,
            source,
            published_at,
            category,
            sub_category,
            importance
          )
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement favoris :", error);
        setFavorites([]);
      } else {
        console.log("FAVORITES RAW DATA :", data);
        setFavorites((data ?? []) as FavoriteRow[]);
      }

      setLoading(false);
    }

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-white/60">Chargement des favoris...</p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Retour à l’accueil
          </Link>

          <div className="mt-8 rounded-[2rem] border border-amber-400/15 bg-amber-400/5 p-8">
            <h1 className="text-3xl font-semibold">
              Favoris réservés au premium
            </h1>
            <p className="mt-4 text-white/75">
              Les favoris font partie de l’expérience premium.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-5 py-2.5 text-sm text-amber-100 transition hover:border-amber-400/30 hover:bg-amber-400/15"
            >
              Voir l’offre premium
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const visibleFavorites = favorites
    .map((favorite) => ({
      ...favorite,
      item: normalizeNewsItem(favorite.news_items),
    }))
    .filter((favorite) => favorite.item);

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Premium
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
              Mes favoris
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Retour au site
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {visibleFavorites.map((favorite) => {
            const item = favorite.item!;
            return (
              <Link
                key={favorite.id}
                href={`/news/${item.id}`}
                className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                  <span>{item.source || "Source inconnue"}</span>
                  <span>•</span>
                  <span>{formatDate(item.published_at)}</span>
                  {item.category && (
                    <>
                      <span>•</span>
                      <span>{item.category}</span>
                    </>
                  )}
                  {item.sub_category && (
                    <>
                      <span>•</span>
                      <span>{item.sub_category}</span>
                    </>
                  )}
                </div>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  {item.title}
                </h2>

                {item.summary && (
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/68">
                    {item.summary}
                  </p>
                )}
              </Link>
            );
          })}

          {favorites.length > 0 && visibleFavorites.length === 0 && (
            <div className="rounded-[1.5rem] border border-rose-400/15 bg-rose-400/5 p-8">
              <p className="text-white/75">
                Des favoris existent, mais les fiches liées ne remontent pas correctement.
              </p>
            </div>
          )}

          {favorites.length === 0 && (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8">
              <p className="text-white/70">Aucun favori pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}