"use client";

import * as React from "react";
import { CreditCard, Search, Settings } from "lucide-react";
import { CommandMenuTrigger } from "./CommandMenuTrigger";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useJobs } from "@/lib/context";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { searchHistory, searchJobs, clearHistory } = useJobs();

  return (
    <>
      <CommandMenuTrigger onOpen={() => setOpen(true)} />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchHistory.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {searchHistory.map((search, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => {
                    searchJobs(search);
                    setOpen(false);
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{search.keyword}</span>
                  {search.location && (
                    <span className="text-muted-foreground"> in {search.location}</span>
                  )}
                </CommandItem>
              ))}
              <CommandItem onSelect={clearHistory} className="text-red-500">
                <span>Clear Search History</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => window.open("https://www.linkedin.com/jobs", "_blank")}>
              <CreditCard className="mr-2 h-4 w-4" />
              Visit LinkedIn Jobs
            </CommandItem>
            <CommandItem onSelect={() => window.open("https://github.com/Srivathsav-max/linkedin-jobs-webapp", "_blank")}>
              <Settings className="mr-2 h-4 w-4" />
              View Source
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
