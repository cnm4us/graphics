import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let geminiClient: GoogleGenerativeAI | null = null;

export const getGeminiClient = (): GoogleGenerativeAI | null => {
  if (!env.googleApiKey) {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.googleApiKey);
    // eslint-disable-next-line no-console
    console.log('[ai] GoogleGenerativeAI client initialized.');
  }

  return geminiClient;
};

export const logGeminiStatus = (): void => {
  if (env.googleApiKey) {
    // eslint-disable-next-line no-console
    console.log('[ai] GOOGLE_API_KEY present; Gemini features can be used.');
  } else {
    // eslint-disable-next-line no-console
    console.warn('[ai] GOOGLE_API_KEY missing; Gemini features are disabled.');
  }
};

