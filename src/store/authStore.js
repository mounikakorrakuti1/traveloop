import { create } from "zustand";
/** Playbook §3.5 — sync with GET /auth/me on app init */ export const useAuthStore = create((set)=>({
        user: null,
        isAuthenticated: false,
        hasHydrated: false,
        setUser: (user)=>set({
                user,
                isAuthenticated: true
            }),
        logout: ()=>set({
                user: null,
                isAuthenticated: false
            }),
        setHydrated: (hasHydrated)=>set({
                hasHydrated
            })
    }));
