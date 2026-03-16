"use client";

import { Fragment } from "react";
import { HRWithTemplates } from "@/lib/types/jobs";
import Image from "next/image";
import Table from "../Table";
import { useRouter } from "next/navigation";

interface EmailFormatProps {
    data: HRWithTemplates[];
}

const columns = [
    {
        header: "HR Name",
        accessor: "name",
        className: "p-6",
    },
    {
        header: "Contact",
        accessor: "contact",
        className: "hidden md:table-cell",
    },
    {
        header: "Company",
        accessor: "company",
        className: "hidden md:table-cell",
    },
    {
        header: "Created On",
        accessor: "createdAt",
        className: "hidden md:table-cell",
    },
    {
        header: "Action",
        accessor: "action",
        className: "hidden md:table-cell",
    },
];

const renderRow = ({
    item,
    onRowClick,
}: {
    item: HRWithTemplates;
    onRowClick?: (format: HRWithTemplates) => void;
}) => {
    return (
        <Fragment key={item.id}>
            <tr
                className="border-b-2 font-semibold border-gray-200 bg-white text-sm hover:bg-blueLight-50 cursor-pointer"
                onClick={() => onRowClick?.(item)}
            >
                <td className="flex items-center gap-4 p-4">
                    <Image
                        src={"/avatar.png"}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                    />
                    <div className="space-y-1">
                        <h3>{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.designation}</p>
                    </div>
                </td>

                <td className="hidden text-gray-600 md:table-cell space-y-2">
                    <div className="flex gap-2">
                        <Image
                            src={"/mail.png"}
                            alt=""
                            width={20}
                            height={20}
                            className="opacity-65"
                        />
                        {item.email}
                    </div>

                    <div className="flex gap-2">
                        <Image
                            src={"/phone.png"}
                            alt=""
                            width={20}
                            height={20}
                            className="opacity-65"
                        />
                        {item.number}
                    </div>
                </td>

                <td className="hidden text-gray-600 md:table-cell space-y-2">
                    {item.client.name}
                </td>

                <td className="hidden md:table-cell text-gray-600">
                    {item.templates.map((t) => (
                        <div key={t.id}>
                            {new Date(t.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                    ))}
                </td>

                <td className="hidden md:table-cell pl-4">
                    <button>
                        <Image
                            src={"/edit.png"}
                            alt=""
                            width={24}
                            height={24}
                            className="opacity-65 hover:opacity-80"
                        />
                    </button>
                </td>
            </tr>

            <tr>
                <td colSpan={columns.length}>
                    <div className="mb-4 bg-white px-4 py-2 space-y-2">
                        <div className="font-light text-sm">Email Format:</div>

                        <div className="bg-yellow-400 flex w-full border-2 border-black">
                            {item.templates.map((temp) => (
                                <Fragment key={temp.id}>
                                    {temp.fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="border-r-2 border-black px-4 py-2 text-sm font-bold"
                                        >
                                            {field.label}
                                        </div>
                                    ))}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </td>
            </tr>
        </Fragment>
    );
};

const EmailFormatList = ({ data }: EmailFormatProps) => {
    const router = useRouter();

    const handleRowClick = (format: HRWithTemplates) => {
        router.push(`clients/${format.id}`);
    };

    return (
        <Table
            columns={columns}
            data={data}
            renderRow={(item) => renderRow({ item, onRowClick: handleRowClick })}
        />
    );
};

export default EmailFormatList;