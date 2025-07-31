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
        <p className="text-gray-500 text-sm">
          You've reached the end! Showing {currentArticles} of {totalArticles} articles
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center py-8"
    >
      <Button
        onClick={onLoadMore}
        disabled={loading}
        variant="outline"
        size="lg"
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
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
    </motion.div>
  )
} 