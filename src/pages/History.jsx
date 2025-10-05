import React, { useState, useEffect } from "react";
import { Transaction, Company } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  History, 
  Search, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Calendar,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import TransactionTable from "../components/history/TransactionTable";
import TransactionFilters from "../components/history/TransactionFilters";
import TransactionStats from "../components/history/TransactionStats";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    company: "all",
    minAmount: "",
    maxAmount: ""
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filters]);

  const loadData = async () => {
    try {
      const [transactionsData, companiesData] = await Promise.all([
        Transaction.list('-created_date'),
        Company.list()
      ]);

      setTransactions(transactionsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.from_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.to_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Company filter
    if (filters.company !== "all") {
      filtered = filtered.filter(transaction => 
        transaction.from_company_id === filters.company || 
        transaction.to_company_id === filters.company
      );
    }

    // Amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(transaction => transaction.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(transaction => transaction.amount <= parseFloat(filters.maxAmount));
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(transaction => 
          new Date(transaction.created_date) >= startDate
        );
      }
    }

    setFilteredTransactions(filtered);
  };

  const exportTransactions = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredTransactions.map(transaction => ({
        'Transaction ID': transaction.id,
        'Date': format(new Date(transaction.created_date), 'yyyy-MM-dd HH:mm:ss'),
        'From Company': transaction.from_company_name,
        'To Company': transaction.to_company_name,
        'Amount (USDC)': transaction.amount,
        'Status': transaction.status,
        'Description': transaction.description || '',
        'Transaction Hash': transaction.transaction_hash || '',
        'Fee (USDC)': transaction.fee || 0
      }));

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting transactions:", error);
    }
    setIsExporting(false);
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h1>
            <p className="text-slate-600 text-lg">Complete record of all USDC payments and transfers</p>
          </div>
          
          <Button
            onClick={exportTransactions}
            disabled={isExporting || filteredTransactions.length === 0}
            className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <TransactionStats 
          transactions={filteredTransactions}
          isLoading={isLoading}
        />

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
                placeholder="Search by company name, description, or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12"
              />
            </div>
          </div>
          
          <TransactionFilters 
            filters={filters} 
            onFilterChange={setFilters}
            companies={companies}
          />
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <History className="w-4 h-4" />
            <span>
              {isLoading ? "Loading..." : `${filteredTransactions.length} transactions found`}
            </span>
          </div>
          
          {filteredTransactions.length > 0 && (
            <div className="text-sm text-slate-600">
              Total Volume: <span className="font-semibold text-blue-600">
                ${filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)} USDC
              </span>
            </div>
          )}
        </motion.div>

        {/* Transactions Table */}
        <TransactionTable
          transactions={filteredTransactions}
          isLoading={isLoading}
          companies={companies}
        />
      </div>
    </div>
  );
}