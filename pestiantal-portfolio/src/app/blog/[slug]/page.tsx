import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/app/blogData';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import hljs from 'highlight.js';

import { generateStaticParams } from './generateStaticParams';
export { generateStaticParams };

// Format markdown to HTML function with syntax highlighting
function formatMarkdown(markdown: string) {
  if (!markdown) return '';
  
  // First, normalize line endings and trim extra whitespace
  let normalizedMarkdown = markdown.replace(/\r\n/g, '\n').trim();
  
  // Process code blocks FIRST with syntax highlighting
  const codeBlocks: string[] = [];
  normalizedMarkdown = normalizedMarkdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    
    // Apply syntax highlighting
    let highlightedCode;
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(code.trim(), { language: lang }).value;
      } catch {
        // Remove the 'e' parameter since it's not used
        highlightedCode = hljs.highlightAuto(code.trim()).value;
      }
    } else {
      highlightedCode = hljs.highlightAuto(code.trim()).value;
    }
    
    codeBlocks.push(`<pre class="hljs bg-primary-400 p-4 rounded-lg my-4 overflow-x-auto"><code class="language-${lang || 'plaintext'}">${highlightedCode}</code></pre>`);
    return placeholder;
  });
  
  // Process inline code SECOND (before other inline formatting)
  const inlineCodes: string[] = [];
  normalizedMarkdown = normalizedMarkdown.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `___INLINE_CODE_${inlineCodes.length}___`;
    inlineCodes.push(`<code class="bg-primary-400 px-1 rounded text-sm">${code}</code>`);
    return placeholder;
  });
  
  // Now process the rest of the markdown
  let html = normalizedMarkdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-3">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-lg">')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>');
  
  // Process lists - handle numbered and bulleted lists
  // Process ordered lists
  html = html.replace(/^(\d+\.\s+.+$(?:\n\d+\.\s+.+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => {
      const content = line.replace(/^\d+\.\s+/, '');
      return `<li>${content}</li>`;
    }).join('\n');
    return `<ol class="list-decimal pl-5 my-3 space-y-1">${items}</ol>`;
  });
  
  // Process unordered lists
  html = html.replace(/^(-\s+.+$(?:\n-\s+.+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => {
      const content = line.replace(/^-\s+/, '');
      return `<li>${content}</li>`;
    }).join('\n');
    return `<ul class="list-disc pl-5 my-3 space-y-1">${items}</ul>`;
  });
  
  // Split into paragraphs and wrap non-special elements
  const paragraphs = html.split('\n\n').map(paragraph => {
    paragraph = paragraph.trim();
    if (paragraph.startsWith('<h1') || 
        paragraph.startsWith('<h2') || 
        paragraph.startsWith('<h3') || 
        paragraph.startsWith('<ul') || 
        paragraph.startsWith('<ol') || 
        paragraph.startsWith('<pre') || 
        paragraph.startsWith('<img') ||
        paragraph.startsWith('___CODE_BLOCK') ||
        paragraph.startsWith('___INLINE_CODE')) {
      return paragraph;
    }
    return `<p class="my-3 leading-relaxed">${paragraph.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  
  // Restore code blocks
  let result = paragraphs;
  codeBlocks.forEach((block, index) => {
    result = result.replace(`___CODE_BLOCK_${index}___`, block);
  });
  
  // Restore inline code
  inlineCodes.forEach((code, index) => {
    result = result.replace(`___INLINE_CODE_${index}___`, code);
  });
  
  return result;
}

// Metadata function - UPDATED to handle async params
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  // Await the params
  const resolvedParams = await params;
  const post = blogPosts.find(p => p.slug === resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = 'https://pantal.dev';
  const postUrl = `${baseUrl}/blog/${resolvedParams.slug}`;
  
  // You can use one of your blog images or create a specific OG image
  const ogImage = `${baseUrl}/images/blog/${resolvedParams.slug}/og-image.jpg`;

  return {
    title: post.title,
    description: post.excerpt,
    
    // Open Graph tags (these work for Twitter too as fallbacks)
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'pantal',
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
    },
    
    // Twitter Card specific tags
    twitter: {
      card: 'summary_large_image', // This is the most common card type
      site: '@pesti_antal', // Add your Twitter/X handle here
      creator: '@pesti_antal', // Your Twitter/X handle
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    
    // Additional metadata
    alternates: {
      canonical: postUrl,
    },
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
            className="blog-content"
          />
        </article>
      </div>
    </div>
  );
}