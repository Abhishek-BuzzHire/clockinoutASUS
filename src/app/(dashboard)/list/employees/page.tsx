'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2, Search, Filter, LayoutGrid, LayoutList, UserPlus
} from "lucide-react"
import { apiUrl } from '@/lib/data'
import axios from 'axios'
import Cookies from "js-cookie"
import EmployeeTable from "@/components/EmployeeTable"
import Pagination from "@/components/Pagination"
import UserCard from "@/components/UserCard"
import CreateUserForm from '@/components/Admin_Employee/CreateUserForm'


const EmployeesListPage = () => {
  const [employees, setEmployees] = useState<any[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [managers, setManagers] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [showAddCandidate, setShowAddCandidate] = useState(false)

  const [formData, setFormData] = useState({ username: "", password: "", role: "employee", manager_id: "" })
  const [editData, setEditData] = useState({ username: "", role: "employee", manager_id: "", is_active: true, manager_name: "" })

  useEffect(() => { fetchEmployees(); fetchManagers() }, [])

  const fetchEmployees = async () => {
    const token = Cookies.get("access")
    setEmployeesLoading(true)
    try {
      const [profileRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/profile/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/users/`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      const usersMap: Record<number, any> = {}
      usersRes.data.forEach((u: any) => { usersMap[u.id] = u })

      setEmployees(profileRes.data.map((p: any) => {
        const user = p.user
          ? (typeof p.user === 'object' ? p.user : usersMap[p.user])
          : null

        return {
          id: p.id,
          user_id: user?.id || p.user,
          username: user?.username || "",
          name: (p.name && p.name.trim()) || (user?.name && user.name.trim()) || user?.username || "",
          email: p.email || user?.email || "",
          phone: p.phone || "",
          department: p.department || "",
          designation: p.designation || "",
          joining_date: p.joining_date || null,
          gender: p.gender || "",
          address: p.address || "",
          emergency_contact: p.emergency_contact || "",
          date_of_birth: p.date_of_birth || null,
          linkedIn: p.linkedIn || p.linkedin || "",
          profile_photo: p.profile_photo || null,
          role: user?.role || "",
          is_active: user?.is_active ?? true,
          manager: user?.manager || null,
          languages_spoken: p.languages_spoken || "",
          employment_type: p.employment_type || "",
          isPresentToday: p.is_present ?? p.isPresentToday ?? false,
        }
      }))
    } catch (err) {
      console.error("fetchEmployees error:", err)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const fetchManagers = async () => {
    const token = Cookies.get("access")
    try {
      const res = await axios.get(`${apiUrl}/api/users/`, { headers: { Authorization: `Bearer ${token}` } })
      setManagers(res.data)
    } catch (err) { console.error(err) }
  }

  const parseDjangoError = (err: any): string => {
    const data = err?.response?.data
    if (!data) return "Network error — please try again"
    if (typeof data === "string") return data
    if (data.error) return String(data.error)
    if (data.detail) return String(data.detail)
    if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(", ") : String(data.non_field_errors)
    const fieldErrors = Object.entries(data)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : String(msgs)}`)
      .join(" | ")
    return fieldErrors || "Registration failed"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage(null)
    if (formData.username.trim().length < 3) {
      setMessage({ type: "error", text: "Username must be at least 3 characters" })
      setLoading(false); return
    }
    if (formData.password.length < 4) {
      setMessage({ type: "error", text: "Password must be at least 4 characters" })
      setLoading(false); return
    }
    if (formData.role === "employee" && !formData.manager_id) {
      setMessage({ type: "error", text: "Please select a manager for this employee" })
      setLoading(false); return
    }
    const payload: any = { username: formData.username.trim(), password: formData.password, role: formData.role }
    if (formData.role !== "admin" && formData.manager_id) payload.manager_id = formData.manager_id
    const token = Cookies.get("access")
    try {
      await axios.post(`${apiUrl}/api/register/`, payload, { headers: { Authorization: `Bearer ${token}` } })
      setMessage({ type: "success", text: `User "${formData.username}" created successfully!` })
      setFormData({ username: "", password: "", role: "employee", manager_id: "" })
      fetchEmployees()
    } catch (err: any) {
      setMessage({ type: "error", text: parseDjangoError(err) })
    } finally { setLoading(false) }
  }

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditData({
      username: user.username, role: user.role,
      manager_id: user.manager?.id || "",
      is_active: user.is_active ?? true,
      manager_name: user.manager?.name || user.manager?.username || ""
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setIsUpdating(true)
    const token = Cookies.get("access")
    try {
      await axios.put(`${apiUrl}/api/users/${selectedUser.id}/`, {
        username: editData.username, role: editData.role,
        manager: editData.manager_id || null, is_active: editData.is_active,
      }, { headers: { Authorization: `Bearer ${token}` } })
      fetchEmployees(); setSelectedUser(null)
    } catch (err) { console.error(err) } finally { setIsUpdating(false) }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.username?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full min-h-screen bg-[#f8f9fc]">
      <div className="p-6 md:p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-600 leading-tight">
                {employeesLoading ? <span className="text-slate-300">—</span> : employees.length}
                <span className="text-slate-500 font-semibold ml-2 text-xl">Employees</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage and view your team</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Candidate */}
            <button
              onClick={() => setShowAddCandidate(true)}
              className="flex items-center gap-2 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add User
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100/80 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setView("table")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER BAR — below header, above list */}
        <div className="flex items-center gap-3 mb-7">
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search employees…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-500 py-2.5 px-4 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        {/* EMPLOYEE LIST */}
        {employeesLoading ? (
          <div className="flex flex-col items-center justify-center h-72 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Loading employees...</p>
          </div>
        ) : (
          <>
            {view === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredEmployees.map(emp => <UserCard key={emp.id} data={emp} />)}
              </div>
            )}
            {view === 'table' && <EmployeeTable data={filteredEmployees} />}
            <div className="mt-5"><Pagination /></div>
          </>
        )}
      </div>

      {/* ADD CANDIDATE DRAWER */}
      {showAddCandidate && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => { setShowAddCandidate(false); setMessage(null) }}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl shadow-black/20 z-50 overflow-y-auto">
            <CreateUserForm
              formData={formData}
              setFormData={setFormData}
              managers={managers}
              loading={loading}
              message={message}
              setMessage={setMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default EmployeesListPage