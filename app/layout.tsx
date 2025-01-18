import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

function Footer() {
  return (
    <footer className="w-full border-t py-3 text-center text-sm text-muted-foreground">
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
              <Suspense>{children}</Suspense>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
