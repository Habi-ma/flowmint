import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, DollarSign } from "lucide-react";

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

      <Select 
        value={filters.dateRange} 
        onValueChange={(value) => handleFilterChange('dateRange', value)}
      >
        <SelectTrigger className="w-32 bg-white">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>

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