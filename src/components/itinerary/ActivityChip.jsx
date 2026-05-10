import { jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
export const ActivityChip = /*#__PURE__*/ memo(function ActivityChip({ activity }) {
    return /*#__PURE__*/ _jsxs(Badge, {
        tone: "teal",
        title: activity.description ?? activity.name,
        children: [
            activity.name,
            /*#__PURE__*/ _jsxs("span", {
                className: "ml-1 opacity-80",
                children: [
                    "· $",
                    activity.estimatedCostUsd
                ]
            })
        ]
    });
});
