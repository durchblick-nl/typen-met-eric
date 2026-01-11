import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Over Lettoria',
  description:
    'Lettoria is een gratis typecursus voor kinderen van 8-12 jaar. Geen registratie, geen kosten, geen data opslag. Leer blind typen met 10 vingers.',
};

export default function OverPage() {
  return (
    <main className="min-h-screen bg-perkament">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-eric-green hover:text-eric-green/80 transition-colors">
            &larr; Terug naar home
          </Link>
          <Link
            href="/kaart"
            className="bg-eric-green hover:bg-eric-green/90 text-white font-bold py-2 px-6 rounded-full text-sm transition-all"
          >
            Start met typen
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-eric-green mb-4">Over Lettoria</h1>
          <p className="text-lg text-gray-700">
            De gratis typecursus voor kinderen die écht werkt.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* What is Lettoria */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <Image
                src="/images/eric/eric-happy.png"
                alt="Eric de draak"
                width={80}
                height={80}
                className="flex-shrink-0"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Wat is Lettoria?</h2>
                <p className="text-gray-600 mb-3">
                  Lettoria is een online typecursus speciaal gemaakt voor kinderen van 8-12 jaar. In de
                  magische wereld van Lettoria leert je kind blind typen met 10 vingers, begeleid door
                  Eric de draak.
                </p>
                <p className="text-gray-600">
                  Door middel van verhalen, spelletjes en beloningen blijft je kind gemotiveerd om te
                  oefenen. Elke les brengt nieuwe letters en nieuwe avonturen!
                </p>
              </div>
            </div>
          </div>

          {/* 100% Free */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">💰</span> 100% Gratis
            </h2>
            <p className="text-gray-600 mb-4">
              Andere typecursussen voor kinderen kosten al snel <strong>€150 tot €180</strong>. Dat
              vinden wij te veel. Elk kind verdient de kans om te leren typen, ongeacht het budget van
              de ouders.
            </p>
            <p className="text-gray-600 mb-4">
              Daarom is Lettoria <strong>volledig gratis</strong>. Geen verborgen kosten, geen
              premium versie, geen abonnement. Gewoon gratis typen leren.
            </p>
            <div className="bg-eric-green/10 rounded-xl p-4">
              <p className="text-eric-green font-semibold text-sm">
                Lettoria is en blijft gratis. Voor altijd.
              </p>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🔒</span> Privacy & Veiligheid
            </h2>
            <p className="text-gray-600 mb-4">
              We begrijpen dat privacy belangrijk is, vooral als het om kinderen gaat. Daarom hebben
              we Lettoria zo gebouwd dat er <strong>geen persoonlijke gegevens</strong> nodig zijn.
            </p>

            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-3">
                <span className="text-eric-green font-bold">✓</span>
                <span className="text-gray-600">
                  <strong>Geen registratie</strong> - Je hoeft geen account aan te maken
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-eric-green font-bold">✓</span>
                <span className="text-gray-600">
                  <strong>Geen e-mailadres</strong> - We vragen nergens om contactgegevens
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-eric-green font-bold">✓</span>
                <span className="text-gray-600">
                  <strong>Geen naam</strong> - Je kind kan direct beginnen, anoniem
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-eric-green font-bold">✓</span>
                <span className="text-gray-600">
                  <strong>Lokale opslag</strong> - Voortgang wordt alleen op dit apparaat bewaard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-eric-green font-bold">✓</span>
                <span className="text-gray-600">
                  <strong>Geen tracking</strong> - We volgen je kind niet over het internet
                </span>
              </li>
            </ul>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                <strong>Let op:</strong> Omdat voortgang lokaal wordt opgeslagen, is deze gekoppeld
                aan de browser en het apparaat. Als je kind op een ander apparaat verder wil, begint
                de voortgang opnieuw.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">📖</span> Hoe werkt het?
            </h2>
            <p className="text-gray-600 mb-4">
              Lettoria bestaat uit 7 regio&apos;s die je kind stap voor stap ontdekt. Elke regio heeft
              meerdere lessen met een eigen verhaal.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-eric-green pl-4">
                <h3 className="font-bold text-gray-800">Eric&apos;s Grot</h3>
                <p className="text-gray-600 text-sm">Kennismaking met Eric en de basishouding</p>
              </div>
              <div className="border-l-4 border-lettoria-dorp pl-4">
                <h3 className="font-bold text-gray-800">Het Startdorp</h3>
                <p className="text-gray-600 text-sm">De thuisrij: A S D F J K L ;</p>
              </div>
              <div className="border-l-4 border-lettoria-velden pl-4">
                <h3 className="font-bold text-gray-800">De Velden</h3>
                <p className="text-gray-600 text-sm">De bovenste rij: Q W E R T Y U I O P</p>
              </div>
              <div className="border-l-4 border-lettoria-woud pl-4">
                <h3 className="font-bold text-gray-800">Het Fluisterwoud</h3>
                <p className="text-gray-600 text-sm">De onderste rij: Z X C V B N M</p>
              </div>
              <div className="border-l-4 border-lettoria-toppen pl-4">
                <h3 className="font-bold text-gray-800">De Toppen</h3>
                <p className="text-gray-600 text-sm">Cijfers: 1 2 3 4 5 6 7 8 9 0</p>
              </div>
              <div className="border-l-4 border-lettoria-zee pl-4">
                <h3 className="font-bold text-gray-800">De Zee</h3>
                <p className="text-gray-600 text-sm">Snelheidsoefeningen en woordspelletjes</p>
              </div>
              <div className="border-l-4 border-lettoria-kasteel pl-4">
                <h3 className="font-bold text-gray-800">Kasteel Compleet</h3>
                <p className="text-gray-600 text-sm">De ultieme meesterschapstest</p>
              </div>
            </div>
          </div>

          {/* Why touch typing */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Waarom blind typen?
            </h2>
            <p className="text-gray-600 mb-4">
              Blind typen met 10 vingers is een vaardigheid die je kind de rest van zijn leven zal
              gebruiken. De voordelen zijn groot:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-perkament rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-1">Meer tijd bij toetsen</h3>
                <p className="text-gray-600 text-sm">
                  Sneller typen = meer tijd om na te denken bij schooltoetsen.
                </p>
              </div>
              <div className="bg-perkament rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-1">Betere concentratie</h3>
                <p className="text-gray-600 text-sm">
                  Ogen op het scherm, focus op de inhoud, niet op het toetsenbord.
                </p>
              </div>
              <div className="bg-perkament rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-1">Minder fouten</h3>
                <p className="text-gray-600 text-sm">
                  Consistente vingerpositie zorgt voor minder typefouten.
                </p>
              </div>
              <div className="bg-perkament rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-1">Beter voor houding</h3>
                <p className="text-gray-600 text-sm">
                  Niet naar beneden kijken is beter voor nek en rug.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">❓</span> Veelgestelde vragen
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Vanaf welke leeftijd kan mijn kind beginnen?
                </h3>
                <p className="text-gray-600 text-sm">
                  We raden aan om te starten vanaf ongeveer 8 jaar. Dan zijn de motoriek en
                  concentratie meestal voldoende ontwikkeld voor blind typen.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Hoe lang duurt de cursus?</h3>
                <p className="text-gray-600 text-sm">
                  Lettoria heeft 23 lessen verdeeld over 7 regio&apos;s. De meeste kinderen kunnen in
                  10-15 weken de cursus afronden met 15-20 minuten oefenen per dag.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Waarom is het gratis?</h3>
                <p className="text-gray-600 text-sm">
                  We geloven dat elk kind toegang moet hebben tot goed onderwijs, ongeacht het
                  inkomen van de ouders. Lettoria is een non-profit project.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Werkt het ook op tablet of telefoon?</h3>
                <p className="text-gray-600 text-sm">
                  Lettoria werkt het beste op een computer of laptop met een fysiek toetsenbord. Op
                  een tablet met een extern toetsenbord werkt het ook.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Kan ik de voortgang van mijn kind zien?
                </h3>
                <p className="text-gray-600 text-sm">
                  Op de wereldkaart zie je welke lessen zijn afgerond en hoeveel sterren je kind heeft
                  behaald. Je kunt samen met je kind de voortgang bekijken.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-eric-green rounded-2xl p-6 md:p-8 text-center text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-3">Klaar om te beginnen?</h2>
            <p className="mb-6 text-white/90">
              Start vandaag nog met de gratis typecursus van Lettoria.
            </p>
            <Link
              href="/kaart"
              className="inline-block bg-white hover:bg-gray-100 text-eric-green font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              Start gratis met typen
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
