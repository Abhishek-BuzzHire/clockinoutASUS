import {
  ReferralFormData,
  BasicInfo,
  WorkExperience,
  Education,
  Skill,
} from "@/lib/types/ReferalTypes/referalindex";
import { Candidate } from "../jobs";

// ─── API Types ─────────────────────────────────

interface ApiParsedData {
  basic_info: any;
  experiences: any[];
  educations: any[];
  skills: any[];
  resume: { file_url: string | null };
}

// ─── Mappers ───────────────────────────────────

function mapBasicInfo(api: any): BasicInfo {
  return {
  firstName: api?.first_name ?? null,
  lastName: api?.last_name ?? null,
  email: api?.email ?? null,
  phone: api?.phone ?? null,
  location: api?.current_location ?? null,
  summary: api?.summary ?? null,  
  profile_experience: { years: api?.profile_experience?.years ?? null, months: api?.profile_experience?.months ?? null },
  current_designation: api?.current_designation ?? null,
  current_company: api?.current_company ?? null,
  current_ctc: api?.current_ctc ?? null,
  expected_ctc: api?.expected_ctc ?? null,
  notice_period_days: api?.notice_period_days ?? null

 
};
}

function mapExperiences(api: any[]): WorkExperience[] {
  if (!Array.isArray(api)) return [];

  return api.map((e, i) => ({
    id: String(i + 1),
    jobTitle: e?.designation ?? null,
    company: e?.company_name ?? null,
    location: e?.location ?? null,
    employmentType: e?.employment_type ?? null,
    startDate: e?.start_date ?? null,
    endDate: e?.end_date ?? null,
    isCurrent: e?.is_current ?? false,
    description: e?.description ?? null,
  }));
}

function mapEducations(api: any[]): Education[] {
  if (!Array.isArray(api)) return [];

  return api.map((e, i) => ({
    id: String(i + 1),
    degree: e?.degree ?? null,
    fieldOfStudy: e?.field_of_study ?? null,
    institution: e?.institution_name ?? null,
    location: e?.location ?? null,
    startYear: e?.start_year ?? null,
    endYear: e?.end_year ?? null,
    grade: e?.grade ?? null,
    activities: null,
  }));
}

function mapSkills(api: any[]): Skill[] {
  if (!Array.isArray(api)) return [];

  return api.map((s) => ({
    skill_id: String(s.skill_id),
    skill_name: s.skill_name,
   
  }));
}

// ─── MAIN EXPORT ───────────────────────────────

export function mapParsedResumeToForm(raw: ApiParsedData): Partial<ReferralFormData> {
  return {
    basicInfo: mapBasicInfo(raw.basic_info),
    experience: mapExperiences(raw.experiences),
    education: mapEducations(raw.educations),
    skills: mapSkills(raw.skills),
    resumeFileUrl: raw.resume?.file_url ?? null,
  };
}


export const stagesData = ['Screening', 'Test', 'Interview', 'Rejected', 'Hired']

export function mapApiToCandidate(raw: any): Candidate {
    return {
        id: String(raw?.id ?? raw?.candidate_id ?? ""),
        name: raw?.candidate_name ?? raw?.full_name ?? "Unknown",
        email: raw?.candidate_email ?? raw?.primary_email ?? "",
        phone: raw?.candidate_phone ?? raw?.primary_phone ?? "",
        photo: raw?.photo || "/avatar.png",
        currentJob: raw?.current_designation ?? raw?.currentJob ?? "",
        currentCompany: raw?.headline ?? raw?.current_company ?? "",
        currentCTC: raw?.current_salary_amount
            ? `${raw?.salary_currency ?? ""} ${raw.current_salary_amount}`
            : raw?.expectedCTC || "N/A",
        education: raw?.education ?? "N/A",
        experience:
            raw?.total_experience_months != null
                ? `${Math.floor(raw.total_experience_months / 12)} yrs ${raw.total_experience_months % 12
                } mo`
                : raw?.experience || "N/A",
        location: raw?.location
            ? typeof raw.location === "string"
                ? raw.location
                : [
                    raw.location?.city,
                    raw.location?.state,
                    raw.location?.country,
                ]
                    .filter(Boolean)
                    .join(", ")
            : raw?.candidate_location || "N/A",
        skills: Array.isArray(raw?.skills)
            ? raw.skills.map((s: any) => s?.name ?? s?.skill_name ?? s)
            : [],
        sourcedBy: raw?.sourced_by ?? raw?.source ?? "N/A",
        dateApplied: raw?.created_at ?? raw?.dateApplied ?? null,
        pipelineStatus:
            typeof raw?.pipeline_status === "string"
                ? raw.pipeline_status
                : raw?.pipeline_status?.name ?? raw?.pipelineStatus ?? stagesData[0],
    };
}