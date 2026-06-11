import { Employee } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import Table from "./Table";
import EmployeeDetails from "./EmployeeDetails";
import { apiUrl } from "@/lib/data";


interface EmployeeTableProps {
    data: any[];
}

const columns = [
    {
        header: "Employee Name",
        accessor: "name",
        className: "p-6"
    },
    {
        header: "Contact",
        accessor: "contact",
        className: "hidden md:table-cell"
    },
    {
        header: "Department",
        accessor: "department",
        className: "hidden md:table-cell"
    },
    {
        header: "Joined On",
        accessor: "joinedDate",
        className: "hidden md:table-cell"
    },
    // {
    //     header: "Today's Status",
    //     accessor: "status",
    //     className: ""
    // },
    {
        header: "Action",
        accessor: "action",
        className: "hidden md:table-cell"
    }
]

const renderRow = ({ item, onRowClick }: { item: any, onRowClick?: (employee: Employee) => void; }) => {

    const getProfilePhoto = () => {
        if (item.profile_photo) {
            if (typeof item.profile_photo === 'string') {
                if (item.profile_photo.startsWith('/api/')) {
                    return `${apiUrl}${item.profile_photo}?t=${Date.now()}`;
                }
                return `data:image/jpeg;base64,${item.profile_photo}`;
            }
            return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(item.profile_photo)))}`;
        }
        return "/avatar.png";
    };

    return (
        <tr key={item.id} className="border-b-2 font-semibold border-gray-200 bg-white text-sm hover:bg-sky-50 cursor-pointer" onClick={() => onRowClick?.(item)}>
            <td className="flex items-center gap-4 p-4">
                <img src={getProfilePhoto()} alt={item.name} className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("/avatar.png")) target.src = "/avatar.png";
                    }} />
                <div className="space-y-1">
                    <h3>{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.designation}</p>
                </div>
            </td>
            <td className="hidden text-gray-600 md:table-cell space-y-2">
                <div className="flex gap-2">
                    <Image src={"/mail.png"} alt="" width={20} height={20} className="opacity-65" />
                    {item.email}
                </div>
                <div className="flex gap-2">
                    <Image src={"/phone.png"} alt="" width={20} height={20} className="opacity-65" />
                    {item.phone}
                </div>
            </td>

            <td className="hidden md:table-cell text-gray-600">{item.department}</td>
            <td className="hidden md:table-cell text-gray-600">{item.joining_date
                ? new Date(item.joining_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : "N/A"
            }</td>
            {/* <td className="">
                <div className={`p-2 text-center mr-4 text-sm border-2 rounded-lg ${item.isPresentToday ? "border-green-600 text-green-600 bg-green-100" : "border-red-600 text-red-600 bg-red-100"}`}>
                    {item.isPresentToday ? "Present" : "Absent"}
                </div>
            </td> */}
            <td className="hidden md:table-cell pl-4">
                <button ><Image src={"/edit.png"} alt="" width={24} height={24} className="opacity-65 hover:opacity-80" /></button>
            </td>
        </tr>
    )
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ data }) => {

    // Instead of storing employee object → store index
    const [profileIndex, setProfileIndex] = useState<number | null>(null);

    // Current employee derived from index
    const currentEmployee =
        profileIndex !== null ? data[profileIndex] : null;

    // Row Click → Set Index
    const handleRowClick = (employee: Employee) => {
        const index = data.findIndex(e => e.id === employee.id);
        if (index !== -1) setProfileIndex(index);
    };

    // Navigation
    const handlePrevEmployee = () => {
        if (profileIndex === null) return;

        setProfileIndex(prev =>
            prev === 0 ? data.length - 1 : (prev as number) - 1
        );
    };

    const handleNextEmployee = () => {
        if (profileIndex === null) return;

        setProfileIndex(prev =>
            prev === data.length - 1 ? 0 : (prev as number) + 1
        );
    };

    return (
        <>
            <Table
                columns={columns}
                data={data}
                renderRow={(item) =>
                    renderRow({
                        item,
                        onRowClick: handleRowClick
                    })
                }
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
    );
};


export default EmployeeTable;