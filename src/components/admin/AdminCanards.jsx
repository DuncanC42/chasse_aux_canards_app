import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "./admin.css";

export default function AdminCanards() {
    const { credentials } = useAuth();
    const [canards, setCanards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtres — valeur "" = "tous"
    const [filtreBatiment, setFiltreBatiment] = useState("");
    const [filtreStatut, setFiltreStatut] = useState(""); // "" | "trouve" | "non_trouve"

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

    // Liste des bâtiments uniques pour le filtre
    const batiments = [...new Set(
        canards
            .map(c => c.localisation?.batiment)
            .filter(Boolean)
    )].sort();

    // Application des filtres
    const canardsAffiches = canards.filter(c => {
        if (filtreBatiment && (c.localisation?.batiment ?? "") !== filtreBatiment) return false;
        if (filtreStatut === "trouve"     && !c.trouve)  return false;
        if (filtreStatut === "non_trouve" &&  c.trouve)  return false;
        return true;
    });

    const resetFiltres = () => {
        setFiltreBatiment("");
        setFiltreStatut("");
    };

    const filtresActifs = filtreBatiment !== "" || filtreStatut !== "";

    if (loading) return <p className="admin-state">Chargement…</p>;

    return (
        <section className="admin-section">
            <h2 className="admin-section__title">Canards posés</h2>

            {error && <p className="admin-error">{error}</p>}

            {/* ── Filtres ── */}
            <div className="admin-filtres">
                <div className="admin-filtres__row">
                    <div className="admin-field admin-filtres__field">
                        <label>Bâtiment</label>
                        <select
                            value={filtreBatiment}
                            onChange={e => setFiltreBatiment(e.target.value)}
                        >
                            <option value="">Tous</option>
                            {batiments.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-field admin-filtres__field">
                        <label>Statut</label>
                        <select
                            value={filtreStatut}
                            onChange={e => setFiltreStatut(e.target.value)}
                        >
                            <option value="">Tous</option>
                            <option value="trouve">Trouvé</option>
                            <option value="non_trouve">Pas encore trouvé</option>
                        </select>
                    </div>

                    {filtresActifs && (
                        <button
                            className="admin-btn admin-btn--ghost admin-filtres__reset"
                            onClick={resetFiltres}
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>

                <p className="admin-filtres__count">
                    {canardsAffiches.length} canard{canardsAffiches.length !== 1 ? "s" : ""}
                    {filtresActifs ? " filtrés" : " au total"}
                </p>
            </div>

            {canardsAffiches.length === 0 ? (
                <p className="admin-state">
                    {filtresActifs
                        ? "Aucun canard ne correspond à ces filtres."
                        : <>Aucun canard posé pour l'instant.<br />Scannez un tag NFC pour en poser un.</>
                    }
                </p>
            ) : (
                <ul className="admin-list">
                    {canardsAffiches.map(c => (
                        <li key={c.canardId ?? c.id} className="admin-list__item">
                            <div className="admin-list__info">
                                <span className="admin-list__label">
                                    {c.localisation
                                        ? [c.localisation.batiment, c.localisation.piece].filter(Boolean).join(" — ") || "Localisation partielle"
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
                                    {" · "}
                                    {c.trouve
                                        ? <span className="admin-list__badge admin-list__badge--found">Trouvé ✓</span>
                                        : <span className="admin-list__badge admin-list__badge--pending">En attente</span>
                                    }
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