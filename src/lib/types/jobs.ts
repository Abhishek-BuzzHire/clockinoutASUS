

export interface TemplateField {
  id: number;
  label: string,
  key: string,
  isCustom: Boolean;
  value?:string
}

export interface EmailTemplate {
  id: number,
  hrId: number,
  fields: TemplateField[],
  createdAt: string,
  updatedAt: string
}

export const DEFAULT_CANDIDATE_FIELDS: Omit<TemplateField, 'id'>[] = [
  { label: 'Name', key: 'name', isCustom: false },
  { label: 'Phone', key: 'phone', isCustom: false },
  { label: 'Email', key: 'email', isCustom: false },
  { label: 'Location', key: 'location', isCustom: false },
  { label: 'Experience', key: 'experience', isCustom: false },
  { label: 'Current CTC', key: 'currentCTC', isCustom: false },
  { label: 'Expected CTC', key: 'expectedCTC', isCustom: false },
  { label: 'Current Company', key: 'currentCompany', isCustom: false },
  { label: 'Notice Period', key: 'noticePeriod', isCustom: false },
  { label: 'Skills', key: 'skills', isCustom: false },
]


export interface Client {
  id: number;
  name: string;
  location: string;
  contactPerson: string;
  contactPersonNumber: string;
  industry: string;
}

export interface HR {
  id: number;
  clientId: number;
  name: string;
  email: string;
  designation: string;
  number: string;
}

export interface ClientWithHRs extends Client {
  hrs: HR[];
}

export interface HRWithClient extends HR {
  client: Client;
}

export interface HRWithTemplates extends HR {
  templates: EmailTemplate[];
  client: Client;
}

export interface TemplateWithHR extends EmailTemplate {
  hr: HR | null;
}

export interface Job {
    id: number;
    department: string;
    title: string;
    candidates: {
        total: number;
        new: number;
    };
    location: string;
    type: string;
    status: string; // tighten if possible
    client: string;
    jobStatus: string; // union instead of generic string
}

interface JobDetails {
    location: string,
    type: string,
    description: string
}

export interface JobData {
    jobTitle: string,
    jobDetails: JobDetails
}

export type Candidate = {
    id: number,
    name: string,
    pipelineStatus: string,
    dateApplied: Date | string,
    photo: string
    email: string,
    phone: string,
    sourcedBy: string,
    location: string,
    currentCompany: string,
    currentJob: string,
    appliedFor: string,
    experience: string,
    education: string,
    skills: string[],
    currentCTC: string,
}