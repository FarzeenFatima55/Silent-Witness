"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, ArrowRight, CheckCircle } from "lucide-react";
import Button from "@/app/components/ui/Button";

const trustBadges = [
  { icon: Lock, label: "End-to-End Encrypted" },
  { icon: Eye, label: "No Tracking" },
  { icon: Shield, label: "No Account Required" },
  { icon: CheckCircle, label: "Case-Code Access Only" },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  const router = useRouter();
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16"
      aria-label="Hero section"
    >
      {/* Abstract gradient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-navy/5" />

        {/* Blob 1 — sage */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-20 animate-float"
          style={{
            background:
              "radial-gradient(ellipse at center, #8FA98B 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Blob 2 — navy */}
        <div
          className="absolute -bottom-48 -right-24 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, #1B2A4A 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Blob 3 — gold */}
        <div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, #C9A66B 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "3s",
          }}
        />

        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B2A4A" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/15 border border-sage/30 text-xs font-bold tracking-widest uppercase text-sage-600">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
            PECA 2016 · NCCIA · Pakistan
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy tracking-tight leading-[1.1] mb-6"
        >
          Your Voice.{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Protected.</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 9C50 3 100 1 150 4C200 7 250 5 298 2"
                stroke="#8FA98B"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </span>
          <br />
          <span className="text-slate-400">Your Identity. Hidden.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate leading-relaxed mb-10"
        >
          Silent Witness helps you document cyber harassment evidence and prepares a
          complaint draft aligned with PECA 2016 — no account required, and your
          evidence stays private. Upload screenshots or chat logs from WhatsApp,
          Instagram, or Facebook and receive an AI-drafted complaint ready to file
          with NCCIA.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Button size="lg" variant="primary" onClick={() => router.push("/create-case")}>
            <Shield className="w-4 h-4" />
            Start My Case
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/access-case")}>
            Access Existing Case
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-navy/8 backdrop-blur-sm text-xs font-medium text-slate shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-sage" strokeWidth={2} />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Abstract SVG illustration */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="mt-16 flex justify-center"
          aria-hidden="true"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer ring */}
              <circle cx="160" cy="160" r="155" stroke="#1B2A4A" strokeWidth="1" strokeDasharray="6 4" opacity="0.15" />
              {/* Middle ring */}
              <circle cx="160" cy="160" r="120" fill="#1B2A4A" fillOpacity="0.04" stroke="#1B2A4A" strokeWidth="0.5" opacity="0.2" />
              {/* Shield body */}
              <path
                d="M160 60 L220 85 L220 165 C220 200 190 225 160 240 C130 225 100 200 100 165 L100 85 Z"
                fill="#1B2A4A"
                fillOpacity="0.06"
                stroke="#1B2A4A"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.4"
              />
              {/* Shield inner fill */}
              <path
                d="M160 78 L212 100 L212 162 C212 193 186 216 160 229 C134 216 108 193 108 162 L108 100 Z"
                fill="#8FA98B"
                fillOpacity="0.12"
              />
              {/* Eye */}
              <ellipse cx="160" cy="155" rx="28" ry="18" fill="none" stroke="#1B2A4A" strokeWidth="1.5" opacity="0.5" />
              <circle cx="160" cy="155" r="9" fill="#1B2A4A" fillOpacity="0.2" stroke="#1B2A4A" strokeWidth="1" opacity="0.6" />
              <circle cx="160" cy="155" r="4" fill="#8FA98B" opacity="0.8" />
              {/* Eyelashes */}
              <line x1="132" y1="155" x2="126" y2="155" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="188" y1="155" x2="194" y2="155" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              {/* Lock icon below shield */}
              <rect x="148" y="185" width="24" height="18" rx="3" fill="#C9A66B" fillOpacity="0.4" stroke="#C9A66B" strokeWidth="1" />
              <path d="M152 185 L152 179 A8 8 0 0 1 168 179 L168 185" fill="none" stroke="#C9A66B" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <circle cx="160" cy="194" r="2.5" fill="#C9A66B" opacity="0.9" />
              {/* Floating dots */}
              <circle cx="95" cy="120" r="4" fill="#8FA98B" opacity="0.5" />
              <circle cx="225" cy="130" r="3" fill="#C9A66B" opacity="0.5" />
              <circle cx="85" cy="185" r="2.5" fill="#5B6E8C" opacity="0.4" />
              <circle cx="235" cy="190" r="4" fill="#8FA98B" opacity="0.4" />
              <circle cx="160" cy="270" r="3" fill="#1B2A4A" opacity="0.2" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
