import { create } from "zustand";
export const useTripStore = create((set)=>({
        activeTrip: null,
        activeStop: null,
        setActiveTrip: (activeTrip)=>set({
                activeTrip
            }),
        setActiveStop: (activeStop)=>set({
                activeStop
            })
    }));
