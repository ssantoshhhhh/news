"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface LoadMoreButtonProps {
  onLoadMore: () => void
  loading: boolean
  hasMore: boolean
  totalArticles: number
  currentArticles: number
}

export function LoadMoreButton({ onLoadMore, loading, hasMore, totalArticles, currentArticles }: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">All Articles Loaded!</span>
          </div>
          <p className="text-gray-600 text-sm">
            You've reached the end! Showing {currentArticles} of {totalArticles} articles
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center py-8"
    >
      <div className="text-center space-y-4">
        <Button
          onClick={onLoadMore}
          disabled={loading}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 bg-white shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more articles...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Load More Articles
            </>
          )}
        </Button>
        
        <div className="text-sm text-gray-500">
          <p>Showing {currentArticles} of {totalArticles} articles</p>
          <p>Click to load the next batch</p>
        </div>
      </div>
    </motion.div>
  )
} 