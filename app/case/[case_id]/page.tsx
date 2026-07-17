"use client";

import AIAnalysisSection from "./AIAnalysisSection";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileStack,
  Upload,
  Trash2,
  Clock,
  CheckCircle,
  FileOutput,
  AlertTriangle,
  X,
  Loader2,
  FileImage,
  FileText,
  CalendarDays,
  Tag,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import { uploadEvidence, listEvidence, getEvidenceSignedUrl, verifySession } from "@/lib/actions/evidence";

// ── Types ─────────────────────────────────────────────────────────────────────

type CaseStatus = "draft" | "reviewed" | "exported";

type EvidenceItem = {
  evidence_id: string;
  file_url: string;
  file_name: string;
  platform: string;
  evidence_type: string;
  captured_at: string | null;
  created_at: string;
};

type Platform = "whatsapp" | "instagram" | "facebook" | "other";
type UploadPhase = "idle" | "form" | "uploading" | "success" | "error";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<Platform, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  other: "Other",
};

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,text/plain,application/pdf";

const statusConfig: Record<CaseStatus, { label: string; icon: typeof Clock; classes: string }> = {
  draft: { label: "Draft", icon: Clock, classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  reviewed: { label: "Reviewed", icon: CheckCircle, classes: "bg-sage/15 text-sage-700 border border-sage/30" },
  exported: { label: "Exported", icon: FileOutput, classes: "bg-navy/8 text-navy border border-navy/20" },
};

function StatusBadge({ status }: { status: CaseStatus }) {
  const { label, icon: Icon, classes } = statusConfig[status];
  return (
    <span className={["inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", classes].join(" ")}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}

function FileIcon({ type }: { type: string }) {
  return type === "screenshot" ? (
    <FileImage className="w-4 h-4 text-sage" strokeWidth={1.5} />
  ) : (
    <FileText className="w-4 h-4 text-slate/60" strokeWidth={1.5} />
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ── Upload Modal ───────────────────────────────────────────────────────────────

function UploadModal({
  caseId,
  onClose,
  onSuccess,
}: {
  caseId: string;
  onClose: () => void;
  onSuccess: (item: EvidenceItem) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>("form");
  const [platform, setPlatform] = useState<Platform>("whatsapp");
  const [capturedAt, setCapturedAt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setPhase("uploading");

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("platform", platform);
    if (capturedAt) fd.append("capturedAt", new Date(capturedAt).toISOString());

    const result = await uploadEvidence(caseId, fd);

    if ("error" in result) {
      setErrorMsg(result.error);
      setPhase("error");
    } else {
      setPhase("success");
      setTimeout(() => {
        onSuccess(result.evidence);
        onClose();
      }, 800);
    }
  };

  const isDisabled = phase === "uploading" || phase === "success";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="upload-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm"
        onClick={!isDisabled ? onClose : undefined}
      />

      {/* Dialog */}
      <motion.div
        key="upload-dialog"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-dialog-title"
          className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgb(27_42_74/0.16)] border border-navy/8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-navy/6">
            <h3 id="upload-dialog-title" className="text-base font-bold text-navy">
              Upload Evidence
            </h3>
            {!isDisabled && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy/6 text-slate/50 hover:text-navy transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* SUCCESS */}
              {phase === "success" && (
                <motion.div
                  key="upload-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-sage/15 border border-sage/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-7 h-7 text-sage" strokeWidth={2} />
                  </div>
                  <p className="text-base font-bold text-navy">Uploaded!</p>
                </motion.div>
              )}

              {/* FORM / UPLOADING / ERROR */}
              {phase !== "success" && (
                <motion.form
                  key="upload-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Platform */}
                  <div>
                    <label htmlFor="platform-select" className="block text-sm font-medium text-navy mb-1.5">
                      <Tag className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-sage" />
                      Platform
                    </label>
                    <select
                      id="platform-select"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as Platform)}
                      disabled={isDisabled}
                      className="w-full h-11 px-4 rounded-xl border border-navy/12 bg-cream/60 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
                        <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date/time */}
                  <div>
                    <label htmlFor="captured-at" className="block text-sm font-medium text-navy mb-1.5">
                      <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-sage" />
                      When did this happen?{" "}
                      <span className="text-slate/50 font-normal">(optional)</span>
                    </label>
                    <input
                      id="captured-at"
                      type="datetime-local"
                      value={capturedAt}
                      onChange={(e) => setCapturedAt(e.target.value)}
                      disabled={isDisabled}
                      className="w-full h-11 px-4 rounded-xl border border-navy/12 bg-cream/60 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* File picker */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">
                      <Upload className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-sage" />
                      File
                    </label>
                    <div
                      onClick={() => !isDisabled && fileInputRef.current?.click()}
                      className={[
                        "w-full min-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 px-4 py-4 transition-all cursor-pointer",
                        isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-sage/60 hover:bg-sage/4",
                        selectedFile ? "border-sage/50 bg-sage/5" : "border-navy/15 bg-cream/40",
                      ].join(" ")}
                    >
                      {selectedFile ? (
                        <>
                          <FileImage className="w-5 h-5 text-sage" />
                          <p className="text-sm font-medium text-navy text-center break-all">{selectedFile.name}</p>
                          <p className="text-xs text-slate/50">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate/40" />
                          <p className="text-sm text-slate/60">Click to choose a file</p>
                          <p className="text-xs text-slate/40">PNG, JPG, WEBP, GIF, PDF, TXT · max 50 MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED}
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isDisabled}
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {phase === "error" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700"
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium">{errorMsg}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isDisabled || !selectedFile}
                  >
                    {phase === "uploading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Evidence
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Evidence list item ─────────────────────────────────────────────────────────

function EvidenceRow({ item, caseId }: { item: EvidenceItem; caseId: string }) {
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "error">("idle");

  const handleOpen = async () => {
    if (fetchState === "loading") return;
    setFetchState("loading");
    const result = await getEvidenceSignedUrl(caseId, item.evidence_id);
    if ("error" in result) {
      setFetchState("error");
      setTimeout(() => setFetchState("idle"), 3000);
    } else {
      setFetchState("idle");
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-navy/6 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-navy/5 border border-navy/8 flex items-center justify-center shrink-0">
        <FileIcon type={item.evidence_type} />
      </div>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={handleOpen}
          disabled={fetchState === "loading"}
          className="group flex items-center gap-1.5 text-left max-w-full disabled:opacity-60"
          title="Click to open (5-min secure link)"
        >
          {fetchState === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 text-sage shrink-0 animate-spin" />
          ) : (
            <span className="w-3.5" />
          )}
          <span className="text-sm font-medium text-navy group-hover:text-sage group-hover:underline underline-offset-2 transition-colors truncate">
            {item.file_name}
          </span>
        </button>
        {fetchState === "error" && (
          <p className="text-xs text-red-500 mt-0.5">Could not generate link. Try again.</p>
        )}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap pl-5">
          <span className="text-xs text-slate/50 font-medium">
            {PLATFORM_LABELS[item.platform as Platform] ?? item.platform}
          </span>
          {item.captured_at && (
            <>
              <span className="text-slate/25">·</span>
              <span className="text-xs text-slate/50">{formatDate(item.captured_at)}</span>
            </>
          )}
        </div>
      </div>
      <span className="text-xs text-slate/35 shrink-0">
        {formatDate(item.created_at) ?? ""}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CaseDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.case_id as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(true);

  const status: CaseStatus = "draft";

  // Check session via server action (sw_session is httpOnly, so it's
  // invisible to document.cookie — verification must happen server-side)
  useEffect(() => {
    verifySession(caseId).then((result) => {
      if (result.ok) {
        setAuthChecked(true);
      } else {
        router.replace("/access-case");
      }
    });
  }, [caseId, router]);

  // Load evidence once authed
  useEffect(() => {
    if (!authChecked) return;
    listEvidence(caseId).then((res) => {
      if ("success" in res) setEvidence(res.items);
      setLoadingEvidence(false);
    });
  }, [authChecked, caseId]);

  const handleUploadSuccess = (item: EvidenceItem) => {
    setEvidence((prev) => [item, ...prev]);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sage/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-navy/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy shadow-[0_2px_12px_rgb(27_42_74/0.2)]">
                <Shield className="w-5 h-5 text-sage" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy tracking-tight leading-none">Case Dashboard</h1>
                <p className="text-xs text-slate/50 mt-0.5 font-mono tracking-wider">{caseId}</p>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>
        </motion.div>

        {/* EVIDENCE SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          aria-labelledby="evidence-heading"
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 id="evidence-heading" className="text-sm font-semibold text-navy/70 uppercase tracking-widest">
              Your Evidence
            </h2>
            <span className="text-xs text-slate/40 font-medium">{evidence.length} item{evidence.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-navy/8 rounded-2xl shadow-[0_2px_16px_rgb(27_42_74/0.05)] overflow-hidden">
            {loadingEvidence ? (
              <div className="flex items-center justify-center py-14">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-navy/15 border-t-navy/50 rounded-full"
                />
              </div>
            ) : evidence.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-navy/5 border border-navy/8 flex items-center justify-center mb-4">
                  <FileStack className="w-6 h-6 text-slate/40" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-navy/60 mb-1">No evidence uploaded yet</p>
                <p className="text-xs text-slate/40 max-w-xs leading-relaxed">
                  Upload screenshots, chat logs, or other files. All evidence is stored securely and tied only to your case code.
                </p>
              </div>
            ) : (
              <div>
                {evidence.map((item) => (
                  <EvidenceRow key={item.evidence_id} item={item} caseId={caseId} />
                ))}
              </div>
            )}
          </div>
        </motion.section>
        <AIAnalysisSection caseId={caseId} evidenceCount={evidence.length} />
        {/* UPLOAD BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
          className="mb-10"
        >
          <Button
            id="upload-evidence-btn"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setShowUpload(true)}
          >
            <Upload className="w-4 h-4" />
            Upload Evidence
          </Button>
          <p className="mt-2 text-xs text-slate/40">
            Accepted: PNG, JPG, WEBP, GIF, PDF, TXT &mdash; max 50 MB per file
          </p>
        </motion.div>

        {/* DIVIDER */}
        <motion.hr
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24 }}
          className="border-navy/8 mb-10"
        />

        {/* DANGER ZONE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
          aria-labelledby="danger-heading"
        >
          <h2 id="danger-heading" className="text-sm font-semibold text-red-400/80 uppercase tracking-widest mb-3">
            Danger Zone
          </h2>

          <div className="bg-red-50/60 border border-red-200/70 rounded-2xl p-5">
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 mb-0.5">Delete This Case</p>
                <p className="text-xs text-red-600/70 leading-relaxed">
                  Permanently removes the case and all uploaded evidence. This action cannot be undone.
                </p>
              </div>
              <Button
                id="delete-case-btn"
                variant="outline"
                size="md"
                className="shrink-0 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Case
              </Button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            caseId={caseId}
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              key="del-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              key="del-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-dialog-title"
                className="w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgb(27_42_74/0.18)] border border-navy/8 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 id="delete-dialog-title" className="text-base font-bold text-navy">Delete this case?</h3>
                </div>
                <p className="text-sm text-slate/70 mb-6 leading-relaxed">
                  All evidence and data for this case will be permanently deleted. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="md" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 bg-red-600 hover:bg-red-700 border-transparent shadow-[0_1px_3px_rgb(220_38_38/0.4)]"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}