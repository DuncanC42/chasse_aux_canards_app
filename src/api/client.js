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

    if (res.status === 204) return [];  // ← No Content → tableau vide

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw { status: res.status, ...err };
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}
