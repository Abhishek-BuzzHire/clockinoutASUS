'use client'

import { useState, useEffect } from "react";
import axios from 'axios'
import useSWR from 'swr';
import type { CandidateRec } from "@/lib/types";
import { EmployeeCard } from "@/components/database/EmployeeCard";
import { SearchBar } from "@/components/database/SearchBar";
import { FilterControls, Filters } from "@/components/database/FilterControls";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { DuplicateResolverModal } from "@/components/database/DuplicateResolverModal";
import { CopyX, Upload, UserPlus } from "lucide-react";
import Link from "next/link";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CandidateDatabasePage() {
    const [searchTerm, setSearchTerm] = useState('');
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

    const [debouncedUrl, setDebouncedUrl] = useState('');

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, itemsPerPage]);

    useEffect(() => {
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('searchTerm', searchTerm);
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

        const url = `${API_URL}/api/candidates?${queryParams.toString()}`;
        
        const timeoutId = setTimeout(() => {
            setDebouncedUrl(url);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [currentPage, itemsPerPage, searchTerm, filters]);

    const fetcher = async (url: string) => {
        const token = Cookies.get("access");
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };

    const { data, error, isLoading } = useSWR(debouncedUrl || null, fetcher, { 
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
        <div className="mx-2 my-5">
            <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
                <div className="w-full flex-1">
                    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    <Link href="/database/bulk-upload" className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-sky-400/50">
                        <Upload className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span>Upload Resume</span>
                    </Link>
                </div>
            </div>
            <div className="mb-2 space-y-4">
                <FilterControls
                    filters={filters}
                    setFilters={setFilters}
                // allJobTitle={allJobTitle}
                // allLocations={allLocations}
                />
            </div>

            {isLoading && employees.length === 0 && <div className="text-center py-10"><p className="text-xl">Loading Employees...</p></div>}
            {error && <div className="text-center py-10 text-red-500"><p className="text-xl">Failed to load employees. Please try again later.</p></div>}
            {(!isLoading || employees.length > 0) && !error && employees.length > 0 ? (
                <>
                    {totalProfiles > 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-semibold text-blue-700">
                                {totalProfiles} Results
                            </div>
                            <button 
                                onClick={() => setShowDuplicateResolver(true)} 
                                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm"
                            >
                                <CopyX className="w-4 h-4" /> Resolve Duplicates
                            </button>
                        </div>
                    )}

                    <div>
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
    );
}