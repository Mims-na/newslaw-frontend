import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Traceurs
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
              Politique cookies
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
            <h2 className="text-xl font-semibold">Utilisation des cookies</h2>
            <p className="mt-4 leading-8 text-white/75">
              Newslaw peut utiliser des cookies ou traceurs techniques nécessaires
              au bon fonctionnement du site, notamment pour l’authentification,
              la sécurité et le maintien de session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Cookies strictement nécessaires</h2>
            <p className="mt-4 leading-8 text-white/75">
              Certains traceurs sont indispensables au fonctionnement du service
              demandé par l’utilisateur. Ils ne nécessitent pas, en principe,
              de consentement préalable lorsqu’ils sont strictement nécessaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Cookies non essentiels</h2>
            <p className="mt-4 leading-8 text-white/75">
              Si des traceurs de mesure d’audience, de personnalisation avancée
              ou d’autres cookies non strictement nécessaires sont ajoutés à l’avenir,
              Newslaw mettra à jour cette page et, si nécessaire, recueillera votre
              consentement avant leur dépôt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Gestion des préférences</h2>
            <p className="mt-4 leading-8 text-white/75">
              Vous pouvez configurer votre navigateur pour limiter ou bloquer certains cookies.
              Toutefois, le blocage de traceurs techniques nécessaires peut dégrader le
              fonctionnement du site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}