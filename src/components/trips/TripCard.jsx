import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { TripStatusBadge } from "./TripStatusBadge";
/** Playbook §3.13 — `React.memo` + prefetch on hover */ export const TripCard = /*#__PURE__*/ memo(function TripCard({ trip }) {
    const qc = useQueryClient();
    const prefetch = ()=>{
        void qc.prefetchQuery({
            queryKey: QUERY_KEYS.trip(trip.id),
            queryFn: ()=>getTrip(trip.id)
        });
    };
    return /*#__PURE__*/ _jsxs(Card, {
        className: "transition hover:shadow-md",
        onMouseEnter: prefetch,
        role: "article",
        "aria-label": `Trip ${trip.title}`,
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsx("h3", {
                                className: "text-lg font-semibold text-primary",
                                children: /*#__PURE__*/ _jsx(Link, {
                                    to: ROUTES.tripDetail(trip.id),
                                    className: "hover:underline",
                                    children: trip.title
                                })
                            }),
                            /*#__PURE__*/ _jsxs("p", {
                                className: "mt-1 text-sm text-gray-600",
                                children: [
                                    formatDisplayDate(trip.startDate),
                                    " — ",
                                    formatDisplayDate(trip.endDate)
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx(TripStatusBadge, {
                        status: trip.status
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "mt-4 flex flex-wrap gap-3 text-sm",
                children: [
                    /*#__PURE__*/ _jsx(Link, {
                        className: "text-teal hover:underline",
                        to: ROUTES.tripItinerary(trip.id),
                        children: "Itinerary"
                    }),
                    /*#__PURE__*/ _jsx(Link, {
                        className: "text-teal hover:underline",
                        to: ROUTES.tripBudget(trip.id),
                        children: "Budget"
                    })
                ]
            })
        ]
    });
});
