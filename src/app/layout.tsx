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

