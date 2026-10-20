import { IssueCategory } from '../types';
import { CATEGORIES } from '../utils/constants';

export interface AIAnalysisResult {
  title: string;
  category: IssueCategory;
  description: string;
  confidence: number; // 0-1
}

const VALID_CATEGORIES: IssueCategory[] = CATEGORIES.map((c) => c.id);

const SYSTEM_PROMPT = `You are a municipal civic issue classifier for an Indian city. Analyze the photo and identify the civic infrastructure problem shown.

Return ONLY valid JSON (no markdown, no code fences) with these fields:
{
  "title": "A concise 5-12 word title describing the specific issue and location context visible in the image",
  "category": "one of: pothole, garbage, streetlight, water_leakage, drainage, traffic_signal, fallen_tree, sidewalk, other",
  "description": "A detailed 2-3 sentence description of the problem visible in the image. Mention severity, approximate size/extent, and potential hazard to citizens. Write as if filing a municipal complaint.",
  "confidence": 0.0 to 1.0
}

Category definitions:
- pothole: Road surface damage, craters, broken asphalt, potholes
- garbage: Waste piles, overflowing bins, illegal dumping, litter accumulation
- streetlight: Broken/dark/damaged street lights or poles
- water_leakage: Burst water pipes, water flooding from supply lines, leaking hydrants
- drainage: Clogged drains, sewage overflow, waterlogging, open manholes
- traffic_signal: Broken/non-functioning traffic lights or signals
- fallen_tree: Fallen trees, large broken branches blocking road/path
- sidewalk: Damaged footpath, broken curbs, missing tiles, cracked pavement
- other: Any other civic issue not in the above categories

Be specific and practical. Do NOT hallucinate details not visible in the image.`;

/**
 * Analyze a captured civic issue photo using Gemini Vision API.
 * Returns structured suggestions or null if analysis fails.
 */
export async function analyzeIssueImage(
  dataUrl: string
): Promise<AIAnalysisResult | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[AI Analysis] No Gemini API key configured. Skipping image analysis.');
    return null;
  }

  try {
    // Extract base64 data and mime type from data URL
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[AI Analysis] Gemini API error ${response.status}:`, errText);
      return null;
    }

    const data = await response.json();
    const textContent =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.warn('[AI Analysis] Empty response from Gemini.');
      return null;
    }

    // Parse the JSON response (strip any accidental markdown fences)
    const cleaned = textContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate and sanitize the category
    let category: IssueCategory = 'other';
    if (parsed.category && VALID_CATEGORIES.includes(parsed.category as IssueCategory)) {
      category = parsed.category as IssueCategory;
    }

    // Validate title and description
    const title =
      typeof parsed.title === 'string' && parsed.title.trim().length > 3
        ? parsed.title.trim()
        : '';
    const description =
      typeof parsed.description === 'string' && parsed.description.trim().length > 5
        ? parsed.description.trim()
        : '';
    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5;

    if (!title && !description) {
      console.warn('[AI Analysis] Parsed response has no usable title or description.');
      return null;
    }

    return { title, category, description, confidence };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('[AI Analysis] Request timed out after 15 seconds.');
    } else {
      console.error('[AI Analysis] Unexpected error:', err);
    }
    return null;
  }
}
