function asTravelStyleArray(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean).slice(0, 12);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()].slice(0, 12);
  }
  return [];
}

export function buildAiContext(user, extra = {}) {
  return {
    travelStyle: asTravelStyleArray(user?.travelStyles),
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
