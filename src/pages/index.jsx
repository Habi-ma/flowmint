import Layout from "./Layout.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard";
import Companies from "./Companies";
import Payments from "./Payments";
import History from "./History";
import Register from "./Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Login: Login,
    Dashboard: Dashboard,
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
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Companies" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Companies />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Payments" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Payments />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/History" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <History />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Register" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Register />
                    </Layout>
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