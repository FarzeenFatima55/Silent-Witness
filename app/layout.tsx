import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Silent Witness — Report Safely. Be Heard. Stay Anonymous.",
  description:
    "Silent Witness lets you report incidents privately and securely. No login required, end-to-end encrypted, zero metadata collected. Your voice matters — your identity stays protected.",
  keywords: [
    "anonymous reporting",
    "whistleblower platform",
    "secure reporting",
    "privacy first",
    "incident reporting",
  ],
  openGraph: {
    title: "Silent Witness — Report Safely. Be Heard. Stay Anonymous.",
    description:
      "Report incidents privately and securely. No login required, end-to-end encrypted. Your identity stays protected.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silent Witness — Report Safely. Be Heard.",
    description:
      "Anonymous, encrypted incident reporting. No login required. Your voice matters — your identity stays protected.",
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
