'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { searchStudents } from '@/app/actions/search-students';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2, User, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface Student {
    matricNumber: string;
    fullName: string;
    department: string;
    level: string;
}

interface StudentSearchProps {
    className?: string;
    name?: string;
    required?: boolean;
}

export default function StudentSearch({ className, name = "matricNumber", required }: StudentSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleSearch = useDebouncedCallback(async (term: string) => {
        if (term.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        const data = await searchStudents(term);
        // Ensure the data matches our Student interface (handle potential missing fields if schema changed)
        const typedData = data.map((d: any) => ({
            matricNumber: d.matricNumber,
            fullName: d.fullName,
            department: d.department || 'N/A',
            level: d.level || 'N/A'
        }));
        setResults(typedData);
        setIsLoading(false);
        setIsOpen(typedData.length > 0);
    }, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedStudent(null); // Clear selection when typing
        handleSearch(value);
    };

    const handleSelect = (student: Student) => {
        setQuery(student.matricNumber);
        setSelectedStudent(student);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className={cn("relative space-y-4", className)}>
            <div className="relative">
                <Input
                    type="text"
                    name={name}
                    value={query}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter Matric Number (e.g. 232...)"
                    required={required}
                    className={cn(
                        "text-lg py-6 px-4 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10",
                        selectedStudent && "border-green-500 ring-1 ring-green-500 text-green-700 bg-green-50"
                    )}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Loader2 className="animate-spin h-5 w-5" />
                    </div>
                )}
                {selectedStudent && !isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto top-[54px]">
                    <ul className="py-1">
                        {results.map((student) => (
                            <li
                                key={student.matricNumber}
                                onClick={() => handleSelect(student)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                            >
                                <div className="font-medium text-slate-900">{student.matricNumber}</div>
                                <div className="text-sm text-slate-500">{student.fullName}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Student Details Preview Card */}
            {selectedStudent && (
                <Card className="bg-slate-50 border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CardContent className="p-4 grid gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Student Name</p>
                                <p className="font-bold text-slate-900">{selectedStudent.fullName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-start gap-2">
                                <Building2 size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Department</p>
                                    <p className="text-sm font-medium text-slate-800">{selectedStudent.department}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <GraduationCap size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Level</p>
                                    <p className="text-sm font-medium text-slate-800">{selectedStudent.level}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
