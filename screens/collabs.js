// Pantalla de colaboraciones: solo muestra creadores a los que realmente se puede proponer.
import { renderHeaderHud } from "../components/HeaderHud.js";
import { gameState } from "../engine/gameState.js";

const nf = n => Number(n || 0).toLocaleString();

function continuar() {
    setTimeout(() => {
        if (gameState.pendingEvent) { window.location.hash = "#pasanCosas"; return; }
        if (gameState.pendingSponsorOffer) { window.location.hash = "#sponsors"; return; }
        window.location.hash = "#videoResult";
    }, 160);
}

export function renderCollabs(el) {
    const container = el || document.getElementById("collabsScreen");
    if (!container) return;

    const offer = gameState.pendingCollabOffer;
    const creators = (gameState.creators || [])
        .filter(c => c.activo !== false && c.id !== "player")
        .filter(c => gameState.puedeProponerCollab(c.id))
        .sort((a, b) => Number(b.seguidores || 0) - Number(a.seguidores || 0));

    container.innerHTML = `
        <div class="page-shell compact-page">
            ${renderHeaderHud()}
            <div class="dashboard-top">
                <div>
                    <div class="eyebrow">🤝 COLABS</div>
                    <h1 class="page-title">Colaboraciones</h1>
                    <p class="page-subtitle">Solo aparecen creadores a los que podés proponer una colaboración ahora mismo.</p>
                </div>
                <a href="#dashboard" class="btn ghost">← Volver</a>
            </div>

            ${offer ? `
                <section class="panel collab-incoming-card">
                    <div class="eyebrow">📩 TE LLEGÓ UNA PROPUESTA</div>
                    <h2>${offer.creatorName} quiere colaborar con vos</h2>
                    <p>${nf(offer.creatorFollowers)} seguidores · +${nf(offer.reward?.vistas)} vistas · +${nf(offer.reward?.subs)} subs</p>
                    <div class="contract-actions">
                        <button id="acceptCollab" class="btn primary" ${Number(offer.costoVuelo || 0) > Number(gameState.player.dinero || 0) ? "disabled" : ""}>${Number(offer.costoVuelo || 0) ? `ACEPTAR · VIAJE $${nf(offer.costoVuelo)}` : "ACEPTAR COLAB"}</button>
                        <button id="rejectCollab" class="btn ghost">RECHAZAR</button>
                    </div>
                </section>
            ` : ""}

            <section class="panel collab-list-panel">
                <div class="eyebrow">📨 PROPONER COLABORACIÓN</div>
                <div class="collab-list">
                    ${creators.length ? creators.map(c => `
                        <div class="collab-simple-row">
                            <div class="collab-person">
                                <strong>${c.nombre}</strong>
                                <span>${nf(c.seguidores)} subs${c.nicho ? ` · ${c.nicho}` : ""}</span>
                            </div>
                            <button class="btn collab-red propose-collab" data-id="${c.id}">PROPONER COLAB</button>
                        </div>
                    `).join("") : `
                        <div class="empty-opportunity">
                            <h2>Todavía no hay nadie disponible.</h2>
                            <p>Seguí creciendo: la lista se actualiza automáticamente.</p>
                        </div>
                    `}
                </div>
            </section>
        </div>
    `;

    container.querySelector("#acceptCollab")?.addEventListener("click", () => {
        if (gameState.aceptarCollab()) continuar();
    });
    container.querySelector("#rejectCollab")?.addEventListener("click", () => {
        if (gameState.rechazarCollab()) continuar();
    });
    container.querySelectorAll(".propose-collab").forEach(button => {
        button.addEventListener("click", () => {
            const result = gameState.proponerCollab(button.dataset.id);
            if (result === "aceptada" || result === "rechazada") {
                window.location.hash = "#collabs";
            }
        });
    });

    return container;
}

export const collabsScreen = { render: renderCollabs };
export default collabsScreen;
