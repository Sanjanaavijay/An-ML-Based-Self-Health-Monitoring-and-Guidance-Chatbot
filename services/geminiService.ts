import { GoogleGenAI, Chat } from "@google/genai";
import { IntentType, SentimentType, HealthMetrics } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// We use the 3-flash-preview model for high speed and good reasoning
const MODEL_NAME = 'gemini-3-flash-preview';

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are HealthGuardian, an ML-powered self-health monitoring assistant. 
Your goal is to help users track habits (sleep, diet, stress, activity) and analyze common symptoms.
IMPORTANT: You are NOT a doctor. Do NOT provide medical diagnoses.
If a user describes severe symptoms (chest pain, severe difficulty breathing, severe bleeding, thoughts of self-harm), STRICTLY recommend professional medical consultation immediately and provide generic emergency context.

Your responses should be:
1. Empathetic and supportive.
2. Concise (under 100 words unless detailed advice is asked).
3. Structured with bullet points if providing tips.

You also act as an ML Classifier. I will ask you to classify the user's intent and sentiment in the background.
`;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }
  
  try {
    const result = await chatSession!.sendMessage({
      message: message
    });
    return result.text || "I'm sorry, I couldn't process that. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my health database. Please check your connection.";
  }
};

/**
 * Generates a personalized 1-sentence tip based on current metrics.
 */
export const generatePersonalizedInsight = async (metrics: HealthMetrics, userName: string): Promise<string> => {
  try {
    const prompt = `
      User: ${userName}
      Current Health Metrics:
      - Sleep: ${metrics.sleepScore}/100
      - Stress: ${metrics.stressScore}/100 (Higher is worse)
      - Diet: ${metrics.dietScore}/100
      - Activity: ${metrics.activityScore}/100
      
      Task: Generate ONE concise, actionable, and encouraging health tip (max 20 words) based specifically on their lowest score. Do not mention the numbers, just the advice.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return result.text || "Drink more water and take a short walk today!";
  } catch (e) {
    console.error("Insight generation failed", e);
    return "Prioritize your sleep and hydration today for better energy.";
  }
};

/**
 * SIMULATED ML CLASSIFIER
 * In a real python backend, this would be Scikit-learn.
 * Here, we use a lightweight Gemini call to analyze the text and return JSON.
 */
export const analyzeIntentAndSentiment = async (text: string): Promise<{ intent: IntentType; sentiment: SentimentType; confidence: number; isEmergency: boolean }> => {
  try {
    const analysisPrompt = `
      Analyze the following user input for a health chatbot.
      Return ONLY a JSON object with no markdown formatting.
      Input: "${text}"
      
      Schema:
      {
        "intent": "Diet" | "Sleep" | "Stress" | "Activity" | "Symptom" | "General",
        "sentiment": "Positive" | "Neutral" | "Negative",
        "confidence": number (0.0 to 1.0),
        "isEmergency": boolean (true if input contains keywords like chest pain, suicide, heart attack, severe bleeding, difficulty breathing)
      }
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: analysisPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonStr = result.text || '{}';
    const data = JSON.parse(jsonStr);

    // Map string to Enum
    let intent = IntentType.GENERAL;
    switch (data.intent) {
      case 'Diet': intent = IntentType.DIET; break;
      case 'Sleep': intent = IntentType.SLEEP; break;
      case 'Stress': intent = IntentType.STRESS; break;
      case 'Activity': intent = IntentType.ACTIVITY; break;
      case 'Symptom': intent = IntentType.SYMPTOM; break;
      default: intent = IntentType.GENERAL;
    }

    let sentiment = SentimentType.NEUTRAL;
    switch (data.sentiment) {
      case 'Positive': sentiment = SentimentType.POSITIVE; break;
      case 'Negative': sentiment = SentimentType.NEGATIVE; break;
      default: sentiment = SentimentType.NEUTRAL;
    }

    return {
      intent,
      sentiment,
      confidence: data.confidence || 0.85,
      isEmergency: data.isEmergency || false
    };
  } catch (e) {
    console.warn("Classification failed, using fallback", e);
    return {
      intent: IntentType.GENERAL,
      sentiment: SentimentType.NEUTRAL,
      confidence: 0.0,
      isEmergency: false
    };
  }
};