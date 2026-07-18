import { Bookmark, Search } from "lucide-react";
import { useBookmarks } from "@/store/hooks";
import { useAppData } from "@/store/hooks";
import { JobCard } from "@/components/domain/JobCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";

export default function BookmarksPage() {
  const { jobIds, clearAll } = useBookmarks();
  const { jobs } = useAppData();
  const navigate = useNavigate();

  const saved = jobs.filter((j) => jobIds.includes(j.id));

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="display-heading text-3xl text-ink">Saved jobs</h1>
            <p className="text-sm text-ink-2 mt-1">
              {saved.length} job{saved.length !== 1 ? "s" : ""} bookmarked for later
            </p>
          </div>
          {saved.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>

        {saved.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            description="Hit the bookmark icon on any job card to save it for later."
            action={
              <Button variant="secondary" leftIcon={Search} onClick={() => navigate("/jobs")}>
                Browse jobs
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {saved.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
