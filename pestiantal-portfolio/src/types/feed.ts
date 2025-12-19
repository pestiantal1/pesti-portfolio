export interface FeedEntry {
  id: string;
  type: "post" | "project-update";
  title: string;
  content: string;
  createdAt: Date;
  projectId?: string; // Link to project if type is "project-update"
}