"use client";
// All poses derive from the same simulation clock as the race. No independent
// animation timer can continue while the game is paused or finished.
export function FlightDragon({
  timeMs,
  quiet = false,
  turbo = false,
}: {
  timeMs: number;
  quiet?: boolean;
  turbo?: boolean;
}) {
  const phase = (timeMs / 900) * Math.PI * 2;
  const flap = quiet ? 0 : Math.sin(phase) * 10;
  const stretch = quiet ? 1 : 0.92 + Math.cos(phase) * 0.08;
  const tail = quiet ? 0 : Math.sin(phase * 0.6) * 9;
  const lift = quiet ? 0 : Math.sin(phase * 2) * 1.5;
  const common = {
    backgroundImage: "url(/images/game/eric-flight-parts.webp)",
    backgroundSize: "200% 200%",
    backgroundRepeat: "no-repeat",
  };
  return (
    <div
      role="img"
      aria-label="Eric vliegt met bewegende vleugels en staart"
      className="relative w-full aspect-[1/1.12]"
      style={{
        filter: turbo ? "drop-shadow(0 0 8px #ffd44a)" : undefined,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        data-dragon-part="tail"
        className="absolute left-[28%] top-[57%] w-[43%] h-[38.4%]"
        style={{
          ...common,
          backgroundPosition: "100% 100%",
          transformOrigin: "50% 8%",
          transform: `rotate(${tail}deg)`,
        }}
      />
      <div
        data-dragon-part="left-wing"
        className="absolute -left-[1%] top-[23%] w-[53%] h-[47.3%]"
        style={{
          ...common,
          backgroundPosition: "100% 0%",
          transformOrigin: "90% 52%",
          transform: `rotate(${-5 + flap}deg) scaleY(${stretch})`,
        }}
      />
      <div
        data-dragon-part="right-wing"
        className="absolute left-[49%] top-[23%] w-[53%] h-[47.3%]"
        style={{
          ...common,
          backgroundPosition: "0% 100%",
          transformOrigin: "8% 48%",
          transform: `rotate(${5 - flap}deg) scaleY(${stretch})`,
        }}
      />
      <div
        data-dragon-part="body"
        className="absolute left-[13%] top-[7%] w-[64%] h-[57.1%]"
        style={{ ...common, backgroundPosition: "0% 0%" }}
      />
    </div>
  );
}
