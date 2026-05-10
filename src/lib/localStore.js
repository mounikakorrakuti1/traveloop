import { useEffect, useState } from "react";

const STORAGE_KEY = "traveloop.local.v1";

export const defaultLocalState = {
    user: {
        firstName: "Demo",
        lastName: "Traveler",
        email: "demo@traveloop.local",
        phone: "",
        city: "Delhi",
        country: "India",
        additionalInfo: "Local profile until backend integration."
    },
    trips: [
        {
            id: "demo",
            title: "Paris & Rome Adventure",
            place: "Paris, Rome",
            status: "ongoing",
            startDate: "2026-06-01",
            endDate: "2026-06-08",
            budget: 20000,
            overview: "Short Over View of the Trip"
        }
    ],
    itinerarySections: [
        { id: "sec-1", title: "Museum visit", dateRange: "Day 1", budget: 3000, info: "Travel section, hotel or activity." },
        { id: "sec-2", title: "Food walk", dateRange: "Day 1", budget: 2000, info: "Travel section, hotel or activity." },
        { id: "sec-3", title: "Market tour", dateRange: "Day 2", budget: 1500, info: "Travel section, hotel or activity." }
    ],
    packingGroups: [
        {
            id: "documents",
            title: "Documents",
            items: [
                { id: "passport", name: "Passport", packed: true },
                { id: "tickets", name: "Flight Tickets (printed)", packed: true },
                { id: "insurance", name: "Travel insurance", packed: true },
                { id: "hotel-confirmation", name: "Hotel booking confirmation", packed: false }
            ]
        },
        {
            id: "clothing",
            title: "Clothing",
            items: [
                { id: "shirts", name: "Casual shirts", packed: true },
                { id: "trousers", name: "Trousers / jeans", packed: false },
                { id: "shoes", name: "Comfortable walking shoes", packed: false },
                { id: "jacket", name: "Light jacket / windbreaker", packed: false }
            ]
        },
        {
            id: "electronics",
            title: "Electronics",
            items: [
                { id: "phone-charger", name: "Phone charger", packed: true },
                { id: "adapter", name: "Universal power adapter", packed: false },
                { id: "headphones", name: "Earphone / headphones", packed: false }
            ]
        }
    ],
    notes: [
        { id: "note-1", title: "Rome stop", body: "Hotel included (4:00pm)\nDay 3: June 14 2025" },
        { id: "note-2", title: "Hotel check-in details - Rome stop", body: "check in after 2pm, room 302, breakfast included (7-10am)\nDay 3: June 14 2025" }
    ],
    invoiceRows: [
        { id: "row-1", category: "hotel", description: "hotel booking paris", qty: "3 nights", unitCost: 3000 },
        { id: "row-2", category: "travel", description: "Flight booking (DEL -> PAR)", qty: "1", unitCost: 12000 }
    ],
    communityPosts: [
        { id: "post-1", author: "Demo Traveler", body: "Share trip experience and tips here." },
        { id: "post-2", author: "Local Guide", body: "Add city-specific recommendations for other users." }
    ],
    searchOptions: ["Goa beach stay", "Rome hotel", "Paris museum", "Local market walk", "Budget food tour"]
};

function readState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...defaultLocalState, ...JSON.parse(raw) } : defaultLocalState;
    } catch {
        return defaultLocalState;
    }
}

export function saveLocalState(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new Event("traveloop-local-state"));
}

export function useLocalState() {
    const [state, setState] = useState(readState);

    useEffect(() => {
        const sync = () => setState(readState());
        window.addEventListener("storage", sync);
        window.addEventListener("traveloop-local-state", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("traveloop-local-state", sync);
        };
    }, []);

    const updateState = (updater) => {
        const nextState = typeof updater === "function" ? updater(readState()) : updater;
        saveLocalState(nextState);
        setState(nextState);
    };

    return [state, updateState];
}

export function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
