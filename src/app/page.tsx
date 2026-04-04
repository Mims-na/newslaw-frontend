"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: string;
  title: string;
  source: string | null;
  source_url: string | null;
  published_at: string | null;
  category: string | null;
  main_category: string | null;
  sub_category: string | null;
  portee: string | null;
  sector: string | null;
  status: string | null;
  document_type: string | null;
  jurisdiction: string | null;
  summary: string | null;
  apport_title: string | null;
  practical_impact: string | null;
  importance: string | null;
  tags: string[] | null;
};

type UserProfile = {
  subscription_plan: "free" | "premium";
  role: "user" | "expert" | "admin";
};

const PREFERRED_FILTER_ORDER = [
  "Droit public des affaires",
  "Régulation et numérique",
  "Réformes et textes",
  "AMF et marchés financiers",
  "Sanctions et conformité",
  "Droit des sociétés",
  "Droit bancaire",
  "Droit de la consommation",
  "Droit des affaires",
  "Environnement et activités économiques",
];

const ITEMS_PER_PAGE = 6;
const FREE_FULL_ACCESS_COUNT = 3;

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

function getTypeBadgeClass(type: string | null) {
  const value = (type || "").toLowerCase();
  if (value.includes("avis")) return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
  if (value.includes("sanction") || value.includes("transaction")) return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  if (value.includes("communiqué") || value.includes("communique")) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  return "border-violet-400/30 bg-violet-400/10 text-violet-200";
}

function getSourceBadgeClass(source: string | null) {
  const value = (source || "").toLowerCase();
  if (value.includes("amf")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (value.includes("conseil")) return "border-sky-400/30 bg-sky-400/10 text-sky-200";
  if (value.includes("judilibre") || value.includes("légifrance") || value.includes("legifrance")) {
    return "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
  }
  return "border-white/15 bg-white/5 text-white/80";
}

function getPorteeBadgeClass(portee: string | null) {
  const value = (portee || "").toLowerCase();
  if (value.includes("sanction")) return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  if (value.includes("réforme") || value.includes("reforme")) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (value.includes("encadrement")) return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
  if (value.includes("alerte")) return "border-orange-400/30 bg-orange-400/10 text-orange-200";
  if (value.includes("validation") || value.includes("confirmation")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/70";
}

function getMainCategory(item: NewsItem) {
  return item.main_category || item.category || "Non classé";
}

function buildOrderedFilterList(values: string[], preferred: string[] = []) {
  const unique = Array.from(new Set(values.filter(Boolean)));
  const preferredOrdered = preferred.filter((value) => unique.includes(value));
  const remaining = unique
    .filter((value) => !preferred.includes(value))
    .sort((a, b) => a.localeCompare(b, "fr"));
  return ["Toutes", ...preferredOrdered, ...remaining];
}

function getFreeExcerpt(text: string | null, maxLength = 180) {
  const value = (text || "").trim();
  if (!value) return "Accès partiel réservé en version gratuite.";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}…`;
}

export default function HomePage() {
  const router = useRouter();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMainFilter, setSelectedMainFilter] = useState("Toutes");
  const [selectedSubFilter, setSelectedSubFilter] = useState("Toutes");
  const [selectedPorteeFilter, setSelectedPorteeFilter] = useState("Toutes");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);

      const { data, error } = await supabase
        .from("news_items")
        .select(
          "id, title, source, source_url, published_at, category, main_category, sub_category, portee, sector, status, document_type, jurisdiction, summary, apport_title, practical_impact, importance, tags"
        )
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement news_items :", error);
        setItems([]);
      } else {
        setItems((data as NewsItem[]) || []);
      }

      setLoading(false);
    }

    fetchNews();
  }, []);

  useEffect(() => {
    async function fetchAuthData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSessionEmail(session?.user?.email ?? null);

      if (!session?.user?.id) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_plan, role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erreur chargement profil :", error);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    }

    fetchAuthData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSessionEmail(session?.user?.email ?? null);

      if (!session?.user?.id) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("subscription_plan, role")
        .eq("id", session.user.id)
        .single();

      setProfile((data as UserProfile) || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isPremium = profile?.subscription_plan === "premium";

  const mainFilters = useMemo(() => {
    return buildOrderedFilterList(
      items.map((item) => getMainCategory(item)),
      PREFERRED_FILTER_ORDER
    );
  }, [items]);

  const subFilters = useMemo(() => {
    const pool =
      selectedMainFilter === "Toutes"
        ? items
        : items.filter((item) => getMainCategory(item) === selectedMainFilter);

    return buildOrderedFilterList(
      pool.map((item) => item.sub_category || "").filter(Boolean)
    );
  }, [items, selectedMainFilter]);

  const porteeFilters = useMemo(() => {
    const pool = items.filter((item) => {
      const mainOk =
        selectedMainFilter === "Toutes" ||
        getMainCategory(item) === selectedMainFilter;

      const subOk =
        selectedSubFilter === "Toutes" ||
        item.sub_category === selectedSubFilter;

      return mainOk && subOk;
    });

    return buildOrderedFilterList(
      pool.map((item) => item.portee || "").filter(Boolean)
    );
  }, [items, selectedMainFilter, selectedSubFilter]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const main = getMainCategory(item);

      const matchMain =
        selectedMainFilter === "Toutes" || main === selectedMainFilter;
      if (!matchMain) return false;

      const matchSub =
        selectedSubFilter === "Toutes" ||
        item.sub_category === selectedSubFilter;
      if (!matchSub) return false;

      const matchPortee =
        selectedPorteeFilter === "Toutes" ||
        item.portee === selectedPorteeFilter;
      if (!matchPortee) return false;

      if (!q) return true;

      const haystack = [
        item.title,
        item.source,
        item.category,
        item.main_category,
        item.sub_category,
        item.portee,
        item.sector,
        item.status,
        item.document_type,
        item.jurisdiction,
        item.summary,
        item.apport_title,
        item.practical_impact,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search, selectedMainFilter, selectedSubFilter, selectedPorteeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const latestVisibleDate = useMemo(() => {
    if (!filteredItems.length) return null;
    return formatDateTime(filteredItems[0].published_at);
  }, [filteredItems]);

  const freeAccessibleIds = useMemo(() => {
    return new Set(items.slice(0, FREE_FULL_ACCESS_COUNT).map((item) => item.id));
  }, [items]);

  const advancedFiltersActive =
    selectedSubFilter !== "Toutes" || selectedPorteeFilter !== "Toutes";

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMainFilter, selectedSubFilter, selectedPorteeFilter, search]);

  useEffect(() => {
    if (!mainFilters.includes(selectedMainFilter)) setSelectedMainFilter("Toutes");
  }, [mainFilters, selectedMainFilter]);

  useEffect(() => {
    if (!subFilters.includes(selectedSubFilter)) setSelectedSubFilter("Toutes");
  }, [subFilters, selectedSubFilter]);

  useEffect(() => {
    if (!porteeFilters.includes(selectedPorteeFilter)) setSelectedPorteeFilter("Toutes");
  }, [porteeFilters, selectedPorteeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erreur déconnexion :", error);
      alert("Impossible de se déconnecter.");
    }
  }

  function resetAdvancedFilters() {
    setSelectedSubFilter("Toutes");
    setSelectedPorteeFilter("Toutes");
  }

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.10),_transparent_25%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-8 text-white md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.45em] text-white/50">
                NEWSLAW
              </p>
              <p className="mt-2 text-sm text-white/40">
                Veille juridique augmentée
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isPremium && (
                <Link
                  href="/favorites"
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Mes favoris
                </Link>
              )}

              {sessionEmail ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Déconnexion
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
                >
                  Connexion
                </Link>
              )}

              {!isPremium && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-5 py-2.5 text-sm text-amber-100 transition hover:border-amber-400/30 hover:bg-amber-400/15"
                >
                  Passer au premium
                </Link>
              )}
            </div>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80">
                Beta en cours
              </div>

              <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
                Actualité juridique,
                <br className="hidden md:block" /> structurée et qualifiée.
              </h1>

              <p className="mt-8 max-w-4xl text-lg leading-[1.9] text-white/72 md:text-2xl">
                Décisions, avis, communiqués et sanctions enrichis avec matière principale,
                sous-thème, portée et apport pratique, pour aller plus vite à l’essentiel utile.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  3 dernières fiches complètes en gratuit
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Historique complet en premium
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Sources officielles reliées
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                Terminal
              </p>
              <div className="mt-5 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Sources actives</span>
                  <span className="text-white">6</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Résultats visibles</span>
                  <span className="text-white">{filteredItems.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Accès gratuit complet</span>
                  <span className="text-right text-white">
                    {FREE_FULL_ACCESS_COUNT} dernières fiches
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dernière mise à jour</span>
                  <span className="text-right text-white">
                    {latestVisibleDate || "—"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </header>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">
              Recherche
            </p>
            {search.trim() && (
              <button
                onClick={() => setSearch("")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/20 hover:bg-white/10"
              >
                Effacer
              </button>
            )}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une notion, un sous-thème, une portée, un secteur..."
            className="w-full bg-transparent px-3 py-3 text-xl text-white outline-none placeholder:text-white/30"
          />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">
              Matière principale
            </p>
            {selectedMainFilter !== "Toutes" && (
              <button
                onClick={() => setSelectedMainFilter("Toutes")}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/20 hover:bg-white/10"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {mainFilters.map((filter) => {
              const active = selectedMainFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedMainFilter(filter)}
                  className={`rounded-full border px-5 py-3 text-sm font-medium transition md:text-base ${
                    active
                      ? "border-white bg-white text-black shadow-[0_6px_20px_rgba(255,255,255,0.08)]"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/85">Filtres avancés</p>
              <p className="mt-1 text-sm text-white/45">
                Sous-thème et portée, pour affiner la sélection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {advancedFiltersActive && (
                <button
                  onClick={resetAdvancedFilters}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:bg-white/10"
                >
                  Réinitialiser
                </button>
              )}

              <button
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
              >
                {showAdvancedFilters ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
              {subFilters.length > 1 && (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/35">
                    Sous-thème
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {subFilters.map((filter) => {
                      const active = selectedSubFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setSelectedSubFilter(filter)}
                          className={`rounded-full border px-4 py-2.5 text-sm transition ${
                            active
                              ? "border-cyan-300 bg-cyan-100 text-black"
                              : "border-cyan-400/15 bg-cyan-400/10 text-cyan-100/85 hover:border-cyan-400/30 hover:bg-cyan-400/15"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {porteeFilters.length > 1 && (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/35">
                    Portée
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {porteeFilters.map((filter) => {
                      const active = selectedPorteeFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setSelectedPorteeFilter(filter)}
                          className={`rounded-full border px-4 py-2.5 text-sm transition ${
                            active
                              ? "border-amber-200 bg-amber-100 text-black"
                              : "border-amber-400/15 bg-amber-400/10 text-amber-100/85 hover:border-amber-400/30 hover:bg-amber-400/15"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 flex flex-wrap items-end justify-between gap-6 text-white/55">
          <div>
            <p className="text-xl text-white/75 md:text-2xl">
              {filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}
            </p>
            {latestVisibleDate && (
              <p className="mt-2 text-base md:text-lg">
                Dernière mise à jour visible : {latestVisibleDate}
              </p>
            )}
          </div>

          <div className="text-right text-lg text-white/65 md:text-xl">
            Page {currentPage} sur {totalPages}
          </div>
        </section>

        {loading ? (
          <section className="mt-12">
            <p className="text-white/60">Chargement...</p>
          </section>
        ) : paginatedItems.length === 0 ? (
          <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/35">
              Aucun résultat
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
              Aucun contenu ne correspond à cette recherche.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
              Essaie un autre mot-clé ou réinitialise certains filtres pour élargir la sélection.
            </p>
          </section>
        ) : (
          <section className="mt-10 grid gap-6">
            {paginatedItems.map((item, index) => {
              const mainCategory = getMainCategory(item);
              const hasFullAccess = isPremium || freeAccessibleIds.has(item.id);

              return (
                <article
                  key={item.id}
                  onClick={() => router.push(`/news/${item.id}`)}
                  className="group cursor-pointer rounded-[2rem] border border-white/10 bg-[#07101d]/85 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0a1424] md:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {item.document_type && (
                      <span className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wide ${getTypeBadgeClass(item.document_type)}`}>
                        {item.document_type}
                      </span>
                    )}

                    {item.source && (
                      <span className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wide ${getSourceBadgeClass(item.source)}`}>
                        {item.source}
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-white/65">
                      {mainCategory}
                    </span>

                    {item.portee && (
                      <span className={`rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-wide ${getPorteeBadgeClass(item.portee)}`}>
                        {item.portee}
                      </span>
                    )}

                    {item.importance === "important" && (
                      <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-amber-200">
                        Important
                      </span>
                    )}

                    {!hasFullAccess && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-amber-100">
                        Aperçu gratuit
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {item.sub_category && (
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100/90">
                        {item.sub_category}
                      </span>
                    )}

                    {item.sector && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
                        Secteur : {item.sector}
                      </span>
                    )}

                    {item.status && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
                        Statut : {item.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-start justify-between gap-5">
                    <h2 className="max-w-5xl text-2xl font-semibold leading-tight text-white md:text-4xl">
                      {item.title}
                    </h2>

                    <span className="hidden shrink-0 text-xs text-white/25 md:block">
                      #{String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {item.published_at && (
                    <p className="mt-4 text-sm text-white/45 md:text-base">
                      {formatDate(item.published_at)}
                    </p>
                  )}

                  {item.apport_title && (
                    <p className="mt-6 text-lg font-medium leading-snug text-cyan-100/95 md:text-xl">
                      {item.apport_title}
                    </p>
                  )}

                  <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                        Apport pratique
                      </p>
                      {!hasFullAccess && (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-amber-100">
                          Aperçu
                        </span>
                      )}
                    </div>

                    <p className="mt-4 max-w-5xl text-lg leading-[1.9] text-white/82 md:text-xl">
                      {hasFullAccess
                        ? item.practical_impact || item.summary || "Aucun contenu disponible."
                        : getFreeExcerpt(item.practical_impact || item.summary, 220)}
                    </p>

                    {!hasFullAccess && (
                      <div className="mt-5 rounded-[1.25rem] border border-amber-400/15 bg-amber-400/5 p-4">
                        <p className="text-sm text-white/72">
                          Débloquez l’analyse complète, tout l’historique et les outils premium.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/pricing"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 transition hover:border-amber-400/30 hover:bg-amber-400/15"
                          >
                            Passer au premium
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition group-hover:border-white/20 group-hover:bg-white/10">
                      {hasFullAccess ? "Lire la fiche complète" : "Voir l’aperçu"}
                    </span>

                    {item.tags &&
                      item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {totalPages > 1 && (
          <section className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>

            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white/75">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </section>
        )}
      </div>
    </main>
  );
}