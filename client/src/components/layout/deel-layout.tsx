import { ReactNode } from "react";
import Header from "./header";

interface DeelLayoutProps {
  children: ReactNode;
}

export default function DeelLayout({ children }: DeelLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-6">
        {children}
      </main>
    </div>
  );
}