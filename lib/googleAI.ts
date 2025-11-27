import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

// Initialize Google AI
if (process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY);
}

export async function analyzeCallTranscript(transcript: string): Promise<{
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  objections: string[];
  score: number;
}> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this call transcript and provide:
1. A brief summary (2-3 sentences)
2. Overall sentiment (positive/neutral/negative)
3. List of objections raised (if any)
4. A score from 0-100 for call quality

Transcript:
${transcript}

Respond in JSON format:
{
  "summary": "...",
  "sentiment": "...",
  "objections": [...],
  "score": ...
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      summary: analysis.summary || '',
      sentiment: analysis.sentiment?.toLowerCase() || 'neutral',
      objections: analysis.objections || [],
      score: analysis.score || 0,
    };
  } catch (error) {
    console.error('Error analyzing transcript with Google AI:', error);
    throw error;
  }
}

export async function generateActivityInsights(metrics: {
  callsMade: number;
  callsAnswered: number;
  r1Meetings: number;
  dealsClose: number;
}): Promise<string> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on these sales metrics, provide 2-3 brief insights for improvement:
- Calls made: ${metrics.callsMade}
- Calls answered: ${metrics.callsAnswered}
- R1 meetings: ${metrics.r1Meetings}
- Deals closed: ${metrics.dealsClose}

Keep response concise and actionable.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}

export async function generateDealSummary(dealData: {
  companyName: string;
  industry: string;
  value: number;
  stage: string;
  notes: string;
}): Promise<string> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a professional deal summary for:
- Company: ${dealData.companyName}
- Industry: ${dealData.industry}
- Value: $${dealData.value}
- Stage: ${dealData.stage}
- Notes: ${dealData.notes}

Keep it concise (3-4 sentences) and professional.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating deal summary:', error);
    throw error;
  }
}

export { genAI };
