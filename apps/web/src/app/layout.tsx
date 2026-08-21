export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Plus_Jakarta_Sans, Righteous } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TourProvider } from "@/components/ui/tour";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const righteous = Righteous({
  weight: "400",
  subsets: ['latin'],
  variable: '--font-righteous',
});

export const metadata: Metadata = {
  title: "Docsly - Platform Dokumen Cerdas",
  description: "Platform dokumen cerdas generasi baru untuk mengelola workspace dan dokumen Anda dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", jakarta.variable, righteous.variable)}>
      <head>
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-300 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TourProvider>
            {children}
          </TourProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
