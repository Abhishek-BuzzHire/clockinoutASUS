import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { X, Loader2, Mail, Phone, Trash2, CheckCircle2, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DuplicateGroup {
  identifier: string;
  count: number;
  duplicates: {
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    cv_url: string;
  }[];
}

export function DuplicateResolverModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"email" | "phone">("email");
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null); // To track which group is being deleted

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("access");
      const res = await axios.get(`${API_URL}/api/candidates/duplicates/?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch duplicates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, [type]);

  const handleResolve = async (group: DuplicateGroup) => {
    setResolving(group.identifier);
    try {
      // Find oldest (first element in sorted duplicates by created_at)
      const oldestId = group.duplicates[0].id;
      const deleteIds = group.duplicates.filter(d => d.id !== oldestId).map(d => d.id);
      
      const token = Cookies.get("access");
      await axios.post(`${API_URL}/api/candidates/duplicates/`, {
        delete_ids: deleteIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from UI
      setGroups(prev => prev.filter(g => g.identifier !== group.identifier));
    } catch (err) {
      console.error("Failed to resolve:", err);
      alert("Failed to resolve duplicates. Please try again.");
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Resolve Duplicate Resumes</h2>
            <p className="text-sm text-slate-500 mt-1">Keep the oldest profile and remove the rest automatically.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 p-6 border-b bg-slate-50">
          <button 
            onClick={() => setType("email")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${type === "email" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Mail className="w-4 h-4" /> Find by Email
          </button>
          <button 
            onClick={() => setType("phone")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${type === "phone" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            <Phone className="w-4 h-4" /> Find by Phone
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p className="font-medium">Scanning 46,000+ records for duplicates...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-400" />
              <p className="font-semibold text-lg">No duplicates found!</p>
              <p className="text-sm">Your database is clean for this criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.identifier} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        {type === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{group.identifier}</h3>
                        <p className="text-xs font-semibold text-rose-500">{group.count} Resumes Found</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResolve(group)}
                      disabled={resolving === group.identifier}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {resolving === group.identifier ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Resolving...</>
                      ) : (
                        <><Trash2 className="w-4 h-4" /> Keep Oldest & Delete Rest</>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                    {group.duplicates.map((doc, idx) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{doc.name || "Unknown Name"}</span>
                          <span className="text-xs text-slate-500">Uploaded: {new Date(doc.created_at).toLocaleString()}</span>
                        </div>
                        {idx === 0 ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">✅ Original (Keep)</span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-wider">❌ Duplicate (Delete)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
