import Classement from "../PromoList/Classement.jsx";
import "../scan/scan.css";

export default function ScanPublic({ tag, canard }) {
    return (
        <div className="scan-public">
            {canard && (
                <div className="scan-public__hero">
                    <span className="scan-public__duck">🦆</span>
                    <div className="scan-public__points-wrap">
                        <span className="scan-public__points">{canard.nbPoint}</span>
                        <span className="scan-public__pts-label">
                            point{canard.nbPoint > 1 ? "s" : ""}
                        </span>
                    </div>
                    <p className="scan-public__loc">
                        {canard.localisation
                            ? `${canard.localisation.batiment} — ${canard.localisation.piece}`
                            : "Localisation inconnue"}
                    </p>
                    <div className="scan-public__divider" />
                    <div className="scan-public__bde-notice">
                        <span className="scan-public__bde-icon">🎓</span>
                        <p>Trouve un membre du BDE pour enregistrer tes points !</p>
                    </div>
                </div>
            )}
            <Classement />
        </div>
    );
}