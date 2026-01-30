import { employeeData } from "@/lib/data"
import { Employee } from "@/lib/types"
import Image from "next/image"

const UserCard = ({ data }: { data: any }) => {

  const getProfilePhoto = () => {
    if (data.profile_photo) {
      // If profile_photo is base64 already
      if (typeof data.profile_photo === 'string') {
        return `data:image/jpeg;base64,${data.profile_photo}`;
      }
      // If it's binary, convert to base64
      return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(data.profile_photo)))}`;
    }
    return "/avatar.png"; // Fallback image
  };

  return (
    <div className='p-4 font-semibold bg-white shadow-md rounded-md'>
      <div className="flex justify-between items-center">
        <div className="w-4 h-4 bg-sky-100"></div>
        <div className="flex gap-4">
          {/* <div className={`py-1 px-2 text-xs rounded-md border ${data.isPresentToday ? "border-green-600 text-green-600 bg-green-100" : "border-red-600 text-red-600 bg-red-100"}`}>
            {data.isPresentToday ? "Present" : "Absent"}
          </div> */}
          <button ><Image src={"/edit.png"} alt="" width={24} height={24} className="opacity-65 hover:opacity-80" /></button>
        </div>
      </div>
      <div className="py-4 space-y-2">
        <div className="flex justify-center">
          <Image src={getProfilePhoto()} alt="data.name" width={68} height={68} className="rounded-full" />
        </div>
        <div className="text-center">
          <p className="text-lg">{data.name}</p>
          <p className="text-sm text-gray-400 font-normal">{data.jobTitle}</p>
        </div>
      </div>
      <div className="bg-sky-50 p-4 space-y-4">
        <div className="flex gap-10">
          <div className="space-y-1 max-w-[100px]">
            <p className="text-xs text-gray-400 ">Department</p>
            <p className="text-sm text-gray-600">{data.department}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Date Joined</p>
            <p className="text-sm text-gray-600">{data.joining_date
              ? new Date(data.joining_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "N/A"
            }</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p className="flex gap-2">
            <Image src={"/mail.png"} alt="" width={20} height={20} className="opacity-65" />
            {data.email}
          </p>
          <p className="flex gap-2">
            <Image src={"/phone.png"} alt="" width={20} height={20} className="opacity-65" />
            {data.phone}
          </p>

        </div>
      </div>
    </div>
  )
}

export default UserCard