import type { CandidateRec } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, IndianRupee, CalendarDays, File, Eye, Phone, Mail, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface EmployeeCardProps {
  employee: CandidateRec;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const IconText: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode
}> = ({ icon, children }) => {
  return (
    <div className="flex items-center text-slate-600 text-sm font-medium">
      {React.cloneElement(icon, { className: `mr-2 h-4 w-4 stroke-blue-600 ${icon.props.className || ''}` })}
      <span>{children}</span>
    </div>
  )
}

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, subtitle: React.ReactNode, bgClass: string, textClass: string }> = ({ icon, title, subtitle, bgClass, textClass }) => (
  <div className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50 flex-1 min-w-[200px] hover:bg-slate-100/70 transition-colors">
    <div className={`p-2.5 rounded-full ${bgClass} ${textClass} mr-4`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-700 mb-0.5">{title}</span>
      <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{subtitle}</span>
    </div>
  </div>
)

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
  }

  const displayedSkills = showAllSkills ? employee.skills : employee.skills.slice(0, 15);

  return (
    <Card className="w-full mt-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col bg-white overflow-hidden hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0 border-2 border-blue-50">
              {getInitials(employee.name)}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{employee.name}</h2>
              <p className="text-blue-600 font-semibold text-sm">{employee.job_title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2.5 text-sm text-slate-600 font-medium">
               <div className="flex items-center gap-2.5">
                 <Phone className="h-4 w-4 text-blue-600" /> {employee.phone}
               </div>
               <div className="flex items-center gap-2.5">
                 <Mail className="h-4 w-4 text-blue-600" /> {employee.email}
               </div>
            </div>
            {cvDownloadUrl ? (
              <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl px-5 font-semibold h-10 ml-2 shadow-sm">
                <a href={cvDownloadUrl} target='_blank' rel="noopener noreferrer">
                  <Eye className='mr-2 h-4 w-4' /> Preview CV
                </a>
              </Button>
            ) : (
               <Button variant="outline" className="border-slate-200 text-slate-400 rounded-xl px-5 font-semibold h-10 ml-2" disabled>
                 <Eye className='mr-2 h-4 w-4' /> CV Not Available
               </Button>
            )}
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-1">
           <IconText icon={<MapPin />}>{employee.location}</IconText>
           <IconText icon={<Briefcase />}>{employee.total_experience_years} Years</IconText>
           <IconText icon={<IndianRupee />}>{employee.salary} LPA</IconText>
           <IconText icon={<CalendarDays />}>Notice: {employee.notice} days</IconText>
           <IconText icon={<File />}>Resume Available</IconText>
        </div>

        {/* 4 Cards Section */}
        <div className="flex flex-wrap gap-4 mt-2">
           <InfoCard 
             icon={<Briefcase className="h-5 w-5" />} 
             title="Current Experience" 
             subtitle={employee.current_company_name || <span className="text-red-500 font-medium">Not specified</span>}
             bgClass="bg-blue-100" 
             textClass="text-blue-600" 
           />
           <InfoCard 
             icon={<GraduationCap className="h-5 w-5" />} 
             title="Previous Experience" 
             subtitle={employee.previous_companies_name && Array.isArray(employee.previous_companies_name) && employee.previous_companies_name.length > 0 ? employee.previous_companies_name.join(", ") : (typeof employee.previous_companies_name === 'string' && employee.previous_companies_name ? employee.previous_companies_name : <span className="text-red-500 font-medium">No previous experience listed.</span>)}
             bgClass="bg-purple-100" 
             textClass="text-purple-600" 
           />
           <InfoCard 
             icon={<GraduationCap className="h-5 w-5" />} 
             title="Education" 
             subtitle={employee.education && Array.isArray(employee.education) && employee.education.length > 0 ? employee.education.join(", ") : (typeof employee.education === 'string' && employee.education ? employee.education : <span className="text-red-500 font-medium">No Education listed.</span>)}
             bgClass="bg-green-100" 
             textClass="text-green-600" 
           />
           <InfoCard 
             icon={<MapPin className="h-5 w-5" />} 
             title="Preferred Location" 
             subtitle={employee.location}
             bgClass="bg-amber-100" 
             textClass="text-amber-600" 
           />
        </div>

        {/* Skills Section */}
        <div className="flex flex-col gap-4 mt-2">
           <div className="flex justify-between items-center">
             <h3 className="font-bold text-slate-800 text-sm">Skills ({employee.skills.length})</h3>
             {employee.skills.length > 15 && (
               <Button variant="ghost" size="sm" onClick={() => setShowAllSkills(!showAllSkills)} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-8 text-xs font-bold px-3 rounded-lg transition-colors">
                 {showAllSkills ? "Show Less" : "Show All"}
                 {showAllSkills ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
               </Button>
             )}
           </div>
           <div className="flex flex-wrap gap-2.5">
             {displayedSkills.map((skill) => (
               <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-full text-xs font-semibold border border-blue-100/50 hover:bg-blue-100 transition-colors cursor-default">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                 {skill}
               </div>
             ))}
             {!showAllSkills && employee.skills.length > 15 && (
               <div className="flex items-center px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm" onClick={() => setShowAllSkills(true)}>
                 +{employee.skills.length - 15} More
               </div>
             )}
           </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="bg-slate-50 px-6 py-3 flex justify-between items-center text-xs text-slate-500 font-semibold border-t border-slate-100">
        <div><span className="text-blue-600 font-bold mr-1">Source:</span>{employee.source}</div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-blue-600" /> 
          <span className="text-blue-600 font-bold mr-1">Created:</span>
          {format(new Date(employee.created_at), "dd MMM yyyy hh:mm a")}
        </div>
      </div>
    </Card>
  )
}
