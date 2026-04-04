"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const INTEREST_OPTIONS = [
  "Droit public des affaires",
  "Régulation et numérique",
  "PI / numérique",
  "IA / plateformes",
  "LCB-FT / conformité",
  "AMF et marchés financiers",
  "Droit bancaire",
  "Droit des sociétés",
  "Droit de la consommation",
  "Énergie",
];

const USER_LEVEL_OPTIONS = [
  "M1",
  "M2",
  "Élève-avocat",
  "Avocat",
  "Juriste",
  "Autre",
];

export default function LoginPage() {
  const [pageMode, setPageMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [userLevel, setUserLevel] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      setMessage("Email ou mot de passe incorrect.");
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error, data } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          user_level: userLevel || null,
          user_location: userLocation || null,
          interests,
        },
      },
    });

    if (error) {
      console.error(error);
      setMessage("Impossible de créer le compte.");
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/";
      return;
    }

    setMessage("Compte créé. Tu peux maintenant te connecter avec ton mot de passe.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.11),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.10),_transparent_25%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-8 text-white md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/20 hover:bg-white/10"
          >
            ← Retour au site
          </Link>

          <p className="hidden text-xs uppercase tracking-[0.35em] text-white/35 md:block">
            Newslaw
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Compte
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-tight text-white md:text-7xl">
              {pageMode === "login" ? "Accéder à Newslaw" : "Créer un compte"}
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/72 md:text-xl">
              {pageMode === "login"
                ? "Connecte-toi pour accéder à la veille complète, gérer tes favoris et utiliser le produit de manière continue."
                : "Crée un compte pour rejoindre la beta, personnaliser ton profil et nous aider à mieux comprendre les usages du service."}
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Lecture rapide</p>
                <p className="mt-2 text-sm leading-7 text-white/58">
                  Une veille juridique structurée, pensée pour aller plus vite à
                  l’essentiel utile.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Usage premium</p>
                <p className="mt-2 text-sm leading-7 text-white/58">
                  Accès complet aux fiches, historique intégral, favoris et
                  expérience de lecture sans coupure.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Beta en cours</p>
                <p className="mt-2 text-sm leading-7 text-white/58">
                  La version actuelle continue d’évoluer avec les premiers
                  retours utilisateurs.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#07101d]/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm md:p-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setPageMode("login");
                  setMessage(null);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  pageMode === "login"
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/85 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                Connexion
              </button>

              <button
                onClick={() => {
                  setPageMode("signup");
                  setMessage(null);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  pageMode === "signup"
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/85 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                Inscription
              </button>
            </div>

            {pageMode === "login" ? (
              <form onSubmit={handlePasswordLogin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-white/72">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                    placeholder="vous@exemple.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/72">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                    placeholder="Votre mot de passe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-400/30 hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {loading ? "Chargement..." : "Se connecter"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-white/72">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                      placeholder="vous@exemple.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-white/72">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                      placeholder="Choisis un mot de passe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm text-white/72">
                      Niveau / statut
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {USER_LEVEL_OPTIONS.map((level) => {
                        const active = userLevel === level;

                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setUserLevel(level)}
                            className={`rounded-full border px-3.5 py-2 text-sm transition ${
                              active
                                ? "border-cyan-300 bg-cyan-100 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                                : "border-white/10 bg-white/5 text-white/82 hover:border-white/20 hover:bg-white/10"
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-white/72">
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => setUserLocation(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-white/[0.07]"
                      placeholder="Paris, Lyon, Bruxelles..."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm text-white/72">
                    Matières d’intérêt
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const active = interests.includes(interest);

                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-3.5 py-2 text-sm transition ${
                            active
                              ? "border-cyan-300 bg-cyan-100 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                              : "border-white/10 bg-white/5 text-white/82 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-medium text-cyan-50 transition hover:border-cyan-400/30 hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </form>
            )}

            {message && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                {message}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}