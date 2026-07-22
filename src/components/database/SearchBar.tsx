'use client'

import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

export function SearchBar({ searchTerm, onSearchChange, placeholder = "Search...", icon }: SearchBarProps) {
    return (
        <div className='relative w-full group'>
            <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10'>
                {icon || <SearchIcon className='h-[18px] w-[18px]' />}
            </div>
            <Input 
                type='search'
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='w-full pl-11 pr-4 h-12 text-[14px] rounded-2xl border-slate-200 bg-slate-50/80 hover:bg-slate-100/50 hover:border-slate-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all shadow-sm font-medium text-slate-700 placeholder:font-normal'
            />
        </div>
    );
}