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
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    };

    return (
        <div className="w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            {/* Top Checkboxes */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <input type="checkbox" id="hideProfiles" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <label htmlFor="hideProfiles" className="text-[15px] text-slate-700 cursor-pointer select-none">Hide Profiles</label>
            </div>

            {/* Filter Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-slate-800 font-bold text-lg">
                <Filter size={18} className="text-slate-500" />
                Filters
            </div>

            {/* Premium Institute Checkbox */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <input type="checkbox" id="premiumInstitute" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <label htmlFor="premiumInstitute" className="text-[15px] text-slate-700 cursor-pointer select-none">Premium Institute Candidates</label>
            </div>

            {/* Accordions */}
            <div className="flex flex-col">
                <AccordionItem title="Keywords" defaultOpen>
                    <input
                        type="text"
                        name="skills"
                        value={filters.skills}
                        onChange={handleInputChange}
                        placeholder="e.g. React, Java, Sales"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </AccordionItem>

                <AccordionItem title="Current company" defaultOpen>
                    <input
                        type="text"
                        name="company"
                        value={filters.company}
                        onChange={handleInputChange}
                        placeholder="e.g. Amazon, Google"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </AccordionItem>

                <AccordionItem title="Location" defaultOpen>
                    <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Mumbai, Delhi"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </AccordionItem>

                <AccordionItem title="Experience (Years)" defaultOpen>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minExperience"
                            value={filters.minExperience === 0 ? '' : filters.minExperience}
                            onChange={(e) => setFilters(p => ({...p, minExperience: Number(e.target.value)}))}
                            placeholder="Min"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                            type="number"
                            name="maxExperience"
                            value={filters.maxExperience ?? ''}
                            onChange={handleNumberChange}
                            placeholder="Max"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </AccordionItem>

                <AccordionItem title="Salary (INR-Lacs)">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minSalary"
                            value={filters.minSalary === 0 ? '' : filters.minSalary}
                            onChange={(e) => setFilters(p => ({...p, minSalary: Number(e.target.value)}))}
                            placeholder="Min"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <input
                            type="number"
                            name="maxSalary"
                            value={filters.maxSalary ?? ''}
                            onChange={handleNumberChange}
                            placeholder="Max"
                            className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </AccordionItem>

                <AccordionItem title="Current designation">
                    <input
                        type="text"
                        name="jobTitle"
                        value={filters.jobTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. Software Engineer"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </AccordionItem>

                <AccordionItem title="Department and Role">
                    <div className="text-sm text-gray-500 py-2">Select department...</div>
                </AccordionItem>

                <AccordionItem title="Industry">
                    <div className="text-sm text-gray-500 py-2">Select industry...</div>
                </AccordionItem>

                <AccordionItem 
                    title="Diversity hiring" 
                    badge={<span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">New Add-on</span>}
                >
                    <div className="text-sm text-gray-500 py-2">Select diversity filters...</div>
                </AccordionItem>

                <AccordionItem title="Notice period">
                    <select
                        name="notice"
                        value={filters.notice ?? ''}
                        onChange={(e) => setFilters(p => ({...p, notice: e.target.value ? Number(e.target.value) : null}))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Any</option>
                        <option value="15">15 Days or less</option>
                        <option value="30">1 Month</option>
                        <option value="60">2 Months</option>
                        <option value="90">3 Months</option>
                    </select>
                </AccordionItem>

                <AccordionItem title="Age">
                    <div className="text-sm text-gray-500 py-2">Select age range...</div>
                </AccordionItem>

                <AccordionItem title="Degree/Course">
                    <input
                        type="text"
                        name="education"
                        value={filters.education}
                        onChange={handleInputChange}
                        placeholder="e.g. B.Tech, MBA"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </AccordionItem>
                
                <AccordionItem title="College name">
                    <div className="text-sm text-gray-500 py-2">Enter college name...</div>
                </AccordionItem>

                <AccordionItem title="Year of degree completion">
                    <div className="text-sm text-gray-500 py-2">Select year...</div>
                </AccordionItem>
                
                <AccordionItem title="Employment type">
                    <div className="text-sm text-gray-500 py-2">Select type...</div>
                </AccordionItem>

            </div>
        </div>
    );
}
