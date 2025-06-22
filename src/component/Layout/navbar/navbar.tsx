'use client';

import { navItems } from "./navConfig";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Button from "@/component/ui/Button";
import { Logout01Icon } from "hugeicons-react";

export default function Navbar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-foreground hover:text-accent transition-colors">
              Stendhal
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

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="hidden md:flex"
            >
              <Logout01Icon className="w-4 h-4 mr-2" />
              Sign Out
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