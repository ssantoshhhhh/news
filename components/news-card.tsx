"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, Eye, EyeOff, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: { name: string }
  content?: string
  aiCategory: string
  aiSummary?: string
}

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  const [showSummary, setShowSummary] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "Recent"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800",
      business: "bg-green-100 text-green-800",
      sports: "bg-orange-100 text-orange-800",
      entertainment: "bg-pink-100 text-pink-800",
      politics: "bg-purple-100 text-purple-800",
      health: "bg-red-100 text-red-800",
      science: "bg-cyan-100 text-cyan-800",
      education: "bg-indigo-100 text-indigo-800",
      lifestyle: "bg-yellow-100 text-yellow-800",
      auto: "bg-gray-100 text-gray-800",
      india: "bg-orange-100 text-orange-800",
      world: "bg-blue-100 text-blue-800",
      viral: "bg-red-100 text-red-800",
      explainers: "bg-green-100 text-green-800",
      general: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
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
    return icons[category as keyof typeof icons] || "📰"
  }

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(" ").length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  // Create URL-safe ID from title
  const createArticleId = (title: string) => {
    return encodeURIComponent(
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
  }

  // Get image URL with fallback
  const getImageUrl = () => {
    if (imageError || !article.urlToImage) {
      return "/placeholder.svg?height=400&width=600&text=News+Image"
    }
    return article.urlToImage
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <Link href={`/article/${createArticleId(article.title)}`}>
            <div className="relative w-full h-full">
              <Image
                src={getImageUrl() || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
          </Link>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getCategoryColor(article.aiCategory)} font-medium`}>
              {getCategoryIcon(article.aiCategory)}{" "}
              {article.aiCategory.charAt(0).toUpperCase() + article.aiCategory.slice(1)}
            </Badge>
          </div>

          {/* Source Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {article.source.name}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <Link href={`/article/${createArticleId(article.title)}`}>
            <h3 className="font-bold text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(article.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getReadingTime(article.description)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{article.description}</p>

          {/* AI Summary Section */}
          <AnimatePresence>
            {showSummary && article.aiSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100 mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">AI Summary</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{article.aiSummary}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col gap-3">
          {/* Summary Toggle Button */}
          {article.aiSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
              className="w-full flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
            >
              {showSummary ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSummary ? "Hide Smart Summary" : "Show Smart Summary"}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Link href={`/article/${createArticleId(article.title)}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                Read More
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.url, "_blank")}
              className="flex items-center gap-1 hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
