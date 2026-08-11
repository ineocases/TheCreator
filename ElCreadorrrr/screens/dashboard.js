// screens/dashboard.js
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

const nf = n => Number(n || 0).toLocaleString();

export function renderDashboard(el) {
    const container = el || document.getElementById("dashboardScreen");
    if (!container) return;
    const p = gameState.player;

    if (!p.partidaIniciada) {
        window.location.hash = "#createChannel";
        return container;
    }

    const hizoPretemporada = !!p.pretemporada;
    const actividad = p.actividadTrimestre;
    const sponsor = gameState.pendingSponsorOffer;
    const notif = gameState.notifications?.find(n => !n.leida);
    const pendingEvent = gameState.pendingEvent;

    const acciones = !hizoPretemporada
        ? `<a class="btn primary big" href="#pretemporada">⚡ HACER PRETEMPORADA</a>`
        : p.videoSubidoEsteTrimestre
            ? `<a class="btn primary big" href="#videoResult">📊 VER RESULTADO</a>`
            : `<a class="btn primary big" href="#publish">📹 ELEGIR VIDEO</a>`;

    container.innerHTML = `
        <div class="page-shell dashboard-page">
            ${renderHeaderHud()}

            <div class="dashboard-top">
                <div>
                    <div class="eyebrow">AÑO ${p.año} · TRIMESTRE ${p.trimestre}/2</div>
                    <h1 class="page-title">${p.canal}</h1>
                    <p class="page-subtitle">${p.nombre} · ${p.niche}</p>
                </div>
                ${acciones}
            </div>

            ${!hizoPretemporada ? `
                <div class="callout danger">
                    <div class="callout-icon">⚡</div>
                    <div><b>Tu carrera todavía no empezó.</b><span>Elegí una mejora y después vas a poder publicar tu primer video.</span></div>
                </div>
            ` : ""}

            ${pendingEvent ? `
                <div class="callout event-callout"><div class="callout-icon">⚡</div><div><b>${pendingEvent.title}</b><span>Hay una decisión que puede cambiar tu trimestre.</span></div><a class="btn primary" href="#pasanCosas">VER DECISIÓN</a></div>
            ` : ""}

            ${sponsor ? `
                <div class="callout sponsor-callout">
                    <div class="callout-icon">📩</div>
                    <div><b>${sponsor.name} quiere trabajar con vos.</b><span>Recibiste una oferta porque tu canal alcanzó un nuevo nivel.</span></div>
                    <a class="btn gold" href="#sponsors">VER OFERTA</a>
                </div>
            ` : ""}

            ${notif && !sponsor ? `
                <div class="notice-line"><span>●</span><b>${notif.titulo}</b><span>${notif.descripcion}</span></div>
            ` : ""}

            <div class="stat-grid four">
                <div class="stat-tile"><span>👥 Suscriptores</span><strong>${nf(p.suscriptores)}</strong></div>
                <div class="stat-tile"><span>👁️ Vistas</span><strong>${nf(p.vistasTotales)}</strong></div>
                <div class="stat-tile"><span>🎬 Videos</span><strong>${nf(p.videosSubidos)}</strong></div>
                <div class="stat-tile"><span>💰 Dinero</span><strong>$${nf(p.dinero)}</strong></div>
            </div>

            <div class="dashboard-grid">
                <section class="panel">
                    <div class="eyebrow">📈 ESTADO DEL CANAL</div>
                    <div class="skill-list">
                        ${[
                            ["✂️ Edición", "edicion"], ["😎 Carisma", "carisma"],
                            ["🤖 Algoritmo", "algoritmo"], ["📈 Marketing", "marketing"],
                            ["🔥 Constancia", "constancia"], ["😂 Humor", "humor"],
                            ["💡 Creatividad", "creatividad"], ["🤝 Networking", "networking"]
                        ].map(([label,key]) => `
                            <div class="skill-row"><span>${label}</span><strong>${p.atributos[key] || 0}</strong></div>
                        `).join("")}
                    </div>
                </section>

                <section class="panel">
                    <div class="eyebrow">🧠 LO QUE IMPORTA</div>
                    <div class="big-metric"><strong>${nf(p.fama)}</strong><span>Fama</span></div>
                    <div class="metric-line"><span>Comunidad</span><b>${nf(p.comunidad)}/100</b></div>
                    <div class="progress"><i style="width:${Math.min(100,p.comunidad || 0)}%"></i></div>
                    <div class="metric-line"><span>Reputación</span><b>${nf(p.reputacion)}/100</b></div>
                    <div class="progress"><i style="width:${Math.min(100,p.reputacion || 0)}%"></i></div>
                </section>
            </div>

            ${actividad ? `
                <section class="panel activity-panel">
                    <div><div class="eyebrow">ÚLTIMA ACTIVIDAD</div><h2>Tu canal estuvo activo.</h2></div>
                    <div class="activity-chips">
                        <span>🎬 ${nf(actividad.videos)} videos</span>
                        <span>👁️ ${nf(actividad.vistas)} vistas</span>
                        <span>👥 +${nf(actividad.suscriptores)} subs</span>
                    </div>
                </section>
            ` : ""}

            <div class="quick-actions">
                <a href="#collabs" class="action-card"><b>🤝 Colaboraciones</b><span>Construí relaciones.</span></a>
                <a href="#store" class="action-card"><b>🛒 Tienda</b><span>Mejorá tu equipo.</span></a>
                <a href="#awards" class="action-card"><b>🏆 Premios</b><span>Tu reconocimiento.</span></a>
                <a href="#sponsors" class="action-card"><b>💼 Contratos</b><span>Solo cuando haya oportunidades.</span></a>
            </div>
        </div>
    `;
    return container;
}

export const dashboardScreen = { render: renderDashboard };
export default dashboardScreen;
