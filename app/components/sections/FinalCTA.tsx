"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, ArrowRight, Lock } from "lucide-react";
import Button from "@/app/components/ui/Button";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="cta"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-navy" aria-hidden="true" />

      {/* Abstract blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse at center, #8FA98B 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, #C9A66B 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F7F5F1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Shield icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Shield className="w-7 h-7 text-sage" strokeWidth={1.5} />
            <div
              className="absolute inset-0 rounded-2xl animate-pulse-ring"
              style={{ border: "1px solid rgba(143,169,139,0.4)" }}
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cream tracking-tight leading-[1.1] mb-6"
        >
          Ready to document your case?{" "}
          <br className="hidden sm:block" />
          <span className="text-sage">We&#39;re here to help.</span>
        </motion.h2>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl mx-auto text-slate-300 text-lg leading-relaxed mb-10"
        >
          Upload your screenshots or chat logs, get an AI-drafted complaint aligned
          with PECA 2016, and export a PDF ready for NCCIA. No login. No name.
          Just your case code — and your evidence, safely stored.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Button
            size="lg"
            variant="primary"
            className="bg-sage! text-navy! hover:bg-sage-600! shadow-[0_4px_20px_rgb(143_169_139/0.35)]!"
          >
            <Shield className="w-4 h-4" />
            Start My Case
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20! text-cream! hover:bg-white/8! hover:border-white/35!"
          >
            Learn How It Works
          </Button>
        </motion.div>

        {/* Reassurance row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-sage/70" />
            End-to-End Encrypted
          </span>
          <span className="w-px h-3 bg-white/15" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sage/70" />
            No account required
          </span>
          <span className="w-px h-3 bg-white/15" />
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-sage/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF export for NCCIA
          </span>
        </motion.div>
      </div>
    </section>
  );
}
