import type { CandidateRec } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, IndianRupee, CalendarDays, FileText, Eye, Phone, Mail, GraduationCap, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';

interface EmployeeCardProps {
  employee: CandidateRec;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, subtitle: React.ReactNode }> = ({ icon, title, subtitle }) => (
  <div className="flex-1 min-w-[130px] p-3 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start gap-2.5">
    <div className="shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-semibold text-slate-500 mb-0.5">{title}</span>
      <span className="text-[13px] font-bold text-slate-800 leading-snug">{subtitle}</span>
    </div>
  </div>
);

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const getCvUrl = ():string | null => {
    if (!employee.cv_url) return null;
    if(/^https?:\/\//i.test(employee.cv_url)) {
      return employee.cv_url;
    }
    return `${API_URL}/api/resumes/${employee.cv_url}`;
  };

  const cvDownloadUrl = getCvUrl();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Determine avatar background color based on name length to give a slight variety (matching screenshot's blue and purple)
  const isEven = employee.name.length % 2 === 0;
  const avatarBg = isEven ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";

  return (
    <Card className="w-full mt-6 rounded-3xl shadow-sm border border-slate-200 bg-white overflow-hidden p-6">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column */}
        <div className="w-full md:w-[280px] shrink-0 flex flex-col items-center">
          <div className={`h-24 w-24 rounded-full ${avatarBg} flex items-center justify-center font-bold text-3xl mb-3`}>
            {getInitials(employee.name)}
          </div>
          
          <div className="flex items-center gap-1.5 mb-4">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-slate-600">Available</span>
          </div>
          
          <div className="text-center w-full mb-6">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-1">
              {employee.name}
            </h2>
            <p className="text-blue-600 font-semibold text-sm mb-2">{employee.job_title}</p>
            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {employee.location || "Not specified"}
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-2.5 text-xs text-slate-600 font-medium mb-6 px-4">
             <div className="flex items-center gap-2.5">
               <Phone className="h-3.5 w-3.5 text-blue-500" /> {employee.phone}
             </div>
             <div className="flex items-center gap-2.5">
               <Mail className="h-3.5 w-3.5 text-blue-500" /> {employee.email}
             </div>
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold h-11">
            View Full Profile {'>'}
          </Button>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Actions Row */}
          <div className="flex justify-end items-center gap-2 mb-4">
             {cvDownloadUrl ? (
                <Button asChild variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold h-9 px-4 text-xs">
                  <a href={cvDownloadUrl} target='_blank' rel="noopener noreferrer">
                    <Eye className='mr-1.5 h-3.5 w-3.5' /> Preview CV
                  </a>
                </Button>
              ) : (
                 <Button variant="outline" className="rounded-full border-slate-200 text-slate-400 font-semibold h-9 px-4 text-xs" disabled>
                   <Eye className='mr-1.5 h-3.5 w-3.5' /> CV Not Available
                 </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-500 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
          </div>

          {/* Info Cards Row */}
          <div className="flex flex-wrap xl:flex-nowrap gap-3 mb-6">
             <InfoCard 
               icon={<CalendarDays className="h-4 w-4 text-blue-500" />} 
               title="Experience" 
               subtitle={`${employee.total_experience_years || 0} Yrs`}
             />
             <InfoCard 
               icon={<GraduationCap className="h-4 w-4 text-emerald-500" />} 
               title="Education" 
               subtitle={employee.education && Array.isArray(employee.education) && employee.education.length > 0 ? employee.education.join(", ") : (typeof employee.education === 'string' && employee.education ? employee.education : <span className="text-red-500 font-medium">No Education listed.</span>)}
             />
             <InfoCard 
               icon={<IndianRupee className="h-4 w-4 text-slate-400" />} 
               title="Current CTC" 
               subtitle={
                 <span className={!employee.salary || (employee.salary as any) === "None" ? "text-red-500 font-medium" : "text-slate-800"}>
                   {!employee.salary || (employee.salary as any) === "None" ? "Not submit by HR" : `${employee.salary} LPA`}
                 </span>
               }
             />
             <InfoCard 
               icon={<Briefcase className="h-4 w-4 text-blue-500" />} 
               title="Current Company" 
               subtitle={employee.current_company_name || <span className="text-red-500 font-medium">Not specified</span>}
             />
             <InfoCard 
               icon={<MapPin className="h-4 w-4 text-amber-500" />} 
               title="Location" 
               subtitle={employee.location || "Not specified"}
             />
          </div>

          {/* Skills Section */}
          <div className="flex flex-col gap-2.5 mb-6">
             <h3 className="font-extrabold text-slate-900 text-[13px]">Skills</h3>
             <div className="flex flex-wrap gap-2">
               {(showAllSkills ? employee.skills : employee.skills.slice(0, 7)).map((skill) => (
                 <div key={skill} className="px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold hover:bg-slate-100 transition-colors cursor-default">
                   {skill}
                 </div>
               ))}
               {!showAllSkills && employee.skills.length > 7 && (
                 <button 
                   onClick={() => setShowAllSkills(true)}
                   className="px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                 >
                   + {employee.skills.length - 7} more
                 </button>
               )}
               {showAllSkills && employee.skills.length > 7 && (
                 <button 
                   onClick={() => setShowAllSkills(false)}
                   className="px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                 >
                   Show less
                 </button>
               )}
             </div>
          </div>

          {/* Footer Section (Green Bar) */}
          <div className="mt-auto bg-[#F0FDF4] rounded-2xl p-4 flex flex-wrap gap-6 items-center border border-green-50">
            <div className="flex items-start gap-2.5 min-w-[200px]">
              <FileText className="h-4 w-4 text-emerald-500 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Resume Uploaded</span>
                <span className="text-[13px] font-bold text-slate-800">
                  {format(new Date(employee.created_at), "dd MMM yyyy, hh:mm a")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 min-w-[150px]">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Source</span>
                <span className="text-[13px] font-bold text-slate-800">
                  {employee.source}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 mb-0.5">Candidate ID</span>
                <span className="text-[13px] font-bold text-slate-800">
                  {employee.id ? `BZC-2026-${String(employee.id).padStart(6, '0')}` : "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Card>
  )
}
