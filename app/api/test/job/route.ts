import { NextResponse } from 'next/server';
import { crawlJobDetails } from '@/lib/crawler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const jobUrl = searchParams.get('jobUrl');

    if (!jobId || !jobUrl) {
      throw new Error('jobId and jobUrl parameters are required');
    }

    const jobDetails = await crawlJobDetails(jobId, jobUrl);

    return NextResponse.json({ 
      jobId,
      jobUrl,
      details: jobDetails,
      timestamp: new Date().toISOString()
    });

  } catch (error: Error | unknown) {
    console.error('Job detail crawl error:', error);
    const errorDetails = error instanceof Error ? {
      error: error.message,
      stack: error.stack
    } : {
      error: 'An unknown error occurred'
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
