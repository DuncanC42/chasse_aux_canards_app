import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "./admin.css";

export default function AdminCanards() {
    const { credentials } = useAuth();
    const [canards, setCanards] = useState([]);
    const [localisations, setLocalisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Formulaire création
    const [form, setForm] = useState({ cle: "", nbPoint: 1, localisationId: "" });

    const load = async () => {
        try {
            const [c, l] = await Promise.all([
                apiFetch("/canards", {}, credentials),
                apiFetch("/localisations", {}, credentials),
            ]);
            setCanards(c ?? []);
            setLocalisations(l ?? []);
        } catch (e) {
            setError("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.cle.trim() || !form.localisationId) return;
        try {
            await apiFetch("/canards", {
                method: "POST",
                body: JSON.stringify({
                    cle: form.cle.trim(),
                    nbPoint: Number(form.nbPoint),
                    localisationId: Number(form.localisationId),
                }),
            }, credentials);
            setForm({ cle: "", nbPoint: 1, localisationId: "" });
            load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la création");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce canard ?")) return;
        try {
            await apiFetch(`/canards/${id}`, { method: "DELETE" }, credentials);
            load();
        } catch (e) {
            setError(e.message ?? "Erreur lors de la suppression");
        }
    };

    if (loading) return <p className="admin-state">Chargement…</p>;

    return (
        <section className="admin-section">
            <h2 className="admin-section__title">Canards</h2>

            {error && <p className="admin-error">{error}</p>}

            {/* Formulaire création */}
            <form className="admin-form" onSubmit={handleCreate}>
                <h3 className="admin-form__subtitle">Poser un nouveau canard</h3>

                <div className="admin-form__grid">
                    <div className="admin-field">
                        <label>Clé NFC</label>
                        <input
                            type="text"
                            value={form.cle}
                            onChange={e => setForm(f => ({ ...f, cle: e.target.value }))}
                            placeholder="ex: HJ655SK"
                        />
                    </div>

                    <div className="admin-field">
                        <label>Points</label>
                        <input
                            type="number"
                            min="1"
                            value={form.nbPoint}
                            onChange={e => setForm(f => ({ ...f, nbPoint: e.target.value }))}
                        />
                    </div>

                    <div className="admin-field admin-field--wide">
                        <label>Localisation</label>
                        <select
                            value={form.localisationId}
                            onChange={e => setForm(f => ({ ...f, localisationId: e.target.value }))}
                            required
                        >
                            <option value="">— Choisir —</option>
                            {localisations.map(l => (
                                <option key={l.id} value={l.id}>
                                    {l.batiment} — {l.piece} (étage {l.etage})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="admin-btn admin-btn--primary">
                    🦆 Poser le canard
                </button>
            </form>

            {/* Liste */}
            <ul className="admin-list">
                {canards.map(c => (
                    <li key={c.id} className="admin-list__item">
                        <div className="admin-list__info">
                            <span className="admin-list__label">{c.cle}</span>
                            <span className="admin-list__meta">
                                {c.nbPoint} pt{c.nbPoint > 1 ? "s" : ""} ·{" "}
                                {c.localisation
                                    ? `${c.localisation.batiment} — ${c.localisation.piece}`
                                    : "sans localisation"}
                            </span>
                        </div>
                        <div className="admin-list__actions">
                            <button
                                className="admin-btn admin-btn--danger"
                                onClick={() => handleDelete(c.id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
