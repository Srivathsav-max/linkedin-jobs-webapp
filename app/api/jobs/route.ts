import { NextResponse } from 'next/server';
import { Query } from '@/lib/linkedin';
import { SearchParams } from '@/types/jobs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate required parameters
    const keyword = searchParams.get('keyword');
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const params: SearchParams = {
      keyword,
      location: searchParams.get('location') || '',
      dateSincePosted: searchParams.get('dateSincePosted') || '',
      jobType: searchParams.get('jobType') || '',
      remoteFilter: searchParams.get('remoteFilter') || '',
      salary: searchParams.get('salary') || '',
      experienceLevel: searchParams.get('experienceLevel') || '',
      sortBy: searchParams.get('sortBy') || 'relevant',
      limit: Math.min(Number(searchParams.get('limit')) || 25, 100), // Cap at 100
      page: Math.max(Number(searchParams.get('page')) || 0, 0), // Ensure non-negative
    };

    const query = new Query(params);
    const jobs = await query.getJobs();

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        {
          jobs: [],
          message: 'No jobs found matching your criteria'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      jobs,
      count: jobs.length,
      message: 'Jobs found successfully'
    });
  } catch (error: Error | unknown) {
    console.error('Error fetching jobs:', error);
    
    const errorMessage = error instanceof Error ? error.message : '';
    
    if (errorMessage.includes('captcha')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('rate limiting')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch jobs. Please try again later.' },
      { status: 500 }
    );
  }
}
