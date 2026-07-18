import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui";

/**
 * EligibilityBadge — compact pill showing X of Y criteria passed.
 * Renders green for fully eligible, danger for not.
 */
export function EligibilityBadge({ result, size = "sm" }) {
  if (!result) return null;
  if (result.eligible) {
    return (
      <Badge tone="success" size={size} icon={Check}>
        Eligible
      </Badge>
    );
  }
  return (
    <Badge tone="danger" size={size} icon={X}>
      {result.passed} of {result.total}
    </Badge>
  );
}
