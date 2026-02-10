import type { CandidateRec } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, IndianRupee, CalendarDays, File, Eye, Phone, Mail } from 'lucide-react';
import React from 'react';
import { Separator } from '@/components/ui/separator'

interface EmployeeCardProps {
  employee: CandidateRec;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const IconText: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode
}> = ({ icon, children }) => {
  return (
    <div className="flex items-center ">
      {React.cloneElement(icon, { className: `mr-1 h-4 w-4 stroke-blue-700 text-accent ${icon.props.className || ''}` })}
      <span>{children}</span>
    </div>
  )
}

const DesSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className='text-xs text-black flex flex-wrap my-1'>
    <div className='mr-3 font-bold'>{title}</div>
    <div className='w-150'>
      <span>{children}</span>
    </div>
  </div>
)

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const getCvUrl = ():string | null => {
    if (!employee.cvUrl) return null;

    if(/^https?:\/\//i.test(employee.cvUrl)) {
      return employee.cvUrl;
    }

    return `${API_URL}/resumes/${employee.cvUrl}`;
  };

  const cvDownloadUrl = getCvUrl();

  return (
    <Card className="w-full mt-6 pb-2 px-1 rounded-xl shadow-md border flex flex-col bg-white">
      <CardHeader className="m-0 p-0">
        <div>
          <CardTitle className='text-lg font-semibold text-primary mt-2 ml-2'>{employee.name} - {employee.jobTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className='relative text-xs text-black-700 flex flex-wrap gap-x-3 m-1'>
        <IconText icon={<MapPin />}>{employee.location}</IconText>
        <IconText icon={<IndianRupee />}>Current: {employee.salary} LPA</IconText>
        <IconText icon={<Briefcase />}>{employee.totalExperienceYears} Years</IconText>
        <IconText icon={<CalendarDays />}>Notice: {employee.notice} days</IconText>
        {/* <IconText icon={<Mars />}>{employee.sex}</IconText>
        <IconText icon={<User />}>{employee.age} Years Old</IconText> */}
        <IconText icon={<File />}>Resume Available</IconText>
        <div className='absolute right-0 flex gap-x-2'>
          <IconText icon={<Phone />}>{employee.phone}</IconText>
          <IconText icon={<Mail />}>{employee.email}</IconText>
        </div>
      </CardContent>
      <Separator />
      <CardDescription className='flex'>
        <CardContent className=' ml-2 mr-10'>
          <DesSection title="Current Experience:">
            - {employee.currentCompanyName}
          </DesSection>
          <Separator />
          <DesSection title="Previous Experience:">
            {employee.previousCompaniesName && Array.isArray(employee.previousCompaniesName) && employee.previousCompaniesName.length > 0 ? (
              <ul>
                {employee.previousCompaniesName.map((company, index) => (
                  <li key={index} className="text-xs">
                    - {company}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-red-500">No previous experience listed.</p>
            )}
          </DesSection>
          <Separator />
          <DesSection title='Education'>
            {employee.education && Array.isArray(employee.education) && employee.education.length > 0 ? (
              <ul>
                {employee.education.map((edu, index) => (
                  <li key={index} className="text-xs">
                    - {edu}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-red-500">No Education Qualifications listed.</p>
            )}
          </DesSection>
          <Separator />
          <DesSection title="Preferred Location">{employee.location}</DesSection>
        </CardContent>
        <CardContent className='w-150 pt-1'>
          <div>
            {employee.skills.map((skill) => (
              <Badge key={skill} variant="default" className='px-3 py-1 text-xs bg-primary/80 text-primary-foreground hover:bg-primary bg-blue-700'>
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardContent className='w-100 mt-2 relative'>
          {cvDownloadUrl ? (
            <Button asChild className='bg-accent hover:bg-accent/90 text-accent-foreground w-2/3 absolute right-0 cursor-pointer'>
              <a href={cvDownloadUrl} target='_blank' rel="noopener noreferrer">
              <Eye className='mr-2 h-4 w-4' /> Preview CV
            </a>
            </Button>
          ) : (
           <Button className='bg-accent hover:bg-accent/90 text-accent-foreground w-full' disabled>
               <Eye className='mr-2 h-4 w-4' /> CV Not Available
           </Button>
           )}
        </CardContent>
      </CardDescription>
      <Separator />
      <CardFooter className='text-xs mb-2 mr-2 mt-3 relative'>
        <div className='flex gap-4 absolute right-0'>
          <div><b className='text-blue-700'>Source: </b>{employee.source}</div>
          <div><b className='text-blue-700'>Created: </b>{employee.createdAt}</div>
        </div>
      </CardFooter>
    </Card>
  )
}
