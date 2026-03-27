import Classement from "../PromoList/Classement.jsx";
import "../scan/scan.css";

export default function ScanPublic({ tag, canard }) {
    return (
        <div className="scan-public">
            {canard && (
                <div className="scan-public__hero">
                    <div className="model-viewer-container">
                        <model-viewer
                            src="/Duck.glb"
                            interaction-prompt="none"
                            disable-zoom
                            disable-pan
                            disable-tap
                            environment-image="neutral"
                            exposure="1"
                            camera-orbit="0deg 75deg 5m"
                            field-of-view="30deg"
                            auto-rotate
                            auto-rotate-delay="0"
                            rotation-per-second="30deg"
                            // style={{
                            //     width: "100%",
                            //     height: "100%",
                            //     pointerEvents: "none",
                            //     background: "transparent",
                            // }}
                        />
                    </div>

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