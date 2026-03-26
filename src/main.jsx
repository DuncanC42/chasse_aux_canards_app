import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {AuthProvider} from "./components/admin/AuthContext.jsx";
import Classement from "./components/PromoList/Classement.jsx";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import RequireAuth from "./components/admin/RequireAuth.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import ScanPage from "./components/scan/ScanPage.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Classement />} />
                    <Route path="/:cle" element={<ScanPage />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <RequireAuth>
                                <AdminDashboard />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
)
