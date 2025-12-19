import * as Icons from "react-icons/si";
import { IconType } from "react-icons";

interface TechIconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, IconType> = {
  typescript: Icons.SiTypescript,
  javascript: Icons.SiJavascript,
  react: Icons.SiReact,
  nextjs: Icons.SiNextdotjs,
  nodejs: Icons.SiNodedotjs,
  python: Icons.SiPython,
  kotlin: Icons.SiKotlin,
//   java: Icons.SiJava,
  sql: Icons.SiPostgresql,
  mysql: Icons.SiMysql,
  postgresql: Icons.SiPostgresql,
  mongodb: Icons.SiMongodb,
  tailwindcss: Icons.SiTailwindcss,
  git: Icons.SiGit,
  docker: Icons.SiDocker,
//   aws: Icons.SiAmazonaws,
  vercel: Icons.SiVercel,
};

export default function TechIcon({ name, className = "w-5 h-5" }: TechIconProps) {
  const Icon = iconMap[name.toLowerCase()];
  
  if (!Icon) {
    return null;
  }

  return <Icon className={className} />;
}