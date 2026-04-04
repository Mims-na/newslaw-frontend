"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  newsItemId: string;
  isPremiumOnly?: boolean;
};

export default function FavoriteButton({
  newsItemId,
  isPremiumOnly = true,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function loadState() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const [{ data: profile }, { data: favorite, error: favoriteError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("subscription_plan")
            .eq("id", session.user.id)
            .single(),
          supabase
            .from("favorites")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("news_item_id", newsItemId)
            .maybeSingle(),
        ]);

      if (favoriteError) {
        console.error("Erreur lecture favori :", favoriteError);
      }

      setIsPremium(profile?.subscription_plan === "premium");
      setIsFavorite(!!favorite);
      setLoading(false);
    }

    loadState();
  }, [newsItemId]);

  async function toggleFavorite() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (isPremiumOnly && !isPremium) {
      window.location.href = "/pricing";
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return;

    setSaving(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("news_item_id", newsItemId);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: session.user.id,
          news_item_id: newsItemId,
        });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur mise à jour favori :", error);
      alert("Impossible de mettre à jour les favoris.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/50"
      >
        Favori
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={saving}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        isFavorite
          ? "border-amber-300/30 bg-amber-200 text-black hover:bg-amber-100"
          : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      {saving ? "..." : isFavorite ? "★ Favori" : "☆ Ajouter aux favoris"}
    </button>
  );
}