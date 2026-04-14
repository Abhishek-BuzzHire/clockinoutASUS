import { Certification, Education, Language, ReferralFormData, Skill, WorkExperience } from "./referalindex";

// Use crypto.randomUUID() — available in Next.js edge + node runtimes
const uid = () => crypto.randomUUID();

export const emptyExperience = (): WorkExperience => ({
  id: uid(), jobTitle: null, company: null, location: null,
  employmentType: null, startDate: null, endDate: null,
  isCurrent: false, description: null,
});

export const emptyEducation = (): Education => ({
  id: uid(), degree: null, fieldOfStudy: null, institution: null,
  location: null, startYear: null, endYear: null, grade: null, activities: null,
});

export const emptySkill = (): Skill => ({
  skill_id: uid(), skill_name: "",
});

export const emptyCertification = (): Certification => ({
  id: uid(), name: null, issuer: null, issueDate: null,
  expiryDate: null, credentialUrl: null,
});

export const emptyLanguage = (): Language => ({
  id: uid(), name: null, proficiency: null,
});

export const defaultFormData = (): ReferralFormData => ({
  jobId: null, referredBy: null, referralNote: null, resumeFileUrl: null,
  basicInfo: {
    firstName: null, lastName: null, email: null, phone: null,
    location: null,
    profile_experience: { years: null, months: null },
    current_designation: null,
    current_company: null,
    current_ctc: null,
    expected_ctc: null,
    notice_period_days: null,
    summary: null,
  },
  experience: [], education: [], skills: [],
  certifications: [], languages: [],
});
