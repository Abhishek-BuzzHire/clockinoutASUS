import type { CandidateRec } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, IndianRupee, CalendarDays, File, Eye, Phone, Mail, GraduationCap, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { apiService } from '@/utils/apiService';
import toast from 'react-hot-toast';

interface EmployeeCardProps {
  employee: CandidateRec;
  onDelete?: (id: string | number) => void;
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
  <div className="flex items-start flex-1 min-w-[180px] p-2 hover:bg-slate-50 rounded-xl transition-colors">
    <div className={`p-2 rounded-lg ${bgClass} ${textClass} mr-3 shrink-0`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</span>
      <span className="text-[14px] font-bold text-slate-800 leading-snug">{subtitle}</span>
    </div>
  </div>
)

export function EmployeeCard({ employee, onDelete }: EmployeeCardProps) {
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setIsDeleting(true);
      try {
        await apiService.deleteCandidate(employee.id);
        toast.success("Resume deleted successfully");
        if (onDelete) {
          onDelete(employee.id);
        } else {
          window.location.reload();
        }
      } catch (err) {
        toast.error("Failed to delete resume");
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="w-full mt-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col bg-white overflow-hidden hover:shadow-md transition-all group">
      <div className="p-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0 border-2 border-blue-50">
              {getInitials(employee.name)}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                {employee.name}
              </h2>
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
            
            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="outline" 
                className="opacity-0 group-hover:opacity-100 transition-opacity border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-5 font-semibold h-10 shadow-sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
              </Button>

              {cvDownloadUrl ? (
                <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl px-5 font-semibold h-10 shadow-sm">
                  <a href={cvDownloadUrl} target='_blank' rel="noopener noreferrer">
                    <Eye className='mr-2 h-4 w-4' /> Preview CV
                  </a>
                </Button>
              ) : (
                 <Button variant="outline" className="border-slate-200 text-slate-400 rounded-xl px-5 font-semibold h-10" disabled>
                   <Eye className='mr-2 h-4 w-4' /> CV Not Available
                 </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="flex flex-wrap gap-4 mt-2">
           <InfoCard 
             icon={<Briefcase className="h-5 w-5" />} 
             title="Current Company" 
             subtitle={
               <span className={!employee.current_company_name ? "text-red-500 font-medium" : ""}>
                 {employee.current_company_name || "Not specified"}
               </span>
             }
             bgClass="bg-blue-100" 
             textClass="text-blue-600" 
           />
           <InfoCard 
             icon={<CalendarDays className="h-5 w-5" />} 
             title="Total Experience" 
             subtitle={<span className="text-blue-600 font-bold">{employee.total_experience_years || 0} Yrs</span>}
             bgClass="bg-sky-100" 
             textClass="text-sky-600" 
           />
           <InfoCard 
             icon={<GraduationCap className="h-5 w-5" />} 
             title="Education" 
             subtitle={employee.education && Array.isArray(employee.education) && employee.education.length > 0 ? employee.education.join(", ") : (typeof employee.education === 'string' && employee.education ? employee.education : <span className="text-red-500 font-medium">No Education listed.</span>)}
             bgClass="bg-green-100" 
             textClass="text-green-600" 
           />
           <InfoCard 
             icon={<IndianRupee className="h-5 w-5" />} 
             title="Current CTC" 
             subtitle={
               <span className={!employee.salary || (employee.salary as any) === "None" ? "text-red-500 font-medium" : "text-green-600 font-bold"}>
                 {!employee.salary || (employee.salary as any) === "None" ? "Not submit by HR" : `${employee.salary} LPA`}
               </span>
             }
             bgClass="bg-emerald-100" 
             textClass="text-emerald-600" 
           />
           <InfoCard 
             icon={<MapPin className="h-5 w-5" />} 
             title="Location" 
             subtitle={employee.location || "Not specified"}
             bgClass="bg-amber-100" 
             textClass="text-amber-600" 
           />
        </div>

        {/* Skills Section */}
        <div className="flex flex-col gap-4 mt-2">
           <div className="flex justify-between items-center">
             <h3 className="font-bold text-slate-800 text-sm">Skills ({employee.skills.length})</h3>
           </div>
           <div className="flex flex-wrap gap-2.5">
             {(showAllSkills ? employee.skills : employee.skills.slice(0, 8)).map((skill) => (
               <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition-colors cursor-default">
                 <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                 {skill}
               </div>
             ))}
             {!showAllSkills && employee.skills.length > 8 && (
               <button 
                 onClick={() => setShowAllSkills(true)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
               >
                 + {employee.skills.length - 8} more...
               </button>
             )}
             {showAllSkills && employee.skills.length > 8 && (
               <button 
                 onClick={() => setShowAllSkills(false)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
               >
                 Show less
               </button>
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
