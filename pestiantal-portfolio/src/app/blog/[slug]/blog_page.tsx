import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';

// Custom components for MDX
const components = {
  img: (props) => (
    <div className="my-6">
      <Image
        src={props.src}
        alt={props.alt || "Blog image"}
        width={800}
        height={500}
        className="rounded-lg mx-auto"
        style={{ objectFit: 'contain' }}
      />
    </div>
  ),
};

// Function to get blog post data
function getPostData(slug) {
  const markdownFile = path.join(process.cwd(), 'src/app/content/blog', `${slug}.md`);
  const fileContents = fs.readFileSync(markdownFile, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    frontmatter: data,
    slug,
    content,
  };
}

export default function BlogPost({ params }) {
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