// screens/awards.js
// REESCRITO: Render completo (sin depender de IDs preexistentes), encoding UTF-8

import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

export function renderAwards(el) {

    const container = el || document.getElementById("awardsScreen");
    if (!container) return;

    const player = gameState.player;
    const ano = gameState.time?.ano ?? player.ano ?? 2026;
    const suscriptores = Number(player.suscriptores) || 0;
    const fama = Number(player.fama) || 0;
    const canal = player.canal || player.nombre || "Mi Canal";

    // Determinar premio
    let premio = "Mencion de honor ¡X Segui participando";
    let famaPremio = 0;
    let emoji = "???";

    if (suscriptores >= 1000000) {
        premio = "?? Streamer del Ano";
        famaPremio = 25;
        emoji = "??";
    } else if (suscriptores >= 100000) {
        premio = "?? Streamer Revelacion del Ano";
        famaPremio = 10;
        emoji = "??";
    } else if (suscriptores >= 10000) {
        premio = "?? Promesa del Ano";
        famaPremio = 5;
        emoji = "??";
    }

    // Aplicamos la fama una sola vez (flag para no duplicar al re-renderizar)
    const flagKey = `awards_${ano}_applied`;
    if (famaPremio > 0 && !player[flagKey]) {
        player.fama = Number(player.fama || 0) + famaPremio;
        player[flagKey] = true;
        gameState.guardar();
    }

    container.innerHTML = `
        ${typeof renderHeaderHud === "function" ? renderHeaderHud() : ""}
        <div style="max-width:800px; margin:30px auto; padding:25px; color:#fff;">
            <div style="
                background:var(--bg-card);
                border:var(--border-card);
                border-radius:16px;
                padding:35px;
                text-align:center;
            ">
                <div style="font-size:4rem; margin-bottom:15px;">${emoji}</div>
                <span style="color:var(--accent-red); font-size:.8rem; font-weight:bold; text-transform:uppercase;">
                    CEREMONIA ANUAL
                </span>
                <h1 id="awardsTitle" style="font-family:var(--font-heading); margin:10px 0; font-size:2rem;">
                    ?? Coscu Army Awards ${ano}
                </h1>

                <div id="awardsSummary" class="stats-box">
                    <p>El ano termino y la comunidad se reune para celebrar.</p>
                    <p><strong>Canal:</strong> ${canal}</p>
                    <p><strong>Suscriptores totales:</strong> ${suscriptores.toLocaleString()}</p>
                    <p><strong>Fama actual:</strong> ${Number(player.fama || 0)}/100</p>
                    <p><strong>Galardon:</strong> ${premio}</p>
                    <p>!Preparate para un nuevo ano de creacion de contenido!</p>
                </div>

                <button id="btnNextYear" style="
                    margin-top:25px;
                    padding:16px 32px;
                    background:var(--accent-red);
                    color:white;
                    border:none;
                    border-radius:8px;
                    font-family:var(--font-heading);
                    font-size:1.1rem;
                    font-weight:bold;
                    cursor:pointer;
                    text-transform:uppercase;
                ">? Continuar al siguiente ano</button>
            </div>
        </div>
    `;

    const btnNextYear = container.querySelector("#btnNextYear");
    if (btnNextYear) {
        btnNextYear.onclick = () => {
            // Avanzar 4 trimestres = 1 ano completo
            gameState.nextQuarter();
            gameState.nextQuarter();
            gameState.nextQuarter();
            gameState.nextQuarter();

            gameState.agregarNotificacion({
                tipo: "sistema",
                titulo: `?? Ano ${gameState.time.ano} comenzado`,
                descripcion: "Un nuevo ano lleno de oportunidades te espera."
            });

            gameState.guardar();
            window.location.hash = "#dashboard";
        };
    }

    return container;
}

export const awardsScreen = { render: renderAwards };
export default awardsScreen;