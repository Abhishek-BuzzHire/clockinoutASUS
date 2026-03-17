'use client'

import { Linkedin, Save, Loader2, User, ToggleRight, ToggleLeft } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import RoleBadge from "./Admin_Employee/RoleBadge"
import StatusPill from "./Admin_Employee/StatusPill"
import RolePicker from "./Admin_Employee/RolePicker"
import ManagerDrop from "./Admin_Employee/ManagerDrop"
import LabelInput from "./Admin_Employee/LabelInput"

const EmployeeDetails = ({
  data,
  onPrev,
  onNext,
  managers = [],
  editData = { username: "", role: "employee", manager_id: "", is_active: true, manager_name: "" },
  setEditData = () => { },
  isUpdating = false,
  onUpdate = (e: React.FormEvent) => { e.preventDefault() },
}: {
  data: any
  onPrev: () => void
  onNext: () => void
  managers?: any[]
  editData?: { username: string; role: string; manager_id: string; is_active: boolean; manager_name: string }
  setEditData?: React.Dispatch<React.SetStateAction<{ username: string; role: string; manager_id: string; is_active: boolean; manager_name: string }>>
  isUpdating?: boolean
  onUpdate?: (e: React.FormEvent) => void
}) => {

  const getProfilePhoto = () => {
    if (data.profile_photo) {
      if (typeof data.profile_photo === 'string') {
        return `data:image/jpeg;base64,${data.profile_photo}`
      }
      return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(data.profile_photo)))}`
    }
    return "/avatar.png"
  }

  const [activeTab, setActiveTab] = useState("Details")

  const renderContent = () => {
    switch (activeTab) {
      case 'Details':
        return (
          <div className="">
            <div className="bg-white rounded-lg shadow-md mt-6 border-2">
              <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                <h2 className="text-md font-semibold text-gray-600">Basic Information</h2>
              </div>
              <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Full Name</span>
                  <span className="text-sm">{data.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Languages Spoken</span>
                  <span className="text-sm">Hindi & English</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Gender</span>
                  <span className="text-sm">{data.gender}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Education</span>
                  <span className="text-sm">{data.education}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Date Of Birth</span>
                  <span className="text-sm">{data.date_of_birth
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
                  <span className="text-sm">{data.address}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md mt-6 border-2">
              <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                <h2 className="text-md font-semibold text-gray-600">Professional Information</h2>
              </div>
              <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Employee ID</span>
                  <span className="text-sm">{data.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Job Title</span>
                  <span className="text-sm">{data.designation}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Employement Type</span>
                  <span className="text-sm">Full Time</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Department</span>
                  <span className="text-sm">{data.department}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Joining Date</span>
                  <span className="text-sm">{data.joining_date
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
        )

      case 'Payroll':
        return (
          <div className="mt-6 bg-white p-6 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-4">Payroll</h2>
          </div>
        )

      case 'User Detail':
        return (
          <div className="mt-6 space-y-5">

            {/* Live preview card */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-5">
              <div className="flex justify-between p-0 pb-4 items-center border-b-2 border-gray-200 mb-5">
                <h2 className="text-md font-semibold text-gray-600">Account Overview</h2>
                {/* Live status + role badges update as editData changes */}
                <div className="flex items-center gap-2">
                  <RoleBadge role={editData.role} />
                  <StatusPill active={editData.is_active} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-xs font-semibold">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Username</span>
                  <span className="text-sm">{editData.username || "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Role</span>
                  <span className="text-sm capitalize">{editData.role || "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Account Status</span>
                  <span className="text-sm">{editData.is_active ? "Active" : "Suspended"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">Manager</span>
                  <span className="text-sm">
                    {managers.find(m => String(m.id) === String(editData.manager_id))?.name
                      || managers.find(m => String(m.id) === String(editData.manager_id))?.username
                      || editData.manager_name
                      || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="flex justify-between px-6 py-4 items-center border-b-2 border-gray-200">
                <h2 className="text-md font-semibold text-gray-600">Edit Account</h2>
              </div>
              <form onSubmit={onUpdate} className="p-6 space-y-5">

                {/* Account Status toggle */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Account Status</label>
                  <button
                    type="button"
                    onClick={() => setEditData(p => ({ ...p, is_active: !p.is_active }))}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${editData.is_active
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-600"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 font-bold text-sm">
                      <span className={`w-2.5 h-2.5 rounded-full ${editData.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                      {editData.is_active ? "Account is Active" : "Account Suspended"}
                    </div>
                    {editData.is_active
                      ? <ToggleRight className="w-7 h-7 text-emerald-500" />
                      : <ToggleLeft className="w-7 h-7 text-red-400" />}
                  </button>
                </div>

                <LabelInput
                  label="Username"
                  icon={<User className="w-4 h-4" />}
                  type="text"
                  value={editData.username}
                  onChange={v => setEditData(p => ({ ...p, username: v }))}
                  placeholder="Username"
                  required
                />

                <RolePicker
                  value={editData.role}
                  onChange={v => setEditData(p => ({ ...p, role: v, manager_id: "" }))}
                />

                <ManagerDrop
                  value={editData.manager_id}
                  onChange={v => setEditData(p => ({ ...p, manager_id: v }))}
                  managers={managers}
                  defaultLabel={editData.manager_name ? `Current: ${editData.manager_name}` : "— No manager assigned —"}
                />

                <div className="pt-2 border-t border-slate-100" />

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg text-sm"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )

      default:
        return null
    }
  }
  const tabs = ['Details', 'Payroll', 'Attendance', 'Leaves', 'User Detail'];

  return (
    <div className="w-full min-h-screen bg-white ">
      <div className="flex justify-between bg-white py-4 px-8">
        <div className="flex gap-2 ">


          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200"
            onClick={onPrev}>
            <Image src={"/chev-left.png"} alt="Previous Employee" width={24} height={24} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200"
            onClick={onNext}>
            <Image src={"/chev-right.png"} alt="Next Employee" width={24} height={24} />
          </button>


        </div>
        <div className="flex gap-2 pr-4">

          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/share.png"} alt="" width={20} height={20} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
            <Image src={"/delete.png"} alt="" width={20} height={20} />
          </button>
        </div>
      </div>
      {/* Header Section */}


      <div className="w-full bg-sky-50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">

          {/* Profile Image */}
          <Image
            src={getProfilePhoto()}
            alt=""
            width={136}
            height={136}
            className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover shrink-0"
          />

          {/* Right Content */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Name + Status */}
            <div className="space-y-1.5 min-w-0">
              <h1
                className="text-lg sm:text-xl font-bold text-gray-700 truncate whitespace-nowrap"
                title={data.name}
              >
                {data.name}
              </h1>

              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-md font-semibold shrink-0">
                  Active
                </span>

                <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>

                <span
                  className="text-gray-400 truncate whitespace-nowrap"
                  title={data.jobTitle}
                >
                  {data.jobTitle}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-4 sm:gap-5 text-xs font-semibold text-gray-700
        min-w-0
      ">

              {/* Column 1 */}
              <div className="space-y-1.5 min-w-0">

                <div className="grid grid-cols-[95px_1fr]  gap-0 items-center">
                  <p className="text-gray-400 shrink-0">Department</p>
                  <p
                    className="truncate whitespace-nowrap min-w-0"
                    title={data.department}
                  >
                    {data.department || "—"}
                  </p>
                </div>

                <div className="grid grid-cols-[95px_1fr] gap-0 items-center">
                  <p className="text-gray-400 shrink-0">Date Hired</p>
                  <p className="truncate whitespace-nowrap min-w-0">
                    {data.joining_date
                      ? new Date(data.joining_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "N/A"}
                  </p>
                </div>

              </div>

              {/* Column 2 */}
              <div className="space-y-1.5 min-w-0">

                <div className="min-w-0">
                  {data.email ? (
                    <a
                      href={`mailto:${data.email}`}
                      className="
        flex items-center gap-2
        text-gray-600 hover:text-blue-600
        transition-colors duration-200
        group min-w-0
      "
                    >
                      <Image
                        src="/mail.png"
                        alt="Email"
                        width={16}
                        height={16}
                        className="opacity-60 group-hover:opacity-100 transition shrink-0"
                      />

                      <span
                        className="truncate whitespace-nowrap min-w-0 text-xs font-medium"
                        title={data.email}
                      >
                        {data.email}
                      </span>
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">No Email</span>
                  )}
                </div>

                <div className="flex gap-2 items-center min-w-0">
                  <Image
                    src="/phone.png"
                    alt="phone"
                    width={16}
                    height={16}
                    className="opacity-60 shrink-0"
                  />

                  <span
                    className="truncate whitespace-nowrap min-w-0"
                    title={data.phone}
                  >
                    {data.phone || "—"}
                  </span>
                </div>

              </div>

              {/* Column 3 */}
              <div className="space-y-2.5 min-w-0">

                {data.linkedIn ? (
                  <a
                    href={data.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                flex items-center gap-2
                text-gray-600 hover:text-[#0A66C2]
                transition-colors duration-200
                group min-w-0
              "
                  >
                    <Linkedin
                      size={18}
                      className="opacity-70 group-hover:opacity-100 transition shrink-0"
                    />

                    <span
                      className="truncate whitespace-nowrap min-w-0 text-xs font-medium"
                      title={data.linkedIn}
                    >
                      LinkedIn
                    </span>
                  </a>
                ) : (
                  <span className="text-gray-400">No LinkedIn</span>
                )}

              </div>

            </div>
          </div>
        </div>
      </div>



      <div className="bg-gradient-to-b from-blue-50 to-white px-8 py-6 rounded-2xl border border-blue-100 shadow-sm">

        {/* Tabs */}
        <div className="flex w-full border-b border-slate-200 mb-8">

          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
          flex-1 text-center py-4 text-sm font-semibold tracking-wide relative transition-all duration-300
          ${activeTab === tab
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
                }
        `}
            >
              {tab}

              {/* Active Indicator */}
              <span
                className={`
            absolute left-0 bottom-0 h-[3px] w-full rounded-full transition-all duration-300
            ${activeTab === tab
                    ? "bg-blue-600"
                    : "bg-transparent"
                  }
          `}
              />
            </button>
          ))}

        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {renderContent()}
        </div>

      </div>
    </div>
  )
}

export default EmployeeDetails;