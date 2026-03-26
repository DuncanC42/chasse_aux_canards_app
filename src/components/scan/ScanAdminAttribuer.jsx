import { useEffect, useState } from "react";
import { useAuth } from "../admin/AuthContext.jsx";
import { apiFetch } from "../../api/client.js";
import "../scan/scan.css";

export default function ScanAdminAttribuer({ tag, canard, onBack, onDone }) {
    const { credentials } = useAuth();

    const [promos, setPromos] = useState([]);
    const [captures, setCaptures] = useState([]);
    const [promoId, setPromoId] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const loadCaptures = async () => {
        if (!tag?.canardId) return;
        try {
            const data = await apiFetch(
                `/captures/canard/${tag.canardId}`, {}, credentials
            );
            setCaptures(Array.isArray(data) ? data : []);
        } catch {
            setCaptures([]);
        }
    };

    useEffect(() => {
        Promise.all([
            apiFetch("/promos", {}, credentials).then(setPromos),
            loadCaptures(),
        ]).catch(() => setError("Impossible de charger les données"));
    }, []);

    const handleAjouter = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await apiFetch("/captures", {
                method: "POST",
                body: JSON.stringify({
                    promoId: Number(promoId),
                    canardId: tag.canardId,
                }),
            }, credentials);
            setPromoId("");
            setSuccess(true);
            await loadCaptures();
        } catch (err) {
            if (err.status === 409) {
                setError("Cette promo a déjà capturé ce canard !");
            } else {
                setError(err.message ?? "Erreur lors de l'attribution");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSupprimer = async (captureId) => {
        if (!confirm("Annuler cette capture ?")) return;
        try {
            await apiFetch(`/captures/${captureId}`, {
                method: "DELETE",
            }, credentials);
            setSuccess(false);
            await loadCaptures();
        } catch {
            setError("Erreur lors de la suppression");
        }
    };

    // Promos qui n'ont pas encore capturé ce canard
    const capturedPromoIds = captures.map(c => c.promoId);
    const promosDisponibles = promos.filter(
        p => !capturedPromoIds.includes(p.promoId)
    );

    return (
        <div className="scan-form">
            <button className="scan-back" onClick={onBack}>← Retour</button>
            <h2 className="scan-form__title">Attribuer les points</h2>

            <div className="scan-canard-recap">
                <span className="scan-canard-recap__pts">{canard?.nbPoint ?? "?"}</span>
                <span className="scan-canard-recap__label">
                    point{canard?.nbPoint > 1 ? "s" : ""}
                </span>
            </div>

            {/* Captures existantes */}
            {captures.length > 0 && (
                <div className="scan-captures">
                    <p className="scan-captures__title">Captures enregistrées</p>
                    <ul className="scan-captures__list">
                        {captures.map(c => (
                            <li key={c.captureId} className="scan-captures__item">
                                <span className="scan-captures__promo">
                                    🎓 {c.promoNom}
                                </span>
                                <button
                                    className="scan-btn-danger"
                                    onClick={() => handleSupprimer(c.captureId)}
                                >
                                    Annuler
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p className="scan-error">{error}</p>}
            {success && <p className="scan-success-inline">✅ Points attribués !</p>}

            {/* Formulaire ajout — masqué si toutes les promos ont déjà capturé */}
            {promosDisponibles.length > 0 ? (
                <form onSubmit={handleAjouter}>
                    <div className="scan-field">
                        <label>Ajouter une promo</label>
                        <select
                            value={promoId}
                            onChange={e => setPromoId(e.target.value)}
                            required
                        >
                            <option value="">— Choisir la promo —</option>
                            {promosDisponibles.map(p => (
                                <option key={p.promoId} value={p.promoId}>
                                    {p.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="scan-btn scan-btn--primary"
                        disabled={saving || !promoId}
                    >
                        {saving ? "Enregistrement…" : "🎓 Valider la capture"}
                    </button>
                </form>
            ) : (
                <p className="scan-admin__notice">
                    Toutes les promos ont déjà capturé ce canard.
                </p>
            )}
        </div>
    );
}