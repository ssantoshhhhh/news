# AI News Platform

A modern, AI-powered news aggregation platform built with Next.js 15, React 19, and Gemini AI. Get comprehensive news coverage from multiple sources with intelligent categorization and AI-powered summaries.

![AI News Platform](https://img.shields.io/badge/AI%20News%20Platform-v1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🗞️ **Multi-Source News Aggregation**
- **30+ RSS feeds** from major news sources
- **Real-time updates** with live RSS parsing
- **Comprehensive coverage** including News18, NDTV, Times of India, BBC, Reuters, and more
- **Automatic deduplication** to avoid duplicate articles

### 🤖 **AI-Powered Intelligence**
- **Gemini AI integration** for smart article summarization
- **Intelligent categorization** using keyword analysis
- **Smart summaries** that make complex stories easy to understand
- **Fallback processing** when AI is unavailable

### 🎨 **Modern User Experience**
- **Responsive design** that works on all devices
- **Smooth animations** with Framer Motion
- **Infinite scroll** with "Load More" functionality
- **Category filtering** and search capabilities
- **Beautiful UI** with Tailwind CSS and Radix UI

### 📱 **Advanced Features**
- **Pagination system** for efficient content loading
- **Image optimization** with Next.js Image component
- **Error handling** with graceful fallbacks
- **Loading states** and user feedback
- **SEO optimized** with proper meta tags

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15 | Full-stack React framework |
| **React** | 19 | UI library |
| **TypeScript** | 5.0 | Type safety |
| **Tailwind CSS** | 3.0 | Styling |
| **Framer Motion** | 10.0 | Animations |
| **Zustand** | 4.0 | State management |
| **Radix UI** | 1.0 | UI components |
| **Gemini AI** | Latest | AI summaries |

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google Gemini API key (optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment variables** (optional)
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### RSS Feeds
The application fetches news from multiple RSS feeds. You can modify the feeds in `app/api/news/route.ts`:

```typescript
const NEWS_FEEDS = {
  news18_india: "https://www.news18.com/commonfeeds/v1/eng/rss/india.xml",
  ndtv_top: "https://feeds.feedburner.com/ndtvnews-top-stories",
  // Add more feeds here
}
```

### AI Integration
To enable AI summaries, add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

## �� Project Structure

```
news/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── news/          # News API endpoint
│   ├── article/           # Article detail pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components (Radix)
│   ├── news-card.tsx     # News article card
│   ├── search-bar.tsx    # Search functionality
│   └── footer.tsx        # Footer component
├── store/                # State management
│   └── news-store.ts     # Zustand store
├── types/                # TypeScript types
│   └── news.ts           # News-related types
└── public/               # Static assets
```

## 🎯 Key Components

### News API (`app/api/news/route.ts`)
- **RSS feed parsing** with multiple fallback methods
- **Image extraction** and validation
- **AI integration** for summaries
- **Pagination support** for efficient loading

### News Store (`store/news-store.ts`)
- **Zustand state management** for articles and UI state
- **Pagination logic** for loading more articles
- **Error handling** and loading states

### News Card (`components/news-card.tsx`)
- **Responsive design** with hover effects
- **Image optimization** with fallbacks
- **AI summary toggle** functionality
- **Category badges** and source attribution

## 🔄 Data Flow

1. **RSS Fetching** → Parse multiple RSS feeds
2. **Deduplication** → Remove duplicate articles
3. **AI Processing** → Generate summaries (if API available)
4. **Categorization** → Smart category assignment
5. **Client Rendering** → Display with pagination

## 🎨 UI Features

### Responsive Design
- **Mobile-first** approach
- **Grid layouts** that adapt to screen size
- **Touch-friendly** interactions

### Animations
- **Smooth transitions** with Framer Motion
- **Loading states** with spinners
- **Hover effects** on cards

### Accessibility
- **Keyboard navigation** support
- **Screen reader** friendly
- **Proper ARIA labels**

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework
- **Vercel** for seamless deployment
- **Google Gemini** for AI capabilities
- **Radix UI** for accessible components
- **Tailwind CSS** for utility-first styling

## 📞 Support

If you have any questions or need help:
- Create an issue in this repository
- Check the documentation above
- Review the code comments for implementation details

---

**Built with ❤️ using Next.js, React, and Gemini AI**
