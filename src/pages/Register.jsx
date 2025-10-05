import React, { useState } from "react";
import { Company } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle, 
  AlertCircle,
  Wallet,
  Shield,
  Mail,
  Phone,
  MapPin,
  User,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CompanyRegistrationForm from "../components/register/CompanyRegistrationForm";
import RegistrationSuccess from "../components/register/RegistrationSuccess";

const REGISTRATION_STEPS = [
  { id: 1, title: "Company Information", description: "Basic business details" },
  { id: 2, title: "Contact Details", description: "Business contact information" },
  { id: 3, title: "Verification", description: "Review and submit" }
];

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredCompany, setRegisteredCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    business_email: '',
    contact_person: '',
    phone_number: '',
    business_address: '',
    tax_id: '',
    industry: '',
    kyc_status: 'pending',
    registration_status: 'active'
  });

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.company_name.trim()) {
          setError('Company name is required');
          return false;
        }
        if (!formData.business_email.trim()) {
          setError('Business email is required');
          return false;
        }
        if (!formData.business_email.includes('@')) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.industry) {
          setError('Please select an industry');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.contact_person.trim()) {
          setError('Contact person name is required');
          return false;
        }
        if (!formData.phone_number.trim()) {
          setError('Phone number is required');
          return false;
        }
        if (!formData.business_address.trim()) {
          setError('Business address is required');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const submitRegistration = async () => {
    if (!validateStep(2)) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // Generate mock wallet address (in real app, Circle API would create this)
      const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      const companyData = {
        ...formData,
        wallet_address: walletAddress,
        wallet_balance: 1000, // Demo balance
      };

      const company = await Company.create(companyData);
      setRegisteredCompany(company);
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

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
            <h1 className="text-3xl font-bold text-slate-900">Register Company</h1>
            <p className="text-slate-600">Join the CirclePay platform and get your USDC wallet</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {currentStep <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              {REGISTRATION_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < REGISTRATION_STEPS.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                        currentStep >= step.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < REGISTRATION_STEPS.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded-full transition-all duration-200 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </motion.div>
        )}

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

        {/* Registration Form */}
        {currentStep <= 3 && (
          <CompanyRegistrationForm
            currentStep={currentStep}
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
            onPrevious={prevStep}
            onSubmit={submitRegistration}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Success Screen */}
        {currentStep === 4 && registeredCompany && (
          <RegistrationSuccess
            company={registeredCompany}
            onContinue={() => navigate(createPageUrl("Dashboard"))}
          />
        )}
      </div>
    </div>
  );
}