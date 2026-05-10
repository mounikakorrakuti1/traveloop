import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { QUERY_KEYS } from "@/lib/constants";
export function useTrip(tripId) {
    return useQuery({
        queryKey: QUERY_KEYS.trip(tripId ?? ""),
        queryFn: ()=>getTrip(tripId),
        enabled: Boolean(tripId)
    });
}
