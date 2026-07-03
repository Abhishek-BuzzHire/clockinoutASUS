"use client";

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { apiUrl } from '@/lib/data';
import { ArrowLeft, Upload, File, CheckCircle, ShieldCheck, Info, CreditCard, IdCard, GraduationCap, Award, Briefcase, Mail, FileCheck, FileText, Clock, XCircle, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) resolve(file);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.95);
  });
}

interface DocumentType {
    id: string;
    name: string;
    description: string;
    accepted_formats: string[];
    required: boolean;
    parts?: { id: string; label: string }[];
}

interface DocumentSection {
    title: string;
    description: string;
    documents: DocumentType[];
}

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

const DOCUMENT_SECTIONS: DocumentSection[] = [
    {
        title: 'Identity & Personal Documents',
        description: 'Upload your official identity and personal documents',
        documents: [
            {
                id: 'aadhar/driving',
                name: 'Aadhar Card / Driving Licence',
                description: 'Scanned copy of both sides of your Aadhar card or Driving licence',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true,
                parts: [
                    { id: 'aadhar_front', label: 'Front Side' },
                    { id: 'aadhar_back', label: 'Back Side' }
                ]
            },
            {
                id: 'pan',
                name: 'PAN Card',
                description: 'Scanned copy of your PAN card',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true
            },
            
   
        ]
    },
    {
        title: 'Educational Details',
        description: 'Upload your academic qualifications and certificates',
        documents: [
            {
                id: '10th_marksheet',
                name: '10th Marksheet',
                description: 'Board exam marksheet for class 10',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true
            },
            {
                id: '12th_marksheet',
                name: '12th Marksheet',
                description: 'Board exam marksheet for class 12',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true
            },
            {
                id: 'graduation_degree',
                name: 'Graduation Degree',
                description: 'Bachelor degree certificate',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true
            },
            {
                id: 'postgraduation_degree',
                name: 'Postgraduation Degree',
                description: 'Master degree certificate',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: false
            }
        ]
    },
    {
        title: 'Previous Company Details',
        description: 'Upload documents from your previous employment',
        documents: [
            {
                id: 'offer_letter',
                name: 'Offer Letter',
                description: 'Previous Employment Offer Letter (Experienced Candidates Only)',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: true
            },
            {
                id: 'relieving_letter',
                name: 'Relieving Letter',
                description: 'Relieving letter from previous employer',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: false
            },
           
            {
                id: 'resignation_mail',
                name: 'Resignation Acceptance Mail',
                description: 'Email confirmation of resignation acceptance from previous company',
                accepted_formats: ['pdf', 'jpg', 'png'],
                required: false
            }
        ]
    },
];

export default function DocumentsPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
    const [docStatuses, setDocStatuses] = useState<{ [key: string]: 'PENDING' | 'VERIFIED' | 'REJECTED' | null }>({});
    const [error, setError] = useState<string | null>(null);

    // Cropper states
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [cropDocId, setCropDocId] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
    const imgRef = React.useRef<HTMLImageElement>(null);
    
    // Security Trust Modal states
    const [showTrustModal, setShowTrustModal] = useState(false);
    const [showExample, setShowExample] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenSecurityTrustModal');
        if (!hasSeen) {
            setShowTrustModal(true);
        }
    }, []);

    const closeTrustModal = () => {
        localStorage.setItem('hasSeenSecurityTrustModal', 'true');
        setShowTrustModal(false);
    };

    const token = Cookies.get("access");
    const api = axios.create({
        baseURL: apiUrl,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await api.get('/api/documents/my/');
                const fetchedStatuses: { [key: string]: 'PENDING' | 'VERIFIED' | 'REJECTED' | null } = {};
                res.data.forEach((doc: any) => {
                    fetchedStatuses[doc.doc_type] = doc.status;
                });
                setDocStatuses(fetchedStatuses);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchDocuments();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, actualDocId: string, allowedFormats: string[]) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedFormats.includes(fileExtension)) {
            setError(`Invalid file format. Accepted: ${allowedFormats.join(', ').toUpperCase()}`);
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit');
            return;
        }

        if (fileExtension === 'pdf') {
            handleSubmit(actualDocId, file);
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result as string);
                setCropDocId(actualDocId);
                setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
            };
            reader.readAsDataURL(file);
        }
        
        setError(null);
        e.target.value = ''; // Reset input
    };

    const handleCropSave = async () => {
        if (!imgRef.current || !croppedAreaPixels || !cropDocId) return;
        try {
            const croppedBlob = await getCroppedImg(imgRef.current, croppedAreaPixels);
            const croppedFile = new window.File([croppedBlob], `${cropDocId}.jpg`, { type: 'image/jpeg' });
            
            const docIdToSubmit = cropDocId;
            setCropImageSrc(null);
            setCropDocId(null);
            
            handleSubmit(docIdToSubmit, croppedFile);
        } catch (e) {
            console.error("Error cropping image", e);
            setError("Failed to crop image.");
        }
    };

    const handleSubmit = async (actualDocId: string, file: File) => {
        setUploading(prev => ({ ...prev, [actualDocId]: true }));
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('doc_type', actualDocId);

            await api.post('/api/documents/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setDocStatuses(prev => ({ ...prev, [actualDocId]: 'PENDING' }));
            // Remove from selected files
            setSelectedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[actualDocId];
                return newFiles;
            });
            setError(null);
        } catch (err: any) {
            const data = err.response?.data;
            let msg = 'Failed to upload document';
            if (data) {
                if (data.error) msg = data.error;
                else if (data.message) msg = data.message;
                else if (typeof data === 'object') {
                    const firstKey = Object.keys(data)[0];
                    if (Array.isArray(data[firstKey])) {
                        msg = `${firstKey}: ${data[firstKey][0]}`;
                    } else if (typeof data[firstKey] === 'string') {
                        msg = data[firstKey];
                    }
                }
            }
            setError(msg);
        } finally {
            setUploading(prev => ({ ...prev, [actualDocId]: false }));
        }
    };

    // Derived status logic for combined docs
    const getOverallDocStatus = (doc: DocumentType) => {
        if (!doc.parts) return docStatuses[doc.id];
        
        const partsStatuses = doc.parts.map(p => docStatuses[p.id]);
        if (partsStatuses.includes('PENDING')) return 'PENDING';
        if (partsStatuses.includes('REJECTED')) return 'REJECTED';
        if (partsStatuses.every(s => s === 'VERIFIED')) return 'VERIFIED';
        return null;
    };

    const renderActionBlock = (actualDocId: string, doc: DocumentType, label?: string) => {
        const status = docStatuses[actualDocId];
        const selectedFile = selectedFiles[actualDocId];

        return (
            <div className={`flex flex-col gap-3 ${label ? 'flex-1 min-w-[200px] border border-slate-100 p-3 rounded-xl bg-slate-50/50' : ''}`}>
                {label && <p className="text-xs font-bold text-slate-700">{label}</p>}
                
                {status === 'VERIFIED' ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <ShieldCheck size={14} /> Verified
                    </div>
                ) : status === 'PENDING' ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 border border-amber-200 bg-amber-50 text-amber-700">
                        <Clock size={14} /> Pending
                    </div>
                ) : uploading[actualDocId] ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 border border-blue-200 bg-blue-50 text-blue-700 shadow-sm">
                        <Upload size={14} className="animate-bounce" />
                        Uploading...
                    </div>
                ) : selectedFile ? (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleSubmit(actualDocId, selectedFile)}
                            disabled={uploading[actualDocId]}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm ${
                                uploading[actualDocId]
                                    ? 'bg-blue-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                            }`}>
                            <Upload size={14} className={uploading[actualDocId] ? 'animate-bounce' : ''} />
                            {uploading[actualDocId] ? 'Submitting...' : 'Submit'}
                        </button>
                        <button 
                            onClick={() => setSelectedFiles(prev => { const n = {...prev}; delete n[actualDocId]; return n; })}
                            disabled={uploading[actualDocId]}
                            className="px-2.5 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                            title="Cancel selection"
                        >
                            <XCircle size={14} />
                        </button>
                    </div>
                ) : status === 'REJECTED' ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 border border-red-200 bg-red-50 text-red-700">
                            <XCircle size={14} /> Rejected
                        </div>
                        <label className="block w-full cursor-pointer text-center text-xs text-blue-600 hover:underline font-semibold">
                            Re-upload {label ? label : 'Document'}
                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, actualDocId, doc.accepted_formats)} accept={doc.accepted_formats.map(f => `.${f}`).join(',')} />
                        </label>
                    </div>
                ) : (
                    <label className="block w-full cursor-pointer group/upload">
                        <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 border border-dashed border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700`}>
                            <Upload size={14} />
                            Select {label ? label : 'Document'}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, actualDocId, doc.accepted_formats)}
                            accept={doc.accepted_formats.map(f => `.${f}`).join(',')}
                        />
                    </label>
                )}
                {selectedFile && (
                    <p className="text-[10px] text-blue-600 font-medium truncate px-1">Selected: {selectedFile.name}</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Center</h1>
                                <ShieldCheck size={24} className="text-emerald-500" />
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Securely upload and manage your official records</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                            <Info size={20} className="text-red-500" />
                            <span className="text-sm font-medium text-red-800">{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">o </button>
                    </div>
                )}

                {/* Documents Sections */}
                {DOCUMENT_SECTIONS.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Section Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                            <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                        </div>

                        {/* Documents Grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.documents.map(doc => {
                                const combinedStatus = getOverallDocStatus(doc);
                                const isComposite = !!doc.parts;

                                return (
                                    <div
                                        key={doc.id}
                                        className={`relative group rounded-xl border p-5 transition-all duration-300 flex flex-col ${
                                            combinedStatus === 'VERIFIED'
                                                ? 'border-emerald-200 bg-emerald-50/30' 
                                                : combinedStatus === 'PENDING'
                                                    ? 'border-amber-200 bg-amber-50/30'
                                                    : combinedStatus === 'REJECTED'
                                                        ? 'border-red-200 bg-red-50/30'
                                                        : (isComposite ? doc.parts!.some(p => selectedFiles[p.id]) : selectedFiles[doc.id])
                                                            ? 'border-blue-300 bg-blue-50/30 shadow-md'
                                                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md bg-white'
                                        }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`p-2 rounded-xl flex-shrink-0 transition-colors shadow-sm bg-white border ${
                                                        combinedStatus === 'VERIFIED' ? 'border-emerald-200' : 'border-slate-100 group-hover:border-blue-200'
                                                    }`}>
                                                        {getDocumentIcon(doc.id)}
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.name}</h3>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={doc.description}>{doc.description}</p>
                                                    </div>
                                                </div>
                                                {combinedStatus === 'VERIFIED' && (
                                                    <CheckCircle size={22} className="text-emerald-500 flex-shrink-0 drop-shadow-sm" />
                                                )}
                                        </div>

                                        <div className="mt-auto flex flex-col gap-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                                                    {doc.accepted_formats.join(', ')}
                                                </span>
                                                {doc.required && (
                                                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                                                        Required
                                                    </span>
                                                )}
                                            </div>

                                            {isComposite ? (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    {doc.parts!.map(part => (
                                                        <React.Fragment key={part.id}>
                                                            {renderActionBlock(part.id, doc, part.label)}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            ) : (
                                                renderActionBlock(doc.id, doc)
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-xl text-blue-900 shadow-sm">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">
                        <strong>Important Note:</strong> Please ensure all documents are clearly visible and readable. Maximum allowed file size for any document is <strong>10MB</strong>.
                    </p>
                </div>
            </div>

            {/* Security Guarantee Modal */}
            {showTrustModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-sky-200 flex flex-col transform scale-100 transition-all duration-300">
                        <div className="px-6 py-5 border-b border-sky-100 flex justify-between items-center bg-white/60">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={28} className="text-sky-600 drop-shadow-sm" />
                                <h3 className="text-xl font-bold text-sky-900 tracking-tight">100% Security Guarantee</h3>
                            </div>
                            <button onClick={closeTrustModal} className="p-2 rounded-full hover:bg-sky-100/50 text-sky-500 hover:text-sky-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-slate-700 font-medium leading-relaxed">
                                Every document you upload is <strong className="text-sky-700 font-bold bg-sky-100 px-1.5 py-0.5 rounded">100% Secure</strong>. 
                                We utilize top-tier Enterprise DRM Security to ensure your data remains strictly confidential and protected at all times.
                            </p>
                            
                            <ul className="space-y-3 p-4 bg-white/60 rounded-xl border border-sky-100 shadow-sm">
                                <li className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                                    <XCircle size={18} className="text-red-500 flex-shrink-0 drop-shadow-sm" />
                                    <span className="leading-tight"><strong>Screenshots</strong> are strictly prohibited. The system will automatically block and blackout the screen if an admin attempts to capture it.</span>
                                </li>
                                <li className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                                    <XCircle size={18} className="text-red-500 flex-shrink-0 drop-shadow-sm" />
                                    <span className="leading-tight"><strong>Downloading, Saving, or Sharing</strong> of any document is completely disabled at the system level.</span>
                                </li>
                                <li className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                                    <XCircle size={18} className="text-red-500 flex-shrink-0 drop-shadow-sm" />
                                    <span className="leading-tight">Accessing documents from a <strong>Mobile Device or Tablet</strong> is strictly blocked for all administrators.</span>
                                </li>
                            </ul>
                            
                            <div className="bg-sky-100/40 border border-sky-200 rounded-xl p-4 mt-2">
                                <p className="text-xs text-sky-800 font-bold mb-3 uppercase tracking-wide">
                                    Admin View (Watermarked)
                                </p>
                                <button 
                                    onClick={() => setShowExample(!showExample)}
                                    className="text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
                                >
                                    <ZoomIn size={16} /> {showExample ? 'Hide Example' : 'See Example'}
                                </button>
                                
                                {showExample && (
                                    <div className="mt-4 rounded-xl overflow-hidden border-2 border-sky-300 shadow-md relative animate-in fade-in zoom-in duration-200">
                                        <img src="/secure_example.jpeg" alt="Secure Example" className="w-full h-auto object-cover max-h-[300px]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white/80 border-t border-sky-100 flex justify-end">
                            <button
                                onClick={closeTrustModal}
                                className="px-8 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cropper Modal */}
            {cropImageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col transform scale-100 transition-all duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Crop Document</h3>
                                <p className="text-xs text-slate-500">Adjust the frame to include only the document</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCropImageSrc(null)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body (Cropper Area) */}
                        <div className="relative w-full h-[65vh] min-h-[400px] bg-slate-900 flex justify-center items-center overflow-auto p-4 border-b border-slate-100">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCroppedAreaPixels(c)}
                                keepSelection
                            >
                                <img
                                    ref={imgRef}
                                    src={cropImageSrc}
                                    alt="Crop me"
                                    style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCroppedAreaPixels({
                                            unit: 'px',
                                            x: width * 0.05,
                                            y: height * 0.05,
                                            width: width * 0.9,
                                            height: height * 0.9,
                                        });
                                    }}
                                />
                            </ReactCrop>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-white flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setCropImageSrc(null)}
                                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropSave}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                            >
                                Save Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
