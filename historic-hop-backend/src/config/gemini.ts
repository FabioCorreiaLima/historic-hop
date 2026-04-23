import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY não encontrada no .env. A geração falhará.");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "placeholder_para_evitar_crash_no_boot",
  });
};

export const AI_MODELS = {
  TEXT_GENERATION: 'gemini-2.5-flash',
} as const;
