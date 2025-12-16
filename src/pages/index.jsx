import Layout from "./Layout.jsx";
import Login from "./Login.jsx";
import Wallet from "./Wallet";
import Insights from "./Insights";
import Companies from "./Companies";
import Payments from "./Payments";
import History from "./History";
import Register from "./Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Login: Login,
    Wallet: Wallet,
    Insights: Insights,
    Companies: Companies,
    Payments: Payments,
    History: History,
    Register: Register,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Insights />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/wallet" element={
                <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['company_admin', 'company_user']} redirectTo="Companies">
                        <Layout currentPageName={currentPage}>
                            <Wallet />
                        </Layout>
                    </RoleBasedRoute>
                </ProtectedRoute>
            } />

            <Route path="/insights" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Insights />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/companies" element={
                <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['back_office_admin']} redirectTo="Wallet">
                        <Layout currentPageName={currentPage}>
                            <Companies />
                        </Layout>
                    </RoleBasedRoute>
                </ProtectedRoute>
            } />

            <Route path="/payments" element={
                <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['company_admin', 'company_user']} redirectTo="Wallet">
                        <Layout currentPageName={currentPage}>
                            <Payments />
                        </Layout>
                    </RoleBasedRoute>
                </ProtectedRoute>
            } />

            <Route path="/history" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <History />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/register" element={
                <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={['back_office_admin']} redirectTo="Wallet">
                        <Layout currentPageName={currentPage}>
                            <Register />
                        </Layout>
                    </RoleBasedRoute>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}