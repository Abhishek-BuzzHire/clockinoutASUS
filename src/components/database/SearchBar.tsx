'use client'

import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    placeholder?: string;
}

export function SearchBar({ searchTerm, onSearchChange, placeholder = "Search by Name, Skill, Education, Title..."}: SearchBarProps) {
    return (
        <div className='relative w-full'>
            <SearchIcon className='absolute left-4 top-1/2 transform -translate-y-1/2 h-[18px] w-[18px] text-gray-400' />
            <Input 
                type='search'
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='w-full pl-11 pr-4 py-6 text-[15px] rounded-full border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm'
            />
        </div>
    );
}