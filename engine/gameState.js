// engine/gameState.js
// Estado central de El Creador.
// REGLA: 2 trimestres = 1 año.
// El jugador elige 1 video destacado por trimestre; después su canal publica
// entre 30 y 150 videos EN ESE TRIMESTRE. Son videos del propio jugador,
// como los partidos que jugó un futbolista: el jugador ve el volumen y el resultado,
// pero no tiene que elegir manualmente cada publicación.

import { creatorsIniciales } from "../data/creators.js";

const SAVE_KEY = "elCreador_saveData";
const TRIMESTRES_POR_AÑO = 2;

function crearId(prefix = "id") {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function crearAtributos() {
    return {
        edicion: 10,
        carisma: 15,
        algoritmo: 10,
        marketing: 5,
        constancia: 15,
        humor: 5,
        creatividad: 5,
        networking: 5
    };
}

function crearStats() {
    return {
        mejorVideo: 0,
        videosVirales: 0,
        videosPublicados: 0,
        colaboraciones: 0,
        sponsors: 0,
        eventosGanados: 0,
        añosJugados: 0
    };
}

function crearPlayer() {
    return {
        partidaIniciada: false,
        nombre: "Creador",
        canal: "Mi Canal",
        niche: "Gaming",

        año: 2026,
        trimestre: 1,

        dinero: 500,
        suscriptores: 50,
        vistasTotales: 0,
        videosSubidos: 0,
        fama: 0,
        comunidad: 50,
        reputacion: 50,
        ingresosTrimestre: 0,

        atributos: crearAtributos(),

        equipment: {
            pc: "government_pc",
            camera: "old_phone",
            microphone: "earphones"
        },

        stats: crearStats(),
        relationships: {},
        pretemporada: null,
        shopTier: 1,
        inventory: [],

        videoSubidoEsteTrimestre: false,
        actividadTrimestre: null,
        historialTrimestre1: null,
        historialTrimestre2: null,
        historialAños: [],
        yearStartSnapshot: null
    };
}

function crearCreadores() {
    return creatorsIniciales.map(creator => ({
        ...creator,
        relacion: Number(creator.relacion) || 0,
        respeto: Number(creator.respeto) || 0,
        rivalidad: Number(creator.rivalidad) || 0,
        colaboraciones: Number(creator.colaboraciones) || 0
    }));
}

function snapshotAño(player) {
    return {
        año: Number(player.año) || 2026,
        suscriptores: Number(player.suscriptores) || 0,
        vistasTotales: Number(player.vistasTotales) || 0,
        videosSubidos: Number(player.videosSubidos) || 0,
        dinero: Number(player.dinero) || 0,
        fama: Number(player.fama) || 0,
        reputacion: Number(player.reputacion) || 50
    };
}

function eventHasPositive(option) {
    const a = option?.action || {};
    return Object.values(a).some(v => Number(v) > 0);
}

export const gameState = {
    player: crearPlayer(),
    time: { año: 2026, trimestre: 1 },

    inventory: [],
    notifications: [],
    creators: crearCreadores(),
    trends: [],
    sponsors: [],

    pendingSponsorOffer: null,
    pendingEvent: null,

    lastVideo: null,
    lastVideoResult: null,
    lastQuarterResult: null,
    lastYearSummary: null,
    ultimoEventoResultado: null,
    lastCollab: null,

    adminMode: false,

    iniciarPartida(datos = {}) {
        this.player = crearPlayer();
        this.player.partidaIniciada = true;
        this.player.nombre = String(datos.nombre || "Creador").trim() || "Creador";
        this.player.canal = String(datos.canal || "Mi Canal").trim() || "Mi Canal";
        this.player.niche = datos.niche || "Gaming";

        this.time = { año: 2026, trimestre: 1 };
        this.player.año = 2026;
        this.player.trimestre = 1;
        this.player.yearStartSnapshot = snapshotAño(this.player);

        this.inventory = [];
        this.notifications = [];
        this.trends = [];
        this.sponsors = [];
        this.pendingSponsorOffer = null;
        this.pendingEvent = null;
        this.lastVideo = null;
        this.lastVideoResult = null;
        this.lastQuarterResult = null;
        this.lastYearSummary = null;
        this.ultimoEventoResultado = null;
        this.lastCollab = null;

        this.creators = crearCreadores();
        this.creators.forEach(creator => {
            this.player.relationships[creator.id] = 0;
        });

        this.agregarNotificacion({
            tipo: "sistema",
            titulo: "🎬 Carrera iniciada",
            descripcion: `Bienvenido, ${this.player.nombre}. ${this.player.canal} empieza con 50 suscriptores.`
        });

        this.guardar();
        return this.player;
    },

    mejorarAtributo(atributo, cantidad) {
        if (!this.player.atributos) this.player.atributos = crearAtributos();
        if (typeof this.player.atributos[atributo] !== "number") this.player.atributos[atributo] = 0;
        this.player.atributos[atributo] = Math.max(
            0,
            this.player.atributos[atributo] + (Number(cantidad) || 0)
        );
        return this.player.atributos[atributo];
    },

    agregarNotificacion(data = {}) {
        const notificacion = {
            id: crearId("notification"),
            tipo: data.tipo || "general",
            titulo: data.titulo || "Nueva notificación",
            descripcion: data.descripcion || "",
            leida: false,
            fecha: Date.now(),
            ...data
        };

        this.notifications.unshift(notificacion);
        this.notifications = this.notifications.slice(0, 50);
        return notificacion;
    },

    marcarNotificacionLeida(id) {
        const n = this.notifications.find(item => item.id === id);
        if (n) n.leida = true;
    },

    notificacionesNoLeidas() {
        return this.notifications.filter(n => !n.leida).length;
    },

    puedeSubirVideo() {
        return !this.player.videoSubidoEsteTrimestre;
    },

    registrarVideoPublicado() {
        this.player.videoSubidoEsteTrimestre = true;
    },

    // Los eventos son el principal sistema de decisiones del juego.
    generarEventoPendiente() {
        const p = this.player;
        if (!p || this.pendingEvent) return null;

        // No todos los trimestres pasa algo. Pero sí lo suficiente para que
        // la carrera no sea solamente "publicar > siguiente".
        if (Math.random() > 0.42) return null;

        const eventos = [
            {
                id: "creator_share",
                minSubs: 50,
                title: "Un creador más grande compartió tu video",
                text: "Un creador de tu nicho encontró tu contenido. Tenés que decidir qué hacer con la oportunidad.",
                a: {
                    label: "Responder y agradecer",
                    desc: "+2 reputación",
                    action: { reputacion: 2 }
                },
                b: {
                    label: "Intentar aprovechar el contacto",
                    desc: "+4 networking, -1 reputación",
                    action: { networking: 4, reputacion: -1 }
                }
            },
            {
                id: "trend",
                minSubs: 50,
                title: "Apareció una tendencia fuerte",
                text: "La tendencia está creciendo. Podés adaptar tu contenido o mantener tu identidad.",
                a: {
                    label: "Subirme a la tendencia",
                    desc: "+3 algoritmo, +1 creatividad",
                    action: { algoritmo: 3, creatividad: 1 }
                },
                b: {
                    label: "Mantener mi estilo",
                    desc: "+2 creatividad",
                    action: { creatividad: 2 }
                }
            },
            {
                id: "equipment",
                minSubs: 500,
                title: "Tu equipo empieza a quedarse corto",
                text: "La audiencia creció y la calidad del contenido empieza a ser un problema.",
                a: {
                    label: "Invertir $600",
                    desc: "-$600, +4 edición",
                    action: { dinero: -600, edicion: 4 }
                },
                b: {
                    label: "Aguantar un poco más",
                    desc: "+2 constancia",
                    action: { constancia: 2 }
                }
            },
            {
                id: "community",
                minSubs: 1000,
                title: "Tu comunidad te pide algo diferente",
                text: "Tus seguidores quieren que pruebes un formato que nunca hiciste.",
                a: {
                    label: "Probarlo",
                    desc: "+3 carisma, -1 reputación",
                    action: { carisma: 3, reputacion: -1 }
                },
                b: {
                    label: "Mantener el plan",
                    desc: "+2 constancia, +2 comunidad",
                    action: { constancia: 2, comunidad: 2 }
                }
            },
            {
                id: "controversy",
                minSubs: 10000,
                title: "Un clip tuyo se empezó a discutir",
                text: "El tema está circulando. Podés responder y entrar en la conversación o dejar que se enfríe.",
                a: {
                    label: "Responder públicamente",
                    desc: "+4 fama, -3 reputación",
                    action: { fama: 4, reputacion: -3 }
                },
                b: {
                    label: "No alimentar la discusión",
                    desc: "+3 reputación",
                    action: { reputacion: 3 }
                }
            }
        ];

        const validos = eventos.filter(e => Number(p.suscriptores) >= e.minSubs);
        if (!validos.length) return null;

        const evento = validos[Math.floor(Math.random() * validos.length)];
        this.pendingEvent = JSON.parse(JSON.stringify(evento));

        this.agregarNotificacion({
            tipo: "evento",
            titulo: `⚡ ${evento.title}`,
            descripcion: "Hay una decisión esperando."
        });

        this.guardar();
        return this.pendingEvent;
    },

    resolverEvento(opcion) {
        const evento = this.pendingEvent;
        if (!evento || !evento[opcion]) return false;

        const action = evento[opcion].action || {};
        const p = this.player;

        for (const [key, value] of Object.entries(action)) {
            const amount = Number(value) || 0;

            if (key === "dinero") {
                p.dinero = Math.max(0, Number(p.dinero) + amount);
            } else if (key === "reputacion") {
                p.reputacion = Math.max(0, Math.min(100, Number(p.reputacion) + amount));
            } else if (key === "comunidad") {
                p.comunidad = Math.max(0, Math.min(100, Number(p.comunidad) + amount));
            } else if (key === "fama") {
                p.fama = Math.max(0, Math.min(100, Number(p.fama) + amount));
            } else if (typeof p.atributos?.[key] === "number") {
                p.atributos[key] += amount;
            }
        }

        this.ultimoEventoResultado =
            `${evento.title}: ${evento[opcion].label}. ${evento[opcion].desc}.`;

        this.pendingEvent = null;

        if (opcion === "a" && eventHasPositive(evento[opcion])) {
            p.stats.eventosGanados = (Number(p.stats.eventosGanados) || 0) + 1;
        }

        this.guardar();
        return true;
    },

    // Las marcas aparecen solas. El botón "Contratos" solamente sirve para
    // abrir la bandeja/historial, no para generar ofertas.
    generarOfertaSponsor() {
        const marcas = [
            { id: "local_shop", name: "Tienda Gamer Local", minSubs: 1000, minFama: 0, payMin: 150, payMax: 450, duration: 1, prestige: 1 },
            { id: "redragon", name: "Redragon", minSubs: 5000, minFama: 3, payMin: 400, payMax: 1000, duration: 2, prestige: 2 },
            { id: "logitech", name: "Logitech G", minSubs: 15000, minFama: 8, payMin: 900, payMax: 2200, duration: 2, prestige: 3 },
            { id: "redbull", name: "Red Bull", minSubs: 75000, minFama: 15, payMin: 2500, payMax: 6000, duration: 2, prestige: 5 },
            { id: "adidas", name: "Adidas", minSubs: 300000, minFama: 30, payMin: 8000, payMax: 18000, duration: 2, prestige: 8 },
            { id: "nike", name: "Nike", minSubs: 750000, minFama: 40, payMin: 12000, payMax: 28000, duration: 2, prestige: 10 },
            { id: "cocacola", name: "Coca-Cola", minSubs: 1500000, minFama: 50, payMin: 18000, payMax: 40000, duration: 2, prestige: 12 },
            { id: "apple", name: "Apple", minSubs: 3000000, minFama: 65, payMin: 50000, payMax: 100000, duration: 2, prestige: 15 }
        ];

        const p = this.player;
        if (!p || this.pendingSponsorOffer) return null;

        const yaVistas = new Set((this.sponsors || []).map(s => s.id));

        // Elegimos la marca más alta disponible SOLO entre las que ya puede
        // considerar razonables para su tamaño. Esto evita Nike/Adidas a los 100k.
        const disponibles = marcas
            .filter(m =>
                Number(p.suscriptores) >= m.minSubs &&
                Number(p.fama) >= m.minFama &&
                !yaVistas.has(m.id)
            )
            .sort((a, b) => b.minSubs - a.minSubs);

        if (!disponibles.length) return null;

        // Una oferta puede aparecer después de un resultado; las marcas grandes
        // son más selectivas.
        const marca = disponibles[0];
        const probabilidad =
            marca.minSubs >= 750000 ? 0.60 :
            marca.minSubs >= 300000 ? 0.52 :
            0.68;

        if (Math.random() > probabilidad) return null;

        const oferta = {
            ...marca,
            pago: random(marca.payMin, marca.payMax),
            año: this.time.año,
            trimestre: this.time.trimestre,
            estado: "pendiente"
        };

        this.pendingSponsorOffer = oferta;

        this.agregarNotificacion({
            tipo: "sponsor",
            titulo: `📩 ${marca.name} quiere trabajar con vos`,
            descripcion: "Recibiste una propuesta comercial."
        });

        this.guardar();
        return oferta;
    },

    aceptarSponsor() {
        const oferta = this.pendingSponsorOffer;
        if (!oferta) return false;

        this.player.dinero += Number(oferta.pago) || 0;
        this.player.fama = Math.min(
            100,
            Number(this.player.fama) + Number(oferta.prestige || 0)
        );

        this.player.stats.sponsors =
            (Number(this.player.stats.sponsors) || 0) + 1;

        this.sponsors.push({
            ...oferta,
            estado: "aceptado",
            aceptadoEn: Date.now()
        });

        this.pendingSponsorOffer = null;
        this.guardar();
        return true;
    },

    rechazarSponsor() {
        const oferta = this.pendingSponsorOffer;
        if (!oferta) return false;

        this.sponsors.push({
            ...oferta,
            estado: "rechazado",
            rechazadoEn: Date.now()
        });

        this.pendingSponsorOffer = null;
        this.guardar();
        return true;
    },

    guardar() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                player: this.player,
                time: this.time,
                inventory: this.inventory,
                notifications: this.notifications,
                creators: this.creators,
                trends: this.trends,
                sponsors: this.sponsors,
                pendingSponsorOffer: this.pendingSponsorOffer,
                pendingEvent: this.pendingEvent,
                lastVideo: this.lastVideo,
                lastVideoResult: this.lastVideoResult,
                lastQuarterResult: this.lastQuarterResult,
                lastYearSummary: this.lastYearSummary,
                ultimoEventoResultado: this.ultimoEventoResultado,
                lastCollab: this.lastCollab,
                savedAt: Date.now()
            }));
            return true;
        } catch (error) {
            console.error("❌ Error guardando partida:", error);
            return false;
        }
    },

    cargar() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data.player || data.player.partidaIniciada !== true) return false;

            this.player = data.player;
            this.time = data.time || {
                año: this.player.año || 2026,
                trimestre: this.player.trimestre || 1
            };

            this.inventory = Array.isArray(data.inventory) ? data.inventory : [];
            this.notifications = Array.isArray(data.notifications) ? data.notifications : [];
            this.creators = Array.isArray(data.creators) ? data.creators : crearCreadores();
            this.trends = Array.isArray(data.trends) ? data.trends : [];
            this.sponsors = Array.isArray(data.sponsors) ? data.sponsors : [];

            this.pendingSponsorOffer = data.pendingSponsorOffer || null;
            this.pendingEvent = data.pendingEvent || null;
            this.lastVideo = data.lastVideo || null;
            this.lastVideoResult = data.lastVideoResult || null;
            this.lastQuarterResult = data.lastQuarterResult || null;
            this.lastYearSummary = data.lastYearSummary || null;
            this.ultimoEventoResultado = data.ultimoEventoResultado || null;
            this.lastCollab = data.lastCollab || null;

            normalizarGameState();
            return true;
        } catch (error) {
            console.error("❌ Error cargando partida:", error);
            return false;
        }
    },

    prepararSiguienteAño() {
        if (this.time.trimestre !== 2) return false;

        const añoTerminado = this.time.año;
        const nextYear = añoTerminado + 1;

        if (this.lastYearSummary) {
            this.player.historialAños.push(this.lastYearSummary);
        }

        this.time = { año: nextYear, trimestre: 1 };
        this.player.año = nextYear;
        this.player.trimestre = 1;
        this.player.pretemporada = null;
        this.player.videoSubidoEsteTrimestre = false;
        this.player.ingresosTrimestre = 0;
        this.player.actividadTrimestre = null;
        this.player.historialTrimestre1 = null;
        this.player.historialTrimestre2 = null;
        this.player.yearStartSnapshot = snapshotAño(this.player);

        this.lastQuarterResult = null;
        this.lastYearSummary = null;
        this.pendingSponsorOffer = null;
        this.pendingEvent = null;
        this.ultimoEventoResultado = null;

        this.guardar();
        return true;
    },

    nextQuarter() {
        if (this.time.trimestre >= TRIMESTRES_POR_AÑO) {
            return this.prepararSiguienteAño();
        }

        this.time.trimestre += 1;
        this.player.año = this.time.año;
        this.player.trimestre = this.time.trimestre;
        this.player.videoSubidoEsteTrimestre = false;
        this.player.ingresosTrimestre = 0;
        this.player.actividadTrimestre = null;

        this.guardar();
        return this.time;
    },

    finalizarAño() {
        if (this.time.trimestre !== 2) return null;

        const inicio = this.player.yearStartSnapshot || snapshotAño(this.player);
        const fin = snapshotAño(this.player);

        this.lastYearSummary = {
            año: this.time.año,
            suscriptoresInicio: inicio.suscriptores,
            suscriptoresFin: fin.suscriptores,
            crecimientoSubs: fin.suscriptores - inicio.suscriptores,

            vistasInicio: inicio.vistasTotales,
            vistasFin: fin.vistasTotales,
            vistasGanadas: fin.vistasTotales - inicio.vistasTotales,

            videosInicio: inicio.videosSubidos,
            videosFin: fin.videosSubidos,
            videosPublicados: fin.videosSubidos - inicio.videosSubidos,

            dineroInicio: inicio.dinero,
            dineroFin: fin.dinero,
            dineroGanado: fin.dinero - inicio.dinero,

            famaInicio: inicio.fama,
            famaFin: fin.fama,
            reputacion: fin.reputacion,

            mejorVideo: Number(this.player.stats?.mejorVideo) || 0,
            videosVirales: Number(this.player.stats?.videosVirales) || 0,

            trimestre1: this.player.historialTrimestre1 || null,
            trimestre2: this.player.historialTrimestre2 || null
        };

        this.agregarNotificacion({
            tipo: "año",
            titulo: `📊 Terminó el año ${this.time.año}`,
            descripcion: `Tu canal publicó ${this.lastYearSummary.videosPublicados.toLocaleString()} videos durante la temporada.`
        });

        this.guardar();
        return this.lastYearSummary;
    },

    resetPlayer() {
        this.player = crearPlayer();
        this.time = { año: 2026, trimestre: 1 };
        this.inventory = [];
        this.notifications = [];
        this.trends = [];
        this.sponsors = [];
        this.pendingSponsorOffer = null;
        this.pendingEvent = null;
        this.lastVideo = null;
        this.lastVideoResult = null;
        this.lastQuarterResult = null;
        this.lastYearSummary = null;
        this.ultimoEventoResultado = null;
        this.lastCollab = null;

        try {
            [
                SAVE_KEY,
                "elCreador_save",
                "gameState",
                "elcreador_save",
                "ElCreadorSave"
            ].forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error("❌ Error eliminando partida:", error);
        }

        window.location.hash = "#createChannel";
    }
};

export function normalizarGameState() {
    if (!gameState.player) gameState.player = crearPlayer();

    const p = gameState.player;

    if (typeof p.nombre !== "string") p.nombre = "Creador";
    if (typeof p.canal !== "string") p.canal = "Mi Canal";
    if (typeof p.niche !== "string") p.niche = "Gaming";
    if (typeof p.año !== "number") p.año = 2026;
    if (!Number.isInteger(p.trimestre) || p.trimestre < 1 || p.trimestre > 2) p.trimestre = 1;
    if (typeof p.dinero !== "number") p.dinero = 500;
    if (typeof p.suscriptores !== "number") p.suscriptores = 50;
    if (typeof p.vistasTotales !== "number") p.vistasTotales = 0;
    if (typeof p.videosSubidos !== "number") p.videosSubidos = 0;
    if (typeof p.fama !== "number") p.fama = 0;
    if (typeof p.comunidad !== "number") p.comunidad = 50;
    if (typeof p.reputacion !== "number") p.reputacion = 50;
    if (typeof p.ingresosTrimestre !== "number") p.ingresosTrimestre = 0;
    if (typeof p.videoSubidoEsteTrimestre !== "boolean") p.videoSubidoEsteTrimestre = false;
    if (typeof p.partidaIniciada !== "boolean") p.partidaIniciada = false;

    if (!p.atributos) p.atributos = crearAtributos();
    const atributos = crearAtributos();
    for (const key of Object.keys(atributos)) {
        if (typeof p.atributos[key] !== "number") p.atributos[key] = atributos[key];
    }

    if (!p.stats) p.stats = crearStats();
    const stats = crearStats();
    for (const key of Object.keys(stats)) {
        if (typeof p.stats[key] !== "number") p.stats[key] = stats[key];
    }

    if (!p.equipment) {
        p.equipment = {
            pc: "government_pc",
            camera: "old_phone",
            microphone: "earphones"
        };
    }

    if (!p.relationships) p.relationships = {};
    if (!Array.isArray(p.historialAños)) p.historialAños = [];
    if (!("pretemporada" in p)) p.pretemporada = null;
    if (!("actividadTrimestre" in p)) p.actividadTrimestre = null;
    if (!("historialTrimestre1" in p)) p.historialTrimestre1 = null;
    if (!("historialTrimestre2" in p)) p.historialTrimestre2 = null;
    if (!p.yearStartSnapshot) p.yearStartSnapshot = snapshotAño(p);

    if (!gameState.time) {
        gameState.time = {
            año: p.año,
            trimestre: p.trimestre
        };
    }

    if (typeof gameState.time.año !== "number") gameState.time.año = p.año;
    if (!Number.isInteger(gameState.time.trimestre) || gameState.time.trimestre < 1 || gameState.time.trimestre > 2) {
        gameState.time.trimestre = p.trimestre;
    }

    p.año = gameState.time.año;
    p.trimestre = gameState.time.trimestre;

    if (!Array.isArray(gameState.inventory)) gameState.inventory = [];
    if (!Array.isArray(gameState.notifications)) gameState.notifications = [];
    if (!Array.isArray(gameState.creators)) gameState.creators = crearCreadores();
    if (!Array.isArray(gameState.trends)) gameState.trends = [];
    if (!Array.isArray(gameState.sponsors)) gameState.sponsors = [];
    if (!("pendingSponsorOffer" in gameState)) gameState.pendingSponsorOffer = null;
    if (!("pendingEvent" in gameState)) gameState.pendingEvent = null;
}

normalizarGameState();
