"use client"

import AddClientForm from "@/components/clients/AddClientForm";
import ClientCard from "@/components/clients/ClientCard";
import EmailFormatList from "@/components/clients/EmailFormatList";
import HRCard from "@/components/HR/HRCard";
import { clients, hr, template } from "@/lib/types/jobdata"
import { Client, ClientWithHRs, EmailTemplate, HR, HRWithClient, HRWithTemplates, TemplateWithHR } from "@/lib/types/jobs";
import { useState } from "react"

function getClientsWithHRs(clients: Client[], hrs: HR[]): ClientWithHRs[] {
    return clients.map(client => ({
        ...client,
        hrs: hr.filter(h => h.clientId === client.id)
    }));
};

function getHRsWithClients(hr: HR[], clients: Client[]): HRWithClient[] {
    return hr.map(h => {
        const relatedClient = clients.find(c => c.id === h.clientId);
        if (!relatedClient) throw new Error(`Client not found for HR ID: ${h.id}`);
        return { ...h, client: relatedClient };
    });
}

function getTemplateWithHR(hr: HR[], clients: Client[], templates: EmailTemplate[]): HRWithTemplates[] {
    return hr.map((h) => {
        const hrTemplates = templates.filter((tpl) => tpl.hrId === h.id);
        const relatedClient = clients.find(c => c.id === h.clientId);
        if (!relatedClient) throw new Error(`Client not found for HR ID: ${h.id}`);
        return { ...h, client: relatedClient, templates: hrTemplates };
    });
}

const data = getClientsWithHRs(clients, hr);
const hrdata = getHRsWithClients(hr, clients);
const templateData = getTemplateWithHR(hr, clients, template);

const ClientsPage = () => {
    const tabs = ["Client & HR", "Email Templates"];
    const [activeTab, setActiveTab] = useState('Client & HR');
    type ViewType = 'client' | 'hr';
    const [view, setView] = useState<ViewType>('client');
    const [open, setOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case "Client & HR":
                return (
                    <div className="flex flex-col gap-6">
                        {/* Toolbar row */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">

                            {/* Count badge */}
                            <p className="text-md font-bold text-gray-800">
                                {view === 'client' ? 'Total Clients' : 'Total HRs'}:
                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-md text-sm">
                                    {view === 'client' ? data.length : hrdata.length}
                                </span>
                            </p>

                            {/* Right side: Add button + view toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    className="flex items-center gap-2.5 bg-indigo-500 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                    onClick={() => setOpen(true)}
                                >
                                    Add Client
                                </button>

                                <div className="inline-flex font-semibold rounded-md shadow-sm border border-gray-300 overflow-hidden">
                                    <button
                                        onClick={() => setView("client")}
                                        className={`px-4 py-2.5 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                            ${view === "client"
                                                ? "bg-white text-gray-900"
                                                : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        Clients
                                    </button>
                                    <button
                                        onClick={() => setView("hr")}
                                        className={`px-4 py-2.5 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                            ${view === "hr"
                                                ? "bg-white text-gray-900"
                                                : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        HRs
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cards grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {view === 'client'
                                ? data.map((client) => <ClientCard key={client.id} client={client} />)
                                : hrdata.map((hr) => <HRCard key={hr.id} details={hr} />)
                            }
                        </div>

                        {open && (
                            <AddClientForm
                                onClose={() => setOpen(false)}
                                onClientCreated={() => setOpen(false)}
                            />
                        )}
                    </div>
                );

            case "Email Templates":
                return (
                    <div className="flex flex-col gap-6">
                        <p className="text-md font-bold text-gray-800">
                            Active Templates:
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-md text-sm">
                                {templateData.length}
                            </span>
                        </p>
                        <EmailFormatList data={templateData} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-screen bg-sky-50 p-6">
            {/* Tab bar */}
            <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 transition-colors ${activeTab === tab
                            ? "border-b-2 border-blue-600 text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Page content */}
            {renderContent()}
        </div>
    );
};

export default ClientsPage;