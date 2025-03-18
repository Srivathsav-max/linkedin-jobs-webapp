import { NextResponse } from 'next/server';
import { crawlMultipleJobs } from '@/lib/crawler';

export async function POST(request: Request) {
  try {
    const jobs = await request.json();

    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error('Request body must be an array of job IDs and URLs');
    }

    if (jobs.length > 10) {
      throw new Error('Maximum of 10 jobs can be crawled at once');
    }

    const results = await crawlMultipleJobs(jobs);

    return NextResponse.json({
      jobs: results,
      success: true,
      timestamp: new Date().toISOString(),
      totalJobs: results.length,
      successfulJobs: results.filter(r => r.success).length,
      failedJobs: results.filter(r => !r.success).length
    });

  } catch (error: Error | unknown) {
    console.error('Bulk crawl error:', error);
    const errorDetails = error instanceof Error ? {
      error: error.message,
      stack: error.stack
    } : {
      error: 'An unknown error occurred'
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
