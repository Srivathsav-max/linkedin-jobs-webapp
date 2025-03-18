export interface SearchParams {
  keyword?: string;
  location?: string;
  dateSincePosted?: string;
  jobType?: string;
  remoteFilter?: string;
  salary?: string;
  experienceLevel?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
  host?: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyUrl: string;
  companyId: string;
  location: string;
  jobUrl: string;
  publishedAt: string;
  postedTime: string;
  salary: string;
  applicationsCount: string;
  description: string;
  descriptionHtml: string;
  contractType: string;
  experienceLevel: string;
  workType: string;
  sector: string;
  applyUrl: string;
  applyType: string;
  benefits: string;
  posterProfileUrl: string;
  posterFullName: string;
}
