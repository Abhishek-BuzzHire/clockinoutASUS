'use client'

import { useState, useEffect } from "react";
import axios from 'axios'
import useSWR from 'swr';
import type { CandidateRec } from "@/lib/types";
import { EmployeeCard } from "@/components/database/EmployeeCard";
import { SearchBar } from "@/components/database/SearchBar";
import { Filters } from "@/components/database/FilterControls";
import { SidebarFilters } from "@/components/database/SidebarFilters";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { DuplicateResolverModal } from "@/components/database/DuplicateResolverModal";
import { CopyX, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CandidateDatabasePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({
        skills: '',
        minExperience: 0,
        maxExperience: null,
        education: '',
        minSalary: 0,
        maxSalary: null,
        company: '',
        notice: null,
        location: '',
        jobTitle: '',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDuplicateResolver, setShowDuplicateResolver] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters, itemsPerPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const queryParams = new URLSearchParams();
    if (debouncedSearchTerm) queryParams.append('searchTerm', debouncedSearchTerm);
    if (filters.skills) queryParams.append('skills', filters.skills);
    if (filters.minExperience > 0) queryParams.append('minExperience', filters.minExperience.toString());
    if (filters.maxExperience !== null) queryParams.append('maxExperience', filters.maxExperience.toString());
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.jobTitle) queryParams.append('jobTitle', filters.jobTitle);
    if (filters.minSalary > 0) queryParams.append('minSalary', filters.minSalary.toString());
    if (filters.maxSalary !== null) queryParams.append('maxSalary', filters.maxSalary.toString());
    if (filters.notice !== null) queryParams.append('notice', filters.notice.toString());
    if (filters.company) queryParams.append('company', filters.company);
    if (filters.education) queryParams.append('education', filters.education);

    queryParams.append('page', currentPage.toString());
    queryParams.append('limit', itemsPerPage.toString());

    const apiUrl = `${API_URL}/api/candidates?${queryParams.toString()}`;

    const fetcher = async (url: string) => {
        const token = Cookies.get("access");
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };

    const { data, error, isLoading } = useSWR(apiUrl, fetcher, { 
        keepPreviousData: true,
        revalidateOnFocus: false 
    });

    const employees: CandidateRec[] = data?.employees || [];
    const totalProfiles = data?.totalProfiles || 0;
    const totalPages = Math.ceil(totalProfiles / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // const allJobTitle = useMemo(() => Array.from(new Set(employees.map(emp => emp.jobTitle))), [employees]);
    // const allLocations = useMemo(() => Array.from(new Set(employees.map(emp => emp.location))), [employees]);

    //    New Code to --> here

    return (
        <div className="flex w-full bg-[#F7F8FA] p-0 md:p-4 gap-4 pb-20">
            <SidebarFilters filters={filters} setFilters={setFilters} />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full max-w-xl">
                        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm">
                        <span className="text-gray-500 hidden lg:inline">Want to reach candidates using bulk mails?</span>
                        <Link href="/database/bulk-upload" className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm">
                            <Upload className="w-4 h-4" />
                            <span>Upload Resume</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex justify-between items-center h-16">
                    <div className="text-[14px] text-gray-700">
                        <span className="font-bold text-blue-600 mr-1">✨ AI found</span> <span className="font-bold text-gray-900">{totalProfiles} profiles</span> {searchTerm ? `for ${searchTerm}` : ''}
                    </div>
                    <button 
                        onClick={() => setShowDuplicateResolver(true)} 
                        className="px-4 py-2 text-[14px] border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        <CopyX className="w-[18px] h-[18px]" /> Resolve Duplicates
                    </button>
                </div>

            {isLoading && employees.length === 0 && <div className="text-center py-10"><p className="text-xl">Loading Employees...</p></div>}
            {error && <div className="text-center py-10 text-red-500"><p className="text-xl">Failed to load employees. Please try again later.</p></div>}
            {(!isLoading || employees.length > 0) && !error && employees.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {employees.map(employee => (
                            <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(currentPage - 1);
                                        }}
                                        isActive={currentPage > 1}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) && (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(page);
                                                }}
                                                isActive={page === currentPage}>
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                ))}
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                        <span className="px-2 py-1.5 text-sm">...</span>
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationNext href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(currentPage + 1);
                                        }}
                                        isActive={currentPage < totalPages}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            ) : ((!isLoading || employees.length > 0) && !error && employees.length === 0 && totalProfiles > 0) ? (
                // This case is for when a filter yields no results on the current page,
                // but there are total profiles matching criteria on other pages.
                <div className="text-center py-10">
                    <p className="text-xl text-muted-foreground">No employees found on this page matching your criteria.</p>
                    {totalPages > 1 && (
                        <Button variant="link" onClick={() => handlePageChange(1)}>Go to first page</Button>
                    )}
                </div>
            ) : ((!isLoading || employees.length > 0) && !error && employees.length === 0 && totalProfiles === 0) ? (
                <div className="text-center py-10">
                    <p className="text-xl text-muted-foreground">No employees found matching your criteria.</p>
                </div>
            ) : null}

            {showDuplicateResolver && (
                <DuplicateResolverModal onClose={() => setShowDuplicateResolver(false)} />
            )}
            </div>
        </div>
    );
}