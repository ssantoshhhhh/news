"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NewsCard } from "@/components/news-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { useNewsStore } from "@/store/news-store"
import { Newspaper, Sparkles, TrendingUp, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const {
    articles,
    loading,
    error,
    selectedCategory,
    searchQuery,
    dataSource,
    fetchNews,
    setSelectedCategory,
    setSearchQuery,
    clearError,
  } = useNewsStore()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      console.log("Page: Initializing app...")
      await fetchNews()
      setIsInitialized(true)
      console.log("Page: App initialized")
    }
    initializeApp()
  }, [fetchNews])

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.aiCategory === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ["all", ...Array.from(new Set(articles.map((article) => article.aiCategory)))]

  const getDataSourceMessage = () => {
    switch (dataSource) {
      case "mock":
      case "mock-fallback":
        return "Demo mode: Showing sample articles. Configure NEWS_API_KEY for live data."
      case "newsapi-ai":
        return "Live news with AI categorization"
      case "newsapi-simple":
        return "Live news with keyword-based categorization"
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered News Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Stay Informed with
              <br />
              <span className="text-yellow-300">Smart News</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Get the latest news automatically categorized by AI for a personalized reading experience
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-6 text-sm text-blue-100"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                <span>Multiple Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Categorization</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
                y: Math.random() * 400,
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Data Source Info */}
        {getDataSourceMessage() && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-800">{getDataSourceMessage()}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInitialized ? 1 : 0, y: isInitialized ? 0 : 20 }}
          transition={{ delay: 1 }}
          className="mb-8 space-y-6"
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search news articles..." />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ErrorMessage
                message={error}
                onRetry={() => {
                  clearError()
                  fetchNews()
                }}
              />
            </motion.div>
          )}

          {!loading && !error && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredArticles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                  <p className="text-gray-500">Try adjusting your search or category filter</p>
                </motion.div>
              ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredArticles.map((article, index) => (
                      <motion.div
                        key={article.url}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <NewsCard article={article} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
