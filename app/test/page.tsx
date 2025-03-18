"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TestData, JobData } from '@/types/test';

export default function TestPage() {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [start, setStart] = useState('0');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    request: false,
    jobData: true,
    jobDetails: true,
    bulkResults: true,
    rawHtml: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `/api/test?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&start=${start}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      const result = await response.json();
      setData({
        ...result,
        metadata: {
          requestUrl: url,
          timestamp: new Date().toISOString(),
          requestParams: { keywords, location, start }
        }
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCrawlDetails = async (jobData: JobData) => {
    try {
      const jobId = jobData.dataAttributes?.['data-entity-urn']?.split(':').pop() || '';
      const jobUrl = jobData.cardLink || '';
      
      if (!jobId || !jobUrl) {
        throw new Error('Could not extract job ID or URL');
      }

      setLoading(true);
      const response = await fetch(`/api/test/job?jobId=${jobId}&jobUrl=${encodeURIComponent(jobUrl)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch job details');
      }
      const details = await response.json();
      
      setData(prev => ({
        ...prev,
        jobDetails: details
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCrawl = async () => {
    try {
      if (!data?.jobs) return;

      // Extract jobs from the parsed data
      const jobs = data.jobs
        .map((job: JobData) => ({
          jobId: job.jobId,
          jobUrl: job.cardLink
        }))
        .filter((job) => job.jobId && job.jobUrl)
        .slice(0, 5);

      if (jobs.length === 0) {
        throw new Error('No valid jobs found to crawl');
      }

      setLoading(true);
      const response = await fetch('/api/test/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobs)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk crawl jobs');
      }

      const results = await response.json();
      setData(prev => ({
        ...prev,
        bulkResults: results
      }));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to bulk crawl jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev: typeof expandedSections) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">LinkedIn Jobs API Test</h1>
      
      {error && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <div className="text-red-600">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Keywords</label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Index</label>
              <Input
                type="number"
                min="0"
                step="25"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" text="Searching..." /> : "Test Search"}
            </Button>
            {data?.firstJob && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBulkCrawl}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" text="Crawling..." /> : "Bulk Crawl (First 5)"}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {data && (
        <div className="space-y-6">
          {/* Request Info */}
          <Card className="p-6">
            <button
              className="w-full flex items-center justify-between text-xl font-semibold mb-4"
              onClick={() => toggleSection('request')}
            >
              <span>Request Information</span>
              {expandedSections.request ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
            </button>
            {expandedSections.request && (
              <div className="space-y-2">
                <p><strong>URL:</strong> {data.metadata?.requestUrl}</p>
                <p><strong>Timestamp:</strong> {data.metadata?.timestamp}</p>
                <p><strong>Total Jobs:</strong> {data.totalJobs}</p>
                {data.metadata?.requestParams && (
                  <div>
                    <strong>Parameters:</strong>
                    <pre className="bg-gray-100 p-2 rounded-lg mt-1">
                      {JSON.stringify(data.metadata.requestParams, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Job Data */}
          <Card className="p-6">
            <button
              className="w-full flex items-center justify-between text-xl font-semibold mb-4"
              onClick={() => toggleSection('jobData')}
            >
              <span>First Job Data</span>
              {expandedSections.jobData ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
            </button>
            {expandedSections.jobData && (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (data.firstJob) {
                        handleCrawlDetails(data.firstJob);
                      }
                    }}
                    disabled={loading || !data.firstJob}
                  >
                    {loading ? <LoadingSpinner size="sm" text="Crawling..." /> : "Crawl Details"}
                  </Button>
                </div>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(data.firstJob, null, 2)}
                </pre>
              </>
            )}
          </Card>

          {/* Job Details */}
          {data.jobDetails && (
            <Card className="p-6">
              <button
                className="w-full flex items-center justify-between text-xl font-semibold mb-4"
                onClick={() => toggleSection('jobDetails')}
              >
                <span>Crawled Job Details</span>
                {expandedSections.jobDetails ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
              </button>
              {expandedSections.jobDetails && (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(data.jobDetails, null, 2)}
                </pre>
              )}
            </Card>
          )}

          {/* Bulk Results */}
          {data.bulkResults && (
            <Card className="p-6">
              <button
                className="w-full flex items-center justify-between text-xl font-semibold mb-4"
                onClick={() => toggleSection('bulkResults')}
              >
                <span>Bulk Crawl Results</span>
                {expandedSections.bulkResults ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
              </button>
              {expandedSections.bulkResults && (
                <>
                  <div className="mb-4">
                    <p><strong>Total Jobs:</strong> {data.bulkResults.totalJobs}</p>
                    <p><strong>Successful:</strong> {data.bulkResults.successfulJobs}</p>
                    <p><strong>Failed:</strong> {data.bulkResults.failedJobs}</p>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(data.bulkResults.jobs, null, 2)}
                  </pre>
                </>
              )}
            </Card>
          )}

          {/* Raw HTML */}
          <Card className="p-6">
            <button
              className="w-full flex items-center justify-between text-xl font-semibold mb-4"
              onClick={() => toggleSection('rawHtml')}
            >
              <span>Raw HTML Response</span>
              {expandedSections.rawHtml ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
            </button>
            {expandedSections.rawHtml && (
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm whitespace-pre-wrap break-all">
                  {data.rawHtml}
                </code>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
