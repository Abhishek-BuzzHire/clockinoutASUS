import { ClientWithHRs, Contact, HR } from "@/lib/types/jobs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import AddClientHR from "./AddClientHR"
import AddContactPersonForm from "./AddContactPerson"

interface ClientCardProps {
    client: ClientWithHRs
    onRefresh: () => void
}

const getCreatedAgo = (dateStr: string): string => {
    const created = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Added today"
    if (diffDays === 1) return "Added 1 day ago"
    if (diffDays < 30) return `Added ${diffDays} days ago`
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths === 1) return "Added 1 month ago"
    if (diffMonths < 12) return `Added ${diffMonths} months ago`
    const diffYears = Math.floor(diffMonths / 12)
    return diffYears === 1 ? "Added 1 year ago" : `Added ${diffYears} years ago`
}

// ── Inline edit state types ──────────────────────────────────────────────────

interface EditingContact {
    contact_name: string
    contact_email: string
    contact_phone: string
    contact_role: string
}

interface EditingHR {
    name: string
    email: string
    hr_phone: string
    designation: string
}

// ── Small confirm-delete modal ───────────────────────────────────────────────

const ConfirmDelete = ({
    label,
    onConfirm,
    onCancel,
}: {
    label: string
    onConfirm: () => void
    onCancel: () => void
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 space-y-4">
            <p className="text-sm font-semibold text-gray-700 text-center">
                Remove <span className="text-red-500">{label}</span>?
            </p>
            <p className="text-xs text-gray-400 text-center">This action cannot be undone.</p>
            <div className="flex gap-3 pt-1">
                <button
                    onClick={onCancel}
                    className="flex-1 text-sm font-medium border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 text-sm font-medium bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 transition"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
)

// ── Main component ───────────────────────────────────────────────────────────

const ClientCard = ({ client, onRefresh }: ClientCardProps) => {
    const router = useRouter()
    const [openHRForm, setOpenHRForm] = useState(false)
    const [openContactForm, setOpenContactForm] = useState(false)

    // contact CRUD state
    const [editingContactId, setEditingContactId] = useState<number | null>(null)
    const [editingContactData, setEditingContactData] = useState<EditingContact | null>(null)
    const [deletingContactId, setDeletingContactId] = useState<number | null>(null)
    const [contactLoading, setContactLoading] = useState(false)

    // HR CRUD state
    const [editingHRId, setEditingHRId] = useState<number | null>(null)
    const [deletingHRId, setDeletingHRId] = useState<number | null>(null)
    const [editingHRData, setEditingHRData] = useState<EditingHR | null>(null)
    const [hrLoading, setHRLoading] = useState(false)

    const hrs: HR[] = client.hrs ?? []
    const contacts: Contact[] = client.contacts ?? []

    // ── Contact handlers ────────────────────────────────────────────────────

    const startEditContact = (c: Contact) => {
        setEditingContactId(c.contact_id ?? null)
        setEditingContactData({
            contact_name: c.contact_name,
            contact_email: c.contact_email,
            contact_phone: c.contact_phone,
            contact_role: c.contact_role ?? "",
        })
    }

    const cancelEditContact = () => {
        setEditingContactId(null)
        setEditingContactData(null)
    }

    const saveContact = async (contactId: number) => {
        if (!editingContactData) return
        setContactLoading(true)
        try {
            const res = await fetch(`/api/clients/contacts/${contactId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingContactData),
            })
            if (!res.ok) throw new Error("Failed to update contact")
            cancelEditContact()
            onRefresh()
        } catch (err) {
            console.error(err)
        } finally {
            setContactLoading(false)
        }
    }

    const deleteContact = async (contactId: number) => {
        setContactLoading(true)
        try {
            const res = await fetch(`/api/clients/contacts/${contactId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete contact")
            setDeletingContactId(null)
            onRefresh()
        } catch (err) {
            console.error(err)
        } finally {
            setContactLoading(false)
        }
    }

    // ── HR handlers ─────────────────────────────────────────────────────────

    const startEditHR = (hr: HR) => {
        setEditingHRId(hr.id)
        setEditingHRData({
            name: hr.name,
            email: hr.email,
            hr_phone: hr.hr_phone.toString(),
            designation: hr.designation,
        })
    }

    const cancelEditHR = () => {
        setEditingHRId(null)
        setEditingHRData(null)
    }

    const saveHR = async (hrId: number) => {
        if (!editingHRData) return
        setHRLoading(true)
        try {
            const res = await fetch(`/api/clients/hrs/${hrId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingHRData),
            })
            if (!res.ok) throw new Error("Failed to update HR")
            cancelEditHR()
            onRefresh()
        } catch (err) {
            console.error(err)
        } finally {
            setHRLoading(false)
        }
    }

    const deleteHR = async (hrId: number) => {
        setHRLoading(true)
        try {
            const res = await fetch(`/api/clients/hrs/${hrId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete HR")
            setDeletingHRId(null)
            onRefresh()
        } catch (err) {
            console.error(err)
        } finally {
            setHRLoading(false)
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <Card className="w-full min-w-[200px] shadow-md">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold mt-1">
                                {client.client_name}
                            </CardTitle>
                            <CardDescription className="text-sm font-semibold text-gray-400">
                                {client.client_industry}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            🕒 {getCreatedAgo(client.created_at)}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="text-sm space-y-6">

                    {/* ── Client Contacts ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Client Contacts
                            </span>
                            <button
                                onClick={() => setOpenContactForm(true)}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all"
                            >
                                <span className="text-base leading-none">+</span> Add Contact
                            </button>
                        </div>

                        <div className="w-full bg-sky-50 rounded-md p-4 space-y-4">
                            {contacts.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-2">No contacts added yet</p>
                            ) : (
                                contacts.map((c) => {
                                    const cId = c.contact_id
                                    const isEditing = editingContactId === cId

                                    return (
                                        <div
                                            key={cId}
                                            className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                        >
                                            {isEditing && editingContactData ? (
                                                /* ── Edit mode ── */
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            className="col-span-2 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Name"
                                                            value={editingContactData.contact_name}
                                                            onChange={(e) =>
                                                                setEditingContactData((prev) => prev && { ...prev, contact_name: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Role"
                                                            value={editingContactData.contact_role}
                                                            onChange={(e) =>
                                                                setEditingContactData((prev) => prev && { ...prev, contact_role: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Phone"
                                                            value={editingContactData.contact_phone}
                                                            onChange={(e) =>
                                                                setEditingContactData((prev) => prev && { ...prev, contact_phone: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="col-span-2 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Email"
                                                            value={editingContactData.contact_email}
                                                            onChange={(e) =>
                                                                setEditingContactData((prev) => prev && { ...prev, contact_email: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            onClick={cancelEditContact}
                                                            className="flex-1 text-xs font-medium border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            disabled={contactLoading}
                                                            onClick={() => saveContact(cId)}
                                                            className="flex-1 text-xs font-semibold bg-indigo-500 text-white rounded-lg py-1.5 hover:bg-indigo-600 transition disabled:opacity-60"
                                                        >
                                                            {contactLoading ? "Saving…" : "Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ── View mode ── */
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm flex-shrink-0">
                                                            {c.contact_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{c.contact_name}</p>
                                                            {c.contact_role && (
                                                                <p className="text-xs text-sky-500 font-medium">{c.contact_role}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="text-xs text-gray-500 space-y-1 text-right">
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <Image src="/mail.png" alt="" width={14} height={14} className="opacity-50" />
                                                                <a href={`mailto:${c.contact_email}`} className="hover:text-blue-500 hover:underline">
                                                                    {c.contact_email}
                                                                </a>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <Image src="/phone.png" alt="" width={14} height={14} className="opacity-50" />
                                                                <span>{c.contact_phone}</span>
                                                            </div>
                                                        </div>
                                                        {/* Edit / Delete buttons */}
                                                        <div className="flex gap-1.5 mt-1.5">
                                                            <button
                                                                onClick={() => startEditContact(c)}
                                                                className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingContactId(cId ?? null)}
                                                                className="text-[10px] font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* ── HR Representatives ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                HR Representatives
                            </span>
                            <button
                                onClick={() => setOpenHRForm(true)}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
                            >
                                <span className="text-base leading-none">+</span> Add HR
                            </button>
                        </div>

                        <div className="w-full bg-sky-50 rounded-md p-4 space-y-4">
                            {hrs.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-2">No HRs added yet</p>
                            ) : (
                                hrs.map((hr) => {
                                    const isEditing = editingHRId === hr.id

                                    return (
                                        <div
                                            key={hr.id}
                                            className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                        >
                                            {isEditing && editingHRData ? (
                                                /* ── Edit mode ── */
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            className="col-span-2 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Name"
                                                            value={editingHRData.name}
                                                            onChange={(e) =>
                                                                setEditingHRData((prev) => prev && { ...prev, name: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Designation"
                                                            value={editingHRData.designation}
                                                            onChange={(e) =>
                                                                setEditingHRData((prev) => prev && { ...prev, designation: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Phone"
                                                            value={editingHRData.hr_phone}
                                                            onChange={(e) =>
                                                                setEditingHRData((prev) => prev && { ...prev, hr_phone: e.target.value })
                                                            }
                                                        />
                                                        <input
                                                            className="col-span-2 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            placeholder="Email"
                                                            value={editingHRData.email}
                                                            onChange={(e) =>
                                                                setEditingHRData((prev) => prev && { ...prev, email: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            onClick={cancelEditHR}
                                                            className="flex-1 text-xs font-medium border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            disabled={hrLoading}
                                                            onClick={() => saveHR(hr.id)}
                                                            className="flex-1 text-xs font-semibold bg-indigo-500 text-white rounded-lg py-1.5 hover:bg-indigo-600 transition disabled:opacity-60"
                                                        >
                                                            {hrLoading ? "Saving…" : "Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ── View mode ── */
                                                <div className="flex justify-between items-start">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer"
                                                        onClick={() => router.push(`/list/clients/${hr.id}`)}
                                                    >
                                                        <Image
                                                            src="/avatar.png"
                                                            alt={hr.name}
                                                            width={36}
                                                            height={36}
                                                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{hr.name}</p>
                                                            <p className="text-xs text-indigo-500 font-medium">{hr.designation}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="text-xs text-gray-500 space-y-1 text-right">
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <Image src="/mail.png" alt="" width={14} height={14} className="opacity-50" />
                                                                <span>{hr.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <Image src="/phone.png" alt="" width={14} height={14} className="opacity-50" />
                                                                <span>{hr.hr_phone}</span>
                                                            </div>
                                                        </div>
                                                        {/* Edit / Delete buttons */}
                                                        <div className="flex gap-1.5 mt-1.5">
                                                            <button
                                                                onClick={() => startEditHR(hr)}
                                                                className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingHRId(hr.id)}
                                                                className="text-[10px] font-semibold text-red-400 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* ── Modals ── */}

            {openHRForm && (
                <AddClientHR
                    onClose={() => setOpenHRForm(false)}
                    clientId={client.client_id}
                    onHRAdded={() => { setOpenHRForm(false); onRefresh() }}
                />
            )}

            {openContactForm && (
                <AddContactPersonForm
                    clientId={client.client_id}
                    clientName={client.client_name}
                    onClose={() => setOpenContactForm(false)}
                    onContactCreated={() => { setOpenContactForm(false); onRefresh() }}
                />
            )}

            {deletingContactId && (
                <ConfirmDelete
                    label={contacts.find((c) => (c.contact_id ?? c.contact_email) === deletingContactId)?.contact_name ?? "contact"}
                    onCancel={() => setDeletingContactId(null)}
                    onConfirm={() => deleteContact(deletingContactId)}
                />
            )}

            {deletingHRId && (
                <ConfirmDelete
                    label={hrs.find((h) => h.id === deletingHRId)?.name ?? "HR"}
                    onCancel={() => setDeletingHRId(null)}
                    onConfirm={() => deleteHR(deletingHRId)}
                />
            )}
        </>
    )
}

export default ClientCard