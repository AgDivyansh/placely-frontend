import { resolveEligibility } from "./eligibilityEngine";

/**
 * Recommendations engine.
 *
 * Scoring (out of 100):
 *   +40 if fully eligible
 *   +25 if partially eligible (proportional)
 *   +20 if same industry as a company the student already applied to
 *   +10 if same package band (±3 LPA)
 *   +10 if location matches student.city
 *
 * Engineering: pure function, easily testable, swap with ML model later.
 */
export function recommendJobs({ user, jobs, applications, companies, limit = 4 }) {
  if (!user) return [];

  // Industries the user has interacted with
  const appliedCompanyIds = new Set(applications.map((a) => a.companyId));
  const interestedIndustries = new Set(
    Array.from(appliedCompanyIds)
      .map((cid) => companies.find((c) => c.id === cid)?.industry)
      .filter(Boolean)
  );

  // Average package of past applications
  const avgAppliedPackage = (() => {
    const pkgs = applications
      .map((a) => jobs.find((j) => j.id === a.jobId)?.package)
      .filter(Boolean);
    if (pkgs.length === 0) return null;
    return pkgs.reduce((s, p) => s + p, 0) / pkgs.length;
  })();

  // Score each non-applied job
  const scored = jobs
    .filter((j) => !appliedCompanyIds.has(j.companyId)) // exclude already-applied companies
    .map((j) => {
      const company = companies.find((c) => c.id === j.companyId);
      const elig = resolveEligibility(user, j);

      let score = 0;
      // Eligibility weight
      if (elig.eligible) score += 40;
      else score += Math.round(25 * (elig.passed / elig.total));

      // Same industry as past applications
      if (interestedIndustries.has(company?.industry)) score += 20;

      // Similar package band
      if (avgAppliedPackage && Math.abs(j.package - avgAppliedPackage) <= 3) {
        score += 10;
      }

      // Location match
      if (user.city && j.location?.toLowerCase().includes(user.city.toLowerCase())) {
        score += 10;
      }

      return { job: j, score, eligibility: elig };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
