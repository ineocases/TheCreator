// engine/worldSimulation.js
// Simula el mundo al cerrar cada trimestre. El jugador no es el único que progresa:
// otros creadores publican, ganan seguidores, se vuelven virales, consiguen sponsors
// y generan noticias que pueden aparecer en el feed del juego.

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function ensureWorld(creator) {
    if (!creator.mundo) {
        creator.mundo = {
            videos: 0,
            vistas: 0,
            nuevosSeguidores: 0,
            virales: 0,
            clips: 0,
            enojos: 0,
            temporadas: 0,
            año: null
        };
    }
    return creator.mundo;
}

export function simulateWorld(game) {
    const creators = Array.isArray(game?.creators) ? game.creators : [];
    const news = [];

    creators.forEach(creator => {
        if (creator.activo === false) return;

        const mundo = ensureWorld(creator);
        const añoActual = Number(game.time?.año) || 2026;
        if (mundo.año !== añoActual) {
            mundo.videos = 0;
            mundo.vistas = 0;
            mundo.nuevosSeguidores = 0;
            mundo.virales = 0;
            mundo.clips = 0;
            mundo.enojos = 0;
            mundo.temporadas = 0;
            mundo.año = añoActual;
        }
        const seguidoresAntes = Math.max(1, Number(creator.seguidores) || 1);
        const base = Number(creator.crecimientoBase) || 0.025;
        const popularidad = Math.max(0, Math.min(100, Number(creator.popularidad) || 50));

        // Los grandes crecen más en términos absolutos, pero no necesariamente
        // en porcentaje. El azar evita que todos progresen igual.
        const crecimientoPct = Math.max(
            0.004,
            base * randomFloat(0.65, 1.45) + (popularidad / 10000) * randomFloat(0.15, 0.55)
        );

        const videos = random(30, 150);
        const promedioVistas = Math.max(
            250,
            seguidoresAntes * randomFloat(0.045, 0.22) * (0.65 + popularidad / 160)
        );
        const vistas = Math.max(0, Math.round(videos * promedioVistas * randomFloat(0.70, 1.30)));

        const viralChance = Math.min(0.22, 0.035 + popularidad / 900 + (creator.mundo?.virales || 0) / 5000);
        const virales = Math.random() < viralChance ? random(1, 3) : 0;
        const clips = Math.max(0, Math.round(vistas / Math.max(10000, seguidoresAntes * 0.20)) + (virales ? random(1, 3) : 0));

        let nuevosSeguidores = Math.round(seguidoresAntes * crecimientoPct);
        nuevosSeguidores += Math.round(vistas * randomFloat(0.00025, 0.0011));
        if (virales) nuevosSeguidores += Math.round(seguidoresAntes * randomFloat(0.002, 0.018) * virales);

        nuevosSeguidores = Math.max(1, nuevosSeguidores);
        creator.seguidores = seguidoresAntes + nuevosSeguidores;
        creator.popularidad = Math.max(0, Math.min(100, popularidad + randomFloat(-0.8, 1.2) + (virales ? 0.8 : 0)));

        mundo.videos += videos;
        mundo.vistas += vistas;
        mundo.nuevosSeguidores += nuevosSeguidores;
        mundo.virales += virales;
        mundo.clips += clips;
        mundo.temporadas += 1;

        // Una polémica ocasional baja respeto, pero también genera conversación.
        if (Math.random() < Math.min(0.12, 0.015 + popularidad / 1800)) {
            mundo.enojos += 1;
            creator.popularidad = Math.max(0, creator.popularidad - randomFloat(0.3, 1.1));
            news.push({
                type: "drama",
                creatorId: creator.id,
                creator: creator.nombre,
                text: `⚠️ ${creator.nombre} quedó envuelto en una polémica.`
            });
        }

        if (virales > 0) {
            news.push({
                type: "viral",
                creatorId: creator.id,
                creator: creator.nombre,
                text: `🔥 ${creator.nombre} tuvo ${virales} momento${virales > 1 ? "s" : ""} viral${virales > 1 ? "es" : ""}.`
            });
        }

        if (Math.random() < Math.min(0.15, 0.015 + creator.seguidores / 50000000)) {
            news.push({
                type: "sponsor",
                creatorId: creator.id,
                creator: creator.nombre,
                text: `💼 ${creator.nombre} consiguió una nueva oportunidad comercial.`
            });
        }
    });

    // Guardamos solamente unas pocas noticias para no llenar el feed.
    game.worldNews = news.slice(-8);
    return news;
}

export default { simulateWorld };
