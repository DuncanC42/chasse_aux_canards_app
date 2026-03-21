const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export async function apiFetch(path, options = {}, credentials = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (credentials) {
        headers['Authorization'] = `Basic ${credentials}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        // 401 → on laisse remonter pour que le composant gère la déconnexion
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw { status: res.status, ...err };
    }

    // Certains endpoints retournent du texte (isApiAlive), d'autres du JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}
