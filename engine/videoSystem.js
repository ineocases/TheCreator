// engine/videoSystem.js
// El jugador elige 1 video destacado por trimestre.
// Después, su canal publica entre 30 y 150 videos propios durante ese trimestre.
// Esto representa el volumen de publicaciones del creador, como los partidos
// jugados por un futbolista: no se elige uno por uno, pero sí cuentan en sus stats.

import formats from "../data/generator/formats.js";
import topics from "../data/generator/topics.js";
import { gameState } from "./gameState.js";
import { simulateWorld } from "./worldSimulation.js";

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function obtenerTemas(niche) {
    return topics[niche] || topics.Gaming || ["Gaming", "Internet", "YouTube", "Tendencias"];
}

function obtenerFormato(index) {
    if (!formats?.length) return { name: "Video", cost: 0, risk: 10 };
    return formats[index] || formats[index % formats.length];
}

function obtenerTipo(index) {
    if (index < 2) return "gratis";
    if (index < 4) return "medio";
    return "caro";
}

function generarTitulo(formato, tema) {
    const plantillas = {
        Gameplay: [
            `Jugando ${tema} por primera vez`,
            `NO esperaba esto en ${tema}`,
            `La partida más rara de ${tema}`
        ],
        "Gameplay premium": [
            `Jugando ${tema} con todo al máximo`,
            `Probé ${tema} y pasó esto`,
            `¿Vale la pena ${tema}?`
        ],
        "Reaccionando a": [
            `Reaccionando a lo mejor de ${tema}`,
            `NO PUEDO CREER lo que pasó con ${tema}`,
            `Mi reacción a ${tema}`
        ],
        Challenge: [
            `El desafío más difícil de ${tema}`,
            `Intenté hacer esto en ${tema}`,
            `¿Puedo superar este desafío de ${tema}?`
        ],
        "24 Horas con": [
            `24 HORAS con ${tema}`,
            `Pasé 24 horas haciendo esto: ${tema}`,
            `24 HORAS que cambiaron todo`
        ],
        "Viajando a": [
            `Viajando para conocer ${tema}`,
            `Mi viaje para descubrir ${tema}`,
            `NO esperaba encontrar esto en ${tema}`
        ],
        "Documental sobre": [
            `La historia detrás de ${tema}`,
            `La verdad sobre ${tema}`,
            `¿Qué pasó realmente con ${tema}?`
        ]
    };

    const opciones = plantillas[formato.name] || [`${formato.name}: ${tema}`];
    return opciones[random(0, opciones.length - 1)];
}

function atributoPrincipal(formato, tema) {
    if (formato === "Gameplay" || formato === "Gameplay premium") return "algoritmo";
    if (formato === "Reaccionando a") return "carisma";
    if (formato === "Challenge") return "creatividad";
    if (formato === "24 Horas con") return "constancia";
    if (formato === "Viajando a") return "carisma";
    if (formato === "Documental sobre") return "edicion";

    return tema ? "creatividad" : "algoritmo";
}

export function generarVideos(player) {
    const temas = obtenerTemas(player.niche);
    const catalogo = [];
    const dineroDisponible = Math.max(0, Number(player.dinero) || 0);

    // Generamos opciones y después mostramos SOLO las que el jugador puede pagar.
    // Los videos baratos/gratis tienen más presencia para que una partida nueva
    // nunca quede bloqueada por falta de dinero.
    const formatosDisponibles = formats.filter(f => Number(f.cost) <= dineroDisponible);
    const formatosSeguros = formatosDisponibles.length
        ? formatosDisponibles
        : formats.filter(f => Number(f.cost) === 0);

    const usados = new Set();
    let intentos = 0;

    while (catalogo.length < 6 && intentos < 80) {
        intentos++;
        const tema = temas[random(0, temas.length - 1)];
        const formato = formatosSeguros[random(0, formatosSeguros.length - 1)];
        const clave = `${formato.name}::${tema}`;
        if (usados.has(clave)) continue;
        usados.add(clave);

        const enfoquePrincipal = atributoPrincipal(formato.name, tema);
        const enfoqueSecundario = enfoquePrincipal === "carisma" ? "humor" : "creatividad";

        catalogo.push({
            id: typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `video_${Date.now()}_${catalogo.length}`,
            titulo: generarTitulo(formato, tema),
            formato: formato.name,
            tema,
            costo: Number(formato.cost) || 0,
            riesgo: Number(formato.risk) || 0,
            tipo: formato.cost === 0 ? "gratis" : formato.cost <= 35 ? "barato" : "premium",
            enfoquePrincipal,
            enfoqueSecundario
        });
    }

    // Si el catálogo quedó corto por falta de combinaciones, completamos
    // con opciones gratuitas repetibles pero con título/ID distintos.
    while (catalogo.length < 6) {
        const tema = temas[random(0, temas.length - 1)];
        const formato = formatosSeguros[0];
        const enfoquePrincipal = atributoPrincipal(formato.name, tema);
        const enfoqueSecundario = enfoquePrincipal === "carisma" ? "humor" : "creatividad";
        catalogo.push({
            id: `video_${Date.now()}_${catalogo.length}_${Math.random().toString(36).slice(2,7)}`,
            titulo: generarTitulo(formato, tema),
            formato: formato.name,
            tema,
            costo: Number(formato.cost) || 0,
            riesgo: Number(formato.risk) || 0,
            tipo: formato.cost === 0 ? "gratis" : "barato",
            enfoquePrincipal,
            enfoqueSecundario
        });
    }

    // Orden económico: primero gratis/baratos, luego premium.
    return catalogo.sort((a,b) => a.costo - b.costo);
}

function potenciaBase(player) {
    const a = player.atributos || {};
    const valores = Object.values(a).map(v => Number(v) || 0);
    let potencia = valores.reduce((sum, value) => sum + value, 0) * 0.42;

    const eq = player.equipment || {};
    if (eq.pc && eq.pc !== "government_pc") potencia += 6;
    if (eq.camera && eq.camera !== "old_phone") potencia += 5;
    if (eq.microphone && eq.microphone !== "earphones") potencia += 4;

    return potencia;
}

function calcularTendencia() {
    const p = gameState.player;
    const tendencia = Array.isArray(gameState.trends)
        ? gameState.trends.find(
            t => t.activa && (t.nicho === p.niche || t.nicho === "Todos")
        )
        : null;

    return tendencia
        ? clamp(Number(tendencia.multiplicador) || 1, 1, 1.35)
        : 1;
}

// La audiencia importa mucho más a medida que el canal crece.
// 1.7M subs puede tener videos de decenas/cientos de miles de vistas;
// 50 subs sigue siendo un canal muy chico.
function bonusPretemporada(player) {
    const e = player?.pretemporada?.efecto;
    return e || null;
}

function baseVistasPorVideo(player, calidad = 1) {
    const subs = Math.max(50, Number(player.suscriptores) || 50);
    const fama = clamp(Number(player.fama) || 0, 0, 100);
    const constancia = Number(player.atributos?.constancia) || 0;
    const algoritmo = Number(player.atributos?.algoritmo) || 0;

    const ratioBase =
        0.060 +
        (fama / 100) * 0.050 +
        clamp(constancia / 100, 0, 1) * 0.022 +
        clamp(algoritmo / 100, 0, 1) * 0.018;

    let multiplicadorPre = 1;
    const efecto = bonusPretemporada(player);
    if (efecto === "marketing") multiplicadorPre *= 1.05;
    if (efecto === "algoritmo") multiplicadorPre *= 1.06;
    if (efecto === "edicion") multiplicadorPre *= 1.08;

    const variacion = randomFloat(0.72, 1.35);
    const tendencia = calcularTendencia();
    const audiencia = subs * ratioBase * variacion * calidad * tendencia * multiplicadorPre;
    const descubrimiento = 90 + Math.floor(Math.sqrt(subs) * 1.8);
    return Math.max(descubrimiento, Math.floor(audiencia));
}

function calcularSubsPorVideo(vistas, player, viral = false) {
    const a = player.atributos || {};
    const carisma = Number(a.carisma) || 0;
    const comunidad = Number(player.comunidad) || 50;
    const fama = Number(player.fama) || 0;

    const base = randomFloat(6, 10);
    const porVistas = Math.sqrt(Math.max(1, vistas)) * 0.48;
    const calidad =
        (carisma / 100) * 4.5 +
        (comunidad / 100) * 2.0 +
        (fama / 100) * 2.5;

    let resultado = base + porVistas + calidad;
    if (player?.pretemporada?.efecto === "carisma") resultado *= 1.12;
    if (viral) resultado *= randomFloat(1.35, 1.85);

    const subsActuales = Number(player.suscriptores) || 50;
    if (subsActuales >= 1000000) resultado *= 0.88;
    else if (subsActuales >= 250000) resultado *= 0.94;
    else if (subsActuales >= 50000) resultado *= 0.97;

    return Math.max(3, Math.round(resultado));
}

function calcularIngresosPorVideo(vistas, player) {
    const a = player.atributos || {};
    const marketing = Number(a.marketing) || 0;
    const fama = Number(player.fama) || 0;

    const rpm = clamp(
        1.25 + marketing * 0.075 + fama * 0.014 + randomFloat(-0.18, 0.38),
        0.85,
        7.50
    );

    let ingreso = (Math.max(1, vistas) / 1000) * rpm;
    if (player?.pretemporada?.efecto === "marketing") ingreso *= 1.12;
    return Math.max(0.05, ingreso);
}

function resultadoVideoManual(titulo, enfoquePrincipal, enfoqueSecundario) {
    const p = gameState.player;
    const a = p.atributos || {};

    let potencia = potenciaBase(p);
    potencia += (Number(a[enfoquePrincipal]) || 0) * 0.95;
    potencia += (Number(a[enfoqueSecundario]) || 0) * 0.35;
    potencia += random(-10, 14);

    let vistas = baseVistasPorVideo(
        p,
        0.9 + clamp(potencia / 150, 0, 0.8)
    );

    const creatividad = Number(a.creatividad) || 0;
    const algoritmo = Number(a.algoritmo) || 0;
    const carisma = Number(a.carisma) || 0;

    let probViral =
        0.35 +
        creatividad * 0.035 +
        algoritmo * 0.025 +
        carisma * 0.012;

    probViral = clamp(probViral, 0.5, 7.5);

    const viral = Math.random() * 100 < probViral;
    let nivelViralidad = "normal";
    let multiplicadorViral = 1;

    if (viral) {
        multiplicadorViral = random(2, 8);
        vistas *= multiplicadorViral;
        nivelViralidad =
            multiplicadorViral >= 7 ? "fenomeno" :
            multiplicadorViral >= 5 ? "mega_viral" :
            "viral";
    }

    vistas = Math.max(1, Math.floor(vistas));

    const nuevosSuscriptores = calcularSubsPorVideo(vistas, p, viral);
    const ingresos = calcularIngresosPorVideo(vistas, p);

    const famaGanada =
        viral ? random(1, 5) :
        Math.random() < 0.22 ? 1 :
        0;

    return {
        titulo: titulo || "Nuevo video",
        vistas,
        suscriptores: nuevosSuscriptores,
        dinero: Math.round(ingresos),
        famaGanada,
        viral,
        nivelViralidad,
        potencia: Math.round(potencia),
        enfoquePrincipal,
        enfoqueSecundario,
        rpm: (Math.round(ingresos) / Math.max(1, vistas) * 1000).toFixed(3),
        multiplicadorTendencia: calcularTendencia(),
        multiplicadorViral
    };
}

function aplicarResultado(resultado, contarVideo = true) {
    const p = gameState.player;

    p.vistasTotales += resultado.vistas;
    p.suscriptores += resultado.suscriptores;
    const dinero = Math.round(Number(resultado.dinero) || 0);
    p.dinero += dinero;
    p.ingresosTrimestre += dinero;
    p.ingresosGenerados = (Number(p.ingresosGenerados) || 0) + dinero;
    p.fama = clamp(Number(p.fama) + resultado.famaGanada, 0, 100);

    if (contarVideo) p.videosSubidos += 1;

    if (!p.stats) p.stats = {};
    p.stats.videosPublicados =
        (Number(p.stats.videosPublicados) || 0) + 1;

    p.stats.mejorVideo = Math.max(
        Number(p.stats.mejorVideo) || 0,
        resultado.vistas
    );

    if (resultado.viral) {
        p.stats.videosVirales =
            (Number(p.stats.videosVirales) || 0) + 1;
    }
}

export function procesarPublicacionVideo(
    titulo,
    enfoquePrincipal,
    enfoqueSecundario
) {
    const resultado = resultadoVideoManual(
        titulo,
        enfoquePrincipal || "creatividad",
        enfoqueSecundario || "carisma"
    );

    aplicarResultado(resultado, true);

    gameState.lastVideoResult = resultado;

    gameState.player.ultimoVideoResultado = {
        titulo: resultado.titulo,
        vistasGanadas: resultado.vistas,
        subsGanados: resultado.suscriptores,
        dineroGanado: resultado.dinero,
        rpmFinal: resultado.rpm,
        esViral: resultado.viral
    };

    gameState.agregarNotificacion({
        tipo: "video",
        titulo: resultado.viral
            ? "🔥 Tu video se hizo viral"
            : "📹 Video publicado",
        descripcion:
            `${resultado.titulo} consiguió ${resultado.vistas.toLocaleString()} vistas.`
    });

    return resultado;
}

function simularVideoSecundario() {
    const p = gameState.player;
    const a = p.atributos || {};

    const calidad =
        0.82 +
        clamp(
            (potenciaBase(p) +
                (Number(a.constancia) || 0) * 1.15 +
                (Number(a.algoritmo) || 0) * 0.95 +
                (Number(a.creatividad) || 0) * 0.65) / 260,
            0,
            0.95
        );

    let vistas = baseVistasPorVideo(p, calidad);

    let probViral =
        0.06 +
        (Number(a.creatividad) || 0) * 0.011 +
        (Number(p.fama) || 0) * 0.0025;
    if (p?.pretemporada?.efecto === "creatividad") probViral *= 1.35;
    probViral = clamp(probViral, 0.06, 2.2);

    const viral = Math.random() * 100 < probViral;
    if (viral) vistas *= randomFloat(2.2, 5.5);

    vistas = Math.max(1, Math.floor(vistas));

    return {
        vistas,
        viral,
        suscriptores: calcularSubsPorVideo(vistas, p, viral),
        dinero: calcularIngresosPorVideo(vistas, p)
    };
}

export function procesarPublicacionTrimestre(
    titulo,
    enfoquePrincipal,
    enfoqueSecundario
) {
    const manualResult = procesarPublicacionVideo(
        titulo,
        enfoquePrincipal || "creatividad",
        enfoqueSecundario || "carisma"
    );

    const constancia = Number(gameState.player.atributos?.constancia) || 0;
    const efectoConstancia = gameState.player.pretemporada?.efecto === "constancia" ? 0.9 : 0;
    const power = Math.max(0.55, 1.05 - (constancia / 100) * 0.30 - efectoConstancia);
    const totalVideos = Math.min(150, 30 + Math.floor(Math.pow(Math.random(), power) * 121));
    const videosDelResto = Math.max(0, totalVideos - 1);

    let simVistas = 0;
    let simSubs = 0;
    let simDinero = 0;
    let simFama = 0;
    let simVirales = 0;
    let mejorSimulado = 0;

    for (let i = 0; i < videosDelResto; i++) {
        const resultado = simularVideoSecundario();
        simVistas += resultado.vistas;
        simSubs += resultado.suscriptores;
        simDinero += resultado.dinero;
        simFama += resultado.viral ? 1 : 0;
        mejorSimulado = Math.max(mejorSimulado, resultado.vistas);
        if (resultado.viral) simVirales++;
    }

    // Los subs se calculan por video, pero se acumulan sin redondear a cero.
    // Esto garantiza que 78 videos nunca puedan terminar dando 0 o 24 subs.
    const simSubsEnteros = Math.max(0, Math.round(simSubs));
    const simDineroEntero = Math.max(0, Math.round(simDinero));
    const simFamaEntera = Math.min(6, simFama);

    const p = gameState.player;
    p.vistasTotales += simVistas;
    p.suscriptores += simSubsEnteros;
    p.dinero += simDineroEntero;
    p.ingresosTrimestre += simDineroEntero;
    p.ingresosGenerados = (Number(p.ingresosGenerados) || 0) + simDineroEntero;
    p.fama = clamp(Number(p.fama) + simFamaEntera, 0, 100);

    p.videosSubidos += videosDelResto;
    if (!p.stats) p.stats = {};
    p.stats.videosPublicados =
        (Number(p.stats.videosPublicados) || 0) + videosDelResto;
    p.stats.mejorVideo = Math.max(
        Number(p.stats.mejorVideo) || 0,
        mejorSimulado
    );
    p.stats.videosVirales =
        (Number(p.stats.videosVirales) || 0) + simVirales;

    const actividad = {
        año: gameState.time.año,
        trimestre: gameState.time.trimestre,
        videos: totalVideos,
        vistas: Math.floor(manualResult.vistas + simVistas),
        suscriptores: manualResult.suscriptores + simSubsEnteros,
        dinero: Math.round(manualResult.dinero + simDineroEntero),
        fama: manualResult.famaGanada + simFamaEntera,
        virales: (manualResult.viral ? 1 : 0) + simVirales
    };

    p.actividadTrimestre = actividad;

    if (gameState.time.trimestre === 1) p.historialTrimestre1 = actividad;
    else p.historialTrimestre2 = actividad;

    const quarterResult = {
        manualVideo: manualResult,
        totalVideos,
        totalVistas: actividad.vistas,
        totalSubs: actividad.suscriptores,
        totalDinero: actividad.dinero,
        totalFama: actividad.fama,
        simulatedVideos: videosDelResto,
        simVistas: Math.floor(simVistas),
        simSubs: simSubsEnteros,
        simDinero: simDineroEntero,
        simFama: simFamaEntera,
        virales: actividad.virales
    };

    gameState.lastQuarterResult = quarterResult;

    // El mundo avanza al mismo tiempo que el jugador. Los demás creadores
    // publican, ganan seguidores y generan noticias aunque el jugador no los vea.
    simulateWorld(gameState);

    gameState.generarEventoPendiente();
    if (!gameState.pendingEvent) gameState.generarOfertaSponsor();
    gameState.guardar();
    return quarterResult;
}

export default {
    generarVideos,
    procesarPublicacionVideo,
    procesarPublicacionTrimestre
};
