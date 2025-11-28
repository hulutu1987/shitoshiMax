import { GoogleGenAI, Type } from "@google/genai";
import { Sentiment } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

interface ContentAnalysis {
  sentiment: Sentiment;
  isSafe: boolean;
  qualityScore: number; // 0-100
  reasoning: string;
}

export const analyzeContent = async (text: string): Promise<ContentAnalysis> => {
  const ai = getAiClient();
  if (!ai) {
    // Fallback if no API key (dev mode mock)
    return {
      sentiment: Sentiment.NEUTRAL,
      isSafe: true,
      qualityScore: 50,
      reasoning: "API Key missing, default safe."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following social media post content for safety, sentiment, and quality.
      
      Content: "${text}"
      
      Rules:
      1. Identify if the content is Toxic, Spam, or Harmful (isSafe: false).
      2. Determine Sentiment (POSITIVE, NEUTRAL, NEGATIVE, TOXIC).
      3. Assign a Quality Score (0-100). 
         - High score (80-100): Constructive, helpful, insightful, original.
         - Mid score (40-79): Casual conversation, neutral updates.
         - Low score (0-39): Low effort, spammy, repetitive, complaining without substance.
         - Toxic/Hate speech gets 0.

      Return valid JSON matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: [Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE, Sentiment.TOXIC] },
            isSafe: { type: Type.BOOLEAN },
            qualityScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ["sentiment", "isSafe", "qualityScore", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as ContentAnalysis;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      sentiment: Sentiment.NEUTRAL,
      isSafe: true,
      qualityScore: 50,
      reasoning: "Error analyzing content."
    };
  }
};

// --- New AI Features ---

/**
 * Transcribe audio using gemini-2.5-flash
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Simulated Transcription: This is a test.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Audio } },
                    { text: "Transcribe the following audio accurately. Return only the transcription text." }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("Transcription failed", e);
        throw new Error("Failed to transcribe audio.");
    }
};

/**
 * Analyze/Describe image using gemini-3-pro-preview
 */
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Simulated Image Description: A beautiful scene.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: "Describe this image in detail for a social media post caption. Be creative but accurate." }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("Image analysis failed", e);
        throw new Error("Failed to analyze image.");
    }
};

/**
 * Maps Grounding using gemini-2.5-flash and googleMaps tool
 */
export const searchMap = async (query: string, locationContext?: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Simulated Map Result: New York City.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User Query: ${query}. Current Location Context: ${locationContext || 'Unknown'}. Provide a helpful summary including addresses or key details.`,
            config: {
                tools: [{ googleMaps: {} }],
            }
        });

        let text = response.text || "";
        
        // Extract Grounding Chunks to list URLs as required
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
            text += "\n\n📍 Sources:";
            groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    text += `\n🔗 [${chunk.web.title || 'Link'}](${chunk.web.uri})`;
                }
            });
        }

        return text;
    } catch (e) {
        console.error("Map search failed", e);
        throw new Error("Failed to search maps.");
    }
};