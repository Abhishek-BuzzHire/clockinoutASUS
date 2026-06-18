import { employeeData, apiUrl } from "@/lib/data"
import { Employee } from "@/lib/types"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Mail, Phone, Calendar, ArrowUpRight, MoreVertical, User } from "lucide-react"

const LinkedInIcon = ({ className = "w-4 h-4", iconColor = "#0077b5" }: { className?: string; iconColor?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill={iconColor} />
    <path d="M9 19H6V10H9V19ZM7.5 8.73C6.54 8.73 5.76 7.95 5.76 6.99C5.76 6.03 6.54 5.25 7.5 5.25C8.46 5.25 9.24 6.03 9.24 6.99C9.24 7.95 8.46 8.73 7.5 8.73ZM19 19H16V13.88C16 12.66 15.98 11.08 14.31 11.08C12.61 11.08 12.35 12.41 12.35 13.79V19H9.35V10H12.23V11.23H12.27C12.67 10.47 13.65 9.67 15.11 9.67C18.15 9.67 18.71 11.67 18.71 14.28V19H19Z" fill="white" />
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

  // Presence status color values matching sky blue theme style
  const statusColor = data.isPresentToday ? "bg-green-500" : "bg-slate-400";
  const statusRingColor = data.isPresentToday ? "border-green-500/20" : "border-slate-300";

  return (
    <div className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 pl-8 flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 h-full overflow-hidden">
      {/* Vertical border line on the left side - sky blue themed */}
      <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#0ea5e9] rounded-l-3xl"></div>

      {/* Top Header Section */}
      <div>
        <div className="flex justify-between items-start gap-3">
          {/* Profile Details (Avatar + Name & Role Badge) */}
          <div className="flex items-center gap-4">
            <div className={`relative p-[3px] rounded-full border-2 ${statusRingColor} flex-shrink-0`}>
              <img 
                src={getProfilePhoto()} 
                alt={data.name} 
                className="w-16 h-16 rounded-full object-cover border border-slate-100 bg-slate-50" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("/avatar.png")) target.src = "/avatar.png";
                }}
              />
              {/* Online/Offline Status Indicator dot */}
              <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 ${statusColor} border-2 border-white rounded-full`}></span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-800 truncate leading-snug tracking-tight font-sans">{data.name}</h3>
              <div className="mt-1">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 border border-sky-100/50">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {data.jobTitle || data.department || "Employee"}
                </span>
              </div>
            </div>
          </div>

          {/* Options Menu Icon */}
          <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-slate-500 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Date Joined Badge */}
        <div className="flex justify-start mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-100/30 text-sky-700 text-xs font-semibold rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Joined {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-[1px] bg-slate-100 my-5"></div>

      {/* Middle Contact Section */}
      <div className="space-y-4 flex-grow">
        {/* Email */}
        <div className="flex items-center gap-3.5 text-sm text-slate-600">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block leading-none mb-0.5">Email</span>
            <span className="truncate font-semibold text-slate-700 block">{data.email || "N/A"}</span>
          </div>
        </div>
        
        {/* Phone */}
        <div className="flex items-center gap-3.5 text-sm text-slate-600">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block leading-none mb-0.5">Phone</span>
            <span className="truncate font-semibold text-slate-700 block">{data.phone || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Bottom LinkedIn Button Section */}
      <div className="mt-6">
        {hasLinkedIn ? (
          <a 
            href={formatLinkedInUrl(data.linkedIn)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full flex items-center justify-between border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow group"
          >
            <span className="flex items-center gap-2">
              <LinkedInIcon className="w-5 h-5" iconColor="#0077b5" />
              <span>View on LinkedIn</span>
            </span>
            <ArrowUpRight className="w-4.5 h-4.5 text-blue-600 group-hover:text-white transition-colors" />
          </a>
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-between border border-slate-200 text-slate-400 bg-slate-50/50 py-2.5 px-4 rounded-xl text-sm font-semibold cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <LinkedInIcon className="w-5 h-5" iconColor="#cbd5e1" />
              <span>View on LinkedIn</span>
            </span>
            <ArrowUpRight className="w-4.5 h-4.5 text-slate-300" />
          </button>
        )}
      </div>
    </div>
  )
}

export default UserCard