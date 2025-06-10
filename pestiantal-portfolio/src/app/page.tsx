'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Social media icons
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Home() {
  const [typedText, setTypedText] = useState('')
  const fullText = 'Antal Pesti'
  
  // Modified typewriter effect - plays once without looping
  useEffect(() => {
    let i = 0
    const typing = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i))
        i++
      } else {
        // Once complete, clear the interval to stop the animation
        clearInterval(typing)
      }
    }, 150)
    
    return () => clearInterval(typing)
  }, [])
  
  return (
    <div className="min-h-screen bg-primary text-light">
      <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <motion.div 
          className="text-6xl md:text-8xl font-bold mb-12 font-mono text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {typedText}<span className="animate-pulse text-accent">_</span>
        </motion.div>
        
        {/* Social links */}
        <motion.div 
          className="flex space-x-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" 
            className="text-3xl text-neutral hover:text-accent transition-colors">
            <FaGithub />
          </a>
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer"
            className="text-3xl text-neutral hover:text-accent transition-colors">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer"
            className="text-3xl text-neutral hover:text-accent transition-colors">
            <FaLinkedin />
          </a>
          <a href="mailto:your@email.com"
            className="text-3xl text-neutral hover:text-accent transition-colors">
            <FaEnvelope />
          </a>
        </motion.div>
        
        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Link href="/contact"
            className="bg-accent hover:opacity-90 text-light px-8 py-3 rounded-md font-medium transition-colors">
            Hire Me
          </Link>
        </motion.div>
        
        {/* Latest blog posts */}
        <motion.div
          className="mt-24 w-full max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-light">Latest Posts</h2>
          <div className="space-y-6">
            {/* This would be populated from your actual blog posts */}
            <BlogPostPreview 
              title="Building a Modern Web Application"
              date="June 5, 2025"
              slug="building-modern-web-app"
            />
            <BlogPostPreview 
              title="Best Practices for React Developers"
              date="May 28, 2025"
              slug="react-best-practices"
            />
          </div>
          <div className="mt-8">
            <Link href="/blog" 
              className="text-neutral hover:text-accent hover:underline transition-colors">
              View all posts →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// Blog post preview component
function BlogPostPreview({ title, date, slug }: { title: string; date: string; slug: string }) {
  return (
    <Link href={`/blog/${slug}`} className="block">
      <div className="p-6 border border-secondary bg-primary-600 rounded-lg hover:bg-secondary-200 transition-colors">
        <h3 className="text-xl font-medium mb-2 text-light">{title}</h3>
        <time className="text-sm text-neutral">{date}</time>
      </div>
    </Link>
  )
}