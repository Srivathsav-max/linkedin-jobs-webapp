import { NextResponse } from 'next/server';
import axios from 'axios';
import randomUseragent from 'random-useragent';
import * as cheerio from 'cheerio';

// Add delay function to prevent rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const userAgent = randomUseragent.getRandom();
    const headers = {
      "User-Agent": userAgent,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://www.linkedin.com/jobs/search/",
      "sec-ch-ua": `"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "macOS",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "Connection": "keep-alive"
    };

    // Get search parameters from the request
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || 'software engineer';
    const location = searchParams.get('location') || 'United States';
    const start = searchParams.get('start') || '0';

    // Make search request with parameters
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&start=${start}`;
    
    // Add random delay before request
    await delay(1000 + Math.random() * 2000);
    
    const response = await axios.get(url, {
      headers,
      validateStatus: (status) => status === 200,
      timeout: 15000,
      maxRedirects: 5,
      withCredentials: true
    });

    if (response.data.includes('captcha')) {
      throw new Error('LinkedIn is requesting captcha verification');
    }

    // Load HTML and extract all data
    const $ = cheerio.load(response.data);
    const jobsData = $("li").map((index, element) => {
      const job = $(element);
      
      // Extract all data attributes from the job card
      const dataAttributes: { [key: string]: string } = {};
      Object.keys(element.attribs)
        .filter(attr => attr.startsWith('data-'))
        .forEach(attr => {
          dataAttributes[attr] = element.attribs[attr];
        });

      // Get job ID from different sources
      const cardLink = job.find(".base-card__full-link").attr("href") || '';
      const entityUrn = job.attr("data-entity-urn") || '';
      
      // Extract job ID using different methods
      let jobId = '';
      if (cardLink) {
        // Try getting ID from URL first
        const urlMatch = cardLink.match(/view\/[^/]+?-(\d+)\?/);
        if (urlMatch && urlMatch[1]) {
          jobId = urlMatch[1];
        }
      }
      if (!jobId && entityUrn) {
        // Fallback to data-entity-urn if URL method failed
        const urnMatch = entityUrn.match(/jobPosting:(\d+)/);
        if (urnMatch && urnMatch[1]) {
          jobId = urnMatch[1];
        }
      }

      // Extract structured data
      const structuredData = {
        // Job ID
        jobId,
        
        // Basic job info
        title: job.find(".base-search-card__title").text().trim(),
        titleHtml: job.find(".base-search-card__title").html(),
        company: job.find(".base-search-card__subtitle").text().trim(),
        companyUrl: job.find(".base-search-card__subtitle a").attr("href"),
        location: job.find(".job-search-card__location").text().trim(),
        
        // Links and URLs
        cardLink,
        applyLink: job.find(".job-search-card__link-wrapper").attr("href"),
        
        // Metadata
        datePosted: job.find("time").attr("datetime"),
        timeAgo: job.find(".job-search-card__listdate").text().trim(),
        applicantCount: job.find(".job-search-card__applicant-count").text().trim(),
        salaryInfo: job.find(".job-search-card__salary-info").text().trim(),
        
        // Images
        companyLogo: job.find("img").attr("data-delayed-url"),
        
        // All data attributes
        dataAttributes,
        
        // Raw content
        rawCardHtml: job.html(),
        
        // Additional fields from the card
        listItemClasses: job.attr("class"),
        allClasses: job.find('*').map((_, el) => $(el).attr("class")).get().filter(Boolean)
      };

      return structuredData;
    }).get();

    // Return the analyzed data
    return NextResponse.json({ 
      firstJob: jobsData[0],
      jobs: jobsData,
      totalJobs: jobsData.length,
      rawHtml: response.data
    });

  } catch (error: Error | unknown) {
    console.error('Test route error:', error);
    const errorDetails = error instanceof Error ? {
      error: error.message,
      stack: error.stack
    } : {
      error: 'An unknown error occurred'
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
