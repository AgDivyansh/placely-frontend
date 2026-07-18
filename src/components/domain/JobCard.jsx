import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, IndianRupee, Briefcase, Calendar, CheckCircle2,
  ArrowRight, AlertCircle, Bookmark, BookmarkCheck,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { StatusStepper } from "./StatusStepper";
import { EligibilityBadge } from "./EligibilityBadge";
import { ResumePickerModal } from "./ResumePickerModal";
import { useSelector } from "react-redux";
import { useAuth } from "@/store/hooks";
import { useAppData, useBookmarks } from "@/store/hooks";
import { selectCompaniesById } from "@/store/slices/companiesSlice";
import { useToast } from "@/context/ToastContext";
import { checkEligibility } from "@/lib/eligibilityEngine";
import { COMPANIES } from "@/data/mockData";
import { STAGES } from "@/lib/constants";
import { formatLPA, cn } from "@/lib/utils";

/**
 * JobCard — list item for the Jobs page.
 *
 * Footer always present:
 *   - If not applied: Apply button (active if eligible, disabled if not)
 *   - If applied: Stage stepper + "Applied" badge (disabled success-style button)
 *
 * Visual: 3D lift + glowing halo on hover for a modern/futuristic feel.
 *
 * Engineering:
 *   - memoized (parent re-renders frequently on filter/sort change)
 *   - e.stopPropagation() on Apply prevents the card's onClick from
 *     also firing (which would navigate to the detail page)
 */
export const JobCard = memo(function JobCard({ job }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAppliedTo, getApplicationFor, apply } = useAppData();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const toast = useToast();

  const companiesById = useSelector(selectCompaniesById);
  // Prefer the company nested by the API, then the fetched slice, then mock.
  const company = job.company || companiesById[job.companyId] || COMPANIES.find((c) => c.id === job.companyId);
  const eligibility = user ? checkEligibility(user, job) : null;
  const applied = hasAppliedTo(job.id);
  const bookmarked = isBookmarked(job.id);
  const application = getApplicationFor(job.id);
  const currentStageLabel = application
    ? STAGES.find((s) => s.key === application.currentStage)?.label
    : null;

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleBookmark(job.id);
    toast.info(
      bookmarked ? "Removed from saved" : "Saved",
      bookmarked ? `${job.role} unbookmarked` : `${job.role} saved for later`
    );
  };

  const [pickerOpen, setPickerOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleApply = (e) => {
    e.stopPropagation();
    if (!eligibility?.eligible || applied) return;
    setPickerOpen(true);
  };

  const handleConfirmApply = async (resumeId) => {
    setApplying(true);
    try {
      await apply(job, resumeId);
      toast.success("Applied!", `${job.role} at ${company?.name}`);
      setPickerOpen(false);
    } catch (err) {
      toast.error("Couldn't apply", err.message || "Please try again.");
    } finally {
      setApplying(false);
    }
  };

  // Halo gradient — varies by card state for visual feedback
  const haloGradient = applied
    ? "from-success/70 via-info/40 to-success/70"
    : eligibility?.eligible
      ? "from-accent/70 via-info/40 to-accent/70"
      : "from-ink-2/30 via-ink-3/20 to-ink-2/30";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="relative group cursor-pointer h-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Outer glow halo — the "blurred border" futuristic effect */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-2xl blur-lg opacity-0 -z-10 transition-opacity duration-500",
          "group-hover:opacity-70 bg-gradient-to-br",
          haloGradient
        )}
      />

      {/* Main card surface */}
      <div
        className={cn(
          "relative h-full flex flex-col rounded-2xl bg-surface border overflow-hidden",
          "transition-all duration-300",
          "shadow-sm group-hover:shadow-xl",
          applied
            ? "border-success/30"
            : "border-border group-hover:border-border-strong"
        )}
      >
        {/* Top accent gradient line — appears on hover */}
        <div
          className={cn(
            "absolute inset-x-8 -top-px h-px opacity-0 transition-opacity duration-500",
            "group-hover:opacity-100",
            "bg-gradient-to-r from-transparent via-accent to-transparent"
          )}
        />

        {/* Top-right corner radial glow — appears on hover */}
        <div
          className={cn(
            "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 pointer-events-none",
            "group-hover:opacity-25",
            applied ? "bg-success" : "bg-accent"
          )}
        />

        {/* Bookmark toggle — top-right, always visible */}
        <button
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Save for later"}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all z-10",
            "border backdrop-blur-sm",
            bookmarked
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-surface/60 border-border text-ink-3 hover:text-ink hover:border-border-strong opacity-0 group-hover:opacity-100"
          )}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>

        {/* ─── Content ────────────────────────────────── */}
        <div className="flex-1 p-5 space-y-4 relative">
          {/* Header: logo + role + eligibility badge */}
          <div className="flex items-start gap-3">
            <div
              className="h-11 w-11 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
              style={{ background: company?.color || "#5B85E0" }}
            >
              {company?.initial}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink truncate leading-tight">{job.role}</h3>
              <p className="text-sm text-ink-2 mt-0.5">{company?.name}</p>
            </div>
            {!applied && <EligibilityBadge result={eligibility} />}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-ink-2">
            <span className="flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-ink-3" />
              <span className="num font-medium text-ink">{formatLPA(job.package)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-ink-3" />
              <span className="truncate">{job.location}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-ink-3" />
              <span className="truncate">{job.type}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-ink-3" />
              <span className="truncate">
                By {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </span>
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.tags.map((tag) => (
                <Badge key={tag} tone="accent" size="sm">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Missing criteria warning (only if not eligible AND not applied) */}
          {eligibility && !eligibility.eligible && !applied && (
            <div className="flex items-start gap-1.5 text-xs pt-1">
              <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <span className="text-ink-3">
                Missing:{" "}
                <span className="text-danger font-medium">{eligibility.reasons.join(", ")}</span>
              </span>
            </div>
          )}
        </div>

        {/* ─── Footer: status + apply ─────────────────── */}
        <div className="border-t border-border bg-surface-tint/40 p-4 space-y-3">
          {/* Status display — only when applied */}
          {applied && application && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink-3 font-semibold uppercase tracking-widest">
                  Application status
                </span>
                <Badge tone="info" size="sm">{currentStageLabel}</Badge>
              </div>
              <div className="px-0.5">
                <StatusStepper currentStage={application.currentStage} compact />
              </div>
            </div>
          )}

          {/* Apply CTA — three states: Applied / Apply / Not eligible */}
          {applied ? (
            <button
              type="button"
              disabled
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2",
                "bg-success/10 text-success border border-success/30",
                "cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Applied
            </button>
          ) : (
            <Button
              variant={eligibility?.eligible ? "primary" : "secondary"}
              size="md"
              disabled={!eligibility?.eligible}
              onClick={handleApply}
              className="w-full"
              rightIcon={eligibility?.eligible ? ArrowRight : undefined}
            >
              {eligibility?.eligible ? "Apply now" : "Not eligible"}
            </Button>
          )}
        </div>
      </div>

      {/* Clicks inside the modal must not bubble to the card's navigate onClick. */}
      <div onClick={(e) => e.stopPropagation()}>
        <ResumePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleConfirmApply}
          jobLabel={`${job.role} at ${company?.name}`}
          applying={applying}
        />
      </div>
    </motion.div>
  );
});
