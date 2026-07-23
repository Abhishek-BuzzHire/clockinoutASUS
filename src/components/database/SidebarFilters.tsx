'use client'

import React, { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { Filters } from './FilterControls';

interface SidebarFiltersProps {
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>;
}

const AccordionItem = ({ title, children, defaultOpen = false, badge = null }: { title: string, children: React.ReactNode, defaultOpen?: boolean, badge?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                type="button"
                className="w-full flex items-center justify-between py-4 text-left focus:outline-none hover:bg-gray-50 px-4 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-slate-800">{title}</span>
                    {badge}
                </div>
                {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-1">
                    {children}
                </div>
            )}
        </div>
    );
};

export function SidebarFilters({ filters, setFilters }: SidebarFiltersProps) {
    const [localFilters, setLocalFilters] = React.useState<Filters>(filters);

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    };

    const clearFilters = () => {
        const empty = { skills: '', minExperience: 0, maxExperience: null, education: '', minSalary: 0, maxSalary: null, company: '', notice: null, location: '', jobTitle: '' };
        setLocalFilters(empty);
        setFilters(empty);
    };

    const applySearch = () => {
        setFilters(localFilters);
    };
    return (
        <div className="w-[300px] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden shrink-0 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-100px)]">
            {/* Top Checkboxes */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <input type="checkbox" id="hideProfiles" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <label htmlFor="hideProfiles" className="text-[14px] text-slate-700 cursor-pointer select-none">Hide Profiles</label>
            </div>

            {/* Filter Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-[17px]">
                    <Filter size={18} className="text-slate-500" />
                    Filters
                </div>
                <button onClick={clearFilters} className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Clear all
                </button>
            </div>

            {/* Search / Apply Button */}
            <div className="p-4 border-b border-gray-100 shrink-0 bg-blue-50/50">
                <button 
                    onClick={applySearch} 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[14px] shadow-[0_2px_4px_rgba(37,99,235,0.2)] transition-all flex justify-center items-center gap-2"
                >
                    Apply & Search
                </button>
            </div>


            {/* Accordions Container */}
            <form onSubmit={(e) => { e.preventDefault(); applySearch(); }} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                <AccordionItem title="Keywords" defaultOpen>
                    <input
                        type="text"
                        name="skills"
                        value={localFilters.skills}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                        placeholder="e.g. React, Java, Sales"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </AccordionItem>

                <AccordionItem title="Current company" defaultOpen>
                    <input
                        type="text"
                        name="company"
                        value={localFilters.company}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                        placeholder="e.g. Amazon, Google"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </AccordionItem>

                <AccordionItem title="Location" defaultOpen>
                    <input
                        type="text"
                        name="location"
                        value={localFilters.location}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                        placeholder="e.g. Mumbai, Delhi"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </AccordionItem>

                <AccordionItem title="Experience (Years)" defaultOpen>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            name="minExperience"
                            value={localFilters.minExperience === 0 ? '' : localFilters.minExperience}
                            onChange={(e) => setLocalFilters(p => ({...p, minExperience: Number(e.target.value)}))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                            placeholder="Min"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-[13px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        />
                        <span className="text-slate-400 text-xs font-medium">to</span>
                        <input
                            type="number"
                            name="maxExperience"
                            value={localFilters.maxExperience ?? ''}
                            onChange={handleNumberChange}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                            placeholder="Max"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-[13px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        />
                    </div>
                </AccordionItem>

                <AccordionItem title="Salary (INR-Lacs)">
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            name="minSalary"
                            value={localFilters.minSalary === 0 ? '' : localFilters.minSalary}
                            onChange={(e) => setLocalFilters(p => ({...p, minSalary: Number(e.target.value)}))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                            placeholder="Min"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-[13px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        />
                        <span className="text-slate-400 text-xs font-medium">to</span>
                        <input
                            type="number"
                            name="maxSalary"
                            value={localFilters.maxSalary ?? ''}
                            onChange={handleNumberChange}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                            placeholder="Max"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-[13px] text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                        />
                    </div>
                </AccordionItem>

                <AccordionItem title="Current designation">
                    <input
                        type="text"
                        name="jobTitle"
                        value={localFilters.jobTitle}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                        placeholder="e.g. Software Engineer"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </AccordionItem>

                <AccordionItem title="Degree/Course">
                    <input
                        type="text"
                        name="education"
                        value={localFilters.education}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applySearch(); } }}
                        placeholder="e.g. B.Tech, MBA"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    />
                </AccordionItem>
            </form>
        </div>
    );
}
