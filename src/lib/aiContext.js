export function buildAiContext(user, extra = {}) {
  return {
    travelStyle: user?.travelStyles || [],
    interests: extra.interests || [],
    budget: {
      min: user?.preferredBudgetMin ?? undefined,
      max: user?.preferredBudgetMax ?? undefined,
      currency: "INR",
    },
    foodPreference: extra.foodPreference,
    climatePreference: extra.climatePreference,
    previousTrips: extra.previousTrips || [],
    groupSize: extra.groupSize || 1,
    currentLocation: extra.currentLocation,
  };
}
