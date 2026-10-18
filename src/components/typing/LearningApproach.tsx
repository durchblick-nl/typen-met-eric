import Link from 'next/link';
import { t } from '@/lib/i18n';

export function LearningApproach() {
  return <section id="leren" aria-labelledby="learning-title" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm scroll-mt-6">
    <h2 id="learning-title" className="text-xl font-bold text-gray-800 mb-3">{t('Hoe wij leren typen opbouwen')}</h2>
    <p className="text-gray-600 mb-4">{t('Onze lesopbouw is geïnspireerd door onderzoek naar hoe kinderen leren typen. We combineren oriëntatie op de thuisrij, kleine groepen nieuwe toetsen, duidelijke vingerhulp en herhaling in latere lessen. De oefeningen passen bij de gekozen taal en toetsenbordindeling.')}</p>
    <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
      <li>{t('Ontdekken: voel F en J en oefen de beweging naar een nieuwe toets.')}</li>
      <li>{t('Combineren: verbind nieuwe toetsen met bekende toetsen en oefen woorden zodra dat kan.')}</li>
      <li>{t('Terughalen: eerdere toetsen komen in latere lessen opnieuw aan bod, ook zeldzame letters.')}</li>
    </ol>
    <p className="text-gray-600 mb-4">{t('Nauwkeurig typen gaat voor snelheid. Korte oefenmomenten met pauzes en later opnieuw oefenen staan centraal. Het verhaal en de vrijwillige bonusspellen begeleiden het oefenen; muziek is niet nodig om te leren.')}</p>
    <p className="text-gray-600 mb-4">{t('Voor ouders en begeleiders: kijk af en toe mee naar de houding en het vingergebruik. De website kan niet zien welke vinger een toets indrukt. Help je kind ontspannen te oefenen, zonder het toetsenbord verplicht af te dekken.')}</p>
    <div className="rounded-xl bg-perkament p-4 text-sm text-gray-700 mb-5">
      {t('Onderzoek inspireert ons ontwerp; Lettoria zelf is nog niet onderzocht op leerresultaten. Er is geen bewezen beste volgorde voor alle kinderen. Onze precieze toetsvolgorde, herhaalafstanden en sterrengrens zijn ontwerpkeuzes. Sterren tonen behaalde lesresultaten, geen bewijs van blijvende beheersing.')}
    </div>
    <p className="text-gray-600 mb-4">{t('Later oefen je hoofdletters met de Shift-toets van de andere hand, daarna namen en zinnen. De laatste les is een heel verhaal over Eric met alle letters en cijfers. Voor Zwitserse hoofdletter-umlauten leggen we de Caps Lock-combinatie apart uit.')}</p>
    <p className="mb-5"><Link href="/oefenen#persoonlijk" className="text-eric-green underline font-semibold">{t('Probeer je persoonlijke toetsentraining')}</Link></p>
    <h3 className="font-bold text-gray-800 mb-2">{t('Bronnen en achtergrond')}</h3>
    <ul className="space-y-3 text-sm text-gray-600 break-words">
      <li><a className="text-eric-green underline" href="https://doi.org/10.46586/SLLD.452">Schüler &amp; Lindauer (2025): Didaktik des Tastaturschreibens</a><p>{t('Didactisch overzicht van motorische en taalgerichte aanpakken, waaronder mengvormen. Zie vooral het hoofdstuk over lesopbouw, p. 117–120.')}</p></li>
      <li><a className="text-eric-green underline" href="https://link.springer.com/article/10.1007/s11145-024-10613-9">Gahshan &amp; Weintraub (2024/2025): WoTIP</a><p>{t('Onderzoek bij 51 kinderen van 9–10 jaar naar een gecombineerd programma voor typen en tekstverwerking. Het onderzocht niet Lettoria of onze vier toetsenbordcursussen.')}</p></li>
      <li><a className="text-eric-green underline" href="https://doi.org/10.1080/00140137808931764">Baddeley &amp; Longman (1978)</a><p>{t('Onderzoek naar gespreide typetraining bij volwassenen. Het ondersteunt het spreiden van oefening, maar bepaalt geen ideale oefenduur voor kinderen.')}</p></li>
    </ul>
  </section>;
}
