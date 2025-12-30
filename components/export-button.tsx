'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { getAllAttendanceForExport } from '@/app/actions/get-export-data';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);

    // Helper to create a faded (blurred/watermark) version of the logo using Canvas
    const createWatermarkBuffer = (imgSrc: string): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Set canvas size (keep aspect ratio/resolution)
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw with low opacity for watermark effect
                ctx.globalAlpha = 0.1; // 10% opacity (very faded)
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        blob.arrayBuffer().then(resolve).catch(reject);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/png');
            };
            img.onerror = (e) => reject(e);
        });
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            // 1. Fetch Data
            const data = await getAllAttendanceForExport();

            if (!data || data.length === 0) {
                alert('No attendance records to export.');
                setLoading(false);
                return;
            }

            // 2. Prepare Images
            // Fetch normal logo for header
            const logoResponse = await fetch('/logo.png');
            const logoBlob = await logoResponse.blob();
            const logoBuffer = await logoBlob.arrayBuffer();

            // Create faded logo for watermark
            const watermarkBuffer = await createWatermarkBuffer('/logo.png');

            // 3. Create Workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Attendance Record');

            // 4. Add Header Logo
            const logoId = workbook.addImage({
                buffer: logoBuffer,
                extension: 'png',
            });

            worksheet.addImage(logoId, {
                tl: { col: 0, row: 0 },
                ext: { width: 100, height: 100 },
            });

            // 5. Add Header Text
            worksheet.getRow(1).height = 30;
            worksheet.getRow(2).height = 30;
            worksheet.getRow(3).height = 30;
            worksheet.getRow(4).height = 30;

            worksheet.mergeCells('C1:F2');
            const titleCell = worksheet.getCell('C1');
            titleCell.value = 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI';
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF000000' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('C3:F4');
            const subTitleCell = worksheet.getCell('C3');
            subTitleCell.value = 'ATTENDANCE REPORT';
            subTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF2563EB' } };
            subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // 6. Setup Data Table Header
            const headerRow = worksheet.getRow(6);
            headerRow.values = ['Date', 'Time', 'Student Name', 'Matric Number', 'Department', 'Level', 'Status'];
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.height = 25;

            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E293B' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // 7. Add Data
            data.forEach((record) => {
                const date = new Date(record.timestamp);
                const row = worksheet.addRow([
                    date.toLocaleDateString(),
                    date.toLocaleTimeString(),
                    record.fullName,
                    record.matricNumber,
                    record.department,
                    record.level,
                    record.status
                ]);

                row.alignment = { vertical: 'middle', horizontal: 'left' };
                row.getCell(7).alignment = { horizontal: 'center' };
                row.getCell(7).font = { color: { argb: 'FF166534' }, bold: true };
            });

            // 8. Auto-width columns
            worksheet.columns.forEach((column) => {
                if (column) {
                    column.width = 20;
                }
            });
            worksheet.getColumn(3).width = 30; // Name
            worksheet.getColumn(4).width = 25; // Matric
            worksheet.getColumn(5).width = 25; // Dept

            // 9. Add Watermark (Single Centered Image behind data)
            const watermarkId = workbook.addImage({
                buffer: watermarkBuffer,
                extension: 'png',
            });

            // Calculate center position approx
            // We'll place it starting around row 10, column C
            // And scale it up large
            worksheet.addImage(watermarkId, {
                tl: { col: 2, row: 8 }, // Start at Column C, Row 9
                ext: { width: 400, height: 400 }, // Large size
                editAs: 'absolute' // Position independent of cells
            });


            // 10. Write File
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            variant="outline"
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export Excel
        </Button>
    );
}
