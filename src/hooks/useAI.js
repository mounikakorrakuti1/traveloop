import { useMutation } from "@tanstack/react-query";
import { generateItinerary } from "@/api/ai.api";
export function useAiItinerary() {
    return useMutation({
        mutationFn: (body)=>generateItinerary(body)
    });
}
