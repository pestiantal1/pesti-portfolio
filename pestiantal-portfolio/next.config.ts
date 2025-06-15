import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // Generates static HTML/CSS/JS for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/pesti-portfolio' : '', // Adjust to your repo name
  images: {
    unoptimized: true, // For static export
  },
}

export default nextConfig