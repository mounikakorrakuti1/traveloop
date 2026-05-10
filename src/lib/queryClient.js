import { QueryClient } from "@tanstack/react-query";
/** Playbook §3.4 defaults */ export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
});
