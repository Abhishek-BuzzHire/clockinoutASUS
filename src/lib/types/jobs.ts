// ─── Email Templates ────────────────────────────────────────────────────────

export interface TemplateField {
    id: number;
    label: string;
    key: string;
    isCustom: boolean;
    value?: string;
}

export interface EmailTemplate {
    id: number;
    hrId: number;
    fields: TemplateField[];
    createdAt: string;
    updatedAt: string;
}

export interface TemplateWithHR extends EmailTemplate {
    hr: HR | null;
}

export const DEFAULT_CANDIDATE_FIELDS: Omit<TemplateField, "id">[] = [
    { label: "Name",            key: "name",           isCustom: false },
    { label: "Phone",           key: "phone",          isCustom: false },
    { label: "Email",           key: "email",          isCustom: false },
    { label: "Location",        key: "location",       isCustom: false },
    { label: "Experience",      key: "experience",     isCustom: false },
    { label: "Current CTC",     key: "currentCTC",     isCustom: false },
    { label: "Expected CTC",    key: "expectedCTC",    isCustom: false },
    { label: "Current Company", key: "currentCompany", isCustom: false },
    { label: "Notice Period",   key: "noticePeriod",   isCustom: false },
    { label: "Skills",          key: "skills",         isCustom: false },
];


// ─── Client ──────────────────────────────────────────────────────────────────

export interface Client {
    client_id: number;
    client_name: string;
    client_location:string
    client_industry: string;
    created_at: string;
}

export interface Contact {
    contact_id?: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    contact_role?: string;
}

export interface ClientWithHRs extends Client {
    hrs: HR[];
    contacts: Contact[];
}

export interface ClientPayload {
    client_name: string;
    client_industry: string;
}

export interface ContactPayload {
    client_id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    contact_role?: string;
}


// ─── HR ──────────────────────────────────────────────────────────────────────

export interface HR {
    id: number;
    clientId: number;
    name: string;
    email: string;
    designation: string;
    number: string;
}

export interface HRWithClient extends HR {
    client: Client;
}

export interface HRWithTemplates extends HR {
    templates: EmailTemplate[];
    client: Client;
}


// ─── Jobs ────────────────────────────────────────────────────────────────────

export interface JobContact {
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    contact_role?: string;
}

export interface JobHR {
    name: string;
    designation: string;
    email: string;
}

export interface Job {
    job_id: number;
    job_overview: string;
    job_title: string;
    job_location: string;
    job_type: string;
    job_status: string;
    client_name: string;
    client_id: string;
    total_candidates: number;
    new_candidates: number;
    job_qualification?: string[];
    job_responsibilities?: string[];
    skill_ids?: number[];
    job_min_exp?: string;
    job_max_exp?: string;
    contacts?: JobContact[];
    hrs?: JobHR[];
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export type PipelineStage = {
    name: string;
    order: number;
    is_final: boolean;
};

export type JobPipelinePayload = {
    job_id: number;
    stages: PipelineStage[];
};

// ─── Job Details ─────────────────────────────────────────────────────────────

export interface JobDetails {
    location: string;
    type: string;
    description: string;
}

export interface JobData {
    jobTitle: string;
    jobDetails: JobDetails;
}


// ─── Candidates ──────────────────────────────────────────────────────────────

export interface Candidate {
    id: number;
    name: string;
    pipelineStatus: string;
    dateApplied: Date | string;
    photo: string;
    email: string;
    phone: string;
    sourcedBy: string;
    location: string;
    currentCompany: string;
    currentJob: string;
    appliedFor: string;
    experience: string;
    education: string;
    skills: string[];
    currentCTC: string;
}