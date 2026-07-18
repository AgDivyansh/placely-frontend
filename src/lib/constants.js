/** Application stages — order matters for the stepper component */
export const STAGES = [
  { key: "applied", label: "Applied" },
  { key: "shortlist", label: "Shortlisted" },
  { key: "oa", label: "Online assessment" },
  { key: "tech", label: "Tech interview" },
  { key: "hr", label: "HR interview" },
  { key: "offer", label: "Offered" },
];

export const STAGE_INDEX = STAGES.reduce((acc, s, i) => {
  acc[s.key] = i;
  return acc;
}, {});

/** Branches typically used in eligibility filters */
export const BRANCHES = ["CSE", "ECE", "EEE", "ME", "CE", "IT", "AIDS", "AIML"];

/** Industry categories for filter chips */
export const INDUSTRIES = [
  "Software",
  "Fintech",
  "E-commerce",
  "Consulting",
  "Banking",
  "Product",
];

/** Demo credentials — for the login screen hint */
export const DEMO_CREDS = {
  student: { email: "divyansh@gmail.com", password: "any-password" },
  alumni: { email: "alumni@placely.com", password: "placely2026" },
  admin: { email: "divyansh@admin.com", password: "any-password" },
};
