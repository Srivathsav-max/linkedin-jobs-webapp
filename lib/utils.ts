import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(salary: string): string {
  if (salary === "Not specified") return salary;
  const num = parseInt(salary.replace(/[^0-9]/g, ""));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function getTimeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getJobTypeBadgeColor(jobType: string): string {
  const types: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800",
    "part-time": "bg-blue-100 text-blue-800",
    contract: "bg-purple-100 text-purple-800",
    temporary: "bg-orange-100 text-orange-800",
    internship: "bg-cyan-100 text-cyan-800",
    volunteer: "bg-pink-100 text-pink-800",
  };
  return types[jobType.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function getLocationBadgeColor(type: string): string {
  const types: Record<string, string> = {
    remote: "bg-indigo-100 text-indigo-800",
    hybrid: "bg-amber-100 text-amber-800",
    "on-site": "bg-emerald-100 text-emerald-800",
  };
  return types[type.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export const SEARCH_PARAMS_DEFAULTS = {
  keyword: "",
  location: "",
  dateSincePosted: "",
  jobType: "",
  remoteFilter: "",
  salary: "",
  experienceLevel: "",
  sortBy: "relevant",
  limit: 50,
  page: 0,
};
