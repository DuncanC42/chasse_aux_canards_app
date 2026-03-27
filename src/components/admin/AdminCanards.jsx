import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "./admin.css";

const TRIS = [
    { key: "batiment", label: "Bâtiment" },
    { key: "piece",    label: "Pièce" },
    { key: "nbPoint",  label: "Points" },
];

export default function AdminCanards() {
    const { credentials } = useAuth();
    const [canards, setCanards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tri, setTri] = useState("batiment");
    const [ordre, setOrdre] = useState("asc");

    const load = async () => {
        try {
            const data = await apiFetch("/canards", {}, credentials);
            setCanards(Array.isArray(data) ? data : []);
        } catch (e) {
            setError("Impossible de charger les canards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce canard ? Les captures associées seront aussi supprimées.")) return;
        try {
            await apiFetch(`/canards/${id}`, { method: "DELETE" }, credentials);
            await load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la suppression");
        }
    };

    const toggleOrdre = (key) => {
        if (tri === key) {
            setOrdre(o => o === "asc" ? "desc" : "asc");
        } else {
            setTri(key);
            setOrdre("asc");
        }
    };

    const canardsTries = [...canards].sort((a, b) => {
        let va, vb;
        if (tri === "batiment") {
            va = a.localisation?.batiment ?? "";
            vb = b.localisation?.batiment ?? "";
        } else if (tri === "piece") {
            va = a.localisation?.piece ?? "";
            vb = b.localisation?.piece ?? "";
        } else {
            va = a.nbPoint ?? 0;
            vb = b.nbPoint ?? 0;
        }
        if (va < vb) return ordre === "asc" ? -1 : 1;
        if (va > vb) return ordre === "asc" ? 1 : -1;
        return 0;
    });

    if (loading) return <p className="admin-state">Chargement…</p>;

    return (
        <section className="admin-section">
            <h2 className="admin-section__title">Canards posés</h2>

            {error && <p className="admin-error">{error}</p>}

            {/* Tri */}
            <div className="admin-tri">
                <span className="admin-tri__label">Trier par</span>
                {TRIS.map(t => (
                    <button
                        key={t.key}
                        className={`admin-tri__btn ${tri === t.key ? "admin-tri__btn--active" : ""}`}
                        onClick={() => toggleOrdre(t.key)}
                    >
                        {t.label}
                        {tri === t.key && (
                            <span className="admin-tri__arrow">
                                {ordre === "asc" ? " ↑" : " ↓"}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {canardsTries.length === 0 ? (
                <p className="admin-state">
                    Aucun canard posé pour l'instant.<br />
                    Scannez un tag NFC pour en poser un.
                </p>
            ) : (
                <ul className="admin-list">
                    {canardsTries.map(c => (
                        <li key={c.canardId ?? c.id} className="admin-list__item">
                            <div className="admin-list__info">
                                <span className="admin-list__label">
                                    {c.localisation
                                        ? `${c.localisation.batiment} — ${c.localisation.piece}`
                                        : "Sans localisation"}
                                </span>
                                <span className="admin-list__meta">
                                    {c.nbPoint} pt{c.nbPoint > 1 ? "s" : ""}
                                    {c.localisation?.etage !== undefined
                                        ? ` · étage ${c.localisation.etage}`
                                        : ""}
                                    {c.localisation?.description
                                        ? ` · ${c.localisation.description}`
                                        : ""}
                                </span>
                            </div>
                            <div className="admin-list__actions">
                                <button
                                    className="admin-btn admin-btn--danger"
                                    onClick={() => handleDelete(c.canardId ?? c.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}