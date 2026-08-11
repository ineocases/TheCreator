// engine/gameState.js
// Estado central de El Creador.
// ÚNICA instancia del estado del juego.

import { creatorsIniciales } from "../data/creators.js";

// ============================================================
// UTILIDADES
// ============================================================

function crearId(prefix = "id") {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
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
// EQUIPMENT
// ============================================================

function crearEquipment() {
    return {
        pc: "government_pc",
        camera: "old_phone",
        microphone: "earphones"
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

        equipment: crearEquipment(),

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
    return creatorsIniciales.map(creator => ({
        ...creator
    }));
}

// ============================================================
// GAME STATE
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

    // ========================================================
    // INICIAR PARTIDA
    // ========================================================

    iniciarPartida(datos = {}) {

        console.log("🎬 Iniciando nueva partida...");

        // Crear jugador completamente nuevo
        this.player = crearPlayer();

        // Datos elegidos por el usuario
        this.player.nombre =
            String(datos.nombre || "Creador").trim();

        this.player.canal =
            String(datos.canal || "Mi Canal").trim();

        this.player.niche =
            String(datos.niche || "Gaming").trim();

        // Tiempo inicial
        this.time = {
            año: 2026,
            trimestre: 1
        };

        this.player.año = 2026;
        this.player.trimestre = 1;

        // Limpiar sistemas de partida anterior
        this.inventory = [];
        this.notifications = [];
        this.trends = [];
        this.sponsors = [];

        this.lastVideo = null;
        this.lastVideoResult = null;
        this.ultimoEventoResultado = null;
        this.lastCollab = null;

        // Restaurar creadores
        this.creators = crearCreadores();

        // Crear relaciones iniciales
        this.player.relationships = {};

        this.creators.forEach(creator => {
            this.player.relationships[creator.id] = 0;
        });

        // Notificación inicial
        this.agregarNotificacion({
            tipo: "sistema",
            titulo: "🎬 Carrera iniciada",
            descripcion:
                `Bienvenido, ${this.player.nombre}. ` +
                `Tu canal "${this.player.canal}" está listo para comenzar.`
        });

        console.log(
            "✅ Nueva partida creada:",
            this.player
        );

        return this.player;
    },

    // ========================================================
    // MEJORAR ATRIBUTO
    // ========================================================

    mejorarAtributo(atributo, cantidad) {

        if (!this.player.atributos) {
            this.player.atributos = crearAtributos();
        }

        if (
            typeof this.player.atributos[atributo] !==
            "number"
        ) {
            this.player.atributos[atributo] = 0;
        }

        const puntos =
            Number(cantidad) || 0;

        this.player.atributos[atributo] += puntos;

        if (
            this.player.atributos[atributo] < 0
        ) {
            this.player.atributos[atributo] = 0;
        }

        return this.player.atributos[atributo];
    },

    // ========================================================
    // NOTIFICACIONES
    // ========================================================

    agregarNotificacion(data = {}) {

        const notificacion = {

            id: crearId("notification"),

            tipo:
                data.tipo ||
                "general",

            titulo:
                data.titulo ||
                "Nueva notificación",

            descripcion:
                data.descripcion ||
                "",

            leida: false,

            fecha: Date.now(),

            ...data
        };

        this.notifications.unshift(
            notificacion
        );

        // Máximo 50
        if (
            this.notifications.length > 50
        ) {
            this.notifications =
                this.notifications.slice(0, 50);
        }

        return notificacion;
    },

    // ========================================================
    // MARCAR NOTIFICACIÓN
    // ========================================================

    marcarNotificacionLeida(id) {

        const notificacion =
            this.notifications.find(
                n => n.id === id
            );

        if (notificacion) {
            notificacion.leida = true;
        }
    },

    // ========================================================
    // CONTAR NOTIFICACIONES
    // ========================================================

    notificacionesNoLeidas() {

        return this.notifications.filter(
            n => !n.leida
        ).length;
    },

    // ========================================================
    // AVANZAR TRIMESTRE
    // ========================================================

    nextQuarter() {

        this.time.trimestre += 1;

        if (
            this.time.trimestre > 4
        ) {
            this.time.trimestre = 1;
            this.time.año += 1;

            // Una nueva temporada anual
            this.player.pretemporada = null;
        }

        this.player.año =
            this.time.año;

        this.player.trimestre =
            this.time.trimestre;

        this.player.ingresosTrimestre = 0;

        return this.time;
    },

    // ========================================================
    // GUARDAR
    // ========================================================

    guardar() {

        try {

            const data = {

                version: 1,

                player: this.player,

                time: this.time,

                inventory: this.inventory,

                notifications:
                    this.notifications,

                creators:
                    this.creators,

                trends:
                    this.trends,

                sponsors:
                    this.sponsors,

                lastVideo:
                    this.lastVideo,

                lastVideoResult:
                    this.lastVideoResult,

                ultimoEventoResultado:
                    this.ultimoEventoResultado,

                lastCollab:
                    this.lastCollab,

                savedAt:
                    Date.now()
            };

            localStorage.setItem(
                "elCreador_saveData",
                JSON.stringify(data)
            );

            console.log(
                "💾 Partida guardada correctamente."
            );

            return true;

        } catch (error) {

            console.error(
                "❌ Error guardando partida:",
                error
            );

            return false;
        }
    },

    // ========================================================
    // CARGAR
    // ========================================================

    cargar() {

        try {

            const raw =
                localStorage.getItem(
                    "elCreador_saveData"
                );

            if (!raw) {
                return false;
            }

            const data =
                JSON.parse(raw);

            if (data.player) {
                this.player =
                    data.player;
            }

            if (data.time) {
                this.time =
                    data.time;
            }

            if (
                Array.isArray(
                    data.inventory
                )
            ) {
                this.inventory =
                    data.inventory;
            }

            if (
                Array.isArray(
                    data.notifications
                )
            ) {
                this.notifications =
                    data.notifications;
            }

            if (
                Array.isArray(
                    data.creators
                )
            ) {
                this.creators =
                    data.creators;
            }

            if (
                Array.isArray(
                    data.trends
                )
            ) {
                this.trends =
                    data.trends;
            }

            if (
                Array.isArray(
                    data.sponsors
                )
            ) {
                this.sponsors =
                    data.sponsors;
            }

            this.lastVideo =
                data.lastVideo || null;

            this.lastVideoResult =
                data.lastVideoResult || null;

            this.ultimoEventoResultado =
                data.ultimoEventoResultado || null;

            this.lastCollab =
                data.lastCollab || null;

            normalizarGameState();

            console.log(
                "📂 Partida cargada correctamente."
            );

            return true;

        } catch (error) {

            console.error(
                "❌ Error cargando partida:",
                error
            );

            return false;
        }
    },

    // ========================================================
    // RESET
    // ========================================================

    resetPlayer() {

        this.player =
            crearPlayer();

        this.time = {
            año: 2026,
            trimestre: 1
        };

        this.inventory = [];

        this.notifications = [];

        this.trends = [];

        this.sponsors = [];

        this.lastVideo = null;

        this.lastVideoResult = null;

        this.ultimoEventoResultado = null;

        this.lastCollab = null;

        this.creators =
            crearCreadores();

        localStorage.removeItem(
            "elCreador_saveData"
        );

        console.log(
            "🔄 Partida reiniciada."
        );
    }
};

// ============================================================
// NORMALIZAR GAME STATE
// ============================================================

export function normalizarGameState() {

    if (!gameState.player) {
        gameState.player =
            crearPlayer();
    }

    const p =
        gameState.player;

    // --------------------------------------------------------
    // DATOS BÁSICOS
    // --------------------------------------------------------

    if (
        typeof p.nombre !== "string"
    ) {
        p.nombre = "Creador";
    }

    if (
        typeof p.canal !== "string"
    ) {
        p.canal = "Mi Canal";
    }

    if (
        typeof p.niche !== "string"
    ) {
        p.niche = "Gaming";
    }

    if (
        typeof p.año !== "number"
    ) {
        p.año = 2026;
    }

    if (
        typeof p.trimestre !== "number"
    ) {
        p.trimestre = 1;
    }

    if (
        typeof p.dinero !== "number"
    ) {
        p.dinero = 500;
    }

    if (
        typeof p.suscriptores !== "number"
    ) {
        p.suscriptores = 0;
    }

    if (
        typeof p.vistasTotales !== "number"
    ) {
        p.vistasTotales = 0;
    }

    if (
        typeof p.videosSubidos !== "number"
    ) {
        p.videosSubidos = 0;
    }

    if (
        typeof p.fama !== "number"
    ) {
        p.fama = 0;
    }

    if (
        typeof p.comunidad !== "number"
    ) {
        p.comunidad = 50;
    }

    if (
        typeof p.reputacion !== "number"
    ) {
        p.reputacion = 50;
    }

    if (
        typeof p.ingresosTrimestre !==
        "number"
    ) {
        p.ingresosTrimestre = 0;
    }

    if (
        typeof p.shopTier !== "number"
    ) {
        p.shopTier = 1;
    }

    // --------------------------------------------------------
    // ATRIBUTOS
    // --------------------------------------------------------

    if (!p.atributos) {
        p.atributos =
            crearAtributos();
    }

    const atributosDefault =
        crearAtributos();

    Object.keys(
        atributosDefault
    ).forEach(key => {

        if (
            typeof p.atributos[key] !==
            "number"
        ) {
            p.atributos[key] =
                atributosDefault[key];
        }
    });

    // --------------------------------------------------------
    // STATS
    // --------------------------------------------------------

    if (!p.stats) {
        p.stats =
            crearStats();
    }

    const statsDefault =
        crearStats();

    Object.keys(
        statsDefault
    ).forEach(key => {

        if (
            typeof p.stats[key] !==
            "number"
        ) {
            p.stats[key] =
                statsDefault[key];
        }
    });

    // --------------------------------------------------------
    // EQUIPMENT
    // --------------------------------------------------------

    if (!p.equipment) {
        p.equipment =
            crearEquipment();
    } else {

        if (!p.equipment.pc) {
            p.equipment.pc =
                "government_pc";
        }

        if (!p.equipment.camera) {
            p.equipment.camera =
                "old_phone";
        }

        if (!p.equipment.microphone) {
            p.equipment.microphone =
                "earphones";
        }
    }

    // --------------------------------------------------------
    // RELACIONES
    // --------------------------------------------------------

    if (!p.relationships) {
        p.relationships = {};
    }

    // --------------------------------------------------------
    // PRETEMPORADA
    // --------------------------------------------------------

    if (
        !Object.prototype.hasOwnProperty.call(
            p,
            "pretemporada"
        )
    ) {
        p.pretemporada = null;
    }

    // --------------------------------------------------------
    // INVENTARIO DEL PLAYER
    // --------------------------------------------------------

    if (
        !Array.isArray(p.inventory)
    ) {
        p.inventory = [];
    }

    // --------------------------------------------------------
    // ARRAYS GLOBALES
    // --------------------------------------------------------

    if (
        !Array.isArray(
            gameState.inventory
        )
    ) {
        gameState.inventory = [];
    }

    if (
        !Array.isArray(
            gameState.notifications
        )
    ) {
        gameState.notifications = [];
    }

    if (
        !Array.isArray(
            gameState.creators
        )
    ) {
        gameState.creators =
            crearCreadores();
    }

    if (
        !Array.isArray(
            gameState.trends
        )
    ) {
        gameState.trends = [];
    }

    if (
        !Array.isArray(
            gameState.sponsors
        )
    ) {
        gameState.sponsors = [];
    }

    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

    if (!gameState.time) {

        gameState.time = {
            año: p.año || 2026,
            trimestre:
                p.trimestre || 1
        };

    } else {

        if (
            typeof gameState.time.año !==
            "number"
        ) {
            gameState.time.año =
                p.año || 2026;
        }

        if (
            typeof gameState.time.trimestre !==
            "number"
        ) {
            gameState.time.trimestre =
                p.trimestre || 1;
        }
    }

    // Sincronizar player con time
    p.año =
        gameState.time.año;

    p.trimestre =
        gameState.time.trimestre;

    // --------------------------------------------------------
    // RELACIONES CON CREADORES
    // --------------------------------------------------------

    gameState.creators.forEach(
        creator => {

            if (
                creator &&
                creator.id &&
                typeof p.relationships[
                    creator.id
                ] !== "number"
            ) {
                p.relationships[
                    creator.id
                ] = 0;
            }
        }
    );

    return gameState;
}

// ============================================================
// NORMALIZAR AL CARGAR EL MÓDULO
// ============================================================

normalizarGameState();
