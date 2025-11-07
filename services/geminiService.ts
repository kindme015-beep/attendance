
import { GoogleGenAI } from "@google/genai";
import type { AttendanceRecord } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateAttendanceSummary = async (records: AttendanceRecord[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is not configured. Please set up your environment variables.";
    }
    
    if (records.length === 0) {
        return "No attendance data available to analyze.";
    }

    const prompt = `
        Analyze the following attendance data and provide a brief summary.
        Highlight any irregularities, such as users with flagged entries (over 20 hours), users who consistently work long hours, and any missing clock-out entries.
        The data is in JSON format. Do not just repeat the data; provide actionable insights.

        Data:
        ${JSON.stringify(records, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary with Gemini API:", error);
        return "An error occurred while generating the report. Please check the console for details.";
    }
};
