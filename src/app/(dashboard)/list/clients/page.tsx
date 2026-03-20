"use client"

import { useEffect, useState } from "react";
import AddClientForm from "@/components/clients/AddClientModal";
import ClientCard from "@/components/clients/ClientCard";
import EmailFormatList from "@/components/clients/EmailFormatList";
import HRCard from "@/components/HR/HRCard";
import { clientApi } from "@/apis/clients/routes";
import { ClientWithHRs, HRWithClient } from "@/lib/types/jobs";
import AddContactPersonForm from "@/components/clients/AddContactPerson";

type ViewType = "client" | "hr";
type ModalState = "none" | "addClient" | "addContact";

const ClientsPage = () => {
    const tabs = ["Client & HR", "Email Templates"];
    const [activeTab, setActiveTab] = useState("Client & HR");
    const [view, setView] = useState<ViewType>("client");
    const [modal, setModal] = useState<ModalState>("none");
    const [newClientName, setNewClientName] = useState<string>("");
    const [newClientId, setNewClientId] = useState<number | null>(null);

    const [clients, setClients] = useState<ClientWithHRs[]>([]);
    const [hrdata, setHrdata] = useState<HRWithClient[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Fetch all clients with their HRs and contacts in parallel ───────────
    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);
            setError(null);

            const basicClients = await clientApi.getClient();

            // For each client, fetch HRs and contacts in parallel
            const toArray = (data: any): any[] => {
                if (!data) return [];
                if (Array.isArray(data)) return data;
                if (data.results) return data.results;
                if (data.data) return data.data;
                const vals = Object.values(data);
                if (vals.length > 0 && typeof vals[0] === "object") return vals as any[];
                if ((data as any).contact_id || (data as any).hr_id) return [data];
                return [];
            };

            const normalizeHR = (hr: any) => ({
                id: hr.hr_id ?? hr.id,
                clientId: hr.client_id ?? hr.clientId,
                name: hr.hr_name ?? hr.name,
                email: hr.hr_email ?? hr.email,
                designation: hr.hr_designation ?? hr.designation ?? "",
                number: hr.hr_phone ?? hr.number ?? "",
            });

            const normalizeContact = (c: any) => ({
                contact_id: c.contact_id,
                contact_name: c.contact_name,
                contact_email: c.contact_email,
                contact_phone: c.contact_phone,
                contact_role: c.contact_role ?? "",
            });

            const enriched = await Promise.all(
                basicClients.map(async (client: ClientWithHRs) => {
                    const [hrsRaw, contactsRaw] = await Promise.all([
                        clientApi.getClientHRs(client.client_id).catch(() => []),
                        clientApi.getClientContacts(client.client_id).catch(() => []),
                    ]);
                    const hrs = toArray(hrsRaw).map(normalizeHR);
                    const contacts = toArray(contactsRaw).map(normalizeContact);
                    return { ...client, hrs, contacts };
                })
            );

            setClients(enriched);
        } catch (err) {
            console.error("Failed to fetch clients:", err);
            setError("Failed to load clients. Please try again.");
        } finally {
            setIsLoadingClients(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleClientCreated = (client: { id: number | null; name: string }) => {
        setNewClientId(client.id);
        setNewClientName(client.name);
        setModal("addContact");
        fetchClients();
    };

    const handleContactCreated = () => {
        setModal("none");
        setNewClientId(null);
        fetchClients();
    };

    // ─── Render Content ──────────────────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case "Client & HR":
                return (
                    <div className="flex flex-col gap-6">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-md font-bold text-gray-800">
                                {view === "client" ? "Total Clients" : "Total HRs"}:
                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-md text-sm">
                                    {view === "client" ? clients.length : hrdata.length}
                                </span>
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    className="flex items-center gap-2.5 bg-indigo-500 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                    onClick={() => setModal("addClient")}
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

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Cards */}
                        {isLoadingClients ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {view === "client"
                                    ? clients.map((client) => (
                                        <ClientCard
                                            key={client.client_id}
                                            client={client}
                                            onRefresh={fetchClients}
                                        />
                                    ))
                                    : hrdata.map((hr) => <HRCard key={hr.id} details={hr} />)
                                }
                                {view === "client" && clients.length === 0 && !isLoadingClients && (
                                    <p className="text-sm text-gray-400 col-span-3 text-center py-10">
                                        No clients found. Add your first client!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Modals */}
                        {modal === "addClient" && (
                            <AddClientForm
                                onClose={() => setModal("none")}
                                onClientCreated={handleClientCreated}
                            />
                        )}
                        {modal === "addContact" && newClientId !== null && (
                            <AddContactPersonForm
                                clientId={newClientId}
                                clientName={newClientName}
                                onClose={() => setModal("none")}
                                onContactCreated={handleContactCreated}
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
                                0
                            </span>
                        </p>
                        <EmailFormatList data={[]} />
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
                {tabs.map((tab) => (
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

            {renderContent()}
        </div>
    );
};

export default ClientsPage;