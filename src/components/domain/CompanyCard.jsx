import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, IndianRupee, TrendingUp } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatLPA, cn } from "@/lib/utils";

const DIFFICULTY_TONE = { Easy: "success", Medium: "warning", Hard: "danger" };

export const CompanyCard = memo(function CompanyCard({ company }) {
  const navigate = useNavigate();
  return (
    <Card interactive onClick={() => navigate(`/companies/${company.id}`)} className="h-full">
      <Card.Body className="space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
            style={{ background: company.color }}
          >
            {company.initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink truncate">{company.name}</h3>
            <p className="text-xs text-ink-3">{company.industry}</p>
          </div>
          <Badge tone={DIFFICULTY_TONE[company.difficulty] || "neutral"} size="sm">
            {company.difficulty}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div>
            <div className="flex items-center gap-1 text-xs text-ink-3">
              <Star className="h-3 w-3" /> Rating
            </div>
            <p className="num text-sm font-semibold text-ink mt-0.5">{company.rating}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-ink-3">
              <IndianRupee className="h-3 w-3" /> Avg
            </div>
            <p className="num text-sm font-semibold text-ink mt-0.5">{formatLPA(company.avgPackage)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-ink-3">
              <TrendingUp className="h-3 w-3" /> Roles
            </div>
            <p className="num text-sm font-semibold text-ink mt-0.5">{company.openings}</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});
