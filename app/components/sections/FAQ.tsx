"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SectionTag from "@/app/components/ui/SectionTag";

const faqs = [
  {
    q: "Is my report really anonymous?",
    a: "Yes — fully. We never collect your IP address, browser fingerprint, device identifiers, or any metadata that could link a report to you. Your submission is encrypted client-side before transmission, and our servers log nothing. Even if compelled by a court order, we have no data to hand over.",
  },
  {
    q: "Do I need to create an account or sign in?",
    a: "No account required — ever. You can submit a full report, attach files, and even receive anonymous follow-up messages from investigators without providing any personal information whatsoever.",
  },
  {
    q: "Who receives my report?",
    a: "Reports are routed to the organisation you select during submission — for example, your employer's HR team, an ethics board, or an independent investigation body. Each recipient organisation undergoes vetting and signs a data-handling agreement before being permitted access.",
  },
  {
    q: "Can I track the progress of my report?",
    a: "Yes. When you submit, you receive a randomly generated case code — a short string of words. Save this securely (we do not store it). Enter it later to check updates and receive any messages from investigators — all without logging in.",
  },
  {
    q: "What kinds of incidents can I report?",
    a: "Silent Witness is designed for a wide range of disclosures: workplace harassment, bullying, financial misconduct, safety violations, safeguarding concerns, discrimination, ethical breaches, and whistleblowing of illegal activity. Your report category helps route it to the right team.",
  },
  {
    q: "Is Silent Witness compliant with GDPR and other privacy laws?",
    a: "Yes. Because we collect no personal data, Silent Witness is designed to be compliant by default under GDPR, UK GDPR, and equivalent frameworks. Recipient organisations handle case details under their own Data Processing Agreements, which we audit annually.",
  },
  {
    q: "Can I attach evidence like documents or photos?",
    a: "Yes. You can attach files during submission. All files are stripped of EXIF and metadata, encrypted separately from your report text, and stored in isolated containers. Even our own team cannot view attachments without formal case authorisation.",
  },
  {
    q: "What if I change my mind after submitting?",
    a: "You can request deletion of your report at any time using your case code. Because we store no personal data, deletion of the case record is complete and irreversible — nothing about you persists in our system.",
  },
];

interface FAQItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItem({ q, a, isOpen, onToggle, index }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 + 0.2, duration: 0.45, ease: "easeOut" }}
      className="border-b border-navy/10 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-semibold text-navy text-sm sm:text-base group-hover:text-navy/80 transition-colors leading-snug pr-2">
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-navy/6 flex items-center justify-center group-hover:bg-navy/12 transition-colors"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4 text-slate" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate text-sm leading-relaxed pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="faq"
      ref={ref}
      className="py-24 md:py-32 bg-cream relative overflow-hidden"
      aria-label="Frequently asked questions"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream-dark/50 to-cream" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <SectionTag label="FAQ" accentColor="sage" className="justify-center" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Common questions
          </h2>
          <p className="text-slate text-lg">
            Everything you need to know before you report.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl border border-navy/8 shadow-[0_1px_4px_rgb(27_42_74/0.06)] px-6 py-2"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              index={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-8 text-sm text-slate/60"
        >
          Still have questions?{" "}
          <a
            href="mailto:privacy@silentwitness.org"
            className="text-sage-500 font-medium hover:underline underline-offset-2"
          >
            Contact our privacy team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
