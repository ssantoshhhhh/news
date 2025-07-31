"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      all: "📰",
      technology: "💻",
      business: "💼",
      sports: "⚽",
      entertainment: "🎬",
      politics: "🏛️",
      health: "🏥",
      science: "🔬",
      education: "📚",
      lifestyle: "✨",
      auto: "🚗",
      india: "🇮🇳",
      world: "🌍",
      viral: "🔥",
      explainers: "📖",
      general: "📰",
    }
    return icons[category] || "📰"
  }

  const getCategoryColor = (category: string, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-600 text-white hover:bg-blue-700"
    }

    const colors: { [key: string]: string } = {
      all: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      technology: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      business: "bg-green-50 text-green-700 hover:bg-green-100",
      sports: "bg-orange-50 text-orange-700 hover:bg-orange-100",
      entertainment: "bg-pink-50 text-pink-700 hover:bg-pink-100",
      politics: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      health: "bg-red-50 text-red-700 hover:bg-red-100",
      science: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
      education: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      lifestyle: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      auto: "bg-gray-50 text-gray-700 hover:bg-gray-100",
      india: "bg-orange-50 text-orange-700 hover:bg-orange-100",
      world: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      viral: "bg-red-50 text-red-700 hover:bg-red-100",
      explainers: "bg-green-50 text-green-700 hover:bg-green-100",
      general: "bg-gray-50 text-gray-700 hover:bg-gray-100",
    }
    return colors[category] || "bg-gray-50 text-gray-700 hover:bg-gray-100"
  }

  const formatCategoryName = (category: string) => {
    if (category === "all") return "All News"
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-3 p-1">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={`${getCategoryColor(category, selectedCategory === category)} 
                  transition-all duration-200 whitespace-nowrap font-medium border-0 shadow-sm
                  hover:scale-105 active:scale-95`}
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {formatCategoryName(category)}
                {selectedCategory === category && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    Active
                  </Badge>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  )
}
