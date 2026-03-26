import "./scan.css"
import {useParams} from "react-router-dom";
import {useAuth} from "../admin/AuthContext.jsx";
import {useEffect, useState} from "react";
import {apiFetch} from "../../api/client.js";
import ScanPublic from "./ScanPublic.jsx";
import ScanAdmin from "./ScanAdmin.jsx";

export default function ScanPage() {
    const { cle } = useParams();
    const { isLoggedIn, credentials } = useAuth();

    const [tag, setTag] = useState(null);
    const [canard, setCanard] = useState(null);
    const [tagInconnu, setTagInconnu] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const t = await apiFetch(`/tags/${cle}`);
                setTag(t);

                if (t.canardId) {
                    const c = await apiFetch(`/canards/${t.canardId}`, {}, credentials);
                    setCanard(c);
                }
            } catch (e) {
                // Tag introuvable — on continue quand même vers les vues
                setTagInconnu(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [cle]);

    if (loading) return (
        <div className="scan-state">
            <span className="scan-state__duck">🐥</span>
            <p>Chargement…</p>
        </div>
    );

    if (isLoggedIn) {
        return (
            <ScanAdmin
                cle={cle}
                tag={tag}
                canard={canard}
                tagInconnu={tagInconnu}
                onRefresh={() => window.location.reload()}
            />
        );
    }

    // Public : tag inconnu ou pas → classement normal dans les deux cas
    return <ScanPublic cle={cle} tag={tag} canard={canard} />;
}