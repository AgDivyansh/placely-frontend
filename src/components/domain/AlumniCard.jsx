import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Star, ArrowRight } from "lucide-react";
import { Card, Avatar, Badge } from "@/components/ui";
import { COMPANIES } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const AlumniCard = memo(function AlumniCard({ alumni }) {
  const navigate = useNavigate();
  const company = COMPANIES.find((c) => c.id === alumni.companyId);
  return (
    <Card interactive onClick={() => navigate(`/alumni/${alumni.id}`)} className="h-full group">
      <Card.Body className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar name={alumni.name} size="lg" color={company?.color || "#5B85E0"} />
            <span
              className={cn(
                "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface",
                alumni.available === "online" ? "bg-success" : "bg-warning"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-ink truncate">{alumni.name}</h3>
              {alumni.verified && <ShieldCheck className="h-3.5 w-3.5 text-info shrink-0" />}
            </div>
            <p className="text-xs text-ink-2 mt-0.5">{alumni.role} · {company?.name}</p>
            <p className="text-xs text-ink-3 mt-0.5">Class of {alumni.gradYear}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {alumni.expertise.slice(0, 2).map((e) => (
            <Badge key={e} tone="neutral" size="sm">{e}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="num font-medium text-ink">{alumni.rating}</span>
            <span className="text-ink-3 ml-2">{alumni.available === "online" ? "Available" : "Busy"}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-3 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        </div>
      </Card.Body>
    </Card>
  );
});
