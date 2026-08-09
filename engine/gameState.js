// engine/gameState.js - Estado central del juego
// ÚNICA instancia. Compatible con saveManager.js

import { creatorsIniciales } from "../data/creators.js";

// ============================================================
// UTILIDADES
// ============================================================

function crearId(prefix = "id") {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ============================================================
// ATRIBUTOS
// ============================================================

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

// ============================================================
// STATS
// ============================================================

function crearStats() {
    return {
        mejorVideo: 0,
        videosVirales: 0,
        videosPublicados: 0,
        colaboraciones: 0,
        sponsors: 0,
        eventosGanados: 0
    };
}

// ============================================================
// PLAYER
// ============================================================

function crearPlayer() {
    return {
        nombre: "Creador",
        canal: "Mi Canal",
        niche: "Gaming",
        año: 2026,
        trimestre: 1,
        dinero: 500,
        suscriptores: 0,
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
        inventory: []
    };
}

// ============================================================
// CREADORES
// ============================================================

function crearCreadores() {
    return creatorsIniciales.map(creator => ({ ...creator }));
}

// ============================================================
// GAME STATE - ÚNICA INSTANCIA
// ============================================================

export const gameState = {

    player: crearPlayer(),

    time: {
        año: 2026,
        trimestre: 1
    },

    inventory: [],
    notifications: [],
    creators: crearCreadores(),
    trends: [],
    sponsors: [],
    lastVideo: null,
    lastVideoResult: null,
    ultimoEventoResultado: null,
    lastCollab: null,
    adminMode: false,

    // ====================================================================
    // INICIAR PARTIDA
    // ====================================================================

    iniciarPartida(datos = {}) {

        console.log("🎬 Iniciando nueva partida...");

        this.player = crearPlayer();

        this.player.nombre = String(datos.nombre || "Creador").trim();
        this.player.canal = String(datos.canal || "Mi Canal").trim();
        this.player.niche = datos.niche || "Gaming";

        this.time = { año: 2026, trimestre: 1 };
        this.player.año = 2026;
        this.player.trimestre = 1;

        this.inventory = [];
        this.notifications = [];
        this.trends = [];
        this.sponsors = [];
        this.lastVideo = null;
        this.lastVideoResult = null;
        this.ultimoEventoResultado = null;
        this.lastCollab = null;

        this.creators = crearCreadores();

        // Relaciones iniciales
        this.creators.forEach(creator => {
            if (!this.player.relationships[creator.id]) {
                this.player.relationships[creator.id] = 0;
            }
        });

        this.agregarNotificacion({
            tipo: "sistema",
            titulo: "🎬 Carrera iniciada",
            descripcion: `Bienvenido, ${this.player.nombre}. Tu canal "${this.player.canal}" está listo para comenzar.`
        });

        console.log("✅ Partida creada:", this.player);
        return this.player;
    },

    // ====================================================================
    // MEJORAR ATRIBUTO
    // ====================================================================

    mejorarAtributo(atributo, cantidad) {

        if (!this.player.atributos) {
            this.player.atributos = crearAtributos();
        }

        if (typeof this.player.atributos[atributo] !== "number") {
            this.player.atributos[atributo] = 0;
        }

        this.player.atributos[atributo] += Number(cantidad) || 0;

        if (this.player.atributos[atributo] < 0) {
            this.player.atributos[atributo] = 0;
        }

        return this.player.atributos[atributo];
    },

    // ====================================================================
    // NOTIFICACIONES
    // ====================================================================

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

        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        return notificacion;
    },

    marcarNotificacionLeida(id) {
        const notificacion = this.notifications.find(n => n.id === id);
        if (notificacion) {
            notificacion.leida = true;
        }
    },

    notificacionesNoLeidas() {
        return this.notifications.filter(n => !n.leida).length;
    },

    // ====================================================================
    // AVANZAR TRIMESTRE
    // ====================================================================

    nextQuarter() {
        this.time.trimestre += 1;

        if (this.time.trimestre > 4) {
            this.time.trimestre = 1;
            this.time.año += 1;
        }

        this.player.año = this.time.año;
        this.player.trimestre = this.time.trimestre;
        this.player.ingresosTrimestre = 0;

        return this.time;
    },

    // ====================================================================
    // GUARDAR
    // ====================================================================

    guardar() {
        try {
            const data = {
                player: this.player,
                time: this.time,
                inventory: this.inventory,
                notifications: this.notifications,
                creators: this.creators,
                trends: this.trends,
                sponsors: this.sponsors,
                lastVideo: this.lastVideo,
                lastVideoResult: this.lastVideoResult,
                ultimoEventoResultado: this.ultimoEventoResultado,
                lastCollab: this.lastCollab
            };

            localStorage.setItem(
                "elCreador_saveData",
                JSON.stringify(data)
            );

            console.log("💾 Partida guardada");
            return true;

        } catch (error) {
            console.error("❌ Error guardando partida:", error);
            return false;
        }
    },

    // ====================================================================
    // CARGAR
    // ====================================================================

    cargar() {
        try {
            const raw = localStorage.getItem("elCreador_saveData");

            if (!raw) return false;

            const data = JSON.parse(raw);

            if (data.player) this.player = data.player;
            if (data.time) this.time = data.time;
            if (Array.isArray(data.inventory)) this.inventory = data.inventory;
            if (Array.isArray(data.notifications)) this.notifications = data.notifications;
            if (Array.isArray(data.creators)) this.creators = data.creators;
            if (Array.isArray(data.trends)) this.trends = data.trends;
            if (Array.isArray(data.sponsors)) this.sponsors = data.sponsors;

            this.lastVideo = data.lastVideo || null;
            this.lastVideoResult = data.lastVideoResult || null;
            this.ultimoEventoResultado = data.ultimoEventoResultado || null;
            this.lastCollab = data.lastCollab || null;

            normalizarGameState();

            console.log("💾 Partida cargada");
            return true;

        } catch (error) {
            console.error("❌ Error cargando partida:", error);
            return false;
        }
    },

    // ====================================================================
    // RESET
    // ====================================================================

    resetPlayer() {
        this.player = crearPlayer();
        this.time = { año: 2026, trimestre: 1 };
        this.inventory = [];
        this.notifications = [];
        this.trends = [];
        this.sponsors = [];
        this.lastVideo = null;
        this.lastVideoResult = null;
        this.ultimoEventoResultado = null;
        this.lastCollab = null;
        this.creators = crearCreadores();

        localStorage.removeItem("elCreador_saveData");

        console.log("🔄 Partida reiniciada");
    }
};

// ============================================================
// NORMALIZAR GAME STATE
// ============================================================

export function normalizarGameState() {

    const p = gameState.player;

    if (!p) {
        gameState.player = crearPlayer();
        return;
    }

    // Datos básicos
    if (typeof p.nombre !== "string") p.nombre = "Creador";
    if (typeof p.canal !== "string") p.canal = "Mi Canal";
    if (typeof p.niche !== "string") p.niche = "Gaming";
    if (typeof p.año !== "number") p.año = 2026;
    if (typeof p.trimestre !== "number") p.trimestre = 1;
    if (typeof p.reputacion !== "number") p.reputacion = 50;
    if (typeof p.shopTier !== "number") p.shopTier = 1;
    if (!Array.isArray(p.inventory)) p.inventory = [];

    // Atributos
    if (!p.atributos) p.atributos = crearAtributos();

    const atributosDefault = crearAtributos();
    Object.keys(atributosDefault).forEach(key => {
        if (typeof p.atributos[key] !== "number") {
            p.atributos[key] = atributosDefault[key];
        }
    });

    // Stats
    if (!p.stats) p.stats = crearStats();

    const statsDefault = crearStats();
    Object.keys(statsDefault).forEach(key => {
        if (typeof p.stats[key] !== "number") {
            p.stats[key] = statsDefault[key];
        }
    });

    // Equipment
    if (!p.equipment) {
        p.equipment = {
            pc: "government_pc",
            camera: "old_phone",
            microphone: "earphones"
        };
    }

    // Relationships
    if (!p.relationships) p.relationships = {};

    // Pretemporada
    if (!("pretemporada" in p)) p.pretemporada = null;

    // Arrays globales
    if (!Array.isArray(gameState.inventory)) gameState.inventory = [];
    if (!Array.isArray(gameState.notifications)) gameState.notifications = [];
    if (!Array.isArray(gameState.creators)) gameState.creators = crearCreadores();
    if (!Array.isArray(gameState.trends)) gameState.trends = [];
    if (!Array.isArray(gameState.sponsors)) gameState.sponsors = [];

    // Time
    if (!gameState.time) {
        gameState.time = {
            año: p.año || 2026,
            trimestre: p.trimestre || 1
        };
    }

    return gameState;
}

// Normalizar al cargar el módulo
normalizarGameState();