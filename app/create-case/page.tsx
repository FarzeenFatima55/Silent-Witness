"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Copy, Check, AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { createCase } from "@/lib/actions/case";

type State =
  | { phase: "form" }
  | { phase: "loading" }
  | { phase: "success"; caseCode: string }
  | { phase: "error"; message: string };

export default function CreateCasePage() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<State>({ phase: "form" });
  const [copied, setCopied] = useState(false);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ phase: "loading" });

    const result = await createCase(pin || undefined);

    if ("error" in result && result.error) {
      setState({ phase: "error", message: result.error });
    } else if ("case_code" in result && result.case_code) {
      setState({ phase: "success", caseCode: result.case_code });
    } else {
      setState({ phase: "error", message: "An unexpected error occurred. Please try again." });
    }
  };

  const handleCopy = async () => {
    if (state.phase !== "success") return;
    await navigator.clipboard.writeText(state.caseCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPin("");
    setCopied(false);
    setState({ phase: "form" });
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sage/6 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-navy/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy shadow-[0_4px_20px_rgb(27_42_74/0.25)] mb-5">
            <Shield className="w-7 h-7 text-sage" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Create a New Case
          </h1>
          <p className="mt-2 text-sm text-slate/70 leading-relaxed">
            Your report is anonymous. Add an optional PIN for extra security.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-sm border border-navy/8 rounded-2xl shadow-[0_4px_24px_rgb(27_42_74/0.07)] overflow-hidden">
          <AnimatePresence mode="wait">
            {/* FORM / LOADING / ERROR */}
            {(state.phase === "form" || state.phase === "loading" || state.phase === "error") && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-6">
                    <label
                      htmlFor="pin-input"
                      className="block text-sm font-medium text-navy mb-1.5"
                    >
                      PIN{" "}
                      <span className="text-slate/50 font-normal">(optional)</span>
                    </label>
                    <input
                      id="pin-input"
                      type="password"
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4}
                      placeholder="••••"
                      value={pin}
                      onChange={handlePinChange}
                      disabled={state.phase === "loading"}
                      className={[
                        "w-full h-11 px-4 rounded-xl border text-navy text-center text-xl tracking-[0.4em]",
                        "bg-cream/60 placeholder:text-slate/30 placeholder:tracking-[0.4em] placeholder:text-lg",
                        "focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage",
                        "transition-all duration-200",
                        "disabled:opacity-50",
                        state.phase === "error"
                          ? "border-red-300"
                          : "border-navy/12 hover:border-navy/25",
                      ].join(" ")}
                    />
                    <p className="mt-1.5 text-xs text-slate/50">
                      Leave blank for no PIN. A PIN adds an extra layer of protection.
                    </p>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {state.phase === "error" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700"
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium">{state.message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={state.phase === "loading"}
                  >
                    {state.phase === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Case...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Create Case
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS */}
            {state.phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-8"
              >
                {/* Check badge */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-sage/15 border border-sage/30 flex items-center justify-center"
                  >
                    <Check className="w-7 h-7 text-sage" strokeWidth={2} />
                  </motion.div>
                </div>

                <h2 className="text-center text-lg font-bold text-navy mb-1">
                  Case Created
                </h2>
                <p className="text-center text-sm text-slate/60 mb-6">
                  Your anonymous case has been opened.
                </p>

                {/* Case code display */}
                <div className="mb-4 p-5 rounded-2xl bg-navy/4 border border-navy/10">
                  <p className="text-xs font-semibold text-slate/50 uppercase tracking-wider mb-2 text-center">
                    Your Case Code
                  </p>
                  <p className="text-3xl font-bold text-navy tracking-[0.15em] text-center font-mono">
                    {state.caseCode}
                  </p>
                </div>

                {/* Copy button */}
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full mb-5"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-sage" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </Button>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium leading-snug">
                    Save this code — it&apos;s the only way to access your case again.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 w-full text-center text-xs text-slate/50 hover:text-slate/70 transition-colors cursor-pointer"
                >
                  Create another case
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate/40">
          No account required · End-to-end privacy · Anonymous by design
        </p>
      </div>
    </main>
  );
}
