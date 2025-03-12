// filepath: c:\Users\j7654\WorkStation\proact_backend\src\services\ai-analysis.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpError } from '@/helpers/HttpError';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn('GEMINI_API_KEY is not defined in the environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function to clean AI responses before parsing JSON
const cleanJsonResponse = (text: string): string => {
    // Remove any markdown code blocks (```json ... ```)
    text = text.replace(/```(json|)\s*([\s\S]*?)\s*```/g, '$2');

    // Remove any extra backticks
    text = text.replace(/`/g, '');

    // Trim whitespace
    text = text.trim();

    return text;
};

export interface AIAnalysisResult {
    severity: number; // 1-10 scale
    summary: string;
    isValidReport: boolean;
    tags: string[];
    containsInappropriateContent?: boolean;
    rejectionReason?: string;
}

export const analyzeCorruptionReport = async (
    description: string,
    hasAttachment: boolean
): Promise<AIAnalysisResult> => {
    try {
        // If no API key is set, return a default analysis
        if (!API_KEY) {
            console.warn(
                'Using default AI analysis because no API key is provided'
            );
            return {
                severity: 5,
                summary: 'AI analysis unavailable. This is a default summary.',
                isValidReport: true,
                tags: ['unanalyzed'],
            };
        }

        // First check for inappropriate content
        const moderationPrompt = `
        You are a content moderation system. Analyze the following text and determine if it contains any:
        1. Abusive or offensive language in any language
        2. References to pornography or sexually explicit content
        3. Illegal content or activities
        4. Hate speech or discriminatory content
        
        Text to analyze: "${description}"
        
        Respond only with a JSON object in this format:
        {
          "containsInappropriateContent": boolean,
          "rejectionReason": "string explaining what was found if inappropriate, otherwise empty"
        }
        `;

        const moderationResult = await model.generateContent(moderationPrompt);
        const moderationText = moderationResult.response.text();

        try {
            // Clean the moderation response before parsing
            const cleanModerationText = cleanJsonResponse(moderationText);
            console.log('Cleaned moderation response:', cleanModerationText);

            const moderationResponse = JSON.parse(cleanModerationText);

            if (moderationResponse.containsInappropriateContent) {
                return {
                    severity: 0,
                    summary: 'Report contains inappropriate content.',
                    isValidReport: false,
                    tags: ['content_violation'],
                    containsInappropriateContent: true,
                    rejectionReason:
                        moderationResponse.rejectionReason ||
                        'Contains inappropriate content',
                };
            }
        } catch (error) {
            console.error(
                'Failed to parse moderation response:',
                moderationText
            );
        }

        const prompt = `
        Analyze the following corruption report and provide:
        1. A severity score from 1-10 (where 10 is most severe)
        2. A brief summary of the allegation (max 100 words)
        3. Whether this appears to be a valid corruption report (true/false)
        4. Key tags related to the type of corruption (comma separated)
        
        The report ${hasAttachment ? 'includes supporting documents or images' : 'does not include supporting evidence'}.
        
        Report: "${description}"
        
        Format your response as a JSON object with the following fields:
        {
          "severity": number,
          "summary": "string",
          "isValidReport": boolean,
          "tags": ["tag1", "tag2"]
        }
        
        Only respond with the JSON, no other text.
        `;

        const result = await model.generateContent(prompt);
        const textResult = result.response.text();

        // Parse the response as JSON
        try {
            // Clean the AI analysis response before parsing
            const cleanTextResult = cleanJsonResponse(textResult);
            console.log('Cleaned AI analysis response:', cleanTextResult);
            // Cleaned moderation response: {
            //     "containsInappropriateContent": true,
            //     "rejectionReason": "The text contains abusive and offensive language.  The phrase translates roughly to 'son of a whore, damn project' and is highly insulting."
            //   }
            const jsonResponse = JSON.parse(cleanTextResult);
            return {
                severity: Math.min(10, Math.max(1, jsonResponse.severity || 5)), // Ensure score is between 1-10
                summary: jsonResponse.summary || 'No summary provided',
                isValidReport:
                    jsonResponse.isValidReport !== false &&
                    jsonResponse.containsInappropriateContent !== true,
                tags: Array.isArray(jsonResponse.tags) ? jsonResponse.tags : [],
                rejectionReason: jsonResponse?.rejectionReason,
            };
        } catch (error) {
            console.error('Failed to parse AI response:', textResult);
            return {
                severity: 5,
                summary:
                    'AI analysis failed to process the response correctly.',
                isValidReport: true,
                tags: ['analysis_error'],
            };
        }
    } catch (error) {
        console.error('AI analysis error:', error);
        // Return default values instead of throwing an error to make the flow more resilient
        return {
            severity: 5,
            summary: 'AI analysis encountered an error.',
            isValidReport: true,
            tags: ['analysis_error'],
        };
    }
};

// Add the missing function that is referenced in report.service.ts
export const analyzeReportWithAI = async (
    description: string,
    fileType: string,
    fileUrl: string
): Promise<AIAnalysisResult> => {
    // Simply use the existing function but adapt the parameters
    return analyzeCorruptionReport(description, fileType !== 'none');
};
