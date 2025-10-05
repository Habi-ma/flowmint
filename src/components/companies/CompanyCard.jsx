import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Wallet,
  User,
  Shield,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

const industryIcons = {
  technology: "💻",
  finance: "💰",
  healthcare: "🏥",
  retail: "🛒",
  manufacturing: "🏭",
  consulting: "💼",
  media: "📺",
  real_estate: "🏢",
  other: "🔧"
};

const statusConfig = {
  active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  suspended: { color: "bg-red-100 text-red-800", icon: XCircle }
};

const kycStatusConfig = {
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function CompanyCard({ company, index }) {
  const status = statusConfig[company.registration_status] || statusConfig.pending;
  const kycStatus = kycStatusConfig[company.kyc_status] || kycStatusConfig.pending;
  const StatusIcon = status.icon;
  const KycIcon = kycStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xl">
                {industryIcons[company.industry] || industryIcons.other}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {company.company_name}
                </h3>
                <p className="text-sm text-slate-500 capitalize">
                  {company.industry?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={status.color} variant="secondary">
                <StatusIcon className="w-3 h-3 mr-1" />
                {company.registration_status}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">{company.contact_person}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 truncate">{company.business_email}</span>
            </div>
            {company.phone_number && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{company.phone_number}</span>
              </div>
            )}
            {company.business_address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 line-clamp-1">{company.business_address}</span>
              </div>
            )}
          </div>

          {/* Wallet & KYC Status */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">Wallet Balance</span>
              </div>
              <span className="font-bold text-green-600">
                ${(company.wallet_balance || 0).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">KYC Status</span>
              </div>
              <Badge className={kycStatus.color} variant="secondary">
                <KycIcon className="w-3 h-3 mr-1" />
                {company.kyc_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}