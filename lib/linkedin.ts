import * as cheerio from "cheerio";
import axios from "axios";
import randomUseragent from "random-useragent";
import { Job, SearchParams } from "../types/jobs";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class JobCache {
  public cache: Map<string, { data: Job[]; timestamp: number }>;
  private TTL: number;

  constructor() {
    this.cache = new Map();
    this.TTL = 1000 * 60 * 60 * 24; // 24 hours
  }

  set(key: string, value: Job[]) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): Job[] | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export class Query {
  private host: string;
  private keyword: string;
  private location: string;
  private dateSincePosted: string;
  private jobType: string;
  private remoteFilter: string;
  private salary: string;
  private experienceLevel: string;
  private sortBy: string;
  private limit: number;
  private page: number;

  constructor(queryObj: SearchParams) {
    this.host = queryObj.host || "www.linkedin.com";
    this.keyword = queryObj.keyword?.trim().replace(/\s+/g, "+") || "";
    this.location = queryObj.location?.trim().replace(/\s+/g, "+") || "";
    this.dateSincePosted = queryObj.dateSincePosted || "";
    this.jobType = queryObj.jobType || "";
    this.remoteFilter = queryObj.remoteFilter || "";
    this.salary = queryObj.salary || "";
    this.experienceLevel = queryObj.experienceLevel || "";
    this.sortBy = queryObj.sortBy || "";
    this.limit = Number(queryObj.limit) || 0;
    this.page = Number(queryObj.page) || 0;
  }

  private getDateSincePosted(): string {
    const dateRange: { [key: string]: string } = {
      "past month": "r2592000",
      "past week": "r604800",
      "24hr": "r86400",
    };
    return dateRange[this.dateSincePosted.toLowerCase()] || "";
  }

  private getExperienceLevel(): string {
    const experienceRange: { [key: string]: string } = {
      internship: "1",
      "entry level": "2",
      associate: "3",
      senior: "4",
      director: "5",
      executive: "6",
    };
    return experienceRange[this.experienceLevel.toLowerCase()] || "";
  }

  private getJobType(): string {
    const jobTypeRange: { [key: string]: string } = {
      "full time": "F",
      "full-time": "F",
      "part time": "P",
      "part-time": "P",
      contract: "C",
      temporary: "T",
      volunteer: "V",
      internship: "I",
    };
    return jobTypeRange[this.jobType.toLowerCase()] || "";
  }

  private getRemoteFilter(): string {
    const remoteFilterRange: { [key: string]: string } = {
      "on-site": "1",
      "on site": "1",
      remote: "2",
      hybrid: "3",
    };
    return remoteFilterRange[this.remoteFilter.toLowerCase()] || "";
  }

  private getSalary(): string {
    const salaryRange: { [key: string]: string } = {
      40000: "1",
      60000: "2",
      80000: "3",
      100000: "4",
      120000: "5",
    };
    return salaryRange[this.salary] || "";
  }

  private getPage(): number {
    return this.page * 25;
  }

  private url(start: number): string {
    const query = `https://${this.host}/jobs-guest/jobs/api/seeMoreJobPostings/search?`;
    const params = new URLSearchParams();

    if (this.keyword) params.append("keywords", this.keyword);
    if (this.location) params.append("location", this.location);
    if (this.getDateSincePosted()) params.append("f_TPR", this.getDateSincePosted());
    if (this.getSalary()) params.append("f_SB2", this.getSalary());
    if (this.getExperienceLevel()) params.append("f_E", this.getExperienceLevel());
    if (this.getRemoteFilter()) params.append("f_WT", this.getRemoteFilter());
    if (this.getJobType()) params.append("f_JT", this.getJobType());

    params.append("start", (start + this.getPage()).toString());

    if (this.sortBy === "recent") params.append("sortBy", "DD");
    else if (this.sortBy === "relevant") params.append("sortBy", "R");

    return query + params.toString();
  }

  async getJobs(): Promise<Job[]> {
    let allJobs: Job[] = [];
    let start = 0;
    const BATCH_SIZE = 25;
    const MAX_EXECUTION_TIME = 8000; // 8 seconds max execution time
    const startTime = Date.now();
    let hasMore = true;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    try {
      // Check cache first
      const cacheKey = this.url(0);
      const cachedJobs = cache.get(cacheKey);
      if (cachedJobs) {
        console.log("Returning cached results");
        return cachedJobs;
      }

      while (hasMore) {
        try {
          const jobs = await this.fetchJobBatch(start);

          if (!jobs || jobs.length === 0) {
            hasMore = false;
            break;
          }

          allJobs.push(...jobs);
          console.log(`Fetched ${jobs.length} jobs. Total: ${allJobs.length}`);

          if (this.limit && allJobs.length >= this.limit) {
            allJobs = allJobs.slice(0, this.limit);
            break;
          }

          consecutiveErrors = 0;
          start += BATCH_SIZE;

          // Check if we're approaching the timeout
          if (Date.now() - startTime > MAX_EXECUTION_TIME) {
            console.log("Approaching execution time limit, returning current results");
            break;
          }
          
          await delay(1000 + Math.random() * 500); // Reduced delay
        } catch (error) {
          consecutiveErrors++;
          console.error(`Error fetching batch (attempt ${consecutiveErrors}):`, error);

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.log("Max consecutive errors reached. Stopping.");
            break;
          }

          await delay(Math.pow(2, consecutiveErrors) * 1000);
        }
      }

      if (allJobs.length > 0) {
        cache.set(this.url(0), allJobs);
      }

      return allJobs;
    } catch (error) {
      console.error("Fatal error in job fetching:", error);
      throw error;
    }
  }

  private async fetchJobBatch(start: number): Promise<Job[]> {
      const userAgent = randomUseragent.getRandom();
      const headers = {
        "User-Agent": userAgent,
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.linkedin.com/jobs/search",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1",
        Cookie: "",
        Origin: "https://www.linkedin.com",
        Host: "www.linkedin.com"
      };

    try {
      const response = await axios.get(this.url(start), {
        headers,
        validateStatus: (status) => status === 200,
        timeout: 5000, // Reduced timeout for each request
        maxRedirects: 5
      });

      if (response.data.includes('captcha')) {
        throw new Error('LinkedIn is requesting captcha verification');
      }

      return parseJobList(response.data);
    } catch (error) {
      const err = error as { response?: { status?: number } };
      const status = err.response?.status;
      if (status === 429 || status === 403) {
        console.error(`Request blocked (${status}). Headers:`, headers);
        throw new Error("Access denied by LinkedIn. Please try again later.");
      }
      throw error;
    }
  }
}

function parseJobList(jobData: string): Job[] {
  try {
    const $ = cheerio.load(jobData);
    const jobs = $("li");

    return jobs
      .map((_, element) => {
        try {
          const job = $(element);
          // Get elements with null safety
          const titleEl = job.find(".base-search-card__title");
          const companyNameEl = job.find(".base-search-card__subtitle");
          const locationEl = job.find(".job-search-card__location");
          const companyLinkEl = job.find(".base-search-card__subtitle a");
          const jobLinkEl = job.find(".base-card__full-link");
          const postedTimeEl = job.find(".job-search-card__listdate");
          const salaryEl = job.find(".job-search-card__salary-info");
          const dateElement = job.find("time");

          // Extract values with default fallbacks
          const title = titleEl.length ? titleEl.text().trim() : "";
          const companyName = companyNameEl.length ? companyNameEl.text().trim() : "";
          const location = locationEl.length ? locationEl.text().trim() : "";
          const companyUrl = companyLinkEl.length ? companyLinkEl.attr("href") || "" : "";
          const jobUrl = jobLinkEl.length ? jobLinkEl.attr("href") || "" : "";
          const postedTime = postedTimeEl.length ? postedTimeEl.text().trim() : "";
          const salary = salaryEl.length ? salaryEl.text().trim().replace(/\s+/g, " ") : "";
          const publishedAt = dateElement.length ? dateElement.attr("datetime") || "" : "";
          
          // Extract job ID from URL
          const id = jobUrl.split("view/")[1]?.split("?")[0] || "";
          // Extract company ID from URL
          const companyId = companyUrl.split("company/")[1]?.split("?")[0] || "";

          const applicationsEl = job.find(".job-search-card__applicant-count");
          const applicationsCount = applicationsEl.length ? applicationsEl.text().trim() : "";
          
          // These fields might need to be populated from a detailed job view
          const contractType = "Full-time"; // Default value
          const experienceLevel = "Not specified";
          const workType = "Not specified";
          const sector = "Not specified";
          const description = "";
          const descriptionHtml = "";
          const applyUrl = jobUrl;
          const applyType = "EXTERNAL";
          const benefits = "";
          const posterProfileUrl = "";
          const posterFullName = "";

          // Both title and companyName must be present
          if (!title || !companyName || !jobUrl) {
            return null;
          }

          return {
            id,
            title,
            companyName,
            companyUrl,
            companyId,
            location,
            jobUrl,
            publishedAt,
            postedTime,
            salary,
            applicationsCount,
            description,
            descriptionHtml,
            contractType,
            experienceLevel,
            workType,
            sector,
            applyUrl,
            applyType,
            benefits,
            posterProfileUrl,
            posterFullName
          };
        } catch (err) {
          console.warn('Error parsing job element:', err);
          return null;
        }
      })
      .get()
      .filter(Boolean) as Job[];
  } catch (error) {
    console.error("Error parsing job list:", error);
    return [];
  }
}

export const cache = new JobCache();
export const clearCache = () => cache.clear();
export const getCacheSize = () => cache.cache.size;
