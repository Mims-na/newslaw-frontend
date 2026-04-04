"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000";

  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  if (!url.endsWith("/")) {
    url = `${url}/`;
  }

  return url;
}

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

export default function LoginPage() {
  const [pageMode, setPageMode] = useState<"login" | "signup">("login");
  const [loginMode, setLoginMode] = useState<"password" | "magic">("password");

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

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getURL(),
      },
    });

    if (error) {
      console.error(error);
      setMessage("Impossible d’envoyer le lien de connexion.");
    } else {
      setMessage("Lien envoyé. Vérifie ta boîte mail.");
    }

    setLoading(false);
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
        emailRedirectTo: getURL(),
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

    setMessage(
      "Compte créé. Vérifie ton email si une confirmation est demandée."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#07101d]/85 p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
          Compte
        </p>

        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          {pageMode === "login" ? "Accéder à Newslaw" : "Créer un compte"}
        </h1>

        <p className="mt-4 text-white/65">
          {pageMode === "login"
            ? "Connecte-toi par mot de passe ou par lien email."
            : "Crée un compte et indique ton profil pour mieux comprendre les utilisateurs du service."}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              setPageMode("login");
              setMessage(null);
            }}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${
              pageMode === "login"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            Connexion
          </button>

          <button
            onClick={() => {
              setPageMode("signup");
              setMessage(null);
            }}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${
              pageMode === "signup"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            Inscription
          </button>
        </div>

        {pageMode === "login" ? (
          <>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setLoginMode("password")}
                className={`rounded-full border px-5 py-2.5 text-sm transition ${
                  loginMode === "password"
                    ? "border-cyan-300 bg-cyan-100 text-black"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                Mot de passe
              </button>

              <button
                onClick={() => setLoginMode("magic")}
                className={`rounded-full border px-5 py-2.5 text-sm transition ${
                  loginMode === "magic"
                    ? "border-cyan-300 bg-cyan-100 text-black"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                Lien email
              </button>
            </div>

            <form
              onSubmit={
                loginMode === "password"
                  ? handlePasswordLogin
                  : handleMagicLink
              }
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm text-white/75">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="vous@exemple.com"
                />
              </div>

              {loginMode === "password" && (
                <div>
                  <label className="mb-2 block text-sm text-white/75">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    placeholder="Votre mot de passe"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/15 disabled:opacity-50"
              >
                {loading
                  ? "Chargement..."
                  : loginMode === "password"
                  ? "Se connecter"
                  : "Recevoir le lien"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/75">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/75">
                Mot de passe
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="Choisis un mot de passe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/75">
                Niveau / statut
              </label>
              <select
                value={userLevel}
                onChange={(e) => setUserLevel(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              >
                <option value="" className="bg-[#0b1220]">
                  Sélectionner
                </option>
                <option value="M1" className="bg-[#0b1220]">M1</option>
                <option value="M2" className="bg-[#0b1220]">M2</option>
                <option value="Élève-avocat" className="bg-[#0b1220]">
                  Élève-avocat
                </option>
                <option value="Avocat" className="bg-[#0b1220]">Avocat</option>
                <option value="Juriste" className="bg-[#0b1220]">Juriste</option>
                <option value="Autre" className="bg-[#0b1220]">Autre</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/75">Lieu</label>
              <input
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                placeholder="Paris, Lyon, Bruxelles..."
              />
            </div>

            <div>
              <label className="mb-3 block text-sm text-white/75">
                Matières d’intérêt
              </label>
              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = interests.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-cyan-300 bg-cyan-100 text-black"
                          : "border-white/10 bg-white/5 text-white"
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
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/15 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        )}

        {message && <p className="mt-6 text-sm text-white/75">{message}</p>}
      </div>
    </main>
  );
}