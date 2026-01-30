// This is the candidate details from the right window half menu
// along with genral props, "stages" should also be passed here.

import { Employee } from "@/lib/types";
import Image from "next/image"
import { useState } from "react";

const EmployeeDetails = ({ data }: { data: any }) => {

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


  const [activeTab, setActiveTab] = useState("Details")

  const renderContent = () => {
    switch (activeTab) {
      case 'Details':
        return (
          <div className="">
            <div className="bg-white rounded-lg shadow-md mt-6 border-2">
              <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                <h2 className="text-md font-semibold text-gray-600">Basic Information</h2>
                <button className="flex items-center text-sm font-semibold text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Info
                </button>
              </div>
              <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2  gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Full Name</span>
                  <span className=" text-sm">{data.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Languages Spoken</span>
                  <span className=" text-sm">Hindi & English</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Gender</span>
                  <span className=" text-sm">{data.gender}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Education</span>
                  <span className=" text-sm">{data.education}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Date Of Birth</span>
                  <span className=" text-sm">{data.date_of_birth
                    ? new Date(data.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "N/A"
                  }</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Address</span>
                  <span className=" text-sm">{data.address}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md mt-6 border-2">
              <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                <h2 className="text-md font-semibold text-gray-600">Professional Information</h2>
                <button className="flex items-center text-sm font-semibold text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Info
                </button>
              </div>
              <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2  gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Employee ID</span>
                  <span className=" text-sm">{data.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Job Title</span>
                  <span className=" text-sm">{data.designation}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Employement Type</span>
                  <span className=" text-sm">Full Time</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Department</span>
                  <span className=" text-sm">{data.department}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Joining Date</span>
                  <span className=" text-sm">{data.joining_date
                    ? new Date(data.joining_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "N/A"
                  }</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Payroll':
        return (
          <div className="mt-6 bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-4">Payroll</h2>
          </div>
        );
      default:
        return null;
    }
  }

  const tabs = ['Details', 'Payroll', 'Attendance', 'Leaves'];

  return (
    <div className="w-full min-h-screen bg-white ">
      <div className="flex justify-between bg-white py-4 px-8">
        <div className="flex gap-2 ">
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/chev-left.png"} alt="" width={24} height={24} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/chev-right.png"} alt="" width={24} height={24} />
          </button>
        </div>
        <div className="flex gap-2 pr-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/edit.png"} alt="" width={20} height={20} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/share.png"} alt="" width={20} height={20} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/delete.png"} alt="" width={20} height={20} />
          </button>
        </div>
      </div>
      {/* Header Section */}
      <div className="flex p-6 flex-col sm:flex-row justify-between items-center bg-sky-50">
        <div className="flex items-center space-x-4">
          <Image src={getProfilePhoto()} alt="" width={136} height={136} className="rounded-full" />
          <div className="flex flex-col gap-8">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-700">{data.name}</h1>
              <div className="flex gap-2 text-xs font-semibold items-center">
                <p className="bg-green-100 text-green-800 border-2 border-green-300 px-2.5 py-0.5 rounded-md inline-block">
                  Active
                </p>
                <div className="bg-gray-400 w-1 h-1 rounded-full "></div>
                <p className="text-gray-400 font-normal">{data.jobTitle}</p>
              </div>
            </div>
            <div className="flex gap-24 font-semibold text-gray-700 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between gap-12">
                  <p className="text-gray-400">Department</p>
                  <p>{data.department}</p>
                </div>
                <div className="flex justify-between gap-12">
                  <p className="text-gray-400">Date Hired</p>
                  <p>{data.joining_date
                    ? new Date(data.joining_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "N/A"
                  }</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Image src={"/mail.png"} alt="" width={16} height={16} className="opacity-65" />
                  {data.email}
                </div>
                <div className="flex gap-2">
                  <Image src={"/phone.png"} alt="" width={16} height={16} className="opacity-65" />
                  {data.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white px-8">
        <div className="flex space-x-8 text-sm font-bold border-b border-gray-300 mb-8">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 ${activeTab === tab ? "border-b-2 border-blue-600" : "text-gray-500"}`}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

export default EmployeeDetails;