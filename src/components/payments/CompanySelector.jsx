import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Building2, 
  Wallet, 
  Check,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CompanySelector({ 
  companies, 
  selected, 
  onSelect, 
  placeholder = "Select company",
  showBalance = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.business_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (company) => {
    onSelect(company);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 border border-slate-200 rounded-lg cursor-pointer transition-all duration-200 bg-white hover:border-slate-300 ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
        } ${selected ? 'bg-blue-50' : ''}`}
      >
        {selected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selected.company_name}</p>
                <p className="text-xs text-slate-500">{selected.business_email}</p>
              </div>
            </div>
            {showBalance && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Building2 className="w-3 h-3 mr-1" />
                {selected.registration_status}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-500">
            <Building2 className="w-5 h-5" />
            <span>{placeholder}</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="shadow-lg border border-slate-200">
              <CardContent className="p-0">
                {/* Search */}
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 border-0 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Companies List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No companies found</p>
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelect(company)}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{company.company_name}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Mail className="w-3 h-3" />
                                {company.business_email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {showBalance && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  company.registration_status === 'active' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}
                              >
                                {company.registration_status}
                              </Badge>
                            )}
                            {selected?.id === company.id && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}