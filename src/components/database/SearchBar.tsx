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
            <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
            <Input 
            type='search'
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-10 pr-4 py-2 text-base'
            />
        </div>
    );
}