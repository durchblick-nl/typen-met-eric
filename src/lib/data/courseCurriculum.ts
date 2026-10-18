import { COURSE, type CourseId } from '../course';
import type { Region, Lesson } from './regions';
import { structurePractice } from './practiceSequence';
import { uppercasePractice } from './uppercasePractice';

const names = ['Erics Höhle','Das Startdorf','Die flinken Felder','Der Flüsterwald','Die Sprachgipfel','Das schnelle Meer','Schloss Vollendung'];
const titles = ['Hallo, Eric!','Bäcker und Wächter','Schmied und Laternenmacher','Arzt und Uhrmacher','Gastwirt und Holzfäller','Der Marktplatz','Bauer und Imkerin','Müller und Eule','Turmwächter und Zaubertier','Töpfer und Großvater','Narr und Wahrsagerin','Zauberer und Nachtigall','Hexe und Waldfee','Zentaur und Fuchs','Der Bär erwacht','Der erste Aufstieg','Die Kristallhöhle','Der Wolkenweg','Auf dem Gipfel','Der Hafen','Das Delfinrennen','Die Schatzkarte','Durch den Sturm','Das Schlosstor','Der Rittersaal','Der Thronsaal'];
const intros = [
 'Hallo! Ich bin Eric, der Drache aus Lettoria. Die Magie ist verschwunden und ich kann nicht mehr fliegen. Hilfst du mir? Lege deine Zeigefinger auf F und J und fühle die kleinen Erhebungen.',
 'Das Dorf ist grau geworden. Der Bäcker und der Wächter brauchen deine Hilfe. Mit jeder richtigen Taste kehrt ein Stück Magie zurück.',
 'Der Schmied vermisst seinen Hammerklang. Der Laternenmacher wartet auf Licht. Bring ihre Werkstätten wieder zum Leuchten!',
 'Der Arzt möchte wieder helfen. Doch auch die Dorfuhr steht still. Deine neuen Tasten bringen alles in Bewegung.',
 'Im Gasthaus ist es kalt. Der Holzfäller braucht Kraft für neues Holz. Hilf beiden mit deinen Tasten!',
 'Auf dem Marktplatz sollen wieder alle zusammenkommen. Mit der Leertaste lässt du Platz zwischen den Wörtern. Beide Daumen dürfen helfen.',
 'Die Felder sind leer und die Bienen still. Bauer und Imkerin warten auf dich. Erwecke die Felder zum Leben!',
 'Die Mühle dreht sich nicht mehr. Auch die Eule hat ihren Flug verlernt. Bringe Wind und Magie zurück!',
 'Der Turmwächter sieht ein Zaubertier in der Ferne. Doch sein Licht ist erloschen. Deine Tasten lassen es wieder strahlen.',
 'Der Töpfer hat seinen Ton verloren. Sein Großvater erinnert sich an ein altes Geheimnis. Gemeinsam können wir helfen!',
 'Der Narr hat seine Witze vergessen. Die Wahrsagerin sieht nur Nebel. Deine Tasten bringen Freude und Klarheit zurück.',
 'Der Flüsterwald ist dunkel und still. Ein Zauberer sucht sein Buch und eine Nachtigall ihr Lied. Hilf ihnen mit deinen neuen Tasten!',
 'Tief im Wald warten eine Hexe und eine Waldfee. Ihre Pflanzen blühen nicht mehr. Bring die Farben zurück!',
 'Ein Zentaur und ein Fuchs kennen den Weg durch den Wald. Doch die Pfade sind verschwunden. Lass sie wieder sichtbar werden!',
 'Der Bär schläft viel zu lange. Mit deinen Tasten weckst du den Beschützer des Waldes. Punkt und Komma geben deinen Sätzen eine Pause.',
 'Die Sprachgipfel ragen hoch über Lettoria. Hier beginnt dein Aufstieg mit den ersten drei Ziffern.',
 'Auf halbem Weg liegt eine dunkle Kristallhöhle. Drei weitere Ziffern lassen die Kristalle wieder leuchten.',
 'Über den Wolken liegt ein geheimer Weg. Mit den nächsten Ziffern öffnest du das Tor zum Gipfel.',
 'Nur noch eine Ziffer fehlt: die Null. Mit ihr erreichst du den höchsten Gipfel!',
 'Die Schiffe warten im Hafen. Übe kurze Wörter und bring ihre Segel wieder zum Leuchten. Genauigkeit ist wichtiger als Tempo.',
 'Delfine begleiten uns über das Meer. Mit längeren Wörtern hilfst du ihnen, den Weg zu finden.',
 'Eine Schatzkarte ist aufgetaucht! Lies die Sätze und tippe sie sorgfältig ab. So finden wir den verborgenen Schatz.',
 'Ein Sturm zieht auf. Bleib ruhig und tippe genau. Zusammen bringen wir das Schiff sicher in den Hafen.',
 'Schloss Vollendung liegt vor uns. Sein Tor öffnet sich nur mit den richtigen Tasten. Zeig, was du gelernt hast!',
 'Im Rittersaal sind alle Fackeln erloschen. Mit Buchstaben und Ziffern bringst du das Licht zurück.',
 'Im Thronsaal wartet die letzte Aufgabe. Tippe die magischen Sätze und gib Eric seine ganze Kraft zurück!'
];
const outros = [
 'Wunderbar! Ich spüre wieder ein wenig Wärme. Gemeinsam retten wir Lettoria!',
 'Der Ofen brennt wieder und die Laterne leuchtet. Das Dorf bekommt seine Farben zurück!',
 'Der Hammer klingt und die Laternen leuchten. Gut gemacht!',
 'Die Praxis öffnet und die Dorfuhr schlägt wieder. Du hast geholfen!',
 'Das Feuer knistert im Gasthaus. Alle freuen sich über deine Hilfe!',
 'Der Markt ist wieder offen. Erics Flügel kribbeln vor Freude!',
 'Das Korn wächst und die Bienen summen. Die Felder leuchten wieder!',
 'Die Mühle dreht sich und die Eule fliegt. Ein neuer Weg ist frei!',
 'Das Turmlicht strahlt über die Felder. Das Zaubertier findet nach Hause!',
 'Der Töpfer formt neue Vasen und der Großvater erzählt wieder Geschichten.',
 'Alle lachen über den Narren. Die Zukunft sieht wieder hell aus!',
 'Das Zauberbuch ist gefunden und die Nachtigall singt. Der Wald erwacht!',
 'Die Pflanzen blühen wieder. Die Hexe und die Waldfee danken dir!',
 'Die Waldwege sind wieder da. Alle können sicher nach Hause finden!',
 'Der Bär ist wach. Im Flüsterwald sind wieder leise Geschichten zu hören!',
 'Deine ersten Schritte am Berg sind geschafft. Die Ziffern leuchten im Fels!',
 'Die Kristalle funkeln in allen Farben. Du kommst dem Gipfel näher!',
 'Der Wolkenweg trägt dich weiter. Fast geschafft!',
 'Du stehst auf dem Gipfel! Alle Ziffern sind zurück und Erics Flügel werden stärker.',
 'Die Segel füllen sich mit Wind. Die Reise geht weiter!',
 'Die Delfine springen vor Freude. Du wirst immer sicherer!',
 'Der Schatz ist gefunden: eine Kiste voller magischer Kristalle!',
 'Das Schiff ist sicher im Hafen. Eric kann wieder über die Wellen fliegen!',
 'Das Schlosstor schwingt auf. Du darfst eintreten!',
 'Die Fackeln brennen. Die Ritter verbeugen sich vor dir!',
 'Eric verwandelt sich! Seine Flügel sind stark und sein magisches Feuer ist zurück. Du hast Lettoria gerettet!'
];
// Authored German exercises. Each lesson uses only its cumulative taught keys.
const germanExercises: string[][] = [
 ['fff','jjj','fjfj','jfjf','ffjj','jjff','fjfjfj','jfjfjf'],
 ['aaa','ööö','aöaö','öaöa','faöj','aföj','jaöf','faja'],
 ['sss','lll','als','all','fall','lass','saal','falls'],
 ['ddd','kkk','das','da','dass','kalk','fass','lass','als'],
 ['ggg','hhh','hals','glas','hall','lag','kahl','sag','aha'],
 ['f j','d k','s l','a ö','g h','das glas','das fass','sag das','da lag das fass','da lag das glas'],
 ['eee','iii','die','das','das eis','die heide','die fee','die seide','die helle halle'],
 ['rrr','uuu','der','die uhr','das rad','der hase','die ruhe','die freie fee','der held'],
 ['ttt','zzz','zeit','der reiter','die katze','die zarte fee','das tier ruht','der reiter ist da'],
 ['ooo','ppp','üüü','opa','rot','die tür','der topf','die tür ist auf','opa ruht hier'],
 ['qqq','www','quark','wer','wasser','die wolke','wer ist hier','die quelle ist klar'],
 ['yyy','mmm','am','meer','warm','das meer','die maus','die maus mag reis','magie am meer'],
 ['xxx','nnn','äää','max','name','hände','die mäuse','der mond ist rund','wir sind im wald'],
 ['ccc','vvv','vier','viel','von','eric','vier kleine tiere','eric fliegt weit','wir sehen viel'],
 ['bbb','...', ',.,.','der bär.','die bäume.','eric, komm her.','das boot ist im wasser.','die straße ist breit.'],
 ['111','222','333','1, 2, 3','3, 2, 1','ich sehe 2 bäume.','hier sind 3 bären.'],
 ['444','555','666','4, 5, 6','6, 5, 4','wir sehen 4 boote.','der bär hat 5 beeren.'],
 ['777','888','999','7, 8, 9','9, 8, 7','wir sehen 8 wolken.','hier sind 9 drachen.'],
 ['000','10','20','100','1234567890','ich sehe 10 boote.','wir haben 100 kristalle.'],
 ['meer','boot','wald','baum','licht','magie','drache','eric','hafen','welle'],
 ['zauberwald','kristalle','schatzkarte','delfine','ritter','leuchtturm','abenteuer','schlosstor'],
 ['eric findet die karte.','wir suchen den schatz.','der schatz liegt am meer.','im sand liegt eine kiste.','die kiste ist voller kristalle.','wir tragen sie zum boot.'],
 ['der wind weht stark.','wir halten das ruder fest.','die wellen sind hoch.','eric zeigt uns den weg.','das boot ist sicher im hafen.','der sturm ist vorbei.'],
 ['qwertz uiopü.','asdfg hjklöä.','das tor ist offen.','wir betreten das schloss.','der ritter wartet auf uns.','eric fliegt über den turm.'],
 ['yxcvb nm.','wir sehen 5 ritter.','im saal stehen 10 schilde.','3 drachen warten am tor.','wir haben 100 kristalle.','alle fackeln leuchten.'],
 ['eric ist ein grüner drache.','er wohnt in einer höhle in lettoria.','wir haben alle buchstaben gelernt.','eric kann wieder feuer speien.','die magie ist zurück in lettoria.','du hast lettoria gerettet.']
];
export function createCurriculum(original: Region[], course: CourseId = COURSE): Region[] {
 if(course==='nl') return structurePractice(uppercasePractice(original, course), course);
 const german=course==='de'||course==='ch';
 const learned = new Set<string>();
 const regions = original.map((region,ri)=>({ ...region,
   name:german ? regional(names[ri],course) : region.name,
   description:german ? ['Hier beginnt dein Abenteuer mit Eric','Die Grundreihe auf deiner Tastatur','Die obere Buchstabenreihe','Die untere Buchstabenreihe','Ziffern und die Umschalttaste','Wörter und Sätze sicher tippen','Rette Lettoria mit allen gelernten Tasten'][ri] : region.description.replace('A S D F G H J K L ;','Q S D F G H J K L M').replace('Q W E R T Y U I O P','A Z E R T Y U I O P').replace('Z X C V B N M','W X C V B N ,'),
   lessons:region.lessons.map(lesson=>{
    let keys=[...lesson.newKeys];
    if(course==='be') {const remap:Record<string,string>={a:'q',';':'m',q:'a',w:'z',z:'w',m:','};keys=keys.map(k=>remap[k]||k);if(lesson.id===14)keys=[...keys,';'];}
    if(german){const remap:Record<string,string>={';':'ö',y:'z',z:'y'};keys=keys.map(k=>remap[k]||k);if(lesson.id===9)keys.push('ü');if(lesson.id===12)keys.push('ä');if(lesson.id===14&&course==='de')keys.push('ß');}
    keys=keys.filter(k=>!learned.has(k));
    keys.forEach(k=>learned.add(k));
    const drills=keys.filter(k=>k!==' ').flatMap(k=>[k.repeat(3),k+'f'+k+'j','f'+k+'j'+k]);
    let exercises=german ? germanExercises[lesson.id].map(s=>regional(s,course)) : lesson.exercises.filter(s=>[...s].every(c=>learned.has(c)));
    // Keep BE words meaningful rather than substituting characters inside Dutch words.
    if(course==='be'){
      const pool=['juf','klas','glas','dag','jas','dak','hal','slak','sjaal','kaas','de held','ik lees','de heks','de uil','ruis','de rust','tijd','hier is eric','opa','de poes','azalea','water','zout','waar is de maan','de wolk','wij wonen hier','een mix','ik zie de zon','vier vissen','eric vliegt','de beer slaapt.','wij zijn blij, de brug is klaar.'];
      exercises=[...exercises,...pool.filter(s=>[...s].every(c=>learned.has(c))).slice(-6)];
    }
    if(course==='be') {const join=learned.has(' ')?' ':'';for(const key of [...learned].filter(k=>k!==' ').slice(-6))exercises.push(key+join+'f'+join+key+join+'j');}
    exercises=[...new Set([...drills,...exercises])];
    const visible=keys.map(k=>k===' '?(german?'Leertaste':'spatie'):(k==='ß'?k:k.toUpperCase())).join(' · ');
    const shiftNote=course==='be' && (lesson.id===14||lesson.id>=15&&lesson.id<=18) ? ' Voor een punt en voor cijfers houd je Shift ingedrukt met de andere hand. Laat Shift los voor de volgende letter.' : '';
    let intro=lesson.storyIntro;
    if(course==='be') {const from=lesson.newKeys.filter(k=>k!==' '),to=keys;from.forEach((k,i)=>{if(to[i]!==k)intro=intro.replace(new RegExp(`(?<![A-Za-z])${k.toUpperCase()}(?![A-Za-z])`,'g'),to[i].toUpperCase());});}
    return {...lesson,title:german?regional(titles[lesson.id],course):lesson.title,
      description:keys.length ? (german?'Neue Tasten: ':'Nieuwe toetsen: ')+visible : (german?'Übe Wörter und Sätze mit deinen gelernten Tasten.':lesson.description),
      newKeys:keys, exercises,
      storyIntro:german?regional(intros[lesson.id],course):intro+shiftNote,
      storyOutro:german?regional(outros[lesson.id],course):lesson.storyOutro,
    } satisfies Lesson;
   })
 }));
 return structurePractice(uppercasePractice(regions, course), course);
}
function regional(text:string,course:CourseId){return course==='ch'?text.replace(/ß/g,'ss'):text;}
