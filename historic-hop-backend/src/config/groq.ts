import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

export const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️ GROQ_API_KEY não encontrada no .env. A geração falhará.");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY || "placeholder_para_evitar_crash_no_boot",
  });
};

export const AI_MODELS = {
  TEXT_GENERATION: 'llama-3.1-8b-instant',
} as const;
