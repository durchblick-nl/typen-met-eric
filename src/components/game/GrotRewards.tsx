"use client";
import Image from "next/image";
import { useGameStore } from "@/lib/stores/gameStore";
import { useProgressStore } from "@/lib/stores/progressStore";
import { GROT_DECORATIONS } from "@/lib/magicFlight";
export function GrotRewards() {
  const { totalGems, grotDecorations, activeDecoration, decorateGrot } =
    useGameStore();
  const stars = useProgressStore((state) => state.totalStars);
  const eric = stars < 18 ? "baby" : stars < 45 ? "teen" : "happy";
  const decoration = GROT_DECORATIONS.find(
    (item) => item.id === activeDecoration,
  );
  return (
    <section className="max-w-4xl mx-auto mt-8 bg-white/75 rounded-3xl border border-eric-green/15 p-5 sm:p-7 flex flex-col sm:flex-row gap-6 items-center">
      <div className="relative w-40 h-36 shrink-0 rounded-2xl bg-eric-green/10 flex items-end justify-center">
        <Image
          src={`/images/eric/eric-${eric}.png`}
          alt={`Eric ${eric === "baby" ? "als jonge draak" : eric === "teen" ? "met groeiende vleugels" : "als grote draak"}`}
          width={130}
          height={130}
        />
        <span
          className="absolute right-2 top-2 text-4xl"
          aria-label={decoration?.name}
        >
          {decoration?.icon}
        </span>
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="text-2xl font-bold text-eric-green">Erics grot</h2>
          <span className="font-bold text-eric-green">
            ✦ {totalGems} kristallen
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 mb-4">
          Eric groeit met je lessterren. Verdien kristallen door goed te typen
          in de bonusspellen en maak zijn grot gezellig.
        </p>
        <div className="flex flex-wrap gap-2">
          {GROT_DECORATIONS.map((item) => {
            const owned = grotDecorations.includes(item.id);
            return (
              <button
                key={item.id}
                disabled={!owned && totalGems < item.cost}
                aria-pressed={activeDecoration === item.id}
                onClick={() => decorateGrot(item.id)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold disabled:opacity-50 ${activeDecoration === item.id ? "bg-eric-green text-white border-eric-green" : "border-eric-green/25 text-eric-green hover:bg-eric-green/10"}`}
              >
                {item.icon} {item.name} ·{" "}
                {owned
                  ? activeDecoration === item.id
                    ? "Gekozen"
                    : "Kiezen"
                  : `${item.cost} ✦`}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
