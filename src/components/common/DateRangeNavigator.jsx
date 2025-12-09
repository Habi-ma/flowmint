import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subWeeks, subMonths, subYears, addWeeks, addMonths, addYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export default function DateRangeNavigator({ dateRange, dateMode, onDateRangeChange, onDateModeChange }) {

    const handleDatePreset = (mode) => {
        const today = new Date();
        let range;

        switch (mode) {
            case 'week':
                const lastWeek = subWeeks(today, 1);
                range = { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) };
                break;
            case 'month':
                const lastMonth = subMonths(today, 1);
                range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case 'year':
                const lastYear = subYears(today, 1);
                range = { from: startOfYear(lastYear), to: endOfYear(lastYear) };
                break;
            default:
                return;
        }

        onDateRangeChange(range);
        onDateModeChange(mode);
    };

    const movePeriod = (direction) => {
        if (!dateRange?.from || !dateMode || dateMode === 'custom') return;

        const { from, to } = dateRange;
        let newFrom, newTo;

        if (direction === 'next') {
            if (dateMode === 'week') {
                newFrom = addWeeks(from, 1);
                newTo = addWeeks(to, 1);
            } else if (dateMode === 'month') {
                newFrom = addMonths(from, 1);
                newFrom = startOfMonth(newFrom);
                newTo = endOfMonth(newFrom);
            } else if (dateMode === 'year') {
                newFrom = addYears(from, 1);
                newTo = addYears(to, 1);
            }
        } else {
            if (dateMode === 'week') {
                newFrom = subWeeks(from, 1);
                newTo = subWeeks(to, 1);
            } else if (dateMode === 'month') {
                newFrom = subMonths(from, 1);
                newFrom = startOfMonth(newFrom);
                newTo = endOfMonth(newFrom);
            } else if (dateMode === 'year') {
                newFrom = subYears(from, 1);
                newTo = subYears(to, 1);
            }
        }

        onDateRangeChange({ from: newFrom, to: newTo });
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => movePeriod('prev')}
                disabled={!dateMode || dateMode === 'custom'}
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal bg-white border-slate-200",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDatePreset('week')}>Last Week</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDatePreset('month')}>Last Month</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDatePreset('year')}>Last Year</Button>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                            onDateRangeChange(range);
                            onDateModeChange('custom');
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="icon"
                className="w-8 h-8"
                onClick={() => movePeriod('next')}
                disabled={!dateMode || dateMode === 'custom'}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
