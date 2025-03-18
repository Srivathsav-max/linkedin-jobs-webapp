"use client";

import { useJobs } from "@/lib/context";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from '@/components/JobCard';
import SearchForm from '@/components/SearchForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Briefcase, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback } from 'react';
import { SearchParams } from '@/types/jobs';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Home() {
  const {
    jobs,
    isLoading,
    error,
    searchJobs,
    searchHistory,
    clearHistory,
  } = useJobs();

  const handleHistoryClick = useCallback((params: SearchParams) => {
    searchJobs(params);
  }, [searchJobs]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-foreground/5">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-24 sm:mt-32 lg:mt-16"
            >
              <div className="inline-flex space-x-6">
                <span className="rounded-full px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                  Latest Jobs
                </span>
                {searchHistory.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <History className="h-4 w-4" />
                        Search History
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recent Searches</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {searchHistory.map((params, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium">{params.keyword}</p>
                              <p className="text-sm text-muted-foreground">{params.location || 'Any location'}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHistoryClick(params)}
                            >
                              Search Again
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={clearHistory}
                        >
                          <X className="h-4 w-4" />
                          Clear History
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            >
              Find Your Next{" "}
              <span className="text-primary">Career Opportunity</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-lg leading-8 text-muted-foreground"
            >
              Search millions of jobs from LinkedIn with advanced filters. Discover your perfect role with comprehensive search features.
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <SearchForm onSearch={searchJobs} />
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-16"
            >
              <LoadingSpinner size="lg" text="Searching jobs..." />
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search criteria to find more opportunities.
              </p>
            </motion.div>
          )}

          {jobs.length > 0 && (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Found {jobs.length} job{jobs.length === 1 ? '' : 's'}
                </h2>
              </div>
              <Separator className="mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={`${job.companyName}-${job.title}-${index}`}
                    variants={itemVariants}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
