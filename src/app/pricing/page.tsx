export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold md:text-6xl">Premium</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
          Accédez à l’analyse complète de toutes les fiches, à tout l’historique
          et aux fonctionnalités avancées de veille.
        </p>

        <div className="mt-10 rounded-[2rem] border border-amber-400/15 bg-amber-400/5 p-8">
          <h2 className="text-2xl font-medium">Ce que débloque le premium</h2>
          <ul className="mt-6 space-y-3 text-white/80">
            <li>Accès complet à toutes les fiches</li>
            <li>Accès à tout l’historique</li>
            <li>Apports pratiques non tronqués</li>
            <li>Favoris</li>
            <li>Fonctionnalités avancées à venir</li>
          </ul>

          <p className="mt-8 text-sm text-white/50">
            La souscription sera branchée bientôt.
          </p>
        </div>
      </div>
    </main>
  );
}