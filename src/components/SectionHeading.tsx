import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-3 ${alignCls}`}>
      <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-300">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-xl text-base leading-relaxed text-zinc-500 ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
