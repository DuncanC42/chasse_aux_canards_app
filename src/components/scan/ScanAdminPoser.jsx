import { useEffect, useState } from "react";
import {useAuth} from "../admin/AuthContext.jsx";
import {apiFetch} from "../../api/client.js";


const LOC_STORAGE_KEY = "cac_last_localisation";

function loadLastLoc() {
    try {
        const raw = localStorage.getItem(LOC_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveLoc(loc) {
    localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(loc));
}

export default function ScanAdminPoser({ cle, tag, canard, onBack, onDone }) {
    const { credentials } = useAuth();

    const [form, setForm] = useState(() => {
        // Priorité : canard existant > localStorage > vide
        if (canard?.localisation) {
            return {
                nbPoint: canard.nbPoint,
                batiment: canard.localisation.batiment ?? "",
                etage: canard.localisation.etage ?? "",
                piece: canard.localisation.piece ?? "",
                description: canard.localisation.description ?? "",
            };
        }
        const last = loadLastLoc();
        return {
            nbPoint: 1,
            batiment: last?.batiment ?? "",
            etage: last?.etage ?? "",
            piece: last?.piece ?? "",
            description: last?.description ?? "",
        };
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // 1 — crée ou réutilise la localisation
            const locPayload = {
                batiment: form.batiment.trim(),
                etage: Number(form.etage),
                piece: form.piece.trim(),
                description: form.description.trim(),
            };

            // Sauvegarde dans localStorage pour la prochaine fois
            saveLoc(locPayload);

            let localisationId;
            if (canard?.localisation?.id) {
                // Met à jour la localisation existante
                await apiFetch(`/localisations/${canard.localisation.id}`, {
                    method: "PUT",
                    body: JSON.stringify(locPayload),
                }, credentials);
                localisationId = canard.localisation.id;
            } else {
                // Crée une nouvelle localisation
                const newLoc = await apiFetch("/localisations", {
                    method: "POST",
                    body: JSON.stringify(locPayload),
                }, credentials);
                localisationId = newLoc.id ?? newLoc.localisationId;
            }

            // 2 — crée ou met à jour le canard
            let canardId = tag.canardId;
            if (!canardId) {
                const newCanard = await apiFetch("/canards", {
                    method: "POST",
                    body: JSON.stringify({
                        nbPoint: Number(form.nbPoint),
                        localisationId,
                    }),
                }, credentials);
                canardId = newCanard.id ?? newCanard.canardId;

                // 3 — assigne le tag au nouveau canard
                await apiFetch(`/tags/${cle}/assigner/${canardId}`, {
                    method: "PUT",
                }, credentials);
            } else {
                await apiFetch(`/canards/${canardId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        nbPoint: Number(form.nbPoint),
                        localisationId,
                    }),
                }, credentials);
            }

            onDone();
        } catch (e) {
            setError(e.message ?? "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="scan-form">
            <button className="scan-back" onClick={onBack}>← Retour</button>
            <h2 className="scan-form__title">
                {tag.canardId ? "Modifier le canard" : "Poser le canard"}
            </h2>

            {error && <p className="scan-error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="scan-field">
                    <label>Points</label>
                    <input
                        type="number"
                        min="1"
                        value={form.nbPoint}
                        onChange={set("nbPoint")}
                        required
                    />
                </div>

                <div className="scan-form__subtitle">Localisation</div>

                <div className="scan-form__grid">
                    <div className="scan-field">
                        <label>Bâtiment</label>
                        <input
                            type="text"
                            value={form.batiment}
                            onChange={set("batiment")}
                            placeholder="ex: ENIB1"
                            required
                        />
                    </div>

                    <div className="scan-field">
                        <label>Étage</label>
                        <input
                            type="number"
                            value={form.etage}
                            onChange={set("etage")}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className="scan-field">
                        <label>Pièce</label>
                        <input
                            type="text"
                            value={form.piece}
                            onChange={set("piece")}
                            placeholder="ex: C207"
                            required
                        />
                    </div>

                    <div className="scan-field scan-field--wide">
                        <label>Description <span className="scan-field__opt">(optionnel)</span></label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={set("description")}
                            placeholder="ex: sous le bureau près de la fenêtre"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="scan-btn scan-btn--primary"
                    disabled={saving || !form.batiment || !form.piece}
                >
                    {saving ? "Enregistrement…" : "📍 Confirmer la position"}
                </button>
            </form>
        </div>
    );
}