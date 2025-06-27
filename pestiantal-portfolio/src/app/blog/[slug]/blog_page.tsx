import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import React from 'react';

// Define the props type for the img component
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

// Custom components for MDX
const components = {
  img: (props: ImageProps) => (
    <div className="my-6">
      <Image
        src={props.src}
        alt={props.alt || ""}
        width={props.width || 800}
        height={props.height || 500}
        className={`rounded-lg ${props.className || ""}`}
      />
    </div>
  ),
  // Add other custom components here if needed
};

// Function to get blog post data
function getPostData(slug: string) {
  const markdownFile = path.join(process.cwd(), 'src/app/content/blog', `${slug}.md`);
  const fileContents = fs.readFileSync(markdownFile, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    frontmatter: data,
    slug,
    content,
  };
}

// Fix the BlogPost component to add proper typing
interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function BlogPost({ params }: BlogPostProps) {
  const { slug } = params;
  const { frontmatter, content } = getPostData(slug);
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <div className="text-neutral mb-8">{frontmatter.date}</div>
      <div className="prose prose-invert prose-lg max-w-none">
        <MDXRemote source={content} components={components} />
      </div>
    </div>
  );
}