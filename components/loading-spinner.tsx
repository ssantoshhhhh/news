"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="relative"
      >
        <Loader2 className="w-8 h-8 text-blue-500" />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute inset-0"
        >
          <Sparkles className="w-8 h-8 text-purple-500" />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading News</h3>
        <p className="text-sm text-gray-500">AI is categorizing articles...</p>
      </motion.div>

      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
