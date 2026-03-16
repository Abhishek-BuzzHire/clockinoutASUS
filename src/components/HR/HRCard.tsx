import { HRWithClient } from "@/lib/types/jobs"
import { Card, CardContent } from "../ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ClientCardProps {
    details: HRWithClient
}

const HRCard = ({ details }: ClientCardProps) => {
    const router = useRouter()

    return (
        <Card className="w-full min-w-[200px] shadow-md border border-indigo-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-200">
                                <Image
                                    src="/avatar.png"
                                    alt={details.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800 leading-tight">{details.name}</h3>
                            <p className="text-xs text-indigo-500 font-medium mt-0.5">{details.designation}</p>
                        </div>
                    </div>
                    {/* Client badge */}
                    <span className="hidden md:inline-flex items-center text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full border border-indigo-100 whitespace-nowrap">
                        {details.client.name}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-4" />

                {/* Contact info */}
                <div className="hidden md:flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <Image src="/mail.png" alt="" width={14} height={14} className="opacity-50 shrink-0" />
                        <span className="truncate">{details.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <Image src="/phone.png" alt="" width={14} height={14} className="opacity-50 shrink-0" />
                        <span>{details.number}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push(`clients/${details.id}`)}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg px-4 py-2 transition-colors duration-150"
                    >
                        View Template
                        <Image src="/chev-right.png" alt="" width={14} height={14} className="invert brightness-0" />
                    </button>
                    <span className="md:hidden text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {details.client.name}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

export default HRCard