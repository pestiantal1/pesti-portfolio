import Image from "next/image";
import Link from "next/link";
import { getProject, getProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-primary text-light">
      {/* Back Button Header */}
      <div className="border-b border-secondary mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/projects"
            className="inline-flex items-center space-x-2 text-neutral hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={project.icon}
                alt={`${project.name} icon`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-light mb-1">
                {project.name}
              </h1>
              <span className="text-neutral">
                Version {project.version}
              </span>
            </div>
          </div>

          <p className="text-lg text-neutral mb-6">
            {project.shortDescription}
          </p>

          {/* Links */}
          <div className="flex space-x-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-secondary text-light rounded-lg hover:bg-secondary-200 transition-colors"
              >
                View on GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-accent text-light rounded-lg hover:bg-accent/90 transition-colors"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-light mb-4">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-3">
            {project.stack.map((tech, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary rounded-lg"
              >
                <span className="font-medium text-light">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        {project.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-light mb-4">
              Gallery
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {project.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full rounded-lg border border-secondary overflow-hidden bg-secondary/20"
                >
                  <Image
                    src={image}
                    alt={`${project.name} screenshot ${index + 1}`}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Description */}
        {project.fullDescription && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-light mb-4">
              About
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-neutral">
                {project.fullDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}