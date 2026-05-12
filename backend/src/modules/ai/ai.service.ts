import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BudgetEstimate, GeneratedItinerary, PackingList } from '../../../shared/types';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
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
const SYSTEM_PROMPT = `You are Traveloop's personalized travel strategist with real-world intelligence.
Always return valid JSON only. No markdown. No extra prose.
Prioritize practical routes, realistic travel costs in INR, season-aware suggestions, and local experiences over generic advice.`;

const toRad = (value: number): number => (value * Math.PI) / 180;
const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

export class AiService {
  private async generateJson<T>(systemPrompt: string, contextualMemory: string, userQuery: string): Promise<T> {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.startsWith('replace-with')) {
      throw new Error('Gemini API key is not configured');
    }

    const startedAt = Date.now();
    const model = new GoogleGenerativeAI(env.GEMINI_API_KEY).getGenerativeModel({
      model: env.GEMINI_MODEL
    });
    const result = await model.generateContent(
      `${systemPrompt}\n\nContextual memory:\n${contextualMemory}\n\nUser query:\n${userQuery}`
    );
    logger.info('Gemini request completed', { durationMs: Date.now() - startedAt });
    return parseJson<T>(result.response.text());
  }

  private async buildContextualMemory(userId: string, userContext?: ItineraryDto['userContext']): Promise<string> {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false, deletedAt: null },
      select: {
        travelerProfile: true,
        preferredBudgetMin: true,
        preferredBudgetMax: true,
        travelStyles: true,
        travelPreferences: true
      }
    });
    const recentTrips = await prisma.trip.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startDate: 'desc' },
      take: 3,
      select: { title: true, tripType: true, vibe: true, startDate: true }
    });

    const currentLocation = userContext?.currentLocation;
    let nearbyPlaces: string[] = [];
    if (currentLocation) {
      const cities = await prisma.city.findMany({
        take: 250,
        select: { name: true, country: true, latitude: true, longitude: true }
      });
      nearbyPlaces = cities
        .map((city) => ({
          name: `${city.name}, ${city.country}`,
          km: haversineKm(
            currentLocation.latitude,
            currentLocation.longitude,
            Number(city.latitude),
            Number(city.longitude)
          )
        }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 5)
        .map((item) => `${item.name} (${Math.round(item.km)} km)`);
    }

    return JSON.stringify(
      {
        profile: {
          travelerProfile: user?.travelerProfile,
          budgetMinInr: user?.preferredBudgetMin ? Number(user.preferredBudgetMin) : null,
          budgetMaxInr: user?.preferredBudgetMax ? Number(user.preferredBudgetMax) : null,
          travelStyles: Array.isArray(user?.travelStyles) ? user.travelStyles : []
        },
        preferences: {
          foodPreference: userContext?.foodPreference,
          climatePreference: userContext?.climatePreference,
          interests: userContext?.interests ?? [],
          groupSize: userContext?.groupSize
        },
        currentLocation: userContext?.currentLocation ?? null,
        nearbyRecommendations: nearbyPlaces,
        recentTrips: recentTrips.map((trip) => ({
          title: trip.title,
          tripType: trip.tripType,
          vibe: trip.vibe,
          startDate: trip.startDate.toISOString().slice(0, 10)
        })),
        persistedTravelPreferences: user?.travelPreferences ?? {}
      },
      null,
      2
    );
  }

  public async itinerary(userId: string, dto: ItineraryDto): Promise<GeneratedItinerary> {
    const contextualMemory = await this.buildContextualMemory(userId, dto.userContext);
    const userQuery = `Create a ${dto.days}-day itinerary for "${dto.prompt}".
Traveler type: ${dto.tripType}. Budget style: ${dto.vibe}.
Include realistic transportation suggestions, hidden gems, and season-aware planning.
If coordinates exist in context, include nearest practical airports and routes from the current location.
Return shape: {"stops":[{"city":"string","country":"string","days":1,"estimatedCostUsd":100,"activities":[{"name":"string","category":"sightseeing|food|adventure|cultural","costUsd":10,"durationHours":2}]}]}`;
    try {
      return await this.generateJson<GeneratedItinerary>(SYSTEM_PROMPT, contextualMemory, userQuery);
    } catch (error) {
      logger.warn('Gemini itinerary fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackItinerary(dto);
    }
  }

  public async packing(userId: string, dto: PackingSuggestionDto): Promise<PackingList[]> {
    const contextualMemory = await this.buildContextualMemory(userId, dto.userContext);
    const userQuery = `Generate a practical packing list for ${dto.destination} (${dto.days} days, ${dto.tripType}, season ${dto.season ?? 'unknown'}).
Include weather-aware and group-size-aware recommendations.
Return shape: [{"category":"string","items":["string"]}]`;
    try {
      return await this.generateJson<PackingList[]>(SYSTEM_PROMPT, contextualMemory, userQuery);
    } catch (error) {
      logger.warn('Gemini packing fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackPacking(dto);
    }
  }

  public async budget(userId: string, dto: BudgetEstimateDto): Promise<BudgetEstimate> {
    const contextualMemory = await this.buildContextualMemory(userId, dto.userContext);
    const userQuery = `Generate a realistic per-day Indian travel budget estimate for ${dto.cityName}.
Vibe: ${dto.vibe}. Traveler type: ${dto.tripType ?? 'unknown'}. Days: ${dto.days ?? 'unknown'}.
Use practical split across stay/food/transport/activities and seasonality.
Return shape: {"cityId":"${dto.cityId ?? 'context'}","cityName":"${dto.cityName}","currency":"INR","perDayInr":9000,"accommodationInr":4200,"foodInr":1800,"transportInr":1200,"activitiesInr":1800,"confidence":"ai","notes":["short reason"]}.`;
    try {
      const estimate = await this.generateJson<BudgetEstimate>(SYSTEM_PROMPT, contextualMemory, userQuery);
      return {
        ...estimate,
        currency: 'INR',
        perDayInr: Number(estimate.perDayInr),
        accommodationInr: Number(estimate.accommodationInr),
        foodInr: Number(estimate.foodInr),
        transportInr: Number(estimate.transportInr),
        activitiesInr: Number(estimate.activitiesInr),
        confidence: 'ai',
        notes: Array.isArray(estimate.notes) ? estimate.notes.slice(0, 4) : []
      };
    } catch (error) {
      logger.warn('Gemini budget fallback used', { error: error instanceof Error ? error.message : error });
      return fallbackBudget(dto);
    }
  }
}

export const aiService = new AiService();
