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

const ClientCard = ({ client, onRefresh }: ClientCardProps) => {
    const router = useRouter()
    const [openHRForm, setOpenHRForm] = useState(false)
    const [openContactForm, setOpenContactForm] = useState(false)

    const hrs: HR[] = client.hrs ?? []
    const contacts: Contact[] = client.contacts ?? []

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
                                contacts.map((c) => (
                                    <div
                                        key={c.contact_id ?? c.contact_email}
                                        className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                    >
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
                                    </div>
                                ))
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
                                hrs.map((hr) => (
                                    <div
                                        key={hr.id}
                                        className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-0 last:pb-0 hover:cursor-pointer"
                                        onClick={() => router.push(`/list/clients/${hr.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
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
                                        <div className="text-xs text-gray-500 space-y-1 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Image src="/mail.png" alt="" width={14} height={14} className="opacity-50" />
                                                <span>{hr.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Image src="/phone.png" alt="" width={14} height={14} className="opacity-50" />
                                                <span>{hr.number}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </CardContent>
            </Card>

            {openHRForm && (
                <AddClientHR
                    onClose={() => setOpenHRForm(false)}
                    clientId={client.client_id}
                    onHRAdded={() => {
                        setOpenHRForm(false)
                        onRefresh()
                    }}
                />
            )}

            {openContactForm && (
                <AddContactPersonForm
                    clientId={client.client_id}
                    clientName={client.client_name}
                    onClose={() => setOpenContactForm(false)}
                    onContactCreated={() => {
                        setOpenContactForm(false)
                        onRefresh()
                    }}
                />
            )}
        </>
    )
}

export default ClientCard