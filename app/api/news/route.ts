import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const categorizeSchema = z.object({
  categories: z.array(
    z.object({
      title: z.string(),
      category: z.enum(["technology", "business", "sports", "entertainment", "health", "science", "general"]),
    }),
  ),
})

// Enhanced mock data for better demo experience
const getMockArticles = () => [
  {
    title: "Revolutionary AI Technology Transforms Healthcare Diagnosis",
    description:
      "New artificial intelligence breakthrough promises to revolutionize medical diagnosis and treatment, reducing diagnostic time by 70%.",
    url: "https://example.com/ai-healthcare",
    urlToImage: "/placeholder.svg?height=200&width=400&text=AI+Healthcare",
    publishedAt: new Date().toISOString(),
    source: { id: "tech-news", name: "Tech News Daily" },
    author: "Dr. Sarah Johnson",
    content: "Revolutionary AI technology is transforming healthcare...",
    aiCategory: "technology",
  },
  {
    title: "Global Markets Show Strong Recovery Amid Economic Uncertainty",
    description:
      "Stock markets worldwide demonstrate resilience with tech stocks leading the charge in today's trading session.",
    url: "https://example.com/market-recovery",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Market+Recovery",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { id: "business-today", name: "Business Today" },
    author: "Michael Chen",
    content: "Global markets are showing unprecedented recovery...",
    aiCategory: "business",
  },
  {
    title: "Championship Finals Draw Record Viewership Worldwide",
    description:
      "Sports fans worldwide tune in for the most-watched championship game in history, breaking all previous records.",
    url: "https://example.com/championship-finals",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Championship+Finals",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { id: "sports-central", name: "Sports Central" },
    author: "Emma Rodriguez",
    content: "The championship finals have drawn record viewership...",
    aiCategory: "sports",
  },
  {
    title: "Hollywood Blockbuster Breaks Opening Weekend Records",
    description:
      "The latest superhero movie shatters box office records with stunning visual effects and compelling storyline.",
    url: "https://example.com/blockbuster-movie",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Hollywood+Blockbuster",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: { id: "entertainment-weekly", name: "Entertainment Weekly" },
    author: "Jessica Park",
    content: "The blockbuster movie has exceeded all expectations...",
    aiCategory: "entertainment",
  },
  {
    title: "Breakthrough Study Reveals New Treatment for Chronic Disease",
    description:
      "Medical researchers announce promising results from clinical trials for a revolutionary treatment approach.",
    url: "https://example.com/medical-breakthrough",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Medical+Breakthrough",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { id: "health-journal", name: "Health Journal" },
    author: "Dr. Robert Kim",
    content: "A breakthrough study has revealed new treatment options...",
    aiCategory: "health",
  },
  {
    title: "Scientists Discover New Exoplanet in Habitable Zone",
    description:
      "Astronomers using advanced telescopes have identified a potentially habitable exoplanet 100 light-years away.",
    url: "https://example.com/exoplanet-discovery",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Exoplanet+Discovery",
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    source: { id: "science-daily", name: "Science Daily" },
    author: "Dr. Maria Gonzalez",
    content: "The discovery of this exoplanet opens new possibilities...",
    aiCategory: "science",
  },
  {
    title: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
    description: "World leaders unite to establish ambitious targets for reducing global carbon emissions by 2030.",
    url: "https://example.com/climate-summit",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Climate+Summit",
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    source: { id: "global-news", name: "Global News Network" },
    author: "David Thompson",
    content: "The climate summit has achieved a historic agreement...",
    aiCategory: "general",
  },
  {
    title: "Tech Giant Announces Revolutionary Quantum Computing Chip",
    description:
      "Major technology company unveils breakthrough quantum processor that could revolutionize computing power.",
    url: "https://example.com/quantum-chip",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Quantum+Computing",
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
    source: { id: "tech-insider", name: "Tech Insider" },
    author: "Alex Chen",
    content: "The new quantum computing chip represents a major leap...",
    aiCategory: "technology",
  },
  {
    title: "Cryptocurrency Market Sees Massive Rally Following Regulatory News",
    description:
      "Digital currencies surge as governments announce clearer regulatory frameworks for blockchain technology.",
    url: "https://example.com/crypto-rally",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Crypto+Rally",
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    source: { id: "crypto-news", name: "Crypto News Today" },
    author: "Lisa Wang",
    content: "The cryptocurrency market is experiencing unprecedented growth...",
    aiCategory: "business",
  },
  {
    title: "Olympic Athletes Prepare for Upcoming Games with New Training Methods",
    description:
      "Elite athletes are using cutting-edge technology and innovative training techniques to prepare for competition.",
    url: "https://example.com/olympic-training",
    urlToImage: "/placeholder.svg?height=200&width=400&text=Olympic+Training",
    publishedAt: new Date(Date.now() - 32400000).toISOString(),
    source: { id: "olympic-news", name: "Olympic News" },
    author: "Carlos Martinez",
    content: "Olympic athletes are pushing the boundaries of human performance...",
    aiCategory: "sports",
  },
]

export async function GET() {
  console.log("API Route called - fetching news...")

  try {
    // Check if we have the required API keys
    if (!NEWS_API_KEY || NEWS_API_KEY === "demo-key") {
      console.log("Using mock data - NEWS_API_KEY not configured")
      return NextResponse.json({
        articles: getMockArticles(),
        totalResults: getMockArticles().length,
        source: "mock",
      })
    }

    // Try to fetch from NewsAPI
    console.log("Attempting to fetch from NewsAPI...")
    const newsResponse = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${NEWS_API_KEY}`,
      {
        next: { revalidate: 300 },
        headers: {
          "User-Agent": "AI-News-App/1.0",
        },
      },
    )

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text()
      console.error("NewsAPI Error:", newsResponse.status, errorText)
      throw new Error(`NewsAPI returned ${newsResponse.status}: ${errorText}`)
    }

    const newsData = await newsResponse.json()
    console.log("NewsAPI Response:", { status: newsData.status, totalResults: newsData.totalResults })

    if (!newsData.articles || newsData.articles.length === 0) {
      console.log("No articles returned from NewsAPI, using mock data")
      return NextResponse.json({
        articles: getMockArticles(),
        totalResults: getMockArticles().length,
        source: "mock",
      })
    }

    // Filter and prepare articles
    const validArticles = newsData.articles
      .filter(
        (article: any) =>
          article.title && article.title !== "[Removed]" && article.description && article.description !== "[Removed]",
      )
      .slice(0, 15)

    if (validArticles.length === 0) {
      console.log("No valid articles after filtering, using mock data")
      return NextResponse.json({
        articles: getMockArticles(),
        totalResults: getMockArticles().length,
        source: "mock",
      })
    }

    // Try AI categorization if OpenAI key is available
    if (OPENAI_API_KEY) {
      try {
        console.log("Attempting AI categorization...")
        const articlesForAI = validArticles.map((article: any) => ({
          title: article.title,
          description: article.description || "",
        }))

        const { object: categorizedData } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: categorizeSchema,
          prompt: `
            Categorize the following news articles into one of these categories: 
            technology, business, sports, entertainment, health, science, general.
            
            Consider the title and description to determine the most appropriate category.
            
            Articles to categorize:
            ${articlesForAI
              .map((article, index) => `${index + 1}. Title: "${article.title}"\nDescription: "${article.description}"`)
              .join("\n\n")}
          `,
        })

        // Combine articles with AI categories
        const categorizedArticles = validArticles.map((article: any, index: number) => ({
          ...article,
          aiCategory: categorizedData.categories[index]?.category || "general",
        }))

        console.log("Successfully categorized articles with AI")
        return NextResponse.json({
          articles: categorizedArticles,
          totalResults: categorizedArticles.length,
          source: "newsapi-ai",
        })
      } catch (aiError) {
        console.error("AI categorization failed:", aiError)
        // Fall back to simple categorization
        const categorizedArticles = validArticles.map((article: any) => ({
          ...article,
          aiCategory: simpleCategorizationFallback(article.title, article.description),
        }))

        return NextResponse.json({
          articles: categorizedArticles,
          totalResults: categorizedArticles.length,
          source: "newsapi-simple",
        })
      }
    } else {
      console.log("OpenAI API key not configured, using simple categorization")
      // Use simple keyword-based categorization
      const categorizedArticles = validArticles.map((article: any) => ({
        ...article,
        aiCategory: simpleCategorizationFallback(article.title, article.description),
      }))

      return NextResponse.json({
        articles: categorizedArticles,
        totalResults: categorizedArticles.length,
        source: "newsapi-simple",
      })
    }
  } catch (error) {
    console.error("Error in news API route:", error)

    // Always return mock data as fallback
    console.log("Returning mock data as fallback")
    return NextResponse.json({
      articles: getMockArticles(),
      totalResults: getMockArticles().length,
      source: "mock-fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Simple keyword-based categorization fallback
function simpleCategorizationFallback(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  const categories = {
    technology: [
      "tech",
      "ai",
      "artificial intelligence",
      "computer",
      "software",
      "digital",
      "internet",
      "app",
      "smartphone",
      "innovation",
    ],
    business: [
      "business",
      "economy",
      "market",
      "stock",
      "financial",
      "company",
      "corporate",
      "trade",
      "investment",
      "revenue",
    ],
    sports: [
      "sport",
      "game",
      "team",
      "player",
      "championship",
      "olympic",
      "football",
      "basketball",
      "soccer",
      "baseball",
    ],
    entertainment: [
      "movie",
      "film",
      "music",
      "celebrity",
      "hollywood",
      "entertainment",
      "actor",
      "actress",
      "concert",
      "show",
    ],
    health: [
      "health",
      "medical",
      "doctor",
      "hospital",
      "disease",
      "treatment",
      "medicine",
      "patient",
      "healthcare",
      "wellness",
    ],
    science: [
      "science",
      "research",
      "study",
      "discovery",
      "scientist",
      "experiment",
      "space",
      "climate",
      "environment",
      "biology",
    ],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }

  return "general"
}
