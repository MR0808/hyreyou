'use client';

import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface MonthYearPickerProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const MONTHS = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
];

export function MonthYearPicker({
    value = '',
    onChange,
    disabled,
    placeholder
}: MonthYearPickerProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

    const [month, year] = value ? value.split('-') : ['', ''];

    const handleMonthChange = (newMonth: string) => {
        if (year) {
            onChange(`${year}-${newMonth}`);
        } else {
            onChange(`${currentYear}-${newMonth}`);
        }
    };

    const handleYearChange = (newYear: string) => {
        if (month) {
            onChange(`${newYear}-${month}`);
        } else {
            onChange(`${newYear}-01`);
        }
    };

    return (
        <div className="flex gap-2">
            <Select
                value={month}
                onValueChange={handleMonthChange}
                disabled={disabled}
            >
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {MONTHS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={year}
                onValueChange={handleYearChange}
                disabled={disabled}
            >
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
