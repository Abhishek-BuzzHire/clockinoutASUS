// ─── Enums ────────────────────────────────────────────────────────────────────

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";

export type PipelineStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type LanguageProficiency = "basic" | "conversational" | "fluent" | "native";

// ─── Sub-entities ─────────────────────────────────────────────────────────────

export interface BasicInfo {
  firstName:  string | null;
  lastName:   string | null;
  email:      string | null;
  phone:      string | null;
  location:   string | null;
  profile_experience: {
    years: number | null;
    months: number | null;
  };
  current_designation: string | null;
  current_company: string | null;
  current_ctc: string | null;
  expected_ctc: string | null;
  notice_period_days: number | null;  
  summary:string | null;
}

export interface WorkExperience {
  id:             string;
  jobTitle:       string | null;
  company:        string | null;
  location:       string | null;
  employmentType: EmploymentType | null;
  startDate:      string | null;
  endDate:        string | null;
  isCurrent:      boolean;
  description:    string | null;
}

export interface Education {
  id:           string;
  degree:       string | null;
  fieldOfStudy: string | null;
  institution:  string | null;
  location:     string | null;
  startYear:    string | null;
  endYear:      string | null;
  grade:        string | null;
  activities:   string | null;
}

export interface Skill {
  skill_id:       string;
  skill_name:     string;
}

export interface Certification {
  id:            string;
  name:          string | null;
  issuer:        string | null;
  issueDate:     string | null;
  expiryDate:    string | null;
  credentialUrl: string | null;
}

export interface Language {
  id:          string;
  name:        string | null;
  proficiency: LanguageProficiency | null;
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export interface ReferralFormData {
  jobId:          string | null;
  referredBy:     string | null;
  referralNote:   string | null;
  resumeFileUrl:  string | null;
  basicInfo:      BasicInfo;
  experience:     WorkExperience[];
  education:      Education[];
  skills:         Skill[];
  certifications: Certification[];
  languages:      Language[];
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface ReferralRecord extends ReferralFormData {
  id:            string;
  createdAt:     string;
  updatedAt:     string;
  pipelineStage: PipelineStage;
  status:        "pending" | "active" | "archived";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?: string;
}

export interface ResumeParseResponse {
  success: boolean;
  data:    Partial<ReferralFormData> | null;
  error?:  string;
}

export type FormSectionId =
  | "basic"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "referral-meta";

export interface FormSection {
  id:          FormSectionId;
  label:       string;
  icon:        string;
  description: string;
}



