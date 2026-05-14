/** Google AdSense publisher + unit IDs (public; set in `.env` for /trips/new sidebar). */
export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT?.trim() ?? "";
export const ADSENSE_CREATE_TRIP_SLOT =
  import.meta.env.VITE_ADSENSE_CREATE_TRIP_SLOT?.trim() ?? "";
/** `auto` = responsive display; `autorelaxed` = multiplex grid (requires that unit type in AdSense). */
export const ADSENSE_CREATE_TRIP_FORMAT =
  import.meta.env.VITE_ADSENSE_CREATE_TRIP_FORMAT?.trim() || "auto";

export function isCreateTripAdSenseConfigured() {
  return Boolean(ADSENSE_CLIENT && ADSENSE_CREATE_TRIP_SLOT);
}
