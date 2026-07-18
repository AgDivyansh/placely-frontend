import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareQuote, Search, Building2, ChevronDown, Filter } from "lucide-react";
import { Card, Input, Chip, Badge, Avatar } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { COMPANIES, INTERVIEW_EXPERIENCES } from "@/data/mockData";
import { cn } from "@/lib/utils";

/**
 * InterviewExperiencesPage — a searchable library of interview
 * experiences shared by seniors, grouped by company.
 *
 * Why it matters: at Tier-2/3 colleges, students walk into interviews
 * blind. Aggregated experiences are the single most requested resource.
 *
 * API-ready: GET /interview-experiences in production. Reads from
 * INTERVIEW_EXPERIENCES mock keyed by companyId for the demo.
 */
export default function InterviewExperiencesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);

  // Build a list: companies that have experiences, with their entries
  const companiesWithExp = useMemo(() => {
    return COMPANIES
      .filter((c) => INTERVIEW_EXPERIENCES[c.id]?.length)
      .map((c) => ({
        ...c,
        experiences: INTERVIEW_EXPERIENCES[c.id],
        count: INTERVIEW_EXPERIENCES[c.id].length,
      }));
  }, []);

  const industries = useMemo(
    () => [...new Set(companiesWithExp.map((c) => c.industry))],
    [companiesWithExp]
  );

  const filtered = useMemo(() => {
    let list = companiesWithExp;
    if (industry) list = list.filter((c) => c.industry === industry);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.experiences.some((e) => e.content.toLowerCase().includes(q))
      );
    }
    return list;
  }, [companiesWithExp, industry, search]);

  const totalExperiences = companiesWithExp.reduce((sum, c) => sum + c.count, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <MessageSquareQuote className="h-7 w-7 text-accent" />
            Interview Experiences
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            {totalExperiences} experiences shared by seniors across {companiesWithExp.length} companies.
            Learn what to expect before you walk in.
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search companies or keywords (e.g. 'system design', 'DSA')"
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={!industry} onClick={() => setIndustry(null)}>All</Chip>
            {industries.map((ind) => (
              <Chip key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>
                {ind}
              </Chip>
            ))}
          </div>
        </div>

        {/* Company cards */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No experiences found"
            description="Try a different search term or filter."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((company) => {
              const isExpanded = expandedCompany === company.id;
              return (
                <Card key={company.id}>
                  {/* Company header — click to expand */}
                  <button
                    onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                    className="w-full text-left"
                  >
                    <div className="p-5 flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                        style={{ background: company.color }}
                      >
                        {company.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-ink">{company.name}</h3>
                        <p className="text-xs text-ink-3 mt-0.5">
                          {company.industry} · Difficulty: {company.difficulty}
                        </p>
                      </div>
                      <Badge tone="accent" size="md" icon={MessageSquareQuote}>
                        {company.count}
                      </Badge>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-5 w-5 text-ink-3" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Experiences — expand/collapse */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border">
                          {company.experiences.map((exp, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="flex gap-3 pt-3"
                            >
                              <Avatar name={exp.author} size="sm" color={company.color} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-ink">{exp.author}</p>
                                <p className="text-sm text-ink-2 mt-1 leading-relaxed">{exp.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
