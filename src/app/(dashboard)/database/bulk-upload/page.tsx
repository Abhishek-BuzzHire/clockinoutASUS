'use client'

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2, Upload, Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { Candidate } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import { uploadAndParseResume, apiService } from '@/utils/apiService';

type BulkCandidate = Omit<Candidate, 'id' | 'createdAt'> & {
    _uiId: string;
    status: 'pending' | 'parsing' | 'parsed' | 'saving' | 'saved' | 'failed';
    file?: File;
    errorMsg?: string;
    isExpanded: boolean;
    skillInput: string;
};

const BulkUploadForm: React.FC = () => {
    const navigate = useRouter();
    const { addCandidate } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [candidates, setCandidates] = useState<BulkCandidate[]>([]);
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newCandidates: BulkCandidate[] = files.map(file => ({
            _uiId: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            file,
            isExpanded: false,
            skillInput: '',
            name: '', phone: '', email: '', salary: null, expected_ctc: null,
            notice: null, totalExperienceYears: null, location: '', cvUrl: '',
            currentCompanyName: '', skills: [], education: '', jobTitle: '',
        }));

        setCandidates(prev => [...prev, ...newCandidates]);
        if (fileInputRef.current) fileInputRef.current.value = ''; // reset input
        
        // Automatically start parsing the newly added files sequentially
        setIsProcessingAll(true);
        for (const c of newCandidates) {
            if (c.file) {
                await parseFile(c._uiId, c.file);
            }
        }
        setIsProcessingAll(false);
    };

    const parseFile = async (uiId: string, file: File) => {
        setCandidates(prev => prev.map(c => c._uiId === uiId ? { ...c, status: 'parsing' } : c));
        try {
            const parsedData = await uploadAndParseResume(file);
            setCandidates(prev => prev.map(c => c._uiId === uiId ? {
                ...c,
                status: 'parsed',
                isExpanded: true, // Auto expand when successfully parsed so user can review
                name: parsedData.name || '',
                phone: parsedData.phone || '',
                email: parsedData.email || '',
                salary: parsedData.salary || null,
                expected_ctc: parsedData.expected_ctc || null,
                notice: parsedData.notice || null,
                totalExperienceYears: parsedData.totalExperienceYears || null,
                location: parsedData.location || '',
                cvUrl: parsedData.cvUrl || '',
                currentCompanyName: parsedData.currentCompanyName || '',
                skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
                education: parsedData.education || '',
                jobTitle: parsedData.jobTitle || '',
            } : c));
        } catch (error) {
            console.error("Parse error", error);
            setCandidates(prev => prev.map(c => c._uiId === uiId ? { ...c, status: 'failed', errorMsg: 'Failed to parse' } : c));
        }
    };

    const handleRetryParse = async (uiId: string) => {
        const candidate = candidates.find(c => c._uiId === uiId);
        if (candidate && candidate.file) {
            await parseFile(uiId, candidate.file);
        }
    };

    const toggleExpand = (uiId: string) => {
        setCandidates(prev => prev.map(c => c._uiId === uiId ? { ...c, isExpanded: !c.isExpanded } : c));
    };

    const removeCandidate = (uiId: string) => {
        setCandidates(prev => prev.filter(c => c._uiId !== uiId));
    };

    const updateCandidateField = (uiId: string, field: string, value: any) => {
        setCandidates(prev => prev.map(c => c._uiId === uiId ? { ...c, [field]: value } : c));
    };

    const handleSkillInputChange = (uiId: string, value: string) => {
        updateCandidateField(uiId, 'skillInput', value);
    };

    const handleAddSkill = (uiId: string) => {
        const candidate = candidates.find(c => c._uiId === uiId);
        if (!candidate) return;

        const input = candidate.skillInput.trim();
        if (input === '') return;

        let newSkills = [...candidate.skills];
        
        if (input.includes(',')) {
            const skillsToAdd = input.split(',').map(s => s.trim()).filter(s => s !== '');
            skillsToAdd.forEach(s => {
                if (!newSkills.includes(s)) newSkills.push(s);
            });
        } else {
            if (!newSkills.includes(input)) newSkills.push(input);
        }

        setCandidates(prev => prev.map(c => c._uiId === uiId ? { ...c, skills: newSkills, skillInput: '' } : c));
    };

    const handleRemoveSkill = (uiId: string, skillToRemove: string) => {
        setCandidates(prev => prev.map(c => c._uiId === uiId ? {
            ...c,
            skills: c.skills.filter(s => s !== skillToRemove)
        } : c));
    };

    const handleSaveAll = async () => {
        const toSave = candidates.filter(c => c.status === 'parsed');
        if (toSave.length === 0) {
            toast.error("No parsed candidates to save.");
            return;
        }

        setIsSavingAll(true);
        
        const validPayloads = [];
        const invalidIds = new Set<string>();

        // Pre-validate all candidates
        for (const c of toSave) {
            if (!c.name.trim() || !c.email.trim()) {
                invalidIds.add(c._uiId);
                setCandidates(prev => prev.map(cand => cand._uiId === c._uiId ? { ...cand, status: 'failed', errorMsg: 'Name and Email required' } : cand));
                continue;
            }
            
            validPayloads.push({
                _uiId: c._uiId, // Keep this to map back results
                payload: {
                    id: '',
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    salary: c.salary,
                    expected_ctc: c.expected_ctc,
                    notice: c.notice,
                    totalExperienceYears: c.totalExperienceYears,
                    location: c.location,
                    cvUrl: c.cvUrl,
                    currentCompanyName: c.currentCompanyName,
                    skills: c.skills,
                    education: c.education,
                    jobTitle: c.jobTitle,
                }
            });
        }

        if (validPayloads.length > 0) {
            // Mark valid ones as saving
            const validUiIds = validPayloads.map(vp => vp._uiId);
            setCandidates(prev => prev.map(cand => validUiIds.includes(cand._uiId) ? { ...cand, status: 'saving' } : cand));

            try {
                // Send them all at once!
                await apiService.addMultipleCandidates(validPayloads.map(vp => vp.payload));
                
                // If successful, mark all as saved
                setCandidates(prev => prev.map(cand => validUiIds.includes(cand._uiId) ? { ...cand, status: 'saved', isExpanded: false } : cand));
                toast.success(`Successfully saved ${validPayloads.length} candidates in one click!`);
            } catch (err) {
                console.error("Bulk save failed", err);
                setCandidates(prev => prev.map(cand => validUiIds.includes(cand._uiId) ? { ...cand, status: 'failed', errorMsg: 'Save failed' } : cand));
                toast.error("Failed to save candidates. Please try again.");
            }
        }
        
        setIsSavingAll(false);
    };


    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Bulk Upload Candidates</h1>
                <Button variant="outline" onClick={() => navigate.push('/database')}>Back to Database</Button>
            </div>

            <Card className='mb-6 p-10 flex flex-col items-center justify-center border-dashed border-2 bg-gray-50'>
                <Upload size={40} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Select multiple resumes</h3>
                <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX allowed. (Max 20 at a time recommended)</p>
                
                <input
                    type='file'
                    accept='.pdf, .doc, .docx'
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                
                <Button size='lg' onClick={() => fileInputRef.current?.click()}>
                    Choose Files
                </Button>
            </Card>

            {candidates.length > 0 && (
                <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                    <div>
                        <span className="font-semibold text-gray-700">{candidates.length} Resumes Loaded</span>
                        <div className="text-sm text-gray-500 mt-1 flex space-x-4">
                            <span>Pending: {candidates.filter(c => c.status === 'pending').length}</span>
                            <span>Parsed: {candidates.filter(c => c.status === 'parsed').length}</span>
                            <span>Saved: {candidates.filter(c => c.status === 'saved').length}</span>
                        </div>
                    </div>
                    <div className="space-x-3">
                        <Button 
                            variant="default"
                            disabled={isSavingAll || candidates.filter(c => c.status === 'parsed').length === 0}
                            onClick={handleSaveAll}
                        >
                            {isSavingAll ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Submit All Parsed"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {candidates.map((candidate, index) => (
                    <Card key={candidate._uiId} className="overflow-hidden border border-gray-200">
                        {/* Header Banner */}
                        <div 
                            className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${candidate.status === 'saved' ? 'bg-green-50' : ''}`}
                            onClick={() => toggleExpand(candidate._uiId)}
                        >
                            <div className="flex items-center space-x-4 w-1/3">
                                <span className="font-medium text-gray-600">#{index + 1}</span>
                                <span className="text-gray-900 truncate" title={candidate.file?.name}>{candidate.file?.name || 'Unknown File'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                                {/* Status Indicator */}
                                <div className="flex items-center w-28 justify-end">
                                    {candidate.status === 'pending' && <span className="text-gray-500 text-sm">Pending</span>}
                                    {candidate.status === 'parsing' && <><Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2"/><span className="text-blue-500 text-sm">Parsing...</span></>}
                                    {candidate.status === 'parsed' && <><CheckCircle className="h-4 w-4 text-orange-500 mr-2"/><span className="text-orange-500 text-sm font-medium">Ready to Edit</span></>}
                                    {candidate.status === 'saving' && <><Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2"/><span className="text-blue-500 text-sm">Saving...</span></>}
                                    {candidate.status === 'saved' && <><CheckCircle className="h-4 w-4 text-green-500 mr-2"/><span className="text-green-500 text-sm font-bold">Saved!</span></>}
                                    {candidate.status === 'failed' && <><AlertCircle className="h-4 w-4 text-red-500 mr-2"/><span className="text-red-500 text-sm" title={candidate.errorMsg}>Failed</span></>}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                                        onClick={(e) => { e.stopPropagation(); removeCandidate(candidate._uiId); }}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    {candidate.isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Form Form */}
                        {candidate.isExpanded && (
                            <div className="p-6 border-t border-gray-100 bg-white">
                                {candidate.status === 'pending' ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">This resume has not been parsed yet.</p>
                                        <Button onClick={() => parseFile(candidate._uiId, candidate.file!)}>Parse Now</Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Full Name" name={`name-${candidate._uiId}`} required>
                                            <input type="text" value={candidate.name} onChange={(e) => updateCandidateField(candidate._uiId, 'name', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Email" name={`email-${candidate._uiId}`} required>
                                            <input type="email" value={candidate.email} onChange={(e) => updateCandidateField(candidate._uiId, 'email', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Phone" name={`phone-${candidate._uiId}`}>
                                            <input type="tel" value={candidate.phone} onChange={(e) => updateCandidateField(candidate._uiId, 'phone', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Current Company" name={`company-${candidate._uiId}`}>
                                            <input type="text" value={candidate.currentCompanyName} onChange={(e) => updateCandidateField(candidate._uiId, 'currentCompanyName', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Job Title" name={`job-${candidate._uiId}`}>
                                            <input type="text" value={candidate.jobTitle} onChange={(e) => updateCandidateField(candidate._uiId, 'jobTitle', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Total Experience (Years)" name={`exp-${candidate._uiId}`}>
                                            <input type="number" value={candidate.totalExperienceYears ?? ''} onChange={(e) => updateCandidateField(candidate._uiId, 'totalExperienceYears', e.target.value ? parseFloat(e.target.value) : null)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Current CTC" name={`sal-${candidate._uiId}`}>
                                            <input type="number" value={candidate.salary ?? ''} onChange={(e) => updateCandidateField(candidate._uiId, 'salary', e.target.value ? parseFloat(e.target.value) : null)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Expected CTC" name={`exp_sal-${candidate._uiId}`}>
                                            <input type="number" value={candidate.expected_ctc ?? ''} onChange={(e) => updateCandidateField(candidate._uiId, 'expected_ctc', e.target.value ? parseFloat(e.target.value) : null)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Location" name={`loc-${candidate._uiId}`}>
                                            <input type="text" value={candidate.location} onChange={(e) => updateCandidateField(candidate._uiId, 'location', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Notice Period (Days)" name={`notice-${candidate._uiId}`}>
                                            <input type="number" value={candidate.notice ?? ''} onChange={(e) => updateCandidateField(candidate._uiId, 'notice', e.target.value ? parseFloat(e.target.value) : null)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <FormField label="Education" name={`edu-${candidate._uiId}`}>
                                            <input type="text" value={candidate.education} onChange={(e) => updateCandidateField(candidate._uiId, 'education', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>
                                        
                                        <FormField label="Resume Link" name={`url-${candidate._uiId}`}>
                                            <input type="text" value={candidate.cvUrl} onChange={(e) => updateCandidateField(candidate._uiId, 'cvUrl', e.target.value)} className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </FormField>

                                        <div className="md:col-span-2 mt-2">
                                            <FormField label="Skills" name={`skills-${candidate._uiId}`}>
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        value={candidate.skillInput}
                                                        onChange={(e) => handleSkillInputChange(candidate._uiId, e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(candidate._uiId); } }}
                                                        className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        placeholder="Add skill and press Enter"
                                                    />
                                                    <Button type="button" variant="outline" size="sm" className="ml-2 mt-1" onClick={() => handleAddSkill(candidate._uiId)}>Add</Button>
                                                </div>
                                            </FormField>
                                            
                                            {candidate.skills.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {candidate.skills.map((skill, i) => (
                                                        <div key={i} className="bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm flex items-center">
                                                            {skill}
                                                            <button type="button" onClick={() => handleRemoveSkill(candidate._uiId, skill)} className="ml-1.5 text-blue-500 hover:text-blue-700">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default function BulkUploadPage() {
    return (
        <AppProvider>
            <BulkUploadForm />
        </AppProvider>
    )
}
