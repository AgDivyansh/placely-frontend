import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Star, IndianRupee, Building2, TrendingUp, MessageCircle, ShieldCheck } from "lucide-react";
import { Card, Button, Badge, Avatar } from "@/components/ui";
import { StatusStepper } from "@/components/domain/StatusStepper";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAppData } from "@/store/hooks";
import { COMPANIES, ALUMNI, INTERVIEW_EXPERIENCES } from "@/data/mockData";
import { formatLPA } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const PACKAGE_TREND = [
  { year: "2021", lpa: 12 },
  { year: "2022", lpa: 14 },
  { year: "2023", lpa: 16 },
  { year: "2024", lpa: 18 },
  { year: "2025", lpa: 22 },
  { year: "2026", lpa: 24 },
];

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, applications } = useAppData();

  const company = COMPANIES.find((c) => c.id === id);
  if (!company) {
    return (
      <PageTransition>
        <Card><Card.Body><p className="text-ink-2">Company not found.</p></Card.Body></Card>
      </PageTransition>
    );
  }
  const openRoles = jobs.filter((j) => j.companyId === company.id);
  const companyAlumni = ALUMNI.filter((a) => a.companyId === company.id);
  const experiences = INTERVIEW_EXPERIENCES[company.id] || [];
  const application = applications.find((a) => a.companyId === company.id);

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>

        {/* Hero */}
        <Card elevated>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div
                className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md"
                style={{ background: company.color }}
              >
                {company.initial}
              </div>
              <div className="flex-1">
                <h1 className="display-heading text-3xl text-ink">{company.name}</h1>
                <p className="text-sm text-ink-2 mt-1">{company.industry}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <Cell icon={Star} label="Rating" value={`${company.rating} / 5`} />
              <Cell icon={IndianRupee} label="Avg package" value={formatLPA(company.avgPackage)} />
              <Cell icon={Building2} label="Visits" value={company.visits} />
              <Cell icon={TrendingUp} label="Open roles" value={openRoles.length} />
            </div>
          </Card.Body>
        </Card>

        {/* Status banner if applied */}
        {application && (
          <Card>
            <Card.Body className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink text-sm">Your application status</h3>
                <Badge tone="info" size="sm">In progress</Badge>
              </div>
              <StatusStepper currentStage={application.currentStage} />
            </Card.Body>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Open roles */}
          <Card className="lg:col-span-2">
            <Card.Header><h3 className="font-semibold text-ink">Open positions</h3></Card.Header>
            <div className="px-5 pb-5 space-y-2">
              {openRoles.map((j) => (
                <button
                  key={j.id}
                  onClick={() => navigate(`/jobs/${j.id}`)}
                  className="w-full text-left p-3 rounded-lg hover:bg-surface-tint transition-colors border border-border"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{j.role}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{j.location} · {j.type}</p>
                    </div>
                    <span className="num text-sm font-semibold text-ink shrink-0">{formatLPA(j.package)}</span>
                  </div>
                </button>
              ))}
              {openRoles.length === 0 && (
                <p className="text-sm text-ink-3 py-4 text-center">No open roles right now.</p>
              )}
            </div>
          </Card>

          {/* Package trend */}
          <Card>
            <Card.Header><h3 className="font-semibold text-ink text-sm">Package trend</h3></Card.Header>
            <Card.Body>
              <div className="h-32">
                <ResponsiveContainer>
                  <AreaChart data={PACKAGE_TREND}>
                    <defs>
                      <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--ink-3)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v} LPA`, "Avg"]}
                    />
                    <Area type="monotone" dataKey="lpa" stroke="var(--accent)" fill="url(#trend)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Alumni grid */}
        {companyAlumni.length > 0 && (
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-ink">Alumni at {company.name}</h3>
            </Card.Header>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companyAlumni.map((al) => (
                <button
                  key={al.id}
                  onClick={() =>
                    navigate(`/alumni/${al.id}`, {
                      state: { from: location.pathname, fromLabel: "Back to company" },
                    })
                  }
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-tint transition-colors text-left"
                >
                  <Avatar name={al.name} size="md" color={company.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-ink truncate">{al.name}</p>
                      {al.verified && <ShieldCheck className="h-3 w-3 text-info" />}
                    </div>
                    <p className="text-xs text-ink-3 truncate">{al.role} · Class of {al.gradYear}</p>
                  </div>
                  <MessageCircle className="h-4 w-4 text-ink-3" />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Interview experiences */}
        {experiences.length > 0 && (
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-ink">Interview experiences</h3>
            </Card.Header>
            <div className="px-5 pb-5 space-y-3">
              {experiences.map((e, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-tint border border-border">
                  <p className="text-xs font-semibold text-ink mb-1">{e.author}</p>
                  <p className="text-sm text-ink-2">{e.content}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

function Cell({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-ink-3">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="num text-base font-semibold text-ink mt-1">{value}</p>
    </div>
  );
}
