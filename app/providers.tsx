'use client';

import { ThemeProvider } from "next-themes";
import { JobsProvider } from "@/lib/context";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <JobsProvider>
        {children}
      </JobsProvider>
    </ThemeProvider>
  );
}
