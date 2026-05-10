/** Route paths aligned with backend & playbook §3.6 */
export const ROUTES = {
  landing:            "/",
  login:              "/login",
  signup:             "/signup",
  forgotPassword:     "/forgot-password",
  home:               "/dashboard",
  trips:              "/trips",
  tripNew:            "/trips/new",
  tripDetail:         (id) => `/trips/${id}`,
  tripItinerary:      (id) => `/trips/${id}/itinerary`,
  tripItineraryView:  (id) => `/trips/${id}/itinerary/view`,
  tripBudget:         (id) => `/trips/${id}/budget`,
  tripPacking:        (id) => `/trips/${id}/packing`,
  tripNotes:          (id) => `/trips/${id}/notes`,
  tripDocs:           (id) => `/trips/${id}/docs`,
  tripMedia:          (id) => `/trips/${id}/media`,
  search:             "/search",
  cities:             "/cities",
  community:          "/community",
  admin:              "/admin",
  profile:            "/profile",
  publicTrip:         (slug) => `/public/trips/${slug}`,
};

/** Query keys — playbook §3.4 */
export const QUERY_KEYS = {
  me:         ["auth", "me"],
  trips:      (filters) => ["trips", filters],
  trip:       (id) => ["trips", id],
  stops:      (tripId) => ["trips", tripId, "stops"],
  budget:     (tripId) => ["trips", tripId, "budget"],
  cities:     (q) => ["cities", q],
  activities: (filters) => ["activities", filters],
  notes:      (tripId) => ["trips", tripId, "notes"],
  packing:    (tripId) => ["trips", tripId, "packing"],
  media:      (tripId) => ["trips", tripId, "media"],
};
