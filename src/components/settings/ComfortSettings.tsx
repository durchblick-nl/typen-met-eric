"use client";
import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useComfortStore = create<{
  calm: boolean;
  setCalm: (calm: boolean) => void;
}>()(
  persist((set) => ({ calm: false, setCalm: (calm) => set({ calm }) }), {
    name: "lettoria-comfort",
  }),
);
export function ComfortProvider({ children }: { children: React.ReactNode }) {
  const calm = useComfortStore((state) => state.calm);
  useEffect(() => {
    document.documentElement.dataset.calm = String(calm);
  }, [calm]);
  return (
    <MotionConfig reducedMotion={calm ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
function useOSReducedMotion() {
  const [osCalm, setOsCalm] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOsCalm(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return osCalm;
}
export function useQuietMotion() {
  const calm = useComfortStore((state) => state.calm);
  const osCalm = useOSReducedMotion();
  return calm || osCalm;
}
export function ComfortSettings({ onChange }: { onChange?: () => void } = {}) {
  const { calm, setCalm } = useComfortStore();
  const osCalm = useOSReducedMotion();
  return (
    <label className="inline-flex items-center gap-2 text-sm text-eric-green">
      <input
        type="checkbox"
        checked={calm || osCalm}
        disabled={osCalm}
        onChange={(e) => {
          setCalm(e.target.checked);
          e.target.blur();
          onChange?.();
        }}
      />
      Rustige weergave{osCalm ? " (apparaatinstelling)" : ""}
    </label>
  );
}
