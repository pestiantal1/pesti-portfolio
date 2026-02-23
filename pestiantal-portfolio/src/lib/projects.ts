import { Project, RawProject } from "@/types/project";
import fallbackProjectsData from "@/data/projects.fallback.json";

// Cache configuration
const CACHE_KEY = "portfolio_projects_cache";
const CACHE_TIMESTAMP_KEY = "portfolio_projects_cache_timestamp";
const CACHE_TTL = parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || "3600000", 10); // 1 hour default

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://167.99.139.139";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "/public/projects";
const API_URL = `${API_BASE_URL}${API_ENDPOINT}`;

interface CachedData {
  projects: RawProject[];
  timestamp: number;
}

/**
 * Check if cached data is still valid based on TTL
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get cached projects data from localStorage
 */
function getCachedProjects(): CachedData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const parsedTimestamp = parseInt(timestamp, 10);
      if (isCacheValid(parsedTimestamp)) {
        return {
          projects: JSON.parse(cached),
          timestamp: parsedTimestamp,
        };
      }
    }
  } catch (error) {
    console.warn("Failed to read from cache:", error);
  }
  
  return null;
}

/**
 * Save projects data to localStorage cache
 */
function setCachedProjects(projects: RawProject[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save to cache:", error);
  }
}

/**
 * Clear the cached projects data
 */
export function clearProjectsCache(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Fetch projects from the live API
 */
async function fetchProjectsFromAPI(): Promise<RawProject[] | null> {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Validate response is an array
    if (!Array.isArray(data)) {
      console.warn("API response is not an array");
      return null;
    }

    return data as RawProject[];
  } catch (error) {
    console.warn("Failed to fetch from API:", error);
    return null;
  }
}

/**
 * Transform raw project data to Project type with proper Date objects
 */
function transformProjects(projects: RawProject[]): Project[] {
  return projects.map((project) => ({
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }));
}

/**
 * Get all projects with caching and fallback strategy:
 * 1. Try fetching from live API
 * 2. If API fails, check localStorage cache
 * 3. If cache is stale/missing, fallback to static JSON
 */
export async function getProjects(): Promise<Project[]> {
  // Try API first
  const apiData = await fetchProjectsFromAPI();
  
  if (apiData) {
    // Success! Cache and return
    setCachedProjects(apiData);
    return transformProjects(apiData);
  }

  // API failed, try cache
  const cached = getCachedProjects();
  if (cached) {
    console.log("Using cached data from", new Date(cached.timestamp).toLocaleString());
    return transformProjects(cached.projects);
  }

  // Both API and cache failed, use fallback
  console.log("Using fallback static data");
  return transformProjects(fallbackProjectsData as RawProject[]);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) || null;
}

/**
 * Force refresh projects from API, bypassing cache
 */
export async function refreshProjects(): Promise<Project[]> {
  clearProjectsCache();
  return getProjects();
}