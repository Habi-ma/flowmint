import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Hash,
  ArrowRight,
  ArrowLeft,
  Shield,
  Loader2
} from "lucide-react";

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "media", label: "Media" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" }
];

export default function CompanyRegistrationForm({
  currentStep,
  formData,
  setFormData,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting
}) {
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep1 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="w-5 h-5 text-blue-600" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Company Name *
          </Label>
          <Input
            placeholder="Enter your legal company name"
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Business Email *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="email"
              placeholder="business@company.com"
              value={formData.business_email}
              onChange={(e) => updateField('business_email', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Industry *
          </Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => updateField('industry', value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Tax ID <span className="text-slate-400 font-normal">(Optional)</span>
          </Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Business tax identification number"
              value={formData.tax_id}
              onChange={(e) => updateField('tax_id', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Button onClick={onNext} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
          Next: Contact Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="w-5 h-5 text-blue-600" />
          Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Contact Person *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Primary contact person name"
              value={formData.contact_person}
              onChange={(e) => updateField('contact_person', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone_number}
              onChange={(e) => updateField('phone_number', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Business Address *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Textarea
              placeholder="Full business address including city, state, and postal code"
              value={formData.business_address}
              onChange={(e) => updateField('business_address', e.target.value)}
              className="pl-10 min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onPrevious} className="flex-1 h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700">
            Review & Submit
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5 text-blue-600" />
          Review & Submit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Company Name:</p>
              <p className="font-medium text-slate-900">{formData.company_name}</p>
            </div>
            <div>
              <p className="text-slate-600">Industry:</p>
              <p className="font-medium text-slate-900 capitalize">
                {formData.industry?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Business Email:</p>
              <p className="font-medium text-slate-900">{formData.business_email}</p>
            </div>
            <div>
              <p className="text-slate-600">Contact Person:</p>
              <p className="font-medium text-slate-900">{formData.contact_person}</p>
            </div>
            <div>
              <p className="text-slate-600">Phone Number:</p>
              <p className="font-medium text-slate-900">{formData.phone_number}</p>
            </div>
            {formData.tax_id && (
              <div>
                <p className="text-slate-600">Tax ID:</p>
                <p className="font-medium text-slate-900">{formData.tax_id}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-slate-600">Business Address:</p>
              <p className="font-medium text-slate-900">{formData.business_address}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">What happens next?</h4>
          </div>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• A USDC wallet will be created for your company</li>
            <li>• You'll receive $1,000 USDC demo balance to get started</li>
            <li>• KYC verification will be processed (demo: auto-approved)</li>
            <li>• You can immediately send and receive payments</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onPrevious} className="flex-1 h-12" disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={onSubmit} 
            className="flex-1 h-12 bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Register Company
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </motion.div>
  );
}