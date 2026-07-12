"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, EyeOff, Fingerprint, Server, Globe, Lock } from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const privacyPoints = [
  { icon: EyeOff,       label: "No Accounts",          desc: "Zero sign-up. Zero login. Zero personal data stored." },
  { icon: Lock,         label: "End-to-End Encrypted",  desc: "Your report is encrypted client-side before it ever leaves your device." },
  { icon: Fingerprint,  label: "No Fingerprinting",     desc: "We actively block browser fingerprinting and canvas tracking." },
  { icon: Server,       label: "No Logs",               desc: "Server access logs are disabled. We cannot identify you even if asked." },
  { icon: Globe,        label: "Tor-Friendly",          desc: "Works over Tor Browser and VPNs. We never block privacy tools." },
  { icon: ShieldCheck,  label: "Open Source Audited",   desc: "Our encryption layer is open-sourced and independently audited annually." },
];

export default function PrivacyFirst() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="privacy"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
      aria-label="Privacy first"
    >
      {/* Dark navy background */}
      <div className="absolute inset-0 bg-navy" aria-hidden="true" />

      {/* Background abstract shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, #8FA98B 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-24 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, #C9A66B 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="privacy-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F7F5F1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#privacy-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionTag label="Privacy First" accentColor="sage" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cream tracking-tight leading-[1.15] mb-6">
              Built around your{" "}
              <span className="text-sage">anonymity</span>,{" "}
              not as an afterthought
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Most platforms collect data first and add privacy layers later.
              Silent Witness was designed from the ground up to collect nothing.
              We cannot reveal what we never had.
            </p>

            {/* Highlight stat */}
            <div className="inline-flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/6 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-sage" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-cream font-bold text-sm">Zero data breaches</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Because there is no data to breach — by design.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — feature grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {privacyPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08 + 0.3, duration: 0.5, ease: "easeOut" }}
                  className="group p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-sage/15 border border-sage/25 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-sage" strokeWidth={1.8} />
                  </div>
                  <div className="text-cream font-semibold text-sm mb-1">{point.label}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{point.desc}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
