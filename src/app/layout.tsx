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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.className = theme === 'dark' ? 'dark' : '';
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.className = prefersDark ? 'dark' : '';
                  }
                } catch (e) {
                  document.documentElement.className = '';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
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

