import type { CSSProperties } from "react";

export type PropName = "gem" | "rock" | "plant" | "lantern" | "stars" | "chest";
const CELLS: Record<PropName, string> = {
  gem: "0% 0%",
  rock: "50% 0%",
  plant: "100% 0%",
  lantern: "0% 100%",
  stars: "50% 100%",
  chest: "100% 100%",
};

export function IllustratedProp({
  name,
  label,
  className = "",
  style,
}: {
  name: PropName;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      data-prop={name}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`block aspect-square shrink-0 ${className}`}
      style={{
        ...style,
        backgroundImage: "url(/images/game/lettoria-props.webp)",
        backgroundSize: "300% 200%",
        backgroundPosition: CELLS[name],
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
