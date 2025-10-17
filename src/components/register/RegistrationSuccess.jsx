import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Wallet, 
  Building2, 
  Shield,
  Copy,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function RegistrationSuccess({ company, onContinue }) {
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(company.wallet_address);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to Flowmint!
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Your company has been successfully registered and your USDC wallet is ready.
          </p>

          {/* Company Details */}
          <div className="bg-white rounded-xl p-6 mb-8 space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-slate-900">{company.company_name}</h3>
            </div>

            {/* Wallet Information */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-slate-700">USDC Wallet Created</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Wallet Address:</p>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                  <code className="text-xs font-mono text-slate-800 flex-1">
                    {company.wallet_address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={copyWalletAddress}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-600">Starting Balance:</span>
                <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                  $1,000.00 USDC
                </Badge>
              </div>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-900">Registration Status</p>
                <p className="text-xs text-green-700">Active</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-yellow-900">KYC Status</p>
                <p className="text-xs text-yellow-700">Pending (Auto-approved for demo)</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-blue-900 mb-3">Ready to get started?</h4>
            <ul className="space-y-2 text-sm text-blue-700 text-left max-w-md mx-auto">
              <li>✓ Send payments to other registered companies</li>
              <li>✓ Track all your transaction history</li>
              <li>✓ View real-time wallet balances</li>
              <li>✓ Export transaction data</li>
            </ul>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}