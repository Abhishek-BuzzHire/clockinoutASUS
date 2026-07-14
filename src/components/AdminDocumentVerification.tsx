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
  Lock,
  Unlock,
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
    if (statuses.includes("PENDING")) return "PENDING";
    if (statuses.includes("REJECTED")) return "REJECTED";
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

const WatermarkOverlay = () => {
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none flex items-center justify-center">
      {/* Dense Micro-Pattern Watermark */}
      <div 
        className="absolute w-[200%] h-[200%] flex flex-wrap justify-center items-center gap-x-28 gap-y-32 opacity-[0.08] transform -rotate-[15deg]"
        style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.3)" }}
      >
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="text-white/60 font-medium text-sm whitespace-nowrap tracking-wider">
            BUZZHIRE SECURE • {timestamp}
          </div>
        ))}
      </div>
      
      {/* Large Central Authentic Stamp */}
      <div 
        className="absolute opacity-10 transform -rotate-[15deg] pointer-events-none" 
        style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
      >
         <h1 className="text-white font-black text-4xl md:text-6xl tracking-widest uppercase text-center">
           Strictly Confidential
         </h1>
         <p className="text-white/90 font-bold text-xl md:text-2xl text-center mt-2 tracking-widest">
           DO NOT SHARE • {timestamp}
         </p>
      </div>
    </div>
  );
};

const SecureDocumentViewer = ({ url, label, isPdf }: { url: string; label?: string; isPdf: boolean }) => {
  const [blobData, setBlobData] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // 1. Strict Mobile & Tablet Detection (Bypasses "Request Desktop Site")
    const checkMobile = () => {
      if (typeof window === 'undefined') return false;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isSmallScreen = window.screen.width < 1024 || window.innerWidth < 1024;
      const hasTouch = navigator.maxTouchPoints > 0;
      
      if (isMobileUA) return true;
      if (isCoarsePointer && hasTouch && isSmallScreen) return true;
      if (userAgent.includes('macintosh') && hasTouch) return true; // iPad in Desktop Mode
      
      return false;
    };

    if (checkMobile()) {
      setIsMobileDevice(true);
      return; // Do not fetch document, do not setup screenshot hooks
    }

    let objectUrl = "";
    const abortController = new AbortController();

    const fetchDoc = async () => {
      try {
        const token = Cookies.get("access");
        const response = await axios.get(`${apiUrl}${url}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          signal: abortController.signal
        });
        setBlobData(response.data);
        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Fetch aborted for strict mode cleanup.");
        } else {
          console.error("Failed to fetch document blob", err);
          setError(true);
        }
      }
    };
    fetchDoc();
    
    // HARDCORE ANTI-SCREENSHOT LOGIC
    const hideDoc = () => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.05s';
    };
    const showDoc = () => {
      document.body.style.opacity = '1';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase() || '';
      
      // 1. PrintScreen variants (PrtScn, Fn+PrtScn, Alt+PrtScn, Fn key)
      if (key === 'printscreen' || key === 'prtscn' || e.keyCode === 44 || key === 'fn' || key === 'function' || key === 'clear' || key === 'insert') {
        hideDoc();
        // Sometimes copying to clipboard can be blocked
        navigator.clipboard?.writeText("Security Alert: Screenshots are disabled.").catch(() => {});
      }
      
      // 2. Windows Snipping tool (Win + Shift + S)
      if (e.metaKey && e.shiftKey && key === 's') {
        hideDoc();
        e.preventDefault();
      }
      
      // 3. Mac Screenshot tools (Cmd + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) {
        hideDoc();
        e.preventDefault();
      }
      
      // 4. Windows/Meta key alone (start menu overlay)
      if (key === 'meta' || key === 'os') {
        hideDoc();
      }

      // 5. Block Saving, Printing, Copying, View Source
      if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'p' || key === 'c' || key === 'u')) {
        e.preventDefault();
        alert("Security Alert: Saving, printing, and copying are disabled in the Secure Vault.");
      }
      
      // 6. Block DevTools (F12 or Ctrl+Shift+I/J/C)
      if (key === 'f12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
        e.preventDefault();
        hideDoc();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase() || '';
      if (key === 'meta' || key === 'os' || key === 'printscreen' || key === 'prtscn' || e.keyCode === 44 || key === 'fn' || key === 'function') {
        setTimeout(showDoc, 1500); // keep hidden for a longer delay
      }
      if (e.metaKey && e.shiftKey && (key === 's' || key === '3' || key === '4' || key === '5')) {
        setTimeout(showDoc, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', hideDoc);
    window.addEventListener('focus', showDoc);
    
    return () => {
      abortController.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', hideDoc);
      window.removeEventListener('focus', showDoc);
      
      // CRITICAL: Restore visibility when component unmounts!
      document.body.style.opacity = '1';
    };
  }, [url]);

  if (isMobileDevice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-6 text-center gap-5 bg-red-50/90 rounded-xl border-2 border-red-200 w-full shadow-sm select-none">
         <div className="p-4 bg-red-100 rounded-full animate-bounce mt-4">
           <Lock size={36} className="text-red-600" />
         </div>
         <div>
           <h3 className="text-xl font-bold text-red-700 mb-2">Security Policy Violation</h3>
           <p className="text-sm font-semibold text-red-600 max-w-sm mx-auto leading-relaxed">
             Mobile and tablet viewing is strictly prohibited to prevent unauthorized screenshots.
             Please open this document from a Laptop or Desktop computer.
           </p>
         </div>
         <div className="px-3 py-1 mb-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md">
           Desktop Mode Bypass Prevented
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 bg-red-50 rounded-xl border border-dashed border-red-200 w-full">
         <AlertTriangle size={24} className="text-red-400" />
         <p className="text-sm font-medium text-red-500">Preview Not Available</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 w-full gap-4 bg-slate-900 rounded-xl border border-slate-700">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-300 animate-pulse">Decrypting Secure Vault...</p>
      </div>
    );
  }

  const renderContent = (fullScreen: boolean = false) => {
    if (isPdf) {
      return (
        <iframe 
          src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
          className={`w-full ${fullScreen ? 'h-[85vh]' : 'h-full'} border-none shadow-sm pointer-events-none`} 
          title={label} 
        />
      );
    }
    return (
      <img
        src={blobUrl}
        alt={label || "Document"}
        className={`w-full h-auto ${fullScreen ? 'max-h-[85vh]' : 'max-h-[400px]'} object-contain rounded-lg shadow-sm pointer-events-none`}
        draggable={false}
      />
    );
  };
  
  return (
    <>
      <div 
        ref={containerRef}
        className="relative group w-full h-full min-h-[350px] flex justify-center items-center bg-slate-900 rounded-xl border border-slate-200 p-2 overflow-hidden select-none transition-opacity duration-150" 
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderContent(false)}
        <WatermarkOverlay />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[60]">
          <button 
            onClick={() => setIsFullscreen(true)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-2xl transform scale-95 group-hover:scale-100 transition-transform hover:bg-red-700"
          >
            <Eye size={16} /> Open Secure Full View
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none transition-opacity duration-150"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="absolute top-6 right-6 z-[110]">
            <button 
              onClick={() => setIsFullscreen(false)}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all"
              title="Close Secure View"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="relative w-full h-full flex flex-col justify-center items-center p-4">
             <div className="relative w-full max-w-5xl flex justify-center items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
               {renderContent(true)}
               <WatermarkOverlay />
             </div>
          </div>
        </div>
      )}
    </>
  );
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
  const canAct = status === "PENDING" || status === "REJECTED";

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
        <SecureDocumentViewer url={record.file_url} label={label} isPdf={isPdf} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
            {status === "REJECTED" && combinedComment && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex gap-2">
                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block mb-0.5">Previous Rejection Reason:</span>
                  {combinedComment}
                </div>
              </div>
            )}
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

        {!canAct && status === "VERIFIED" && (
          <div className="flex-shrink-0 px-6 py-4 border-t bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">
                This document has been verified.
              </p>
            </div>
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
  const [loading, setLoading] = useState(false);
  
  // PIN verification state
  const [pinVerified, setPinVerified] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Reset verification when employee changes
  React.useEffect(() => {
    setPinVerified(false);
    setPin("");
    setPinError("");
    setDocuments([]);
  }, [employeeId]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    
    setVerifyingPin(true);
    try {
      const token = Cookies.get("access");
      // 1. Verify PIN
      await axios.post(
        `${apiUrl}/api/documents/admin/verify-pin/`,
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPinVerified(true);
      fetchDocuments();
    } catch (err: any) {
      setPinError(err.response?.data?.error || "Incorrect PIN or verification failed.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("access");
      const res = await axios.get(`${apiUrl}/api/documents/admin/${employeeId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employee documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

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
      // Refresh documents
      await fetchDocuments();
    } catch (err) {
      console.error("Action failed:", err);
      alert("Failed to update document status. Please try again.");
    }
  };

  const getDocRecord = (docId: string) => documents.find((d) => d.doc_type === docId);
  
  const sections = ["Identity", "Education", "Employment"];

  // --- PIN VERIFICATION SCREEN ---
  if (!pinVerified) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Secure Document Access</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm text-center">
          Please enter your 4-digit Admin PIN to view documents for <span className="font-semibold text-slate-700">{employeeName}</span>.
        </p>
        
        <form onSubmit={handleVerifyPin} className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="text-center text-2xl tracking-[1em] font-bold py-3 px-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            autoFocus
          />
          {pinError && <p className="text-red-500 text-xs font-semibold text-center bg-red-50 py-1.5 rounded-lg">{pinError}</p>}
          <button
            type="submit"
            disabled={pin.length !== 4 || verifyingPin}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {verifyingPin ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Unlock size={18} />
                Verify PIN
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- DOCUMENT LIST VIEW (Only shown if PIN is verified) ---

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading documents...</div>;
  }
  
  // Calculate stats based on composite documents
  let verified = 0, pending = 0, rejected = 0;
  ALL_DOC_TYPES.forEach(doc => {
    const status = getAggregatedStatus(doc, getDocRecord);
    if (status === "VERIFIED") verified++;
    if (status === "PENDING") pending++;
    if (status === "REJECTED") rejected++;
  });
  const total = ALL_DOC_TYPES.length;

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
