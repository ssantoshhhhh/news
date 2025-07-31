"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NewsCard } from "@/components/news-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { NewsSources } from "@/components/news-sources"
import { LoadMoreButton } from "@/components/load-more-button"
import { useNewsStore } from "@/store/news-store"
import { Newspaper, TrendingUp, Info, Rss, Bot, Brain } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const {
    articles,
    loading,
    error,
    selectedCategory,
    searchQuery,
    dataSource,
    currentPage,
    hasMoreArticles,
    fetchNews,
    loadMoreArticles,
    setSelectedCategory,
    setSearchQuery,
    clearError,
  } = useNewsStore()

  // Show new articles indicator when page changes
  useEffect(() => {
    if (currentPage > 1) {
      setShowNewArticlesIndicator(true)
      // Hide indicator after 5 seconds
      const timer = setTimeout(() => setShowNewArticlesIndicator(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [currentPage])

  const [isInitialized, setIsInitialized] = useState(false)
  const [showNewArticlesIndicator, setShowNewArticlesIndicator] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      console.log("Page: Initializing app...")
      try {
        await fetchNews()
        setIsInitialized(true)
        console.log("Page: App initialized")
      } catch (error) {
        console.error("Page: Failed to initialize app:", error)
        // Still set as initialized to show the UI
        setIsInitialized(true)
      }
    }
    initializeApp()
  }, [fetchNews])

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.aiCategory === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ["all", ...Array.from(new Set(articles.map((article) => article.aiCategory)))]

  const getDataSourceMessage = () => {
    switch (dataSource) {
      case "mock":
      case "mock-fallback":
        return "Demo mode: Showing sample articles from multiple sources with smart summaries."
      case "news18-rss-gemini":
        return "Live multi-source feeds (News18, NDTV, TOI, BBC, Reuters) with Gemini AI summaries and smart categorization"
      case "news18-rss-smart":
        return "Live multi-source feeds with intelligent text-based summaries (Gemini API not available)"
      case "newsapi-simple":
        return "Live news with keyword-based categorization"
      default:
        return null
    }
  }

  const getDataSourceIcon = () => {
    switch (dataSource) {
      case "news18-rss-gemini":
        return <Bot className="h-4 w-4" />
      case "news18-rss-smart":
        return <Brain className="h-4 w-4" />
      case "newsapi-simple":
        return <Rss className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertColor = () => {
    switch (dataSource) {
      case "news18-rss-gemini":
        return "bg-purple-50 border-purple-200"
      case "news18-rss-smart":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTextColor = () => {
    switch (dataSource) {
      case "news18-rss-gemini":
        return "text-purple-800"
      case "news18-rss-smart":
        return "text-blue-800"
      default:
        return "text-gray-800"
    }
  }

  const articlesWithSummaries = articles.filter((article) => article.aiSummary).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white"
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
              <Bot className="w-5 h-5" />
              <span className="text-sm font-medium">Multi-Source News + Gemini AI Platform</span>
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
              Get comprehensive news from multiple sources including News18, NDTV, Times of India, BBC, Reuters and more with Gemini AI-powered summaries that make complex stories simple to understand
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-6 text-sm text-blue-100"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Live RSS Feeds</span>
              </div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                <span>Multiple Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>Gemini AI</span>
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
                x: (i * 60) % 1200,
                y: (i * 20) % 400,
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Number.POSITIVE_INFINITY,
                delay: (i * 0.1) % 2,
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
            <Alert className={getAlertColor()}>
              {getDataSourceIcon()}
              <AlertDescription className={getTextColor()}>
                {getDataSourceMessage()}
                {articlesWithSummaries > 0 && (
                  <span className="ml-2 font-medium">• {articlesWithSummaries} articles with summaries</span>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* News Sources */}
        <NewsSources />

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInitialized ? 1 : 0, y: isInitialized ? 0 : 20 }}
          transition={{ delay: 1 }}
          className="mb-8 space-y-6"
        >
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search news articles and summaries..."
          />

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
                <motion.div layout className="space-y-6">
                  {/* New Articles Indicator */}
                  {showNewArticlesIndicator && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-center py-4"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="font-medium">New Articles Loaded!</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredArticles.map((article, index) => (
                        <motion.div
                          key={`${article.url}-${index}`}
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {!loading && !error && filteredArticles.length > 0 && (
          <LoadMoreButton
            onLoadMore={loadMoreArticles}
            loading={loading}
            hasMore={hasMoreArticles}
            totalArticles={articles.length}
            currentArticles={filteredArticles.length}
          />
        )}

        {/* Enhanced Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-semibold text-gray-700">News Analytics Dashboard</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Article Statistics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Total Articles</span>
                      </div>
                      <span className="text-lg font-bold text-blue-900">{articles.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Filtered Articles</span>
                      </div>
                      <span className="text-lg font-bold text-green-900">{filteredArticles.length}</span>
                    </div>
                  </div>

                  {/* Pagination Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-purple-700">Current Page</span>
                      </div>
                      <span className="text-lg font-bold text-purple-900">{currentPage}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-orange-700">More Articles</span>
                      </div>
                      <span className="text-lg font-bold text-orange-900">{hasMoreArticles ? 'Available' : 'None'}</span>
                    </div>
                  </div>

                  {/* Data Source Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium text-indigo-700">Data Source</span>
                      </div>
                      <span className="text-sm font-medium text-indigo-900 bg-indigo-100 px-2 py-1 rounded">
                        {dataSource}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                        <span className="text-sm font-medium text-teal-700">Articles with AI</span>
                      </div>
                      <span className="text-lg font-bold text-teal-900">
                        {articles.filter(article => article.aiSummary).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Article Coverage</span>
                    <span>{Math.round((filteredArticles.length / Math.max(articles.length, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(filteredArticles.length / Math.max(articles.length, 1)) * 100}%` }}
                      transition={{ duration: 0.8, delay: 1 }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{articles.length}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{filteredArticles.length}</div>
                    <div className="text-xs text-gray-600">Showing</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{currentPage}</div>
                    <div className="text-xs text-gray-600">Page</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{hasMoreArticles ? '∞' : '0'}</div>
                    <div className="text-xs text-gray-600">More</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
