"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink, Code, Zap } from "lucide-react"

export function Footer() {
  const techStack = [
    { name: "Next.js 15", color: "bg-black text-white" },
    { name: "React 19", color: "bg-blue-500 text-white" },
    { name: "TypeScript", color: "bg-blue-600 text-white" },
    { name: "Tailwind CSS", color: "bg-cyan-500 text-white" },
    { name: "Framer Motion", color: "bg-purple-500 text-white" },
    { name: "Zustand", color: "bg-orange-500 text-white" },
    { name: "Radix UI", color: "bg-gray-800 text-white" },
    { name: "Gemini AI", color: "bg-green-500 text-white" },
    { name: "Grok AI", color: "bg-red-500 text-white" },
  ]

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="mt-16 border-t border-gray-200 bg-white/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          {/* Tech Stack */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">Built with</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${tech.color} shadow-sm`}
                >
                  {tech.name}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Multi-Source RSS Feeds</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              <span>Gemini AI Summaries</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4 text-green-500" />
              <span>Grok AI Analysis</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <Github className="w-3 h-3" />
              <span>Source Code</span>
            </a>
            <span>•</span>
            <span>AI News Platform</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400">
            <p>© 2025 AI News Platform. Powered by Gemini AI, Grok AI, and Next.js.</p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
} 