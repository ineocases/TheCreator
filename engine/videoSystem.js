// engine/videoSystem.js
// El jugador elige 1 video destacado por trimestre.
// Después, su canal publica entre 30 y 150 videos propios durante ese trimestre.
// Esto representa el volumen de publicaciones del creador, como los partidos
// jugados por un futbolista: no se elige uno por uno, pero sí cuentan en sus stats.

import formats from "../data/generator/formats.js";
import topics from "../data/generator/topics.js";
import { gameState } from "./gameState.js";

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
    if (formato === "Gameplay") return "algoritmo";
    if (formato === "Reaccionando a") return "carisma";
    if (formato === "Challenge") return "creatividad";
    if (formato === "24 Horas con") return "constancia";
    if (formato === "Viajando a") return "carisma";
    if (formato === "Documental sobre") return "edicion";

    return tema ? "creatividad" : "algoritmo";
}

export function generarVideos(player) {
    const temas = obtenerTemas(player.niche);
    const usados = [];
    const videos = [];

    for (let i = 0; i < 6; i++) {
        let tema = temas[random(0, temas.length - 1)];
        let intentos = 0;

        while (usados.includes(tema) && intentos < 10) {
            tema = temas[random(0, temas.length - 1)];
            intentos++;
        }

        usados.push(tema);

        const formato = obtenerFormato(i);
        const enfoquePrincipal = atributoPrincipal(formato.name, tema);
        const enfoqueSecundario = enfoquePrincipal === "carisma" ? "humor" : "creatividad";

        videos.push({
            id: typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `video_${Date.now()}_${i}`,
            titulo: generarTitulo(formato, tema),
            formato: formato.name,
            tema,
            costo: Number(formato.cost) || 0,
            riesgo: Number(formato.risk) || 0,
            tipo: obtenerTipo(i),
            enfoquePrincipal,
            enfoqueSecundario
        });
    }

    return videos;
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
function baseVistasPorVideo(player, calidad = 1) {
    const subs = Math.max(50, Number(player.suscriptores) || 50);
    const fama = clamp(Number(player.fama) || 0, 0, 100);
    const constancia = Number(player.atributos?.constancia) || 0;
    const algoritmo = Number(player.atributos?.algoritmo) || 0;

    // La audiencia determina el piso principal de vistas.
    // Un canal de 1.7M puede rondar 80k-180k por video normal;
    // un canal chico todavía tiene descubrimiento orgánico.
    const ratioBase =
        0.055 +
        (fama / 100) * 0.045 +
        clamp(constancia / 100, 0, 1) * 0.018 +
        clamp(algoritmo / 100, 0, 1) * 0.012;

    const variacion = randomFloat(0.72, 1.35);
    const tendencia = calcularTendencia();

    const audiencia = subs * ratioBase * variacion * calidad * tendencia;

    // Incluso con pocos suscriptores existe descubrimiento, recomendaciones
    // y gente que llega desde búsquedas. Esto evita el problema de 128 videos
    // x 35 vistas = casi ningún crecimiento.
    const descubrimiento = 80 + Math.floor(Math.sqrt(subs) * 1.5);
    return Math.max(descubrimiento, Math.floor(audiencia));
}

function resultadoVideoManual(titulo, enfoquePrincipal, enfoqueSecundario) {
    const p = gameState.player;
    const a = p.atributos || {};

    let potencia = potenciaBase(p);
    potencia += (Number(a[enfoquePrincipal]) || 0) * 0.95;
    potencia += (Number(a[enfoqueSecundario]) || 0) * 0.35;
    potencia += random(-10, 14);

    let vistas = baseVistasPorVideo(p, 0.9 + clamp(potencia / 150, 0, 0.8));

    const creatividad = Number(a.creatividad) || 0;
    const algoritmo = Number(a.algoritmo) || 0;
    const carisma = Number(a.carisma) || 0;

    let probViral =
        0.35 +
        creatividad * 0.035 +
        algoritmo * 0.025 +
        carisma * 0.012;

    // Los virales son posibles, pero no ocurren todo el tiempo.
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

    // La conversión también depende del tamaño del canal: los canales grandes
    // tienen más gente nueva expuesta por cada video, pero no crecen de forma
    // exponencial sin límite.
    const conversionBase =
        0.0028 +
        (Number(a.carisma) || 0) * 0.000018 +
        (Number(a.comunidad) || 50) * 0.000003;

    const conversion = clamp(
        conversionBase * (viral ? 1.35 : 1),
        0.0022,
        0.009
    );

    const nuevosSuscriptores = Math.max(
        0,
        Math.floor(vistas * conversion)
    );

    const rpm =
        0.007 +
        (Number(a.marketing) || 0) * 0.00055 +
        (Number(p.fama) || 0) * 0.00002;

    const ingresos = Math.max(
        0,
        Math.floor(vistas * rpm)
    );

    const famaGanada =
        viral ? random(1, 5) :
        Math.random() < 0.22 ? 1 :
        0;

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
        multiplicadorTendencia: calcularTendencia(),
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
        0.65 +
        clamp(
            (potenciaBase(p) +
                (Number(a.constancia) || 0) +
                (Number(a.algoritmo) || 0)) / 220,
            0,
            0.8
        );

    let vistas = baseVistasPorVideo(p, calidad);

    // El contenido automático puede tener picos, pero con menor frecuencia.
    const probViral = clamp(
        0.12 + (Number(a.creatividad) || 0) * 0.018,
        0.12,
        2.2
    );

    const viral = Math.random() * 100 < probViral;
    if (viral) vistas *= random(2, 5);

    vistas = Math.max(1, Math.floor(vistas));

    const conversion =
        0.0022 +
        clamp((Number(a.carisma) || 0) / 100, 0, 1) * 0.0024;

    const subs = Math.max(
        0,
        Math.floor(
            vistas *
            conversion *
            randomFloat(0.75, 1.25)
        )
    );

    const ingresos = Math.max(
        0,
        Math.floor(
            vistas *
            (0.0065 + (Number(a.marketing) || 0) * 0.00045)
        )
    );

    const fama =
        Math.random() < 0.045 ? 1 : 0;

    return {
        vistas,
        suscriptores: subs,
        dinero: ingresos,
        famaGanada: fama,
        viral
    };
}

export function procesarPublicacionTrimestre(
    titulo,
    enfoquePrincipal,
    enfoqueSecundario
) {
    // 1 video elegido por el jugador.
    const manualResult = procesarPublicacionVideo(
        titulo,
        enfoquePrincipal,
        enfoqueSecundario
    );

    // El canal publica entre 30 y 150 videos PROPIOS en el trimestre.
    const totalVideos = random(30, 150);
    const videosDelResto = Math.max(0, totalVideos - 1);

    let simVistas = 0;
    let simSubs = 0;
    let simDinero = 0;
    let simFama = 0;
    let simVirales = 0;

    for (let i = 0; i < videosDelResto; i++) {
        const resultado = simularVideoSecundario();

        simVistas += resultado.vistas;
        simSubs += resultado.suscriptores;
        simDinero += resultado.dinero;
        simFama += resultado.famaGanada;

        if (resultado.viral) simVirales++;

        aplicarResultado(resultado, true);
    }

    const p = gameState.player;

    p.fama = clamp(Number(p.fama), 0, 100);

    const actividad = {
        año: gameState.time.año,
        trimestre: gameState.time.trimestre,
        videos: totalVideos,
        vistas: manualResult.vistas + simVistas,
        suscriptores: manualResult.suscriptores + simSubs,
        dinero: manualResult.dinero + simDinero,
        fama: manualResult.famaGanada + simFama,
        virales: (manualResult.viral ? 1 : 0) + simVirales
    };

    p.actividadTrimestre = actividad;

    if (gameState.time.trimestre === 1) {
        p.historialTrimestre1 = actividad;
    } else {
        p.historialTrimestre2 = actividad;
    }

    const quarterResult = {
        manualVideo: manualResult,
        totalVideos,
        totalVistas: actividad.vistas,
        totalSubs: actividad.suscriptores,
        totalDinero: actividad.dinero,
        totalFama: actividad.fama,
        simulatedVideos: videosDelResto,
        simVistas,
        simSubs,
        simDinero,
        simFama,
        virales: actividad.virales
    };

    gameState.lastQuarterResult = quarterResult;

    // Las decisiones/eventos y las marcas aparecen DESPUÉS de jugar.
    gameState.generarEventoPendiente();
    gameState.generarOfertaSponsor();

    gameState.guardar();

    return quarterResult;
}

export default {
    generarVideos,
    procesarPublicacionVideo,
    procesarPublicacionTrimestre
};
