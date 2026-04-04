import Link from "next/link";

const freeFeatures = [
  "Accès aux 3 dernières fiches en intégralité",
  "Aperçu des autres analyses",
  "Navigation par matière",
  "Découverte du produit et de la méthode",
];

const premiumFeatures = [
  "Accès complet à toutes les fiches",
  "Historique intégral",
  "Apports pratiques non tronqués",
  "Favoris",
  "Lecture continue sans friction",
  "Fonctionnalités avancées à venir",
];

const useCases = [
  {
    title: "Collaborateurs et avocats",
    text: "Aller vite sur l’essentiel d’une actualité utile, sans repartir systématiquement de la source brute.",
  },
  {
    title: "Juristes d’entreprise",
    text: "Repérer rapidement ce qui peut avoir un effet pratique sur l’activité, les contrats ou la conformité.",
  },
  {
    title: "Étudiants avancés et élèves-avocats",
    text: "Suivre l’actualité juridique avec une lecture plus structurée et plus directement exploitable.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#02040a] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.10),_transparent_25%),linear-gradient(to_bottom,_#030712,_#02040a)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Premium
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              Accéder à toute la veille, sans coupure.
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Retour au site
          </Link>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/55">
              Ce qu’est Newslaw
            </p>

            <p className="mt-5 max-w-3xl text-xl leading-[1.9] text-white/82 md:text-2xl">
              Newslaw transforme l’actualité juridique en fiches lisibles,
              structurées et directement exploitables, avec un angle simple :
              faire gagner du temps sur ce qui compte vraiment.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Sélection</p>
                <p className="mt-2 text-sm leading-7 text-white/60">
                  Les sources sont triées pour faire remonter l’actualité utile.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Structure</p>
                <p className="mt-2 text-sm leading-7 text-white/60">
                  Matière, sous-thème, portée, statut et apport pratique.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Gain de temps</p>
                <p className="mt-2 text-sm leading-7 text-white/60">
                  Lire plus vite, comprendre plus vite, décider plus vite.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-400/15 bg-amber-400/5 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/65">
              Pourquoi passer premium
            </p>

            <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
              Débloquer toute la profondeur du produit.
            </h2>

            <p className="mt-4 text-base leading-8 text-white/72">
              Le gratuit permet de comprendre la logique du site. Le premium
              donne l’accès continu à toutes les analyses, à tout l’historique et
              à un usage réellement confortable.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm text-amber-100 transition hover:border-amber-400/30 hover:bg-amber-400/15"
              >
                Se connecter
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/45">
              La souscription en ligne sera branchée prochainement.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-white/35">
              Version gratuite
            </p>

            <ul className="mt-6 space-y-4">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white/78"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/55">
              Version premium
            </p>

            <ul className="mt-6 space-y-4">
              {premiumFeatures.map((feature) => (
                <li
                  key={feature}
                  className="rounded-[1.25rem] border border-cyan-400/15 bg-black/20 px-4 py-3 text-white/88"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">
            Pour qui
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
              >
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-white/35">
            Ce que débloque vraiment le premium
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-base font-medium text-white">
                Lecture continue
              </p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Plus de coupure au milieu d’un apport. Tu peux suivre la veille
                de manière fluide et exploitable.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-base font-medium text-white">
                Historique complet
              </p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Tu ne dépends plus seulement des dernières fiches visibles. Tu
                peux revenir sur l’ensemble du stock publié.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-base font-medium text-white">
                Gain de temps réel
              </p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Le premium donne la vraie valeur du produit : accéder
                immédiatement à l’essentiel utile sans repartir de zéro.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-base font-medium text-white">
                Usage régulier
              </p>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Favoris, consultation complète, futur enrichissement : le
                premium prépare un usage durable, pas seulement un test.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-400/15 bg-amber-400/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-100/65">
            Beta
          </p>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Une veille juridique plus rapide, plus lisible, plus exploitable.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-white/72">
            La version actuelle est une beta en construction. Le premium est
            déjà pensé pour débloquer l’usage complet du produit, et
            l’abonnement sera branché dans la suite du développement.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Revenir à l’accueil
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm text-amber-100 transition hover:border-amber-400/30 hover:bg-amber-400/15"
            >
              Accéder à mon compte
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}