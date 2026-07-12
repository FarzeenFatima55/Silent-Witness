import { type HTMLAttributes } from "react";

type BadgeVariant = "sage" | "navy" | "gold" | "cream";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  sage:  "bg-sage/15 text-sage-600 border border-sage/30",
  navy:  "bg-navy/8 text-navy-500 border border-navy/15",
  gold:  "bg-gold/15 text-gold-600 border border-gold/30",
  cream: "bg-cream text-slate border border-slate/20",
};

export default function Badge({
  variant = "sage",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1",
        "text-xs font-semibold tracking-wide uppercase rounded-full",
        variantStyles[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
