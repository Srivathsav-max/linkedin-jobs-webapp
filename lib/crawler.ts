import axios from 'axios';
import * as cheerio from 'cheerio';
import randomUseragent from 'random-useragent';

interface JobDetail {
  description: string;
  descriptionHtml: string;
  requirements: string[];
  benefits: string[];
  employmentType: string;
  seniorityLevel: string;
  industries: string[];
  applicantCount: string;
  companySize: string;
  jobFunction: string;
  externalUrl?: string;
  applyUrl?: string;
  isExternalPosting: boolean;
  crawledAt: string;
}

interface BulkCrawlResult {
  jobId: string;
  jobUrl: string;
  success: boolean;
  data?: JobDetail;
  error?: string;
}

const MAX_CONCURRENT_REQUESTS = 3;
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds

export async function crawlJobDetails(jobId: string, jobUrl: string): Promise<JobDetail> {
  try {
    const userAgent = randomUseragent.getRandom();
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.linkedin.com/jobs/',
    };

    // First check if it's a LinkedIn job posting
    const isLinkedInJob = jobUrl.includes('linkedin.com/jobs');
    
    if (isLinkedInJob) {
      // Use the LinkedIn jobs API endpoint for detailed view
      const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
      const response = await axios.get(apiUrl, { headers });
      return await parseLinkedInJobDetail(response.data, headers);
    } else {
      // Handle external job posting
      const response = await axios.get(jobUrl, { headers });
      return parseExternalJobDetail(response.data, jobUrl);
    }

  } catch (error) {
    console.error(`Error crawling job details for ${jobId}:`, error);
    throw error;
  }
}

export async function crawlMultipleJobs(jobs: { jobId: string; jobUrl: string }[]): Promise<BulkCrawlResult[]> {
  const results: BulkCrawlResult[] = [];
  const chunks = chunkArray(jobs, MAX_CONCURRENT_REQUESTS);

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async ({ jobId, jobUrl }) => {
      try {
        const details = await crawlJobDetails(jobId, jobUrl);
        return {
          jobId,
          jobUrl,
          success: true,
          data: details
        };
      } catch (error) {
        return {
          jobId,
          jobUrl,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    // Add delay between chunks
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }

  return results;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function parseLinkedInJobDetail(html: string, headers: Record<string, string>): Promise<JobDetail> {
  const $ = cheerio.load(html);
  
  // Extract job description
  const description = $('.description__text').text().trim();
  const descriptionHtml = $('.description__text').html() || '';
  
  // Extract requirements from the description
  const requirements = $('.description__text')
    .find('ul li')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(text => text.length > 0);

  // Extract other details
  const criteria = $('.job-criteria__list');
  const seniorityLevel = criteria.find('.job-criteria__item:contains("Seniority level")').find('.job-criteria__text').text().trim();
  const employmentType = criteria.find('.job-criteria__item:contains("Employment type")').find('.job-criteria__text').text().trim();
  const jobFunction = criteria.find('.job-criteria__item:contains("Job function")').find('.job-criteria__text').text().trim();
  const industries = criteria.find('.job-criteria__item:contains("Industries")').find('.job-criteria__text').text().trim().split(',').map(s => s.trim());

  // Try to find apply button URL
  let applyUrl = '';
  let isExternal = false;

  // First try to find the apply button
  const applyButton = $('.jobs-apply-button, .jobs-unified-top-card__apply-button');
  if (applyButton.length) {
    const applyHref = applyButton.attr('href');
    if (applyHref) {
      try {
        // Try to follow the redirect
        const applyResponse = await axios.get(applyHref, {
          headers: {
            ...headers,
            'Referer': 'https://www.linkedin.com/jobs/'
          },
          maxRedirects: 5,
          validateStatus: null, // Accept all status codes
          withCredentials: true
        });

        // Check final URL after redirects
        const finalUrl = applyResponse.request?.res?.responseUrl || applyResponse.config?.url;
        if (finalUrl && !finalUrl.includes('linkedin.com')) {
          applyUrl = finalUrl;
          isExternal = true;
        }
      } catch (err) {
        const error = err as { response?: { headers?: { location?: string } } };
        console.warn('Error following apply button redirect:', error);
        if (error?.response?.headers?.location) {
          const redirectUrl = error.response.headers.location;
          if (redirectUrl && !redirectUrl.includes('linkedin.com')) {
            applyUrl = redirectUrl;
            isExternal = true;
          }
        }
      }
    }
  }

  // Extract company info
  const companyInfo = $('.top-card-layout__card');
  const companySize = companyInfo.find('.company-size').text().trim();
  const applicantCount = $('.num-applicants__caption').text().trim();

  // Extract benefits if available
  const benefits = $('.benefits__list')
    .find('li')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(text => text.length > 0);

  return {
    description,
    descriptionHtml,
    requirements,
    benefits,
    employmentType,
    seniorityLevel,
    industries,
    applicantCount,
    companySize,
    jobFunction,
    applyUrl: applyUrl || undefined,
    isExternalPosting: isExternal,
    crawledAt: new Date().toISOString()
  };
}

function parseExternalJobDetail(html: string, url: string): JobDetail {
  const $ = cheerio.load(html);
  
  // Try to find job description using common selectors
  const possibleDescriptionSelectors = [
    '.job-description',
    '#job-description',
    '[data-testid="jobDescription"]',
    '.description',
    'article',
    '.posting-body',
    'main'
  ];

  let description = '';
  let descriptionHtml = '';

  for (const selector of possibleDescriptionSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      description = element.text().trim();
      descriptionHtml = element.html() || '';
      break;
    }
  }

  // Extract requirements from lists in the description
  const requirements = $('ul li, ol li')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(text => 
      text.length > 0 && 
      (text.includes('require') || 
       text.includes('qualif') || 
       text.includes('skill') ||
       text.includes('experience'))
    );

  return {
    description: description || 'Description not found',
    descriptionHtml: descriptionHtml || '',
    requirements,
    benefits: [],
    employmentType: 'Not specified',
    seniorityLevel: 'Not specified',
    industries: [],
    applicantCount: 'Unknown',
    companySize: 'Not specified',
    jobFunction: 'Not specified',
    externalUrl: url,
    applyUrl: url,
    isExternalPosting: true,
    crawledAt: new Date().toISOString()
  };
}

export type { JobDetail, BulkCrawlResult };
