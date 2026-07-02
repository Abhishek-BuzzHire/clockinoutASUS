"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

interface DocumentTypeDefinition {
  id: string;
  name: string;
  section: string;
  subDocs?: { id: string; label: string }[];
}

const ALL_DOC_TYPES: DocumentTypeDefinition[] = [
  { 
    id: "aadhar/driving", 
    name: "Aadhar Card / Driving Licence", 
    section: "Identity",
    subDocs: [
      { id: "aadhar_front", label: "Front Side" },
      { id: "aadhar_back", label: "Back Side" }
    ]
  },
  { id: "pan", name: "PAN Card", section: "Identity" },
  { id: "10th_marksheet", name: "10th Marksheet", section: "Education" },
  { id: "12th_marksheet", name: "12th Marksheet", section: "Education" },
  { id: "graduation_degree", name: "Graduation Degree", section: "Education" },
  { id: "postgraduation_degree", name: "Postgraduation Degree", section: "Education" },
  { id: "offer_letter", name: "Offer Letter", section: "Employment" },
  { id: "relieving_letter", name: "Relieving Letter", section: "Employment" },
  { id: "resignation_mail", name: "Resignation Acceptance Mail", section: "Employment" },
];

const getDocumentIcon = (docId: string) => {
  switch (docId) {
      case 'aadhar/driving': return <img src="https://upload.wikimedia.org/wikipedia/en/c/cf/Aadhaar_Logo.svg" alt="Aadhar" className="w-8 h-8 object-contain" />;
      case 'pan': return <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Logo_of_Income_Tax_Department_India.png/250px-Logo_of_Income_Tax_Department_India.png" alt="PAN" className="w-8 h-8 object-contain" />;
      case '10th_marksheet': 
      case '12th_marksheet': return <img src="https://upload.wikimedia.org/wikipedia/en/9/95/CBSE_new_logo.svg" alt="CBSE" className="w-8 h-8 object-contain" />;
      case 'graduation_degree': return <img src="https://img.icons8.com/color/48/diploma.png" alt="Graduation" className="w-8 h-8 object-contain" />;
      case 'postgraduation_degree': return <img src="https://img.icons8.com/color/48/graduation-cap.png" alt="Postgraduation" className="w-8 h-8 object-contain" />;
      case 'offer_letter': return <img src="https://img.icons8.com/color/48/contract-job.png" alt="Offer Letter" className="w-8 h-8 object-contain" />;
      case 'relieving_letter': return <img src="https://img.icons8.com/color/48/exit-sign.png" alt="Relieving Letter" className="w-8 h-8 object-contain" />;
      case 'resignation_mail': return <img src="https://img.icons8.com/color/48/new-post.png" alt="Mail" className="w-8 h-8 object-contain" />;
      default: return <img src="https://img.icons8.com/color/48/document.png" alt="Document" className="w-8 h-8 object-contain" />;
  }
};

type DocStatus = "PENDING" | "VERIFIED" | "REJECTED" | "NOT_UPLOADED";

interface DocRecord {
  doc_type: string;
  status: DocStatus;
  file_url?: string;
  submitted_at?: string;
  admin_comment?: string;
}

const StatusBadge = ({ status }: { status: DocStatus }) => {
  const config: Record<DocStatus, { label: string; className: string; Icon: any }> = {
    VERIFIED:     { label: "Verified",     className: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle },
    PENDING:      { label: "Pending",      className: "bg-amber-50 text-amber-700 border-amber-200",       Icon: Clock       },
    REJECTED:     { label: "Rejected",     className: "bg-red-50 text-red-700 border-red-200",             Icon: XCircle     },
    NOT_UPLOADED: { label: "Not Uploaded", className: "bg-slate-50 text-slate-500 border-slate-200",       Icon: FileText    },
  };
  const { label, className, Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// HELPER LOGIC FOR COMBINED STATUS
const getAggregatedStatus = (doc: DocumentTypeDefinition, getRecord: (id: string) => DocRecord | undefined): DocStatus => {
  if (doc.subDocs) {
    const statuses = doc.subDocs.map(sub => getRecord(sub.id)?.status || "NOT_UPLOADED");
    if (statuses.includes("REJECTED")) return "REJECTED";
    if (statuses.includes("PENDING")) return "PENDING";
    if (statuses.every(s => s === "VERIFIED")) return "VERIFIED";
    if (statuses.every(s => s === "NOT_UPLOADED")) return "NOT_UPLOADED";
    return "PENDING"; // Partial uploads shown as pending
  }
  return getRecord(doc.id)?.status || "NOT_UPLOADED";
};

const getEarliestSubmission = (doc: DocumentTypeDefinition, getRecord: (id: string) => DocRecord | undefined) => {
  if (doc.subDocs) {
    const dates = doc.subDocs.map(sub => getRecord(sub.id)?.submitted_at).filter(Boolean) as string[];
    return dates.length > 0 ? dates.sort()[0] : undefined;
  }
  return getRecord(doc.id)?.submitted_at;
};

const getCombinedComments = (doc: DocumentTypeDefinition, getRecord: (id: string) => DocRecord | undefined) => {
  if (doc.subDocs) {
    return doc.subDocs.map(sub => getRecord(sub.id)?.admin_comment).filter(Boolean).join(" | ");
  }
  return getRecord(doc.id)?.admin_comment;
};

const DocumentPreviewModal = ({
  doc,
  getRecord,
  onClose,
  onAction,
}: {
  doc: DocumentTypeDefinition;
  getRecord: (id: string) => DocRecord | undefined;
  onClose: () => void;
  onAction: (docIds: string[], action: "VERIFIED" | "REJECTED", comment: string) => void;
}) => {
  const combinedComment = getCombinedComments(doc, getRecord) || "";
  const [comment, setComment] = useState(combinedComment);
  const [acting, setActing] = useState(false);
  
  const status = getAggregatedStatus(doc, getRecord);
  const submittedAt = getEarliestSubmission(doc, getRecord);
  const canAct = status === "PENDING";

  // Gather documents to preview
  const previewItems = doc.subDocs 
    ? doc.subDocs.map(s => ({ ...s, record: getRecord(s.id) }))
    : [{ id: doc.id, label: doc.name, record: getRecord(doc.id) }];

  const handleAction = async (action: "VERIFIED" | "REJECTED") => {
    setActing(true);
    const targetIds = doc.subDocs ? doc.subDocs.map(s => s.id) : [doc.id];
    await onAction(targetIds, action, comment);
    setActing(false);
    onClose();
  };

  const renderFile = (record?: DocRecord, label?: string) => {
    if (!record?.file_url) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
           <FileText size={24} className="text-slate-300" />
           <p className="text-sm font-medium text-slate-400">{label} - Not Uploaded</p>
        </div>
      );
    }
    const isPdf = record.file_url.toLowerCase().includes(".pdf");
    return (
      <div className="flex flex-col gap-2 h-full">
        {label && <p className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full shadow-sm w-fit border border-slate-100">{label}</p>}
        {isPdf ? (
          <iframe src={record.file_url} className="w-full h-full min-h-[350px] rounded-xl border border-slate-200 bg-white shadow-sm" title={label} />
        ) : (
          <img
            src={record.file_url}
            alt={label || doc.name}
            className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm border border-slate-200 bg-white p-1"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Preview+Not+Available"; }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${status === "VERIFIED" ? "bg-emerald-50 border border-emerald-100" : status === "REJECTED" ? "bg-red-50 border border-red-100" : status === "PENDING" ? "bg-amber-50 border border-amber-100" : "bg-slate-50 border border-slate-100"}`}>
              {getDocumentIcon(doc.id)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{doc.name}</h3>
              {submittedAt && (
                <p className="text-xs text-slate-500">Submitted: {new Date(submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className={`grid ${previewItems.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-5 h-full`}>
            {previewItems.map(item => (
              <div key={item.id} className="h-full">
                 {renderFile(item.record, item.label)}
              </div>
            ))}
          </div>
        </div>

        {canAct && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Admin Comment <span className="text-slate-400 font-normal">(optional, shown to employee if rejected)</span></label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Back side is blurry, please re-upload..." rows={2} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction("REJECTED")} disabled={acting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 text-sm font-semibold transition-all disabled:opacity-50">
                <XCircle size={16} />
                {acting ? "Processing..." : "Reject"}
              </button>
              <button onClick={() => handleAction("VERIFIED")} disabled={acting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm">
                <CheckCircle size={16} />
                {acting ? "Processing..." : "Verify"}
              </button>
            </div>
          </div>
        )}

        {!canAct && status !== "NOT_UPLOADED" && (
          <div className={`flex-shrink-0 px-6 py-4 border-t ${status === "VERIFIED" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
            <div className="flex items-center gap-2">
              {status === "VERIFIED" ? <CheckCircle size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
              <p className={`text-sm font-semibold ${status === "VERIFIED" ? "text-emerald-700" : "text-red-600"}`}>
                {status === "VERIFIED" ? "This document has been verified." : "This document was rejected."}
              </p>
            </div>
            {status === "REJECTED" && combinedComment && (
              <p className="text-xs text-red-500 mt-1 ml-6">Reason: {combinedComment}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentRow = ({
  doc,
  getRecord,
  onAction,
}: {
  doc: DocumentTypeDefinition;
  getRecord: (id: string) => DocRecord | undefined;
  onAction: (docIds: string[], action: "VERIFIED" | "REJECTED", comment: string) => void;
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const status = getAggregatedStatus(doc, getRecord);
  const submittedAt = getEarliestSubmission(doc, getRecord);
  const comment = getCombinedComments(doc, getRecord);
  
  // Has any sub document been uploaded?
  const hasDocument = doc.subDocs 
    ? doc.subDocs.some(sub => !!getRecord(sub.id))
    : !!getRecord(doc.id);

  return (
    <>
      <div
        onClick={() => hasDocument && setPreviewOpen(true)}
        className={`rounded-xl border transition-all duration-200 overflow-hidden ${hasDocument ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""} ${
          status === "VERIFIED" ? "border-emerald-200 bg-emerald-50/30" :
          status === "REJECTED" ? "border-red-200 bg-red-50/30" :
          status === "PENDING"  ? "border-amber-200 bg-amber-50/20" :
                                  "border-slate-100 bg-white"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${status === "VERIFIED" ? "bg-emerald-50 border border-emerald-100" : status === "REJECTED" ? "bg-red-50 border border-red-100" : status === "PENDING" ? "bg-amber-50 border border-amber-100" : "bg-slate-50 border border-slate-100"}`}>
              {getDocumentIcon(doc.id)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
              {submittedAt && (
                <p className="text-xs text-slate-400 mt-0.5">Submitted: {new Date(submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              )}
              {status === "REJECTED" && comment && (
                <p className="text-xs text-red-500 mt-0.5 font-medium truncate">Reason: {comment}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusBadge status={status} />
            {hasDocument && (
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Eye size={13} />
                Preview
              </div>
            )}
          </div>
        </div>
      </div>

      {previewOpen && (
        <DocumentPreviewModal
          doc={doc}
          getRecord={getRecord}
          onClose={() => setPreviewOpen(false)}
          onAction={onAction}
        />
      )}
    </>
  );
};

interface AdminDocumentVerificationProps {
  employeeId: string | number;
  employeeName: string;
}

const AdminDocumentVerification = ({ employeeId, employeeName }: AdminDocumentVerificationProps) => {
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("access");
        const res = await axios.get(`${apiUrl}/api/documents/admin/${employeeId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch employee documents:", err);
        setDocuments([
          { doc_type: "aadhar_front", status: "PENDING", submitted_at: new Date().toISOString(), file_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Aadhaar_Logo.svg/320px-Aadhaar_Logo.svg.png" },
          { doc_type: "aadhar_back", status: "PENDING", submitted_at: new Date().toISOString(), file_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Aadhaar_Logo.svg/320px-Aadhaar_Logo.svg.png" },
          { doc_type: "pan", status: "PENDING", submitted_at: new Date().toISOString(), file_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Logo_of_Income_Tax_Department_India.png/250px-Logo_of_Income_Tax_Department_India.png" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [employeeId]);

  const handleAction = async (docIds: string[], action: "VERIFIED" | "REJECTED", comment: string) => {
    try {
      const token = Cookies.get("access");
      // Fire actions for all relevant document IDs
      await Promise.all(docIds.map(docId => 
        axios.post(
          `${apiUrl}/api/documents/admin/${employeeId}/action/`,
          { doc_type: docId, status: action, admin_comment: comment },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
    } catch (err) {
      console.error("Action failed:", err);
    }
    
    // Update local state
    setDocuments((prev) =>
      prev.map((d) => docIds.includes(d.doc_type) ? { ...d, status: action, admin_comment: comment } : d)
    );
  };

  const getDocRecord = (docId: string) => documents.find((d) => d.doc_type === docId);
  
  // Calculate stats based on composite documents
  let verified = 0, pending = 0, rejected = 0;
  ALL_DOC_TYPES.forEach(doc => {
    const status = getAggregatedStatus(doc, getDocRecord);
    if (status === "VERIFIED") verified++;
    if (status === "PENDING") pending++;
    if (status === "REJECTED") rejected++;
  });
  const total = ALL_DOC_TYPES.length;
  
  const sections = ["Identity", "Education", "Employment"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <ShieldCheck size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Document Verification</h3>
          <p className="text-xs text-slate-400">{employeeName}&apos;s documents — click any row to preview &amp; verify</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: "Total",    value: total,    color: "bg-slate-50 text-slate-700 border-slate-200"        },
          { label: "Verified", value: verified,  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Pending",  value: pending,   color: "bg-amber-50 text-amber-700 border-amber-200"       },
          { label: "Rejected", value: rejected,  color: "bg-red-50 text-red-700 border-red-200"             },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {pending > 0 && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>{pending} document{pending > 1 ? "s" : ""} pending — click a row to preview &amp; take action</span>
        </div>
      )}

      {sections.map((section) => {
        const sectionDocs = ALL_DOC_TYPES.filter((d) => d.section === section);
        const sectionPending = sectionDocs.filter((d) => getAggregatedStatus(d, getDocRecord) === "PENDING").length;
        return (
          <div key={section} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-sm font-bold text-slate-700">{section} Documents</span>
              <div className="flex items-center gap-2">
                {sectionPending > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{sectionPending} pending</span>
                )}
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{sectionDocs.length} docs</span>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {sectionDocs.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} getRecord={getDocRecord} onAction={handleAction} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminDocumentVerification;
