const TIERS = [
    {
        cardClass: 'card--1',
        nameClass: 'name--1',
        scoreClass: 'score--1',
        barClass: 'bar--1',
        rankClass: 'rank--1',
        defaultEmoji: '🐤',
    },
    {
        cardClass: 'card--2',
        nameClass: 'name--2',
        scoreClass: 'score--2',
        barClass: 'bar--2',
        rankClass: 'rank--2',
        defaultEmoji: '🐣',
    },
    {
        cardClass: 'card--3',
        nameClass: 'name--3',
        scoreClass: 'score--3',
        barClass: 'bar--3',
        rankClass: 'rank--3',
        defaultEmoji: '🦆',
    },
    {
        cardClass: 'card--4',
        nameClass: 'name--4',
        scoreClass: 'score--4',
        barClass: 'bar--4',
        rankClass: 'rank--4',
        defaultEmoji: null,
    },
];

/**
 * @param {object}      promo       - { nom, points }
 * @param {number}      rank        - position dans le classement (1-based)
 * @param {number}      totalMax    - total de points disponibles dans le jeu
 * @param {string|null} image       - URL optionnelle d'une image/icône de canard
 */
export default function PromoCard({ promo, rank, totalMax, image = null }) {
    const tier = TIERS[Math.min(rank - 1, 3)];
    const pct = totalMax > 0 ? Math.round((promo.points / totalMax) * 100) : 0;

    const rankBadge = image
        ? <img src={image} alt={`rang ${rank}`} className="promo-card__image" />
        : tier.defaultEmoji
            ? <span className="promo-card__emoji">{tier.defaultEmoji}</span>
            : <span className={`promo-card__rank-number ${tier.rankClass}`}>{rank}</span>;

    return (
        <div className={`promo-card ${tier.cardClass}`}>

            <div className="promo-card__badge">
                {rankBadge}
                <span className={`promo-card__pos ${tier.rankClass}`}>#{rank}</span>
            </div>

            <div className="promo-card__info">
                <p className={`promo-card__name ${tier.nameClass}`}>{promo.nom}</p>
                <div className="promo-card__bar-wrap">
                    <div
                        className={`promo-card__bar ${tier.barClass}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={promo.points}
                        aria-valuemax={totalMax}
                    />
                </div>
                <span className="promo-card__pct">{pct}% du total</span>
            </div>

            <div className="promo-card__score">
                <span className={`score-value ${tier.scoreClass}`}>{promo.points}</span>
                <span className="score-label">pts</span>
            </div>

        </div>
    );
}