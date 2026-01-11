import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-eric-green mb-2">
          Typen met Eric
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          Ontdek de magie, letter voor letter
        </p>

        <div className="bg-white/90 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-eric-gold">
          {/* Eric Image */}
          <div className="mb-4">
            <Image
              src="/images/eric/eric-happy.png"
              alt="Eric de draak"
              width={150}
              height={150}
              className="mx-auto"
              priority
            />
          </div>

          <p className="text-base md:text-lg text-gray-600 mb-6">
            Welkom in de magische wereld van <strong className="text-lettoria-kasteel">Lettoria</strong>!
            Samen met Eric de draak ga je op avontuur en leer je typen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kaart"
              className="inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-md"
            >
              🗺️ Start je avontuur
            </Link>
            <Link
              href="/oefenen"
              className="inline-block bg-white hover:bg-gray-50 text-eric-green font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-md border-2 border-eric-green"
            >
              ⌨️ Snel oefenen
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xs text-gray-600">Verhalen</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-xs text-gray-600">Spelletjes</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs text-gray-600">Beloningen</div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Voor kinderen van 8-12 jaar
        </p>
      </div>
    </main>
  );
}
