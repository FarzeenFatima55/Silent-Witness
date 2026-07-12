"use client";

import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    "bg-navy text-cream",
    "hover:bg-navy-600",
    "shadow-[0_1px_3px_rgb(27_42_74/0.3)]",
    "hover:shadow-[0_4px_16px_rgb(27_42_74/0.25)]",
    "border border-transparent",
  ].join(" "),
  ghost: [
    "bg-transparent text-navy",
    "hover:bg-navy/8",
    "border border-transparent",
  ].join(" "),
  outline: [
    "bg-transparent text-navy",
    "border border-navy/20",
    "hover:border-navy/40 hover:bg-navy/4",
  ].join(" "),
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-4 text-sm rounded-lg gap-1.5",
  md: "h-10 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-7 text-base rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={[
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
