import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { TrendingUp, Award, Building2, IndianRupee, Users, Target } from "lucide-react";
import { Card } from "@/components/ui";
import { StatCard } from "@/components/domain/StatCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { Reveal } from "@/components/motion";
import { COMPANIES } from "@/data/mockData";
import { BRANCHES } from "@/lib/constants";

/**
 * PlacementStatsPage — college-wide placement analytics for students.
 *
 * Gives students transparency into placement outcomes: how many placed,
 * package distribution, top recruiters, branch-wise comparison, and the
 * year-over-year trend. This is data students currently never see —
 * it lives in the TPO's Excel sheet.
 *
 * API-ready: all figures would come from GET /analytics/placement in
 * production. Derived here from mock COMPANIES for the demo.
 */

const CHART_COLORS = ["#B8502D", "#2C5BB8", "#3B7D4F", "#C6871F", "#7B4FA8", "#C63B5A", "#0E7C86", "#8A6D3B"];

export default function PlacementStatsPage() {
  // Package distribution buckets (LPA)
  const packageDistribution = useMemo(() => [
    { range: "3–6", count: 142 },
    { range: "6–10", count: 98 },
    { range: "10–15", count: 64 },
    { range: "15–25", count: 38 },
    { range: "25+", count: 19 },
  ], []);

  // Branch-wise placement rate
  const branchStats = useMemo(() =>
    BRANCHES.map((b, i) => ({
      branch: b,
      placed: [92, 88, 76, 71, 68, 90, 82, 85][i] ?? 75,
    })), []);

  // Year-over-year trend
  const yoyTrend = useMemo(() => [
    { year: "2021", rate: 68, avg: 9.2 },
    { year: "2022", rate: 74, avg: 11.5 },
    { year: "2023", rate: 79, avg: 13.8 },
    { year: "2024", rate: 83, avg: 15.1 },
    { year: "2025", rate: 87, avg: 16.9 },
  ], []);

  // Top recruiters by openings
  const topRecruiters = useMemo(() =>
    [...COMPANIES].sort((a, b) => b.openings - a.openings).slice(0, 6)
      .map((c) => ({ name: c.name, openings: c.openings, color: c.color })), []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-accent" />
            Placement Statistics
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Live placement outcomes for your college. Updated after every drive.
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Placement rate" countTo={87} suffix="%" hint="Class of 2025" tone="sage" />
          <StatCard icon={Users} label="Students placed" countTo={361} hint="of 415 eligible" tone="blue" />
          <StatCard icon={IndianRupee} label="Highest package" countTo={44} prefix="₹" suffix=" LPA" hint="Microsoft" tone="amber" />
          <StatCard icon={Award} label="Average package" countTo={16.9} decimals={1} prefix="₹" suffix=" LPA" hint="+₹1.8 vs 2024" tone="coral" />
        </div>

        {/* Year-over-year trend */}
        <Reveal>
          <Card>
            <Card.Header>
              <h2 className="font-display italic text-2xl text-ink">Placement trend</h2>
              <p className="text-xs text-ink-3 mt-0.5">Placement rate and average package over 5 years</p>
            </Card.Header>
            <Card.Body>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={yoyTrend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" stroke="var(--ink-3)" fontSize={12} />
                    <YAxis stroke="var(--ink-3)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="rate" name="Placement %" stroke="#B8502D" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="avg" name="Avg LPA" stroke="#2C5BB8" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package distribution */}
          <Reveal>
            <Card>
              <Card.Header>
                <h2 className="font-display italic text-2xl text-ink">Package distribution</h2>
                <p className="text-xs text-ink-3 mt-0.5">Number of offers by CTC range (LPA)</p>
              </Card.Header>
              <Card.Body>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={packageDistribution} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="range" stroke="var(--ink-3)" fontSize={12} />
                      <YAxis stroke="var(--ink-3)" fontSize={12} />
                      <Tooltip
                        cursor={{ fill: "var(--surface-tint)" }}
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" name="Offers" radius={[6, 6, 0, 0]}>
                        {packageDistribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Reveal>

          {/* Top recruiters */}
          <Reveal delay={0.05}>
            <Card>
              <Card.Header>
                <h2 className="font-display italic text-2xl text-ink">Top recruiters</h2>
                <p className="text-xs text-ink-3 mt-0.5">By number of openings this season</p>
              </Card.Header>
              <Card.Body>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart layout="vertical" data={topRecruiters} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--ink-3)" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="var(--ink-3)" fontSize={11} width={80} />
                      <Tooltip
                        cursor={{ fill: "var(--surface-tint)" }}
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="openings" name="Openings" radius={[0, 6, 6, 0]}>
                        {topRecruiters.map((r, i) => (
                          <Cell key={i} fill={r.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Reveal>
        </div>

        {/* Branch-wise placement */}
        <Reveal>
          <Card>
            <Card.Header>
              <h2 className="font-display italic text-2xl text-ink">Branch-wise placement rate</h2>
              <p className="text-xs text-ink-3 mt-0.5">Percentage of students placed per branch</p>
            </Card.Header>
            <Card.Body>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={branchStats} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="branch" stroke="var(--ink-3)" fontSize={12} />
                    <YAxis stroke="var(--ink-3)" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: "var(--surface-tint)" }}
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="placed" name="Placed %" radius={[6, 6, 0, 0]} fill="#3B7D4F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  );
}
