import { ClientWithHRs } from "@/lib/types/jobs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import AddClientHR from "./AddClientHR"

interface ClientCardProps {
    client: ClientWithHRs
}

const ClientCard = ({ client }: ClientCardProps) => {
    const router = useRouter()
    const [openHRForm, setOpenHRForm] = useState(false)

    return (
        <>
            <Card className="w-full min-w-[200px] shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold mt-1">{client.name}</CardTitle>
                    <CardDescription className="text-sm font-semibold text-gray-400">{client.industry}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <span className="text-sm text-gray-500">Contact Person:</span>
                    <div className="flex items-center gap-4 p-4">
                        <Image src="/avatar.png" alt={client.contactPerson} width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
                        <div className="space-y-1">
                            <h3>{client.contactPerson}</h3>
                            <p className="text-xs text-gray-500">{client.contactPersonNumber}</p>
                        </div>
                    </div>

                    <div className="block items-center mt-4">
                        {/* HR header row with Add HR button */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">HR Representatives:</span>
                            <button
                                onClick={() => setOpenHRForm(true)}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
                            >
                                <span className="text-base leading-none">+</span> Add HR
                            </button>
                        </div>

                        <div className="my-2 w-full bg-sky-50 rounded-md p-4 space-y-4">
                            {client.hrs.map((hr) => (
                                <div
                                    key={hr.id}
                                    className="flex justify-between border-b-2 border-gray-300 pb-4 hover:cursor-pointer"
                                    onClick={() => router.push(`/list/clients/${hr.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <Image src="/avatar.png" alt={hr.name} width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
                                        <div className="space-y-1">
                                            <h3>{hr.name}</h3>
                                            <p className="text-xs text-gray-500">{hr.designation}</p>
                                        </div>
                                    </div>
                                    <div className="hidden text-gray-600 md:table-cell space-y-2 max-w-[250px] truncate">
                                        <div className="flex gap-2">
                                            <Image src={"/mail.png"} alt="" width={20} height={20} className="opacity-65" />
                                            {hr.email}
                                        </div>
                                        <div className="flex gap-2">
                                            <Image src={"/phone.png"} alt="" width={20} height={20} className="opacity-65" />
                                            {hr.number}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 font-semibold text-gray-800 mt-4">
                        <span>Location: </span>
                        <span className="font-normal">{client.location}</span>
                    </div>
                </CardContent>
            </Card>

            {openHRForm && (
                <AddClientHR
                    onClose={() => setOpenHRForm(false)}
                    clientId={client.id}
                />
            )}
        </>
    )
}

export default ClientCard