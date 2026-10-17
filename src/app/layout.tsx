import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import MotionProvider from "@/components/MotionProvider";
import { themeInitScript } from "@/utils/theme";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-src",
  display: "swap",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Joy Shah | Software Engineer & Applied AI",
  description: "Software engineer working on AI tutors at Rutgers, web attack detection, and voice interview tools. Three internships, two hackathon wins, and IEEE research. Graduating May 2027.",
  keywords: ["Joy Shah", "Software Engineer", "AI Engineer", "LLM Agents", "RAG", "Rutgers", "Portfolio"],
};

export const viewport: Viewport = {
  themeColor: "#121311",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head><script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className="min-h-full flex flex-col bg-paper text-ink" suppressHydrationWarning>
        <MotionProvider>{children}</MotionProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
