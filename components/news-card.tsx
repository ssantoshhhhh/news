"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, User, Clock } from "lucide-react"
import type { NewsArticle } from "@/types/news"
import { formatDistanceToNow } from "date-fns"

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      sports: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      science: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="h-full overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        {article.urlToImage && (
          <div className="relative overflow-hidden">
            <motion.img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className={`absolute top-3 left-3 ${getCategoryColor(article.aiCategory)} border-0`}>
              {article.aiCategory}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <motion.h3
            className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {article.title}
          </motion.h3>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-24">{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {article.description && (
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {article.description}
            </motion.p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="group/btn hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 bg-transparent"
              onClick={() => window.open(article.url, "_blank")}
            >
              Read More
              <ExternalLink className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
