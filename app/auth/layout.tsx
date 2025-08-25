'use client';

import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure body has proper styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.backgroundColor = '#f9fafb';
    
    return () => {
      // Reset styles when component unmounts
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
