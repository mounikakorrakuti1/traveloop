import { useQuery } from "@tanstack/react-query";
import { getBudgetSummary } from "@/api/trips.api";
import { QUERY_KEYS } from "@/lib/constants";
export function useBudget(tripId) {
    return useQuery({
        queryKey: QUERY_KEYS.budget(tripId ?? ""),
        queryFn: ()=>getBudgetSummary(tripId),
        enabled: Boolean(tripId)
    });
}
