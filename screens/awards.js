// screens/awards.js
// Premios anuales de El Creador

import { gameState } from "../engine/gameState.js";
import { renderHeaderHud } from "../components/HeaderHud.js";

// ============================================================
// RENDER
// ============================================================

export function renderAwards(el) {

    const container =
        el ||
        document.getElementById(
            "awardsScreen"
        );

    if (!container) {

        console.error(
            "❌ No existe #awardsScreen"
        );

        return;
    }

    const player =
        gameState.player;

    if (!player) {

        window.location.hash =
            "#createChannel";

        return;
    }

    // ========================================================
    // DATOS
    // ========================================================

    const año =
        Number(
            gameState.time?.año ||
            player.año ||
            2026
        );

    const suscriptores =
        Number(
            player.suscriptores
        ) || 0;

    const famaAntes =
        Number(
            player.fama
        ) || 0;

    const canal =
        player.canal ||
        "Mi Canal";

    // ========================================================
    // DETERMINAR PREMIO
    // ========================================================

    let premio =
        "Mención de honor";

    let descripcionPremio =
        "Seguí creando contenido. Tu carrera recién comienza.";

    let famaPremio = 0;

    let emoji =
        "🏅";

    if (
        suscriptores >= 1000000
    ) {

        premio =
            "Streamer del Año";

        descripcionPremio =
            "Te convertiste en uno de los grandes creadores del año.";

        famaPremio =
            25;

        emoji =
            "🏆";

    } else if (
        suscriptores >= 100000
    ) {

        premio =
            "Streamer Revelación del Año";

        descripcionPremio =
            "Tu crecimiento llamó la atención de toda la comunidad.";

        famaPremio =
            10;

        emoji =
            "🚀";

    } else if (
        suscriptores >= 10000
    ) {

        premio =
            "Promesa del Año";

        descripcionPremio =
            "Tu canal empieza a convertirse en una promesa importante.";

        famaPremio =
            5;

        emoji =
            "🌟";
    }

    // ========================================================
    // EVITAR PREMIAR DOS VECES
    // ========================================================

    const flagKey =
        `awards_${año}_applied`;

    let premioAplicado =
        false;

    if (
        famaPremio > 0 &&
        !player[flagKey]
    ) {

        player.fama =
            famaAntes +
            famaPremio;

        player[flagKey] =
            true;

        premioAplicado =
            true;

        gameState.agregarNotificacion({

            tipo:
                "premio",

            titulo:
                `🏆 ${premio}`,

            descripcion:
                `Ganaste ${premio} en los Coscu Army Awards ${año}.`
        });

        gameState.guardar();

    }

    const famaActual =
        Number(
            player.fama
        ) || 0;

    // ========================================================
    // RENDER
    // ========================================================

    container.innerHTML = `

        <div
            style="
                min-height:100vh;
                padding:20px;
            "
        >

            ${
                typeof renderHeaderHud ===
                "function"
                    ? renderHeaderHud()
                    : ""
            }

            <div
                style="
                    max-width:800px;
                    margin:30px auto;
                "
            >

                <div
                    style="
                        background:
                            linear-gradient(
                                145deg,
                                #191919,
                                #0c0c0c
                            );

                        border:
                            var(--border-card);

                        border-radius:18px;

                        padding:40px 25px;

                        text-align:center;

                        box-shadow:
                            0 20px 60px
                            rgba(0,0,0,.45);
                    "
                >

                    <div
                        style="
                            font-size:4rem;
                            margin-bottom:15px;
                        "
                    >
                        ${emoji}
                    </div>

                    <div
                        style="
                            color:
                                var(--accent-red);

                            font-size:.8rem;

                            font-weight:900;

                            letter-spacing:2px;

                            text-transform:
                                uppercase;
                        "
                    >
                        CEREMONIA ANUAL
                    </div>

                    <h1
                        style="
                            font-family:
                                var(--font-heading);

                            font-size:
                                clamp(
                                    1.7rem,
                                    5vw,
                                    2.5rem
                                );

                            margin:
                                10px 0;
                        "
                    >
                        🏆 Coscu Army Awards ${año}
                    </h1>

                    <p
                        style="
                            color:
                                var(--text-muted);

                            line-height:1.6;

                            max-width:550px;

                            margin:
                                0 auto 30px;
                        "
                    >
                        El año terminó y la comunidad
                        se reúne para celebrar a los
                        creadores que más se destacaron.
                    </p>

                    <div
                        style="
                            background:
                                rgba(
                                    255,
                                    255,
                                    255,
                                    .04
                                );

                            border:
                                1px solid
                                rgba(
                                    255,
                                    255,
                                    255,
                                    .08
                                );

                            border-radius:12px;

                            padding:22px;

                            text-align:left;
                        "
                    >

                        <div
                            style="
                                margin-bottom:16px;
                            "
                        >
                            <span
                                style="
                                    display:block;
                                    color:
                                        var(--text-muted);
                                    font-size:.75rem;
                                    text-transform:
                                        uppercase;
                                "
                            >
                                Canal
                            </span>

                            <strong>
                                ${canal}
                            </strong>
                        </div>

                        <div
                            style="
                                margin-bottom:16px;
                            "
                        >
                            <span
                                style="
                                    display:block;
                                    color:
                                        var(--text-muted);
                                    font-size:.75rem;
                                    text-transform:
                                        uppercase;
                                "
                            >
                                Suscriptores
                            </span>

                            <strong>
                                ${suscriptores.toLocaleString()}
                            </strong>
                        </div>

                        <div
                            style="
                                margin-bottom:16px;
                            "
                        >
                            <span
                                style="
                                    display:block;
                                    color:
                                        var(--text-muted);
                                    font-size:.75rem;
                                    text-transform:
                                        uppercase;
                                "
                            >
                                Premio
                            </span>

                            <strong
                                style="
                                    color:
                                        var(--accent-yellow);

                                    font-size:1.15rem;
                                "
                            >
                                ${premio}
                            </strong>
                        </div>

                        <div>

                            <span
                                style="
                                    display:block;
                                    color:
                                        var(--text-muted);
                                    font-size:.75rem;
                                    text-transform:
                                        uppercase;
                                "
                            >
                                Fama
                            </span>

                            <strong
                                style="
                                    color:
                                        var(--accent-green);
                                "
                            >
                                ${famaActual}/100
                            </strong>

                            ${
                                premioAplicado
                                    ? `
                                        <span
                                            style="
                                                color:
                                                    var(--accent-green);
                                                font-size:.8rem;
                                                margin-left:8px;
                                            "
                                        >
                                            +${famaPremio}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                    <div
                        style="
                            margin:
                                25px 0;

                            padding:
                                18px;

                            background:
                                rgba(
                                    255,
                                    212,
                                    59,
                                    .06
                                );

                            border:
                                1px solid
                                rgba(
                                    255,
                                    212,
                                    59,
                                    .15
                                );

                            border-radius:
                                10px;
                        "
                    >

                        <strong>
                            ${descripcionPremio}
                        </strong>

                    </div>

                    <button
                        id="btnNextYear"
                        style="
                            width:100%;

                            padding:16px;

                            background:
                                var(--accent-red);

                            color:#fff;

                            border:none;

                            border-radius:9px;

                            font-family:
                                var(--font-heading);

                            font-size:1rem;

                            font-weight:900;

                            cursor:pointer;

                            text-transform:
                                uppercase;

                            letter-spacing:1px;
                        "
                    >
                        🚀 Continuar carrera
                    </button>

                </div>

            </div>

        </div>

    `;

    // ========================================================
    // BOTÓN SIGUIENTE AÑO
    // ========================================================

    const btnNextYear =
        container.querySelector(
            "#btnNextYear"
        );

    if (!btnNextYear) {
        return container;
    }

    btnNextYear.addEventListener(
        "click",
        () => {

            // Avanzamos hasta el próximo año.
            //
            // Si estamos en trimestre 1:
            // 1 → 2 → 3 → 4 → 1 del año siguiente
            //
            // Si estamos en otro trimestre,
            // seguimos avanzando hasta llegar
            // al trimestre 1 del siguiente año.

            const añoActual =
                gameState.time.año;

            let safety = 0;

            while (
                gameState.time.año ===
                    añoActual &&
                safety < 6
            ) {

                gameState.nextQuarter();

                safety++;
            }

            gameState.agregarNotificacion({

                tipo:
                    "sistema",

                titulo:
                    `🚀 Año ${gameState.time.año} comenzado`,

                descripcion:
                    "Un nuevo año de creación de contenido te espera."
            });

            gameState.guardar();

            window.location.hash =
                "#dashboard";
        }
    );

    return container;
}

// ============================================================
// EXPORTS
// ============================================================

export const awardsScreen = {
    render: renderAwards
};

export default awardsScreen;
