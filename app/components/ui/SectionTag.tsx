import { type HTMLAttributes } from "react";

interface SectionTagProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  accentColor?: "sage" | "gold" | "navy";
}

const accentStyles = {
  sage:  "bg-sage/20 text-sage-600",
  gold:  "bg-gold/20 text-gold-600",
  navy:  "bg-navy/10 text-navy",
};

export default function SectionTag({
  label,
  accentColor = "sage",
  className = "",
  ...props
}: SectionTagProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 mb-4",
        className,
      ].join(" ")}
      {...props}
    >
      <span
        className={[
          "inline-flex items-center px-3 py-1 rounded-full",
          "text-xs font-bold tracking-widest uppercase",
          accentStyles[accentColor],
        ].join(" ")}
      >
        {label}
      </span>
      <span className="w-8 h-px bg-current opacity-30" />
    </div>
  );
}
