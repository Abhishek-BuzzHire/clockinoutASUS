import { clientApi } from "@/apis/clients/routes";
import AddClientForm from "@/components/clients/AddClientModal";
import AddJobForm from "@/components/jobs/AddJobModal";
import EventModal from "@/components/events/EventModal";
import Image from "next/image";
import { useState } from "react";

type Client = {
  client_id: number | null;
  client_name: string;
  client_industry: string;
};

const ActionButton = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openJob, setOpenJob] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [existingClients, setExistingClients] = useState<Client[]>([]);

  const handleOpen = async (type: "job") => {
    setIsCreateOpen(false);
    if (type === "job") {
      try {
        const clients = await clientApi.getClient();
        setExistingClients(clients || []);
        setOpenJob(true);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setExistingClients([]);
        setOpenJob(true);
      }
    }
  };

  return (
    <>
      <div className="relative">
        <div
          className="bg-indigo-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-700 transition-colors"
          onClick={() => setIsCreateOpen(!isCreateOpen)}
        >
          <Image className="invert brightness-0" src="/plus.png" alt="Create" width={20} height={20} />
        </div>

        {isCreateOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsCreateOpen(false)} />
            <div className="absolute text-sm top-5 right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20">
              <ul className="py-2">
                <li className="px-4 py-1 hover:bg-gray-100 cursor-pointer">
                  Add Candidate
                </li>
                <li
                  className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setIsCreateOpen(false); setOpenEvent(true); }}
                >
                  Add Event
                </li>
                <li
                  className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOpen("job")}
                >
                  Add Job
                </li>
                <li
                  className="px-4 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setIsCreateOpen(false); setOpenClient(true); }}
                >
                  Add Client
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {openJob && (
        <AddJobForm
          onClose={() => setOpenJob(false)}
          existingClients={existingClients}
        />
      )}

      {openClient && (
        <AddClientForm
          onClose={() => setOpenClient(false)}
          onClientCreated={() => setOpenClient(false)}
        />
      )}

      {/* Single entry point — picker shows first, then opens interview or event modal */}
      <EventModal
        open={openEvent}
        onClose={() => setOpenEvent(false)}
      />
    </>
  );
};

export default ActionButton;