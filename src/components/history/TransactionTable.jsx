import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  History,
  Building2
} from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  completed: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Failed" },
  cancelled: { icon: XCircle, color: "bg-gray-100 text-gray-800", label: "Cancelled" }
};

const TransactionRow = ({ transaction, index }) => {
  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-slate-900 truncate">
                {transaction.from_company_name || 'Unknown'} → {transaction.to_company_name || 'Unknown'}
              </p>
              <Badge className={status.color} variant="secondary">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-500 mb-1">
              {format(new Date(transaction.created_date), "MMM d, yyyy 'at' h:mm a")}
            </p>
            
            {transaction.description && (
              <p className="text-sm text-slate-600 mb-2">{transaction.description}</p>
            )}
            
            {transaction.transaction_hash && (
              <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                  {transaction.transaction_hash.slice(0, 20)}...
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => copyToClipboard(transaction.transaction_hash)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right space-y-1">
          <p className="text-2xl font-bold text-slate-900">
            ${transaction.amount.toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">USDC</p>
          {transaction.fee > 0 && (
            <p className="text-xs text-slate-400">
              Fee: ${transaction.fee.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function TransactionTable({ transactions, isLoading, companies }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No transactions found</h3>
            <p className="text-slate-500 mb-6">
              No transactions match your current search and filter criteria.
            </p>
            <p className="text-sm text-slate-400">
              Try adjusting your filters or search terms to see more results.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}