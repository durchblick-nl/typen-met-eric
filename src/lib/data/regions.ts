export interface Lesson {
  id: number;
  title: string;
  description: string;
  newKeys: string[];
  exercises: string[];
  storyIntro: string;
  storyOutro: string;
  storyImageUrl?: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string; // Path to the new high-res icon image
  color: string;
  position: { x: number; y: number };
  lessons: Lesson[];
  requiredLessons: number; // How many lessons needed to unlock
}

export const REGIONS: Region[] = [
  {
    id: 'grot',
    name: "Eric's Grot",
    description: 'Hier begint je avontuur met Eric',
    icon: '🐉',
    imageUrl: '/images/map/icon-grot.png',
    color: 'bg-eric-green',
    position: { x: 50, y: 85 },
    requiredLessons: 0,
    lessons: [
      {
        id: 0,
        title: 'Kennismaking met Eric',
        description: 'Leer Eric kennen en ontdek de thuisrij',
        newKeys: ['f', 'j'],
        exercises: ['fff', 'jjj', 'fjfj', 'fjfjfj'],
        storyIntro: `Welkom, jonge held! Ik ben Eric, een draak uit Lettoria.
          Ooit was ik sterk en kon ik vuur spuwen, maar toen de magie verdween...
          verloor ik mijn krachten. Wil jij me helpen de magie terug te brengen?

          Plaats je wijsvingers op de F en J toetsen. Voel je de kleine bultjes?
          Daar horen je vingers thuis!`,
        storyImageUrl: '/images/stories/lesson_0_eric_cave.png',
        storyOutro: `Geweldig! Je hebt je eerste letters geleerd!
          Ik voel al een klein beetje warmte terugkomen.
          Samen gaan we Lettoria redden!`,
      },
    ],
  },
  {
    id: 'dorp',
    name: 'Het Startdorp',
    description: 'Leer de thuisrij: A S D F J K L ;',
    icon: '🏠',
    imageUrl: '/images/map/icon-dorp.png',
    color: 'bg-lettoria-dorp',
    position: { x: 50, y: 70 },
    requiredLessons: 1,
    lessons: [
      {
        id: 1,
        title: 'De Bakker en de Wachter',
        description: 'Leer de letters A en ;',
        newKeys: ['a', ';'],
        exercises: ['aaa', ';;;', 'a;a;', 'fa;j', 'af;j'],
        storyIntro: `Welkom in het Startdorp! Kijk hoe grijs alles is...
          Daar was ooit de bakkerij van meneer Adriaan.
          En aan de andere kant woont de nachtwachter met zijn magische lantaarn.
          Kun jij de A en de ; terugbrengen?`,
        storyImageUrl: '/images/stories/lesson_1_grey_village.png',
        storyOutro: `De bakkerij krijgt zijn kleuren terug!
          "Mijn oven brandt weer!" roept de bakker blij.
          En kijk, de lantaarn van de wachter flikkert weer!`,
      },
      {
        id: 2,
        title: 'De Smid en de Lantaarnmaker',
        description: 'Leer de letters S en L',
        newKeys: ['s', 'l'],
        exercises: ['sss', 'lll', 'slsl', 'asdf', 'jkl;'],
        storyIntro: `De smid kon vroeger de mooiste zwaarden maken.
          En de lantaarnmaker zorgde voor licht in heel het dorp.
          Met S en L kunnen ze weer aan het werk!`,
        storyImageUrl: '/images/stories/lesson_2_blacksmith.png',
        storyOutro: `Het geluid van de hamer klinkt weer door het dorp!
          En overal gaan de lantaarns aan. Prachtig!`,
      },
      {
        id: 3,
        title: 'De Dokter en de Klokkenmaker',
        description: 'Leer de letters D en K',
        newKeys: ['d', 'k'],
        exercises: ['ddd', 'kkk', 'dkdk', 'asdf', 'jkl;', 'sad', 'lak'],
        storyIntro: `Dokter Daan hielp iedereen die ziek was.
          En klokkenmaker Karel zorgde dat niemand te laat kwam.
          Breng D en K terug naar het dorp!`,
        storyImageUrl: '/images/stories/lesson_3_doctor_clock.png',
        storyOutro: `De dokter opent zijn praktijk weer!
          En hoor je dat? De dorpsklok slaat weer!`,
      },
      {
        id: 4,
        title: 'De Visser en de Juwelier',
        description: 'Oefen met F en J - je wijsvingers!',
        newKeys: [],
        exercises: ['fjfj', 'asdf jkl;', 'alfa', 'jaks', 'flaks'],
        storyIntro: `De visser en de juwelier waren beste vrienden.
          De een ving vis, de ander maakte sieraden.
          Laten we F en J nog eens extra oefenen!`,
        storyImageUrl: '/images/stories/lesson_4_fisherman.png',
        storyOutro: `De visser gooit zijn net uit en de juwelier polijst zijn eerste edelsteen!
          Het dorp komt tot leven!`,
      },
      {
        id: 5,
        title: 'De Marktplaats',
        description: 'Leer de spatiebalk gebruiken',
        newKeys: [' '],
        exercises: ['as df', 'jk l;', 'a s d f', 'das jak', 'al das'],
        storyIntro: `De marktplaats was het hart van het dorp.
          Hier kwamen alle dorpelingen samen.
          Met de SPATIE maak je ruimte tussen woorden!`,
        storyOutro: `De markt is weer open! Overal staan kraampjes.
          Het Startdorp is gered! Eric's vleugels tintelen...`,
      },
    ],
  },
  {
    id: 'velden',
    name: 'De Velden van Vingervlugheid',
    description: 'Leer de bovenste rij: Q W E R T Y U I O P',
    icon: '🌾',
    imageUrl: '/images/map/icon-velden.png',
    color: 'bg-lettoria-velden',
    position: { x: 30, y: 50 },
    requiredLessons: 6,
    lessons: [
      {
        id: 6,
        title: 'De Boer en de Imker',
        description: 'Leer de letters E en I',
        newKeys: ['e', 'i'],
        exercises: ['eee', 'iii', 'eiei', 'def', 'jik', 'sie', 'lei'],
        storyIntro: `De gouden korenvelden liggen er verlaten bij.
          Boer Erik en imker Iris wachten op de terugkeer van de magie.
          E en I brengen het land weer tot leven!`,
        storyImageUrl: '/images/stories/lesson_6_farmer.png',
        storyOutro: `Het koren groeit! De bijen zoemen weer!
          De velden krijgen hun gouden glans terug!`,
      },
      {
        id: 7,
        title: 'De Molenaar en de Uil',
        description: 'Leer de letters R en U',
        newKeys: ['r', 'u'],
        exercises: ['rrr', 'uuu', 'ruru', 'red', 'juk', 'reis', 'deur'],
        storyIntro: `De oude molen staat stil zonder wind.
          En de wijze uil kan niet meer praten.
          R en U brengen beweging en wijsheid terug!`,
        storyImageUrl: '/images/stories/lesson_7_miller.png',
        storyOutro: `De wieken van de molen draaien weer!
          "Wie?" roept de uil. Hij kan weer praten!`,
      },
    ],
  },
  {
    id: 'woud',
    name: 'Het Fluisterwoud',
    description: 'Leer de onderste rij: Z X C V B N M',
    icon: '🌲',
    imageUrl: '/images/map/icon-woud.png',
    color: 'bg-lettoria-woud',
    position: { x: 25, y: 30 },
    requiredLessons: 12,
    lessons: [
      {
        id: 8,
        title: 'De Tovenaar en de Nachtegaal',
        description: 'Leer de letters Z en M',
        newKeys: ['z', 'm'],
        exercises: ['zzz', 'mmm', 'zmzm', 'zam', 'mes', 'zelf', 'muziek'],
        storyIntro: `Het Fluisterwoud is donker en stil geworden.
          Tovenaar Zeno heeft zijn spreukboek verloren.
          En de nachtegaal Mira kan niet meer zingen.
          Z en M brengen de magie van het woud terug!`,
        storyImageUrl: '/images/stories/lesson_woud_intro.png',
        storyOutro: `De tovenaar vindt zijn boek en spreekt zijn eerste spreuk!
          Mira zingt weer en het woud komt tot leven!`,
      },
      {
        id: 9,
        title: 'De Heks en de Nimf',
        description: 'Leer de letters X en N',
        newKeys: ['x', 'n'],
        exercises: ['xxx', 'nnn', 'xnxn', 'nex', 'mix', 'nam', 'been'],
        storyIntro: `Dieper in het woud woont heks Xandra.
          En nimf Nina danst tussen de bomen.
          X en N geven hen hun krachten terug!`,
        storyImageUrl: '/images/stories/lesson_9_witch.png',
        storyOutro: `Xandra brouwt weer drankjes met bijzondere kruiden!
          Nina's dans laat bloemen bloeien in het woud!`,
      },
      {
        id: 10,
        title: 'De Centaur en de Vos',
        description: 'Leer de letters C en V',
        newKeys: ['c', 'v'],
        exercises: ['ccc', 'vvv', 'cvcv', 'cel', 'vel', 'vlees', 'circus'],
        storyIntro: `Centaur Carlo bewaakt het woud al eeuwen.
          En slimme vos Victor kent alle geheime paden.
          C en V maken het woud weer veilig!`,
        storyImageUrl: '/images/stories/lesson_10_centaur.png',
        storyOutro: `Carlo galoppeert weer door het woud!
          Victor leidt reizigers veilig door het bos!`,
      },
      {
        id: 11,
        title: 'De Beer en het Bos',
        description: 'Leer de letter B',
        newKeys: ['b'],
        exercises: ['bbb', 'bab', 'beb', 'been', 'bier', 'boek', 'bloem'],
        storyIntro: `Beer Bruno slaapt al veel te lang.
          Het bos mist zijn beschermer.
          B wekt de beer en het hele woud!`,
        storyImageUrl: '/images/stories/lesson_11_bear.png',
        storyOutro: `Bruno ontwaakt met een groot gegrom!
          Het Fluisterwoud is compleet - de bomen fluisteren weer geheimen!`,
      },
    ],
  },
  {
    id: 'toppen',
    name: 'De Toppen van Taal',
    description: 'Leer cijfers en symbolen',
    icon: '⛰️',
    imageUrl: '/images/map/icon-toppen.png',
    color: 'bg-lettoria-toppen',
    position: { x: 50, y: 15 },
    requiredLessons: 12,
    lessons: [
      {
        id: 12,
        title: 'De Eerste Bergbeklimmer',
        description: 'Leer de cijfers 1, 2 en 3',
        newKeys: ['1', '2', '3'],
        exercises: ['111', '222', '333', '123', '321', '12', '23', '31'],
        storyIntro: `De Toppen van Taal rijzen hoog boven Lettoria uit.
          Hier woonden ooit de Tellermeester en zijn leerlingen.
          Met 1, 2 en 3 begin je de klim naar de top!`,
        storyImageUrl: '/images/stories/lesson_toppen_intro.png',
        storyOutro: `Je eerste stappen op de berg zijn gezet!
          De cijfers gloeien op in het gesteente!`,
      },
      {
        id: 13,
        title: 'De Kristalgrot',
        description: 'Leer de cijfers 4, 5 en 6',
        newKeys: ['4', '5', '6'],
        exercises: ['444', '555', '666', '456', '654', '45', '56', '64'],
        storyIntro: `Halverwege de berg ligt een kristalgrot.
          Hier bewaarde de Tellermeester zijn rekenboeken.
          4, 5 en 6 verlichten de grot!`,
        storyImageUrl: '/images/stories/lesson_13_crystal.png',
        storyOutro: `De kristallen glinsteren in alle kleuren!
          De getallen dansen over de wanden!`,
      },
      {
        id: 14,
        title: 'De Wolkenweg',
        description: 'Leer de cijfers 7, 8 en 9',
        newKeys: ['7', '8', '9'],
        exercises: ['777', '888', '999', '789', '987', '78', '89', '97'],
        storyIntro: `Boven de wolken ligt een magische weg.
          Alleen met de juiste cijfers kun je verder.
          7, 8 en 9 openen de poort naar de top!`,
        storyImageUrl: '/images/stories/lesson_14_clouds.png',
        storyOutro: `De wolkenweg vormt zich onder je voeten!
          Bijna bij de top nu!`,
      },
      {
        id: 15,
        title: 'De Top Bereikt',
        description: 'Leer 0 en oefen alle cijfers',
        newKeys: ['0'],
        exercises: ['000', '10', '20', '100', '1234', '5678', '90', '2024'],
        storyIntro: `De top is in zicht! Maar er ontbreekt nog één cijfer.
          De nul - het begin en het einde van alles.
          Met 0 bereik je de hoogste top!`,
        storyImageUrl: '/images/stories/lesson_15_summit.png',
        storyOutro: `Je staat op de top van de Toppen van Taal!
          Alle cijfers van Lettoria zijn hersteld!
          Eric voelt zijn vleugels sterker worden!`,
      },
    ],
  },
  {
    id: 'zee',
    name: 'De Zee van Snelheid',
    description: 'Oefen je snelheid met games',
    icon: '🌊',
    imageUrl: '/images/map/icon-zee.png',
    color: 'bg-lettoria-zee',
    position: { x: 75, y: 50 },
    requiredLessons: 16,
    lessons: [
      {
        id: 16,
        title: 'De Haven van Haast',
        description: 'Snelheidsuitdaging: korte woorden',
        newKeys: [],
        exercises: ['de', 'het', 'een', 'is', 'en', 'van', 'met', 'bij', 'als', 'dat'],
        storyIntro: `De Zee van Snelheid strekt zich voor je uit!
          Kapitein Kira wacht in de haven met haar snelle schip.
          Typ de woorden zo snel als je kunt om wind in de zeilen te krijgen!`,
        storyImageUrl: '/images/stories/lesson_zee_intro.png',
        storyOutro: `De zeilen bollen! Het schip vaart uit!
          Je vingers worden steeds sneller!`,
      },
      {
        id: 17,
        title: 'De Dolfijnenrace',
        description: 'Snelheidsuitdaging: langere woorden',
        newKeys: [],
        exercises: ['dolfijn', 'zeemeermin', 'schat', 'eiland', 'piraat', 'kompas', 'anker', 'golven'],
        storyIntro: `Dolfijnen zwemmen naast het schip!
          Ze dagen je uit voor een race.
          Typ sneller om ze bij te houden!`,
        storyImageUrl: '/images/stories/lesson_17_dolphins.png',
        storyOutro: `Je typt bijna zo snel als de dolfijnen zwemmen!
          Ze springen van vreugde!`,
      },
      {
        id: 18,
        title: 'De Schattenkaart',
        description: 'Snelheidsuitdaging: zinnen',
        newKeys: [],
        exercises: ['de zon schijnt', 'het schip vaart', 'een vis zwemt', 'de zee is blauw', 'ik zie land'],
        storyIntro: `Een schatkaart! Maar de inkt vervaagt snel.
          Typ de aanwijzingen voordat ze verdwijnen!`,
        storyImageUrl: '/images/stories/lesson_18_treasure.png',
        storyOutro: `De schat is gevonden!
          Een kist vol magische edelstenen!`,
      },
      {
        id: 19,
        title: 'De Stormrace',
        description: 'Ultieme snelheidstest',
        newKeys: [],
        exercises: ['de storm komt eraan', 'hou het roer vast', 'we gaan sneller varen', 'bijna bij de kust', 'we hebben het gehaald'],
        storyIntro: `Een storm nadert! Dit is de ultieme test.
          Typ zo snel als de bliksem om veilig thuis te komen!`,
        storyImageUrl: '/images/stories/lesson_19_storm.png',
        storyOutro: `Je hebt de storm verslagen!
          De Zee van Snelheid is gekalmeerd.
          Eric kan nu over de golven vliegen!`,
      },
    ],
  },
  {
    id: 'kasteel',
    name: 'Kasteel Compleet',
    description: 'Beheers alle letters en red Lettoria!',
    icon: '🏰',
    imageUrl: '/images/map/icon-kasteel.png',
    color: 'bg-lettoria-kasteel',
    position: { x: 75, y: 20 },
    requiredLessons: 20,
    lessons: [
      {
        id: 20,
        title: 'De Kasteelpoort',
        description: 'Test: thuisrij en bovenste rij',
        newKeys: [],
        exercises: ['qwerty', 'asdfg', 'poiuy', 'lkjhg', 'water', 'rivier', 'quote', 'prijs'],
        storyIntro: `Kasteel Compleet verschijnt aan de horizon!
          De grote poort is vergrendeld met lettermachines.
          Bewijs je kennis van de thuisrij en bovenste rij!`,
        storyImageUrl: '/images/stories/lesson_kasteel_intro.png',
        storyOutro: `De poort zwaait open!
          Je bent het kasteel binnengelaten!`,
      },
      {
        id: 21,
        title: 'De Ridderzaal',
        description: 'Test: onderste rij en cijfers',
        newKeys: [],
        exercises: ['zxcvb', 'nm123', 'vb456', 'cx789', 'zebra', 'circus', 'mars', 'nummer'],
        storyIntro: `De Ridderzaal is gevuld met schaduwen.
          Alleen een meester van alle letters kan het licht terugbrengen.
          Laat zien wat je kunt!`,
        storyImageUrl: '/images/stories/lesson_21_knights.png',
        storyOutro: `De fakkels branden weer!
          De ridders buigen voor je!`,
      },
      {
        id: 22,
        title: 'De Troonzaal',
        description: 'Ultieme meesterschapstest',
        newKeys: [],
        exercises: ['de draak eric', 'koning van lettoria', 'magische letters', 'typen is leuk', 'ik ben de beste'],
        storyIntro: `De troonzaal! Hier wacht de laatste uitdaging.
          Typ de magische woorden om Eric's volledige kracht te ontgrendelen!`,
        storyImageUrl: '/images/stories/lesson_22_throne.png',
        storyOutro: `ERIC TRANSFORMEERT!
          Zijn schubben glinsteren, zijn vleugels zijn sterk,
          en hij spuwt weer magisch vuur!
          JIJ HEBT LETTORIA GERED!`,
      },
    ],
  },
];

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getLessonById(lessonId: number): { region: Region; lesson: Lesson } | undefined {
  for (const region of REGIONS) {
    const lesson = region.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { region, lesson };
    }
  }
  return undefined;
}

export function getTotalLessons(): number {
  return REGIONS.reduce((sum, region) => sum + region.lessons.length, 0);
}
