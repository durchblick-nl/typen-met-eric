"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  arcadeCourse,
  newArcade,
  advanceArcade,
  moveArcade,
  typeArcade,
  arcadeTurbo,
  arcadePosition,
  ARCADE_DURATION_MS,
} from "@/lib/arcadeFlight";
import { FlightDragon } from "./FlightDragon";
import { ArcadeMusic } from "@/lib/arcadeMusic";
import { isTrainingKey } from "@/lib/hooks/useKeyboard";
import { useGameStore } from "@/lib/stores/gameStore";
import { getLessonById } from "@/lib/data/regions";
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
export function ArcadeFlight({
  lessonId,
  onExit,
  onNext,
  isLastLesson,
}: Props) {
  const course = useMemo(() => arcadeCourse(lessonId), [lessonId]);
  const [state, setState] = useState(() => newArcade(course, 1));
  const stateRef = useRef(state);
  const [phase, setPhase] = useState<Phase>("ready");
  const phaseRef = useRef<Phase>("ready");
  const dialog = useRef<HTMLElement>(null);
  const settled = useRef(false);
  const [result, setResult] = useState<{
    gems: number;
    record: boolean;
  } | null>(null);
  const highScore = useGameStore(
    (store) => store.highScores[`arcade-${lessonId}`] || 0,
  );
  const [recordToBeat, setRecordToBeat] = useState(highScore);
  const quiet = useQuietMotion();
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const musicWanted = useRef(false);
  const music = useRef<ArcadeMusic | null>(null);
  const mounted = useRef(true);
  const playMusic = useCallback(() => {
    music.current ??= new ArcadeMusic();
    void music.current.play().catch(() => {
      if (
        mounted.current &&
        musicWanted.current &&
        phaseRef.current === "playing"
      ) {
        musicWanted.current = false;
        setMusicEnabled(false);
        setMusicError(true);
      }
    });
  }, []);
  const nextLesson = getLessonById(lessonId + 1)?.lesson;
  const changePhase = useCallback(
    (next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
      if (next === "playing" && musicWanted.current) playMusic();
      else music.current?.pause();
    },
    [playMusic],
  );
  const finish = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    changePhase("ended");
    const final = stateRef.current;
    setResult(
      useGameStore
        .getState()
        .finishArcadeRun(
          String(lessonId),
          final.hits,
          final.score,
          final.elapsedMs >= ARCADE_DURATION_MS && final.hearts > 0,
          final.collected,
        ),
    );
    dialog.current?.focus();
  }, [lessonId, changePhase]);
  const commit = useCallback((next: typeof state) => {
    stateRef.current = next;
    setState(next);
  }, []);
  const pause = useCallback(() => {
    if (phaseRef.current === "playing") changePhase("paused");
  }, [changePhase]);
  const start = () => {
    music.current?.restart();
    const next = newArcade(course);
    settled.current = false;
    setResult(null);
    setRecordToBeat(highScore);
    commit(next);
    changePhase("playing");
    dialog.current?.focus();
  };
  const resume = () => {
    if (document.hidden) return;
    changePhase("playing");
    dialog.current?.focus();
  };
  const chime = useCallback(
    (frequency: number) => {
      const context = audio.current;
      if (!sound || !context || context.state !== "running") return;
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.03, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    },
    [sound],
  );
  useEffect(() => {
    if (phase !== "playing") return;
    let last = performance.now(),
      frame = 0;
    const tick = (now: number) => {
      if (phaseRef.current !== "playing") return;
      const previous = stateRef.current;
      const next = advanceArcade(previous, now - last, course);
      last = now;
      commit(next);
      if (next.collected > previous.collected) chime(660);
      if (next.hearts < previous.hearts) chime(180);
      if (next.ended) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, course, commit, finish, chime]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) pause();
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return;
      if (
        !(event.target instanceof Node) ||
        !dialog.current?.contains(event.target)
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (phaseRef.current === "playing") pause();
        else if (phaseRef.current === "ready" || phaseRef.current === "ended")
          onExit();
        return;
      }
      if (phaseRef.current !== "playing") return;
      if (
        event.target instanceof Element &&
        event.target.closest('button, input, a, [contenteditable="true"]')
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        commit(
          moveArcade(stateRef.current, event.key === "ArrowLeft" ? -1 : 1),
        );
        return;
      }
      if (!isTrainingKey(event, dialog.current)) return;
      event.preventDefault();
      const previous = stateRef.current;
      const next = typeArcade(previous, event.key);
      commit(next);
      if (next.hits > previous.hits) chime(440 + (next.streak % 6) * 55);
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [pause, onExit, commit, chime]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      music.current?.dispose();
      void audio.current?.close();
    };
  }, []);
  const toggleMusic = () => {
    musicWanted.current = !musicWanted.current;
    setMusicEnabled(musicWanted.current);
    setMusicError(false);
    if (musicWanted.current && phaseRef.current === "playing") playMusic();
    else music.current?.pause();
    dialog.current?.focus();
  };
  const toggleSound = async () => {
    dialog.current?.focus();
    if (sound) {
      setSound(false);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      setSound(true);
    } catch {
      setSound(false);
    }
  };
  const turbo = arcadeTurbo(state);
  const seconds = Math.ceil((ARCADE_DURATION_MS - state.elapsedMs) / 1000);
  const player = arcadePosition(state.lane, 0.86);
  const button =
    "rounded-full px-5 py-2.5 font-bold border border-eric-green/25 hover:bg-eric-green/10 focus-visible:outline-2 focus-visible:outline-eric-green";
  const feedback =
    state.feedback && state.feedback.until > state.elapsedMs
      ? state.feedback.text
      : "Typ de letters. Pak kristallen. Ontwijk de rotsen.";
  const sceneFilter =
    course.regionId === "zee"
      ? "hue-rotate(12deg)"
      : course.regionId === "toppen"
        ? "saturate(.7)"
        : course.regionId === "woud"
          ? "saturate(1.15)"
          : undefined;
  return (
    <section
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Erics kristaljacht"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-perkament overflow-y-auto p-4 sm:p-7 outline-none"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...(dialog.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input:not([disabled])",
          ) || []),
        ];
        const first = controls[0],
          last = controls[controls.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-sm text-eric-green font-semibold">
              ARCADEBAAN {lessonId + 1} · {course.name}
            </p>
            <h1 className="text-3xl sm:text-4xl text-eric-green font-extrabold mt-1">
              Erics kristaljacht
            </h1>
            <p className="text-gray-600 mt-1">
              Typ, verzamel en vlieg naar een nieuw record.
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
        <div
          className="grid grid-cols-4 gap-2 sm:gap-5 text-center mb-4"
          aria-label="Spelstand"
        >
          <div className="rounded-xl bg-white/80 py-2">
            <p className="text-xs text-gray-600">Score</p>
            <strong
              data-testid="arcade-score"
              className="text-xl sm:text-2xl text-eric-green tabular-nums"
            >
              {state.score}
            </strong>
            <p className="text-xs text-gray-600">
              Record {recordToBeat || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 py-2">
            <p className="text-xs text-gray-600">Reeks</p>
            <strong className="text-xl sm:text-2xl text-eric-green">
              {state.streak}
            </strong>
            <p className="text-xs text-gray-600">Beste {state.bestStreak}</p>
          </div>
          <div className="rounded-xl bg-white/80 py-2">
            <p className="text-xs text-gray-600">Levens</p>
            <strong
              data-testid="arcade-hearts"
              aria-label={`${state.hearts} levens`}
              className="text-xl sm:text-2xl text-red-700 tracking-widest"
            >
              {"♥".repeat(Math.max(0, state.hearts))}
              <span className="text-gray-300">
                {"♡".repeat(3 - Math.max(0, state.hearts))}
              </span>
            </strong>
          </div>
          <div className="rounded-xl bg-white/80 py-2">
            <p className="text-xs text-gray-600">Tijd</p>
            <strong
              data-testid="arcade-time"
              className="font-mono text-xl sm:text-2xl text-eric-green tabular-nums"
            >
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </strong>
          </div>
        </div>
        <div
          data-testid="arcade-scene"
          className="relative h-[460px] sm:h-[490px] overflow-hidden rounded-3xl border-4 border-eric-gold/40 bg-green-100"
        >
          <Image
            src="/images/game/arcade-track.webp"
            alt="Een magische vliegroute door Lettoria"
            fill
            className="object-cover"
            style={{ filter: sceneFilter }}
            priority
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M45 20 L15 100 M55 20 L85 100"
              stroke="#fff9d4"
              strokeWidth=".55"
              strokeDasharray="3 3"
              opacity=".8"
            />
            <path
              d="M10 80.2 L90 80.2"
              stroke="#f6c33f"
              strokeWidth="1.1"
              opacity=".75"
            />
          </svg>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-56 max-w-[80%] z-20 bg-perkament/95 rounded-full border-2 border-eric-gold px-3 py-1.5">
            <div className="flex justify-between text-xs font-bold text-eric-green mb-1">
              <span>{turbo ? "TURBO + SCHILD" : "Turbo"}</span>
              <span>
                {turbo
                  ? `${Math.ceil((state.turboUntil - state.elapsedMs) / 1000)}s`
                  : `${state.streak % 6} / 6`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-eric-green/15 overflow-hidden">
              <div
                className="h-full bg-eric-gold"
                style={{
                  width: `${turbo ? ((state.turboUntil - state.elapsedMs) / 5500) * 100 : ((state.streak % 6) / 6) * 100}%`,
                }}
              />
            </div>
          </div>
          {state.objects.map((object) => {
            const position = arcadePosition(object.lane, object.depth);
            return (
              <div
                key={object.id}
                data-arcade-id={object.id}
                data-kind={object.kind}
                data-letter={object.key}
                data-depth={object.depth.toFixed(3)}
                data-lane={object.lane}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  zIndex: 10 + Math.floor(object.depth * 10),
                  transform: `translate(-50%,-50%) scale(${position.scale})`,
                  opacity: Math.min(1, 0.4 + object.depth * 3),
                }}
              >
                {object.kind === "letter" ? (
                  <div
                    className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center font-mono text-4xl sm:text-5xl font-bold border-[3px] shadow-lg ${object.depth >= 0.65 ? "bg-yellow-100 border-yellow-500 text-green-950" : "bg-green-100 border-eric-green text-green-950"}`}
                  >
                    {object.key === " " ? "␣" : object.key}
                  </div>
                ) : object.kind === "gem" ? (
                  <svg
                    width="48"
                    height="60"
                    viewBox="0 0 48 60"
                    aria-label="Kristal"
                  >
                    <path
                      d="M24 2 L43 20 L24 58 L5 20Z"
                      fill="#f7cc44"
                      stroke="#fff5ba"
                      strokeWidth="3"
                    />
                    <path d="M24 2L18 20L24 58L30 20Z" fill="#ffe67e" />
                    <path d="M5 20H43" stroke="#b67c17" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg
                    width="74"
                    height="62"
                    viewBox="0 0 74 62"
                    aria-label="Rots"
                  >
                    <path
                      d="M5 50L13 24L31 7L54 16L69 47L60 58L15 57Z"
                      fill="#56636a"
                      stroke="#f4af49"
                      strokeWidth="3"
                    />
                    <path d="M13 24L31 7L36 30L20 48Z" fill="#819096" />
                    <path d="M36 30L54 16L60 46L43 50Z" fill="#39484e" />
                  </svg>
                )}
              </div>
            );
          })}
          {phase === "playing" &&
            !quiet &&
            state.shot &&
            state.shot.until > state.elapsedMs && (
              <svg
                className="absolute inset-0 w-full h-full z-30 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1={player.x}
                  y1={player.y - 7}
                  x2={arcadePosition(state.shot.lane, state.shot.depth).x}
                  y2={arcadePosition(state.shot.lane, state.shot.depth).y}
                  stroke="#fff8ba"
                  strokeWidth="1"
                />
                <circle
                  cx={arcadePosition(state.shot.lane, state.shot.depth).x}
                  cy={arcadePosition(state.shot.lane, state.shot.depth).y}
                  r="2"
                  fill="#ffd700"
                />
              </svg>
            )}
          <div
            data-testid="arcade-player"
            data-lane={state.lane}
            className="absolute z-30 w-24 sm:w-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
              filter: turbo ? "drop-shadow(0 0 10px #ffdc47)" : undefined,
            }}
          >
            <FlightDragon
              timeMs={state.elapsedMs}
              quiet={Boolean(quiet)}
              turbo={turbo}
            />
            {turbo && (
              <div className="absolute inset-0 rounded-full border-2 border-eric-gold/80" />
            )}
          </div>
          {(phase === "ready" || phase === "paused" || phase === "ended") && (
            <div className="absolute inset-0 z-40 bg-eric-green/15 flex items-center justify-center p-4">
              <div className="bg-perkament/95 max-w-lg w-full rounded-3xl p-5 sm:p-7 shadow-xl border border-eric-gold text-center">
                {phase === "ready" && (
                  <>
                    <p className="text-xs font-bold text-eric-green mb-2">
                      DRIE STERREN. DEZE BAAN IS VAN JOU!
                    </p>
                    <h2 className="text-2xl sm:text-3xl text-eric-green font-bold mb-3">
                      Klaar voor de kristaljacht?
                    </h2>
                    <p className="text-gray-700 mb-3">
                      Met <kbd>←</kbd> en <kbd>→</kbd> wissel je van baan. Pak
                      kristallen en ontwijk de rotsen. Typ de letters om
                      magische doelen te raken.
                    </p>
                    <p className="text-gray-700 mb-3">
                      Zes goede letters op rij? Turbo! Dan krijg je dubbele
                      punten en een schild. Doelen bij de gouden lijn geven
                      extra punten.
                    </p>
                    <p className="text-sm text-gray-600 mb-5">
                      3 levens · maximaal 75 seconden · eigen toetsenbord nodig
                    </p>
                    <button
                      className={`${button} bg-eric-green text-white hover:bg-eric-green/90`}
                      onClick={start}
                    >
                      Start de kristaljacht
                    </button>
                  </>
                )}
                {phase === "paused" && (
                  <>
                    <h2 className="text-3xl text-eric-green font-bold mb-3">
                      Even pauze
                    </h2>
                    <p className="text-gray-700 mb-5">
                      De hele baan staat stil. Ga verder wanneer jij wilt.
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
                    <h2 className="text-3xl text-eric-green font-bold mb-2">
                      {result?.record
                        ? "Een nieuw record!"
                        : state.hearts > 0
                          ? "De finish is bereikt!"
                          : "Goed gevlogen!"}
                    </h2>
                    <p className="text-4xl font-extrabold text-eric-green mb-2">
                      {state.score} punten
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      {state.hits} magische doelen · {state.collected}{" "}
                      kristallen · beste reeks {state.bestStreak}
                    </p>
                    <p className="font-bold text-eric-green mb-4">
                      +{result?.gems ?? 0} kristallen voor Erics grot
                    </p>
                    {nextLesson && (
                      <p className="text-sm text-gray-700 mb-4">
                        Volgende uitdaging: les {lessonId + 2},{" "}
                        {nextLesson.title}. Met drie sterren speel je arcadebaan{" "}
                        {lessonId + 2} vrij.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        className={`${button} bg-eric-green text-white hover:bg-eric-green/90`}
                        onClick={onNext}
                      >
                        {isLastLesson ? "Naar de kaart" : "Volgende les"}
                      </button>
                      <button className={button} onClick={start}>
                        Nog een race
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <p
          role="status"
          className="text-center min-h-7 text-eric-green font-semibold mt-3"
        >
          {phase === "playing"
            ? feedback
            : "← → Wissel van baan · Typ de letters voor magie"}
        </p>
        <footer className="flex flex-wrap justify-between items-center gap-4 mt-3">
          <p className="text-sm text-gray-600">
            Je lessterren staan vast. Hier speel je voor je eigen record.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ComfortSettings onChange={() => dialog.current?.focus()} />
            <button
              className="text-sm text-eric-green underline"
              aria-pressed={musicEnabled}
              onClick={toggleMusic}
            >
              Muziek {musicEnabled ? "aan" : "uit"}
            </button>
            <button
              className="text-sm text-eric-green underline"
              aria-pressed={sound}
              onClick={toggleSound}
            >
              Effecten {sound ? "aan" : "uit"}
            </button>
          </div>
        </footer>
        {musicError && (
          <p role="status" className="mt-2 text-sm text-gray-600">
            De muziek kon niet starten. Probeer het nog eens met de muziekknop.
          </p>
        )}
      </div>
    </section>
  );
}
