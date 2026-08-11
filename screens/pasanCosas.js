// screens/pasanCosas.js
import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

export function renderPasanCosas(el) {
    const container = el || document.getElementById("pasanCosasScreen");
    if (!container) return;
    const event = gameState.pendingEvent;

    if (!event) {
        container.innerHTML = `<div class="page-shell">${renderHeaderHud()}<div class="empty-opportunity"><div class="empty-icon">🌙</div><h2>Todo tranquilo por ahora.</h2><p>No hay decisiones pendientes.</p><a class="btn primary" href="#dashboard">Volver al canal</a></div></div>`;
        return container;
    }

    container.innerHTML = `
        <div class="page-shell event-page">
            ${renderHeaderHud()}
            <div class="eyebrow">⚡ PASAN COSAS</div>
            <h1 class="page-title">${event.title}</h1>
            <p class="page-subtitle">${event.text}</p>
            <div class="decision-grid">
                <button class="decision-card" data-option="a"><span>OPCIÓN A</span><h2>${event.a.label}</h2><p>${event.a.desc}</p></button>
                <button class="decision-card risky" data-option="b"><span>OPCIÓN B</span><h2>${event.b.label}</h2><p>${event.b.desc}</p></button>
            </div>
        </div>
    `;

    container.querySelectorAll("[data-option]").forEach(button => {
        button.addEventListener("click", () => {
            gameState.resolverEvento(button.dataset.option);
            window.location.hash = "#dashboard";
        });
    });
    return container;
}

export const pasanCosasScreen = { render: renderPasanCosas };
export default pasanCosasScreen;
