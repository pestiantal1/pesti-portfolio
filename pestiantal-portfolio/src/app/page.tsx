'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Social media icons
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { FaSquareXTwitter } from "react-icons/fa6";
import { blogPosts } from './blogData';

const GITHUB_URL = "https://github.com/pestiantal1";
const LINKEDIN_URL = "https://www.linkedin.com/in/antal-pesti-0b7638223";
const TWITTER_URL = "https://x.com/pesti_antal";
const EMAIL = "pesti.antal1@gmail.com";

// Hardcoded blog posts for GitHub Pages (no server-side file reading)
// const blogPosts = [
//   {
//     title: "Exploring Machine Learning Algorithms",
//     date: "June 5, 2025",
//     slug: "exploring-ml-algorithms",
//     excerpt: "An overview of popular machine learning algorithms and their applications."
//   },
//   {
//     title: "Building Responsive UIs with React",
//     date: "May 28, 2025",
//     slug: "react-responsive-ui",
//     excerpt: "Best practices for creating responsive user interfaces with React."
//   },
//   {
//     title: "Data Structures Every Developer Should Know",
//     date: "May 15, 2025",
//     slug: "essential-data-structures",
//     excerpt: "A guide to the fundamental data structures used in software development."
//   }
// ];

export default function Home() {
  const [nameText, setNameText] = useState('')
  const [roleText, setRoleText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [roleIndex, setRoleIndex] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)
  const [cursorVisible, setCursorVisible] = useState(true)
  
  const fullName = 'Antal Pesti'
  const roles = ['Python teacher', 'ML Engineer', 'Software Developer']
  
  // Effect for cursor blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530); // Slower blink rate for more noticeable effect
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Effect for typing out the name (runs once)
  useEffect(() => {
    let i = 0
    const typing = setInterval(() => {
      if (i <= fullName.length) {
        setNameText(fullName.slice(0, i))
        i++
      } else {
        clearInterval(typing)
      }
    }, 150)
    
    return () => clearInterval(typing)
  }, [])
  
  // Effect for the role typing animation (loops)
  useEffect(() => {
    // Start the role typing animation after the name is complete
    if (nameText !== fullName) return
    
    const currentRole = roles[roleIndex]
    
    // For backspacing effect (faster deletion)
    if (isDeleting) {
      setTypingSpeed(70)
    } else {
      setTypingSpeed(75)
    }
    
    // Create a variable delay for each role
    // Developer stays longer
    const pauseLength = roleIndex === roles.length - 1 ? 2500 : 1000
    
    const timer = setTimeout(() => {
      // If deleting
      if (isDeleting) {
        setRoleText(currentRole.substring(0, roleText.length - 1))
        
        // When finished deleting
        if (roleText.length === 0) {
          setIsDeleting(false)
          setRoleIndex((roleIndex + 1) % roles.length) // Move to next role
        }
      } 
      // If typing
      else {
        setRoleText(currentRole.substring(0, roleText.length + 1))
        
        // When finished typing
        if (roleText.length === currentRole.length) {
          // Pause at the end of typing before starting to delete
          setTimeout(() => setIsDeleting(true), pauseLength)
        }
      }
    }, typingSpeed)
    
    return () => clearTimeout(timer)
  }, [nameText, roleText, roleIndex, isDeleting, typingSpeed, fullName, roles])
  
  return (
    <div className="min-h-screen bg-primary text-light">
      <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        {/* Header section with name and role */}
        <motion.div 
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Name */}
          <h1 className="text-6xl md:text-8xl font-medium font-inter text-center relative">
            {nameText}
            {nameText !== fullName && (
              <span 
                className={`text-accent inline-block relative ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ top: '-12px' }}
              >|</span>
            )}
          </h1>
          
          {/* Role */}
          <h2 className="text-2xl md:text-3xl mt-4 font-mono text-neutral h-10 relative">
            {roleText}
            <span 
              className={`text-accent inline-block relative ${nameText === fullName && cursorVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ top: '-2px' }}
            >|</span>
          </h2>
        </motion.div>
        
        {/* Social links */}
        <motion.div 
          className="flex space-x-6 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" 
            className="text-3xl text-neutral hover:text-accent transition-all duration-300">
            <FaGithub />
          </a>
          <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer"
            className="text-3xl text-neutral hover:text-accent transition-all duration-300">
            <FaSquareXTwitter />
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
            className="text-3xl text-neutral hover:text-accent transition-all duration-300">
            <FaLinkedin />
          </a>
          <a href={`mailto:${EMAIL}`}
            className="text-3xl text-neutral hover:text-accent transition-all duration-300">
            <FaEnvelope />
          </a>
        </motion.div>
        
        {/* Blog post list */}
        <motion.div 
          className="w-full max-w-5xl space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {blogPosts.map((post) => (
            <div key={post.slug} className="mb-6">
              <Link href={`/blog/${post.slug}`} className="block w-full">
                <div className="w-full p-6 border border-secondary bg-primary-600 rounded-lg hover:bg-secondary-200 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-medium mb-2 text-light">{post.title}</h3>
                      <p className="text-sm text-neutral">{post.excerpt}</p>
                    </div>
                    <time className="text-xs text-neutral-400 mt-3 md:mt-0 md:ml-4 md:text-right whitespace-nowrap">
                      {post.date}
                    </time>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}