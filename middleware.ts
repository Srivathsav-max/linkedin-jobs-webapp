import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Store IP addresses and their request counts
const ipRequestCounts = new Map<
  string,
  { count: number; timestamp: number }
>();

export function middleware(request: NextRequest) {
  // Only apply rate limiting to the jobs API
  if (!request.nextUrl.pathname.startsWith('/api/jobs')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') ||
             'anonymous';
  const now = Date.now();
  const requestData = ipRequestCounts.get(ip);

  // Clean up old entries
  for (const [storedIp, data] of ipRequestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      ipRequestCounts.delete(storedIp);
    }
  }

  if (!requestData || now - requestData.timestamp > RATE_LIMIT_WINDOW) {
    // First request in the window
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
  } else if (requestData.count >= MAX_REQUESTS_PER_WINDOW) {
    // Too many requests
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': `${Math.ceil(
            (RATE_LIMIT_WINDOW - (now - requestData.timestamp)) / 1000
          )}`,
        },
      }
    );
  } else {
    // Increment the counter
    ipRequestCounts.set(ip, {
      count: requestData.count + 1,
      timestamp: requestData.timestamp,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
