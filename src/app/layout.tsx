import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Joy Shah — AI/ML Engineer & Security Researcher",
  description: "Portfolio of Joy Shah — MS CS at Rutgers, AI/ML Engineer, CTF Competitor, and CS336 Lecturer.",
  keywords: ["Joy Shah", "AI Engineer", "ML Engineer", "Cybersecurity", "CTF", "Rutgers", "Portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#080808] text-[#f5f5f5]">
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
