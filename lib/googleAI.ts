import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

// Initialize Google AI
if (process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY);
}

export async function analyzeSalesInput(
  content: string | { inlineData: { data: string; mimeType: string } },
  channel: string
): Promise<{
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  objections: string[];
  score: number;
  suggestions: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  scoringBreakdown: Array<{ criteria: string; score: number; max: number; reason: string }>;
  keyPoints?: string[];
  actionItems?: string[];
  engagementAnalysis?: string;
  negotiationOpportunities?: string[];
}> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    // Use gemini-1.5-flash for multimodal support and speed
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let promptText = `Analyze this sales input from channel "${channel}".`;
    
    if (channel === 'R1' || channel === 'R2' || channel === 'R3' || channel === 'Cold Call') {
      // ${meeting_prompt}
      promptText += `
      Analyze this meeting/call recording/transcript.
      Focus on:
      - Extract key discussion points
      - Identify action items
      - Analyze participant engagement
      - Detect negotiation opportunities
      `;
    } else if (channel === 'Cold Email' || channel === 'Cold DM') {
      // ${prospecting_prompt}
      promptText += `
      Evaluate this prospecting content.
      Focus on:
      - Subject line/Hook effectiveness
      - Value proposition clarity
      - Call to action (CTA)
      - Personalization
      `;
    } else if (channel === 'Fireflies') {
      // ${meeting_prompt}
      promptText += `
      Analyze this Fireflies.ai meeting transcript/recording.
      Focus on:
      - Extract key discussion points
      - Identify action items
      - Analyze participant engagement
      - Detect negotiation opportunities
      `;
    }

    promptText += `
    Provide the following in JSON format:
    1. summary: Brief summary (2-3 sentences).
    2. sentiment: "positive", "neutral", or "negative".
    3. objections: List of objections identified (strings).
    4. score: Overall score 0-100.
    5. suggestions: List of actionable recommendations (objects with title, description, priority).
    6. scoringBreakdown: Breakdown of the score (objects with criteria, score, max, reason).
    7. keyPoints: List of extracted key discussion points.
    8. actionItems: List of identified action items.
    9. engagementAnalysis: Brief analysis of participant engagement.
    10. negotiationOpportunities: List of detected negotiation opportunities.

    JSON Schema:
    {
      "summary": "string",
      "sentiment": "string",
      "objections": ["string"],
      "score": number,
      "suggestions": [{"title": "string", "description": "string", "priority": "high|medium|low"}],
      "scoringBreakdown": [{"criteria": "string", "score": number, "max": number, "reason": "string"}],
      "keyPoints": ["string"],
      "actionItems": ["string"],
      "engagementAnalysis": "string",
      "negotiationOpportunities": ["string"]
    }
    `;

    const parts = [];
    if (typeof content === 'string') {
      parts.push(promptText + "\n\nContent:\n" + content);
    } else {
      parts.push(promptText);
      parts.push(content);
    }

    const result = await model.generateContent(parts);
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
      suggestions: analysis.suggestions || [],
      scoringBreakdown: analysis.scoringBreakdown || [],
      keyPoints: analysis.keyPoints || [],
      actionItems: analysis.actionItems || [],
      engagementAnalysis: analysis.engagementAnalysis || '',
      negotiationOpportunities: analysis.negotiationOpportunities || []
    };
  } catch (error) {
    console.error('Error analyzing input with Google AI:', error);
    throw error;
  }
}

export async function analyzeCallTranscript(transcript: string) {
   // Legacy wrapper for backward compatibility if needed, or just redirect
   const res = await analyzeSalesInput(transcript, 'R1');
   return {
     summary: res.summary,
     sentiment: res.sentiment,
     objections: res.objections,
     score: res.score
   };
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

export async function generateContentAdvisory(payload: {
  items: Array<{ id: string; title: string; type: string; minutes: number; priority: number }>
  assignments: Array<{ slotId: string; itemId: string; startISO: string }>
}): Promise<string> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const summary = `Items: ${payload.items.length}, Assignments: ${payload.assignments.length}`;
  const prompt = `You are an AI content strategist.
Given planned content items and scheduled slots, provide:
- Week/weekend distribution recommendations
- Platform peak-time alignment suggestions
- Balance of content types
- Resource/time allocation advice
- Performance predictions

Return concise bullet points.

${summary}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function scoreContentPerformance(aggregates: {
  totals: {
    videos: number; videosShort: number; videosLong: number; posts: number; postsSingle: number; postsCarousel: number; views: number; likes: number; comments: number; shares: number; saves: number; durationSec: number;
  }
  monthlyViews: Array<{ month: string; views: number }>
}) : Promise<{ score: number; tips: string[]; benchmarks?: { avgViewsPerVideo?: number } }> {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const t = aggregates.totals
  const avgViewsPerVideo = t.videos > 0 ? Math.round(t.views / t.videos) : 0
  const engagement = t.likes + t.comments + t.shares + t.saves
  const payload = {
    videos: t.videos,
    videosShort: t.videosShort,
    videosLong: t.videosLong,
    posts: t.posts,
    postsSingle: t.postsSingle,
    postsCarousel: t.postsCarousel,
    views: t.views,
    engagement,
    avgViewsPerVideo,
    monthlyViews: aggregates.monthlyViews,
  }
  const prompt = `Score content quality 0-100 and provide 5 concise improvement tips.
Consider short vs long video mix, post formats, monthly trends, and engagement.
Return JSON: { "score": number, "tips": ["string"], "benchmarks": { "avgViewsPerVideo": number } }

Data:\n${JSON.stringify(payload)}`
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return { score: 0, tips: ['Insufficient data for AI scoring.'], benchmarks: { avgViewsPerVideo } }
  const parsed = JSON.parse(m[0])
  return { score: parsed.score || 0, tips: parsed.tips || [], benchmarks: parsed.benchmarks || { avgViewsPerVideo } }
}

export { genAI };
