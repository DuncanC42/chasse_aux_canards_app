import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanAdminPoser from "./ScanAdminPoser.jsx";
import ScanAdminAttribuer from "./ScanAdminAttribuer.jsx";
import "../scan/scan.css";

export default function ScanAdmin({ cle, tag, canard, tagInconnu, onRefresh }) {
    const [mode, setMode] = useState(null);
    const navigate = useNavigate();

    const peutAttribuer = !tagInconnu && !!tag?.canardId;

    return (
        <div className="scan-admin">
            <header className="scan-admin__header">
                <div className="scan-admin__header-top">
                    <span className="scan-admin__badge">🔑 Admin</span>
                    <button
                        className="scan-btn-link"
                        onClick={() => navigate("/admin/dashboard")}
                    >
                        Dashboard →
                    </button>
                </div>

                <code className="scan-admin__cle">{cle}</code>

                {tagInconnu && (
                    <p className="scan-admin__notice scan-admin__notice--warn">
                        ⚠️ Tag non enregistré dans le système
                    </p>
                )}

                {!tagInconnu && !tag?.canardId && (
                    <p className="scan-admin__notice">
                        Tag connu mais pas encore assigné à un canard
                    </p>
                )}

                {canard && (
                    <p className="scan-admin__info">
                        {canard.nbPoint} pt{canard.nbPoint > 1 ? "s" : ""} ·{" "}
                        {canard.localisation
                            ? `${canard.localisation.batiment} — ${canard.localisation.piece}`
                            : "sans localisation"}
                    </p>
                )}
            </header>

            {mode === null && (
                <div className="scan-admin__choices">
                    <button
                        className="scan-choice scan-choice--poser"
                        onClick={() => setMode("poser")}
                    >
                        <span className="scan-choice__icon">📍</span>
                        <span className="scan-choice__label">Poser le canard</span>
                        <span className="scan-choice__sub">
                            {tagInconnu
                                ? "Enregistrer ce tag et poser un canard"
                                : tag?.canardId
                                    ? "Modifier la position ou les points"
                                    : "Lier ce tag à un canard"}
                        </span>
                    </button>

                    <button
                        className={`scan-choice scan-choice--attribuer ${!peutAttribuer ? "scan-choice--disabled" : ""}`}
                        onClick={() => peutAttribuer && setMode("attribuer")}
                        disabled={!peutAttribuer}
                        title={!peutAttribuer ? "Pose d'abord le canard" : undefined}
                    >
                        <span className="scan-choice__icon">🎓</span>
                        <span className="scan-choice__label">Attribuer les points</span>
                        <span className="scan-choice__sub">
                            {peutAttribuer
                                ? "Enregistrer une capture pour une promo"
                                : "Tag pas encore assigné à un canard"}
                        </span>
                    </button>
                </div>
            )}

            {mode === "poser" && (
                <ScanAdminPoser
                    cle={cle}
                    tag={tag}
                    canard={canard}
                    tagInconnu={tagInconnu}
                    onBack={() => setMode(null)}
                    onDone={onRefresh}
                />
            )}

            {mode === "attribuer" && (
                <ScanAdminAttribuer
                    tag={tag}
                    canard={canard}
                    onBack={() => setMode(null)}
                    onDone={onRefresh}
                />
            )}
        </div>
    );
}