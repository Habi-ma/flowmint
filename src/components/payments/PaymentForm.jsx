import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Wallet, 
  Building2, 
  DollarSign,
  AlertTriangle
} from "lucide-react";

import CompanySelector from "./CompanySelector";

export default function PaymentForm({
  companies,
  paymentData,
  setPaymentData,
  userCompany,
  selectedToCompany,
  setSelectedToCompany,
  onSubmit,
  error,
  setError
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedToCompany) {
      setError('Please select a recipient company');
      return;
    }

    if (userCompany && userCompany.id === selectedToCompany.id) {
      setError('Cannot send payment to your own company');
      return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    // Note: Wallet balance validation will be done on the server side
    // since basic company info doesn't include wallet_balance

    if (parseFloat(paymentData.amount) > 50000) {
      setError('Maximum payment amount is $50,000 USDC');
      return;
    }

    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Send className="w-5 h-5 text-blue-600" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Company - Display Only */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">From Company</Label>
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{userCompany?.company_name}</p>
                    <p className="text-xs text-slate-500">{userCompany?.business_email}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Wallet className="w-3 h-3 mr-1" />
                      ${userCompany?.wallet_balance?.toFixed(2) || '0.00'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* To Company */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">To Company</Label>
              <CompanySelector
                companies={companies}
                selected={selectedToCompany}
                onSelect={setSelectedToCompany}
                placeholder="Select recipient company"
                showBalance={false}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Amount (USDC)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="50000"
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="pl-10 text-lg font-semibold"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Minimum: $0.01</span>
                <span>Maximum: $50,000</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Payment Description <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                placeholder="Invoice payment, service fee, etc..."
                value={paymentData.description}
                onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Payment Summary */}
            {userCompany && selectedToCompany && paymentData.amount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-50 rounded-lg p-4 space-y-2"
              >
                <h4 className="font-semibold text-blue-900 text-sm">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payment Amount:</span>
                    <span className="font-semibold text-blue-900">
                      ${parseFloat(paymentData.amount || 0).toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Network Fee:</span>
                    <span className="font-semibold text-green-600">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1 font-semibold">
                    <span className="text-blue-900">Total Amount:</span>
                    <span className="text-blue-900">
                      ${parseFloat(paymentData.amount || 0).toFixed(2)} USDC
                    </span>
                  </div>
                </div>
                
                {/* Wallet balance validation will be done on the server side */}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!userCompany || !selectedToCompany || !paymentData.amount}
            >
              <Send className="w-5 h-5 mr-2" />
              Review Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}