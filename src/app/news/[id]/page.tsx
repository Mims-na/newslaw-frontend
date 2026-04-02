"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: string;
  title: string;
  source: string | null;
  source_url: string | null;
  published_at: string | null;
  category: string | null;
  document_type: string | null;
  jurisdiction: string | null;
  summary: string | null;
  apport_title: string | null;
  practical_impact: string | null;
  importance: string | null;
  tags: string[] | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractDecisionNumber(tags: string[] | null) {
  if (!tags || !Array.isArray(tags)) return null;
  return tags.find((tag) => /^[0-9]{3,}[-0-9]*$/.test(tag)) ?? null;
}

function getTypeBadgeClass(type: string | null) {
  const value = (type || "").toLowerCase();

  if (value.includes("avis")) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
  }
  if (value.includes("sanction") || value.includes("transaction")) {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }
  if (value.includes("communiqué") || value.includes("communique")) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  return "border-violet-400/30 bg-violet-400/10 text-violet-200";
}

function getSourceBadgeClass(source: string | null) {
  const value = (source || "").toLowerCase();

  if (value.includes("amf")) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (value.includes("conseil")) {
    return "border-sky-400/30 bg-sky-400/10 text-sky-200";
  }
  if (
    value.includes("judilibre") ||
    value.includes("légifrance") ||
    value.includes("legifrance")
  ) {
    return "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
  }

  return "border-white/15 bg-white/5 text-white/80";
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    async function fetchNewsItem() {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("news_items")
        .select(
          "id, title, source, source_url, published_at, category, document_type, jurisdiction, summary, apport_title, practical_impact, importance, tags"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Erreur chargement fiche détail :", error);
        setNotFoundState(true);
        setNewsItem(null);
      } else {
        setNewsItem(data as NewsItem);
      }

      setLoading(false);
    }

    fetchNewsItem();
  }, [id]);

  useEffect(() => {
    async function fetchUserAndFavorite() {
      if (!id) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      if (!currentUserId) {
        setIsFavorite(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("news_item_id", id)
        .maybeSingle();

      if (error) {
        console.error("Erreur lecture favori :", error);
        return;
      }

      setIsFavorite(!!data);
    }

    fetchUserAndFavorite();
  }, [id]);

  async function toggleFavorite() {
    if (!userId || !newsItem) {
      alert("Connecte-toi pour ajouter des favoris.");
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("news_item_id", newsItem.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          news_item_id: newsItem.id,
        });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur favoris :", error);
      alert("Impossible de mettre à jour les favoris.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-white/60">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!newsItem) {
    return null;
  }

  const formattedDate = formatDate(newsItem.published_at);
  const formattedDateTime = formatDateTime(newsItem.published_at);
  const decisionNumber = extractDecisionNumber(newsItem.tags);

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.10),_transparent_25%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
          >
            ← Retour à l’accueil
          </Link>

          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
          >
            {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
          </button>
        </div>

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101d]/85 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            {newsItem.document_type && (
              <span
                className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wide ${getTypeBadgeClass(
                  newsItem.document_type
                )}`}
              >
                {newsItem.document_type}
              </span>
            )}

            {newsItem.source && (
              <span
                className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wide ${getSourceBadgeClass(
                  newsItem.source
                )}`}
              >
                {newsItem.source}
              </span>
            )}

            {newsItem.category && (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-white/65">
                {newsItem.category}
              </span>
            )}

            {newsItem.importance === "important" && (
              <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-amber-200">
                Important
              </span>
            )}

            {newsItem.jurisdiction &&
              newsItem.jurisdiction !== newsItem.source && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-white/65">
                  {newsItem.jurisdiction}
                </span>
              )}
          </div>

          <h1 className="mt-8 max-w-5xl text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">
            {newsItem.title}
          </h1>

          {(formattedDate || decisionNumber) && (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {formattedDate && (
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Date
                  </p>
                  <p className="mt-3 text-base text-white/85">{formattedDate}</p>
                </div>
              )}

              {formattedDateTime && (
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Horodatage
                  </p>
                  <p className="mt-3 text-base text-white/85">{formattedDateTime}</p>
                </div>
              )}

              {decisionNumber && (
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Numéro
                  </p>
                  <p className="mt-3 text-base text-white/85">
                    Décision n° {decisionNumber}
                  </p>
                </div>
              )}
            </div>
          )}

          {newsItem.practical_impact && (
            <section className="mt-10 rounded-[1.75rem] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(255,255,255,0.03))] p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/55">
                Apport pratique
              </p>

              {newsItem.apport_title && (
                <h2 className="mt-4 max-w-4xl text-2xl font-semibold leading-tight text-cyan-50 md:text-4xl">
                  {newsItem.apport_title}
                </h2>
              )}

              <p className="mt-5 max-w-5xl text-lg leading-[1.95] text-white/92 md:text-xl">
                {newsItem.practical_impact}
              </p>
            </section>
          )}

          {newsItem.summary && (
            <section className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/20 p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                Résumé technique
              </p>
              <p className="mt-5 max-w-5xl text-lg leading-[1.95] text-white/72 md:text-xl">
                {newsItem.summary}
              </p>
            </section>
          )}

          {newsItem.tags && newsItem.tags.length > 0 && (
            <section className="mt-10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                Tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {newsItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {newsItem.source_url && (
            <div className="mt-12">
              <a
                href={newsItem.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Lire la source officielle
              </a>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}