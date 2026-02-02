
import { GoogleGenAI, Type } from "@google/genai";
import { TimeEntry, MoneyEntry, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInsights = async (
  timeLogs: TimeEntry[],
  moneyLogs: MoneyEntry[]
): Promise<AIInsight> => {
  const timeSummary = timeLogs.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.hours;
    return acc;
  }, {});

  const moneySummary = moneyLogs.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const prompt = `
    You are the "Time Paisa Manager". 
    Analyze the following weekly logs for a user who wants to balance their life better.
    Be honest, slightly witty/firm (roast them if they spend too much time on Reels or money on Snacks), but ultimately helpful.
    
    Time Logs (Category: Total Hours): ${JSON.stringify(timeSummary)}
    Money Logs (Category: Total Amount): ${JSON.stringify(moneySummary)}
    
    Return the analysis as a JSON object matching the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roast: { type: Type.STRING, description: "A witty, honest critique of their habits." },
          summary: { type: Type.STRING, description: "A constructive summary of the week." },
          productivityScore: { type: Type.NUMBER, description: "Score out of 100." },
          financialScore: { type: Type.NUMBER, description: "Score out of 100." },
          nextWeekPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                focus: { type: Type.STRING },
                limit: { type: Type.STRING }
              },
              required: ["day", "focus", "limit"]
            }
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["roast", "summary", "productivityScore", "financialScore", "nextWeekPlan", "tips"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
