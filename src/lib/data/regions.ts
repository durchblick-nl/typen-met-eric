export interface Lesson {
  id: number;
  title: string;
  description: string;
  newKeys: string[];
  exercises: string[];
  storyIntro: string;
  storyOutro: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  icon: string;
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
    color: 'bg-lettoria-woud',
    position: { x: 25, y: 30 },
    requiredLessons: 12,
    lessons: [],
  },
  {
    id: 'toppen',
    name: 'De Toppen van Taal',
    description: 'Leer cijfers en symbolen',
    icon: '⛰️',
    color: 'bg-lettoria-toppen',
    position: { x: 50, y: 15 },
    requiredLessons: 18,
    lessons: [],
  },
  {
    id: 'zee',
    name: 'De Zee van Snelheid',
    description: 'Oefen je snelheid met games',
    icon: '🌊',
    color: 'bg-lettoria-zee',
    position: { x: 75, y: 50 },
    requiredLessons: 22,
    lessons: [],
  },
  {
    id: 'kasteel',
    name: 'Kasteel Compleet',
    description: 'Beheers alle letters en red Lettoria!',
    icon: '🏰',
    color: 'bg-lettoria-kasteel',
    position: { x: 75, y: 20 },
    requiredLessons: 28,
    lessons: [],
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
