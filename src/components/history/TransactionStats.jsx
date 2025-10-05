import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft 
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, index, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="border-0 shadow-sm bg-white">
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

export default function TransactionStats({ transactions, isLoading }) {
  const stats = {
    totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    totalTransactions: transactions.length,
    avgAmount: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length 
      : 0,
    completedTransactions: transactions.filter(t => t.status === 'completed').length
  };

  const statsData = [
    {
      title: "Total Volume",
      value: `$${stats.totalVolume.toLocaleString()} USDC`,
      icon: DollarSign,
      color: "bg-blue-500"
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      title: "Average Amount",
      value: `$${stats.avgAmount.toFixed(2)}`,
      icon: ArrowUpRight,
      color: "bg-purple-500"
    },
    {
      title: "Completed",
      value: `${stats.completedTransactions}/${stats.totalTransactions}`,
      icon: ArrowDownLeft,
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