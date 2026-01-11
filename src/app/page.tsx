import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-eric-green mb-4">
          Typen met Eric
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Ontdek de magie, letter voor letter
        </p>

        <div className="bg-white/80 rounded-2xl p-8 shadow-lg border-2 border-eric-gold">
          <div className="text-6xl mb-4">🐉</div>
          <p className="text-lg text-gray-600 mb-6">
            Welkom in de magische wereld van Lettoria! Samen met Eric de draak
            ga je op avontuur en leer je typen.
          </p>
          <Link
            href="/oefenen"
            className="inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-md"
          >
            Start je avontuur
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Voor kinderen van 8-12 jaar
        </p>
      </div>
    </main>
  );
}
