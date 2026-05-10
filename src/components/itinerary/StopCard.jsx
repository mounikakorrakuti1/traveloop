import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { formatDisplayDate } from "@/lib/utils";
import { ActivityChip } from "./ActivityChip";
export const StopCard = /*#__PURE__*/ memo(function StopCard({ stop }) {
    return /*#__PURE__*/ _jsxs(Card, {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "flex flex-wrap items-start justify-between gap-2",
                children: /*#__PURE__*/ _jsxs("div", {
                    children: [
                        /*#__PURE__*/ _jsx("h3", {
                            className: "font-semibold text-primary",
                            children: stop.city?.name ?? "City"
                        }),
                        /*#__PURE__*/ _jsxs("p", {
                            className: "text-sm text-gray-600",
                            children: [
                                formatDisplayDate(stop.arrivalDate),
                                " → ",
                                formatDisplayDate(stop.departureDate)
                            ]
                        })
                    ]
                })
            }),
            stop.notes ? /*#__PURE__*/ _jsx("p", {
                className: "text-sm text-gray-700",
                children: stop.notes
            }) : null,
            /*#__PURE__*/ _jsx("div", {
                className: "flex flex-wrap gap-2",
                children: stop.activities?.map((sa)=>sa.activity ? /*#__PURE__*/ _jsx(ActivityChip, {
                        activity: sa.activity
                    }, sa.id) : null)
            })
        ]
    });
});
