"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";
import { Project } from "@/types/project";

export default function ProjectsPageClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError("Failed to load projects");
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-neutral">Loading projects...</div>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
