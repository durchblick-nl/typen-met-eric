import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-perkament to-white py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-eric-gold/20 text-eric-green font-semibold px-4 py-1 rounded-full text-sm mb-4">
            100% Gratis - Geen registratie nodig
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-eric-green mb-4">
            Lettoria
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Gratis typecursus voor kinderen
          </p>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Leer je kind blind typen met 10 vingers in de magische wereld van Lettoria.
            Spelenderwijs leren, samen met Eric de draak.
          </p>

          {/* Eric Image */}
          <div className="mb-8">
            <Image
              src="/images/eric/eric-happy.png"
              alt="Eric de draak - je gids in Lettoria"
              width={180}
              height={180}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/kaart"
              className="inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              Start gratis met typen
            </Link>
            <Link
              href="/over"
              className="inline-block bg-white hover:bg-gray-50 text-eric-green font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-md border-2 border-eric-green"
            >
              Meer informatie
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-eric-green">✓</span> Geen kosten
            </div>
            <div className="flex items-center gap-2">
              <span className="text-eric-green">✓</span> Geen account nodig
            </div>
            <div className="flex items-center gap-2">
              <span className="text-eric-green">✓</span> Geen data opslag
            </div>
          </div>
        </div>
      </section>

      {/* Why Lettoria Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            Waarom Lettoria?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-perkament rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">100% Gratis</h3>
              <p className="text-gray-600 text-sm">
                Andere typecursussen kosten €150 of meer. Lettoria is en blijft gratis.
              </p>
            </div>

            <div className="bg-perkament rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Privacy-vriendelijk</h3>
              <p className="text-gray-600 text-sm">
                Geen registratie, geen e-mail, geen persoonlijke gegevens. Voortgang blijft lokaal op je eigen apparaat.
              </p>
            </div>

            <div className="bg-perkament rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Spelenderwijs leren</h3>
              <p className="text-gray-600 text-sm">
                Een magisch avontuur met verhalen, beloningen en Eric de draak als persoonlijke gids.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-white to-perkament">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            Voordelen van blind typen
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="bg-eric-green/10 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">⏱️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Meer tijd bij toetsen</h3>
                <p className="text-gray-600 text-sm">
                  Sneller typen betekent meer tijd om na te denken bij schooltoetsen en opdrachten.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-eric-green/10 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Betere concentratie</h3>
                <p className="text-gray-600 text-sm">
                  Focus op de inhoud, niet op het zoeken naar letters. Betere teksten, minder fouten.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-eric-green/10 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Taalvaardigheid</h3>
                <p className="text-gray-600 text-sm">
                  Regelmatig typen verbetert spelling en woordenschat op een natuurlijke manier.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-eric-green/10 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Vaardigheid voor het leven</h3>
                <p className="text-gray-600 text-sm">
                  Blind typen is een vaardigheid waar je kind de rest van zijn leven profijt van heeft.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-perkament">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            Hoe werkt het?
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-md text-eric-green font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Open Lettoria</h3>
              <p className="text-gray-600 text-sm">Geen account nodig, direct beginnen</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-md text-eric-green font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Ontdek de kaart</h3>
              <p className="text-gray-600 text-sm">7 regio&apos;s met elk eigen lessen</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-md text-eric-green font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Volg de verhalen</h3>
              <p className="text-gray-600 text-sm">Leer nieuwe letters met Eric</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-md text-eric-green font-bold">
                4
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Word een meester!</h3>
              <p className="text-gray-600 text-sm">23 lessen naar blind typen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target audience */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Voor kinderen van 8-12 jaar
          </h2>
          <p className="text-gray-600 mb-8">
            Vanaf ongeveer 8 jaar zijn de motoriek en concentratie voldoende ontwikkeld om blind te leren typen.
            Lettoria is speciaal ontworpen voor kinderen op de basisschool.
          </p>

          <Link
            href="/kaart"
            className="inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
          >
            Begin nu - het is gratis!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-100 border-t">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/over" className="hover:text-eric-green transition-colors">
              Over Lettoria
            </Link>
            <Link href="/kaart" className="hover:text-eric-green transition-colors">
              Wereldkaart
            </Link>
            <Link href="/oefenen" className="hover:text-eric-green transition-colors">
              Snel oefenen
            </Link>
          </div>
          <p className="text-gray-500">
            Lettoria - Gratis typecursus voor kinderen
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Gemaakt met ❤️ voor alle kinderen die willen leren typen
          </p>
        </div>
      </footer>
    </main>
  );
}
