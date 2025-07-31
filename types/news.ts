export interface Article {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  content?: string
  aiCategory: string
  aiSummary?: string
}

export interface NewsResponse {
  articles: Article[]
  dataSource: string
}
