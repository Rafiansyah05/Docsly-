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
  metadataBase: new URL("https://docsly.space"),
  title: {
    default: "Docsly - Platform Dokumen Cerdas",
    template: "%s | Docsly"
  },
  description: "Platform dokumen cerdas generasi baru untuk mengelola workspace dan dokumen Anda dengan mudah, dilengkapi dengan fitur kolaborasi dan AI.",
  keywords: ["docsly", "platform dokumen", "manajemen dokumen", "workspace", "dokumen cerdas", "kolaborasi"],
  authors: [{ name: "Docsly Team" }],
  creator: "Docsly",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://docsly.space",
    title: "Docsly - Platform Dokumen Cerdas",
    description: "Platform dokumen cerdas generasi baru untuk mengelola workspace dan dokumen Anda dengan mudah.",
    siteName: "Docsly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docsly - Platform Dokumen Cerdas",
    description: "Platform dokumen cerdas generasi baru untuk mengelola workspace dan dokumen Anda dengan mudah.",
    creator: "@docsly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", jakarta.variable, righteous.variable)}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://snap-assets.midtrans.com https://api.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com https://pay.google.com https://gwk.gopayapi.com;" />
        <script dangerouslySetInnerHTML={{__html: `
          if (typeof window !== 'undefined' && window.location.hash) {
            var params = new URLSearchParams(window.location.hash.substring(1));
            if (params.get('type') === 'recovery' && window.location.pathname !== '/auth/reset-password') {
              window.location.href = '/auth/reset-password' + window.location.hash;
            } else if (params.has('error_description') || params.has('error')) {
              var errorMsg = params.get('error_description') || params.get('error') || '';
              window.location.href = '/auth/login?error=' + encodeURIComponent(errorMsg);
            }
          }
        `}} />
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
