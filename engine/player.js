export function createPlayer(data) {

    return {

        // Información básica
        channel: data.channel,
        age: Number(data.age),
        country: data.country,
        niche: data.niche,

        // Carrera
        year: 2026,

        // Estadísticas
        subscribers: 0,
        views: 0,
        money: 0,

        reputation: 0,
        creativity: 50,
        quality: 20,
        burnout: 0,

        // Historial
        videos: 0,
        sponsors: [],
        inventory: [],
        awards: [],

        // Configuración
        unlockedPlatforms: [
            "YouTube"
        ]

    };

}
