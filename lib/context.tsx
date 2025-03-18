'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useJobSearch, useSearchHistory } from './hooks';
import { Job, SearchParams } from '@/types/jobs';

interface JobsContextType {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  searchParams: SearchParams;
  searchJobs: (params: SearchParams) => Promise<void>;
  searchHistory: SearchParams[];
  addToHistory: (params: SearchParams) => void;
  clearHistory: () => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

interface JobsProviderProps {
  children: ReactNode;
}

export function JobsProvider({ children }: JobsProviderProps) {
  const {
    jobs,
    isLoading,
    error,
    searchParams,
    searchJobs,
  } = useJobSearch();

  const {
    searchHistory,
    addToHistory,
    clearHistory,
  } = useSearchHistory();

  const handleSearch = useCallback(async (params: SearchParams) => {
    await searchJobs(params);
    addToHistory(params);
  }, [searchJobs, addToHistory]);

  const value = {
    jobs,
    isLoading,
    error,
    searchParams,
    searchJobs: handleSearch,
    searchHistory,
    addToHistory,
    clearHistory,
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}
