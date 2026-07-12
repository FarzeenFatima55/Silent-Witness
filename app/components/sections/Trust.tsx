"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const stats = [
  { value: "53%",  label: "of Pakistani women have faced online harassment" },
  { value: "~10%", label: "of incidents are ever formally reported" },
  { value: "PECA", label: "2016 — Pakistan\'s primary cyber crime law" },
  { value: "0",    label: "Identity breaches in Silent Witness" },
];

const testimonials = [
  {
    quote:
      "I had screenshots and chat logs but had no idea how to write a formal complaint. Silent Witness helped me organise everything and gave me a draft I could actually use.",
    role: "Anonymous · Cyberstalking victim, Lahore",
  },
  {
    quote:
      "I was scared that uploading my screenshots somewhere would expose me further. Knowing my files are encrypted and I can delete everything at any time gave me enough confidence to start.",
    role: "Anonymous · Blackmail victim, Karachi",
  },
];

export default function Trust() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="trust"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden bg-cream"
      aria-label="Trust and social proof"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-cream" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Cyber harassment is real.
          </h2>
          <p className="max-w-lg mx-auto text-slate text-lg">
            In Pakistan, online abuse — stalking, blackmail, image-based abuse — is widespread
            and underreported. PECA 2016 gives victims legal tools, but navigating a formal
            complaint alone is a barrier most never cross. Silent Witness exists to lower that barrier.
          </p>
        </motion.div>

        {/* Org logos block removed — no fabricated partner logos */}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white border border-navy/8 shadow-[0_1px_4px_rgb(27_42_74/0.06)]"
            >
              <div className="text-3xl md:text-4xl font-black text-navy tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-slate text-xs font-medium leading-tight">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 + 0.45, duration: 0.55, ease: "easeOut" }}
              className="relative p-7 rounded-2xl bg-white border border-navy/8 shadow-[0_1px_4px_rgb(27_42_74/0.06)]"
            >
              <Quote className="absolute top-6 right-6 w-6 h-6 text-sage/30" strokeWidth={1.5} />
              <p className="text-slate text-sm leading-relaxed mb-5 italic pr-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold">
                  A
                </div>
                <span className="text-xs font-semibold text-slate-400">{t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
