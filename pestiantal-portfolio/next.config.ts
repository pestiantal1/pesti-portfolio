import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export', // Generates static HTML/CSS/JS for GitHub Pages
  images: {
    unoptimized: true, // For static export
  },
}

export default nextConfig