import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const industries = [
  { value: "all", label: "All Industries" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "media", label: "Media" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" }
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" }
];

const kycStatuses = [
  { value: "all", label: "All KYC" },
  { value: "approved", label: "KYC Approved" },
  { value: "pending", label: "KYC Pending" },
  { value: "rejected", label: "KYC Rejected" }
];

export default function CompanyFilters({ filters, onFilterChange }) {
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
      
      <Select value={filters.industry} onValueChange={(value) => handleFilterChange('industry', value)}>
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          {industries.map((industry) => (
            <SelectItem key={industry.value} value={industry.value}>
              {industry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
        <SelectTrigger className="w-32 bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.kyc_status} onValueChange={(value) => handleFilterChange('kyc_status', value)}>
        <SelectTrigger className="w-36 bg-white">
          <SelectValue placeholder="KYC Status" />
        </SelectTrigger>
        <SelectContent>
          {kycStatuses.map((kyc) => (
            <SelectItem key={kyc.value} value={kyc.value}>
              {kyc.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}