import { useState, useEffect } from "react";
import { Company } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Search, 
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CompanyCard from "../components/companies/CompanyCard";
import CompanyFilters from "../components/companies/CompanyFilters";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    industry: "all",
    status: "all",
    kyc_status: "all"
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, filters]);

  const loadCompanies = async () => {
    try {
      const data = await Company.list('-created_date');
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.business_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (filters.industry !== "all") {
      filtered = filtered.filter(company => company.industry === filters.industry);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(company => company.registration_status === filters.status);
    }

    // KYC filter
    if (filters.kyc_status !== "all") {
      filtered = filtered.filter(company => company.kyc_status === filters.kyc_status);
    }

    setFilteredCompanies(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Registered Companies</h1>
            <p className="text-slate-600 text-lg">Directory of businesses using FLowmint platform</p>
          </div>
          
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-6"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search companies by name, email, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12"
              />
            </div>
          </div>
          
          <CompanyFilters filters={filters} onFilterChange={setFilters} />
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <Users className="w-4 h-4" />
          <span>
            {isLoading ? "Loading..." : `${filteredCompanies.length} companies found`}
          </span>
        </motion.div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-500 mb-8">
              {searchTerm || filters.industry !== "all" || filters.status !== "all" || filters.kyc_status !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to register a company on the platform"
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCompanies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}