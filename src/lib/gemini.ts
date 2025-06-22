// Gemini API service for converting notes to flashcards
export interface GeminiFlashcard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GeminiResponse {
  flashcards: GeminiFlashcard[];
  total_tokens: number;
  cost_cents: number;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFlashcards(
    noteContent: string,
    count: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GeminiResponse> {
    const prompt = this.buildFlashcardPrompt(noteContent, count, difficulty);
    
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse the response to extract flashcards
      const flashcards = this.parseFlashcardResponse(generatedText);
      
      // Calculate approximate token usage and cost
      const totalTokens = this.estimateTokenUsage(prompt + generatedText);
      const costCents = this.calculateCost(totalTokens);

      return {
        flashcards,
        total_tokens: totalTokens,
        cost_cents: costCents
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private buildFlashcardPrompt(
    noteContent: string,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): string {
    return `You are an expert educator creating flashcards from study notes. 

Please create ${count} high-quality flashcards from the following note content. The flashcards should be at a ${difficulty} difficulty level.

Note Content:
${noteContent}

Instructions:
1. Create exactly ${count} flashcards
2. Each flashcard should have a clear question and comprehensive answer
3. Questions should test understanding, not just memorization
4. Answers should be detailed but concise
5. Format your response as a JSON array with this exact structure:
[
  {
    "question": "What is...?",
    "answer": "The answer is...",
    "difficulty": "easy|medium|hard"
  }
]

Please ensure the JSON is valid and properly formatted.`;
  }

  private parseFlashcardResponse(response: string): GeminiFlashcard[] {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const flashcards = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }

      return flashcards.map((card, index) => {
        if (!card.question || !card.answer) {
          throw new Error(`Invalid flashcard at index ${index}`);
        }
        
        return {
          question: card.question.trim(),
          answer: card.answer.trim(),
          difficulty: card.difficulty || 'medium'
        };
      });
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse flashcard response from Gemini API');
    }
  }

  private estimateTokenUsage(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokens: number): number {
    // Gemini Pro pricing: $0.00025 per 1K input tokens, $0.0005 per 1K output tokens
    // This is a simplified calculation
    const inputCost = (tokens * 0.00025) / 1000;
    const outputCost = (tokens * 0.0005) / 1000;
    return Math.round((inputCost + outputCost) * 100); // Convert to cents
  }

  // Helper method to validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message.'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          }
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Utility function to create Gemini service instance
export function createGeminiService(apiKey: string): GeminiService {
  return new GeminiService(apiKey);
} 