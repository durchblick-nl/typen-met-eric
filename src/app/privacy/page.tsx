import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { PrivacySettingsButton } from '@/components/privacy/PrivacyConsent';

export const metadata: Metadata = {
  title: 'Privacy & cookies',
  description: 'Hoe Lettoria je voortgang bewaart en hoe je optionele pagina-analyse kunt in- of uitschakelen.',
  alternates: { canonical: 'https://lettoria.nl/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-perkament">
      <section className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-eric-green hover:underline">&larr; Terug naar home</Link>
        <div className="mt-8 rounded-2xl bg-white p-6 md:p-10 shadow-sm space-y-6 text-gray-700 leading-relaxed">
          <h1 className="text-3xl font-bold text-eric-green">Privacy & cookies</h1>
          <p>Lettoria is gratis en werkt zonder account. Hieronder lees je wat op je apparaat blijft en wat we alleen met jouw toestemming meten.</p>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Wat blijft op je apparaat?</h2>
            <p>Je lesvoortgang, sterren, oefencijfers per toets, spelrecords, grotversiering en instellingen voor geluid en rustige weergave worden lokaal in je browser bewaard. Je getypte oefentekst wordt niet naar onze analyse gestuurd. Een naam die je voor je diploma invult, wordt alleen op je apparaat gebruikt om de PDF te maken.</p>
            <p>Verwijder je browsergegevens of gebruik je een ander apparaat, dan is je lokale voortgang daar niet beschikbaar.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Een cookie voor je keuze</h2>
            <p>De noodzakelijke cookie <code>lettoria_consent</code> onthoudt je privacykeuze 180 dagen. Deze keuze geldt voor het huidige domein. De analyse staat uit totdat je toestemming geeft.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Optionele pagina-analyse met OpenPanel</h2>
            <p>Na toestemming laden we het analysescript van openpanel.dev en sturen we paginaweergaven naar onze OpenPanel-server op opapi.treehouse.ch. We sturen alleen het pagina-adres zonder zoekparameters of fragmenten en de algemene titel Lettoria. Verbindingsgegevens zoals je IP-adres en browserinformatie kunnen bij deze diensten worden verwerkt.</p>
            <p>We sturen geen namen, e-mailadressen, getypte tekst of lesresultaten mee. We gebruiken geen schermopnames, advertentiecookies, persoonlijke analyseprofielen of automatische klikregistratie.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Je keuze veranderen</h2>
            <p>Via de knop hieronder of de footer kun je analyse altijd aan- of uitzetten. Bij uitschakelen herladen we de pagina om het analysescript te stoppen. Opgeslagen voortgang blijft behouden; een lopende oefening begint opnieuw. Zonder toestemming blijft de hele cursus beschikbaar.</p>
            <PrivacySettingsButton className="rounded-full bg-eric-green px-6 py-3 font-semibold text-white hover:bg-eric-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eric-green">
              Privacyinstellingen openen
            </PrivacySettingsButton>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Technische verbindingen</h2>
            <p>Voor het aanbieden van de website verwerken onze hostingdiensten technische verbindingsgegevens. De website verwijst ook naar lettertypen van Google Fonts; bij het laden daarvan kunnen verbindingsgegevens naar Google worden gestuurd. De toestemming hierboven regelt de optionele OpenPanel-analyse.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Contact</h2>
            <p>Durchblick Consultancy BV, Dr. CA Gerkestraat 47 rd, 2042 EN Zandvoort, Nederland. Vragen over privacy of verzoeken om inzage, correctie of verwijdering kun je sturen naar <a href="mailto:info@treehouse.ch" className="text-eric-green underline">info@treehouse.ch</a>. Je kunt ook contact opnemen met een privacytoezichthouder.</p>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}
