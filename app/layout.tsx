import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { FooterModal } from "@/components/footer-modal";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

function Footer() {
  return (
    <footer className="w-full border-t py-3 text-center text-sm text-muted-foreground hidden md:block">
      <p>
        CineVerse does not host or store videos; all content is provided by
        unaffiliated third parties and accessed through our website.
      </p>
    </footer>
  );
}

export const metadata: Metadata = {
  title: "CineVerse - Watch Movies Online",
  description: "Stream your favorite movies and TV shows",
  keywords: ["movies", "streaming", "tv shows", "entertainment"],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </main>
            <Footer />
            <FooterModal />
          </div>
          <Toaster theme="dark" richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}