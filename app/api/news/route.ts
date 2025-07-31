import { NextResponse } from "next/server"

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyCsi75y6gbRqVuqoYUK9-tWAT2RNsVxr5U"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

// API validation flag
const USE_GEMINI_API = GEMINI_API_KEY && GEMINI_API_KEY.length > 20

// News18 RSS Feed URLs - Updated with working feeds
const NEWS_FEEDS = {
  india: "https://www.news18.com/commonfeeds/v1/eng/rss/india.xml",
  world: "https://www.news18.com/commonfeeds/v1/eng/rss/world.xml",
  politics: "https://www.news18.com/commonfeeds/v1/eng/rss/politics.xml",
  business: "https://www.news18.com/commonfeeds/v1/eng/rss/business.xml",
  technology: "https://www.news18.com/commonfeeds/v1/eng/rss/tech.xml",
  sports: "https://www.news18.com/commonfeeds/v1/eng/rss/sports.xml",
  cricket: "https://www.news18.com/commonfeeds/v1/eng/rss/cricket.xml",
  entertainment: "https://www.news18.com/commonfeeds/v1/eng/rss/entertainment.xml",
  movies: "https://www.news18.com/commonfeeds/v1/eng/rss/movies.xml",
  lifestyle: "https://www.news18.com/commonfeeds/v1/eng/rss/lifestyle-2.xml",
  health: "https://www.news18.com/commonfeeds/v1/eng/rss/health.xml",
  education: "https://www.news18.com/commonfeeds/v1/eng/rss/education-career.xml",
  auto: "https://www.news18.com/commonfeeds/v1/eng/rss/auto.xml",
  viral: "https://www.news18.com/commonfeeds/v1/eng/rss/viral.xml",
  explainers: "https://www.news18.com/commonfeeds/v1/eng/rss/explainers.xml",
  // Removed problematic feeds that might not exist or have different formats
}

// Category mapping for better organization
const CATEGORY_MAPPING = {
  india: "india",
  world: "world",
  politics: "politics",
  business: "business",
  technology: "technology",
  sports: "sports",
  cricket: "sports",
  entertainment: "entertainment",
  movies: "entertainment",
  lifestyle: "lifestyle",
  health: "health",
  education: "education",
  auto: "auto",
  viral: "viral",
  explainers: "explainers",
}

interface ParsedArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: { id: string; name: string }
  author: string | null
  content: string | null
  aiCategory: string
  aiSummary?: string
  fullContent?: string
}

// Enhanced XML validation with more flexible checks
function isValidXML(xmlContent: string): boolean {
  try {
    if (!xmlContent || typeof xmlContent !== "string" || xmlContent.trim().length === 0) {
      return false
    }

    const content = xmlContent.trim()

    // Check if it's HTML error page
    if (
      content.toLowerCase().includes("<!doctype html") ||
      content.toLowerCase().includes("<html") ||
      content.toLowerCase().includes("<head>") ||
      content.toLowerCase().includes("<body>")
    ) {
      console.log("Content appears to be HTML, not XML")
      return false
    }

    // Check for basic XML structure
    const hasXMLDeclaration = content.includes("<?xml") || content.includes("<rss") || content.includes("<feed")
    const hasOpeningTags = content.includes("<")
    const hasClosingTags = content.includes(">")

    // More flexible RSS/Atom detection
    const hasRSSStructure = content.includes("<rss") || content.includes("<channel") || content.includes("<feed")
    const hasItems = content.includes("<item") || content.includes("<entry")

    // Check for minimum XML requirements
    const isValidStructure = hasOpeningTags && hasClosingTags && (hasXMLDeclaration || hasRSSStructure)

    if (!isValidStructure) {
      console.log("Missing basic XML structure")
      return false
    }

    if (!hasItems) {
      console.log("No items/entries found in feed")
      return false
    }

    return true
  } catch (error) {
    console.error("XML validation error:", error)
    return false
  }
}

// More robust RSS parsing with better error handling
async function parseRSSFeed(xmlContent: string, category: string): Promise<ParsedArticle[]> {
  const articles: ParsedArticle[] = []

  try {
    // Clean and normalize XML content
    const cleanedXML = xmlContent
      .replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, "&amp;")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim()

    // Try multiple patterns to find items
    const itemPatterns = [
      /<item[^>]*>([\s\S]*?)<\/item>/gi,
      /<entry[^>]*>([\s\S]*?)<\/entry>/gi,
      /<item>([\s\S]*?)<\/item>/gi,
      /<entry>([\s\S]*?)<\/entry>/gi,
    ]

    let itemMatches: string[] = []

    for (const pattern of itemPatterns) {
      const matches = cleanedXML.match(pattern)
      if (matches && matches.length > 0) {
        itemMatches = matches
        console.log(`Found ${matches.length} items using pattern for ${category}`)
        break
      }
    }

    if (itemMatches.length === 0) {
      console.log(`No items found in RSS feed for ${category}`)
      return articles
    }

    // Process each item
    for (let i = 0; i < itemMatches.length; i++) {
      try {
        const itemXml = itemMatches[i]

        const title = extractXMLContent(itemXml, "title") || `Article ${i + 1}`
        const description =
          extractXMLContent(itemXml, "description") ||
          extractXMLContent(itemXml, "summary") ||
          extractXMLContent(itemXml, "content") ||
          extractXMLContent(itemXml, "content:encoded") ||
          ""

        const link =
          extractXMLContent(itemXml, "link") ||
          extractXMLContent(itemXml, "guid") ||
          extractLinkFromAtom(itemXml) ||
          `https://news18.com/${category}`

        const pubDate =
          extractXMLContent(itemXml, "pubDate") ||
          extractXMLContent(itemXml, "published") ||
          extractXMLContent(itemXml, "updated") ||
          new Date().toISOString()

        const author =
          extractXMLContent(itemXml, "author") ||
          extractXMLContent(itemXml, "dc:creator") ||
          extractXMLContent(itemXml, "creator") ||
          "News18"

        // Parse publication date
        let publishedDate = new Date().toISOString()
        if (pubDate) {
          const parsedDate = parseDate(pubDate)
          if (parsedDate) {
            publishedDate = parsedDate.toISOString()
          }
        }

        // Extract image with multiple fallback methods
        const imageUrl = extractImageFromContent(description, itemXml) || generatePlaceholderImage(category)

        // Clean and prepare content
        const cleanTitle = cleanText(title) || `${category} News Article`
        const cleanDescription = cleanText(description) || "Read more on News18"
        const cleanLink = link.trim()

        // Only add articles with valid title and link
        if (cleanTitle.length > 5 && cleanLink.length > 10) {
          articles.push({
            title: cleanTitle.substring(0, 200),
            description: cleanDescription.substring(0, 500),
            url: cleanLink,
            urlToImage: imageUrl,
            publishedAt: publishedDate,
            source: { id: category, name: "News18" },
            author: cleanText(author),
            content: cleanDescription,
            aiCategory: CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] || category,
            fullContent: cleanDescription,
          })
        }
      } catch (itemError) {
        console.error(`Error parsing item ${i} in ${category}:`, itemError)
        continue
      }
    }

    console.log(`Successfully parsed ${articles.length} articles from ${category}`)
  } catch (error) {
    console.error(`Error parsing RSS feed for ${category}:`, error)
  }

  return articles
}

// More robust XML content extraction
function extractXMLContent(xml: string, tag: string): string | null {
  try {
    // Try different patterns for the same tag
    const patterns = [
      new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"),
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
      new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"),
      new RegExp(`<${tag}[^>]*\\/>`, "i"),
    ]

    for (const pattern of patterns) {
      const match = xml.match(pattern)
      if (match) {
        if (match[1]) {
          return match[1].trim()
        }
        // For self-closing tags, try to extract from attributes
        if (tag === "link") {
          const hrefMatch = match[0].match(/href=["']([^"']+)["']/i)
          if (hrefMatch) return hrefMatch[1]
        }
      }
    }

    return null
  } catch (error) {
    console.error(`Error extracting ${tag} from XML:`, error)
    return null
  }
}

// Extract link from Atom feed format
function extractLinkFromAtom(xml: string): string | null {
  try {
    const patterns = [
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["'][^>]*>/i,
      /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*>/i,
    ]

    for (const pattern of patterns) {
      const match = xml.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  } catch (error) {
    return null
  }
}

// Enhanced image extraction with better fallbacks
function extractImageFromContent(description: string, itemXml: string): string | null {
  try {
    // Multiple image extraction patterns in order of preference
    const imagePatterns = [
      // RSS enclosure
      /<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["'][^>]*>/i,
      // Media namespace
      /<media:content[^>]+url=["']([^"']+)["'][^>]*>/i,
      /<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/i,
      // Standard img tags
      /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
      // Content encoded img
      /<content:encoded[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/content:encoded>/i,
      // Description img
      /<description[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/description>/i,
      // Any image URL in content
      /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|bmp)/gi,
    ]

    // Try each pattern
    for (const pattern of imagePatterns) {
      const match = itemXml.match(pattern)
      if (match && match[1]) {
        const imageUrl = match[1].trim()
        if (isValidImageUrl(imageUrl)) {
          return imageUrl
        }
      }
    }

    // Try extracting from description HTML
    if (description) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
      if (imgMatch && imgMatch[1] && isValidImageUrl(imgMatch[1])) {
        return imgMatch[1].trim()
      }
    }

    return null
  } catch (error) {
    console.error("Error extracting image:", error)
    return null
  }
}

// Validate image URL
function isValidImageUrl(url: string): boolean {
  try {
    if (!url || typeof url !== "string") return false

    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith("http")) return false

    // Check for valid image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i
    if (!imageExtensions.test(trimmedUrl)) return false

    // Avoid obviously invalid URLs
    if (trimmedUrl.includes("javascript:") || trimmedUrl.includes("data:")) return false

    return true
  } catch (error) {
    return false
  }
}

// Generate category-specific placeholder
function generatePlaceholderImage(category: string): string {
  const categoryImages = {
    technology: "/placeholder.svg?height=400&width=600&text=Technology+News",
    business: "/placeholder.svg?height=400&width=600&text=Business+News",
    sports: "/placeholder.svg?height=400&width=600&text=Sports+News",
    entertainment: "/placeholder.svg?height=400&width=600&text=Entertainment+News",
    politics: "/placeholder.svg?height=400&width=600&text=Politics+News",
    health: "/placeholder.svg?height=400&width=600&text=Health+News",
    education: "/placeholder.svg?height=400&width=600&text=Education+News",
    lifestyle: "/placeholder.svg?height=400&width=600&text=Lifestyle+News",
    auto: "/placeholder.svg?height=400&width=600&text=Auto+News",
    india: "/placeholder.svg?height=400&width=600&text=India+News",
    world: "/placeholder.svg?height=400&width=600&text=World+News",
    viral: "/placeholder.svg?height=400&width=600&text=Viral+News",
    explainers: "/placeholder.svg?height=400&width=600&text=Explainer",
  }

  return (
    categoryImages[category as keyof typeof categoryImages] || "/placeholder.svg?height=400&width=600&text=News+Article"
  )
}

// Improved date parsing with more formats
function parseDate(dateString: string): Date | null {
  try {
    if (!dateString || typeof dateString !== "string") {
      return null
    }

    const cleanDateString = dateString.trim()

    // Try direct parsing first
    let date = new Date(cleanDateString)
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
      return date
    }

    // Try various date format cleanups
    const dateFormats = [
      // Remove timezone abbreviations and normalize
      cleanDateString.replace(/\s+(IST|EST|PST|GMT|UTC|CST|MST|PDT|EDT|CDT|MDT)\s*$/i, ""),
      cleanDateString.replace(/\s+GMT[+-]\d{4}/, ""),
      cleanDateString.replace(/\s*$$[^)]+$$$/, ""),
      // RFC 2822 format cleanup
      cleanDateString
        .replace(/,\s+/, " ")
        .replace(/\s+/g, " "),
      // ISO format attempts
      cleanDateString
        .replace(/T/, " ")
        .replace(/Z$/, ""),
    ]

    for (const format of dateFormats) {
      try {
        date = new Date(format.trim())
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
          return date
        }
      } catch (formatError) {
        continue
      }
    }

    // Try manual parsing for common patterns
    const patterns = [
      /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
      /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/,
      /(\d{4})-(\d{2})-(\d{2})/,
    ]

    for (const pattern of patterns) {
      const match = cleanDateString.match(pattern)
      if (match) {
        try {
          if (pattern.source.includes("(d{4})-(d{2})-(d{2})")) {
            // YYYY-MM-DD format
            const year = Number.parseInt(match[1])
            const month = Number.parseInt(match[2]) - 1
            const day = Number.parseInt(match[3])
            const hour = match[4] ? Number.parseInt(match[4]) : 0
            const minute = match[5] ? Number.parseInt(match[5]) : 0
            const second = match[6] ? Number.parseInt(match[6]) : 0

            date = new Date(year, month, day, hour, minute, second)
            if (!isNaN(date.getTime())) {
              return date
            }
          }
        } catch (patternError) {
          continue
        }
      }
    }

    console.warn(`Could not parse date: ${dateString}`)
    return null
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error)
    return null
  }
}

// Clean HTML tags and decode entities more robustly
function cleanText(text: string | null): string | null {
  if (!text || typeof text !== "string") return null

  try {
    const cleaned = text
      // Remove HTML tags
      .replace(/<[^>]*>/g, " ")
      // Decode HTML entities
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (match, dec) => {
        try {
          return String.fromCharCode(Number.parseInt(dec))
        } catch {
          return match
        }
      })
      .replace(/&#x([a-fA-F0-9]+);/g, (match, hex) => {
        try {
          return String.fromCharCode(Number.parseInt(hex, 16))
        } catch {
          return match
        }
      })
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim()

    return cleaned.length > 0 ? cleaned : null
  } catch (error) {
    console.error("Error cleaning text:", error)
    return text ? text.substring(0, 200) + "..." : null
  }
}

// Test Gemini API connection
async function testGeminiConnection(): Promise<boolean> {
  if (!USE_GEMINI_API) {
    console.log("Gemini API: No valid API key provided, using smart text processing")
    return false
  }

  try {
    console.log("Testing Gemini API connection...")

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Test connection",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      }),
    })

    if (response.ok) {
      console.log("Gemini API: Connection successful")
      return true
    } else {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      console.log(`Gemini API: Authentication failed - ${errorData.error?.message || "Invalid credentials"}`)
      return false
    }
  } catch (error) {
    console.log("Gemini API: Connection test failed, using smart text processing")
    return false
  }
}

// Generate AI summary using Gemini API
async function generateAISummary(title: string, description: string): Promise<string> {
  if (!USE_GEMINI_API) {
    return generateSmartSummary(title, description)
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Please provide a clear, concise summary of this news article in 2-3 sentences that explain the key points in simple terms:

Title: ${title}
Content: ${description}

Summary:`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.3,
        },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim()
      }
    }

    return generateSmartSummary(title, description)
  } catch (error) {
    return generateSmartSummary(title, description)
  }
}

// Enhanced smart summary generation
function generateSmartSummary(title: string, description: string): string {
  try {
    console.log("Generating smart text-based summary...")

    if (!description || description.length < 50) {
      return `${title}. More details available in the full article.`
    }

    const fullText = `${title}. ${description}`.replace(/\s+/g, " ").trim()
    const sentences = fullText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && !s.match(/^(click|read|more|see|watch|follow)/i))

    if (sentences.length === 0) {
      return description.substring(0, 200) + "..."
    }

    let selectedSentences = sentences.slice(0, Math.min(3, sentences.length))

    if (selectedSentences[0] && selectedSentences[0].includes(title.substring(0, 20))) {
      selectedSentences = sentences.slice(0, Math.min(4, sentences.length))
    }

    const summary = selectedSentences
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(". ")
      .trim()

    const finalSummary = summary.endsWith(".") ? summary : summary + "."

    if (finalSummary.length > 400) {
      return finalSummary.substring(0, 397) + "..."
    }

    return finalSummary
  } catch (error) {
    console.error("Error generating smart summary:", error)
    return `${title}. ${description.substring(0, 150)}...`
  }
}

// Enhanced categorization based on keywords and feed source
function categorizeByKeywords(title: string, description: string, feedCategory: string): string {
  const specificCategories = [
    "technology",
    "business",
    "sports",
    "entertainment",
    "politics",
    "education",
    "auto",
    "lifestyle",
    "health",
  ]

  if (specificCategories.includes(feedCategory)) {
    return feedCategory
  }

  const text = `${title} ${description}`.toLowerCase()

  const categories = {
    technology: [
      "tech",
      "ai",
      "artificial intelligence",
      "computer",
      "software",
      "digital",
      "app",
      "smartphone",
      "innovation",
      "quantum",
      "blockchain",
      "crypto",
      "data",
      "internet",
      "cyber",
      "robot",
      "automation",
      "gadget",
      "device",
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
      "profit",
      "earnings",
      "banking",
      "finance",
      "economic",
      "industry",
      "startup",
      "ipo",
      "merger",
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
      "cricket",
      "tennis",
      "golf",
      "match",
      "tournament",
      "league",
      "score",
      "athlete",
      "coach",
      "stadium",
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
      "tv",
      "streaming",
      "bollywood",
      "cinema",
      "series",
      "album",
      "director",
      "producer",
    ],
    politics: [
      "government",
      "minister",
      "election",
      "political",
      "parliament",
      "policy",
      "law",
      "court",
      "justice",
      "vote",
      "democracy",
      "congress",
      "party",
      "campaign",
      "governance",
      "prime minister",
      "president",
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
      "virus",
      "vaccine",
      "therapy",
      "diagnosis",
      "surgery",
      "clinic",
      "pharmaceutical",
    ],
    education: [
      "education",
      "school",
      "university",
      "student",
      "teacher",
      "learning",
      "study",
      "exam",
      "academic",
      "college",
      "research",
      "scholarship",
      "curriculum",
      "degree",
      "admission",
      "campus",
    ],
    lifestyle: [
      "lifestyle",
      "fashion",
      "food",
      "travel",
      "culture",
      "art",
      "beauty",
      "wellness",
      "recipe",
      "style",
      "design",
      "home",
      "relationship",
      "fitness",
      "yoga",
      "meditation",
    ],
    auto: [
      "car",
      "vehicle",
      "automotive",
      "bike",
      "motorcycle",
      "transport",
      "driving",
      "fuel",
      "engine",
      "electric vehicle",
      "ev",
      "automobile",
      "traffic",
      "highway",
      "racing",
    ],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    const matchCount = keywords.filter((keyword) => text.includes(keyword)).length
    if (matchCount >= 1) {
      return category
    }
  }

  return feedCategory || "general"
}

// Enhanced RSS feed fetching with better error handling and timeout
async function fetchFromRSSFeed(category: string, url: string): Promise<ParsedArticle[]> {
  try {
    console.log(`Fetching ${category} from ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-News-App/1.0; +https://example.com)",
        Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${category}: ${response.statusText}`)
      return []
    }

    const xmlContent = await response.text()

    if (!xmlContent || xmlContent.trim().length === 0) {
      console.error(`Empty response for ${category}`)
      return []
    }

    console.log(`${category} feed preview (first 200 chars):`, xmlContent.substring(0, 200))

    if (!isValidXML(xmlContent)) {
      console.error(`Invalid XML format for ${category}`)
      console.log(`${category} content type:`, response.headers.get("content-type"))
      return []
    }

    const articles = await parseRSSFeed(xmlContent, category)
    console.log(`✓ Successfully parsed ${articles.length} articles from ${category}`)
    return articles
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(`Timeout fetching ${category}`)
      } else {
        console.error(`Error fetching ${category}: ${error.message}`)
      }
    } else {
      console.error(`Unknown error fetching ${category}:`, error)
    }
    return []
  }
}

// Enhanced mock data with summaries and full content
const getMockArticles = (): ParsedArticle[] => [
  {
    title: "Revolutionary AI Technology Transforms Healthcare Diagnosis",
    description:
      "New artificial intelligence breakthrough promises to revolutionize medical diagnosis and treatment, reducing diagnostic time by 70%. The technology uses advanced machine learning algorithms to analyze medical images and patient data.",
    url: "https://example.com/ai-healthcare",
    urlToImage: "/placeholder.svg?height=400&width=600&text=AI+Healthcare",
    publishedAt: new Date().toISOString(),
    source: { id: "tech-news", name: "News18" },
    author: "Dr. Sarah Johnson",
    content:
      "Revolutionary AI technology is transforming healthcare diagnosis and treatment. The new system uses advanced machine learning algorithms to analyze medical images and patient data, providing faster and more accurate diagnoses.",
    aiCategory: "technology",
    aiSummary:
      "Scientists have developed new AI technology that can diagnose medical conditions 70% faster than traditional methods. This breakthrough could help doctors treat patients more quickly and accurately. The technology is being tested in hospitals across the country.",
    fullContent:
      "Revolutionary AI technology is transforming healthcare diagnosis and treatment. The new system uses advanced machine learning algorithms to analyze medical images and patient data, providing faster and more accurate diagnoses. This breakthrough could significantly improve patient outcomes and reduce healthcare costs. The AI system has been trained on millions of medical cases and can identify patterns that human doctors might miss. Early trials show promising results with 95% accuracy in detecting various conditions. The technology is expected to be rolled out to major hospitals within the next two years, potentially saving thousands of lives through earlier detection and treatment.",
  },
  {
    title: "India Wins Cricket World Cup in Thrilling Final",
    description:
      "Team India defeats Australia in a nail-biting finish to claim the Cricket World Cup trophy after 12 years. The match went into the final over with both teams giving their best performance.",
    url: "https://example.com/cricket-world-cup",
    urlToImage: "/placeholder.svg?height=400&width=600&text=Cricket+World+Cup",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { id: "sports", name: "News18" },
    author: "Sports Reporter",
    content:
      "In a thrilling final match that kept fans on the edge of their seats, Team India defeated Australia to claim the Cricket World Cup trophy after 12 years.",
    aiCategory: "sports",
    aiSummary:
      "India won the Cricket World Cup by beating Australia in an exciting final match. This is India's first World Cup victory in 12 years. The team played exceptionally well and made the whole country proud.",
    fullContent:
      "In a thrilling final match that kept fans on the edge of their seats, Team India defeated Australia to claim the Cricket World Cup trophy after 12 years. The match showcased exceptional cricket from both teams, with India ultimately emerging victorious in a nail-biting finish. Captain Virat Kohli's brilliant century and the bowling attack's stellar performance in the final overs sealed the victory. The entire nation erupted in celebration as India lifted the coveted trophy. This victory marks a new chapter in Indian cricket history and establishes the team as a dominant force in world cricket.",
  },
  {
    title: "Stock Market Reaches All-Time High Amid Economic Recovery",
    description:
      "Indian stock markets surge to record levels as investors show confidence in economic growth prospects. The BSE Sensex crossed 75,000 points for the first time in history.",
    url: "https://example.com/stock-market",
    urlToImage: "/placeholder.svg?height=400&width=600&text=Stock+Market",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { id: "business", name: "News18" },
    author: "Financial Correspondent",
    content:
      "The Indian stock market has reached unprecedented heights with the BSE Sensex crossing 75,000 points for the first time in history.",
    aiCategory: "business",
    aiSummary:
      "Indian stock markets have reached their highest levels ever. Investors are confident about the country's economic growth. This shows that the economy is recovering well from previous challenges.",
    fullContent:
      "The Indian stock market has reached unprecedented heights with the BSE Sensex crossing 75,000 points for the first time in history. This surge reflects strong investor confidence in the country's economic recovery and growth prospects. Market analysts attribute this growth to strong corporate earnings, positive economic indicators, and increased foreign investment. The technology and banking sectors led the rally, with several companies hitting new highs. Experts believe this trend will continue as the economy shows signs of robust recovery and the government implements business-friendly policies.",
  },
]

export async function GET() {
  console.log("API Route called - fetching news from RSS feeds...")
  console.log("Gemini API Status:", USE_GEMINI_API ? "✓ Valid Key Provided" : "✗ No Valid Key - Using Smart Processing")

  try {
    let geminiWorking = false
    if (USE_GEMINI_API) {
      geminiWorking = await testGeminiConnection()
    }

    // Fetch from all available categories
    const allCategories = Object.keys(NEWS_FEEDS)
    const allArticles: ParsedArticle[] = []

    console.log(`Fetching from ${allCategories.length} categories...`)

    // Fetch categories with better error handling
    const fetchPromises = allCategories.map(async (category) => {
      try {
        const url = NEWS_FEEDS[category as keyof typeof NEWS_FEEDS]
        const articles = await fetchFromRSSFeed(category, url)
        return { category, articles, success: true }
      } catch (error) {
        console.error(`Failed to fetch ${category}:`, error)
        return { category, articles: [], success: false }
      }
    })

    const results = await Promise.allSettled(fetchPromises)
    let successfulFeeds = 0

    results.forEach((result, index) => {
      const category = allCategories[index]
      if (result.status === "fulfilled" && result.value.success) {
        allArticles.push(...result.value.articles)
        successfulFeeds++
        console.log(`✓ ${category}: ${result.value.articles.length} articles`)
      } else {
        console.log(`✗ ${category}: Failed to fetch`)
      }
    })

    console.log(`Successfully fetched from ${successfulFeeds}/${allCategories.length} feeds`)

    if (allArticles.length === 0) {
      console.log("No articles fetched from any feed, using mock data")
      return NextResponse.json({
        articles: getMockArticles(),
        totalResults: getMockArticles().length,
        source: "mock",
      })
    }

    console.log(`Total articles fetched: ${allArticles.length}`)

    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Take up to 150 articles for better performance
    const topArticles = allArticles.slice(0, 150)

    // Improve categorization using keywords and feed source
    const categorizedArticles = topArticles.map((article) => ({
      ...article,
      aiCategory: categorizeByKeywords(article.title, article.description || "", article.aiCategory),
    }))

    // Generate summaries for articles in batches
    console.log("Generating summaries...")
    const batchSize = 8
    const articlesWithSummaries: ParsedArticle[] = []

    for (let i = 0; i < categorizedArticles.length; i += batchSize) {
      const batch = categorizedArticles.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async (article, batchIndex) => {
          try {
            // Add small delay for rate limiting
            if (geminiWorking && batchIndex > 0) {
              await new Promise((resolve) => setTimeout(resolve, 300))
            }

            const summary = await generateAISummary(article.title, article.description || "")
            return { ...article, aiSummary: summary }
          } catch (error) {
            const fallbackSummary = generateSmartSummary(article.title, article.description || "")
            return { ...article, aiSummary: fallbackSummary }
          }
        }),
      )

      articlesWithSummaries.push(...batchResults)

      // Delay between batches to avoid rate limits
      if (geminiWorking && i + batchSize < categorizedArticles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
    }

    console.log(`Successfully processed ${articlesWithSummaries.length} articles with summaries`)

    const sourceType = geminiWorking && USE_GEMINI_API ? "news18-rss-gemini" : "news18-rss-smart"

    return NextResponse.json({
      articles: articlesWithSummaries,
      totalResults: articlesWithSummaries.length,
      source: sourceType,
      feedsSuccessful: successfulFeeds,
      feedsTotal: allCategories.length,
    })
  } catch (error) {
    console.error("Error in news API route:", error)

    console.log("Returning mock data as fallback")
    return NextResponse.json({
      articles: getMockArticles(),
      totalResults: getMockArticles().length,
      source: "mock-fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
