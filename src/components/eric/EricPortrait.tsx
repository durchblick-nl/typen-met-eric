export function EricPortrait({
  stage,
  label,
  className = "",
}: {
  stage: "baby" | "teen" | "adult";
  label?: string;
  className?: string;
}) {
  const position = stage === "baby" ? "0%" : stage === "teen" ? "50%" : "100%";
  return (
    <span
      data-eric-stage={stage}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`block aspect-square shrink-0 ${className}`}
      style={{
        backgroundImage: "url(/images/eric/eric-growth.webp)",
        backgroundSize: "300% 100%",
        backgroundPosition: `${position} center`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
