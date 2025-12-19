import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/project";
import TechIcon from "./TechIcon";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
    >
      {/* Project Icon and Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={project.icon}
                alt={`${project.name} icon`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                v{project.version}
              </span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-4">
          {project.shortDescription}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech, index) => (
            <div
              key={index}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              <TechIcon name={tech.icon} className="w-3.5 h-3.5" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}