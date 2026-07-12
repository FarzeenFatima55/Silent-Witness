"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Heart, Scale } from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const stats = [
  { value: "53%",  label: "of Pakistani women report online harassment" },
  { value: "<10%", label: "of cyber harassment cases reach formal reporting" },
  { value: "PECA", label: "2016 — up to 3 years imprisonment for offenders" },
];

const impacts = [
  {
    icon: Heart,
    title: "Victims deserve a safe path",
    description:
      "Reporting cyber harassment in Pakistan is daunting — most victims don\'t know their rights, the complaint process, or which law applies. Silent Witness removes each of those barriers.",
  },
  {
    icon: Scale,
    title: "PECA 2016 exists to protect you",
    description:
      "The Prevention of Electronic Crimes Act criminalises cyberstalking, blackmail, non-consensual image sharing, and online harassment. An AI-drafted complaint helps you invoke it correctly.",
  },
  {
    icon: TrendingUp,
    title: "Documentation is the first step",
    description:
      "NCCIA and courts need organised, timestamped evidence. Silent Witness helps you collect, store, and present your case — turning scattered screenshots into a coherent complaint.",
  },
];

export default function WhyThisMatters() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="why"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
      aria-label="Why this matters"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cream-dark via-cream to-white" aria-hidden="true" />

      {/* Decorative quote mark */}
      <div
        className="absolute top-16 left-8 text-[200px] font-black text-navy/4 leading-none select-none pointer-events-none"
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16"
        >
          <SectionTag label="Why This Matters" accentColor="gold" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight leading-[1.15] mb-5">
            Silence has a cost.{" "}
            <span className="text-slate-400">Speaking up shouldn&#39;t.</span>
          </h2>
          <p className="text-slate text-lg leading-relaxed">
            In Pakistan, online harassment — stalking, blackmail, image-based abuse — is
            vastly underreported because victims don\'t know how to file or what the law says.
            PECA 2016 gives them rights. Silent Witness helps them use those rights.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid sm:grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-navy text-cream border border-navy/20 text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-sage mb-3 tracking-tight">
                {stat.value}
              </div>
              <div className="text-slate-300 text-sm leading-snug">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Impact cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {impacts.map((impact, i) => {
            const Icon = impact.icon;
            return (
              <motion.div
                key={impact.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12 + 0.4, duration: 0.55, ease: "easeOut" }}
                className="p-6 rounded-2xl bg-white/70 border border-navy/8 hover:border-gold/30 hover:shadow-[0_4px_24px_rgb(201_166_107/0.10)] transition-all duration-250 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/25 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-4.5 h-4.5 text-gold-500" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-navy text-base mb-3">{impact.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{impact.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
