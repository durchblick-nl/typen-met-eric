import type { Metadata } from 'next';
import { BASE_PATH, COURSE_IDS, LANGUAGE } from './course';
import { t } from './i18n';

export function coursePageMetadata(path: string, sourceTitle: string): Metadata {
  const origin = 'https://lettoria.app';
  const title = t(sourceTitle);
  const canonical = `${origin}${BASE_PATH}${path}`;
  const languages = Object.fromEntries(COURSE_IDS.map(id => [
    {nl:'nl-NL',be:'nl-BE',de:'de-DE',ch:'de-CH'}[id],
    `${origin}${id==='nl'?'':`/${id}`}${path}`,
  ]));
  return {
    title,
    alternates: { canonical, languages },
    openGraph: {
      type:'website', locale:LANGUAGE.replace('-','_'), siteName:'Lettoria',
      title, url:canonical,
      description:t('Gratis online typecursus voor kinderen van 8-12 jaar. Leer blind typen met Eric de draak.'),
      images:[{url:'/images/posters/eric-hero.png',width:1200,height:630,alt:t('Eric de draak - Lettoria typecursus')}],
    },
  };
}
