export type TravelerProfile = 'solo' | 'couple' | 'family' | 'senior' | 'group';
export type TripType =
  | 'solo'
  | 'couple'
  | 'family'
  | 'group'
  | 'adventure'
  | 'pilgrimage'
  | 'honeymoon'
  | 'business';
export type TripStatus = 'planning' | 'confirmed' | 'ongoing' | 'completed';
export type BudgetVibe = 'backpacker' | 'comfort' | 'luxury';
export type MediaType = 'photo' | 'video';
export type CostIndex = 'low' | 'medium' | 'high';

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]> | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  travelerProfile: TravelerProfile;
  isAdmin: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  coverPhotoUrl?: string | null;
  startDate: string;
  endDate: string;
  tripType: TripType;
  budgetCapUsd?: number | null;
  vibe?: BudgetVibe | null;
  isPublic: boolean;
  publicSlug?: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  orderIndex: number;
  arrivalDate: string;
  departureDate: string;
  notes?: string | null;
  accommodationName?: string | null;
  accommodationCost?: number | null;
  city?: City;
  activities?: StopActivity[];
}

export interface City {
  id: string;
  name: string;
  state?: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  costIndex?: CostIndex | null;
  areaType?: string | null;
  bestSeason?: string | null;
  isRegionalGem: boolean;
  thumbnailUrl?: string | null;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: string;
  tripTypeTags: string[];
  estimatedCostUsd: number;
  durationHours: number;
  description?: string | null;
  imageUrl?: string | null;
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  scheduledTime?: string | null;
  actualCostUsd?: number | null;
  isCompleted: boolean;
  activity?: Activity;
}

export interface BudgetSummary {
  tripId: string;
  totalBudgetCapUsd: number | null;
  totalSpentUsd: number;
  byDay: DayBudget[];
  byCategory: CategoryBudget[];
  isOverBudget: boolean;
  remainingUsd: number | null;
}

export interface DayBudget {
  date: string;
  stopId: string;
  cityName: string;
  accommodationCostUsd: number;
  activitiesCostUsd: number;
  totalUsd: number;
}

export interface CategoryBudget {
  category: string;
  totalUsd: number;
  percentage: number;
}

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: string;
  isPacked: boolean;
  aiSuggested: boolean;
}

export interface TripNote {
  id: string;
  tripId: string;
  stopId?: string | null;
  title: string;
  content: string;
  noteType: string;
  isImportant: boolean;
  createdAt: string;
}

export interface MediaUpload {
  id: string;
  tripId: string;
  stopId?: string | null;
  mediaType: MediaType;
  cloudinaryUrl: string;
  cloudinaryId: string;
  caption?: string | null;
  createdAt: string;
}

export interface GeneratedItinerary {
  stops: GeneratedStop[];
}

export interface GeneratedStop {
  city: string;
  country: string;
  days: number;
  estimatedCostUsd: number;
  activities: { name: string; category: string; costUsd: number; durationHours: number }[];
}

export interface PackingList {
  category: string;
  items: string[];
}

export interface BudgetEstimate {
  cityId: string;
  cityName: string;
  perDayUsd: number;
  accommodationUsd: number;
  foodUsd: number;
  activitiesUsd: number;
}
