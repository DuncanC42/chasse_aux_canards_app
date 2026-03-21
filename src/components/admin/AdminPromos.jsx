import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "./admin.css";

export default function AdminPromos() {
    const { credentials } = useAuth();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNom, setNewNom] = useState("");
    const [editId, setEditId] = useState(null);
    const [editNom, setEditNom] = useState("");

    const load = async () => {
        try {
            const data = await apiFetch("/promos", {}, credentials);
            setPromos(data);
        } catch (e) {
            setError("Impossible de charger les promos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newNom.trim()) return;
        try {
            await apiFetch("/promos", {
                method: "POST",
                body: JSON.stringify({ nom: newNom.trim() }),
            }, credentials);
            setNewNom("");
            load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la création");
        }
    };

    const handleUpdate = async (id) => {
        if (!editNom.trim()) return;
        try {
            await apiFetch(`/promos/${id}`, {
                method: "PUT",
                body: JSON.stringify({ nom: editNom.trim() }),
            }, credentials);
            setEditId(null);
            setEditNom("");
            load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la modification");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette promo ?")) return;
        try {
            await apiFetch(`/promos/${id}`, { method: "DELETE" }, credentials);
            load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la suppression");
        }
    };

    if (loading) return <p className="admin-state">Chargement…</p>;

    return (
        <section className="admin-section">
            <h2 className="admin-section__title">Promos</h2>

            {error && <p className="admin-error">{error}</p>}

            {/* Formulaire création */}
            <form className="admin-form" onSubmit={handleCreate}>
                <div className="admin-field">
                    <label>Nouvelle promo</label>
                    <div className="admin-form__row">
                        <input
                            type="text"
                            value={newNom}
                            onChange={e => setNewNom(e.target.value)}
                            placeholder="ex: 3e Année"
                        />
                        <button type="submit" className="admin-btn admin-btn--primary">
                            Ajouter
                        </button>
                    </div>
                </div>
            </form>

            {/* Liste */}
            <ul className="admin-list">
                {promos.map(p => (
                    <li key={p.promoId} className="admin-list__item">
                        {editId === p.promoId ? (
                            <div className="admin-form__row">
                                <input
                                    type="text"
                                    value={editNom}
                                    onChange={e => setEditNom(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    className="admin-btn admin-btn--primary"
                                    onClick={() => handleUpdate(p.promoId)}
                                >
                                    Sauver
                                </button>
                                <button
                                    className="admin-btn admin-btn--ghost"
                                    onClick={() => setEditId(null)}
                                >
                                    Annuler
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="admin-list__label">{p.nom}</span>
                                <div className="admin-list__actions">
                                    <button
                                        className="admin-btn admin-btn--ghost"
                                        onClick={() => { setEditId(p.promoId); setEditNom(p.nom); }}
                                    >
                                        Renommer
                                    </button>
                                    <button
                                        className="admin-btn admin-btn--danger"
                                        onClick={() => handleDelete(p.promoId)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
