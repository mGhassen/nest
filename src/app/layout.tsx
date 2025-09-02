import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from "next/font/google";
import SessionDebug from "@/components/debug/session-debug";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nest HR System",
  description: "Modern HR management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                if (stored === 'dark' || stored === 'light') {
                  document.documentElement.classList.toggle('dark', stored === 'dark');
                } else {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.toggle('dark', prefersDark);
                }
              } catch (e) {
                // Fallback to light theme if localStorage is not available
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <TooltipProvider>
            {children}
            <SessionDebug />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

