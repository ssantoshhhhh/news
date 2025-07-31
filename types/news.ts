export interface NewsArticle {
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  author: string | null
  content: string | null
  aiCategory: string
}

export interface NewsResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}
