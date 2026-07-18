// ============================================================
// MOCK DATA LAYER
// ============================================================
// Engineering note: This file mimics the shape of a real REST
// API response. When wiring a backend, replace `import {...}` with
// `apiClient.get(...)` calls and everything else stays the same.
// ============================================================

export const COMPANIES = [
  { id: "c1", name: "Stripe", initial: "S", color: "#635BFF", industry: "Fintech", rating: 4.8, avgPackage: 32, visits: 4, difficulty: "Hard", openings: 12 },
  { id: "c2", name: "Razorpay", initial: "R", color: "#02BCE9", industry: "Fintech", rating: 4.6, avgPackage: 18, visits: 6, difficulty: "Medium", openings: 24 },
  { id: "c3", name: "Zomato", initial: "Z", color: "#E23744", industry: "E-commerce", rating: 4.2, avgPackage: 14, visits: 8, difficulty: "Medium", openings: 35 },
  { id: "c4", name: "Atlassian", initial: "A", color: "#0052CC", industry: "Software", rating: 4.7, avgPackage: 26, visits: 3, difficulty: "Hard", openings: 8 },
  { id: "c5", name: "Postman", initial: "P", color: "#FF6C37", industry: "Software", rating: 4.5, avgPackage: 22, visits: 5, difficulty: "Medium", openings: 16 },
  { id: "c6", name: "Swiggy", initial: "Sw", color: "#FC8019", industry: "E-commerce", rating: 4.3, avgPackage: 16, visits: 7, difficulty: "Medium", openings: 28 },
  { id: "c7", name: "Goldman Sachs", initial: "G", color: "#7399C6", industry: "Banking", rating: 4.6, avgPackage: 36, visits: 2, difficulty: "Hard", openings: 6 },
  { id: "c8", name: "Microsoft", initial: "M", color: "#0078D4", industry: "Software", rating: 4.8, avgPackage: 44, visits: 3, difficulty: "Hard", openings: 10 },
];

export const JOBS = [
  {
    id: "j1", companyId: "c2", role: "Software Engineer", package: 18, location: "Bengaluru",
    type: "Full-time", deadline: "2026-06-15", tags: ["High Package", "Dream Company"],
    description: "Build payment infrastructure used by millions of Indian merchants. Work on payment gateway optimization, fraud detection, and developer experience.",
    eligibility: { minCgpa: 7.5, minTenth: 75, minTwelfth: 75, branches: ["CSE", "IT", "ECE", "AIML"], maxBacklogs: 0 },
    rounds: ["Online assessment", "Technical round 1", "Technical round 2", "HR interview"],
  },
  {
    id: "j2", companyId: "c1", role: "Software Engineer Intern", package: 28, location: "Bengaluru",
    type: "Internship + PPO", deadline: "2026-06-10", tags: ["Dream Company", "High Package"],
    description: "6-month internship with strong PPO conversion. Work on Stripe's payment platform, building APIs used by millions of businesses globally.",
    eligibility: { minCgpa: 8.5, minTenth: 85, minTwelfth: 85, branches: ["CSE", "IT"], maxBacklogs: 0 },
    rounds: ["Online assessment", "Technical round 1", "Technical round 2", "System design", "Hiring manager"],
  },
  {
    id: "j3", companyId: "c5", role: "Frontend Developer", package: 16, location: "Bengaluru / Remote",
    type: "Full-time", deadline: "2026-06-22", tags: ["Remote OK"],
    description: "Build the most loved API platform UI. Strong React/TypeScript chops required. Work alongside designers to ship polished developer tools.",
    eligibility: { minCgpa: 7.0, minTenth: 70, minTwelfth: 70, branches: ["CSE", "IT", "ECE", "AIML", "AIDS"], maxBacklogs: 1 },
    rounds: ["Online assessment", "Technical round", "Design + culture round"],
  },
  {
    id: "j4", companyId: "c3", role: "SDE-1", package: 14, location: "Gurgaon",
    type: "Full-time", deadline: "2026-06-18", tags: ["Mass Hiring"],
    description: "Join the team building India's largest food-tech platform. Work on growth engineering, supply, or restaurant tech.",
    eligibility: { minCgpa: 6.5, minTenth: 65, minTwelfth: 65, branches: ["CSE", "IT", "ECE", "EEE", "ME", "AIDS", "AIML"], maxBacklogs: 2 },
    rounds: ["Online assessment", "Technical round 1", "Technical round 2", "Bar raiser"],
  },
  {
    id: "j5", companyId: "c7", role: "Software Engineer Analyst", package: 28, location: "Bengaluru",
    type: "Full-time", deadline: "2026-06-08", tags: ["Dream Company", "High Package"],
    description: "Build trading platforms and risk systems used globally. Strong fundamentals in DSA and system design required.",
    eligibility: { minCgpa: 9.0, minTenth: 90, minTwelfth: 90, branches: ["CSE", "IT"], maxBacklogs: 0 },
    rounds: ["Aptitude test", "Coding round", "Technical interview 1", "Technical interview 2", "HR + Behavioral"],
  },
  {
    id: "j6", companyId: "c8", role: "SDE Intern", package: 32, location: "Hyderabad",
    type: "Internship + PPO", deadline: "2026-06-12", tags: ["Dream Company"],
    description: "Microsoft IDC internship with PPO. Work on Azure, M365, or Bing teams. Mentorship from senior engineers.",
    eligibility: { minCgpa: 8.0, minTenth: 80, minTwelfth: 80, branches: ["CSE", "IT", "ECE", "AIML"], maxBacklogs: 0 },
    rounds: ["Online assessment", "Technical interview 1", "Technical interview 2", "AA round"],
  },
  {
    id: "j7", companyId: "c4", role: "Software Engineer", package: 26, location: "Bengaluru",
    type: "Full-time", deadline: "2026-06-20", tags: ["High Package"],
    description: "Build Jira and Confluence. Modern stack, strong engineering culture, generous benefits.",
    eligibility: { minCgpa: 8.0, minTenth: 80, minTwelfth: 80, branches: ["CSE", "IT", "ECE"], maxBacklogs: 0 },
    rounds: ["Online assessment", "Pair programming", "System design", "Values interview"],
  },
  {
    id: "j8", companyId: "c6", role: "Associate SDE", package: 12, location: "Bengaluru",
    type: "Full-time", deadline: "2026-06-25", tags: ["Mass Hiring"],
    description: "Build the delivery and growth platform serving 200M+ orders. Fast-paced product engineering.",
    eligibility: { minCgpa: 7.0, minTenth: 70, minTwelfth: 70, branches: ["CSE", "IT", "ECE", "EEE", "ME", "AIML", "AIDS"], maxBacklogs: 1 },
    rounds: ["Online assessment", "Technical round 1", "Technical round 2", "HR"],
  },
];

export const ALUMNI = [
  { id: "a1", name: "Aditya Sharma", companyId: "c1", role: "SWE", gradYear: 2023, verified: true, rating: 4.9, available: "online", expertise: ["DSA", "System design", "Stripe culture"] },
  { id: "a2", name: "Priya Menon", companyId: "c2", role: "Senior SWE", gradYear: 2021, verified: true, rating: 4.8, available: "online", expertise: ["Backend", "Payments", "Razorpay interviews"] },
  { id: "a3", name: "Karthik Iyer", companyId: "c8", role: "SDE-II", gradYear: 2022, verified: true, rating: 4.7, available: "busy", expertise: ["Azure", "System design", "Microsoft IDC"] },
  { id: "a4", name: "Sneha Patel", companyId: "c3", role: "SDE-1", gradYear: 2024, verified: true, rating: 4.6, available: "online", expertise: ["Frontend", "React", "Zomato hiring"] },
  { id: "a5", name: "Rohan Khanna", companyId: "c7", role: "Analyst", gradYear: 2023, verified: true, rating: 4.9, available: "online", expertise: ["DSA", "Quant", "Banking interviews"] },
  { id: "a6", name: "Meera Reddy", companyId: "c4", role: "Senior SWE", gradYear: 2020, verified: true, rating: 4.8, available: "online", expertise: ["Frontend", "Atlassian culture"] },
  { id: "a7", name: "Vikram Singh", companyId: "c5", role: "SWE", gradYear: 2023, verified: true, rating: 4.5, available: "busy", expertise: ["Frontend", "Postman APIs"] },
  { id: "a8", name: "Ananya Bose", companyId: "c6", role: "SDE-II", gradYear: 2022, verified: true, rating: 4.7, available: "online", expertise: ["Backend", "Growth", "Swiggy hiring"] },
];

export const DEMO_STUDENT = {
  id: "u1",
  name: "Divyansh Sharma",
  email: "divyansh@gmail.com", // permanent personal email
  collegeEmail: "21cs1234@svce.edu", // college email — verified badge
  phone: "+91 98765 43210",
  rollNo: "21CS1234",
  branch: "CSE",
  year: 4,
  graduationYear: 2027, // future → still a current student, not yet alumni
  isAlumni: false,
  cgpa: 8.2,
  tenth: 89,
  twelfth: 84,
  backlogs: 0,
  college: "Sri Venkateswara College of Engineering",
  city: "Bengaluru",
  avatar: null,
  resume: "divyansh_resume.pdf",
  skills: ["React", "Node.js", "Python", "DSA", "PostgreSQL"],
  socialLinks: {
    github: "https://github.com/divyansh",
    linkedin: "https://linkedin.com/in/divyansh",
    leetcode: "https://leetcode.com/u/divyansh",
  },
  projects: [
    { title: "Placely", description: "Campus placement portal for Indian colleges.", url: "https://github.com/divyansh/placely", tech: ["React", "Node.js", "MongoDB"] },
  ],
  slug: "divyansh-sharma-a4f9",
  isPublic: false,
  resumes: [
    { id: "r1", name: "Software roles", filename: "divyansh_swe.pdf", isDefault: true },
    { id: "r2", name: "Product roles", filename: "divyansh_pm.pdf", isDefault: false },
  ],
};

export const DEMO_ADMIN = {
  id: "u2",
  name: "Dr. Anita Verma",
  email: "divyansh@admin.com",
  phone: "+91 98123 45670",
  role: "Training & Placement Officer",
  department: "All branches",
  college: "Sri Venkateswara College of Engineering",
  city: "Bengaluru",
  avatar: null,
};

// A graduated student — persona resolves to "alumni" via isAlumni. Used by the
// mock login so the alumni experience is demoable without a backend.
export const DEMO_ALUMNI = {
  id: "u3",
  name: "Aditya Sharma",
  email: "alumni@placely.com",
  phone: "+91 90000 11122",
  role: "student",
  branch: "CSE",
  graduationYear: 2023,
  isAlumni: true,
  currentCompany: "Stripe",
  college: "Sri Venkateswara College of Engineering",
  city: "Bengaluru",
  avatar: null,
  skills: ["System Design", "DSA", "Payments"],
};

export const INITIAL_APPLICATIONS = [
  { id: "ap1", jobId: "j2", companyId: "c1", currentStage: "tech", appliedAt: "2026-05-02" },
  { id: "ap2", jobId: "j3", companyId: "c5", currentStage: "shortlist", appliedAt: "2026-05-06" },
  { id: "ap3", jobId: "j1", companyId: "c2", currentStage: "oa", appliedAt: "2026-05-08" },
];

export const INITIAL_NOTIFICATIONS = [
  { id: "n1", group: "Today", title: "OA scheduled — Razorpay", body: "Tomorrow at 10:00 AM. Link emailed.", read: false, time: "2h ago", kind: "info" },
  { id: "n2", group: "Today", title: "New job: Microsoft SDE Intern", body: "You meet 5 of 5 criteria.", read: false, time: "5h ago", kind: "success" },
  { id: "n3", group: "Earlier", title: "Shortlisted — Postman", body: "Tech round dates coming soon.", read: true, time: "yesterday", kind: "success" },
  { id: "n4", group: "Earlier", title: "Profile incomplete", body: "Upload your latest resume to apply to dream companies.", read: true, time: "2d ago", kind: "warning" },
];

/** Interview experience snippets — keyed by companyId */
export const INTERVIEW_EXPERIENCES = {
  c1: [
    { author: "Aditya Sharma (2023)", content: "OA was 2 medium + 1 hard LeetCode. Tech rounds focused on real-world API design. They care a LOT about trade-offs." },
    { author: "Anonymous senior", content: "System design round was the hardest — pricing engine. Be ready to discuss CAP, sharding, idempotency." },
  ],
  c2: [
    { author: "Priya Menon (2021)", content: "Payments-focused questions are common. They asked me to design a refund flow with edge cases." },
    { author: "Anonymous", content: "DSA round was easier than expected. The culture round really mattered — they ask why fintech, why Razorpay." },
  ],
  c7: [
    { author: "Rohan Khanna (2023)", content: "Pure DSA + math. Brush up on probability and combinatorics. 4 rounds in a single day — prepare for fatigue." },
  ],
  c8: [
    { author: "Karthik Iyer (2022)", content: "OOP fundamentals are key. They love trick questions on virtual functions and memory management." },
  ],
};
