import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [credentials, setCredentials] = useState(
        () => sessionStorage.getItem("admin_creds") || null
    );

    const login = (username, password) => {
        const encoded = btoa(`${username}:${password}`);
        setCredentials(encoded);
        sessionStorage.setItem("admin_creds", encoded);
    };

    const logout = () => {
        setCredentials(null);
        sessionStorage.removeItem("admin_creds");
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
