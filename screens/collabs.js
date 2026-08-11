// screens/collabs.js
// Las colaboraciones aparecen solas. Esta pantalla funciona como bandeja e historial.
import { renderHeaderHud } from "../components/HeaderHud.js";
import { gameState } from "../engine/gameState.js";

const nf = n => Number(n || 0).toLocaleString();

function continuar() {
    setTimeout(() => {
        if (gameState.pendingSponsorOffer) {
            window.location.hash = "#sponsors";
            return;
        }
        if (gameState.time.trimestre === 2) {
            gameState.finalizarAño();
            window.location.hash = "#yearSummary";
            return;
        }
        window.location.hash = "#videoResult";
    }, 160);
}

export function renderCollabs(el) {
    const container = el || document.getElementById("collabsScreen");
    if (!container) return;

    const offer = gameState.pendingCollabOffer;
    const last = gameState.lastCollab;
    const creators = (gameState.creators || [])
        .filter(c => c.activo !== false)
        .slice()
        .sort((a, b) => Number(b.seguidores || 0) - Number(a.seguidores || 0))
        .slice(0, 14);

    container.innerHTML = `
        <div class="page-shell compact-page">
            ${renderHeaderHud()}
            <div class="dashboard-top">
                <div>
                    <div class="eyebrow">🤝 RED DE CREADORES</div>
                    <h1 class="page-title">Colaboraciones</h1>
                    <p class="page-subtitle">Las oportunidades aparecen solas según tu tamaño, crecimiento, nicho y relaciones.</p>
                </div>
                <a href="#dashboard" class="btn ghost">← Volver</a>
            </div>

            ${offer ? `
                <section class="panel contract-card collab-offer-card">
                    <div class="eyebrow">📩 INVITACIÓN RECIBIDA</div>
                    <h2>${offer.creatorName} quiere hacer algo con vos.</h2>
                    <p>${offer.creatorName} tiene <b>${nf(offer.creatorFollowers)}</b> seguidores y descubrió tu contenido durante este trimestre.</p>
                    <div class="contract-stats">
                        <div><span>Vistas</span><b>+${nf(offer.reward.vistas)}</b></div>
                        <div><span>Seguidores</span><b>+${nf(offer.reward.subs)}</b></div>
                        <div><span>Nicho</span><b>${offer.niche}</b></div>
                    </div>
                    <div class="contract-actions">
                        <button id="acceptCollab" class="btn primary">ACEPTAR COLAB</button>
                        <button id="rejectCollab" class="btn ghost">RECHAZAR</button>
                    </div>
                </section>
            ` : `
                <section class="panel empty-opportunity">
                    <div class="empty-icon">🤝</div>
                    <h2>No tenés una invitación pendiente.</h2>
                    <p>No necesitás proponer nada. Seguí jugando y las colaboraciones van a surgir cuando tenga sentido.</p>
                </section>
            `}

            ${last ? `
                <section class="panel">
                    <div class="eyebrow">ÚLTIMA COLABORACIÓN</div>
                    <h3>${last.estado === "aceptada" ? "🤝" : "↩️"} ${last.creatorName}</h3>
                    <p class="muted">${last.estado === "aceptada" ? `+${nf(last.subs)} seguidores · +${nf(last.vistas)} vistas` : "Decidiste no participar esta vez."}</p>
                </section>
            ` : ""}

            <section class="panel">
                <div class="eyebrow">🌎 MUNDO</div>
                <h2>Creadores que están moviendo la escena</h2>
                <div class="mini-list">
                    ${creators.map(c => `
                        <div class="history-row">
                            <div><b>${c.nombre}</b><span>${c.nicho} · ${c.pais || "Argentina"}</span></div>
                            <strong>${nf(c.seguidores)}</strong>
                        </div>
                    `).join("")}
                </div>
            </section>
        </div>
    `;

    container.querySelector("#acceptCollab")?.addEventListener("click", () => {
        gameState.aceptarCollab();
        continuar();
    });

    container.querySelector("#rejectCollab")?.addEventListener("click", () => {
        gameState.rechazarCollab();
        continuar();
    });

    return container;
}

export const collabsScreen = { render: renderCollabs };
export default collabsScreen;
