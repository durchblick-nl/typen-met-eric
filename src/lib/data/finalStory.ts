import type { CourseId } from '../course';

const dutch = [
  'Eric is een kleine groene draak uit Lettoria.',
  'In zijn grot vindt hij een oude kaart.',
  'De kaart wijst naar een kasteel achter het woud.',
  'Eric vliegt over de zee en zwaait naar zijn vrienden.',
  'Bij de poort stelt de koningin hem een quiz.',
  'Eric weet het antwoord en vindt een gouden sleutel.',
  'Op de sleutel staat de code 0123456789.',
  'Hij typt de code en de poort gaat open.',
  'In de zaal speelt een vos op een xylofoon.',
  'De muziek wekt de magie en alle kristallen stralen.',
  'Eric lacht, want Lettoria heeft zijn kleuren terug.',
  'Samen met jou heeft de kleine draak het avontuur volbracht.',
];

const german = [
  'Eric ist ein kleiner grüner Drache aus Lettoria.',
  'In seiner Höhle findet er eine alte Karte.',
  'Die Karte zeigt ein Schloss hinter dem großen Wald.',
  'Eric fliegt über das Meer und grüßt seine Freunde.',
  'An einer Quelle wartet die Königin mit vielen Freunden.',
  'Über der Quelle wächst ein Baum mit Äpfeln, daneben steht eine Lampe mit Öl.',
  'Sie stellt ihm ein Quiz und Eric findet die Lösung.',
  'Zur Belohnung erhält er einen goldenen Schlüssel.',
  'Auf dem Schlüssel steht der Code 0123456789.',
  'Er tippt den Code und das Tor öffnet sich.',
  'Im Saal spielt ein Fuchs auf einem Xylophon.',
  'Die Musik weckt die Magie und alle Kristalle strahlen.',
  'Jetzt freut sich Eric, denn jeder sieht die Farben von Lettoria.',
  'Gemeinsam mit dir hat der kleine Drache das Abenteuer geschafft.',
];

/** Authored cumulative application, not an independent retention assessment. */
export function finalStory(course: CourseId): string[] {
  return course === 'nl' || course === 'be' ? [...dutch]
    : german.map(text => course === 'ch' ? text.replace(/ß/g, 'ss') : text);
}
