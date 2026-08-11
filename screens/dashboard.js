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
    const pendingEvent = gameState.pendingEvent;
    const notif = gameState.notifications?.find(n => !n.leida);

    let accionPrincipal;

    if (!hizoPretemporada) {
        accionPrincipal =
            `<a class="btn primary big pulse" href="#pretemporada">⚡ HACER PRETEMPORADA</a>`;
    } else if (pendingEvent) {
        accionPrincipal =
            `<a class="btn primary big pulse" href="#pasanCosas">⚡ PASÓ ALGO</a>`;
    } else if (p.videoSubidoEsteTrimestre) {
        accionPrincipal =
            `<a class="btn primary big" href="#pasanCosas">▶ CONTINUAR</a>`;
    } else {
        accionPrincipal =
            `<a class="btn primary big" href="#publish">📹 ELEGIR VIDEO</a>`;
    }

    const progresoAño = p.trimestre === 1 ? 50 : 100;

    container.innerHTML = `
        <div class="page-shell dashboard-page">
            ${renderHeaderHud()}

            <div class="dashboard-top">
                <div>
                    <div class="eyebrow">CARRERA · ${p.año} · TRIMESTRE ${p.trimestre}/2</div>
                    <h1 class="page-title">${p.canal}</h1>
                    <p class="page-subtitle">${p.nombre} · ${p.niche}</p>
                </div>
                ${accionPrincipal}
            </div>

            <div class="season-progress panel">
                <div class="season-progress-head">
                    <div>
                        <div class="eyebrow">TEMPORADA ${p.año}</div>
                        <strong>${p.trimestre === 1 ? "Primera mitad del año" : "Último trimestre del año"}</strong>
                    </div>
                    <span>${progresoAño}%</span>
                </div>
                <div class="season-track">
                    <i style="width:${progresoAño}%"></i>
                    <b class="season-dot dot-1">1</b>
                    <b class="season-dot dot-2">2</b>
                </div>
                <small>
                    Cada trimestre tu canal publica entre 30 y 150 videos propios.
                    Vos elegís el video destacado.
                </small>
            </div>

            ${!hizoPretemporada ? `
                <div class="callout danger">
                    <div class="callout-icon">⚡</div>
                    <div>
                        <b>Tu carrera todavía no empezó.</b>
                        <span>Elegí una mejora para arrancar el año.</span>
                    </div>
                </div>
            ` : ""}

            ${pendingEvent ? `
                <div class="callout event-callout dramatic-callout">
                    <div class="callout-icon">⚡</div>
                    <div>
                        <b>${pendingEvent.title}</b>
                        <span>${pendingEvent.text}</span>
                    </div>
                    <a class="btn primary" href="#pasanCosas">TOMAR DECISIÓN</a>
                </div>
            ` : ""}

            ${sponsor ? `
                <div class="callout sponsor-callout dramatic-callout">
                    <div class="callout-icon">💼</div>
                    <div>
                        <b>${sponsor.name} quiere trabajar con vos.</b>
                        <span>La propuesta apareció sola. Ya no necesitás buscar sponsors.</span>
                    </div>
                    <a class="btn gold" href="#sponsors">ABRIR PROPUESTA</a>
                </div>
            ` : ""}

            ${notif && !pendingEvent && !sponsor ? `
                <div class="notice-line">
                    <span>●</span>
                    <b>${notif.titulo}</b>
                    <span>${notif.descripcion}</span>
                </div>
            ` : ""}

            <div class="stat-grid four">
                <div class="stat-tile"><span>👥 Suscriptores</span><strong>${nf(p.suscriptores)}</strong></div>
                <div class="stat-tile"><span>👁️ Vistas</span><strong>${nf(p.vistasTotales)}</strong></div>
                <div class="stat-tile"><span>🎬 Videos</span><strong>${nf(p.videosSubidos)}</strong></div>
                <div class="stat-tile"><span>💰 Dinero</span><strong>$${nf(p.dinero)}</strong></div>
            </div>

            ${hizoPretemporada && !p.videoSubidoEsteTrimestre && !pendingEvent && !sponsor ? `
                <a href="#publish" class="btn primary big pulse publish-main-cta">📹 PUBLICAR VIDEO</a>
            ` : ""}

            <div class="dashboard-grid">
                <section class="panel">
                    <div class="eyebrow">📈 ESTADO DEL CANAL</div>
                    <div class="skill-list">
                        ${[
                            ["✂️ Edición", "edicion"],
                            ["😎 Carisma", "carisma"],
                            ["🤖 Algoritmo", "algoritmo"],
                            ["📈 Marketing", "marketing"],
                            ["🔥 Constancia", "constancia"],
                            ["😂 Humor", "humor"],
                            ["💡 Creatividad", "creatividad"],
                            ["🤝 Networking", "networking"]
                        ].map(([label,key]) => `
                            <div class="skill-row">
                                <span>${label}</span>
                                <strong>${p.atributos?.[key] || 0}</strong>
                            </div>
                        `).join("")}
                    </div>
                </section>

                <section class="panel">
                    <div class="eyebrow">🧠 REPUTACIÓN</div>
                    <div class="big-metric">
                        <strong>${nf(p.fama)}</strong>
                        <span>Fama</span>
                    </div>

                    <div class="metric-line">
                        <span>Comunidad</span>
                        <b>${nf(p.comunidad)}/100</b>
                    </div>
                    <div class="progress"><i style="width:${Math.min(100,p.comunidad || 0)}%"></i></div>

                    <div class="metric-line">
                        <span>Reputación</span>
                        <b>${nf(p.reputacion)}/100</b>
                    </div>
                    <div class="progress"><i style="width:${Math.min(100,p.reputacion || 0)}%"></i></div>
                </section>
            </div>

            ${actividad ? `
                <section class="panel activity-panel result-mini-panel">
                    <div>
                        <div class="eyebrow">ÚLTIMO TRIMESTRE</div>
                        <h2>${nf(actividad.videos)} publicaciones</h2>
                        <p class="muted">${nf(actividad.vistas)} vistas · +${nf(actividad.suscriptores)} subs · $${nf(actividad.dinero)}</p>
                    </div>
                    <a class="btn ghost" href="#pasanCosas">CONTINUAR</a>
                </section>
            ` : ""}

            ${(gameState.worldNews || []).length ? `
                <section class="panel world-news-panel">
                    <div class="eyebrow">🌎 MIENTRAS TANTO, EN EL MUNDO</div>
                    <div class="world-news-list">
                        ${(gameState.worldNews || []).slice(-4).reverse().map(n => `<div class="world-news-row"><span>${n.type === "viral" ? "🔥" : n.type === "drama" ? "⚠️" : "💼"}</span><p>${n.text}</p></div>`).join("")}
                    </div>
                </section>
            ` : ""}

            <div class="quick-actions">
                <a href="#store" class="action-card"><b>🛒 TIENDA</b><span>Mejorá tu setup cuando te alcance.</span></a>
                <a href="#collabs" class="action-card"><b>🤝 COLABS</b><span>Construí relaciones con otros creadores.</span></a>
                <a href="#sponsors" class="action-card"><b>💼 SPONSORS</b><span>Las marcas te encuentran solas.</span></a>
                <a href="#awards" class="action-card"><b>🏆 AWARDS</b><span>Reconocimiento al final de la temporada.</span></a>
            </div>

            <section class="danger-zone panel">
                <div>
                    <div class="eyebrow">⚙️ CARRERA</div>
                    <h3>¿Querés empezar de cero?</h3>
                    <p class="muted">Borra la partida actual y vuelve a la pantalla de creación.</p>
                </div>
                <button id="deleteCareer" class="btn danger-btn">🗑️ BORRAR CARRERA</button>
            </section>
        </div>
    `;

    container.querySelector("#deleteCareer")?.addEventListener("click", () => {
        const ok = window.confirm(
            "¿Seguro que querés borrar esta carrera? Se perderá todo el progreso."
        );

        if (!ok) return;

        gameState.resetPlayer();
    });

    return container;
}

export const dashboardScreen = { render: renderDashboard };
export default dashboardScreen;
