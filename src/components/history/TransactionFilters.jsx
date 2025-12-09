import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function TransactionFilters({ filters, onFilterChange, companies }) {
  const handleFilterChange = (key, value) => {
    onFilterChange(prev => ({
      ...prev,
      [key]: value
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
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange}
            onSelect={(range) => handleFilterChange('dateRange', range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

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