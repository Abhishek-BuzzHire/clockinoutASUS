import {
  ReferralFormData,
  BasicInfo,
  WorkExperience,
  Education,
  Skill,
} from "@/lib/types/ReferalTypes/referalindex";

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