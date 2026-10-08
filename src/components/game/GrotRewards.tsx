"use client";
import { useState } from "react";
import Image from "next/image";
import { EricPortrait } from "@/components/eric/EricPortrait";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/stores/gameStore";
import { useProgressStore } from "@/lib/stores/progressStore";
import { GROT_DECORATIONS } from "@/lib/magicFlight";
import { ericGrowth, nextJourneyLesson } from "@/lib/journey";
import { IllustratedProp, type PropName } from "./IllustratedProp";
import { useQuietMotion } from "@/components/settings/ComfortSettings";

const descriptions: Record<string, string> = {
  plant: "Geef de grot meer leven.",
  lantern: "Brengt warm licht in de grot.",
  stars: "Laat de grot stralen.",
};
const placements: Record<string, string> = {
  plant: "absolute w-[26%] left-[6%] bottom-[23%]",
  lantern: "absolute w-[20%] right-[7%] bottom-[27%]",
  stars: "absolute w-[27%] right-[11%] top-[1%]",
};
export function GrotRewards() {
  const { totalGems, grotDecorations, activeDecoration, decorateGrot } =
    useGameStore();
  const { totalStars, lessonStars } = useProgressStore();
  const growth = ericGrowth(totalStars);
  const next = nextJourneyLesson(lessonStars);
  const quiet = useQuietMotion();
  const [message, setMessage] = useState("");
  const choose = (id: string, name: string) => {
    decorateGrot(id);
    setMessage(
      useGameStore.getState().activeDecoration === id
        ? `${name} staat nu in Erics grot!`
        : `${name} is opgeborgen. Je kunt hem weer kiezen.`,
    );
  };
  return (
    <section
      id="erics-grot"
      aria-labelledby="grot-heading"
      className="mt-8 rounded-3xl border border-eric-gold/30 bg-white/40 p-4 sm:p-6 grid lg:grid-cols-[3fr_2fr] gap-6"
    >
      <div>
        <h2
          id="grot-heading"
          className="text-3xl sm:text-4xl font-bold text-eric-green"
        >
          Erics grot
        </h2>
        <p className="text-gray-600 mt-2 mb-4">
          Een thuis dat met je meegroeit.
        </p>
        <div
          data-testid="grot-scene"
          className="relative aspect-[8/5] overflow-hidden rounded-2xl bg-orange-100"
        >
          <Image
            src="/images/game/grot-home.webp"
            alt="Erics gezellige grot met uitzicht op Lettoria"
            fill
            className="object-cover"
          />
          {activeDecoration && placements[activeDecoration] && (
            <IllustratedProp
              name={activeDecoration as PropName}
              label={
                GROT_DECORATIONS.find((item) => item.id === activeDecoration)
                  ?.name
              }
              className={placements[activeDecoration]}
            />
          )}
          {totalStars > 0 && (
            <IllustratedProp
              name="chest"
              className="absolute w-[23%] right-[4%] bottom-[6%]"
            />
          )}
          <motion.div
            className="absolute w-[36%] left-[34%] bottom-[9%]"
            animate={{ y: quiet ? 0 : [0, -3, 0] }}
            transition={{
              duration: quiet ? 0 : 3,
              repeat: quiet ? 0 : Infinity,
            }}
          >
            <EricPortrait
              stage={growth.stage}
              label={`Eric: ${growth.name.toLowerCase()}`}
              className="w-full"
            />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col lg:pt-1">
        <div className="flex items-center gap-2 text-eric-green">
          <IllustratedProp name="gem" className="w-12" />
          <span data-testid="grot-balance" className="text-2xl font-bold">
            {totalGems} kristallen
          </span>
        </div>
        <div className="flex items-center gap-3 my-4">
          <EricPortrait stage={growth.stage} className="w-[58px]" />
          <div className="flex-1">
            <h3 className="font-bold text-eric-green">{growth.name}</h3>
            <div
              role="progressbar"
              aria-label="Erics groei"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(growth.progress)}
              className="h-2.5 bg-eric-green/15 rounded-full overflow-hidden my-2"
            >
              <div
                className="h-full bg-gradient-to-r from-eric-green to-eric-gold"
                style={{ width: `${growth.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {growth.remaining
                ? `Nog ${growth.remaining} lessterren tot de volgende groei.`
                : "Eric is uitgegroeid tot een grote draak!"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {GROT_DECORATIONS.map((item) => {
            const owned = grotDecorations.includes(item.id),
              selected = activeDecoration === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-2xl bg-white/65 border border-eric-green/10 p-2 sm:p-3"
              >
                <IllustratedProp
                  name={item.id as PropName}
                  className="w-14 sm:w-16"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-eric-green text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {descriptions[item.id]}
                  </p>
                </div>
                <button
                  disabled={!owned && totalGems < item.cost}
                  aria-pressed={selected}
                  onClick={() => choose(item.id, item.name)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs sm:text-sm font-bold border disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? "bg-eric-green text-white border-eric-green" : "text-eric-green border-eric-green/30 hover:bg-eric-green/10"}`}
                >
                  {owned
                    ? selected
                      ? "✓ Gekozen"
                      : "Kiezen"
                    : `${item.cost} kristallen`}
                </button>
              </div>
            );
          })}
        </div>
        <Link
          href={next ? `/les/${next.lesson.id}` : "/diploma"}
          className="mt-4 block text-center py-3 rounded-full border-2 border-eric-green text-eric-green font-bold hover:bg-eric-green/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {next ? "Op avontuur" : "Bekijk je diploma"}{" "}
          <span aria-hidden="true">→</span>
        </Link>
        <p
          role="status"
          className="min-h-10 mt-3 text-xs text-gray-600 text-center"
        >
          {message ||
            "Verdien kristallen in de bonusspellen. Je versiering blijft bewaard."}
        </p>
      </div>
    </section>
  );
}
