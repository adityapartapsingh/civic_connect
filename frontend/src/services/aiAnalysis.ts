import { IssueCategory } from '../types';
import { issuesApi } from './api';

export interface AIAnalysisResult {
  title: string;
  category: IssueCategory;
  description: string;
  confidence: number; // 0-1
}

/**
 * Analyze a captured civic issue photo using server-side Gemini Vision API.
 * All AI requests are handled securely via the backend — zero Gemini API keys needed on frontend.
 */
export async function analyzeIssueImage(
  dataUrl: string
): Promise<AIAnalysisResult | null> {
  if (!dataUrl) return null;

  try {
    return await issuesApi.analyzeImage(dataUrl);
  } catch (err) {
    console.warn('[AI Analysis] Backend image analysis failed:', err);
    return null;
  }
}
