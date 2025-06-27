import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/app/blogData';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

import { generateStaticParams } from './generateStaticParams';
export { generateStaticParams };

// Format markdown to HTML function
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
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-lg">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/(<li>[\s\S]*<\/li>)/g, '<ul class="list-disc pl-5 my-3">$1</ul>')
    .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre class="bg-primary-400 p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-primary-400 px-1 rounded text-sm">$1</code>')
    .split('\n\n').map(paragraph => {
      if (paragraph.startsWith('<h1') || 
          paragraph.startsWith('<h2') || 
          paragraph.startsWith('<h3') || 
          paragraph.startsWith('<ul') || 
          paragraph.startsWith('<pre') || 
          paragraph.startsWith('<img')) {
        return paragraph;
      }
      return `<p class="my-3">${paragraph.replace(/\n/g, ' ')}</p>`;
    }).join('');
}

// Metadata function
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts.find(post => post.slug === resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found'
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt
  };
}

// Page component
export default async function BlogPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
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
        
        <article className="prose prose-invert prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: formatMarkdown(postContent) }} 
          />
        </article>
      </div>
    </div>
  );
}