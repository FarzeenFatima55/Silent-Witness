// Basic PII redaction — masks common sensitive patterns before text is
// sent to any AI provider or shown in exported documents.
// This is a best-effort filter, not a guarantee — always advise the
// user to review before submitting anywhere official.

export function redactPII(text: string): string {
    if (!text) return text;

    let redacted = text;

    // Pakistani CNIC: 12345-1234567-1
    redacted = redacted.replace(/\b\d{5}-\d{7}-\d{1}\b/g, "[CNIC REDACTED]");

    // Phone numbers: 03XX-XXXXXXX, +923XXXXXXXXX, 03XXXXXXXXX
    redacted = redacted.replace(
        /(\+92|0)3\d{2}[-\s]?\d{7}\b/g,
        "[PHONE REDACTED]"
    );

    // Email addresses
    redacted = redacted.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "[EMAIL REDACTED]"
    );

    // Generic long digit sequences (bank account / card-like, 10+ digits)
    redacted = redacted.replace(/\b\d{10,}\b/g, "[NUMBER REDACTED]");

    return redacted;
}