import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = "AIzaSyCsi75y6gbRqVuqoYUK9-tWAT2RNsVxr5U";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { article } = await request.json();

    if (!article || typeof article !== 'string') {
      return NextResponse.json(
        { error: 'Article text is required' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          summary: "AI summarization is not available. Please add your Gemini API key to enable this feature.",
          keyPoints: ["Feature requires API key configuration"],
          questions: ["What is the main topic of this article?"]
        },
        { status: 200 }
      );
    }

    // Simple text-based fallback for when API is not available
    const generateBasicSummary = (text: string) => {
      // Clean and process the text
      const cleanText = text.replace(/\s+/g, ' ').trim();
      const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      // Generate a meaningful summary
      let summary = '';
      if (sentences.length > 0) {
        summary = sentences.slice(0, Math.min(2, sentences.length)).join('. ') + '.';
      } else {
        summary = cleanText.substring(0, 150) + '...';
      }
      
      // Extract key topics and themes
      const words = cleanText.toLowerCase().split(/\s+/);
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my'];
      const meaningfulWords = words.filter(word => 
        word.length > 3 && 
        !stopWords.includes(word) && 
        !word.match(/^\d+$/) &&
        !word.match(/^[^\w]+$/)
      );
      
      // Get most common meaningful words
      const wordCount: { [key: string]: number } = {};
      meaningfulWords.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      // Generate key points based on content
      const keyPoints = topWords.length > 0 
        ? topWords.map(word => `Discusses ${word} and related concepts`)
        : ["Contains various topics and themes", "Addresses multiple subjects", "Presents complex information"];
      
      // Generate relevant questions
      const questions = [
        "What is the main topic or theme of this content?",
        "What are the key concepts or ideas presented?",
        "What conclusions or insights can be drawn from this information?",
        "How does this content relate to current trends or developments?",
        "What implications does this information have for readers?"
      ];
      
      return {
        summary: summary.length > 300 ? summary.substring(0, 297) + '...' : summary,
        keyPoints,
        questions
      };
    };

    // Create a comprehensive prompt for summarization
    const prompt = `Please analyze this article and provide:

1. A concise 2-3 sentence summary
2. 3-5 key points as bullet points
3. 3-5 relevant questions that could be asked about this content

Article: ${article}

Please format your response as:
Summary: [your summary here]

Key Points:
- [point 1]
- [point 2]
- [point 3]

Questions:
- [question 1]
- [question 2]
- [question 3]`;

    console.log('Making Gemini API call...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3,
        },
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      // Check if it's a quota exceeded error
      if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
        // Use the fallback summary function instead of just returning a message
        const fallback = generateBasicSummary(article);
        return NextResponse.json({
          ...fallback,
          note: "AI analysis unavailable due to quota limits - using basic text processing"
        });
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI Response:', aiResponse);

    // Parse the text response from AI
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let summary = '';
    let keyPoints: string[] = [];
    let questions: string[] = [];

    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.toLowerCase().includes('summary:')) {
        currentSection = 'summary';
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('key point') || trimmedLine.toLowerCase().includes('key points')) {
        currentSection = 'keyPoints';
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('question') || trimmedLine.toLowerCase().includes('questions')) {
        currentSection = 'questions';
        continue;
      }

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const point = trimmedLine.replace(/^[-•*]\s*/, '').trim();
        if (point) {
          if (currentSection === 'keyPoints') {
            keyPoints.push(point);
          } else if (currentSection === 'questions') {
            questions.push(point);
          }
        }
      } else if (trimmedLine && currentSection === 'summary') {
        summary += (summary ? ' ' : '') + trimmedLine;
      }
    }

    // Fallback if parsing didn't work well
    if (!summary) {
      summary = aiResponse.substring(0, 200) + '...';
    }

    if (keyPoints.length === 0) {
      keyPoints = [
        "Key points could not be extracted automatically",
        "Please review the article for main topics",
        "Consider the article's main arguments and conclusions"
      ];
    }

    if (questions.length === 0) {
      questions = [
        "What is the main topic of this article?",
        "What are the key arguments presented?",
        "What conclusions can be drawn from this content?"
      ];
    }

    return NextResponse.json({
      summary,
      keyPoints,
      questions
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    
    // Use the fallback summary instead of returning an error
    const fallback = generateBasicSummary(article);
    
    return NextResponse.json({
      ...fallback,
      note: "AI analysis unavailable - using basic text processing"
    });
  }
} 