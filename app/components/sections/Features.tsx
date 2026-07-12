"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Hash,
  BrainCircuit,
  ImageOff,
  FileDown,
  Trash2,
  KeyRound,
} from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const features = [
  {
    icon: Hash,
    title: "No Signup, Case-Code Access",
    description:
      "You get a unique case code (SW-XXXXXXX) the moment you start. No email, no password, no account — your code is the only key to your case.",
    accent: "sage",
  },
  {
    icon: BrainCircuit,
    title: "AI-Assisted Complaint Drafting",
    description:
      "Claude AI reads your evidence and drafts a PECA 2016-aligned complaint for you to review. It's a starting point, always labelled as a draft — never a legal verdict.",
    accent: "navy",
  },
  {
    icon: ImageOff,
    title: "Encrypted Evidence Storage",
    description:
      "Screenshots and chat logs are stored with encryption and EXIF metadata is stripped on upload, so your location and device details are never exposed.",
    accent: "gold",
  },
  {
    icon: FileDown,
    title: "PDF Export for NCCIA Filing",
    description:
      "When your draft is ready, export it as a clean PDF formatted for submission to the National Cyber Crime Investigation Agency.",
    accent: "sage",
  },
  {
    icon: Trash2,
    title: "Delete Anytime",
    description:
      "You are always in control. Delete your entire case — evidence files and all — instantly and permanently at any point.",
    accent: "navy",
  },
  {
    icon: KeyRound,
    title: "PIN-Protected Case Access",
    description:
      "Add an optional PIN to your case code for an extra layer of protection, so only you can view or edit your evidence.",
    accent: "gold",
  },
];

const accentMap: Record<string, { bg: string; icon: string }> = {
  sage:  { bg: "bg-sage/12",  icon: "text-sage-500" },
  navy:  { bg: "bg-navy/8",   icon: "text-navy" },
  gold:  { bg: "bg-gold/12",  icon: "text-gold-500" },
};

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 md:py-32 bg-cream relative overflow-hidden"
      aria-label="Features"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <SectionTag label="Features" accentColor="navy" className="justify-center" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Built for victims, not enterprises
          </h2>
          <p className="max-w-xl mx-auto text-slate text-lg leading-relaxed">
            Every feature is designed around your safety, your privacy, and getting
            your case filed — without any unnecessary complexity.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const a = accentMap[feature.accent];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: Math.floor(i / 3) * 0.1 + (i % 3) * 0.07 + 0.2, duration: 0.5, ease: "easeOut" }}
                className="group p-6 rounded-2xl bg-white/80 border border-navy/8 hover:border-navy/16 hover:shadow-[0_4px_24px_rgb(27_42_74/0.10)] transition-all duration-250 backdrop-blur-sm"
              >
                <div
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                    a.bg,
                    "group-hover:scale-110 transition-transform duration-200",
                  ].join(" ")}
                >
                  <Icon className={`w-4.5 h-4.5 ${a.icon}`} strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-navy text-base mb-2">{feature.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
