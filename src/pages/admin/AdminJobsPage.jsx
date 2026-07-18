import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, Search, Download, Users } from "lucide-react";
import { Card, Button, Badge, Input } from "@/components/ui";
import { CreateJobModal } from "./CreateJobModal";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAppData } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectAllApplicants } from "@/store/slices/applicantsSlice";
import { selectCompaniesById } from "@/store/slices/companiesSlice";
import { logActivity } from "@/store/slices/activityFeedSlice";
import { useAuth } from "@/store/hooks";
import { COMPANIES } from "@/data/mockData";
import { formatLPA } from "@/lib/utils";
import { toCSV, downloadCSV } from "@/lib/csv";

export default function AdminJobsPage() {
  const { jobs, addJob, removeJob } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const { request: requestTwoStep } = useTwoStep();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const allApplicants = useSelector(selectAllApplicants);
  const companiesById = useSelector(selectCompaniesById);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  // Prefer the company nested by the API, then the fetched slice, then mock.
  const resolveCompany = (job) =>
    job.company || companiesById[job.companyId] || COMPANIES.find((c) => c.id === job.companyId);

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const company = resolveCompany(j);
    return j.role.toLowerCase().includes(q) || company?.name.toLowerCase().includes(q);
  });

  // Prefer the server-computed count (jobs.list returns applicantCount per job
  // in real mode); fall back to the local slice for mock mode.
  const applicantCountFor = (job) =>
    job.applicantCount ?? allApplicants.filter((a) => a.jobId === job.id).length;

  const handleCreate = async (job) => {
    try {
      await addJob(job);
      toast.success("Job published", `${job.role} is now live to students`);
    } catch (err) {
      toast.error("Couldn't publish job", err.message || "Please try again.");
    }
  };

  // 2-step verification gate for deletion
  const handleRemove = (job) => {
    const company = resolveCompany(job);
    requestTwoStep({
      title: "Delete job posting",
      description: `This will permanently remove "${job.role}" at ${company?.name} and all ${applicantCountFor(job)} associated applications. This action cannot be undone.`,
      actionLabel: "Delete posting",
      danger: true,
      onConfirm: async () => {
        try {
          await removeJob(job.id);
          dispatch(logActivity({
            actor: user?.name || "Admin",
            action: "Deleted job posting",
            target: `${job.role} at ${company?.name}`,
            kind: "job",
          }));
          toast.warning("Job removed", "Posting is no longer visible to students");
        } catch (err) {
          toast.error("Couldn't delete job", err.message || "Please try again.");
        }
      },
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="display-heading text-3xl text-ink">Job postings</h1>
            <p className="text-sm text-ink-2 mt-1">{jobs.length} active posting{jobs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={Download}
              onClick={() => {
                const rows = jobs.map((j) => {
                  const c = resolveCompany(j);
                  return {
                    company: c?.name,
                    role: j.role,
                    package_lpa: j.package,
                    location: j.location,
                    type: j.type,
                    deadline: j.deadline,
                    min_cgpa: j.eligibility.minCgpa,
                    branches: j.eligibility.branches.join("; "),
                  };
                });
                const csv = toCSV(rows, [
                  { key: "company", label: "Company" },
                  { key: "role", label: "Role" },
                  { key: "package_lpa", label: "Package (LPA)" },
                  { key: "location", label: "Location" },
                  { key: "type", label: "Type" },
                  { key: "deadline", label: "Deadline" },
                  { key: "min_cgpa", label: "Min CGPA" },
                  { key: "branches", label: "Branches" },
                ]);
                downloadCSV(`placely-jobs-${new Date().toISOString().slice(0, 10)}.csv`, csv);
                toast.success("Export started", `${rows.length} jobs downloaded`);
              }}
            >
              Export CSV
            </Button>
            <Button leftIcon={Plus} onClick={() => setShowCreate(true)}>Create job</Button>
          </div>
        </div>

        <Input
          placeholder="Search jobs"
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-tint border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Package</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Applicants</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Eligibility</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Deadline</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => {
                  const c = resolveCompany(j);
                  const count = applicantCountFor(j);
                  return (
                    <tr
                      key={j.id}
                      className="border-b border-border hover:bg-surface-tint transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/jobs/${j.id}/applicants`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: c?.color }}
                          >
                            {c?.initial}
                          </div>
                          <span className="font-medium text-ink">{c?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink">{j.role}</td>
                      <td className="py-3 px-4 num font-semibold text-ink">{formatLPA(j.package)}</td>
                      <td className="py-3 px-4">
                        <Badge tone={count > 0 ? "accent" : "neutral"} size="sm" icon={Users}>
                          {count}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone="neutral" size="sm">
                          CGPA {j.eligibility.minCgpa}+, {j.eligibility.branches.length} branches
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-ink-2 text-xs">
                        {new Date(j.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="View applicants"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/jobs/${j.id}/applicants`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(j);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <CreateJobModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      </div>
    </PageTransition>
  );
}
