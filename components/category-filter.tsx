"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const getCategoryIcon = (category: string) => {
    const icons = {
      all: "📰",
      technology: "💻",
      business: "💼",
      sports: "⚽",
      entertainment: "🎬",
      health: "🏥",
      science: "🔬",
      general: "📋",
    }
    return icons[category as keyof typeof icons] || "📄"
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category, index) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={`
              relative overflow-hidden transition-all duration-300 capitalize
              ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
              }
            `}
          >
            <span className="mr-2">{getCategoryIcon(category)}</span>
            {category}
            {selectedCategory === category && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
              />
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
