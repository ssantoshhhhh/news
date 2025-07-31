export interface Article {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string
    name: string
  }
  content?: string
  aiCategory: string
  aiSummary?: string
  author?: string | null
  fullContent?: string
}

export interface NewsResponse {
  articles: Article[]
  dataSource: string
}
