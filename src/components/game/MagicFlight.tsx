"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useKeyboard } from "@/lib/hooks/useKeyboard";
import {
  FLIGHT_DURATION_MS,
  FLIGHT_GOAL,
  initialFlight,
  flightTargets,
  typeFlight,
  flightElapsed,
} from "@/lib/magicFlight";
import { useGameStore } from "@/lib/stores/gameStore";
import { useProgressStore } from "@/lib/stores/progressStore";
import {
  ComfortSettings,
  useQuietMotion,
} from "@/components/settings/ComfortSettings";

type Phase = "ready" | "playing" | "paused" | "ended";
interface Props {
  lessonId: number;
  onExit: () => void;
  onNext: () => void;
  isLastLesson: boolean;
}
export function MagicFlight({ lessonId, onExit, onNext, isLastLesson }: Props) {
  const [phase, setPhase] = useState<Phase>("ready");
  const phaseRef = useRef<Phase>("ready");
  const [targets, setTargets] = useState<string[]>([]);
  const [flight, setFlight] = useState(initialFlight);
  const flightRef = useRef(initialFlight);
  const elapsed = useRef(0);
  const [time, setTime] = useState(FLIGHT_DURATION_MS);
  const [reward, setReward] = useState<{
    gems: number;
    record: boolean;
  } | null>(null);
  const settled = useRef(false);
  const panel = useRef<HTMLElement>(null);
  const quiet = useQuietMotion();
  const stars = useProgressStore((state) => state.totalStars);
  const ericImage =
    stars < 18 ? "eric-baby" : stars < 45 ? "eric-teen" : "eric-happy";
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const switchPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);
  const finish = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    switchPhase("ended");
    const result = useGameStore
      .getState()
      .finishMagicRun(
        String(lessonId),
        flightRef.current.correct,
        flightRef.current.score,
      );
    setReward(result);
  }, [lessonId, switchPhase]);
  const pause = useCallback(() => {
    if (phaseRef.current === "playing") switchPhase("paused");
  }, [switchPhase]);
  const resume = () => {
    if (document.hidden) return;
    panel.current?.focus();
    switchPhase("playing");
  };
  const start = () => {
    settled.current = false;
    elapsed.current = 0;
    flightRef.current = { ...initialFlight };
    setFlight({ ...initialFlight });
    setTargets(flightTargets(lessonId));
    setTime(FLIGHT_DURATION_MS);
    setReward(null);
    panel.current?.focus();
    switchPhase("playing");
  };
  useEffect(() => {
    if (phase !== "playing") return;
    let last = performance.now();
    const tick = setInterval(() => {
      if (phaseRef.current !== "playing") return;
      const now = performance.now();
      elapsed.current = flightElapsed(elapsed.current, last, now);
      last = now;
      setTime(FLIGHT_DURATION_MS - elapsed.current);
      if (elapsed.current >= FLIGHT_DURATION_MS) finish();
    }, 100);
    return () => clearInterval(tick);
  }, [phase, finish]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) pause();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !event.repeat) {
        event.preventDefault();
        if (phaseRef.current === "playing") pause();
        else if (phaseRef.current === "ended" || phaseRef.current === "ready")
          onExit();
      }
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("keydown", escape);
    };
  }, [pause, onExit]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  useKeyboard({
    scope: panel,
    enabled: phase === "playing",
    onKeyPress: (key) => {
      if (phaseRef.current !== "playing") return;
      const next = typeFlight(flightRef.current, key, targets);
      if (sound && !next.wrong && audio.current?.state === "running") {
        const context = audio.current;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 440 + (next.streak % 5) * 55;
        gain.gain.setValueAtTime(0.035, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + 0.09,
        );
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
      }
      flightRef.current = next;
      setFlight(next);
      if (next.correct >= FLIGHT_GOAL) finish();
    },
  });
  const toggleSound = async () => {
    panel.current?.focus();
    if (!sound) {
      try {
        audio.current ??= new AudioContext();
        await audio.current.resume();
        setSound(true);
      } catch {
        setSound(false);
      }
    } else setSound(false);
  };
  const target = targets[flight.tokenIndex] || "";
  const secondsLeft = Math.ceil(time / 1000);
  const timeLabel = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const progress = flight.correct / FLIGHT_GOAL;
  const checkpoint = Math.min(
    3,
    Math.floor(flight.correct / (FLIGHT_GOAL / 3)),
  );
  const button =
    "rounded-full px-5 py-3 font-semibold border border-eric-green/25 hover:bg-eric-green/10 focus-visible:outline-2 focus-visible:outline-eric-green";
  return (
    <section
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Erics magievlucht"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...(panel.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input:not([disabled])",
          ) || []),
        ];
        const first = controls[0],
          last = controls[controls.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === panel.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-perkament p-4 sm:p-8 outline-none"
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-eric-green text-sm font-semibold mb-1">
              LETTORIA · BONUSAVONTUUR
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-eric-green">
              Erics magievlucht
            </h1>
            <p className="text-gray-600 mt-2">
              Elke goede toets brengt de magie terug.
            </p>
          </div>
          <div className="flex gap-2">
            {phase === "playing" && (
              <button className={button} onClick={pause}>
                Pauze
              </button>
            )}
            <button className={button} onClick={onExit}>
              Afsluiten
            </button>
          </div>
        </header>
        <div className="flex items-center gap-3 sm:gap-6 mb-4 text-eric-green font-bold">
          <span className="shrink-0">
            ✦ Magie {flight.correct} / {FLIGHT_GOAL}
          </span>
          <div
            role="progressbar"
            aria-label="Magie"
            aria-valuenow={flight.correct}
            aria-valuemin={0}
            aria-valuemax={FLIGHT_GOAL}
            className="h-3 flex-1 rounded-full bg-eric-green/10 overflow-hidden"
          >
            <div
              className="h-full bg-eric-gold"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-mono tabular-nums" aria-label="Tijd over">
            {timeLabel}
          </span>
        </div>
        <div className="relative min-h-[430px] sm:min-h-[470px] rounded-3xl border-4 border-eric-gold/30 overflow-hidden bg-green-100">
          <Image
            src="/images/map/world-map-bg.png"
            alt="De magische wereld van Lettoria"
            fill
            className="object-cover"
            style={{ filter: `saturate(${0.35 + progress * 0.65})` }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-transparent" />
          <div
            className="absolute top-5 right-5 flex gap-3 sm:gap-5"
            aria-label={`${checkpoint} van 3 plekken verlicht`}
          >
            {["dorp", "woud", "kasteel"].map((place, index) => (
              <div
                key={place}
                className={`rounded-full p-2 border-2 ${index < checkpoint ? "bg-yellow-100 border-yellow-500" : "bg-white/75 border-white"}`}
              >
                <Image
                  src={`/images/map/icon-${place}.png`}
                  alt={["Het dorp", "Het woud", "Het kasteel"][index]}
                  width={44}
                  height={44}
                  className={index < checkpoint ? "" : "grayscale opacity-60"}
                />
              </div>
            ))}
          </div>
          <motion.div
            className="absolute bottom-6 left-1 sm:left-8 w-[130px] sm:w-[240px]"
            animate={{ x: progress * 70, y: quiet ? 0 : -progress * 50 }}
            transition={{ duration: quiet || phase !== "playing" ? 0 : 0.3 }}
          >
            <Image
              src={`/images/eric/${ericImage}.png`}
              alt="Eric helpt je de magie terug te brengen"
              width={280}
              height={280}
              priority
            />
            <div
              className="text-center text-2xl text-yellow-600"
              aria-hidden="true"
            >
              {"✦".repeat(checkpoint)}
            </div>
          </motion.div>
          <div className="relative z-10 flex min-h-[500px] sm:min-h-[470px] items-start sm:items-center justify-center px-3 pt-24 pb-40 sm:py-24 sm:pl-56 sm:pr-12">
            <div className="w-full max-w-lg rounded-3xl bg-perkament/95 border border-eric-gold/60 p-6 sm:p-10 text-center shadow-lg">
              {phase === "ready" && (
                <>
                  <h2 className="text-2xl font-bold text-eric-green mb-3">
                    Geef Eric zijn magie terug
                  </h2>
                  <p className="text-gray-700 mb-5">
                    Typ de letters op het scherm. Na 40 goede toetsen, of 60
                    seconden, is je vlucht klaar. Een fout? Probeer dezelfde
                    toets nog eens.
                  </p>
                  <p className="text-sm text-gray-600 mb-5">
                    Gebruik je eigen toetsenbord. Er zijn geen stuurtoetsen.
                  </p>
                  <button
                    className={`${button} bg-eric-green text-white hover:bg-eric-green/90`}
                    onClick={start}
                  >
                    Start de vlucht
                  </button>
                </>
              )}
              {phase === "playing" && (
                <>
                  <p className="text-eric-green font-semibold mb-3">
                    {target === " "
                      ? "Typ de spatie"
                      : target.length > 1
                        ? "Typ het woord"
                        : "Typ de letter"}
                  </p>
                  <div
                    data-testid="flight-target"
                    className="font-mono text-6xl sm:text-7xl font-bold text-eric-green min-h-[96px] break-all"
                  >
                    {[...target].map((letter, index) => (
                      <span
                        key={index}
                        className={
                          index < flight.charIndex
                            ? "text-eric-green/30"
                            : index === flight.charIndex
                              ? "underline decoration-eric-gold underline-offset-8"
                              : ""
                        }
                      >
                        {letter === " " ? "␣" : letter}
                      </span>
                    ))}
                  </div>
                  <p role="status" className="mt-5 text-gray-700 min-h-12">
                    {flight.wrong
                      ? "Bijna! Probeer de onderstreepte toets nog eens."
                      : flight.streak && flight.streak % 5 === 0
                        ? "Mooi ritme! Erics magie groeit."
                        : "Kijk naar het scherm. Je vingers weten de weg."}
                  </p>
                </>
              )}
              {phase === "paused" && (
                <>
                  <h2 className="text-3xl font-bold text-eric-green mb-4">
                    Even rust
                  </h2>
                  <p className="text-gray-700 mb-6">
                    De tijd en de magie staan stil. Ga verder wanneer jij wilt.
                  </p>
                  <button
                    className={`${button} bg-eric-green text-white hover:bg-eric-green/90`}
                    onClick={resume}
                  >
                    Verder vliegen
                  </button>
                </>
              )}
              {phase === "ended" && (
                <>
                  <h2 className="text-3xl font-bold text-eric-green mb-3">
                    {flight.correct >= FLIGHT_GOAL
                      ? "De magie is terug!"
                      : "Goed gevlogen!"}
                  </h2>
                  <p className="text-gray-700 mb-3">
                    {flight.correct} goede toetsen ·{" "}
                    {flight.attempts
                      ? Math.floor((flight.correct / flight.attempts) * 100)
                      : 0}
                    % nauwkeurig
                  </p>
                  <p className="font-bold text-eric-green mb-2">
                    +{reward?.gems ?? 0} kristallen voor Erics grot
                  </p>
                  {reward?.record && (
                    <p className="text-sm text-gray-600 mb-2">
                      Je beste magievlucht voor deze les!
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-5">
                    Een fijn moment voor een pauze. Jij kiest wat volgt.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      className={`${button} bg-eric-green text-white hover:bg-eric-green/90`}
                      onClick={onNext}
                    >
                      {isLastLesson ? "Naar de kaart" : "Volgende les"}
                    </button>
                    <button className={button} onClick={start}>
                      Nog een vlucht
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <footer className="flex flex-wrap justify-between gap-4 items-center mt-5 text-eric-green">
          <p>
            <strong>{flight.score}</strong> punten · Reeks{" "}
            <strong>{flight.streak}</strong> · Beste reeks{" "}
            <strong>{flight.bestStreak}</strong>
          </p>
          <div className="flex gap-4 items-center">
            <ComfortSettings onChange={() => panel.current?.focus()} />
            <button
              className="text-sm underline"
              aria-pressed={sound}
              onClick={toggleSound}
            >
              Geluid {sound ? "aan" : "uit"}
            </button>
          </div>
        </footer>
        <p className="text-center text-sm text-gray-600 mt-5">
          Een avontuur duurt maximaal 60 seconden. Esc pauzeert de vlucht.
        </p>
      </div>
    </section>
  );
}
