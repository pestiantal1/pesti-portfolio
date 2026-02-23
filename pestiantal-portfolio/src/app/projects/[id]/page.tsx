import { getProjects } from "@/lib/projects";
import ProjectPageClient from "./ProjectPageClient";

// Required for static export with dynamic routes
export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectPageClient projectId={id} />;
}
