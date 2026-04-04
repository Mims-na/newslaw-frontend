import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Informations légales
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
              Mentions légales
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Retour au site
          </Link>
        </div>

        <div className="mt-10 space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <section>
            <h2 className="text-xl font-semibold">Éditeur du site</h2>
            <div className="mt-4 space-y-2 text-white/75">
              <p><strong>Nom / projet :</strong> Newslaw</p>
              <p><strong>Responsable de publication :</strong> À compléter</p>
              <p><strong>Email de contact :</strong> À compléter</p>
              <p><strong>Statut :</strong> À compléter</p>
              <p><strong>Adresse :</strong> À compléter</p>
              <p><strong>SIREN / SIRET :</strong> À compléter si applicable</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Hébergement</h2>
            <div className="mt-4 space-y-2 text-white/75">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Site :</strong> vercel.com</p>
              <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Objet du site</h2>
            <p className="mt-4 leading-8 text-white/75">
              Newslaw propose une veille juridique structurée à partir de sources
              publiques, avec des fiches de synthèse, des catégories, des sous-thèmes
              et des apports pratiques destinés à faciliter la lecture de l’actualité juridique.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
            <p className="mt-4 leading-8 text-white/75">
              La structure du site, son design, ses éléments graphiques, ses textes originaux
              et ses développements sont protégés. Les sources officielles restent la référence
              pour les textes et décisions cités. Toute reproduction non autorisée des contenus
              propres à Newslaw peut engager la responsabilité de son auteur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Responsabilité</h2>
            <p className="mt-4 leading-8 text-white/75">
              Les contenus publiés sur Newslaw ont une vocation informative et ne constituent
              pas un conseil juridique individualisé. Malgré le soin apporté à la sélection et à
              la présentation des informations, l’éditeur ne peut garantir l’absence totale
              d’erreurs, d’omissions ou d’imprécisions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}