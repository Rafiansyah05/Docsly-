export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
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
    <html lang="en" className={cn("font-sans", jakarta.variable)}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://snap-assets.midtrans.com https://api.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com;" />
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-300 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
