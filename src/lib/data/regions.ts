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
  imageUrl?: string;
  color: string;
  position: { x: number; y: number };
  lessons: Lesson[];
  requiredLessons: number;
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
        exercises: ['fff', 'jjj', 'fjfj', 'jfjf', 'ffjj', 'jjff', 'fjfjfj', 'jfjfjf', 'fffjjj', 'jjjfff'],
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
    description: 'Leer de thuisrij: A S D F G H J K L ;',
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
        exercises: ['aaa', ';;;', 'a;a;', ';a;a', 'fa;j', 'af;j', 'ja;f', 'faja', 'fjfj', 'a;fj'],
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
        exercises: ['sss', 'lll', 'sla', 'als', 'las', 'jas', 'laf', 'sjaal', 'alfa', 'alas'],
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
        exercises: ['ddd', 'kkk', 'dak', 'kas', 'dal', 'lak', 'kaal', 'kaas', 'klas', 'slak', 'daad', 'kalk'],
        storyIntro: `Dokter Daan hielp iedereen die ziek was.
          En klokkenmaker Karel zorgde dat niemand te laat kwam.
          Breng D en K terug naar het dorp!`,
        storyImageUrl: '/images/stories/lesson_3_doctor_clock.png',
        storyOutro: `De dokter opent zijn praktijk weer!
          En hoor je dat? De dorpsklok slaat weer!`,
      },
      {
        id: 4,
        title: 'De Herbergier en de Houthakker',
        description: 'Leer de letters G en H',
        newKeys: ['g', 'h'],
        exercises: ['ggg', 'hhh', 'dag', 'had', 'haas', 'glas', 'glad', 'lach', 'hals', 'slag', 'hal', 'haag'],
        storyIntro: `In de herberg was het altijd gezellig en warm.
          En de houthakker zorgde voor hout voor het haardvuur.
          Met G en H brengen we de gezelligheid terug!`,
        storyImageUrl: '/images/stories/lesson_4_innkeeper.png',
        storyOutro: `Het haardvuur knettert weer in de herberg!
          Iedereen heft zijn glas. Proost!`,
      },
      {
        id: 5,
        title: 'De Marktplaats',
        description: 'Leer de spatiebalk gebruiken',
        newKeys: [' '],
        exercises: ['f j', 'd k', 's l', 'a ;', 'g h', 'dag', 'dag dag', 'glad als glas', 'dag haas', 'had kaas', 'haas lag glad', 'dag haas dag'],
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
        exercises: ['eee', 'iii', 'die', 'de held', 'de heks', 'de dijk', 'ik eis de gids', 'die held is gek', 'de dijk is glad', 'de heks is gek', 'ik leid de held', 'ik hak de hei'],
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
        exercises: ['rrr', 'uuu', 'deur', 'reus', 'raar', 'druk', 'kaars', 'de reus is raar', 'hier is de deur', 'de kaars is duur', 'de gids is druk', 'ik eis huur', 'de rug is erg'],
        storyIntro: `De oude molen staat stil zonder wind.
          En de wijze uil kan niet meer praten.
          R en U brengen beweging en wijsheid terug!`,
        storyImageUrl: '/images/stories/lesson_7_miller.png',
        storyOutro: `De wieken van de molen draaien weer!
          "Wie?" roept de uil. Hij kan weer praten!`,
      },
      {
        id: 8,
        title: 'De Torenwachter en de Yak',
        description: 'Leer de letters T en Y',
        newKeys: ['t', 'y'],
        exercises: ['ttt', 'yyy', 'het', 'dat', 'kat', 'taart', 'tijger', 'de kat eet de rat', 'het dak lekt', 'dat is raar', 'de taart is lekker', 'dit is de tijger', 'de tijger eet het dier'],
        storyIntro: `Hoog op de uitkijktoren tuurt de wachter in de verte.
          En in de wei graast een bijzondere yak.
          T en Y maken het uitzicht weer helder!`,
        storyImageUrl: '/images/stories/lesson_8_tower.png',
        storyOutro: `De wachter blaast op zijn trompet!
          De yak springt vrolijk in het rond.`,
      },
      {
        id: 9,
        title: 'De Pottenbakker en Opa',
        description: 'Leer de letters O en P',
        newKeys: ['o', 'p'],
        exercises: ['ooo', 'ppp', 'goed', 'paard', 'soep', 'poes', 'het is goed', 'de poes slaapt', 'soep is lekker', 'het paard is groot', 'sport is goed', 'de poes eet soep', 'het doel is top'],
        storyIntro: `Opa vertelt verhalen bij de pottenbakkerij.
          Maar de oven is koud en de verhalen zijn vergeten.
          O en P bakken weer mooie potten!`,
        storyImageUrl: '/images/stories/lesson_9_potter.png',
        storyOutro: `De pottenbakker draait weer prachtige vazen!
          En opa vertelt zijn mooiste avonturen.`,
      },
      {
        id: 10,
        title: 'De Kwibus en de Waarzegster',
        description: 'Leer de letters Q en W',
        newKeys: ['q', 'w'],
        exercises: ['www', 'qqq', 'wat', 'wie', 'water', 'woud', 'wat is dat', 'wie is het', 'water is goed', 'het woud is groot', 'wie was de gids', 'de held wordt groot', 'water is lekker'],
        storyIntro: `De grappige kwibus en de mysterieuze waarzegster
          zijn hun stem kwijt.
          Q en W brengen de raadsels en grappen terug!`,
        storyImageUrl: '/images/stories/lesson_10_fortuneteller.png',
        storyOutro: `De kwibus maakt iedereen aan het lachen!
          De waarzegster ziet weer een prachtige toekomst.`,
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
    requiredLessons: 11,
    lessons: [
      {
        id: 11,
        title: 'De Tovenaar en de Nachtegaal',
        description: 'Leer de letters Z en M',
        newKeys: ['z', 'm'],
        exercises: ['zzz', 'mmm', 'zie', 'mooi', 'maar', 'hij', 'ik zie de poes', 'de motor start', 'ik zit hier', 'dat is mooi', 'hij is groot maar mooi', 'de mast is groot', 'maar de motor is mooi'],
        storyIntro: `Het Fluisterwoud is donker en stil geworden.
          Tovenaar Zeno heeft zijn spreukboek verloren.
          En de nachtegaal Mira kan niet meer zingen.
          Z en M brengen de magie van het woud terug!`,
        storyImageUrl: '/images/stories/lesson_woud_intro.png',
        storyOutro: `De tovenaar vindt zijn boek en spreekt zijn eerste spreuk!
          Mira zingt weer en het woud komt tot leven!`,
      },
      {
        id: 12,
        title: 'De Heks en de Nimf',
        description: 'Leer de letters X en N',
        newKeys: ['x', 'n'],
        exercises: ['nnn', 'xxx', 'een', 'niet', 'zijn', 'maan', 'de maan is mooi', 'wij zijn hier', 'ik zie een dier', 'het is niet goed', 'mensen zien de maan', 'ik ren naar de toren', 'wij wonen in het woud'],
        storyIntro: `Dieper in het woud woont heks Xandra.
          En nimf Nina danst tussen de bomen.
          X en N geven hen hun krachten terug!`,
        storyImageUrl: '/images/stories/lesson_9_witch.png',
        storyOutro: `Xandra brouwt weer drankjes met bijzondere kruiden!
          Nina's dans laat bloemen bloeien in het woud!`,
      },
      {
        id: 13,
        title: 'De Centaur en de Vos',
        description: 'Leer de letters C en V',
        newKeys: ['c', 'v'],
        exercises: ['ccc', 'vvv', 'vuur', 'vier', 'van', 'cirkel', 'van ver zie ik vuur', 'vier vissen zwemmen', 'ik voel de warmte', 'van ver zien wij licht', 'veel mensen zien vuur', 'eric spuwt vuur', 'de cirkel is groot en mooi'],
        storyIntro: `Centaur Carlo bewaakt het woud al eeuwen.
          En slimme vos Victor kent alle geheime paden.
          C en V maken het woud weer veilig!`,
        storyImageUrl: '/images/stories/lesson_10_centaur.png',
        storyOutro: `Carlo galoppeert weer door het woud!
          Victor leidt reizigers veilig door het bos!`,
      },
      {
        id: 14,
        title: 'De Beer en het Bos',
        description: 'Leer de letter B en leestekens . en ,',
        newKeys: ['b', '.', ','],
        exercises: ['bbb', 'boom', 'beer', 'brood', 'de beer slaapt.', 'ik zie een boom.', 'de beer eet brood.', 'de boot vaart op het water.', 'wij zijn blij met de brug.', 'een beer in een boom is raar.', 'de boom is groot, de beer is blij.'],
        storyIntro: `Beer Bruno slaapt al veel te lang.
          Het bos mist zijn beschermer.
          B wekt de beer en het hele woud!
          Met de punt en komma maak je je zinnen compleet!`,
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
    requiredLessons: 15,
    lessons: [
      {
        id: 15,
        title: 'De Eerste Bergbeklimmer',
        description: 'Leer de cijfers 1, 2 en 3',
        newKeys: ['1', '2', '3'],
        exercises: ['111', '222', '333', '1, 2, 3', '3, 2, 1', 'ik tel 1, 2, 3.', 'er zijn 2 beren.', 'ik zie 3 vissen.', 'er zijn 3 grote bomen.', 'ik heb 1 brood voor jou.', 'er zijn 2 boten op het water.', 'tel 1, 2, 3 en begin dan.'],
        storyIntro: `De Toppen van Taal rijzen hoog boven Lettoria uit.
          Hier woonden ooit de Tellermeester en zijn leerlingen.
          Met 1, 2 en 3 begin je de klim naar de top!`,
        storyImageUrl: '/images/stories/lesson_toppen_intro.png',
        storyOutro: `Je eerste stappen op de berg zijn gezet!
          De cijfers gloeien op in het gesteente!`,
      },
      {
        id: 16,
        title: 'De Kristalgrot',
        description: 'Leer de cijfers 4, 5 en 6',
        newKeys: ['4', '5', '6'],
        exercises: ['444', '555', '666', '4, 5, 6', '6, 5, 4', 'ik heb 4 stenen.', 'er zijn 5 bloemen.', 'ik tel 4, 5, 6.', 'er zijn 6 vissen in het meer.', 'ik zie 5 boten op zee.', 'er zijn 4 bomen en 5 beren.', 'de boot vaart 6 uur op zee.'],
        storyIntro: `Halverwege de berg ligt een kristalgrot.
          Hier bewaarde de Tellermeester zijn rekenboeken.
          4, 5 en 6 verlichten de grot!`,
        storyImageUrl: '/images/stories/lesson_13_crystal.png',
        storyOutro: `De kristallen glinsteren in alle kleuren!
          De getallen dansen over de wanden!`,
      },
      {
        id: 17,
        title: 'De Wolkenweg',
        description: 'Leer de cijfers 7, 8 en 9',
        newKeys: ['7', '8', '9'],
        exercises: ['777', '888', '999', '7, 8, 9', '9, 8, 7', 'ik tel 7, 8, 9.', 'er zijn 8 wolken.', 'de 9 sterren zijn mooi.', 'ik zie 7 grote vissen.', 'er zijn 8 bomen in het woud.', 'ik heb 9 broden en 7 boten.', 'de beer slaapt 8 uur per nacht.'],
        storyIntro: `Boven de wolken ligt een magische weg.
          Alleen met de juiste cijfers kun je verder.
          7, 8 en 9 openen de poort naar de top!`,
        storyImageUrl: '/images/stories/lesson_14_clouds.png',
        storyOutro: `De wolkenweg vormt zich onder je voeten!
          Bijna bij de top nu!`,
      },
      {
        id: 18,
        title: 'De Top Bereikt',
        description: 'Leer 0 en oefen alle cijfers',
        newKeys: ['0'],
        exercises: ['000', '10', '20', '100', '1234567890', 'tel van 0 tot 10.', 'er zijn 100 mensen.', 'ik zie 10 boten.', 'de nul is rond.', 'ik heb 0 fouten gemaakt.', 'ik heb 10 broden voor 5 mensen.', 'tel 10, 20, 30, 40, 50.'],
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
    requiredLessons: 19,
    lessons: [
      {
        id: 19,
        title: 'De Haven van Haast',
        description: 'Snelheidsuitdaging: korte woorden',
        newKeys: [],
        exercises: ['de zee is mooi.', 'het is een boot.', 'de boot vaart snel.', 'wij zien het land.', 'de vis zwemt diep.', 'het water is blauw.', 'de wind is sterk.', 'wij varen naar het eiland.', 'de kapitein ziet de kust.', 'de golven zijn groot en mooi.'],
        storyIntro: `De Zee van Snelheid strekt zich voor je uit!
          Kapitein Kira wacht in de haven met haar snelle schip.
          Typ de woorden zo snel als je kunt om wind in de zeilen te krijgen!`,
        storyImageUrl: '/images/stories/lesson_zee_intro.png',
        storyOutro: `De zeilen bollen! Het schip vaart uit!
          Je vingers worden steeds sneller!`,
      },
      {
        id: 20,
        title: 'De Dolfijnenrace',
        description: 'Snelheidsuitdaging: langere woorden',
        newKeys: [],
        exercises: ['de dolfijn zwemt heel snel.', 'wij racen met de dolfijnen.', 'de zeemeermin zingt een lied.', 'ik zie een schat op de bodem.', 'de piraat zoekt het eiland.', 'het kompas wijst naar het noorden.', 'de mast is erg hoog.', 'wij vinden de schat niet.', 'de boot is groot en heel snel.', 'eric vliegt hoog over de zee.'],
        storyIntro: `Dolfijnen zwemmen naast het schip!
          Ze dagen je uit voor een race.
          Typ sneller om ze bij te houden!`,
        storyImageUrl: '/images/stories/lesson_17_dolphins.png',
        storyOutro: `Je typt bijna zo snel als de dolfijnen zwemmen!
          Ze springen van vreugde!`,
      },
      {
        id: 21,
        title: 'De Schattenkaart',
        description: 'Snelheidsuitdaging: zinnen',
        newKeys: [],
        exercises: ['de zon schijnt op het water.', 'het schip vaart naar het eiland.', 'een vis zwemt onder de boot.', 'de zee is blauw en diep.', 'ik zie land aan de horizon.', 'de schatkaart is oud en versleten.', 'wij volgen de kaart naar de schat.', 'het goud glimt in de zon.', 'de kist is zwaar maar niet groot.', 'wij zijn rijk en heel blij.'],
        storyIntro: `Een schatkaart! Maar de inkt vervaagt snel.
          Typ de aanwijzingen voordat ze verdwijnen!`,
        storyImageUrl: '/images/stories/lesson_18_treasure.png',
        storyOutro: `De schat is gevonden!
          Een kist vol magische edelstenen!`,
      },
      {
        id: 22,
        title: 'De Stormrace',
        description: 'Ultieme snelheidstest',
        newKeys: [],
        exercises: ['de storm komt snel eraan.', 'hou het grote roer stevig vast.', 'de golven slaan over het dek.', 'wij varen zo snel als de wind.', 'bijna bij de kust, niet stoppen.', 'de bliksem slaat in het water.', 'wij sturen het schip door de storm.', 'de wind is erg sterk en koud.', 'wij zijn veilig in de haven.', 'de storm is voorbij, wij zijn gered.'],
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
    requiredLessons: 23,
    lessons: [
      {
        id: 23,
        title: 'De Kasteelpoort',
        description: 'Test: thuisrij en bovenste rij',
        newKeys: [],
        exercises: ['qwerty uiop.', 'asdfg hjkl;', 'de poort is groot.', 'ik zie het kasteel.', 'de ridder wacht op ons.', 'wij gaan door de poort.', 'het is een prachtig kasteel.', 'de slotvoogd opent de poort.', 'wij lopen door de grote hal.', 'het kasteel heeft tien grote torens.'],
        storyIntro: `Kasteel Compleet verschijnt aan de horizon!
          De grote poort is vergrendeld met lettermachines.
          Bewijs je kennis van de thuisrij en bovenste rij!`,
        storyImageUrl: '/images/stories/lesson_kasteel_intro.png',
        storyOutro: `De poort zwaait open!
          Je bent het kasteel binnengelaten!`,
      },
      {
        id: 24,
        title: 'De Ridderzaal',
        description: 'Test: onderste rij en cijfers',
        newKeys: [],
        exercises: ['zxcvb nm.', 'vijf zebras.', 'de ridder heeft 5 zwaarden.', 'er zijn 10 gouden schilden.', 'de zaal heeft 7 grote ramen.', 'ik zie 3 ridders en 2 draken.', 'de vlag is rood, wit en blauw.', 'wij zijn bijna klaar met typen.', 'ik kan alle 26 letters typen.', 'de schat bevat 100 gouden munten.'],
        storyIntro: `De Ridderzaal is gevuld met schaduwen.
          Alleen een meester van alle letters kan het licht terugbrengen.
          Laat zien wat je kunt!`,
        storyImageUrl: '/images/stories/lesson_21_knights.png',
        storyOutro: `De fakkels branden weer!
          De ridders buigen voor je!`,
      },
      {
        id: 25,
        title: 'De Troonzaal',
        description: 'Ultieme meesterschapstest',
        newKeys: [],
        exercises: ['eric is een groene draak.', 'hij woont in een grot in lettoria.', 'wij hebben alle letters geleerd.', 'eric kan nu weer vuur spuwen.', 'de magie is terug in lettoria.', 'jij bent de beste typist van het land.', 'eric vliegt hoog over het kasteel.', 'bedankt voor het leren typen.', 'lettoria is gered door jou.', 'jij bent de held van lettoria.'],
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
