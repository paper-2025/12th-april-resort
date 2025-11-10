import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ReactNode } from "react";

export const metadata = {
  title: "12th April Resort",
  description: "Luxury • Comfort • Calm"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)]">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}