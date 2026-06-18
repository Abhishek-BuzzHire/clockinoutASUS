import { employeeData, apiUrl } from "@/lib/data"
import { Employee } from "@/lib/types"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Mail, Phone, Calendar, ArrowUpRight, MoreVertical } from "lucide-react"

const LinkedInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const UserCard = ({ data }: { data: any }) => {

  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  useEffect(() => {
    if (data.profile_photo) {
      setPhotoTimestamp(Date.now());
    }
  }, [data.profile_photo]);

  const getProfilePhoto = () => {
    if (data.profile_photo) {
      if (typeof data.profile_photo === 'string') {
        if (data.profile_photo.startsWith('/api/')) {
          return data.profile_photo.includes('?')
            ? `${apiUrl}${data.profile_photo}`
            : `${apiUrl}${data.profile_photo}?t=${photoTimestamp}`;
        }
        return `data:image/jpeg;base64,${data.profile_photo}`;
      }
      return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(data.profile_photo)))}`;
    }
    return "/avatar.png";
  };

  const formattedDate = data.joining_date
    ? new Date(data.joining_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const hasLinkedIn = data.linkedIn && data.linkedIn.trim() !== "" && data.linkedIn.trim() !== "-";

  const formatLinkedInUrl = (url: string) => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("www.linkedin.com") || trimmed.startsWith("linkedin.com")) {
      return `https://${trimmed}`;
    }
    return `https://www.linkedin.com/in/${trimmed}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-blue-100/80 hover:-translate-y-0.5 transition-all duration-300 relative h-full">
      {/* Top Header Section */}
      <div>
        <div className="flex justify-between items-start gap-3">
          {/* Profile Details (Avatar + Text) */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <img 
                src={getProfilePhoto()} 
                alt={data.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100/50 shadow-sm" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("/avatar.png")) target.src = "/avatar.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold text-slate-800 truncate leading-snug">{data.name}</h3>
              <div className="mt-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-md inline-block">
                  {data.jobTitle || data.department || "Employee"}
                </span>
              </div>
            </div>
          </div>

          {/* Options Menu Icon */}
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200/80 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Date Joined Badge */}
        <div className="flex justify-start mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 border border-blue-100/30 text-blue-600 text-xs font-semibold rounded-lg">
            <Calendar className="w-3.5 h-3.5" />
            <span>Joined {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Middle Contact Section */}
      <div className="mt-5 pt-4 border-t border-slate-100/80 space-y-3 flex-grow">
        {/* Email */}
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-500/80 flex-shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <span className="truncate font-medium">{data.email || "N/A"}</span>
        </div>
        
        {/* Phone */}
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-500/80 flex-shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <span className="truncate font-medium">{data.phone || "N/A"}</span>
        </div>
      </div>

      {/* Bottom LinkedIn Button Section */}
      <div className="mt-5 pt-1">
        {hasLinkedIn ? (
          <a 
            href={formatLinkedInUrl(data.linkedIn)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full flex items-center justify-between border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <LinkedInIcon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
              <span>View on LinkedIn</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
          </a>
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-between border border-slate-100 text-slate-400 bg-slate-50/50 py-2.5 px-4 rounded-xl text-sm font-semibold cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <LinkedInIcon className="w-4 h-4 text-slate-300" />
              <span>View on LinkedIn</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>
    </div>
  )
}

export default UserCard