"use client";

import { getCaseCode } from "@/lib/actions/case";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Loader2,
    AlertTriangle,
    ShieldAlert,
    ListChecks,
    FileText,
    Download,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import { analyzeCase, getLatestAnalysis } from "@/lib/actions/analysis";
import { generateComplaintPdf } from "@/lib/pdf/generateComplaintPdf";
import { getEvidenceSignedUrl } from "@/lib/actions/evidence";

type KeyPoint = { type: string; note: string };

type Analysis = {
    analysis_id: string;
    category_suggestion: string | null;
    confidence_score: number | null;
    key_evidence_points: unknown;
    draft_complaint_text: string | null;
};

type EvidenceItem = {
    evidence_id: string;
    file_name: string;
    platform: string;
    evidence_type: string;
    captured_at: string | null;
    message_text: string | null;
    created_at: string;
};
type Phase = "idle" | "loading-existing" | "analyzing" | "error";

export default function AIAnalysisSection({
    caseId,
    evidenceCount,
    evidence,
}: {
    caseId: string;
    evidenceCount: number;
    evidence: EvidenceItem[];
}) {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [phase, setPhase] = useState<Phase>("loading-existing");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        getLatestAnalysis(caseId).then((res) => {
            if ("success" in res && res.analysis) {
                setAnalysis(res.analysis);
            }
            setPhase("idle");
        });
    }, [caseId]);

    const handleAnalyze = async () => {
        setPhase("analyzing");
        setErrorMsg("");
        const result = await analyzeCase(caseId);
        if ("error" in result) {
            setErrorMsg(result.error);
            setPhase("error");
        } else {
            setAnalysis(result.analysis);
            setPhase("idle");
        }
    };

    const handleExportPdf = async () => {
        if (!analysis) return;
        const codeResult = await getCaseCode(caseId);
        const displayCode = "case_code" in codeResult ? codeResult.case_code : caseId;
        await generateComplaintPdf(
            displayCode,
            {
                category_suggestion: analysis.category_suggestion,
                draft_complaint_text: analysis.draft_complaint_text,
            },
            evidence,
            (evidenceId: string) => getEvidenceSignedUrl(caseId, evidenceId)
        );
    };
    const keyPoints: KeyPoint[] = Array.isArray(analysis?.key_evidence_points)
        ? (analysis!.key_evidence_points as KeyPoint[])
        : [];

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
            aria-labelledby="ai-analysis-heading"
            className="mb-10"
        >
            <div className="flex items-center justify-between mb-3">
                <h2
                    id="ai-analysis-heading"
                    className="text-sm font-semibold text-navy/70 uppercase tracking-widest"
                >
                    AI Analysis
                </h2>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-navy/8 rounded-2xl shadow-[0_2px_16px_rgb(27_42_74/0.05)] overflow-hidden">
                <AnimatePresence mode="wait">
                    {evidenceCount === 0 && (
                        <motion.div
                            key="no-evidence"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 px-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-navy/5 border border-navy/8 flex items-center justify-center mb-3">
                                <Sparkles className="w-5 h-5 text-slate/40" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm text-slate/50">
                                Upload evidence first to run AI analysis.
                            </p>
                        </motion.div>
                    )}

                    {evidenceCount > 0 && !analysis && phase !== "analyzing" && (
                        <motion.div
                            key="analyze-cta"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 px-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-sage/10 border border-sage/25 flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-sage" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-semibold text-navy mb-1.5">
                                Ready to analyze your evidence
                            </p>
                            <p className="text-xs text-slate/50 max-w-sm leading-relaxed mb-5">
                                Our AI will review your evidence and suggest a PECA 2016
                                category plus a draft complaint. This is not legal advice
                                — you&apos;ll be able to review and edit everything.
                            </p>

                            {phase === "error" && (
                                <div className="w-full max-w-sm mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-left">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}

                            <Button variant="primary" size="lg" onClick={handleAnalyze}>
                                <Sparkles className="w-4 h-4" />
                                Analyze My Case
                            </Button>
                        </motion.div>
                    )}

                    {phase === "analyzing" && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-14 px-6 text-center"
                        >
                            <Loader2 className="w-7 h-7 text-sage animate-spin mb-4" />
                            <p className="text-sm font-medium text-navy/70">
                                Analyzing your evidence...
                            </p>
                        </motion.div>
                    )}

                    {analysis && phase !== "analyzing" && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6"
                        >
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1.5">
                                    Suggested Category
                                </p>
                                <p className="text-sm font-bold text-navy leading-relaxed">
                                    {analysis.category_suggestion ?? "Not available"}
                                </p>
                            </div>

                            {analysis.confidence_score !== null && (
                                <div className="mb-5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">
                                            AI Confidence{" "}
                                            <span className="font-normal normal-case text-slate/40">
                                                (for reference only)
                                            </span>
                                        </p>
                                        <span className="text-xs font-bold text-sage">
                                            {Math.round((analysis.confidence_score ?? 0) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-navy/8 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sage rounded-full"
                                            style={{
                                                width: `${Math.round((analysis.confidence_score ?? 0) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {keyPoints.length > 0 && (
                                <div className="mb-5">
                                    <p className="flex items-center gap-1.5 text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">
                                        <ListChecks className="w-3.5 h-3.5" />
                                        Key Evidence Points
                                    </p>
                                    <ul className="space-y-1.5">
                                        {keyPoints.map((kp, i) => (
                                            <li
                                                key={i}
                                                className="text-sm text-slate/70 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-sage"
                                            >
                                                <span className="font-medium text-navy/80">{kp.type}:</span>{" "}
                                                {kp.note}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-5">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Draft Complaint
                                </p>
                                <div className="bg-cream/60 border border-navy/10 rounded-xl p-4">
                                    <p className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                                        {analysis.draft_complaint_text ?? "Not available"}
                                    </p>
                                </div>
                                <p className="mt-1.5 text-xs text-slate/40">
                                    This is a draft — you&apos;ll be able to edit it before export.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-5">
                                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    This is an AI-generated suggestion, not legal advice.
                                    Please review carefully before filing.
                                </p>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={handleExportPdf}
                            >
                                <Download className="w-4 h-4" />
                                Export as PDF
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
}