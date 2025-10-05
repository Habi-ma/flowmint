import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  TrendingUp 
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, index, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full transform translate-x-8 -translate-y-8`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function StatsOverview({ stats, isLoading }) {
  const statsData = [
    {
      title: "Total Balance",
      value: `$${stats.totalBalance.toLocaleString()}`,
      icon: Wallet,
      color: "bg-blue-500"
    },
    {
      title: "Registered Companies",
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      color: "bg-green-500"
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: ArrowUpRight,
      color: "bg-purple-500"
    },
    {
      title: "Monthly Volume",
      value: `$${stats.monthlyVolume.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          index={index}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}