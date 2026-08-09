// components/HeaderHud.js
// CORREGIDO: Falta importar gameState (causaba error al renderizar)

import { gameState } from "../engine/gameState.js";

export function renderHeaderHud() {

    const p = gameState.player;

    if (!p) {
        return `<header style="padding:15px; color:#fff;">Error: no hay jugador</header>`;
    }

    const canal = p.canal || "Mi Canal";
    const nombre = p.nombre || "Desconocido";
    const niche = p.niche || "General";
    const año = p.año || 2026;
    const trimestre = p.trimestre || 1;
    const subs = Number(p.suscriptores) || 0;
    const fama = Number(p.fama) || 0;
    const dinero = Number(p.dinero) || 0;

    return `
        <header style="
            background: var(--bg-header-hud, #101010);
            border: var(--border-subtle);
            border-radius: 12px;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        ">
            <div>
                <h3 style="margin: 0; font-family: var(--font-heading); color: #fff; font-size: 1.2rem;">
                    ${canal}
                </h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">
                    ${nombre} | ${niche}
                </span>
            </div>

            <div style="
                background: rgba(255, 0, 0, 0.15);
                border: 1px solid var(--accent-red);
                padding: 6px 14px;
                border-radius: 20px;
                text-align: center;
            ">
                <span style="
                    font-size: 0.75rem;
                    color: var(--accent-red);
                    font-weight: bold;
                    display: block;
                    text-transform: uppercase;
                ">Temporada</span>
                <strong style="font-size: 0.95rem; color: #fff;">
                    Año ${año} — Trimestre ${trimestre}/4
                </strong>
            </div>

            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">
                        SUSCRIPTORES
                    </span>
                    <strong style="color: var(--accent-red); font-size: 1.1rem; font-family: var(--font-heading);">
                        ${subs.toLocaleString()}
                    </strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">
                        FAMA
                    </span>
                    <strong style="color: var(--accent-yellow); font-size: 1.1rem; font-family: var(--font-heading);">
                        ${fama} pts
                    </strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">
                        DINERO
                    </span>
                    <strong style="color: var(--accent-green); font-size: 1.1rem; font-family: var(--font-heading);">
                        US$ ${dinero.toLocaleString()}
                    </strong>
                </div>
            </div>
        </header>
    `;
}

export default renderHeaderHud;