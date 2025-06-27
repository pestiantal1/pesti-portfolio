import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/app/blogData';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';

// Import the generateStaticParams function
import { generateStaticParams } from './generateStaticParams';

// Re-export it
export { generateStaticParams };

// Format markdown to HTML with adjusted heading spacing
function formatMarkdown(markdown: string) {
  if (!markdown) return '';
  
  // First, normalize line endings and trim extra whitespace
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').trim();
  
  return normalizedMarkdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="my-4"><img alt="$1" src="$2" class="rounded-lg max-w-full mx-auto" /></div>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 list-decimal">$2</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/<\/li>\s*<li class="ml-6 list-decimal">/g, '</li><li class="ml-6 list-decimal">')
    .replace(/<\/li>\s*<li class="ml-6 list-disc">/g, '</li><li class="ml-6 list-disc">')
    .replace(/(<li class="ml-6 list-decimal">.*<\/li>)/gs, '<ol class="my-3">$1</ol>')
    .replace(/(<li class="ml-6 list-disc">.*<\/li>)/gs, '<ul class="my-3">$1</ul>')
    // Split by double newlines (paragraphs in markdown)
    .split(/\n\n+/).map(paragraph => {
      if (paragraph.startsWith('<h') || 
          paragraph.startsWith('<ul') || 
          paragraph.startsWith('<ol') ||
          paragraph.startsWith('<div')) {
        return paragraph;
      }
      // Replace single newlines with spaces for proper paragraph formatting
      return `<p class="my-3">${paragraph.replace(/\n/g, ' ')}</p>`;
    }).join('');
}

// Update your page component to use the correct types

type BlogPostParams = {
  params: {
    slug: string;
  };
};

// Define proper return type for generateMetadata
export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  // Your metadata generation logic
  return {
    title: `Blog Post - ${params.slug}`,
    // Other metadata properties
  };
}

// Make sure the page component has correct typing
export default async function BlogPost({ params }: BlogPostParams) {
  const { slug } = params;
  
  // Find the blog post metadata
  const post = blogPosts.find(post => post.slug === slug);
  
  if (!post) {
    notFound();
  }
  
  // Read the markdown file
  let postContent = '';
  try {
    const filePath = path.join(process.cwd(), 'public', 'blog-content', `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const { content } = matter(fileContents);
    postContent = content;
  } catch (error) {
    console.error('Failed to read blog post:', error);
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-primary text-light">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/" className="text-accent hover:underline mb-8 block">← Back to home</Link>
        
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-neutral mb-8">{post.date}</div>
        
        <article className="prose prose-invert prose-lg max-w-none 
                            prose-h1:mt-6 prose-h1:mb-3 
                            prose-h2:mt-5 prose-h2:mb-2 
                            prose-h3:mt-4 prose-h3:mb-2
                            prose-p:my-2 prose-img:my-4">
          <div 
            dangerouslySetInnerHTML={{ __html: formatMarkdown(postContent) }} 
            className="[&>p]:my-3 [&>h1]:mt-6 [&>h1]:mb-3 [&>h2]:mt-5 [&>h2]:mb-2 [&>h3]:mt-4 [&>h3]:mb-2"
          />
        </article>
      </div>
    </div>
  );
}