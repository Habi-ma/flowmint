import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  completed: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Failed" }
};

export default function RecentTransactions({ transactions, isLoading }) {
  const { userProfile } = useAuth();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Recent Transactions</CardTitle>
          <Link to={createPageUrl("History")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpRight className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions yet</h3>
              <p className="text-slate-500 mb-6">
                {userProfile?.user_role === 'back_office_admin' 
                  ? "View transaction history and manage companies" 
                  : "Start by sending your first payment"
                }
              </p>
              {userProfile?.user_role !== 'back_office_admin' && (
                <Link to={createPageUrl("Payments")}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Send Payment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const status = statusConfig[transaction.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {transaction.from_company_name || 'Unknown'} → {transaction.to_company_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(transaction.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-slate-600 mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <p className="font-bold text-slate-900">
                        ${transaction.amount.toFixed(2)} USDC
                      </p>
                      <Badge className={status.color} variant="secondary">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}