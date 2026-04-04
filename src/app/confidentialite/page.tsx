import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Données personnelles
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
              Politique de confidentialité
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
            <h2 className="text-xl font-semibold">Responsable du traitement</h2>
            <p className="mt-4 leading-8 text-white/75">
              Le responsable du traitement des données collectées sur Newslaw est : <strong>À compléter</strong>.
              Pour toute question relative aux données personnelles : <strong>À compléter</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Données collectées</h2>
            <p className="mt-4 leading-8 text-white/75">
              Newslaw peut collecter, selon votre usage du site, des données telles que :
              adresse email, informations liées au compte utilisateur, plan d’accès, rôle,
              favoris, ainsi que certaines informations volontairement fournies lors de l’inscription
              ou de l’utilisation du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Finalités</h2>
            <ul className="mt-4 space-y-2 text-white/75">
              <li>• gestion des comptes utilisateurs ;</li>
              <li>• authentification et sécurité ;</li>
              <li>• gestion des accès free / premium ;</li>
              <li>• gestion des favoris et préférences ;</li>
              <li>• amélioration du service et suivi technique.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Bases légales</h2>
            <p className="mt-4 leading-8 text-white/75">
              Les traitements sont fondés, selon les cas, sur l’exécution du service demandé,
              l’intérêt légitime de l’éditeur à sécuriser et améliorer la plateforme, ou, lorsque cela
              est nécessaire, sur votre consentement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Destinataires</h2>
            <p className="mt-4 leading-8 text-white/75">
              Les données sont accessibles aux personnes habilitées au sein du projet Newslaw
              et à certains prestataires techniques intervenant dans le fonctionnement du service,
              notamment l’hébergement et l’authentification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Durée de conservation</h2>
            <p className="mt-4 leading-8 text-white/75">
              Les données sont conservées pendant la durée nécessaire au fonctionnement du service,
              puis archivées ou supprimées selon leur nature et les obligations applicables.
              <strong> À préciser plus finement ensuite</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Vos droits</h2>
            <p className="mt-4 leading-8 text-white/75">
              Vous disposez notamment d’un droit d’accès, de rectification, d’effacement,
              de limitation, d’opposition et, le cas échéant, d’un droit à la portabilité.
              Vous pouvez exercer vos droits à l’adresse suivante : <strong>À compléter</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Réclamation</h2>
            <p className="mt-4 leading-8 text-white/75">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire
              une réclamation auprès de la CNIL.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}