import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CreditEr — Credit Dispute Assistant",
  description:
    "Dispute inaccurate items on your credit report using FCRA, FDCPA, and CFPB laws.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-blue-700">
              <ShieldCheck className="w-5 h-5" />
              CreditEr
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link
                href="/items/new"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Dispute
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-gray-400 text-center">
            CreditEr is an educational tool. Not legal advice. Consult a consumer law attorney for your specific situation.
          </div>
        </footer>
      </body>
    </html>
  );
}
