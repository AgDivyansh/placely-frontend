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
 * @param {Object} student - { cgpa, tenth, twelfth, branch, backlogs }
 * @param {Object} job - { eligibility: { minCgpa, minTenth, minTwelfth, branches[], maxBacklogs } }
 * @returns {{ eligible, passed, total, checks, reasons }}
 */
export function checkEligibility(student, job) {
  const eg = job.eligibility || {};
  const checks = [
    {
      name: "CGPA",
      required: `${eg.minCgpa}+`,
      actual: student.cgpa?.toFixed(2),
      pass: (student.cgpa ?? 0) >= (eg.minCgpa ?? 0),
    },
    {
      name: "10th %",
      required: `${eg.minTenth}%+`,
      actual: `${student.tenth ?? 0}%`,
      pass: (student.tenth ?? 0) >= (eg.minTenth ?? 0),
    },
    {
      name: "12th %",
      required: `${eg.minTwelfth}%+`,
      actual: `${student.twelfth ?? 0}%`,
      pass: (student.twelfth ?? 0) >= (eg.minTwelfth ?? 0),
    },
    {
      name: "Branch",
      required: (eg.branches || []).join(", "),
      actual: student.branch,
      pass: (eg.branches || []).includes(student.branch),
    },
    {
      name: "Backlogs",
      required: `≤ ${eg.maxBacklogs}`,
      actual: String(student.backlogs ?? 0),
      pass: (student.backlogs ?? 0) <= (eg.maxBacklogs ?? 0),
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
