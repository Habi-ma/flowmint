import React, { useState, useEffect } from "react";
import { Company, Transaction, User } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  ArrowLeft, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Building2,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PaymentForm from "../components/payments/PaymentForm";
import CompanySelector from "../components/payments/CompanySelector";
import PaymentConfirmation from "../components/payments/PaymentConfirmation";

export default function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [userCompany, setUserCompany] = useState(null);
  const [step, setStep] = useState('form'); // form, confirm, success
  const [paymentData, setPaymentData] = useState({
    from_company_id: '',
    to_company_id: '',
    amount: '',
    description: ''
  });
  const [selectedToCompany, setSelectedToCompany] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadUserAndCompanies();
  }, []);

  const loadUserAndCompanies = async () => {
    try {
      // Load user's company information
      const userData = await User.getCurrent();
      setUserCompany(userData.company);
      setPaymentData(prev => ({ ...prev, from_company_id: userData.company.id }));

      // Load all companies for recipient selection (excluding user's own company)
      const allCompanies = await Company.searchBasic('');
      const otherCompanies = allCompanies.filter(c => c.id !== userData.company.id);
      setCompanies(otherCompanies);
    } catch (error) {
      console.error('Error loading user and companies:', error);
      setError('Failed to load user or company information');
    }
  };

  const handlePaymentSubmit = async (formData) => {
    setError('');
    setIsProcessing(true);

    try {
      // Validate sufficient funds using user's company data
      if (userCompany.wallet_balance < parseFloat(formData.amount)) {
        throw new Error('Insufficient funds in your wallet');
      }

      // Get recipient company full data for balance update
      const toCompanyFull = await Company.get(selectedToCompany.id);

      // Create transaction record
      const transactionData = {
        ...formData,
        from_company_name: userCompany.company_name,
        to_company_name: selectedToCompany.company_name,
        status: 'completed', // In real app, this would be 'pending' until Circle confirms
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash
        fee: 0 // Circle typically has no fees for USDC transfers
      };

      const transaction = await Transaction.create(transactionData);
      
      // Update wallet balances (in real app, Circle would handle this)
      await Company.update(userCompany.id, {
        wallet_balance: userCompany.wallet_balance - parseFloat(formData.amount)
      });
      
      await Company.update(selectedToCompany.id, {
        wallet_balance: toCompanyFull.wallet_balance + parseFloat(formData.amount)
      });

      setTransactionId(transaction.id);
      setStep('success');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setPaymentData({
      from_company_id: userCompany?.id || '',
      to_company_id: '',
      amount: '',
      description: ''
    });
    setSelectedToCompany(null);
    setError('');
    setTransactionId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Send Payment</h1>
            <p className="text-slate-600">Transfer USDC between registered companies</p>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Flow */}
        <div className="space-y-6">
          {step === 'form' && (
            <PaymentForm
              companies={companies}
              paymentData={paymentData}
              setPaymentData={setPaymentData}
              userCompany={userCompany}
              selectedToCompany={selectedToCompany}
              setSelectedToCompany={setSelectedToCompany}
              onSubmit={() => setStep('confirm')}
              error={error}
              setError={setError}
            />
          )}

          {step === 'confirm' && (
            <PaymentConfirmation
              paymentData={paymentData}
              fromCompany={userCompany}
              toCompany={selectedToCompany}
              onConfirm={handlePaymentSubmit}
              onCancel={() => setStep('form')}
              isProcessing={isProcessing}
            />
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Sent!</h2>
                  <p className="text-slate-600 mb-6">
                    Your USDC payment has been successfully processed via Circle's infrastructure.
                  </p>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-semibold">${parseFloat(paymentData.amount).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">From:</span>
                      <span className="font-semibold">{userCompany?.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">To:</span>
                      <span className="font-semibold">{selectedToCompany?.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{transactionId}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Send Another
                    </Button>
                    <Button
                      onClick={() => navigate(createPageUrl("Dashboard"))}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}