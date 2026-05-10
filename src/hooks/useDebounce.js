import { useEffect, useState } from "react";
/** Playbook §3.13 — default 350ms for city search */ export function useDebounce(value, delayMs = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(()=>{
        const t = window.setTimeout(()=>setDebounced(value), delayMs);
        return ()=>window.clearTimeout(t);
    }, [
        value,
        delayMs
    ]);
    return debounced;
}
