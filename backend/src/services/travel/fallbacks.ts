export const FALLBACK_DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80'
] as const;

export const hashSeed = (value: string): number =>
  Math.abs(value.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0));

export const fallbackGallery = (seed: string): string[] => {
  const start = hashSeed(seed.toLowerCase()) % FALLBACK_DESTINATION_IMAGES.length;
  return FALLBACK_DESTINATION_IMAGES.map((_, index) => FALLBACK_DESTINATION_IMAGES[(start + index) % FALLBACK_DESTINATION_IMAGES.length] ?? '');
};

export const fallbackBudget = (costIndex?: string | null) => {
  if (costIndex === 'high') return { budget: 14000, comfort: 26000, luxury: 52000, currency: 'INR' };
  if (costIndex === 'low') return { budget: 4500, comfort: 9500, luxury: 22000, currency: 'INR' };
  return { budget: 8000, comfort: 16000, luxury: 36000, currency: 'INR' };
};

export const fallbackWeather = (bestSeason?: string | null) => {
  const season = bestSeason?.toLowerCase() ?? '';
  if (season.includes('dec') || season.includes('jan') || season.includes('winter')) {
    return { temp: 18, condition: 'Clear and cool', humidity: null, windKph: null, source: 'seasonal-fallback' };
  }
  if (season.includes('jun') || season.includes('monsoon')) {
    return { temp: 27, condition: 'Humid with showers', humidity: null, windKph: null, source: 'seasonal-fallback' };
  }
  return { temp: 25, condition: 'Pleasant for sightseeing', humidity: null, windKph: null, source: 'seasonal-fallback' };
};
