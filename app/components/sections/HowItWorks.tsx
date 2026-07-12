"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Cpu, UserCheck } from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Upload Your Evidence",
    description:
      "Add screenshots or chat logs from WhatsApp, Instagram, Facebook, or any other platform. Files are encrypted immediately and EXIF metadata is stripped on upload.",
    color: "sage",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Reviews Your Case",
    description:
      "Claude AI analyses your evidence, suggests which PECA 2016 category it may fall under, and drafts a complaint. The draft is always clearly labelled for your review — never a legal verdict.",
    color: "navy",
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Review, Edit & Export",
    description:
      "Read through the AI draft, make any changes you need, then export it as a PDF ready to file with NCCIA. Your case is saved under a unique code (SW-XXXXXXX) so you can return at any time.",
    color: "gold",
  },
];

const colorMap: Record<string, { bg: string; border: string; icon: string; num: string }> = {
  sage:  { bg: "bg-sage/10",  border: "border-sage/25",  icon: "text-sage-500",  num: "text-sage-400" },
  navy:  { bg: "bg-navy/6",   border: "border-navy/20",  icon: "text-navy",      num: "text-navy-300" },
  gold:  { bg: "bg-gold/10",  border: "border-gold/25",  icon: "text-gold-500",  num: "text-gold-400" },
};

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
      aria-label="How it works"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white/60 to-cream" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <SectionTag label="How It Works" accentColor="sage" className="justify-center" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Three steps to document and file
          </h2>
          <p className="max-w-xl mx-auto text-slate text-lg leading-relaxed">
            The entire process is designed around your safety and your case. No login,
            no name — just a private case code that only you hold.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] -translate-y-1/2 h-px"
            aria-hidden="true"
            style={{
              background: "linear-gradient(90deg, transparent, #8FA98B40, #5B6E8C40, #C9A66B40, transparent)",
            }}
          />

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const c = colorMap[step.color];
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group"
                >
                  <div
                    className={[
                      "relative rounded-2xl p-8 h-full",
                      "bg-white/70 backdrop-blur-sm",
                      "border border-navy/8",
                      "shadow-[0_1px_4px_rgb(27_42_74/0.06),0_8px_24px_rgb(27_42_74/0.04)]",
                      "hover:shadow-[0_4px_16px_rgb(27_42_74/0.10),0_16px_48px_rgb(27_42_74/0.08)]",
                      "transition-shadow duration-300",
                    ].join(" ")}
                  >
                    {/* Step number */}
                    <div className={`text-6xl font-black ${c.num} opacity-20 absolute top-4 right-5 select-none`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={[
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                        c.bg,
                        `border ${c.border}`,
                      ].join(" ")}
                    >
                      <Icon className={`w-5 h-5 ${c.icon}`} strokeWidth={1.8} />
                    </div>

                    <h3 className="text-lg font-bold text-navy mb-3 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-slate text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-10 text-xs text-slate/60 font-medium tracking-wide"
        >
          No signup, no account. Your case is saved under a unique code (SW-XXXXXXX) that only
          you hold — close the window anytime and return later with your code.
        </motion.p>
      </div>
    </section>
  );
}
