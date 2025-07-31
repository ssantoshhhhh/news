import { create } from "zustand"
import type { Article } from "@/types/news"

interface NewsStore {
  articles: Article[]
  loading: boolean
  error: string | null
  selectedCategory: string
  searchQuery: string
  dataSource: string
  currentPage: number
  hasMoreArticles: boolean
  fetchNews: (page?: number) => Promise<void>
  loadMoreArticles: () => Promise<void>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
  resetPagination: () => void
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  loading: false,
  error: null,
  selectedCategory: "all",
  searchQuery: "",
  dataSource: "unknown",
  currentPage: 1,
  hasMoreArticles: true,

  fetchNews: async (page = 1) => {
    console.log("Store: Starting news fetch for page:", page)
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/news?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Store: API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Store: Received data:", {
        articleCount: data.articles?.length,
        source: data.source,
        hasMore: data.hasMore,
      })

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error("Invalid response format: articles array missing")
      }

      set({
        articles: page === 1 ? data.articles : [...get().articles, ...data.articles],
        loading: false,
        error: null,
        dataSource: data.source || "unknown",
        currentPage: page,
        hasMoreArticles: data.hasMore || false,
      })

      console.log("Store: Successfully updated articles")
    } catch (error) {
      console.error("Store: Error fetching news:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch news"

      set({
        error: errorMessage,
        loading: false,
        articles: page === 1 ? [] : get().articles, // Keep existing articles on error for pagination
      })
    }
  },

  loadMoreArticles: async () => {
    const { currentPage, hasMoreArticles, loading } = get()
    if (loading || !hasMoreArticles) return

    const nextPage = currentPage + 1
    try {
      await get().fetchNews(nextPage)
    } catch (error) {
      console.error("Error loading more articles:", error)
      // Don't update state on error, let the user try again
    }
  },

  setSelectedCategory: (category: string) => {
    console.log("Store: Setting category to:", category)
    set({ selectedCategory: category })
  },

  setSearchQuery: (query: string) => {
    console.log("Store: Setting search query to:", query)
    set({ searchQuery: query })
  },

  clearError: () => {
    set({ error: null })
  },

  resetPagination: () => {
    set({ currentPage: 1, hasMoreArticles: true })
  },
}))
