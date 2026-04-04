"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserProfileRow = {
  id: string;
  email: string | null;
  subscription_plan: "free" | "premium";
  role: "user" | "expert" | "admin";
  created_at: string;
  user_level: string | null;
  user_location: string | null;
  interests: string[] | null;
  last_login_at: string | null;
  last_seen_at: string | null;
  favorites_count: number;
  last_view_at: string | null;
  total_views: number;
};

type IngestionRunRow = {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "partial_failure" | "failed";
  app_env: string | null;
  total_sources: number;
  successful_sources: number;
  failed_sources: number;
};

type IngestionLogRow = {
  id: number;
  run_id: number;
  source_name: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "failed";
  inserted_count: number | null;
  rejected_count: number | null;
  error_message: string | null;
};

type CurrentProfile = {
  subscription_plan: "free" | "premium";
  role: "user" | "expert" | "admin";
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRunBadgeClass(status: string) {
  if (status === "success") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (status === "partial_failure") return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  if (status === "failed") return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [runs, setRuns] = useState<IngestionRunRow[]>([]);
  const [logs, setLogs] = useState<IngestionLogRow[]>([]);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  async function loadAdminData() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      setIsAllowed(false);
      setLoading(false);
      return;
    }

    setCurrentAdminId(session.user.id);

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_plan, role")
      .eq("id", session.user.id)
      .single();

    if (
      profileError ||
      !currentProfile ||
      (currentProfile as CurrentProfile).role !== "admin"
    ) {
      setIsAllowed(false);
      setLoading(false);
      return;
    }

    setIsAllowed(true);

    const [usersRes, runsRes, logsRes] = await Promise.all([
      supabase
        .from("admin_user_stats")
        .select(
          "id, email, subscription_plan, role, created_at, user_level, user_location, interests, last_login_at, last_seen_at, favorites_count, last_view_at, total_views"
        )
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("ingestion_runs")
        .select(
          "id, started_at, finished_at, status, app_env, total_sources, successful_sources, failed_sources"
        )
        .order("id", { ascending: false })
        .limit(20),
      supabase
        .from("ingestion_logs")
        .select(
          "id, run_id, source_name, started_at, finished_at, status, inserted_count, rejected_count, error_message"
        )
        .order("id", { ascending: false })
        .limit(50),
    ]);

    setUsers((usersRes.data as UserProfileRow[]) || []);
    setRuns((runsRes.data as IngestionRunRow[]) || []);
    setLogs((logsRes.data as IngestionLogRow[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function updateUser(
    userId: string,
    field: "subscription_plan" | "role",
    value: string
  ) {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) return;

    const isSelf = userId === currentAdminId;

    if (
      field === "role" &&
      targetUser.role === "admin" &&
      value !== "admin"
    ) {
      if (adminCount <= 1) {
        alert("Impossible de retirer le dernier administrateur.");
        return;
      }

      if (isSelf) {
        alert("Tu ne peux pas te retirer toi-même le rôle admin depuis cette interface.");
        return;
      }
    }

    setSavingUserId(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", userId);

    if (error) {
      console.error("Erreur mise à jour user :", error);
      alert("Impossible de mettre à jour cet utilisateur.");
    } else {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? ({ ...user, [field]: value } as UserProfileRow) : user
        )
      );
    }

    setSavingUserId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-white/60">Chargement admin...</p>
        </div>
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Retour à l’accueil
          </Link>

          <div className="mt-8 rounded-[2rem] border border-rose-400/15 bg-rose-400/5 p-8">
            <h1 className="text-3xl font-semibold">Accès refusé</h1>
            <p className="mt-4 text-white/75">
              Cette page est réservée aux comptes administrateur.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
              Pilotage minimal
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Retour au site
          </Link>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm uppercase tracking-[0.28em] text-white/35">
                Utilisateurs
              </p>
              <button
                onClick={loadAdminData}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/75 transition hover:border-white/20 hover:bg-white/10"
              >
                Actualiser
              </button>
            </div>

            <p className="mt-3 text-xs text-white/45">
              Admins actifs : {adminCount}
            </p>

            <div className="mt-5 space-y-3">
              {users.map((user) => {
                const isCurrentAdmin = user.id === currentAdminId;
                const isSaving = savingUserId === user.id;
                const disableAdminDemotion =
                  user.role === "admin" &&
                  (isCurrentAdmin || adminCount <= 1);

                return (
                  <div
                    key={user.id}
                    className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white">
                          {user.email || "Email indisponible"}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          Créé le {formatDateTime(user.created_at)}
                        </p>
                      </div>

                      {isCurrentAdmin && (
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                          toi
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.user_level && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                          Niveau : {user.user_level}
                        </span>
                      )}

                      {user.user_location && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                          Lieu : {user.user_location}
                        </span>
                      )}
                    </div>

                    {user.interests && user.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.interests.map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100/90"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                        Dernière connexion : {formatShortDateTime(user.last_login_at)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                        Dernière activité : {formatShortDateTime(user.last_seen_at)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                        Dernière fiche vue : {formatShortDateTime(user.last_view_at)}
                      </span>

                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100/90">
                        Favoris : {user.favorites_count ?? 0}
                      </span>

                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100/90">
                        Vues : {user.total_views ?? 0}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/35">
                          Plan
                        </label>
                        <select
                          value={user.subscription_plan}
                          disabled={isSaving}
                          onChange={(e) =>
                            updateUser(user.id, "subscription_plan", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        >
                          <option value="free" className="bg-[#0b1220]">
                            free
                          </option>
                          <option value="premium" className="bg-[#0b1220]">
                            premium
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/35">
                          Rôle
                        </label>
                        <select
                          value={user.role}
                          disabled={isSaving}
                          onChange={(e) => updateUser(user.id, "role", e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        >
                          <option value="user" className="bg-[#0b1220]">
                            user
                          </option>
                          <option value="expert" className="bg-[#0b1220]">
                            expert
                          </option>
                          <option value="admin" className="bg-[#0b1220]">
                            admin
                          </option>
                        </select>
                      </div>
                    </div>

                    {disableAdminDemotion && (
                      <p className="mt-3 text-xs text-amber-200/80">
                        Ce compte admin ne peut pas être rétrogradé depuis cette interface.
                      </p>
                    )}
                  </div>
                );
              })}

              {users.length === 0 && (
                <p className="text-sm text-white/55">
                  Aucun utilisateur trouvé.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Runs d’ingestion
            </p>

            <div className="mt-5 space-y-3">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">Run #{run.id}</p>
                      <p className="mt-1 text-xs text-white/45">
                        Début : {formatDateTime(run.started_at)} · Fin :{" "}
                        {formatDateTime(run.finished_at)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${getRunBadgeClass(
                        run.status
                      )}`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/65">
                    <span>env: {run.app_env || "—"}</span>
                    <span>sources: {run.total_sources}</span>
                    <span>ok: {run.successful_sources}</span>
                    <span>ko: {run.failed_sources}</span>
                  </div>
                </div>
              ))}

              {runs.length === 0 && (
                <p className="text-sm text-white/55">Aucun run trouvé.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">
            Derniers logs source
          </p>

          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">
                      {log.source_name} · run #{log.run_id}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Début : {formatDateTime(log.started_at)} · Fin :{" "}
                      {formatDateTime(log.finished_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${getRunBadgeClass(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/65">
                  <span>insérés: {log.inserted_count ?? "—"}</span>
                  <span>rejetés: {log.rejected_count ?? "—"}</span>
                  {log.error_message && (
                    <span className="text-rose-200">
                      erreur: {log.error_message}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <p className="text-sm text-white/55">Aucun log trouvé.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}