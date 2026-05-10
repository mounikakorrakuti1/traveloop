import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/api/cities.api";
import { QUERY_KEYS } from "@/lib/constants";
/** Playbook §3.4 — 10-minute stale time for city search */ export function useCitySearch(debouncedQuery) {
    return useQuery({
        queryKey: QUERY_KEYS.cities(debouncedQuery),
        queryFn: async ()=>{
            const { cities, meta } = await searchCities({
                q: debouncedQuery,
                limit: 20
            });
            return {
                cities,
                meta
            };
        },
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 10 * 60 * 1000
    });
}
