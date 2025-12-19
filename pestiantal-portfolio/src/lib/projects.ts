import { Project } from "@/types/project";
import projectsData from "@/data/projects.json";

export async function getProjects(): Promise<Project[]> {
  return projectsData.map((project) => ({
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) || null;
}