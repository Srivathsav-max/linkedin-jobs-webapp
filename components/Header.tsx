'use client';

import { Button } from "@/components/ui/button";
import { CommandMenu } from "@/components/CommandMenu";
import { Github, Linkedin, Briefcase, SunMedium, Moon } from 'lucide-react';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <SunMedium className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-bold">LinkedIn Jobs Search</span>
          </Link>
        </div>
        <div className="flex-1 md:flex items-center justify-center px-4">
          <CommandMenu />
        </div>
        <div className="flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <a
                href="https://github.com/VishwaGauravIn/linkedin-jobs-api"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
              <a
                href="https://www.linkedin.com/jobs"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
