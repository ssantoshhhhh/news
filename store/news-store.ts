import { create } from "zustand"
import type { NewsArticle } from "@/types/news"

interface NewsStore {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  selectedCategory: string
  searchQuery: string
  dataSource: string
  fetchNews: () => Promise<void>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  loading: false,
  error: null,
  selectedCategory: "all",
  searchQuery: "",
  dataSource: "unknown",

  fetchNews: async () => {
    console.log("Store: Starting news fetch...")
    set({ loading: true, error: null })

    try {
      const response = await fetch("/api/news", {
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
      })

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error("Invalid response format: articles array missing")
      }

      set({
        articles: data.articles,
        loading: false,
        error: null,
        dataSource: data.source || "unknown",
      })

      console.log("Store: Successfully updated articles")
    } catch (error) {
      console.error("Store: Error fetching news:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch news"

      set({
        error: errorMessage,
        loading: false,
        articles: [], // Clear articles on error
      })
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
}))
