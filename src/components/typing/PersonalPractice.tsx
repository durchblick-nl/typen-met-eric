'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { personalPractice, mergePracticeStats } from '@/lib/personalPractice';
import { useProgressStore } from '@/lib/stores/progressStore';
import { useTypingStore, type KeyStat } from '@/lib/stores/typingStore';
import { TypingArea } from './TypingArea';
import { VirtualKeyboard } from './VirtualKeyboard';

function buildPlan(variant = 0) {
  const saved = useProgressStore.getState();
  return personalPractice(saved.keyStats, saved.lessonStars, variant);
}

const button = 'rounded-full px-5 py-3 font-semibold border border-eric-green/30 text-eric-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eric-green';
const visible = (key: string) => key === ' ' ? '␣' : key;
const ratio = (stat?: KeyStat) => stat?.attempts ? `${Math.floor((stat.attempts - stat.errors) / stat.attempts * 100)}% (${stat.attempts})` : '—';

export function PersonalPractice({ onExit }: { onExit: () => void }) {
  const [plan, setPlan] = useState(() => buildPlan());
  const [phase, setPhase] = useState<'ready' | 'typing' | 'result'>('ready');
  const [index, setIndex] = useState(0);
  const [totals, setTotals] = useState<Record<string, KeyStat>>({});
  const variant = useRef(0);
  const recorded = useRef(-1);
  const advanced = useRef(-1);
  const heading = useRef<HTMLHeadingElement>(null);
  const finished = useTypingStore(state => state.isComplete);
  const target = useTypingStore(state => state.targetText);
  const expected = plan.exercises[index];
  const complete = finished && target === expected;

  useEffect(() => { if (phase !== 'typing') heading.current?.focus(); }, [phase]);
  useEffect(() => {
    if (phase === 'typing' && expected) useTypingStore.getState().setTargetText(expected);
  }, [phase, index, expected]);

  const settle = () => {
    const live = useTypingStore.getState();
    if (phase !== 'typing' || recorded.current === index || !live.isComplete || live.targetText !== expected) return;
    recorded.current = index;
    // The ref is set before either update; rerenders never save a task twice.
    useProgressStore.getState().recordPractice(live.keyStats);
    setTotals(previous => mergePracticeStats(previous, live.keyStats));
  };
  useEffect(() => { if (complete) settle(); }, [complete, phase, index, expected]);

  const next = () => {
    const live = useTypingStore.getState();
    if (advanced.current === index || !live.isComplete || live.targetText !== expected) return;
    advanced.current = index;
    settle();
    if (index === plan.exercises.length - 1) setPhase('result');
    else setIndex(value => value + 1);
  };
  const start = () => {
    setPlan(buildPlan(variant.current++));
    recorded.current = -1;
    advanced.current = -1;
    setTotals({});
    setIndex(0);
    setPhase('typing');
  };

  return <section className="max-w-4xl mx-auto" data-testid="personal-practice">
    <h2 ref={heading} tabIndex={-1} className="text-2xl font-bold text-eric-green mb-4 outline-none">{t('Jouw toetsentraining')}</h2>
    <p className="text-gray-700 mb-5">{t('Je oefent toetsen waarbij eerder fouten zijn geteld. Drie korte opdrachten, zonder tijdslimiet of lessterren. Je cijfers blijven in deze browser.')}</p>
    <p className="text-sm text-gray-600 mb-5">{t('Gebruik een fysiek toetsenbord. Alleen afgeronde opdrachten worden aan je oefencijfers toegevoegd.')}</p>
    {!plan.keys.length ? <div className="rounded-2xl bg-white p-6 space-y-4">
      <p>{t('Er zijn nog geen toetsen met opgeslagen fouten om te oefenen. Doe eerst een les, of oefen rustig verder op de thuisrij.')}</p>
      <Link href="/kaart" className={button}>{t('Naar de kaart')}</Link>
    </div> : <>
      <p className="mb-4 text-gray-700">{t('Deze ronde:')} <strong className="font-mono text-eric-green">{plan.keys.map(visible).join(' · ')}</strong></p>
      {phase === 'ready' && <div className="rounded-2xl bg-white p-6 space-y-4">
        <p>{t('Neem je tijd. Typ met de aangegeven vinger. Een fout laat het doel staan. Je kunt na elke opdracht stoppen.')}</p>
        <button onClick={start} className={`${button} bg-eric-green text-white`}>{t('Start mijn toetsentraining')}</button>
      </div>}
      {phase === 'typing' && <>
        <p className="mb-4 font-semibold text-eric-green">{t('Oefening {n} van {total}', { n: index + 1, total: plan.exercises.length })}</p>
        <TypingArea />
        {complete && <div className="my-5" role="status">
          <p className="mb-3 text-eric-green font-semibold">{t('Deze opdracht is klaar. Je oefencijfers zijn bewaard.')}</p>
          <button onClick={next} className={`${button} bg-eric-green text-white`}>{index === plan.exercises.length - 1 ? t('Bekijk mijn oefenronde') : t('Volgende opdracht')}</button>
        </div>}
        <div className="mt-6 flex justify-center"><VirtualKeyboard showFingerHints /></div>
      </>}
      {phase === 'result' && <div className="rounded-2xl bg-white p-5 sm:p-7" data-testid="personal-result">
        <h3 className="text-xl font-bold text-eric-green mb-3">{t('Goed geoefend!')}</h3>
        <p className="text-gray-700 mb-4">{t('Dit zijn je cijfers voor de gekozen toetsen. De percentages tellen juiste aanslagen uit alle pogingen; tussen haakjes staat het aantal pogingen.')}</p>
        <table className="w-full text-left text-sm mb-4">
          <thead><tr><th className="p-2">{t('Toets')}</th><th className="p-2">{t('Eerder opgeslagen')}</th><th className="p-2">{t('Deze ronde')}</th></tr></thead>
          <tbody>{plan.keys.map(key => <tr key={key} className="border-t"><th className="p-2 font-mono">{visible(key)}</th><td className="p-2">{ratio(plan.baseline[key])}</td><td className="p-2">{ratio(totals[key])}</td></tr>)}</tbody>
        </table>
        <p className="text-sm text-gray-600 mb-5">{t('Een korte ronde kan anders uitvallen dan eerdere oefeningen. Dit is geen toets van blijvende beheersing. Je lessterren veranderen niet.')}</p>
        <button onClick={start} className={button}>{t('Nog een korte ronde')}</button>
      </div>}
    </>}
    <div className="flex flex-wrap items-center gap-4 mt-6">
      <button onClick={() => { settle(); onExit(); }} className={button}>{t('Stoppen met toetsentraining')}</button>
      <Link href="/privacy" className="text-eric-green underline text-sm">{t('Hoe worden mijn oefencijfers bewaard?')}</Link>
    </div>
  </section>;
}
