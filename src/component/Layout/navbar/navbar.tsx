'use client';

import { navItems } from "./navConfig";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Button from "@/component/ui/Button";
import { Logout01Icon, Sun01Icon, Moon01Icon } from "hugeicons-react";
import { useEffect, useState } from "react";
import { signOut } from '@/hook/useAuthActions';

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Default doesn't matter, will be set in useEffect

  // Once mounted on client, get the theme
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
    }
  }, []);

  // Apply theme and persist
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes if user hasn't set a preference
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return; // user has set preference

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mounted]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-foreground hover:text-accent transition-colors">
              MemoForge
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div className="relative" key={index}>
                <Link 
                  href={item.href} 
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    pathname === item.href 
                      ? 'text-accent' 
                      : 'text-foreground-muted'
                  }`}
                >
                  {item.name}
                </Link>
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-accent transition-all duration-300 ${
                    pathname === item.href ? "w-full" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Sun01Icon className="w-5 h-5" />
                ) : (
                  <Moon01Icon className="w-5 h-5" />
                )}
              </Button>
            )}
            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={signOut}
            >
              <Logout01Icon className="w-5 h-5" />
            </Button>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}