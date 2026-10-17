import { COURSE, type CourseId } from './course';

export interface TrainingKey { key: string; finger: number; shift?: string; }
export interface KeyboardLayout { rows: TrainingKey[][]; homeKeys: string[]; }
const fingers = [[0,1,2,3,3,4,4,5,6,7,7,7],[0,1,2,3,3,4,4,5,6,7,7,7],[0,1,2,3,3,4,4,5,6,7,7,7],[0,1,2,3,3,4,4,5,6,7]];
function layout(rows: string[][], shifted: Record<string,string> = {}): KeyboardLayout {
  return { rows: rows.map((r,i)=>r.map((key,j)=>({key,finger:fingers[i][j],shift:shifted[key]}))), homeKeys: rows[2].filter((_,i)=>![4,5].includes(i)).slice(0,8) };
}
const numbers = ['1','2','3','4','5','6','7','8','9','0'];
export const KEYBOARDS: Record<CourseId, KeyboardLayout> = {
  nl: layout([numbers,[...'qwertyuiop'],[...'asdfghjkl;'],[...'zxcvbnm,.']]),
  be: layout([[...'&é"\'(§è!çà'],[...'azertyuiop'],[...'qsdfghjklmù'],[...'wxcvbn,;:=']],{'&':'1','é':'2','"':'3',"'":'4','(':'5','§':'6','è':'7','!':'8','ç':'9','à':'0',';':'.',',':'?',':':'/','=':'+'}),
  de: layout([[...numbers,'ß'],[...'qwertzuiopü'],[...'asdfghjklöä'],[...'yxcvbnm,.-']]),
  ch: layout([[...numbers,"'"],[...'qwertzuiopü'],[...'asdfghjklöä'],[...'yxcvbnm,.-']]),
};
export function keyGuidance(character: string, course: CourseId = COURSE): {key:string;finger:number;shift:boolean;shiftHand:'left'|'right'|null} | undefined {
  if (character === ' ') return {key:' ',finger:8,shift:false,shiftHand:null};
  const lower=character.toLowerCase();
  for(const row of KEYBOARDS[course].rows)for(const key of row){
    const shifted = key.shift === character || (lower !== character && key.key === lower);
    if(key.key===lower || key.shift===character) return {key:key.key,finger:key.finger,shift:shifted,shiftHand:shifted ? (key.finger<=3?'right':'left') : null};
  }
  return undefined;
}

/** Extra headroom for a two-key Shift action; ordinary keys retain their pace. */
export function keyReactionFactor(character: string, course: CourseId = COURSE): number {
  return keyGuidance(character, course)?.shift ? 1.25 : 1;
}
