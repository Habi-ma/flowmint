import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Building2, 
  DollarSign, 
  Clock, 
  Shield,
  Wallet,
  FileText,
  Loader2
} from "lucide-react";

export default function PaymentConfirmation({
  paymentData,
  fromCompany,
  toCompany,
  onConfirm,
  onCancel,
  isProcessing
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-lg border-0 max-w-3xl mx-auto">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
            Confirm Payment
          </CardTitle>
          <p className="text-slate-600">
            Please review the payment details before proceeding
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Transaction Flow Visualization */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900">{fromCompany.company_name}</p>
              <p className="text-sm text-slate-500">Sender</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <Wallet className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-medium">
                  ${fromCompany.wallet_balance.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-6 h-6 text-blue-600" />
                <DollarSign className="w-6 h-6 text-green-600" />
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1">
                ${parseFloat(paymentData.amount).toFixed(2)} USDC
              </Badge>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-slate-900">{toCompany.company_name}</p>
              <p className="text-sm text-slate-500">Recipient</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 text-lg mb-4">Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Amount:</span>
                  <span className="font-semibold text-slate-900">
                    ${parseFloat(paymentData.amount).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Network Fee:</span>
                  <span className="font-semibold text-green-600">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-900">Total Amount:</span>
                  <span className="text-slate-900">
                    ${parseFloat(paymentData.amount).toFixed(2)} USDC
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Balance:</span>
                  <span className="font-semibold text-slate-900">
                    ${fromCompany.wallet_balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">After Payment:</span>
                  <span className="font-semibold text-slate-900">
                    ${(fromCompany.wallet_balance - parseFloat(paymentData.amount)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-600">Est. Completion:</span>
                  <span className="font-semibold text-blue-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    ~30 seconds
                  </span>
                </div>
              </div>
            </div>

            {paymentData.description && (
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Payment Description:</p>
                    <p className="font-medium text-slate-900">{paymentData.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Secure Transaction</p>
                <p className="text-green-700 text-sm">
                  Protected by Circle's enterprise-grade security and USDC stablecoin technology
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 h-12"
            >
              Cancel Payment
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Confirm & Send Payment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}