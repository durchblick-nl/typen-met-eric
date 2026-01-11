import Link from 'next/link';
import { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Colofon & Disclaimer | Lettoria',
    description: 'Bedrijfsgegevens, juridische informatie en disclaimer van Lettoria.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function ImpressumPage() {
    return (
        <main className="min-h-screen bg-perkament flex flex-col">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-eric-green hover:text-eric-green/80 transition-colors">
                        &larr; Terug naar home
                    </Link>
                </div>
            </div>

            {/* Content */}
            <section className="flex-grow py-12 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Colofon & Disclaimer</h1>

                    <div className="space-y-8 text-gray-600">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Verantwoordelijke</h2>
                            <p className="font-semibold text-lg">Durchblick Consultancy BV</p>
                            <p>Dr. CA Gerkestraat 47 rd</p>
                            <p>2042 EN Zandvoort</p>
                            <p>Nederland</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Bedrijfsgegevens</h2>
                            <p>Kamer van Koophandel: 67362605</p>
                            <p>BTW-nummer: NL856949346B01</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact</h2>
                            <p>E-mail: <a href="mailto:info@treehouse.ch" className="text-eric-green hover:underline">info@treehouse.ch</a></p>
                            <p className="mt-2 text-sm text-gray-500">
                                Vragen over de app of deze website kunnen worden gericht aan info@treehouse.ch.
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Disclaimer</h2>

                            <h3 className="font-bold text-gray-700 mt-6 mb-2">Inhoud</h3>
                            <p className="mb-4">
                                Hoewel wij de grootst mogelijke zorg besteden aan de samenstelling en het onderhoud van deze website,
                                kunnen wij niet garanderen dat de informatie te allen tijde volledig, juist en actueel is.
                                Aan de informatie op deze website kunnen geen rechten worden ontleend.
                            </p>

                            <h3 className="font-bold text-gray-700 mt-6 mb-2">Externe links</h3>
                            <p className="mb-4">
                                Deze website bevat links naar websites van derden. Wij hebben geen invloed op de inhoud van die websites
                                en aanvaarden daarvoor geen enkele aansprakelijkheid. Voor de inhoud van de gelinkte pagina's is altijd
                                de betreffende aanbieder of exploitant verantwoordelijk.
                            </p>

                            <h3 className="font-bold text-gray-700 mt-6 mb-2">Auteursrecht</h3>
                            <p>
                                Alle rechten van intellectuele eigendom betreffende deze materialen liggen bij Durchblick Consultancy BV.
                                Kopiëren, verspreiden en elk ander gebruik van deze materialen is niet toegestaan zonder schriftelijke
                                toestemming, behoudens en slechts voor zover anders bepaald in regelingen van dwingend recht
                                (zoals citaatrecht), tenzij bij specifieke materialen anders aangegeven is.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
