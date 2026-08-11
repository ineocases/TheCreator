// screens/videoResult.js
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

const nf = n => Number(n || 0).toLocaleString();

export function renderVideoResult(el) {
    const container = el || document.getElementById("resultScreen");
    if (!container) return;

    const res = gameState.lastQuarterResult;
    if (!res) {
        container.innerHTML = `<div class="page-shell">${renderHeaderHud()}<div class="panel center"><h2>No hay resultado disponible.</h2><a class="btn primary" href="#dashboard">Volver</a></div></div>`;
        return container;
    }

    const finDeAño = gameState.time.trimestre === 2;
    const sponsor = gameState.pendingSponsorOffer;

    container.innerHTML = `
        <div class="page-shell result-page">
            ${renderHeaderHud()}
            <div class="eyebrow">📊 TRIMESTRE ${gameState.time.trimestre}/2 TERMINADO</div>
            <h1 class="page-title">Tu canal siguió avanzando.</h1>
            <p class="page-subtitle">Vos elegiste el video destacado. El resto de tu canal trabajó durante el trimestre.</p>

            <div class="result-hero">
                <div class="result-number">${nf(res.totalVideos)}</div>
                <div>
                    <div class="eyebrow">ACTIVIDAD DEL CANAL</div>
                    <h2>videos publicados este trimestre</h2>
                    <p>1 fue el video que elegiste. Los otros ${nf(res.simulatedVideos)} representan la actividad normal de tu creador.</p>
                </div>
            </div>

            <div class="stat-grid">
                ${[
                    ["👁️ Vistas", `+${nf(res.totalVistas)}`],
                    ["👥 Suscriptores", `+${nf(res.totalSubs)}`],
                    ["💰 Ingresos", `+$${nf(res.totalDinero)}`],
                    ["⭐ Fama", `+${nf(res.totalFama)}`]
                ].map(([a,b]) => `<div class="stat-tile"><span>${a}</span><strong>${b}</strong></div>`).join("")}
            </div>

            <div class="panel featured-video">
                <div class="eyebrow">🎬 VIDEO DESTACADO</div>
                <h2>${res.manualVideo.titulo}</h2>
                <div class="mini-stats">
                    <span>👁️ ${nf(res.manualVideo.vistas)}</span>
                    <span>👥 +${nf(res.manualVideo.suscriptores)}</span>
                    <span>💰 +$${nf(res.manualVideo.dinero)}</span>
                    ${res.manualVideo.viral ? `<b>🔥 ${res.manualVideo.nivelViralidad.toUpperCase()}</b>` : ""}
                </div>
            </div>

            ${sponsor ? `
                <div class="sponsor-alert">
                    <div class="sponsor-alert-icon">💼</div>
                    <div>
                        <div class="eyebrow">NUEVA PROPUESTA</div>
                        <h2>${sponsor.name} quiere trabajar con vos</h2>
                        <p>La oferta apareció porque tu canal alcanzó un nuevo nivel. No necesitás entrar a Sponsors para descubrirla.</p>
                    </div>
                    <a class="btn gold" href="#sponsors">VER OFERTA</a>
                </div>
            ` : ""}

            <div class="continue-row">
                <a class="btn ghost" href="#dashboard">Volver al dashboard</a>
                <button id="continueAfterVideo" class="btn primary">${finDeAño ? "📊 VER RESUMEN DEL AÑO" : "▶ IR AL TRIMESTRE 2"}</button>
            </div>
        </div>
    `;

    container.querySelector("#continueAfterVideo")?.addEventListener("click", () => {
        if (finDeAño) {
            gameState.finalizarAño();
            gameState.guardar();
            window.location.hash = "#yearSummary";
            return;
        }
        gameState.nextQuarter();
        gameState.guardar();
        window.location.hash = "#dashboard";
    });

    return container;
}

export const videoResultScreen = { render: renderVideoResult };
export default videoResultScreen;
