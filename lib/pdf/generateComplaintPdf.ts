import jsPDF from "jspdf";

type EvidenceItem = {
    evidence_id: string;
    file_name: string;
    platform: string;
    evidence_type: string;
    captured_at: string | null;
    message_text: string | null;
    created_at: string;
};

type Analysis = {
    category_suggestion: string | null;
    draft_complaint_text: string | null;
};

const PLATFORM_LABELS: Record<string, string> = {
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    other: "Other",
};

function formatDate(iso: string | null) {
    if (!iso) return "Not specified";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Fetch an image URL and convert it to a base64 data URL for jsPDF
async function urlToDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        const dataUrl: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        // Get natural dimensions via an Image element
        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = dataUrl;
        });

        if (!dims.width || !dims.height) return null;
        return { dataUrl, width: dims.width, height: dims.height };
    } catch {
        return null;
    }
}

export async function generateComplaintPdf(
    caseCode: string,
    analysis: Analysis,
    evidence: EvidenceItem[],
    getSignedUrl: (evidenceId: string) => Promise<{ url: string } | { error: string }>
) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let y = 60;

    const navy = "#1b2a4a";
    const slate = "#5a6472";

    const line = () => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;
    };
    const addSpace = (n: number) => { y += n; };
    const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - 50) {
            doc.addPage();
            y = 60;
        }
    };

    // ── Page 1: Written Application ────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(navy);
    doc.text("WRITTEN APPLICATION", margin, y);
    addSpace(20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(slate);
    doc.text("To: In-Charge, Cybercrime Reporting Centre (NCCIA)", margin, y);
    addSpace(10);
    doc.text(`Reference Case Code: ${caseCode}`, margin, y);
    addSpace(24);
    line();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(navy);
    doc.text("APPLICANT DETAILS", margin, y);
    addSpace(20);

    const fields = ["Name", "Address", "City", "Contact Number", "CNIC Number", "Date"];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(slate);
    fields.forEach((label) => {
        doc.text(`${label}:`, margin, y);
        doc.setDrawColor(180, 180, 180);
        doc.line(margin + 110, y, pageWidth - margin, y);
        y += 26;
    });

    addSpace(10);
    line();

    checkPageBreak(100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(navy);
    doc.text("INCIDENT DESCRIPTION", margin, y);
    addSpace(18);

    if (analysis.category_suggestion) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(slate);
        const catLines = doc.splitTextToSize(`Suggested reference: ${analysis.category_suggestion}`, contentWidth);
        doc.text(catLines, margin, y);
        y += catLines.length * 12 + 10;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const draftText = analysis.draft_complaint_text ?? "No draft available. Please describe the incident here.";
    const draftLines = doc.splitTextToSize(draftText, contentWidth);
    draftLines.forEach((ln: string) => {
        checkPageBreak(16);
        doc.text(ln, margin, y);
        y += 15;
    });

    addSpace(14);
    line();

    checkPageBreak(80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(navy);
    doc.text("ATTACHED DOCUMENTS CHECKLIST", margin, y);
    addSpace(20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(slate);
    const checklist = ["CNIC copy", `Evidence copy (${evidence.length} item(s) attached — see pages below)`];
    checklist.forEach((item) => {
        doc.rect(margin, y - 9, 10, 10);
        doc.text(item, margin + 18, y);
        y += 20;
    });

    addSpace(10);
    line();

    checkPageBreak(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(navy);
    doc.text("EVIDENCE INDEX", margin, y);
    addSpace(20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);

    if (evidence.length === 0) {
        doc.setTextColor(slate);
        doc.text("No evidence attached.", margin, y);
        y += 16;
    } else {
        evidence.forEach((item, i) => {
            checkPageBreak(18);
            const label = `${i + 1}. ${PLATFORM_LABELS[item.platform] ?? item.platform} — Incident date: ${formatDate(item.captured_at)} (full copy on page ${i + 2})`;
            const lines = doc.splitTextToSize(label, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * 13 + 4;
        });
    }

    // ── Appendix pages: one per evidence item ──────────────
    for (let i = 0; i < evidence.length; i++) {
        const item = evidence[i];
        doc.addPage();
        y = 60;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(navy);
        doc.text(`EVIDENCE #${i + 1}`, margin, y);
        addSpace(18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(slate);
        doc.text(
            `Platform: ${PLATFORM_LABELS[item.platform] ?? item.platform}   |   Incident date: ${formatDate(item.captured_at)}`,
            margin,
            y
        );
        addSpace(20);
        line();

        if (item.evidence_type === "screenshot") {
            const signedResult = await getSignedUrl(item.evidence_id);
            if ("url" in signedResult) {
                const imgData = await urlToDataUrl(signedResult.url);
                if (imgData) {
                    // Fit image within content width, cap height to remaining page space
                    const maxW = contentWidth;
                    const maxH = pageHeight - y - 60;
                    const ratio = Math.min(maxW / imgData.width, maxH / imgData.height, 1);
                    const drawW = imgData.width * ratio;
                    const drawH = imgData.height * ratio;
                    const format = imgData.dataUrl.includes("image/png") ? "PNG" : "JPEG";
                    doc.addImage(imgData.dataUrl, format, margin, y, drawW, drawH);
                    y += drawH + 16;
                } else {
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(9);
                    doc.setTextColor(200, 80, 80);
                    doc.text("(Could not load image for this evidence item.)", margin, y);
                    y += 16;
                }
            }
        }

        if (item.message_text) {
            checkPageBreak(40);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(navy);
            doc.text("Extracted / recorded message content:", margin, y);
            y += 16;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(30, 30, 30);
            const msgLines = doc.splitTextToSize(item.message_text, contentWidth);
            msgLines.forEach((ln: string) => {
                checkPageBreak(14);
                doc.text(ln, margin, y);
                y += 13;
            });
        }
    }

    // ── Disclaimer on last page ─────────────────────────────
    checkPageBreak(60);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(slate);
    const disclaimer = doc.splitTextToSize(
        "This document was prepared with AI assistance and is intended as a drafting aid only. It does not constitute legal advice. Please review all content carefully, fill in your details by hand, and consult a legal professional if needed before filing with NCCIA.",
        contentWidth
    );
    doc.text(disclaimer, margin, y);

    doc.save(`Silent-Witness-Complaint-${caseCode}.pdf`);
}