import { useEffect, useState } from "react";
import "./admin.css";
import {useAuth} from "./AuthContext.jsx";
import {apiFetch} from "../../api/client.js";

function PromoModal({ promo, onClose, onSave, onDelete }) {
    const [nom, setNom] = useState(promo.nom);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [confirmeDelete, setConfirmeDelete] = useState(false);

    const handleSave = async () => {
        if (!nom.trim() || nom.trim() === promo.nom) { onClose(); return; }
        setSaving(true);
        setError(null);
        try {
            await onSave(promo.promoId, nom.trim());
            onClose();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la modification");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await onDelete(promo.promoId);
            onClose();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la suppression");
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal__title">Modifier la promo</h3>

                <div className="admin-field">
                    <label>Nom</label>
                    <input
                        type="text"
                        value={nom}
                        onChange={e => setNom(e.target.value)}
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleSave()}
                    />
                </div>

                {error && <p className="admin-error">{error}</p>}

                <div className="modal__actions">
                    <button
                        className="admin-btn admin-btn--primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Sauvegarde…" : "Sauver"}
                    </button>
                    <button
                        className="admin-btn admin-btn--ghost"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Annuler
                    </button>
                </div>

                <div className="modal__divider" />

                {!confirmeDelete ? (
                    <button
                        className="admin-btn admin-btn--danger"
                        onClick={() => setConfirmeDelete(true)}
                        disabled={saving}
                    >
                        Supprimer cette promo
                    </button>
                ) : (
                    <div className="modal__confirm-delete">
                        <p>Confirmer la suppression de <strong>{promo.nom}</strong> ?</p>
                        <div className="modal__actions">
                            <button
                                className="admin-btn admin-btn--danger"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                {saving ? "Suppression…" : "Oui, supprimer"}
                            </button>
                            <button
                                className="admin-btn admin-btn--ghost"
                                onClick={() => setConfirmeDelete(false)}
                                disabled={saving}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminPromos() {
    const { credentials } = useAuth();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNom, setNewNom] = useState("");
    const [selectedPromo, setSelectedPromo] = useState(null);

    const load = async () => {
        try {
            const data = await apiFetch("/promos", {}, credentials);
            setPromos(Array.isArray(data) ? data : []);
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
            await load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la création");
        }
    };

    const handleSave = async (id, nom) => {
        await apiFetch(`/promos/${id}`, {
            method: "PUT",
            body: JSON.stringify({ nom }),
        }, credentials);
        await load();
    };

    const handleDelete = async (id) => {
        await apiFetch(`/promos/${id}`, { method: "DELETE" }, credentials);
        await load();
    };

    if (loading) return <p className="admin-state">Chargement…</p>;

    return (
        <section className="admin-section">
            <h2 className="admin-section__title">Promos</h2>

            {error && <p className="admin-error">{error}</p>}

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

            <ul className="admin-list">
                {promos.map(p => (
                    <li
                        key={p.promoId}
                        className="admin-list__item admin-list__item--clickable"
                        onClick={() => setSelectedPromo(p)}
                    >
                        <span className="admin-list__label">{p.nom}</span>
                        <span className="admin-list__chevron">›</span>
                    </li>
                ))}
            </ul>

            {selectedPromo && (
                <PromoModal
                    promo={selectedPromo}
                    onClose={() => setSelectedPromo(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </section>
    );
}