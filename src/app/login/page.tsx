"use client";

import Link from "next/link";
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

  return url.replace(/\/+$/, "");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const redirectTo = getURL();

    console.log("REDIRECT URL =", redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Supabase auth error:", error);
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage("Lien envoyé. Vérifie ta boîte mail.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
        >
          ← Retour à l’accueil
        </Link>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#020817] p-8 md:p-10">
          <h1 className="text-3xl font-semibold">Connexion</h1>
          <p className="mt-4 text-white/70">
            Entre ton email pour recevoir un lien de connexion.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full rounded-full border border-white/15 bg-black px-6 py-4 text-white outline-none placeholder:text-white/35 focus:border-white/30"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-white/15 px-6 py-3 text-white transition hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Recevoir le lien"}
            </button>
          </form>

          {message && (
            <p className="mt-6 text-sm text-white/75">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}