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
import Cookies from "js-cookie"
import EmployeeTable from "@/components/EmployeeTable";
import Pagination from "@/components/Pagination";
import UserCard from "@/components/UserCard";
import { employeeData } from "@/lib/data";
import Image from "next/image";


const data = employeeData;

const EmployeesListPage = () => {
  const [employees, setEmployees] = useState<any[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [managers, setManagers] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const tabs = ["Employees", "Users"];
  const [activeTab, setActiveTab] = useState("Employees");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "employee",
    manager_id: ""
  })

  // Edit Form State
  const [editData, setEditData] = useState({
    username: "",
    // password: "",
    role: "employee",
    manager_id: "",
    is_active: true
  })

  useEffect(() => {
    fetchEmployees()
    fetchUsers()
    fetchManagers()
  }, [])

  const fetchEmployees = async () => {
    const token = Cookies.get("access")
    setEmployeesLoading(true)
    try {
      const res = await axios.get(`${apiUrl}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Map API response to match EmployeeTable/UserCard expectations
      const mappedEmployees = res.data.map((profile: any) => ({
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
      }))

      setEmployees(mappedEmployees)
    } catch (err) {
      console.error("Failed to load employees", err)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const fetchUsers = async () => {
    const token = Cookies.get("access")
    setLoading(true)
    try {
      const res = await axios.get(`${apiUrl}/api/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    const token = Cookies.get("access")
    try {
      const res = await axios.get(`${apiUrl}/api/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setManagers(res.data)
    } catch (err) {
      console.error("Failed to load managers")
    }
  }

  // ------------------------
  // CREATE USER (unchanged)
  // ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const payload: any = { ...formData }
    if (formData.role === 'admin') delete payload.manager_id
    if (!formData.manager_id) delete payload.manager_id

    const token = Cookies.get("access")

    try {
      await axios.post(`${apiUrl}/api/register/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ type: "success", text: "User registered successfully!" })

      setFormData({
        username: "",
        password: "",
        role: "employee",
        manager_id: "",
      })

      fetchUsers()
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Registration failed",
      })
    } finally {
      setLoading(false)
    }
  }

  // ------------------------
  // EDIT USER FLOW (FIXED)
  // ------------------------
  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditData({
      username: user.username,
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
      username: editData.username,
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

      fetchUsers()
      setSelectedUser(null)
    } catch (err) {
      console.error("Update failed", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  )

  const renderContent = () => {
    switch (activeTab) {
      case "Employees":
        const EmployeeList = () => {
          type ViewType = 'userCard' | 'table';
          const [view, setView] = useState<ViewType>('table')
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
                    onClick={() => setView("table")}
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
                    onClick={() => setView("userCard")}
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
              {employeesLoading && (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {!employeesLoading && (
                <div>
                  {view === 'userCard' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {employees.map((employee) => (
                          <UserCard key={employee.id} data={employee} />
                        ))}
                      </div>
                      <Pagination />
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
                    <label className="text-xs font-semibold text-slate-500">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
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
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
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
                {filteredUsers.map(user => (
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
                      <label className="text-xs font-semibold text-slate-500">Username</label>
                      <input
                        value={editData.username}
                        onChange={e => setEditData({ ...editData, username: e.target.value })}
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
                        {managers.map(m => (
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





// 'use client'

// import React, { useState, useEffect } from 'react'
// import {
//   Loader2, Search, Filter, LayoutGrid, LayoutList, UserPlus
// } from "lucide-react"
// import { apiUrl } from '@/lib/data'
// import axios from 'axios'
// import Cookies from "js-cookie"
// import EmployeeTable from "@/components/EmployeeTable"
// import Pagination from "@/components/Pagination"
// import UserCard from "@/components/UserCard"
// import CreateUserForm from '@/components/Admin_Employee/CreateUserForm'


// const EmployeesListPage = () => {
//   const [employees, setEmployees] = useState<any[]>([])
//   const [employeesLoading, setEmployeesLoading] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [managers, setManagers] = useState<any[]>([])
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
//   const [search, setSearch] = useState("")
//   const [selectedUser, setSelectedUser] = useState<any>(null)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [view, setView] = useState<'table' | 'grid'>('table')
//   const [showAddCandidate, setShowAddCandidate] = useState(false)

//   const [formData, setFormData] = useState({ username: "", password: "", role: "employee", manager_id: "" })
//   const [editData, setEditData] = useState({ username: "", role: "employee", manager_id: "", is_active: true, manager_name: "" })

//   useEffect(() => { fetchEmployees(); fetchManagers() }, [])

//   const fetchEmployees = async () => {
//     const token = Cookies.get("access")
//     setEmployeesLoading(true)
//     try {
//       const [profileRes, usersRes] = await Promise.all([
//         axios.get(`${apiUrl}/api/profile/`, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${apiUrl}/api/users/`, { headers: { Authorization: `Bearer ${token}` } })
//       ])

//       const usersMap: Record<number, any> = {}
//       usersRes.data.forEach((u: any) => { usersMap[u.id] = u })

//       setEmployees(profileRes.data.map((p: any) => {
//         const user = p.user
//           ? (typeof p.user === 'object' ? p.user : usersMap[p.user])
//           : null

//         return {
//           id: p.id,
//           user_id: user?.id || p.user,
//           username: user?.username || "",
//           name: (p.name && p.name.trim()) || (user?.name && user.name.trim()) || user?.username || "",
//           email: p.email || user?.email || "",
//           phone: p.phone || "",
//           department: p.department || "",
//           designation: p.designation || "",
//           joining_date: p.joining_date || null,
//           gender: p.gender || "",
//           address: p.address || "",
//           emergency_contact: p.emergency_contact || "",
//           date_of_birth: p.date_of_birth || null,
//           linkedIn: p.linkedIn || p.linkedin || "",
//           profile_photo: p.profile_photo || null,
//           role: user?.role || "",
//           is_active: user?.is_active ?? true,
//           manager: user?.manager || null,
//           languages_spoken: p.languages_spoken || "",
//           employment_type: p.employment_type || "",
//           isPresentToday: p.is_present ?? p.isPresentToday ?? false,
//         }
//       }))
//     } catch (err) {
//       console.error("fetchEmployees error:", err)
//     } finally {
//       setEmployeesLoading(false)
//     }
//   }

//   const fetchManagers = async () => {
//     const token = Cookies.get("access")
//     try {
//       const res = await axios.get(`${apiUrl}/api/users/`, { headers: { Authorization: `Bearer ${token}` } })
//       setManagers(res.data)
//     } catch (err) { console.error(err) }
//   }

//   const parseDjangoError = (err: any): string => {
//     const data = err?.response?.data
//     if (!data) return "Network error — please try again"
//     if (typeof data === "string") return data
//     if (data.error) return String(data.error)
//     if (data.detail) return String(data.detail)
//     if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(", ") : String(data.non_field_errors)
//     const fieldErrors = Object.entries(data)
//       .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : String(msgs)}`)
//       .join(" | ")
//     return fieldErrors || "Registration failed"
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault(); setLoading(true); setMessage(null)
//     if (formData.username.trim().length < 3) {
//       setMessage({ type: "error", text: "Username must be at least 3 characters" })
//       setLoading(false); return
//     }
//     if (formData.password.length < 4) {
//       setMessage({ type: "error", text: "Password must be at least 4 characters" })
//       setLoading(false); return
//     }
//     if (formData.role === "employee" && !formData.manager_id) {
//       setMessage({ type: "error", text: "Please select a manager for this employee" })
//       setLoading(false); return
//     }
//     const payload: any = { username: formData.username.trim(), password: formData.password, role: formData.role }
//     if (formData.role !== "admin" && formData.manager_id) payload.manager_id = formData.manager_id
//     const token = Cookies.get("access")
//     try {
//       await axios.post(`${apiUrl}/api/register/`, payload, { headers: { Authorization: `Bearer ${token}` } })
//       setMessage({ type: "success", text: `User "${formData.username}" created successfully!` })
//       setFormData({ username: "", password: "", role: "employee", manager_id: "" })
//       fetchEmployees()
//     } catch (err: any) {
//       setMessage({ type: "error", text: parseDjangoError(err) })
//     } finally { setLoading(false) }
//   }

//   const handleEditClick = (user: any) => {
//     setSelectedUser(user)
//     setEditData({
//       username: user.username, role: user.role,
//       manager_id: user.manager?.id || "",
//       is_active: user.is_active ?? true,
//       manager_name: user.manager?.name || user.manager?.username || ""
//     })
//   }

//   const handleUpdate = async (e: React.FormEvent) => {
//     e.preventDefault(); setIsUpdating(true)
//     const token = Cookies.get("access")
//     try {
//       await axios.put(`${apiUrl}/api/users/${selectedUser.id}/`, {
//         username: editData.username, role: editData.role,
//         manager: editData.manager_id || null, is_active: editData.is_active,
//       }, { headers: { Authorization: `Bearer ${token}` } })
//       fetchEmployees(); setSelectedUser(null)
//     } catch (err) { console.error(err) } finally { setIsUpdating(false) }
//   }

//   const filteredEmployees = employees.filter(emp =>
//     emp.name?.toLowerCase().includes(search.toLowerCase()) ||
//     emp.username?.toLowerCase().includes(search.toLowerCase()) ||
//     emp.email?.toLowerCase().includes(search.toLowerCase())
//   )

//   return (
//     <div className="w-full min-h-screen bg-[#f8f9fc]">
//       <div className="p-6 md:p-8">

//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-5">
//           <div className="flex items-center gap-4">
//             <div>
//               <h1 className="text-xl font-bold text-slate-600 leading-tight">
//                 {employeesLoading ? <span className="text-slate-300">—</span> : employees.length}
//                 <span className="text-slate-500 font-semibold ml-2 text-xl">Employees</span>
//               </h1>
//               <p className="text-xs text-slate-400 mt-0.5">Manage and view your team</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Add Candidate */}
//             <button
//               onClick={() => setShowAddCandidate(true)}
//               className="flex items-center gap-2 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200"
//             >
//               <UserPlus className="w-3.5 h-3.5" /> Add User
//             </button>

//             {/* View Toggle */}
//             <div className="flex items-center bg-slate-100/80 rounded-xl p-1 gap-0.5">
//               <button
//                 onClick={() => setView("table")}
//                 className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
//               >
//                 <LayoutList className="w-3.5 h-3.5" /> Table
//               </button>
//               <button
//                 onClick={() => setView("grid")}
//                 className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
//               >
//                 <LayoutGrid className="w-3.5 h-3.5" /> Grid
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* SEARCH + FILTER BAR — below header, above list */}
//         <div className="flex items-center gap-3 mb-7">
//           <div className="relative w-72">
//             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input
//               type="text" placeholder="Search employees…"
//               value={search} onChange={e => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all shadow-sm"
//             />
//           </div>
//           <button className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-500 py-2.5 px-4 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
//             <Filter className="w-3.5 h-3.5" /> Filter
//           </button>
//         </div>

//         {/* EMPLOYEE LIST */}
//         {employeesLoading ? (
//           <div className="flex flex-col items-center justify-center h-72 gap-3">
//             <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
//               <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
//             </div>
//             <p className="text-sm font-semibold text-slate-400">Loading employees...</p>
//           </div>
//         ) : (
//           <>
//             {view === 'grid' && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//                 {filteredEmployees.map(emp => <UserCard key={emp.id} data={emp} />)}
//               </div>
//             )}
//             {view === 'table' && <EmployeeTable data={filteredEmployees} />}
//             <div className="mt-5"><Pagination /></div>
//           </>
//         )}
//       </div>

//       {/* ADD CANDIDATE DRAWER */}
//       {showAddCandidate && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/30 z-40 transition-opacity"
//             onClick={() => { setShowAddCandidate(false); setMessage(null) }}
//           />
//           <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl shadow-black/20 z-50 overflow-y-auto">
//             <CreateUserForm
//               formData={formData}
//               setFormData={setFormData}
//               managers={managers}
//               loading={loading}
//               message={message}
//               setMessage={setMessage}
//               onSubmit={handleSubmit}
//             />
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default EmployeesListPage

