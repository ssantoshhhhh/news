"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
      <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          </motion.div>

          <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">{message}</p>

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
