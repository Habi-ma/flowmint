import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Send, 
  Building2, 
  History
} from "lucide-react";

const actions = [
  {
    title: "Send Payment",
    description: "Transfer USDC to companies",
    icon: Send,
    url: "Payments",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    title: "View Companies",
    description: "Browse registered businesses",
    icon: Building2,
    url: "Companies",
    color: "bg-green-600 hover:bg-green-700"
  },
  {
    title: "Transaction History",
    description: "View all payment records",
    icon: History,
    url: "History",
    color: "bg-purple-600 hover:bg-purple-700"
  }
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action, index) => (
            <Link key={action.title} to={createPageUrl(action.url)}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 p-4 h-auto hover:bg-slate-50 border-slate-200"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{action.title}</p>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}