import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, DollarSign, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subWeeks, subMonths, subYears, addWeeks, addMonths, addYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export default function TransactionFilters({ filters, onFilterChange, companies }) {
  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

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

    onFilterChange(prev => ({
      ...prev,
      dateRange: range,
      dateMode: mode
    }));
  };

  const movePeriod = (direction) => {
    if (!filters.dateRange?.from || !filters.dateMode || filters.dateMode === 'custom') return;

    const { from, to } = filters.dateRange;
    const mode = filters.dateMode;
    let newFrom, newTo;

    if (direction === 'next') {
      if (mode === 'week') {
        newFrom = addWeeks(from, 1);
        newTo = addWeeks(to, 1);
      } else if (mode === 'month') {
        newFrom = addMonths(from, 1);
        // Re-calculate end of month to handle varied days (28, 30, 31) correctly
        newFrom = startOfMonth(newFrom);
        newTo = endOfMonth(newFrom);
      } else if (mode === 'year') {
        newFrom = addYears(from, 1);
        newTo = addYears(to, 1);
      }
    } else {
      if (mode === 'week') {
        newFrom = subWeeks(from, 1);
        newTo = subWeeks(to, 1);
      } else if (mode === 'month') {
        newFrom = subMonths(from, 1);
        newFrom = startOfMonth(newFrom);
        newTo = endOfMonth(newFrom);
      } else if (mode === 'year') {
        newFrom = subYears(from, 1);
        newTo = subYears(to, 1);
      }
    }

    onFilterChange(prev => ({
      ...prev,
      dateRange: { from: newFrom, to: newTo }
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-32 bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => movePeriod('prev')}
          disabled={!filters.dateMode || filters.dateMode === 'custom'}
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
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
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
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => {
                handleFilterChange('dateRange', range);
                handleFilterChange('dateMode', 'custom');
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
          disabled={!filters.dateMode || filters.dateMode === 'custom'}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Select
        value={filters.company}
        onValueChange={(value) => handleFilterChange('company', value)}
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Companies</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 items-center">
        <div className="relative">
          <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Min"
            type="number"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className="w-20 pl-7 bg-white"
          />
        </div>
        <span className="text-slate-500">-</span>
        <div className="relative">
          <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Max"
            type="number"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className="w-20 pl-7 bg-white"
          />
        </div>
      </div>
    </div>
  );
}