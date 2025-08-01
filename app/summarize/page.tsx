'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  questions: string[];
}

export default function SummarizePage() {
  const [articleText, setArticleText] = useState('');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);

  const handleSummarize = async () => {
    if (!articleText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article: articleText }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize article');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error summarizing article:', error);
      alert('Failed to summarize article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !articleText.trim()) return;

    setAskingQuestion(true);
    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          article: articleText, 
          question: question 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get answer. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <img
                  src="/ai-news.png"
                  alt="AI News Platform Logo"
                  className="h-12 w-auto object-contain"
                />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900">AI News Platform</h1>
                <p className="text-xs text-gray-600">Smart News with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span className="text-blue-600 font-medium">Summarize</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Grok AI Article Summarizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste any article and get a Grok AI-powered summary with key points and suggested questions.
            You can also ask specific questions about the content.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Paste Your Article
                </CardTitle>
                <CardDescription>
                  Copy and paste any news article, blog post, or text content below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your article here..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                
                <Button 
                  onClick={handleSummarize}
                  disabled={loading || !articleText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Summary Results */}
            {summary && (
              <Card>
                <CardHeader>
                                  <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Grok AI Summary
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Points</h4>
                    <div className="space-y-2">
                      {summary.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start">
                          <Badge variant="secondary" className="mr-2 mt-1">
                            {index + 1}
                          </Badge>
                          <p className="text-gray-700">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Questions</h4>
                    <div className="space-y-2">
                      {summary.questions.map((q, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="mr-2 mb-2 cursor-pointer hover:bg-blue-50"
                          onClick={() => setQuestion(q)}
                        >
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Section */}
            {articleText.trim() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Ask Questions
                  </CardTitle>
                  <CardDescription>
                    Ask specific questions about the article content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Ask a question about the article..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <Button 
                    onClick={handleAskQuestion}
                    disabled={askingQuestion || !question.trim()}
                    className="w-full"
                  >
                    {askingQuestion ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Answer...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask Question
                      </>
                    )}
                  </Button>
                  
                  {answer && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Answer</h4>
                      <p className="text-gray-700">{answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 