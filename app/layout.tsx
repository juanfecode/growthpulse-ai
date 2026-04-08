import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrowthPulse AI — Your marketing stack, diagnosed in minutes",
  description:
    "Connect your CRM, ad accounts, and analytics. Get a 7-dimension growth diagnostic and a prioritized 90-day action plan — without hiring a fractional CMO.",
  openGraph: {
    title: "GrowthPulse AI — Your marketing stack, diagnosed in minutes",
    description:
      "The honest friend that reads your dashboards. 7-dimension growth audit in under 5 minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
