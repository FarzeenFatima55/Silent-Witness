"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import { retrieveCase } from "@/lib/actions/case";

type State =
  | { phase: "form" }
  | { phase: "loading" }
  | { phase: "success" }
  | { phase: "error"; message: string };

export default function AccessCasePage() {
  const router = useRouter();
  const [caseCode, setCaseCode] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState<State>({ phase: "form" });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCaseCode(raw);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseCode.trim()) return;
    setState({ phase: "loading" });

    const result = await retrieveCase(caseCode.trim(), pin || undefined);

    if ("error" in result && result.error) {
      setState({ phase: "error", message: "Invalid code or PIN. Please try again." });
    } else if ("success" in result && result.success && result.case_id) {
      setState({ phase: "success" });
      // Brief pause for the checkmark animation, then redirect
      setTimeout(() => {
        router.push(`/case/${result.case_id}`);
      }, 900);
    } else {
      setState({ phase: "error", message: "Invalid code or PIN. Please try again." });
    }
  };

  const isLoading = state.phase === "loading";
  const isSuccess = state.phase === "success";
  const isDisabled = isLoading || isSuccess;

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-sage/6 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy shadow-[0_4px_20px_rgb(27_42_74/0.25)] mb-5">
            <KeyRound className="w-7 h-7 text-sage" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Access Your Case
          </h1>
          <p className="mt-2 text-sm text-slate/70 leading-relaxed">
            Enter your case code to pick up where you left off.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-sm border border-navy/8 rounded-2xl shadow-[0_4px_24px_rgb(27_42_74/0.07)] overflow-hidden">
          <AnimatePresence mode="wait">
            {/* FORM / LOADING / ERROR */}
            {!isSuccess && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <form onSubmit={handleSubmit} noValidate>
                  {/* Case Code */}
                  <div className="mb-5">
                    <label
                      htmlFor="case-code-input"
                      className="block text-sm font-medium text-navy mb-1.5"
                    >
                      Case Code
                    </label>
                    <input
                      id="case-code-input"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="SW-XXXXXXX"
                      value={caseCode}
                      onChange={handleCodeChange}
                      disabled={isDisabled}
                      required
                      className={[
                        "w-full h-11 px-4 rounded-xl border text-navy font-mono text-sm tracking-widest",
                        "bg-cream/60 placeholder:text-slate/30 placeholder:tracking-widest placeholder:font-mono",
                        "focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage",
                        "transition-all duration-200 disabled:opacity-50",
                        state.phase === "error"
                          ? "border-red-300"
                          : "border-navy/12 hover:border-navy/25",
                      ].join(" ")}
                    />
                  </div>

                  {/* PIN */}
                  <div className="mb-6">
                    <label
                      htmlFor="pin-input"
                      className="block text-sm font-medium text-navy mb-1.5"
                    >
                      PIN{" "}
                      <span className="text-slate/50 font-normal">(if set)</span>
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
                      disabled={isDisabled}
                      className={[
                        "w-full h-11 px-4 rounded-xl border text-navy text-center text-xl tracking-[0.4em]",
                        "bg-cream/60 placeholder:text-slate/30 placeholder:tracking-[0.4em] placeholder:text-lg",
                        "focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage",
                        "transition-all duration-200 disabled:opacity-50",
                        state.phase === "error"
                          ? "border-red-300"
                          : "border-navy/12 hover:border-navy/25",
                      ].join(" ")}
                    />
                    <p className="mt-1.5 text-xs text-slate/50">
                      Leave blank if you did not set a PIN.
                    </p>
                  </div>

                  {/* Error banner */}
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
                    disabled={isDisabled || !caseCode.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Access Case
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* SUCCESS */}
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-8 flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
                  className="w-16 h-16 rounded-2xl bg-sage/15 border border-sage/30 flex items-center justify-center mb-5"
                >
                  <Check className="w-8 h-8 text-sage" strokeWidth={2.5} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-lg font-bold text-navy mb-1"
                >
                  Verified
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-sm text-slate/60"
                >
                  Redirecting to your case...
                </motion.p>
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
