import { useEffect, useState } from "react";

const STORAGE_KEY = "traveloop.local.v1";

export const defaultLocalState = {
    user: null,
    trips: [],
    itinerarySections: [],
    packingGroups: [],
    notes: [],
    invoiceRows: [],
    communityPosts: [],
    searchOptions: []
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
        const nextState =
            typeof updater === "function"
                ? updater(readState())
                : updater;

        saveLocalState(nextState);
        setState(nextState);
    };

    return [state, updateState];
}

export function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}