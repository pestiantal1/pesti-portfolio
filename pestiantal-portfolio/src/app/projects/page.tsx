import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";
import Navigation from "@/components/Navigation";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </>
  );
}