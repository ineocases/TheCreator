// screens/awards.js
// Ceremonia anual: muestra nominados, ganador/perdedor y consecuencias.
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

const nf = n => Number(n || 0).toLocaleString();

function construirCandidatos() {
    const p = gameState.player;
    const creador = {
        id: "player",
        nombre: p.canal,
        seguidores: Number(p.suscriptores),
        fama: Number(p.fama),
        crecimiento: Number(gameState.lastYearSummary?.crecimientoSubs || 0),
        isPlayer: true
    };
    const otros = (gameState.creators || [])
        .filter(c => c.activo !== false)
        .map(c => ({
            id: c.id,
            nombre: c.nombre,
            seguidores: Number(c.seguidores || 0),
            fama: Number(c.popularidad || 0),
            crecimiento: Math.floor(Number(c.seguidores || 0) * 0.08),
            isPlayer: false
        }));
    return [creador, ...otros];
}

function calcularCategoria(summary) {
    if (!summary) return { nombre: "Creador Revelación", min: 0 };
    if (summary.crecimientoSubs >= 500000) return { nombre: "Creador del Año", min: 500000 };
    if (summary.crecimientoSubs >= 50000) return { nombre: "Creador Revelación", min: 50000 };
    return { nombre: "Promesa del Año", min: 0 };
}

export function renderAwards(el) {
    const container = el || document.getElementById("awardsScreen");
    if (!container) return;
    const p = gameState.player;
    const summary = gameState.lastYearSummary;
    if (!summary) {
        container.innerHTML = `<div class="page-shell">${renderHeaderHud()}<div class="empty-opportunity"><div class="empty-icon">🏆</div><h2>Los Awards todavía no empezaron.</h2><p>Terminá los dos trimestres del año. Recién ahí se abre la ceremonia y se define si estás nominado.</p><a class="btn primary" href="#dashboard">Volver al canal</a></div></div>`;
        return container;
    }
    const año = gameState.time.año;
    const categoria = calcularCategoria(summary);

    let candidatos = construirCandidatos();
    // Competencia razonable: para categorías de descubrimiento, priorizamos crecimiento; no siempre gana el más grande.
    candidatos.sort((a,b) => (b.crecimiento * 0.7 + b.fama * 100) - (a.crecimiento * 0.7 + a.fama * 100));
    candidatos = candidatos.slice(0, 4);
    if (!candidatos.some(c => c.isPlayer) && Number(p.suscriptores) >= 1000) {
        candidatos[candidatos.length - 1] = candidatos[0];
        candidatos[candidatos.length - 2] = construirCandidatos()[0];
    }
    candidatos = [...new Map(candidatos.map(c => [c.id,c])).values()];

    const ganador = candidatos[0];
    const gano = ganador?.isPlayer === true;
    const awardKey = `awards_${año}_seen`;

    if (!p[awardKey]) {
        p[awardKey] = true;
        if (gano) {
            p.fama = Math.min(100, Number(p.fama) + 8);
            p.reputacion = Math.min(100, Number(p.reputacion) + 5);
            p.stats.eventosGanados = (Number(p.stats.eventosGanados) || 0) + 1;
        }
        gameState.guardar();
    }

    container.innerHTML = `
        <div class="page-shell awards-page">
            ${renderHeaderHud()}
            <div class="awards-stage">
                <div class="eyebrow">🏆 CEREMONIA ANUAL · ${año}</div>
                <h1>Coscu Army Awards</h1>
                <p>Después de todo lo que pasó este año, llegó el momento de saber si tu nombre apareció entre los mejores.</p>

                <div class="award-category">${categoria.nombre}</div>
                <div class="nominees">
                    ${candidatos.map((c,i) => `
                        <div class="nominee ${c.isPlayer ? "player-nominee" : ""}">
                            <span>#${i+1}</span><div><b>${c.nombre}</b><small>${nf(c.seguidores)} seguidores · ${nf(c.crecimiento)} crecimiento</small></div>
                        </div>
                    `).join("")}
                </div>

                <div class="winner-reveal ${gano ? "winner" : "lost"}">
                    <div class="winner-icon">${gano ? "🏆" : "🥁"}</div>
                    <div class="eyebrow">Y EL GANADOR ES...</div>
                    <h2>${ganador?.nombre || "Sin ganador"}</h2>
                    ${gano ? `<strong>GANASTE ${categoria.nombre.toUpperCase()}</strong><p>+8 fama · +5 reputación</p>` : `<strong>NO GANASTE ESTA VEZ</strong><p>${ganador?.nombre || "Otro creador"} se llevó el premio. Tu carrera recién empieza.</p>`}
                </div>

                <div class="continue-row">
                    <a class="btn ghost" href="#dashboard">Ver mi canal</a>
                    <button id="nextYear" class="btn primary">🚀 EMPEZAR ${año + 1}</button>
                </div>
            </div>
        </div>
    `;

    container.querySelector("#nextYear")?.addEventListener("click", () => {
        gameState.prepararSiguienteAño();
        window.location.hash = "#pretemporada";
    });
    return container;
}

export const awardsScreen = { render: renderAwards };
export default awardsScreen;
