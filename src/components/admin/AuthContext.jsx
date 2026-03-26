import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures
const STORAGE_KEY = "cac_admin_session";

function loadSession() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return session.credentials;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children }) {
    const [credentials, setCredentials] = useState(() => loadSession());

    const login = (username, password) => {
        const encoded = btoa(`${username}:${password}`);
        const session = {
            credentials: encoded,
            expiresAt: Date.now() + SESSION_DURATION_MS,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setCredentials(encoded);
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setCredentials(null);
    };

    return (
        <AuthContext.Provider value={{ credentials, login, logout, isLoggedIn: !!credentials }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}