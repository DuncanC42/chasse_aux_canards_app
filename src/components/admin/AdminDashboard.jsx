import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import AdminPromos from "./AdminPromos.jsx";
import AdminCanards from "./AdminCanards.jsx";
import "./admin.css";
import Classement from "../PromoList/Classement.jsx";

const TABS = [
    { key: "promos",      label: "🎓 Promos" },
    { key: "canards",     label: "🦆 Canards" },
    { key: "classement",  label: "🏆 Classement" },
];

export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("promos");

    const handleLogout = () => {
        logout();
        navigate("/admin");
    };

    return (
        <div className="admin-dash">
            <header className="admin-dash__header">
                <div className="admin-dash__brand">
                    <span>🦆</span>
                    <span className="admin-dash__title">Admin</span>
                </div>
                <button
                    className="admin-btn admin-btn--ghost"
                    onClick={handleLogout}
                >
                    Déconnexion
                </button>
            </header>

            <nav className="admin-dash__tabs">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={`admin-tab ${tab === t.key ? "admin-tab--active" : ""}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <main className="admin-dash__content">
                {tab === "promos"     && <AdminPromos />}
                {tab === "canards"    && <AdminCanards />}
                {tab === "classement" && <Classement />}
            </main>
        </div>
    );
}