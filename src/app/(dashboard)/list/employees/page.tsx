'use client'

import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  ShieldCheck,
  User,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Save,
  ToggleRight,
  ToggleLeft,
  Edit3,
  X,
  Shield,
  Mail,
  UserCircle,
  Search,
  Users
} from "lucide-react"
import { apiUrl } from '@/lib/data'
import axios from 'axios'
import useSWR from 'swr'
import Cookies from "js-cookie"
import EmployeeTable from "@/components/EmployeeTable";
import Pagination from "@/components/Pagination";
import UserCard from "@/components/UserCard";
import EmployeeDetails from "@/components/EmployeeDetails";
import { employeeData } from "@/lib/data";
import Image from "next/image";


const data = employeeData;

const fetcher = (url: string) => {
  const token = Cookies.get("access");
  return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

const EmployeesListPage = () => {
  // ⚡ Load initial values from localStorage synchronously
  const [localEmployees, setLocalEmployees] = useState<any[] | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("employees_profiles_cache");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cached profiles data", e);
        }
      }
    }
    return undefined;
  });

  const [localUsers, setLocalUsers] = useState<any[] | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("employees_users_cache");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cached users data", e);
        }
      }
    }
    return undefined;
  });

  const { data: rawEmployees, mutate: mutateEmployees } = useSWR(
    `${apiUrl}/api/profile/`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: usersData, mutate: mutateUsers } = useSWR(
    `${apiUrl}/api/users/`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Save fresh SWR data to localStorage
  useEffect(() => {
    if (rawEmployees && typeof window !== "undefined") {
      localStorage.setItem("employees_profiles_cache", JSON.stringify(rawEmployees));
    }
  }, [rawEmployees]);

  useEffect(() => {
    if (usersData && typeof window !== "undefined") {
      localStorage.setItem("employees_users_cache", JSON.stringify(usersData));
    }
  }, [usersData]);

  const effectiveEmployees = rawEmployees || localEmployees;
  const users = usersData || localUsers || [];
  const managers = users;

  const employees = React.useMemo(() => {
    if (!effectiveEmployees) return [];
    return effectiveEmployees.map((profile: any) => ({
      id: profile.id,
      user_id: profile.user.id,
      username: profile.user.username,
      name: profile.name || profile.user.name || profile.user.username,
      email: profile.email || profile.user.email,
      phone: profile.phone,
      department: profile.department,
      designation: profile.designation,
      joining_date: profile.joining_date,
      gender: profile.gender,
      address: profile.address,
      emergency_contact: profile.emergency_contact,
      education_1: profile.education_1,
      education_2: profile.education_2,
      education_3: profile.education_3,
      past_experience_1: profile.past_experience_1,
      past_experience_2: profile.past_experience_2,
      date_of_birth: profile.date_of_birth,
      aadhar_file: profile.aadhar_file,
      pan_file: profile.pan_file,
      resume_file: profile.resume_file,
      linkedIn: profile.linkedIn,
      profile_photo: profile.profile_photo,
      e_sign: profile.e_sign,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      role: profile.user.role,
      is_active: profile.user.is_active,
      manager: profile.user.manager
    }));
  }, [effectiveEmployees]);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tabs = ["Employees", "Users"];
  const [activeTab, setActiveTab] = useState("Employees");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee",
    manager_id: ""
  })

  // Edit Form State
  const [editData, setEditData] = useState({
    email: "",
    // password: "",
    role: "employee",
    manager_id: "",
    is_active: true
  })

  // ------------------------
  // CREATE USER (unchanged)
  // ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const payload: any = { ...formData, username: formData.email }
    delete payload.email;
    if (formData.role === 'admin') delete payload.manager_id
    if (!formData.manager_id) delete payload.manager_id

    const token = Cookies.get("access")

    try {
      await axios.post(`${apiUrl}/api/register/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ type: "success", text: "User registered successfully!" })

      setFormData({
        email: "",
        password: "",
        role: "employee",
        manager_id: "",
      })

      mutateUsers()
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Registration failed",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ------------------------
  // EDIT USER FLOW (FIXED)
  // ------------------------
  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditData({
      email: user.username,
      //   password: user.password,
      role: user.role,
      manager_id: user.manager?.id || "",
      is_active: user.is_active ?? true
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    const token = Cookies.get("access")

    const payload: any = {
      username: editData.email,
      role: editData.role,
      manager: editData.manager_id || null,
      is_active: editData.is_active,
    }

    // Only send password if user typed one
    // if (editData.password.trim()) {
    //   payload.password = editData.password
    // }

    try {
      await axios.put(`${apiUrl}/api/users/${selectedUser.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      mutateUsers()
      setSelectedUser(null)
    } catch (err) {
      console.error("Update failed", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = users.filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  )

  const renderContent = () => {
    switch (activeTab) {
      case "Employees":        const EmployeeList = () => {
          type ViewType = 'userCard' | 'table';
          const [view, setView] = useState<ViewType>('table')
          const [profileIndex, setProfileIndex] = useState<number | null>(null);

          const currentEmployee = profileIndex !== null ? employees[profileIndex] : null;

          const handlePrevEmployee = () => {
            if (profileIndex === null) return;
            setProfileIndex(prev =>
              prev === 0 ? employees.length - 1 : (prev as number) - 1
            );
          };

          const handleNextEmployee = () => {
            if (profileIndex === null) return;
            setProfileIndex(prev =>
              prev === employees.length - 1 ? 0 : (prev as number) + 1
            );
          };

          return (
            <div className="w-full h-screen bg-blueLight-50 p-8">
              <div className="flex items-center w-full mb-4 justify-between">
                <div className="flex items-center gap-8">
                  <div className="text-2xl text-gray-900 space-x-4">
                    {employees.length} Employees
                  </div>
                  <div className="">
                    <button className="flex justify-between gap-2 text-sm bg-white py-2 rounded-md px-6">
                      <Image src={"/filter.png"} alt="" width={16} height={16} />
                      Filter
                    </button>
                  </div>
                </div>
                <div className="inline-flex font-semibold rounded-md shadow-sm border border-gray-300 overflow-hidden my-8">
                  {/* Table Button */}
                  <button
                    onClick={() => {
                      setProfileIndex(null);
                      setView("table");
                    }}
                    className={`px-4 py-1 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                             ${view === "table"
                        ? "bg-white text-gray-900"
                        : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    Table View
                  </button>

                  {/* Pipeline Button */}
                  <button
                    onClick={() => {
                      setProfileIndex(null);
                      setView("userCard");
                    }}
                    className={`px-4 py-1 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                             ${view === "userCard"
                        ? "bg-white text-gray-900"
                        : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    Grid View
                  </button>
                </div>
              </div>

              {/* LOADING STATE */}
              {!effectiveEmployees && (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {effectiveEmployees && (
                <div>
                  {view === 'userCard' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {employees.map((employee: any, index: number) => (
                          <div 
                            key={employee.id} 
                            onClick={() => setProfileIndex(index)} 
                            className="cursor-pointer"
                          >
                            <UserCard data={employee} />
                          </div>
                        ))}
                      </div>
                      <Pagination />

                      {/* Side Drawer Panel for Grid View */}
                      <div
                        className={`fixed overflow-y-auto top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ${profileIndex !== null ? "translate-x-0" : "translate-x-full"
                          }`}
                      >
                        <button
                          className="absolute top-2 right-4 text-gray-500 hover:text-black z-50 font-bold text-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileIndex(null);
                          }}
                        >
                          ✕
                        </button>

                        {currentEmployee && (
                          <EmployeeDetails
                            data={currentEmployee}
                            onPrev={handlePrevEmployee}
                            onNext={handleNextEmployee}
                          />
                        )}
                      </div>

                      {/* Backdrop for Grid View */}
                      {profileIndex !== null && (
                        <div
                          className="fixed inset-0 bg-black/40 z-40"
                          onClick={() => setProfileIndex(null)}
                        />
                      )}
                    </>
                  )}
                  {view === 'table' && (
                    <>
                      <EmployeeTable data={employees} />
                      <Pagination />
                    </>
                  )}
                </div>
              )}
            </div>
          )
        }

        return <EmployeeList />;

      case "Users":
        return (
          <>
            {/* ================= CREATE USER ================= */}
            <div className="max-w-2xl mx-auto p-6">

              <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Controls</span>
                </div>
                <h1 className="text-2xl font-semibold text-slate-800">Onboard New User</h1>
                <p className="text-sm text-slate-500">Create system credentials and define reporting lines.</p>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-sm font-semibold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border rounded-xl font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border rounded-xl font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['admin', 'employee'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r, manager_id: "" })}
                        className={`py-3 rounded-2xl text-md font-semibold uppercase ${formData.role === r
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role !== 'admin' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Manager</label>
                    <select
                      required
                      value={formData.manager_id}
                      onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
                      className="w-full px-4 py-3 border rounded-xl font-semibold"
                    >
                      <option value="">Select a manager</option>
                      {managers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  Create User
                </button>
              </form>
            </div>

            {/* ================= USERS LIST ================= */}
            <div className="min-h-screen bg-slate-50 p-6">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Employees</h2>

                <div className="relative w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 border rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="bg-white border rounded-xl p-5">
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-slate-400" />
                        <div>
                          <p className="font-semibold">{user.name || user.username}</p>
                          <p className="text-sm text-slate-500">{user.username}</p>
                        </div>
                      </div>

                      <button onClick={() => handleEditClick(user)}>
                        <Edit3 className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{user.role}</span>
                      {user.manager && <span>Reports to {user.manager.username}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= EDIT MODAL ================= */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
                <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">

                  <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Edit User</h3>
                    <button onClick={() => setSelectedUser(null)}>
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="p-6 space-y-5 flex-1 overflow-y-auto">

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Account Status</label>
                      <button
                        type="button"
                        onClick={() => setEditData({ ...editData, is_active: !editData.is_active })}
                        className="w-full flex justify-between items-center px-4 py-3 border rounded-xl"
                      >
                        <span className="font-semibold">
                          {editData.is_active ? "Active" : "Suspended"}
                        </span>
                        {editData.is_active ? <ToggleRight /> : <ToggleLeft />}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Email</label>
                      <input
                        value={editData.email}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl font-semibold"
                      />
                    </div>

                    {/* <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Reset Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep"
                  value={editData.password}
                  onChange={e => setEditData({ ...editData, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl font-semibold"
                />
              </div> */}

                    <label className="text-xs font-semibold text-slate-500">Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['admin', 'employee'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditData({ ...editData, role: r, manager_id: "" })}
                          className={`py-3 rounded-2xl text-md font-semibold uppercase ${editData.role === r
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Manager</label>
                      <select
                        value={editData.manager_id}
                        onChange={e => setEditData({ ...editData, manager_id: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl font-semibold"
                      >
                        <option value="">{editData.manager_id}</option>
                        {managers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl flex justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="animate-spin" /> : <Save />}
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )
      default:
        return null;
    }
  }

  return (
    <div className="w-full bg-sky-50 p-4 relative">
      <div className="text-lg">
        <div className="flex space-x-8 text-xs font-bold border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-2 ${activeTab === tab
                ? "border-b-2 border-blue-600"
                : "text-gray-500"
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  )

}

export default EmployeesListPage