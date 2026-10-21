import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MOMENTMINT AI | Big moments. Brilliantly planned.",
  description:
    "The AI-powered event architect. Turn your celebration idea, budget, and guest count into a personalized, editable, budget-aware event plan with an interactive Copilot.",
  keywords: [
    "Event Planner AI",
    "Wedding Planning",
    "Birthday Planner",
    "Event Budget Calculator",
    "Event Copilot",
    "Google Gemini AI",
    "Momentmint",
  ],
  authors: [{ name: "MOMENTMINT AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900 antialiased">
        {children}
      </body>
    </html>
  );
}
