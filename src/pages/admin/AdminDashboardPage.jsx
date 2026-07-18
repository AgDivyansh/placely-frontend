import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Briefcase, Target, ArrowRight } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { StatCard } from "@/components/domain/StatCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const BRANCH_DATA = [
  { branch: "CSE", applied: 320, selected: 86 },
  { branch: "IT", applied: 245, selected: 64 },
  { branch: "ECE", applied: 180, selected: 38 },
  { branch: "EEE", applied: 110, selected: 18 },
  { branch: "ME", applied: 95, selected: 11 },
  { branch: "AIML", applied: 130, selected: 42 },
];

const FUNNEL = [
  { stage: "Applied", count: 1080, pct: 100 },
  { stage: "Shortlisted", count: 612, pct: 57 },
  { stage: "OA cleared", count: 384, pct: 36 },
  { stage: "Interviewed", count: 218, pct: 20 },
  { stage: "Offered", count: 142, pct: 13 },
];

const INDUSTRY = [
  { name: "Software", value: 38, fill: "var(--info)" },
  { name: "Fintech", value: 22, fill: "var(--accent)" },
  { name: "E-commerce", value: 18, fill: "var(--success)" },
  { name: "Banking", value: 12, fill: "var(--warning)" },
  { name: "Consulting", value: 10, fill: "var(--ink-3)" },
];

const TREND = [
  { month: "Jan", offers: 8 },
  { month: "Feb", offers: 15 },
  { month: "Mar", offers: 28 },
  { month: "Apr", offers: 42 },
  { month: "May", offers: 64 },
];

const tipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  padding: "8px 10px",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="display-heading text-4xl text-ink">Placement <em className="text-accent">overview</em></h1>
          <p className="text-sm text-ink-2 mt-1">Live snapshot — Spring 2026 placement season</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger">
          <StatCard icon={Briefcase} label="Active jobs" countTo={42} hint="+8 this week" tone="blue" />
          <StatCard icon={Users} label="Total applicants" countTo={1080} hint="259 this week" tone="coral" />
          <StatCard icon={Target} label="Selection rate" countTo={13} suffix="%" hint="+2.3% vs last year" tone="sage" />
          <StatCard icon={TrendingUp} label="Avg package" countTo={18} prefix="₹" suffix=" LPA" hint="+₹2 vs last year" tone="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch performance */}
          <Card className="lg:col-span-2">
            <Card.Header className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink">Branch performance</h3>
                <p className="text-xs text-ink-3 mt-0.5">Applied vs selected by branch</p>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={BRANCH_DATA}>
                    <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--ink-3)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-3)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="applied" fill="var(--info)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="selected" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          {/* Industry distribution */}
          <Card>
            <Card.Header><h3 className="font-semibold text-ink">Industry split</h3></Card.Header>
            <Card.Body>
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={INDUSTRY} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {INDUSTRY.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {INDUSTRY.map((i) => (
                  <div key={i.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.fill }} />
                    <span className="text-ink-2 flex-1">{i.name}</span>
                    <span className="num font-semibold text-ink">{i.value}%</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-ink">Selection funnel</h3>
              <p className="text-xs text-ink-3 mt-0.5">Conversion at each stage</p>
            </Card.Header>
            <Card.Body className="space-y-3">
              {FUNNEL.map((s) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-ink">{s.stage}</span>
                    <span className="text-ink-2 num">{s.count} <span className="text-ink-3">({s.pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Hiring trend */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-ink">Offers over time</h3>
              <p className="text-xs text-ink-3 mt-0.5">Monthly trend, 2026 season</p>
            </Card.Header>
            <Card.Body>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={TREND}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ink-3)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-3)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle} />
                    <Line type="monotone" dataKey="offers" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Body className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink">Manage job postings</h3>
              <p className="text-xs text-ink-3 mt-0.5">Create, edit, and close openings</p>
            </div>
            <Button rightIcon={ArrowRight} onClick={() => navigate("/admin/jobs")}>Open job board</Button>
          </Card.Body>
        </Card>
      </div>
    </PageTransition>
  );
}
