import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "./admin.css";

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const encoded = btoa(`${username}:${password}`);

        try {
            // On teste les credentials sur un endpoint protégé
            await apiFetch("/promos", { method: "GET" }, encoded);
            login(username, password);
            navigate("/admin/dashboard");
        } catch (err) {
            if (err.status === 401) {
                setError("Identifiants incorrects");
            } else {
                setError("Erreur de connexion au serveur");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login__card">
                <span className="admin-login__duck">🦆</span>
                <h1 className="admin-login__title">Espace Admin</h1>
                <p className="admin-login__sub">Chasse aux Canards — ENIB</p>

                <form className="admin-login__form" onSubmit={handleSubmit}>
                    <div className="admin-field">
                        <label htmlFor="username">Identifiant</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="admin-login__error">{error}</p>}

                    <button
                        type="submit"
                        className="admin-btn admin-btn--primary"
                        disabled={loading}
                    >
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    );
}
