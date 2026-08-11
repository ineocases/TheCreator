import { gameState } from "../engine/gameState.js";

const nf = n => Number(n || 0).toLocaleString();

export function renderHeaderHud() {
    const p = gameState.player;
    if (!p) return "";

    const año = Number(p.año) || 2026;
    const trimestre = Number(p.trimestre) || 1;
    const subs = Number(p.suscriptores) || 0;
    const fama = Number(p.fama) || 0;
    const dinero = Number(p.dinero) || 0;

    return `
        <header class="game-hud-compact">
            <div class="hud-channel">
                <strong>${p.canal || "Mi Canal"}</strong>
                <span>${p.niche || "Gaming"}</span>
            </div>

            <div class="hud-season">
                <small>TEMPORADA</small>
                <b>${año} · T${trimestre}/2</b>
            </div>

            <nav class="hud-menu" aria-label="Menú de carrera">
                <a href="#store" class="hud-menu-btn">🛒 <span>Tienda</span></a>
                <a href="#collabs" class="hud-menu-btn">🤝 <span>Colabs</span></a>
                <a href="#sponsors" class="hud-menu-btn">💼 <span>Sponsors</span></a>
                <a href="#awards" class="hud-menu-btn">🏆 <span>Awards</span></a>
            </nav>

            <div class="hud-numbers">
                <div><small>SUBS</small><b>${nf(subs)}</b></div>
                <div><small>FAMA</small><b>${nf(fama)}/100</b></div>
                <div><small>$</small><b>$${nf(dinero)}</b></div>
            </div>
        </header>
    `;
}

export default renderHeaderHud;
