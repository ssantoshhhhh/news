"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, ExternalLink, Share2, User, Eye, EyeOff, Check } from "lucide-react"
import { useNewsStore } from "@/store/news-store"
import { NewsCard } from "@/components/news-card"
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
  author?: string | null
  fullContent?: string
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { articles } = useNewsStore()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id && articles.length > 0) {
      const decodedTitle = decodeURIComponent(params.id as string)

      // Find article by matching title (convert both to lowercase and remove special chars for comparison)
      const foundArticle = articles.find((a) => {
        const normalizedArticleTitle = a.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
        const normalizedSearchTitle = decodedTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        return (
          normalizedArticleTitle === normalizedSearchTitle ||
          normalizedArticleTitle.includes(normalizedSearchTitle) ||
          normalizedSearchTitle.includes(normalizedArticleTitle)
        )
      })

      if (foundArticle) {
        setArticle(foundArticle)

        // Find related articles from the same category
        const related = articles
          .filter((a) => a.aiCategory === foundArticle.aiCategory && a.title !== foundArticle.title)
          .slice(0, 6)

        setRelatedArticles(related)
      }
    }
  }, [params.id, articles])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Recent"
    }
  }

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(" ").length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
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

  const handleShare = async () => {
    const shareData = {
      title: article?.title,
      text: article?.description,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log("Error copying to clipboard:", error)
    }
  }

  const getImageUrl = () => {
    if (imageError || !article?.urlToImage) {
      return "/placeholder.svg?height=600&width=1200&text=News+Article"
    }
    return article.urlToImage
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 bg-transparent"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(article.url, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Original
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={getImageUrl() || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <Badge className={`${getCategoryColor(article.aiCategory)} font-medium text-base px-3 py-1`}>
                {getCategoryIcon(article.aiCategory)}{" "}
                {article.aiCategory.charAt(0).toUpperCase() + article.aiCategory.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Article Header */}
          <div className="p-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6"
            >
              {article.title}
            </motion.h1>

            {/* Meta Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 text-gray-600 mb-6"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{getReadingTime(article.fullContent || article.description)}</span>
              </div>

              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{article.author}</span>
                </div>
              )}

              <Badge variant="secondary" className="ml-auto">
                {article.source.name}
              </Badge>
            </motion.div>

            <Separator className="mb-6" />

            {/* AI Summary Section */}
            {article.aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowSummary(!showSummary)}
                  className="flex items-center gap-2 mb-4 hover:bg-blue-50 hover:border-blue-200"
                >
                  {showSummary ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSummary ? "Hide Smart Summary" : "Show Smart Summary"}
                </Button>

                <AnimatePresence>
                  {showSummary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-blue-700">AI Summary</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-lg">{article.aiSummary}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="prose prose-lg max-w-none"
            >
              <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">{article.description}</p>

              {article.fullContent && article.fullContent !== article.description && (
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {article.fullContent.split("\n").map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <p key={index} className="text-lg leading-relaxed">
                          {paragraph}
                        </p>
                      ),
                  )}
                </div>
              )}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Read the full article on News18</h3>
              <p className="text-gray-600 mb-4">
                Get the complete story with all details, quotes, and additional context.
              </p>
              <Button
                onClick={() => window.open(article.url, "_blank")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Article on News18
              </Button>
            </motion.div>
          </div>
        </motion.article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle, index) => (
                <motion.div
                  key={relatedArticle.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <NewsCard article={relatedArticle} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
