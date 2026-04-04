"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function getSourceBadgeClass(source: string | null) {
  const value = (source || "").toLowerCase();

  if (value.includes("amf")) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (value.includes("judilibre") || value.includes("légifrance") || value.includes("legifrance")) {
    return "border-indigo-400/20 bg-indigo-400/10 text-indigo-200";
  }

  if (value.includes("conseil")) {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  return "border-white/10 bg-white/5 text-white/70";
}

function getExcerpt(text: string | null, maxLength = 240) {
  const value = (text || "").trim();
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement favoris :", error);
        setFavorites([]);
      } else {
        setFavorites((data ?? []) as FavoriteRow[]);
      }

      setLoading(false);
    }

    loadFavorites();
  }, []);

  const visibleFavorites = useMemo(() => {
    return favorites
      .map((favorite) => ({
        ...favorite,
        item: normalizeNewsItem(favorite.news_items),
      }))
      .filter((favorite) => favorite.item);
  }, [favorites]);

  async function removeFavorite(favoriteId: string) {
    setRemovingId(favoriteId);

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (error) {
      console.error("Erreur suppression favori :", error);
      alert("Impossible de retirer ce favori.");
    } finally {
      setRemovingId(null);
    }
  }

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

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.08),_transparent_25%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Premium
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Mes favoris
            </h1>
            <p className="mt-3 text-sm text-white/55">
              Retrouve rapidement les fiches que tu veux relire.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Retour au site
          </Link>
        </div>

        {visibleFavorites.length > 0 && (
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/65">
            {visibleFavorites.length} fiche{visibleFavorites.length > 1 ? "s" : ""} enregistrée{visibleFavorites.length > 1 ? "s" : ""}
          </div>
        )}

        <div className="mt-8 space-y-5">
          {visibleFavorites.map((favorite) => {
            const item = favorite.item!;
            const excerpt = getExcerpt(item.summary, 260);

            return (
              <div
                key={favorite.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:border-white/20 hover:bg-white/[0.07] md:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide ${getSourceBadgeClass(
                        item.source
                      )}`}
                    >
                      {item.source || "Source inconnue"}
                    </span>

                    {item.category && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white/65">
                        {item.category}
                      </span>
                    )}

                    {item.sub_category && (
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-cyan-100/90">
                        {item.sub_category}
                      </span>
                    )}

                    {item.importance === "important" && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-amber-200">
                        Important
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    disabled={removingId === favorite.id}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
                  >
                    {removingId === favorite.id ? "..." : "Retirer"}
                  </button>
                </div>

                <Link href={`/news/${item.id}`} className="block">
                  <h2 className="mt-5 text-2xl font-semibold leading-tight text-white md:text-3xl">
                    {item.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/45">
                    <span>{formatDate(item.published_at)}</span>
                    <span>•</span>
                    <span>Ajouté le {formatDate(favorite.created_at)}</span>
                  </div>

                  {excerpt && (
                    <p className="mt-5 max-w-5xl text-sm leading-8 text-white/68 md:text-base">
                      {excerpt}
                    </p>
                  )}
                </Link>
              </div>
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
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">
                Aucun favori
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                Commence à enregistrer les fiches qui comptent pour toi.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
                Ajoute des fiches à tes favoris depuis leur page détail pour les retrouver plus vite ensuite.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Explorer les fiches
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}