/**
 * Eligibility engine — the algorithmic core of Placely.
 *
 * Engineering notes:
 * - Pure function (no side effects, no state). Easy to unit-test.
 * - Returns structured output so multiple UI surfaces (apply button,
 *   eligibility badge, smart CTA, detail page tab) can render from the
 *   same source of truth.
 * - Runs in O(k) where k = number of criteria. Negligible.
 *
 * Field-name note: the real backend returns academic percentages as
 * `tenthPercent`/`twelfthPercent` (see auth.service toPublicUser), while the
 * mock data uses `tenth`/`twelfth`. We read the API name first and fall back
 * to the mock name so this stays a single source of truth in both modes and
 * produces verdicts identical to the server engine (backend utils/eligibility).
 *
 * @param {Object} student - { cgpa, tenthPercent|tenth, twelfthPercent|twelfth, branch, backlogs }
 * @param {Object} job - { eligibility: { minCgpa, minTenth, minTwelfth, branches[], maxBacklogs } }
 * @returns {{ eligible, passed, total, checks, reasons }}
 */
export function checkEligibility(student, job) {
  const eg = job.eligibility || {};
  const tenth = student.tenthPercent ?? student.tenth ?? 0;
  const twelfth = student.twelfthPercent ?? student.twelfth ?? 0;
  const branches = eg.branches || [];
  const maxBacklogs = eg.maxBacklogs ?? 99; // absent = unrestricted, matches backend schema default
  const checks = [
    {
      name: "CGPA",
      required: `${eg.minCgpa ?? 0}+`,
      actual: (student.cgpa ?? 0).toFixed(2),
      pass: (student.cgpa ?? 0) >= (eg.minCgpa ?? 0),
    },
    {
      name: "10th %",
      required: `${eg.minTenth ?? 0}%+`,
      actual: `${tenth}%`,
      pass: tenth >= (eg.minTenth ?? 0),
    },
    {
      name: "12th %",
      required: `${eg.minTwelfth ?? 0}%+`,
      actual: `${twelfth}%`,
      pass: twelfth >= (eg.minTwelfth ?? 0),
    },
    {
      name: "Branch",
      required: branches.join(", ") || "Any",
      actual: student.branch,
      // Empty list = open to all branches (matches backend).
      pass: branches.length === 0 || branches.includes(student.branch),
    },
    {
      name: "Backlogs",
      required: `≤ ${maxBacklogs}`,
      actual: String(student.backlogs ?? 0),
      pass: (student.backlogs ?? 0) <= maxBacklogs,
    },
  ];
  const passed = checks.filter((c) => c.pass).length;
  return {
    eligible: passed === checks.length,
    passed,
    total: checks.length,
    checks,
    reasons: checks.filter((c) => !c.pass).map((c) => c.name),
  };
}

/**
 * resolveEligibility — pick the authoritative eligibility for a job.
 *
 * The real backend returns each job with `eligibility` already REPLACED by the
 * server-computed result ({ eligible, passed, checks, reasons }); the raw
 * criteria (minCgpa…) aren't in the payload. Recomputing here would read
 * undefined thresholds and wrongly mark everyone eligible. So when that
 * computed result is present (it has `.checks`), trust it; otherwise (mock
 * mode, where `eligibility` holds the criteria) compute locally.
 */
export function resolveEligibility(student, job) {
  if (job?.eligibility && Array.isArray(job.eligibility.checks)) {
    return job.eligibility;
  }
  return checkEligibility(student, job);
}
