
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthToken } from "@/hooks/useAuthToken";
import {
  LayoutDashboard,
  Building2,
  Send,
  History,
  Wallet,
  TrendingUp,
  Shield,
  LogOut,
  User,
  UserPlus,
  Lightbulb
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Insights",
    url: createPageUrl("Insights"),
    icon: Lightbulb,
    description: "Smart Recommendations"
  },
  {
    title: "Wallet",
    url: createPageUrl("Wallet"),
    icon: Wallet,
    description: "Asset Management"
  },
  {
    title: "Transaction History",
    url: createPageUrl("History"),
    icon: History,
    description: "Payment Records"
  },
  {
    title: "Send Payment",
    url: createPageUrl("Payments"),
    icon: Send,
    description: "Transfer USDC"
  },
  {
    title: "Companies",
    url: createPageUrl("Companies"),
    icon: Building2,
    description: "Business Directory"
  },
  {
    title: "Register Company",
    url: createPageUrl("Register"),
    icon: UserPlus,
    description: "Add New Company"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();

  // Automatically set auth token for API requests
  useAuthToken();

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    // Hide Send Payment from back-office users
    if (item.title === "Send Payment") {
      return userProfile?.user_role !== 'back_office_admin';
    }
    // Show Register Company only to back-office users
    if (item.title === "Register Company") {
      return userProfile?.user_role === 'back_office_admin';
    }
    // Show Companies only to back-office users
    if (item.title === "Companies") {
      return userProfile?.user_role === 'back_office_admin';
    }
    // Hide Wallet from back-office users
    if (item.title === "Wallet") {
      return userProfile?.user_role !== 'back_office_admin';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <style>{`
        :root {
          --primary-navy: #1e293b;
          --primary-blue: #3b82f6;
          --accent-blue: #60a5fa;
          --success-green: #10b981;
          --warning-amber: #f59e0b;
        }
      `}</style>

      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r border-slate-200/50 bg-white/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-slate-200/50 p-6">
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-lg p-1.5 shadow-sm inline-block self-start">
                  <img src="/flowmint-logo.png" alt="Flowmint" className="h-8 w-auto object-contain" />
                </div>
                <p className="text-xs text-slate-500 font-medium px-1">Enterprise USDC Platform</p>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Platform
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredNavigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`group relative overflow-hidden transition-all duration-200 rounded-xl mb-1 ${location.pathname === item.url
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm">{item.title}</span>
                              <p className="text-xs text-slate-400 truncate">{item.description}</p>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Security
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Circle Protected</p>
                        <p className="text-xs text-slate-400">Bank-grade security</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">USDC Native</p>
                        <p className="text-xs text-slate-400">Stablecoin powered</p>
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/50 p-4">
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 md:hidden sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <img src="/flowmint-logo.png" alt="Flowmint" className="h-6 w-auto object-contain" />
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
