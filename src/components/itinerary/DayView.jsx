import { jsx as _jsx } from "react/jsx-runtime";
import { StopCard } from "./StopCard";
/** Groups stops roughly by arrival date for timeline-style UI */ export function DayView({ stops }) {
    const sorted = [
        ...stops
    ].sort((a, b)=>a.arrivalDate.localeCompare(b.arrivalDate));
    return /*#__PURE__*/ _jsx("div", {
        className: "space-y-6",
        "aria-live": "polite",
        children: sorted.map((stop)=>/*#__PURE__*/ _jsx(StopCard, {
                stop: stop
            }, stop.id))
    });
}
