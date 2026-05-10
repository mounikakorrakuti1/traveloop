import { jsx as _jsx } from "react/jsx-runtime";
import { Badge } from "@/components/ui/Badge";
const STATUS_LABEL = {
    planning: "Planning",
    confirmed: "Confirmed",
    ongoing: "Ongoing",
    completed: "Completed"
};
export function TripStatusBadge({ status }) {
    const tone = status === "completed" ? "neutral" : status === "ongoing" ? "teal" : "amber";
    return /*#__PURE__*/ _jsx(Badge, {
        tone: tone,
        children: STATUS_LABEL[status]
    });
}
