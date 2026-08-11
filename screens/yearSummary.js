// screens/yearSummary.js
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

const nf = n => Number(n || 0).toLocaleString();
const pct = n => `${Number(n || 0).toFixed(0)}%`;

export function renderYearSummary(el) {
    const container = el || document.getElementById("yearSummaryScreen");
    if (!container) return;
    const s = gameState.lastYearSummary;
    const p = gameState.player;
    if (!s) {
        container.innerHTML = `<div class="page-shell">${renderHeaderHud()}<div class="panel center"><h2>Todavía no terminó el año.</h2><a class="btn primary" href="#dashboard">Volver</a></div></div>`;
        return container;
    }

    const crecimiento = s.suscriptoresInicio > 0 ? (s.crecimientoSubs / s.suscriptoresInicio) * 100 : 0;
    const t1 = s.trimestre1;
    const t2 = s.trimestre2;

    container.innerHTML = `
        <div class="page-shell year-summary-page">
            ${renderHeaderHud()}
            <div class="year-cover">
                <div class="eyebrow">TEMPORADA ${s.año}</div>
                <h1>Tu primer año como creador.</h1>
                <p>Dos trimestres. Decisiones. Videos. Oportunidades. Este fue el año que construiste.</p>
            </div>

            <div class="stat-grid four">
                <div class="stat-tile"><span>👥 Suscriptores</span><strong>${nf(s.suscriptoresFin)}</strong><small>+${nf(s.crecimientoSubs)} este año</small></div>
                <div class="stat-tile"><span>👁️ Vistas</span><strong>${nf(s.vistasGanadas)}</strong><small>vistas ganadas</small></div>
                <div class="stat-tile"><span>🎬 Videos</span><strong>${nf(s.videosPublicados)}</strong><small>publicados</small></div>
                <div class="stat-tile"><span>💰 Dinero</span><strong>$${nf(s.dineroGanado)}</strong><small>generado</small></div>
            </div>

            <div class="panel">
                <div class="eyebrow">📈 CRECIMIENTO</div>
                <div class="growth-line"><strong>${nf(s.suscriptoresInicio)}</strong><span>→</span><strong class="accent">${nf(s.suscriptoresFin)}</strong></div>
                <div class="progress"><i style="width:${Math.min(100, Math.max(4, crecimiento / 5))}%"></i></div>
                <p class="muted">Creciste un ${pct(crecimiento)} respecto al comienzo del año.</p>
            </div>

            <div class="quarter-grid">
                ${[t1,t2].map((t,i) => `
                    <div class="panel">
                        <div class="eyebrow">TRIMESTRE ${i+1}</div>
                        <h2>${nf(t?.videos)} videos</h2>
                        <p>+${nf(t?.suscriptores)} subs · +${nf(t?.vistas)} vistas</p>
                        <p class="muted">$${nf(t?.dinero)} generados · ${nf(t?.virales)} virales</p>
                    </div>
                `).join("")}
            </div>

            <div class="panel highlight-panel">
                <div class="eyebrow">🔥 TU AÑO EN UNA FRASE</div>
                <h2>${s.crecimientoSubs >= 100000 ? "Dejaste de ser un creador chico." : s.crecimientoSubs >= 10000 ? "Tu canal empezó a llamar la atención." : "Todavía estás construyendo desde abajo."}</h2>
                <p>${s.mejorVideo > 0 ? `Tu mejor video llegó a ${nf(s.mejorVideo)} vistas.` : "Todavía no tuviste un gran pico de audiencia."}</p>
            </div>

            <div class="continue-row single-next">
                <a class="btn gold big next-button" href="#awards">🏆 SIGUIENTE: COSCU ARMY AWARDS</a>
            </div>
        </div>
    `;
    return container;
}

export const yearSummaryScreen = { render: renderYearSummary };
export default yearSummaryScreen;
