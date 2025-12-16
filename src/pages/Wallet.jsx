import { useState, useEffect } from "react";
import { Company, Transaction } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Wallet as WalletIcon,
  Send,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  PieChart as PieChartIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import RecentTransactions from "../components/dashboard/RecentTransactions";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Wallet() {
  const { userProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  const [stats, setStats] = useState({ pendingVolume: 0, totalVolume: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companyId = userProfile?.company?.id;

      const [companiesData, transactionsData, statsData] = await Promise.all([
        Company.list('-created_date'),
        Transaction.list('-created_date', 5), // Limit to 5 for clean UI
        Transaction.getStats(companyId)
      ]);

      setCompanies(companiesData);
      setTransactions(transactionsData);
      setStats(statsData);

      // Calculate total balance from companies wallet_balance
      // For back_office_admin, this sums all companies. For single company user, it's just theirs.
      // Note: Company.list returns all for admin (if no RLS) or user's company (if RLS).
      const calculatedBalance = companiesData.reduce((sum, company) => sum + (company.wallet_balance || 0), 0);
      setTotalBalance(calculatedBalance);

    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for asset distribution (since we only have USDC right now)
  const assetData = [
    { name: 'USDC', value: totalBalance > 0 ? totalBalance : 10000 },
  ];

  if (totalBalance === 0 && !isLoading) {
    // Show some split if empty for visual demo, or just 0 USDC
    assetData[0].value = 0;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Wallet</h1>
            <p className="text-slate-600 mt-1">Manage your digital assets and liquidity</p>
          </div>
          <div className="flex gap-3">
            {userProfile?.user_role === 'back_office_admin' ? (
              <Link to={createPageUrl("Register")}>
                <Button className="bg-green-600 hover:bg-green-700 shadow-sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Company
                </Button>
              </Link>
            ) : (
              <Link to={createPageUrl("Payments")}>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Send className="w-4 h-4 mr-2" />
                  Send Payment
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Asset Overview & Chart */}
          <div className="lg:col-span-2 space-y-6">

            {/* Total Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <WalletIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Total Balance</p>
                  <h2 className="text-4xl font-bold mt-1 text-slate-900">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-slate-500 text-sm">Available for Transfer</p>
                  <p className="text-xl font-semibold mt-1 text-slate-900">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Pending Settlements</p>
                  <p className="text-xl font-semibold mt-1 text-slate-900">${stats.pendingVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </motion.div>

            {/* Asset Distribution Chart */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-slate-500" />
                  Asset Distribution
                </CardTitle>
                <CardDescription>Breakdown of your digital currency holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 h-[300px]">
                  {/* Chart */}
                  <div className="w-full md:w-2/3 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={assetData.length > 1 ? 5 : 0}
                          dataKey="value"
                        >
                          {assetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const total = assetData.reduce((a, b) => a + b.value, 0);
                            const percent = total > 0 ? (value / total) * 100 : 0;
                            return [`$${value.toLocaleString()} (${percent.toFixed(0)}%)`, name];
                          }}
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Custom Legend */}
                  <div className="w-full md:w-1/3 space-y-2 pt-4">
                    {assetData.map((entry, index) => {
                      const total = assetData.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = total > 0 ? (entry.value / total) * 100 : 0;

                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-sm text-slate-600">{entry.name}</span>
                          </div>
                          <div className="text-right">
                            {/* Details hidden as per request, shown on hover */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset List */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Your Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">USDC</p>
                        <p className="text-sm text-slate-500">USD Coin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${totalBalance.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">{totalBalance > 0 ? "100%" : "0%"} of portfolio</p>
                    </div>
                  </div>
                  {/* Placeholder for future assets */}
                  {/* <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Bitcoin className="w-5 h-5 text-orange-600" />
                      </div>
                       <div>
                        <p className="font-semibold text-slate-900">BTC</p>
                        <p className="text-sm text-slate-500">Bitcoin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">$0.00</p>
                      <p className="text-sm text-slate-500">0% of portfolio</p>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Recent Activity & Actions */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions
                  transactions={transactions}
                  isLoading={isLoading}
                  simplified={true} // Pass a prop if we want a simpler view, or just use as is
                />
                <div className="mt-6">
                  <Link to={createPageUrl("History")}>
                    <Button variant="outline" className="w-full">View All History</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}