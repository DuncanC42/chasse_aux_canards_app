import { apiFetch } from "../../api/client.js";
import PromoCard from "../Promo/PromoCard.jsx";
import './classement.css';
import { useEffect, useState } from "react";

export default function Classement() {
    const [promos, setPromos] = useState([]);
    const [totalMax, setTotalMax] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [classement, max] = await Promise.all([
                    apiFetch('/promos/points'),
                    apiFetch('/canards/points/total'),
                ]);
                const sorted = [...classement].sort((a, b) => b.points - a.points);
                setPromos(sorted);
                setTotalMax(max);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const totalCollected = promos.reduce((sum, p) => sum + p.points, 0);
    const globalPct = totalMax > 0 ? Math.round((totalCollected / totalMax) * 100) : 0;

    if (loading) return (
        <div className="classement__loading">
            <span className="loading-duck">🐥</span>
            <p>Chargement du classement…</p>
        </div>
    );

    if (error) return (
        <div className="classement__error">
            <p>Impossible de charger le classement.</p>
            <small>{error}</small>
        </div>
    );

    return (
        <div className="classement">

            <header className="classement__header">
                {/* Remplace le span ci-dessous par une <img> quand tu as ton asset */}
                <span className="classement__duck">🐥</span>
                <h1 className="classement__title">Chasse aux Canards</h1>
                <p className="classement__subtitle">Classement général</p>
                <div className="classement__divider" />
            </header>

            <section className="classement__global">
                <div className="classement__global-labels">
                    <span>Points collectés</span>
                    <span className="classement__global-count">{totalCollected} / {totalMax}</span>
                </div>
                <div className="classement__global-bar-wrap">
                    <div
                        className="classement__global-bar"
                        style={{ width: `${globalPct}%` }}
                        role="progressbar"
                        aria-valuenow={totalCollected}
                        aria-valuemax={totalMax}
                    />
                </div>
            </section>

            <ul className="classement__list">
                {promos.map((promo, i) => (
                    <li key={promo.promo_id}>
                        <PromoCard
                            promo={promo}
                            rank={i + 1}
                            totalMax={totalMax}
                            // image="/assets/duck-gold.png"  ← décommente quand tu as tes assets
                        />
                    </li>
                ))}
            </ul>

        </div>
    );
}