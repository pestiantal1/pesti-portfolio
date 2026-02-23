export interface Project {
  id: string;
  name: string;
  version: string;
  shortDescription: string;
  fullDescription?: string;
  icon: string; // Path to icon image
  images: string[]; // Array of image paths (2-3 images)
  stack: TechStack[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TechStack {
  name: string;
  icon: string; // Path to stack icon or icon component name
  color?: string; // Optional color for the icon
}

// Raw project data as received from API or JSON (dates as strings)
export interface RawProject {
  id: string;
  name: string;
  version: string;
  shortDescription: string;
  fullDescription?: string;
  icon: string;
  images: string[];
  stack: TechStack[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}