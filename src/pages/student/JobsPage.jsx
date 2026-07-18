import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input, Chip, Button } from "@/components/ui";
import { JobCard } from "@/components/domain/JobCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/store/hooks";
import { useAppData } from "@/store/hooks";
import { checkEligibility } from "@/lib/eligibilityEngine";
import { useDebounce } from "@/hooks/useDebounce";
import { INDUSTRIES } from "@/lib/constants";
import { COMPANIES } from "@/data/mockData";

const SORTS = [
  { key: "eligibility", label: "Eligibility first" },
  { key: "package", label: "Highest package" },
  { key: "recent", label: "Most recent" },
];

export default function JobsPage() {
  const { user } = useAuth();
  const { jobs, hasAppliedTo } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter"); // applied | eligible | upcoming

  const [search, setSearch] = useState("");
  const [industries, setIndustries] = useState([]);
  const [sortBy, setSortBy] = useState("eligibility");
  const [eligibleOnly, setEligibleOnly] = useState(filterParam === "eligible");
  const [appliedOnly, setAppliedOnly] = useState(filterParam === "applied");
  const debouncedSearch = useDebounce(search, 200);

  // Keep filter chips in sync with URL parameter
  useEffect(() => {
    setEligibleOnly(filterParam === "eligible");
    setAppliedOnly(filterParam === "applied");
  }, [filterParam]);

  const toggleIndustry = (ind) => {
    setIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const clearAll = () => {
    setSearch("");
    setIndustries([]);
    setEligibleOnly(false);
    setAppliedOnly(false);
    setSearchParams({});
  };

  // Filtered + sorted jobs — memoized for performance
  const visibleJobs = useMemo(() => {
    let list = jobs.map((j) => ({
      job: j,
      company: j.company || COMPANIES.find((c) => c.id === j.companyId),
      eligibility: checkEligibility(user, j),
      applied: hasAppliedTo(j.id),
    }));

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        ({ job, company }) =>
          job.role.toLowerCase().includes(q) ||
          company?.name.toLowerCase().includes(q)
      );
    }
    if (industries.length > 0) {
      list = list.filter(({ company }) => industries.includes(company?.industry));
    }
    if (eligibleOnly) list = list.filter((x) => x.eligibility.eligible);
    if (appliedOnly) list = list.filter((x) => x.applied);

    if (sortBy === "eligibility") {
      list.sort((a, b) => b.eligibility.passed - a.eligibility.passed);
    } else if (sortBy === "package") {
      list.sort((a, b) => b.job.package - a.job.package);
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.job.deadline) - new Date(a.job.deadline));
    }
    return list;
  }, [jobs, user, debouncedSearch, industries, eligibleOnly, appliedOnly, sortBy, hasAppliedTo]);

  const activeFilters =
    (industries.length > 0 ? 1 : 0) +
    (eligibleOnly ? 1 : 0) +
    (appliedOnly ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink">All openings</h1>
          <p className="text-sm text-ink-2 mt-1">
            {visibleJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search roles or companies"
                leftIcon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface border border-border text-sm text-ink hover:border-border-strong focus:outline-none focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={eligibleOnly} onClick={() => setEligibleOnly((v) => !v)}>
              Only eligible
            </Chip>
            <Chip active={appliedOnly} onClick={() => setAppliedOnly((v) => !v)}>
              Already applied
            </Chip>
            <div className="h-5 w-px bg-border mx-1" />
            {INDUSTRIES.map((ind) => (
              <Chip
                key={ind}
                active={industries.includes(ind)}
                onClick={() => toggleIndustry(ind)}
              >
                {ind}
              </Chip>
            ))}
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" leftIcon={X} onClick={clearAll}>
                Clear ({activeFilters})
              </Button>
            )}
          </div>
        </div>

        {/* Job grid */}
        {visibleJobs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No jobs match your filters"
            description="Try removing a filter or broadening your search."
            action={<Button variant="secondary" onClick={clearAll}>Clear filters</Button>}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger"
          >
            {visibleJobs.map(({ job }) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
