import React, { useState, useEffect } from "react";
import { Company, Transaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Wallet, 
  TrendingUp, 
  Send, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft,
  Plus,
  Eye,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalCompanies: 0,
    totalTransactions: 0,
    monthlyVolume: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companiesData, transactionsData] = await Promise.all([
        Company.list('-created_date'),
        Transaction.list('-created_date', 10)
      ]);

      setCompanies(companiesData);
      setTransactions(transactionsData);

      // Calculate stats
      const totalBalance = companiesData.reduce((sum, company) => sum + (company.wallet_balance || 0), 0);
      const monthlyVolume = transactionsData
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalBalance,
        totalCompanies: companiesData.length,
        totalTransactions: transactionsData.length,
        monthlyVolume
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Dashboard</h1>
            <p className="text-slate-600 text-lg">Manage your business payments with Circle's USDC infrastructure</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link to={createPageUrl("Payments")} className="flex-1 lg:flex-none">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Send className="w-4 h-4 mr-2" />
                Send Payment
              </Button>
            </Link>
            <Link to={createPageUrl("Register")} className="flex-1 lg:flex-none">
              <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50">
                <Plus className="w-4 h-4 mr-2" />
                Register Company
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsOverview stats={stats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <RecentTransactions 
              transactions={transactions}
              isLoading={isLoading}
            />
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            <QuickActions />
            
            {/* Platform Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Circle Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">USDC Native</p>
                        <p className="text-sm text-blue-700">Dollar-pegged stablecoin</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Enterprise Ready</p>
                        <p className="text-sm text-blue-700">Built for business scale</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}