import { COURSE, COURSE_IDS, COURSE_LABELS, IS_GERMAN } from '@/lib/course';

/** Full navigation swaps the statically exported curriculum and its local saves together. */
export function CourseSelector() {
 return <nav aria-label={IS_GERMAN?'Sprache und Tastatur':'Taal en toetsenbord'} className="relative z-20 bg-white/95 border-b border-eric-green/10 px-3 py-3">
  <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
   <span className="font-semibold text-eric-green mr-1">{IS_GERMAN?'Sprache & Tastatur:':'Taal & toetsenbord:'}</span>
   {COURSE_IDS.map(id=><a key={id} href={id==='nl'?'/':`/${id}/`} hrefLang={id==='de'?'de-DE':id==='ch'?'de-CH':id==='be'?'nl-BE':'nl-NL'} aria-current={id===COURSE?'page':undefined} className={`rounded-full border px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-eric-green ${id===COURSE?'bg-eric-green text-white border-eric-green':'text-eric-green border-eric-green/20 hover:bg-eric-green/10'}`}>
    {COURSE_LABELS[id]}
   </a>)}
  </div>
 </nav>;
}
