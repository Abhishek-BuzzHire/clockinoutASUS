'use client'

import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, X } from 'lucide-react';

export interface Filters {
    skills: string;
    minExperience: number;
    maxExperience: number | null;
    education: string;
    minSalary: number;
    maxSalary: number | null;
    company: string;
    notice: number | null;
    location: string;
    jobTitle: string;
}

interface FilterControlProps {
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>;
    // allJobTitle: string[];
    // allLocations: string[];
}

export function FilterControls({ filters, setFilters }: FilterControlProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSliderChange = (value: number[]) => {
        setFilters(prev => ({ ...prev, notice: value[0] === 0 ? null : value[0] }));
    };

    // const handleSelectChange = (name: keyof Filters) => (value: string) => {
    //     setFilters(prev => ({ ...prev, [name]: value === "all" ? "" : value }));
    // };

    const resetFilters = () => {
        setFilters({ skills: '', minExperience: 0, maxExperience: null, education: '', minSalary: 0, maxSalary: null, company: '', notice: null, location: '', jobTitle: '' })
    }

    return (
        <div className="w-full">
            <Button onClick={() => setShowFilters(!showFilters)}
                variant="outline" className='mb-4 w-full md:w-auto'>
                <Filter className='mr-2 h-4 w-4' />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {showFilters && (
                <Card className="mb-6 shadow-md">
                    <CardHeader>
                        <CardTitle className='text-lg flex justify-between items-center pl-3'>
                            Advance Filters
                            <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters">
                                <X className='h-4 w-4' />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5'>
                        <div className='space-y-2'>
                            <Label htmlFor="skills"> Skills (Comma-Separated) </Label>
                            <Input
                                id='skills'
                                name='skills'
                                placeholder='e.g., React, Node, Pyhton, ...'
                                value={filters.skills}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id='location'
                                name='location'
                                placeholder='e.g., Mumbai, Bangalore, Gurugram, ...'
                                value={filters.location}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="jobTitle">Designation / Job Title</Label>
                            <Input
                                id='jobTitle'
                                name='jobTitle'
                                placeholder='e.g., Software Developer, Data Scientist, Product Manager, ...'
                                value={filters.jobTitle}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="education"> Education - College / Degree </Label>
                            <Input
                                id='education'
                                name='education'
                                placeholder='e.g., IIT, B.Tech, NIT, ...'
                                value={filters.education}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='flex space-y-2 gap-2'>
                            <div className='w-1/2'>
                                <Label htmlFor="minExperience">Min. Experience:</Label>
                                <Input
                                    id="minExperience"
                                    name='minExperience'
                                    type='number'
                                    value={filters.minExperience}
                                    onChange={handleInputChange}
                                    placeholder='In Years'
                                />
                            </div>
                            <div className='w-1/2'>
                                <Label htmlFor="maxExperience">Max. Experience:</Label>
                                <Input
                                    id="maxExperience"
                                    name='maxExperience'
                                    type='number'
                                    value={filters.maxExperience ?? ''}
                                    onChange={handleInputChange}
                                    placeholder='In Years'
                                />
                            </div>
                        </div>
                        <div className='flex space-y-2 gap-2'>
                            <div className='w-1/2'>
                                <Label htmlFor="minSalary">Min. Salary:</Label>
                                <Input
                                    id="minSalary"
                                    name='minSalary'
                                    type='number'
                                    value={filters.minSalary}
                                    onChange={handleInputChange}
                                    placeholder='In LPA'
                                />
                            </div>
                            <div className='w-1/2'>
                                <Label htmlFor="maxSalary">Max. Salary:</Label>
                                <Input
                                    id="maxSalary"
                                    name='maxSalary'
                                    type='number'
                                    value={filters.maxSalary ?? ''}
                                    onChange={handleInputChange}
                                    placeholder='In LPA'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="company"> Company (Comma-Separated) </Label>
                            <Input
                                id='company'
                                name='company'
                                placeholder='e.g., Amazon, Microsoft, META, ...'
                                value={filters.company}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label  htmlFor="notice">Max. Notice Period (Days) :{filters.notice === null ? 'No Limit' : filters.notice}</Label>
                            <Slider
                                id='notice'
                                name='notice'
                                min={0}
                                max={90}
                                step={15}
                                value={[filters.notice === null ? 0 : filters.notice]}
                                onValueChange={handleSliderChange}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

