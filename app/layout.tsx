import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Inter } from "next/font/google";

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
        <TooltipProvider>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

