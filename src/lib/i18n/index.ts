import { COURSE, IS_GERMAN, regionalGerman } from '../course';
import german from './de.json';
const translations: Record<string,string> = german;
const belgian: Record<string,string> = {
 'De thuisrij: A S D F J K L ;':'De thuisrij: Q S D F J K L M',
 'De bovenste rij: Q W E R T Y U I O P':'De bovenste rij: A Z E R T Y U I O P',
 'De onderste rij: Z X C V B N M':'De onderste rij: W X C V B N ,',
};
/** Dutch source copy remains the stable lookup key, shared by server and client. */
export function t(source:string, values:Record<string,string|number> = {}): string {
 const text=IS_GERMAN ? regionalGerman(translations[source] ?? source) : COURSE==='be' ? belgian[source]??source : source;
 return text.replace(/\{(\w+)\}/g,(match,key)=>values[key]===undefined?match:String(values[key]));
}
