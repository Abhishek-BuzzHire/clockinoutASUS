import type { CandidateRec } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, IndianRupee, CalendarDays, Eye, Phone, Mail, GraduationCap, MoreVertical, UserCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';

interface EmployeeCardProps {
  employee: CandidateRec;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, subtitle: React.ReactNode }> = ({ icon, title, subtitle }) => (
  <div className="flex-1 min-w-[140px] p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3 transition-colors hover:bg-slate-50">
    <div className="shrink-0 mt-0.5 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-medium text-slate-500 mb-0.5">{title}</span>
      <span className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2" title={typeof subtitle === 'string' ? subtitle : undefined}>{subtitle}</span>
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

  return (
    <Card className="w-full mt-4 rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden p-5 pb-0 transition-all hover:shadow-md">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}} />
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        
        {/* Left Column */}
        <div className="w-full md:w-[280px] shrink-0 flex flex-col items-start border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available</span>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight mb-1 truncate font-outfit" title={employee.name}>
              {employee.name}
            </h2>
            <p className="text-blue-600 font-bold text-sm mb-5 truncate" title={employee.job_title}>{employee.job_title}</p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-600 text-[13px] font-medium">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate" title={employee.location || "Not specified"}>{employee.location || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-[13px] font-medium">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate" title={employee.phone}>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-[13px] font-medium">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate" title={employee.email}>{employee.email}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 w-full pt-1">
            {cvDownloadUrl ? (
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold h-10 transition-colors shadow-sm">
                <a href={cvDownloadUrl} target='_blank' rel="noopener noreferrer">
                  <Eye className='mr-2 h-4 w-4' /> Preview CV
                </a>
              </Button>
            ) : (
              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-xl font-semibold h-10 cursor-not-allowed" disabled>
                <Eye className='mr-2 h-4 w-4' /> CV Not Available
              </Button>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Actions Row - Desktop Only */}
          <div className="hidden md:flex justify-end items-center mb-2 -mt-2">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
          </div>

          {/* Info Cards Row */}
          <div className="flex flex-wrap xl:flex-nowrap gap-3 mb-5 mt-1">
             <InfoCard 
               icon={<Briefcase className="h-4 w-4 text-purple-500" />} 
               title="Current Company" 
               subtitle={employee.current_company_name || <span className="text-slate-400 font-medium">N/A</span>}
             />
             <InfoCard 
               icon={<CalendarDays className="h-4 w-4 text-blue-500" />} 
               title="Experience" 
               subtitle={`${employee.total_experience_years || 0} Yrs`}
             />
             <InfoCard 
               icon={<GraduationCap className="h-4 w-4 text-emerald-500" />} 
               title="Education" 
               subtitle={employee.education && Array.isArray(employee.education) && employee.education.length > 0 ? employee.education.join(", ") : (typeof employee.education === 'string' && employee.education ? employee.education : <span className="text-slate-400 font-medium">N/A</span>)}
             />
             <InfoCard 
               icon={<IndianRupee className="h-4 w-4 text-slate-500" />} 
               title="Current CTC" 
               subtitle={
                 <span className={!employee.salary || (employee.salary as any) === "None" ? "text-slate-400 font-medium" : "text-slate-800"}>
                   {!employee.salary || (employee.salary as any) === "None" ? "Not submitted" : `${employee.salary} LPA`}
                 </span>
               }
             />
          </div>

          {/* Skills Section */}
          <div className="flex flex-col gap-2.5 mb-5 flex-1">
             <span className="text-[12px] font-bold text-slate-900 tracking-wide">Skills</span>
             <div className="flex flex-wrap gap-2">
               {(showAllSkills ? employee.skills : employee.skills.slice(0, 8)).map((skill) => (
                 <div key={skill} className="px-3.5 py-1.5 bg-[#F8FAFC] text-slate-700 border border-slate-200 rounded-lg text-[12px] font-semibold hover:bg-slate-100 transition-colors cursor-default">
                   {skill}
                 </div>
               ))}
               {!showAllSkills && employee.skills.length > 8 && (
                 <button 
                   onClick={() => setShowAllSkills(true)}
                   className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[12px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                 >
                   + {employee.skills.length - 8} more
                 </button>
               )}
               {showAllSkills && employee.skills.length > 8 && (
                 <button 
                   onClick={() => setShowAllSkills(false)}
                   className="px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[12px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                 >
                   Show less
                 </button>
               )}
             </div>
          </div>

        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-3 pb-3 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between -mx-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <UserCircle2 className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="text-[12px]">
            <span className="text-slate-500 font-medium mr-1">Source by</span>
            <span className="text-slate-800 font-bold">{employee.source}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{format(new Date(employee.created_at), "dd MMM yyyy, hh:mm a")}</span>
        </div>
      </div>
    </Card>
  )
}

