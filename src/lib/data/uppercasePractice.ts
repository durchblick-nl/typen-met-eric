import type { CourseId } from '../course';
import { KEYBOARDS } from '../keyboards';
import type { Region } from './regions';

/** Existing consolidation lessons introduce case without renumbering old saves. */
export function uppercasePractice(regions: Region[], course: CourseId): Region[] {
  const german = course === 'de' || course === 'ch';
  const keys = [KEYBOARDS[course].rows[2], KEYBOARDS[course].rows[1], KEYBOARDS[course].rows[3]].flat()
    .filter(entry => /^[a-z]$/.test(entry.key));
  const right = keys.filter(entry => entry.finger >= 4).map(entry => entry.key.toUpperCase());
  const left = keys.filter(entry => entry.finger <= 3).map(entry => entry.key.toUpperCase());
  return regions.map(region => ({ ...region, description: region.id === 'zee' ? german ? (course === 'de' ? 'Großbuchstaben, Namen und Sätze' : 'Grossbuchstaben, Namen und Sätze') : 'Hoofdletters, namen en zinnen' : region.description, lessons: region.lessons.map(lesson => {
    if (lesson.id === 19 || lesson.id === 20) {
      const capitals = lesson.id === 19 ? right : left;
      const names = lesson.id === 19 ? ['Hugo','Jan','Kim','Lia','Uli','Otto','Pia','Nora','Mila','Yara','Zoe']
        : ['Anna','Sara','Daan','Fleur','Gert','Eric','Roos','Thomas','Willem','Quinn','Xena','Victor','Bram','Yara','Zoe'];
      const intro = lesson.id === 19
        ? german ? 'Eric zeigt dir grosse Buchstaben. Halte die linke Umschalttaste mit dem linken kleinen Finger und tippe den Buchstaben mit der rechten Hand. Lass Shift danach wieder los.' : 'Eric toont je hoofdletters. Houd linker Shift vast met je linker pink en typ de letter met je rechterhand. Laat Shift daarna weer los.'
        : german ? 'Jetzt wechseln die Hände. Halte die rechte Umschalttaste mit dem rechten kleinen Finger und tippe den Buchstaben mit der linken Hand. Lass Shift danach wieder los.' : 'Nu wisselen de handen. Houd rechter Shift vast met je rechter pink en typ de letter met je linkerhand. Laat Shift daarna weer los.';
      return { ...lesson, newKeys: capitals,
        title: lesson.id === 19 ? german ? (course === 'de' ? 'Große Buchstaben mit linker Shift' : 'Grosse Buchstaben mit linker Shift') : 'Hoofdletters met linker Shift' : german ? (course === 'de' ? 'Große Buchstaben mit rechter Shift' : 'Grosse Buchstaben mit rechter Shift') : 'Hoofdletters met rechter Shift',
        description: german ? (course === 'de' ? 'Bekannte Buchstaben groß schreiben' : 'Bekannte Buchstaben gross schreiben') : 'Bekende letters groot schrijven',
        storyIntro: course === 'de' ? intro.replace(/grosse/g,'große') : intro,
        exercises: [...capitals.map(key => `${key}${key.toLowerCase()}${key}`), ...names.filter(name => capitals.includes(name[0]))],
      };
    }
    if (lesson.id === 21) return { ...lesson,
      title: german ? 'Namen und Satzanfänge' : 'Namen en zinnen',
      description: german ? (course === 'de' ? 'Wörter und Sätze mit großen Buchstaben' : 'Wörter und Sätze mit grossen Buchstaben') : 'Woorden en zinnen met hoofdletters',
      newKeys: german ? ['Ä','Ö','Ü'] : [],
      storyIntro: course === 'ch' ? 'Namen und Satzanfänge beginnen gross. Für Ä, Ö und Ü schaltest du Caps Lock ein, tippst den Umlaut und schaltest Caps Lock wieder aus. Mit Shift allein entstehen auf der Schweizer Tastatur französische Akzente.'
        : german ? 'Namen, Nomen und Satzanfänge beginnen groß. Übe jetzt auch Ä, Ö und Ü mit linker Shift und dem richtigen Finger der rechten Hand.'
        : 'Namen en het begin van een zin krijgen een hoofdletter. Eric woont in Lettoria. Gebruik voor de hoofdletter de Shift-toets van de andere hand.',
      exercises: german ? ['ÄäÄ','ÖöÖ','ÜüÜ','Äpfel','Öl','Übung','Eric findet die Karte.','Wir suchen den Schatz.','Der Schatz liegt am Meer.','Über dem Tor leuchtet ein Kristall.']
        : ['Eric','Lettoria','Nederland','Eric vindt de kaart.','Wij zoeken de schat.','De schat ligt bij de zee.','In het zand ligt een kist.','De kist is vol kristallen.'],
    };
    if (lesson.id === 22) return { ...lesson, exercises: german
      ? ['Der Wind weht stark.','Wir halten das Ruder fest.','Die Wellen sind hoch.','Eric zeigt uns den Weg.','Das Boot ist sicher im Hafen.','Der Sturm ist vorbei.']
      : ['De wind waait hard.','Wij houden het roer vast.','De golven zijn hoog.','Eric wijst ons de weg.','De boot is veilig in de haven.','De storm is voorbij.'] };
    return lesson;
  }) }));
}
