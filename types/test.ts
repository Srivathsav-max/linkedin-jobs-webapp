interface JobDataAttributes {
  [key: string]: string;
}

export interface JobData {
  jobId: string;
  title: string;
  titleHtml: string | null;
  company: string;
  companyUrl: string | null;
  location: string;
  cardLink: string;
  applyLink: string | null;
  datePosted: string | null;
  timeAgo: string;
  applicantCount: string;
  salaryInfo: string;
  companyLogo: string | null;
  dataAttributes: JobDataAttributes;
  rawCardHtml: string;
  listItemClasses: string | null;
  allClasses: string[];
}

export interface JobDetails {
  jobId: string;
  jobUrl: string;
  details: {
    [key: string]: unknown;
  };
  timestamp: string;
}

export interface BulkCrawlResult {
  jobs: Array<{
    jobId: string;
    jobUrl: string;
    success: boolean;
    details?: unknown;
    error?: string;
  }>;
  success: boolean;
  timestamp: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
}

export interface TestData {
  firstJob?: JobData;
  jobs?: JobData[];
  jobDetails?: JobDetails;
  bulkResults?: BulkCrawlResult;
  totalJobs?: number;
  rawHtml?: string;
  metadata?: {
    requestUrl: string;
    timestamp: string;
    requestParams: {
      keywords: string;
      location: string;
      start: string;
    };
  };
}
