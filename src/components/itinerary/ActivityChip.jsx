import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { activityEstimatedInr } from "@/lib/format";

export const ActivityChip = memo(function ActivityChip({ activity }) {
  const inr = activityEstimatedInr(activity);
  return (
    <Badge tone="teal" title={activity.description ?? activity.name}>
      {activity.name}
      <span className="ml-1 opacity-80">· ₹{inr.toLocaleString("en-IN")}</span>
    </Badge>
  );
});
