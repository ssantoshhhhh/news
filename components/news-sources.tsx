"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Newspaper, TrendingUp } from "lucide-react"

const newsSources = [
  { name: "News18", category: "Primary", color: "bg-blue-100 text-blue-800" },
  { name: "NDTV", category: "National", color: "bg-green-100 text-green-800" },
  { name: "Times of India", category: "National", color: "bg-orange-100 text-orange-800" },
  { name: "Hindustan Times", category: "National", color: "bg-purple-100 text-purple-800" },
  { name: "Economic Times", category: "Business", color: "bg-yellow-100 text-yellow-800" },
  { name: "BBC News", category: "International", color: "bg-red-100 text-red-800" },
  { name: "Reuters", category: "International", color: "bg-indigo-100 text-indigo-800" },
]

export function NewsSources() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">News Sources</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {newsSources.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Badge className={`${source.color} text-xs font-medium`}>
                  {source.name}
                </Badge>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Live RSS feeds from 30+ sources</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 