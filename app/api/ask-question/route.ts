import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = "AIzaSyCsi75y6gbRqVuqoYUK9-tWAT2RNsVxr5U";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { article, question } = await request.json();

    if (!article || typeof article !== 'string') {
      return NextResponse.json(
        { error: 'Article text is required' },
        { status: 400 }
      );
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          answer: "AI question answering is not available. Please add your Gemini API key to enable this feature."
        },
        { status: 200 }
      );
    }

    // Simple fallback function for when API is not available
    const generateSmartAnswer = (articleText: string, userQuestion: string) => {
      try {
        const cleanArticle = articleText.toLowerCase();
        const cleanQuestion = userQuestion.toLowerCase();
        
        // Extract key information from the article
        const sentences = articleText.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const words = cleanArticle.split(/\s+/);
        
        // Simple pattern matching
        if (cleanQuestion.includes('main topic') || cleanQuestion.includes('what') && cleanQuestion.includes('about')) {
          const topicWords = words.filter(word => word.length > 4).slice(0, 3);
          return `Based on the article content, the main topics discussed include: ${topicWords.join(', ')}. The article appears to focus on these key areas.`;
        }
        
        if (cleanQuestion.includes('how')) {
          return "The article describes various processes and mechanisms. To get specific details about how things work, you would need to refer to the full article content for technical explanations.";
        }
        
        if (cleanQuestion.includes('why')) {
          return "The article likely discusses the significance and importance of the topics covered. The relevance and impact of these subjects are key themes in the content.";
        }
        
        // Default answer based on content analysis
        const keyWords = words.filter(word => word.length > 4).slice(0, 5);
        return `Based on the article content, this appears to be about ${keyWords.join(', ')}. The article discusses various aspects of these topics. For a more detailed answer, please refer to the full article content.`;
      } catch (error) {
        console.error('Error in generateSmartAnswer:', error);
        return "Based on the article content, this appears to be about various topics and concepts. For a more detailed answer, please refer to the full article content.";
      }
    };

    // Create a prompt for answering questions about the article
    const prompt = `
Based on the following article, please answer the question below. Provide a clear, concise, and accurate answer based only on the information provided in the article.

Article: ${article}

Question: ${question}

Please provide a direct answer to the question based on the article content. If the article doesn't contain enough information to answer the question, please state that clearly.
`;

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
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      // Check if it's a quota exceeded error
      if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
        try {
          const smartAnswer = generateSmartAnswer(article, question);
          return NextResponse.json({
            answer: smartAnswer,
            note: "AI analysis unavailable due to quota limits - using basic text processing"
          });
        } catch (fallbackError) {
          console.error('Error in quota fallback:', fallbackError);
          return NextResponse.json({
            answer: "AI question answering is temporarily unavailable due to API quota limits. Please try again later.",
            note: "Error in fallback processing"
          });
        }
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const answer = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in ask-question API:', error);
    
    // Use smart fallback instead of generic error message
    try {
      const smartAnswer = generateSmartAnswer(article, question);
      return NextResponse.json(
        { 
          answer: smartAnswer,
          note: "AI analysis unavailable - using basic text processing"
        },
        { status: 200 }
      );
    } catch (fallbackError) {
      console.error('Error in fallback:', fallbackError);
      return NextResponse.json(
        { 
          answer: "AI question answering is temporarily unavailable. Please try again later.",
          note: "Error in fallback processing"
        },
        { status: 200 }
      );
    }
  }
} 