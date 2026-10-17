import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { GridRails } from "@/components/GridRails";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Adaptive TTS",
    template: "%s · Adaptive TTS",
  },
  description:
    "Adaptive TTS predicts, per frame, how many refinement steps text-to-speech actually needs, and turns the saved compute into real GPU speedup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <Nav />
          <main id="main" className="relative flex-1">
            {children}
            <GridRails />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
