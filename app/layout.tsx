import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Silent Witness — Document Cyber Harassment & File with NCCIA",
  description:
    "Silent Witness helps cyber harassment victims in Pakistan document evidence and prepare a PECA 2016-aligned complaint draft ready to file with NCCIA. No account required.",
  keywords: [
    "cyber harassment Pakistan",
    "PECA 2016 complaint",
    "NCCIA filing",
    "cyberstalking evidence",
    "online harassment report Pakistan",
    "anonymous evidence documentation",
  ],
  openGraph: {
    title: "Silent Witness — Document Cyber Harassment & File with NCCIA",
    description:
      "Collect evidence, get an AI-drafted PECA 2016 complaint, and export a PDF for NCCIA. No login. No account. Your evidence stays private.",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silent Witness — Cyber Harassment Evidence & PECA 2016 Complaints",
    description:
      "Pakistan's privacy-first tool for documenting cyber harassment and drafting NCCIA complaints under PECA 2016. No account required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
