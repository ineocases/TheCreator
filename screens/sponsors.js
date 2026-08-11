// screens/sponsors.js
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

const nf = n => Number(n || 0).toLocaleString();

export function renderSponsors(el) {
    const container = el || document.getElementById("sponsorsScreen");
    if (!container) return;
    const p = gameState.player;
    const offer = gameState.pendingSponsorOffer;
    const history = Array.isArray(gameState.sponsors) ? gameState.sponsors : [];

    container.innerHTML = `
        <div class="page-shell">
            ${renderHeaderHud()}
            <div class="dashboard-top">
                <div><div class="eyebrow">💼 NEGOCIOS</div><h1 class="page-title">Contratos</h1><p class="page-subtitle">Las marcas te encuentran. No necesitás perseguirlas.</p></div>
                <a class="btn ghost" href="#dashboard">← Volver</a>
            </div>

            ${offer ? `
                <section class="contract-card">
                    <div class="contract-brand">${offer.name}</div>
                    <div class="eyebrow">📩 PROPUESTA RECIBIDA</div>
                    <h2>${offer.name} quiere trabajar con ${p.canal}.</h2>
                    <p>Tu canal llegó a ${nf(p.suscriptores)} suscriptores y ${nf(p.fama)} de fama. La marca considera que ya tenés suficiente audiencia para una primera campaña.</p>
                    <div class="contract-stats">
                        <div><span>Pago</span><b>$${nf(offer.pago)}</b></div>
                        <div><span>Duración</span><b>${offer.duration} trimestres</b></div>
                        <div><span>Prestigio</span><b>+${offer.prestige} fama</b></div>
                    </div>
                    <div class="contract-actions">
                        <button id="acceptSponsor" class="btn primary">ACEPTAR CONTRATO</button>
                        <button id="rejectSponsor" class="btn ghost">RECHAZAR</button>
                    </div>
                </section>
            ` : `
                <section class="empty-opportunity">
                    <div class="empty-icon">📭</div>
                    <h2>No hay ofertas nuevas.</h2>
                    <p>Seguí creando. Cuando tu canal alcance un nivel interesante, una marca puede aparecer en tu bandeja automáticamente.</p>
                </section>
            `}

            <section class="panel">
                <div class="eyebrow">HISTORIAL</div>
                ${history.length ? history.slice().reverse().map(item => `
                    <div class="history-row"><div><b>${item.name}</b><span>${item.estado === "aceptado" ? "Contrato aceptado" : "Oferta rechazada"}</span></div><strong>${item.estado === "aceptado" ? "+$" + nf(item.pago) : "—"}</strong></div>
                `).join("") : `<p class="muted">Todavía no tenés contratos.</p>`}
            </section>
        </div>
    `;

    container.querySelector("#acceptSponsor")?.addEventListener("click", () => {
        gameState.aceptarSponsor();
        renderSponsors(container);
    });
    container.querySelector("#rejectSponsor")?.addEventListener("click", () => {
        gameState.rechazarSponsor();
        renderSponsors(container);
    });

    return container;
}

export const sponsorsScreen = { render: renderSponsors };
export default sponsorsScreen;
