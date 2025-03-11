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

export interface AIAnalysisResult {
    severity: number; // 1-10 scale
    summary: string;
    isValidReport: boolean;
    tags: string[];
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
            const jsonResponse = JSON.parse(textResult);
            return {
                severity: Math.min(10, Math.max(1, jsonResponse.severity || 5)), // Ensure score is between 1-10
                summary: jsonResponse.summary || 'No summary provided',
                isValidReport: jsonResponse.isValidReport !== false, // Default to true if not specified
                tags: Array.isArray(jsonResponse.tags) ? jsonResponse.tags : [],
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
