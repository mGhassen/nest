"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") {
          setTheme(stored);
          return stored;
        }
      } catch (e) {
        // localStorage not available
      }
      
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      
      try {
        localStorage.setItem("theme", initialTheme);
      } catch (e) {
        // localStorage not available
      }
      
      return initialTheme;
    };

    initializeTheme();
    setMounted(true);
  }, []);

  // Apply theme class to document when theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.className = theme === "dark" ? "dark" : "";
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {
        // localStorage not available
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 