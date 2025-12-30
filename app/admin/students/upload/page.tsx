'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, UploadCloud, FileDown, Trash2, ShieldAlert } from 'lucide-react';
import Papa from 'papaparse';
import { bulkCreateStudents } from '@/app/actions/bulk-upload';
import { deleteAllStudents } from '@/app/actions/delete-all-students';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [stats, setStats] = useState<{ total: number; preview: any[] } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
            setStats(null);
        }
    };

    const parseFile = () => {
        if (!file) return;
        setParsing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsing(false);
                if (results.errors.length > 0) {
                    setMessage({ type: 'error', text: 'Error parsing CSV file. Check format.' });
                    return;
                }
                setStats({
                    total: results.data.length,
                    preview: results.data.slice(0, 3),
                });
                (window as any).parsedData = results.data;
            },
            error: (error) => {
                setParsing(false);
                setMessage({ type: 'error', text: `Parse error: ${error.message}` });
            }
        });
    };

    const handleUpload = async () => {
        const data = (window as any).parsedData;
        if (!data) return;

        setUploading(true);

        const formatted = data.map((row: any) => ({
            fullName: row.fullName || row.FullName || row['Full Name'],
            matricNumber: row.matricNumber || row.MatricNumber || row['Matric Number'],
            department: row.department || row.Department,
            level: String(row.level || row.Level),
        }));

        const result = await bulkCreateStudents(formatted);
        setUploading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result.success) {
            setMessage({ type: 'success', text: result.success });
            setFile(null);
            setStats(null);
            (window as any).parsedData = null;
        }
    };

    const handleDeleteAll = async () => {
        setDeleting(true);
        const result = await deleteAllStudents();
        setDeleting(false);
        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result.success) {
            setMessage({ type: 'success', text: result.success });
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,fullName,matricNumber,department,level\nJohn Doe,CSC/2024/001,Computer Science,100\nJane Smith,CSC/2024/002,Computer Science,200";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manage Students</h2>
                    <p className="text-slate-500">Bulk upload new students or manage existing data.</p>
                </div>
                <Link href="/admin/students">
                    <Button variant="outline">Back to List</Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Upload Section */}
                <Card className="md:col-span-2 shadow-md border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-blue-600" />
                            Bulk Upload Students
                        </CardTitle>
                        <CardDescription>
                            Upload a CSV file to add new students. <br />
                            <span className="font-semibold text-blue-600">Note:</span> New uploads will be <strong>appended</strong> to the existing list. Duplicate matric numbers will be skipped automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-700">Need a template?</p>
                                <p className="text-xs text-slate-500">Download a sample CSV file to see the required format.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                                <FileDown size={14} />
                                Download Template
                            </Button>
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv">Select CSV File</Label>
                            <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
                        </div>

                        {file && !stats && (
                            <Button onClick={parseFile} disabled={parsing} className="w-full sm:w-auto">
                                {parsing ? 'Parsing File...' : 'Preview Data'}
                            </Button>
                        )}

                        {stats && (
                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 animate-in fade-in-50">
                                <p className="font-semibold text-blue-900 mb-2">Ready to upload {stats.total} students.</p>
                                <div className="text-sm text-slate-600 mb-4 bg-white p-3 rounded border border-slate-100">
                                    <p className="font-medium mb-1">Preview of first 3 records:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {stats.preview.map((row, i) => (
                                            <li key={i}><span className="font-medium">{row.fullName || row.FullName}</span> <span className="text-slate-400">|</span> {row.matricNumber || row.MatricNumber}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
                                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setFile(null); setStats(null); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className={cn("p-4 rounded-lg flex items-start gap-3 border",
                                message.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>
                                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                                <div>
                                    <p className="font-medium">{message.type === 'success' ? 'Success' : 'Error'}</p>
                                    <p className="text-sm opacity-90">{message.text}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Database Management Section */}
                <Card className="md:col-span-2 shadow-sm border-red-100 bg-red-50/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <ShieldAlert className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Actions here are irreversible. Please proceed with caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-lg">
                            <div>
                                <h4 className="font-medium text-slate-900">Delete All Data</h4>
                                <p className="text-sm text-slate-500">Permanently remove ALL students and attendance records.</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="gap-2">
                                        <Trash2 size={16} />
                                        Clear Database
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete <strong>all {stats?.total || ''} student records</strong> and <strong>all attendance logs</strong> from the database.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">
                                            {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
