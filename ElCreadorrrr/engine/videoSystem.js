// engine/videoSystem.js
// El jugador elige 1 video importante por trimestre.
// Luego se simula el resto de su actividad: 30-150 videos EN TOTAL del trimestre.

import formats from "../data/generator/formats.js";
import topics from "../data/generator/topics.js";
import { gameState } from "./gameState.js";

function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function obtenerTemas(niche) {
    return topics[niche] || topics.Gaming || ["Gaming", "Internet", "YouTube", "Tendencias"];
}

function obtenerFormato(index) {
    if (!formats || !formats.length) return { name: "Video", cost: 0, risk: 10 };
    return formats[index] || formats[index % formats.length];
}

function obtenerTipo(index) {
    if (index < 2) return "gratis";
    if (index < 4) return "medio";
    return "caro";
}

function generarTitulo(formato, tema) {
    const plantillas = {
        Gameplay: [`Jugando ${tema} por primera vez`, `NO esperaba esto en ${tema}`, `La partida más rara de ${tema}`],
        "Reaccionando a": [`Reaccionando a lo mejor de ${tema}`, `NO PUEDO CREER lo que pasó con ${tema}`, `Mi reacción a ${tema}`],
        Challenge: [`El desafío más difícil de ${tema}`, `Intenté hacer esto en ${tema}`, `¿Puedo superar este desafío de ${tema}?`],
        "24 Horas con": [`24 HORAS con ${tema}`, `Pasé 24 horas haciendo esto: ${tema}`, `24 HORAS que cambiaron todo`],
        "Viajando a": [`Viajando para conocer ${tema}`, `Mi viaje para descubrir ${tema}`, `NO esperaba encontrar esto en ${tema}`],
        "Documental sobre": [`La historia detrás de ${tema}`, `La verdad sobre ${tema}`, `¿Qué pasó realmente con ${tema}?`]
    };
    const opciones = plantillas[formato.name] || [`${formato.name}: ${tema}`];
    return opciones[random(0, opciones.length - 1)];
}

export function generarVideos(player) {
    const temas = obtenerTemas(player.niche);
    const usados = [];
    const videos = [];
    for (let i = 0; i < 6; i++) {
        let tema = temas[random(0, temas.length - 1)];
        let intentos = 0;
        while (usados.includes(tema) && intentos < 10) { tema = temas[random(0, temas.length - 1)]; intentos++; }
        usados.push(tema);
        const formato = obtenerFormato(i);
        videos.push({
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `video_${Date.now()}_${i}`,
            titulo: generarTitulo(formato, tema),
            formato: formato.name,
            tema,
            costo: Number(formato.cost) || 0,
            riesgo: Number(formato.risk) || 0,
            tipo: obtenerTipo(i)
        });
    }
    return videos;
}

function potenciaBase(player) {
    const a = player.atributos || {};
    let potencia = Object.values(a).reduce((sum, value) => sum + (Number(value) || 0), 0) * 0.55;
    const eq = player.equipment || {};
    if (eq.pc && eq.pc !== "government_pc") potencia += 5;
    if (eq.camera && eq.camera !== "old_phone") potencia += 4;
    if (eq.microphone && eq.microphone !== "earphones") potencia += 3;
    return potencia;
}

function calcularTendencia() {
    const p = gameState.player;
    const tendencia = Array.isArray(gameState.trends)
        ? gameState.trends.find(t => t.activa && (t.nicho === p.niche || t.nicho === "Todos"))
        : null;
    return tendencia ? clamp(Number(tendencia.multiplicador) || 1, 1, 1.35) : 1;
}

function resultadoVideoManual(titulo, enfoquePrincipal, enfoqueSecundario) {
    const p = gameState.player;
    const a = p.atributos || {};
    let potencia = potenciaBase(p);
    potencia += (Number(a[enfoquePrincipal]) || 0) * 0.8;
    potencia += (Number(a[enfoqueSecundario]) || 0) * 0.35;
    potencia += random(-12, 15);

    const tendencia = calcularTendencia();
    let vistas;
    if (potencia < 25) vistas = random(40, 180);
    else if (potencia < 40) vistas = random(80, 350);
    else if (potencia < 55) vistas = random(150, 700);
    else if (potencia < 75) vistas = random(300, 1200);
    else if (potencia < 100) vistas = random(600, 2500);
    else vistas = random(1200, 6000);

    vistas = Math.floor(vistas * tendencia);

    // En canales chicos el viral es raro. Crece con creatividad, pero nunca es una lotería absurda.
    const creatividad = Number(a.creatividad) || 0;
    const algoritmo = Number(a.algoritmo) || 0;
    const carisma = Number(a.carisma) || 0;
    let probViral = 0.8 + creatividad * 0.10 + algoritmo * 0.07 + carisma * 0.03;
    if (tendencia > 1) probViral += (tendencia - 1) * 8;
    probViral = clamp(probViral, 0.5, 8);

    const viral = Math.random() * 100 < probViral;
    let nivelViralidad = "normal";
    let multiplicadorViral = 1;
    if (viral) {
        multiplicadorViral = random(3, 12);
        vistas *= multiplicadorViral;
        nivelViralidad = multiplicadorViral >= 10 ? "fenomeno" : multiplicadorViral >= 7 ? "mega_viral" : "viral";
    }

    vistas = Math.max(1, Math.floor(vistas));
    // Conversión deliberadamente lenta: 50 subs no se convierten en 10k en una tarde.
    const conversion = viral ? random(90, 180) : random(140, 300);
    const nuevosSuscriptores = Math.max(1, Math.floor(vistas / conversion));
    const rpm = 0.008 + (Number(a.marketing) || 0) * 0.0007;
    const ingresos = Math.max(0, Math.floor(vistas * rpm));
    const famaGanada = viral ? random(1, 4) : (Math.random() < 0.35 ? 1 : 0);

    return {
        titulo: titulo || "Nuevo video",
        vistas,
        suscriptores: nuevosSuscriptores,
        dinero: ingresos,
        famaGanada,
        viral,
        nivelViralidad,
        potencia: Math.round(potencia),
        enfoquePrincipal,
        enfoqueSecundario,
        rpm: rpm.toFixed(3),
        multiplicadorTendencia: tendencia,
        multiplicadorViral
    };
}

function aplicarResultado(resultado, contarVideo = true) {
    const p = gameState.player;
    p.vistasTotales += resultado.vistas;
    p.suscriptores += resultado.suscriptores;
    p.dinero += resultado.dinero;
    p.ingresosTrimestre += resultado.dinero;
    p.fama = clamp(Number(p.fama) + resultado.famaGanada, 0, 100);
    if (contarVideo) p.videosSubidos += 1;
    if (!p.stats) p.stats = {};
    p.stats.videosPublicados = (Number(p.stats.videosPublicados) || 0) + 1;
    p.stats.mejorVideo = Math.max(Number(p.stats.mejorVideo) || 0, resultado.vistas);
    if (resultado.viral) p.stats.videosVirales = (Number(p.stats.videosVirales) || 0) + 1;
}

export function procesarPublicacionVideo(titulo, enfoquePrincipal, enfoqueSecundario) {
    const resultado = resultadoVideoManual(titulo, enfoquePrincipal, enfoqueSecundario);
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
        titulo: resultado.viral ? "🔥 Tu video se hizo viral" : "📹 Video publicado",
        descripcion: `${resultado.titulo} consiguió ${resultado.vistas.toLocaleString()} vistas.`
    });
    return resultado;
}

function simularVideoSecundario() {
    const p = gameState.player;
    const a = p.atributos || {};
    let potencia = potenciaBase(p) + random(-15, 12);
    const tendencia = calcularTendencia();
    let vistas;
    if (potencia < 25) vistas = random(20, 120);
    else if (potencia < 40) vistas = random(40, 220);
    else if (potencia < 55) vistas = random(70, 400);
    else if (potencia < 75) vistas = random(100, 700);
    else if (potencia < 100) vistas = random(180, 1200);
    else vistas = random(300, 2500);
    vistas = Math.floor(vistas * tendencia);

    const probViral = clamp(0.15 + (Number(a.creatividad) || 0) * 0.03, 0.15, 2.5);
    const viral = Math.random() * 100 < probViral;
    if (viral) vistas *= random(2, 6);

    const subs = Math.max(0, Math.floor(vistas / random(180, 360)));
    const ingresos = Math.max(0, Math.floor(vistas * (0.006 + (Number(a.marketing) || 0) * 0.0005)));
    const fama = Math.random() < 0.06 ? 1 : 0;
    return { vistas, suscriptores: subs, dinero: ingresos, famaGanada: fama, viral };
}

export function procesarPublicacionTrimestre(titulo, enfoquePrincipal, enfoqueSecundario) {
    const manualResult = procesarPublicacionVideo(titulo, enfoquePrincipal, enfoqueSecundario);
    const totalVideos = random(30, 150);
    const videosSimulados = Math.max(0, totalVideos - 1);

    let simVistas = 0, simSubs = 0, simDinero = 0, simFama = 0, simVirales = 0;
    for (let i = 0; i < videosSimulados; i++) {
        const r = simularVideoSecundario();
        simVistas += r.vistas;
        simSubs += r.suscriptores;
        simDinero += r.dinero;
        simFama += r.famaGanada;
        if (r.viral) simVirales++;
        aplicarResultado(r, true);
    }

    gameState.player.fama = clamp(Number(gameState.player.fama), 0, 100);
    gameState.player.actividadTrimestre = {
        año: gameState.time.año,
        trimestre: gameState.time.trimestre,
        videos: totalVideos,
        vistas: manualResult.vistas + simVistas,
        suscriptores: manualResult.suscriptores + simSubs,
        dinero: manualResult.dinero + simDinero,
        fama: manualResult.famaGanada + simFama,
        virales: (manualResult.viral ? 1 : 0) + simVirales
    };

    if (gameState.time.trimestre === 1) {
        gameState.player.historialTrimestre1 = gameState.player.actividadTrimestre;
    } else {
        gameState.player.historialTrimestre2 = gameState.player.actividadTrimestre;
    }

    const quarterResult = {
        manualVideo: manualResult,
        simVistas,
        simSubs,
        simDinero,
        simFama,
        totalVideos,
        totalVistas: manualResult.vistas + simVistas,
        totalSubs: manualResult.suscriptores + simSubs,
        totalDinero: manualResult.dinero + simDinero,
        totalFama: manualResult.famaGanada + simFama,
        simulatedVideos: videosSimulados
    };

    gameState.lastQuarterResult = quarterResult;
    gameState.generarOfertaSponsor();
    gameState.guardar();
    return quarterResult;
}

export default { generarVideos, procesarPublicacionVideo, procesarPublicacionTrimestre };
