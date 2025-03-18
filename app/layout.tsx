import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'LinkedIn Jobs Search | Find Your Next Career Opportunity',
  description: 'Search millions of jobs from LinkedIn with advanced filters.',
  keywords: 'linkedin jobs, job search, career opportunities, job listings',
  authors: [{ name: 'LinkedIn Jobs Search' }],
  openGraph: {
    title: 'LinkedIn Jobs Search | Find Your Next Career Opportunity',
    description: 'Search millions of jobs from LinkedIn with advanced filters.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LinkedIn Jobs Search',
  },
  metadataBase: new URL('https://linkedin-jobs-search.vercel.app'),
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  category: 'Job Search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        poppins.variable
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
