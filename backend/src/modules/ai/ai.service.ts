import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BudgetEstimate, GeneratedItinerary, PackingList } from '../../../shared/types';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { BudgetEstimateDto, ItineraryDto, PackingSuggestionDto } from './ai.dto';
import { fallbackBudget, fallbackItinerary, fallbackPacking } from './ai.fallback';

const stripMarkdownJson = (value: string): string =>
  value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

const parseJson = <T>(value: string): T => JSON.parse(stripMarkdownJson(value)) as T;

export class AiService {
  private async generateJson<T>(prompt: string): Promise<T> {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.startsWith('replace-with')) {
      throw new Error('Gemini API key is not configured');
    }

    const startedAt = Date.now();
    const model = new GoogleGenerativeAI(env.GEMINI_API_KEY).getGenerativeModel({
      model: 'gemini-1.5-flash'
    });
    const result = await model.generateContent(prompt);
    logger.info('Gemini request completed', { durationMs: Date.now() - startedAt });
    return parseJson<T>(result.response.text());
  }

  public async itinerary(dto: ItineraryDto): Promise<GeneratedItinerary> {
    const prompt = `Generate a travel itinerary as JSON only. Destination prompt: ${dto.prompt}.
Days: ${dto.days}. Budget style: ${dto.vibe}. Traveler type: ${dto.tripType}.
Return shape: {"stops":[{"city":"string","country":"string","days":1,"estimatedCostUsd":100,"activities":[{"name":"string","category":"sightseeing|food|adventure|cultural","costUsd":10,"durationHours":2}]}]}`;
    try {
      return await this.generateJson<GeneratedItinerary>(prompt);
    } catch (error) {
      logger.warn('Gemini itinerary fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackItinerary(dto);
    }
  }

  public async packing(dto: PackingSuggestionDto): Promise<PackingList[]> {
    const prompt = `Generate a travel packing list as JSON only for ${dto.destination}, ${dto.days} days, ${dto.tripType}, season ${dto.season ?? 'unknown'}.
Return shape: [{"category":"string","items":["string"]}]`;
    try {
      return await this.generateJson<PackingList[]>(prompt);
    } catch (error) {
      logger.warn('Gemini packing fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackPacking(dto);
    }
  }

  public async budget(dto: BudgetEstimateDto): Promise<BudgetEstimate> {
    const prompt = `Generate a per-day travel budget estimate as JSON only for ${dto.cityName}, vibe ${dto.vibe}.
Return shape: {"cityId":"${dto.cityId}","cityName":"${dto.cityName}","perDayUsd":100,"accommodationUsd":50,"foodUsd":25,"activitiesUsd":25}`;
    try {
      return await this.generateJson<BudgetEstimate>(prompt);
    } catch (error) {
      logger.warn('Gemini budget fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackBudget(dto);
    }
  }
}

export const aiService = new AiService();
