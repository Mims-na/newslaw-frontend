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

export default function LoginPage() {
  const [mode, setMode] = useState<"magic" | "password">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#07101d]/85 p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
          Connexion
        </p>

        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          Accéder à Newslaw
        </h1>

        <p className="mt-4 text-white/65">
          Connecte-toi par mot de passe ou par lien email.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setMode("password")}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${
              mode === "password"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            Mot de passe
          </button>

          <button
            onClick={() => setMode("magic")}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${
              mode === "magic"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            Lien email
          </button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
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

          {mode === "password" && (
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
              ? "Connexion..."
              : mode === "password"
              ? "Se connecter"
              : "Recevoir le lien"}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-sm text-white/75">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}