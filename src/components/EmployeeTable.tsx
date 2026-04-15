'use client'

import { Employee } from "@/lib/types"
import Image from "next/image"
import { useState, useEffect } from "react"
import Table from "./Table"
import EmployeeDetails from "./EmployeeDetails"
import axios from "axios"
import Cookies from "js-cookie"
import { apiUrl } from "@/lib/data"

interface EmployeeTableProps {
    data: any[]
}

const columns = [
    { header: "Employee Name", accessor: "name", className: "p-6" },
    { header: "Contact", accessor: "contact", className: "hidden md:table-cell" },
    { header: "Department", accessor: "department", className: "hidden md:table-cell" },
    { header: "Joined On", accessor: "joinedDate", className: "hidden md:table-cell" },
    { header: "Action", accessor: "action", className: "hidden md:table-cell" },
]

const renderRow = ({ item, onRowClick }: { item: any; onRowClick?: (employee: Employee) => void }) => {
    const getProfilePhoto = () => {
        if (item.profile_photo) {
            if (typeof item.profile_photo === "string") return `data:image/jpeg;base64,${item.profile_photo}`
            return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(item.profile_photo)))}`
        }
        return "/avatar.png"
    }

    return (
        <tr
            key={item.id}
            className="border-b-2 font-semibold border-gray-200 bg-white text-sm hover:bg-sky-50 cursor-pointer"
            onClick={() => onRowClick?.(item)}
        >
            <td className="flex items-center gap-4 p-4">
                <Image
                    src={getProfilePhoto()} alt={item.name || "Employee profile photo"}
                    width={40} height={40}
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/avatar.png" }}
                />
                <div className="space-y-1">
                    <h3>{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.designation}</p>
                </div>
            </td>
            <td className="hidden text-gray-600 md:table-cell space-y-2">
                <div className="flex gap-2">
                    <Image src="/mail.png" alt="/mail.png" width={20} height={20} className="opacity-65" />
                    {item.email}
                </div>
                <div className="flex gap-2">
                    <Image src="/phone.png" alt="/phone.png" width={20} height={20} className="opacity-65" />
                    {item.phone}
                </div>
            </td>
            <td className="hidden md:table-cell text-gray-600">{item.department}</td>
            <td className="hidden md:table-cell text-gray-600">
                {item.joining_date
                    ? new Date(item.joining_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "N/A"}
            </td>
            <td className="hidden md:table-cell pl-4">
                <button>
                    <Image src="/edit.png" alt="/edit.png" width={24} height={24} className="opacity-65 hover:opacity-80" />
                </button>
            </td>
        </tr>
    )
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ data }) => {
    const [profileIndex, setProfileIndex] = useState<number | null>(null)
    const [managers, setManagers] = useState<any[]>([])
    const [isUpdating, setIsUpdating] = useState(false)
    const [editData, setEditData] = useState({
        username: "",
        role: "employee",
        manager_id: "",
        is_active: true,
        manager_name: "",
    })

    // Fetch managers once on mount
    useEffect(() => {
        const fetchManagers = async () => {
            const token = Cookies.get("access")
            try {
                const res = await axios.get(`${apiUrl}/api/users/`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setManagers(res.data)
            } catch (err) {
                console.error("fetchManagers error:", err)
            }
        }
        fetchManagers()
    }, [])

    // Whenever the selected employee changes, seed editData from their current values
    useEffect(() => {
        if (profileIndex === null) return
        const emp = data[profileIndex]
        if (!emp) return
        setEditData({
            username: emp.username || "",
            role: emp.role || "employee",
            manager_id: emp.manager?.id ? String(emp.manager.id) : "",
            is_active: emp.is_active ?? true,
            manager_name: emp.manager?.name || emp.manager?.username || "",
        })
    }, [profileIndex, data])

    const currentEmployee = profileIndex !== null ? data[profileIndex] : null

    const handleRowClick = (employee: Employee) => {
        const index = data.findIndex((e) => e.id === employee.id)
        if (index !== -1) setProfileIndex(index)
    }

    const handlePrevEmployee = () => {
        if (profileIndex === null) return
        setProfileIndex((prev) => (prev === 0 ? data.length - 1 : (prev as number) - 1))
    }

    const handleNextEmployee = () => {
        if (profileIndex === null) return
        setProfileIndex((prev) => (prev === data.length - 1 ? 0 : (prev as number) + 1))
    }

    // PUT to /api/users/:id/ with the editData payload
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentEmployee) return
        setIsUpdating(true)
        const token = Cookies.get("access")
        try {
            await axios.put(
                `${apiUrl}/api/users/${currentEmployee.user_id}/`,
                {
                    username: editData.username,
                    role: editData.role,
                    manager: editData.manager_id || null,
                    is_active: editData.is_active,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Optimistically update the local data row so the panel reflects changes immediately
            data[profileIndex!] = {
                ...currentEmployee,
                username: editData.username,
                role: editData.role,
                is_active: editData.is_active,
                manager: managers.find((m) => String(m.id) === String(editData.manager_id)) || currentEmployee.manager,
            }
        } catch (err) {
            console.error("handleUpdate error:", err)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <>
            <Table
                columns={columns}
                data={data}
                renderRow={(item) => renderRow({ item, onRowClick: handleRowClick })}
            />

            {/* Side Panel */}
            <div
                className={`fixed overflow-y-auto top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ${profileIndex !== null ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-black"
                    onClick={() => setProfileIndex(null)}
                >
                    ✕
                </button>

                {currentEmployee && (
                    <EmployeeDetails
                        data={currentEmployee}
                        onPrev={handlePrevEmployee}
                        onNext={handleNextEmployee}
                        managers={managers}
                        editData={editData}
                        setEditData={setEditData}
                        isUpdating={isUpdating}
                        onUpdate={handleUpdate}
                    />
                )}
            </div>

            {/* Backdrop */}
            {profileIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setProfileIndex(null)}
                />
            )}
        </>
    )
}

export default EmployeeTable