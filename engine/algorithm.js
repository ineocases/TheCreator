import { random, chance } from "./random.js";

export function calculateVideo(player, video) {

    // Base del video
    let views = random(video.minViews, video.maxViews);

    // Calidad del creador
    views += player.quality * random(15, 30);

    // Creatividad
    views += player.creativity * random(10, 25);

    // Bonus por reputación
    views += player.reputation * 20;

    // Canales chicos tienen un techo
    let maxReach = 3000;

    if(player.subscribers > 500)
        maxReach = 8000;

    if(player.subscribers > 2000)
        maxReach = 25000;

    if(player.subscribers > 10000)
        maxReach = 120000;

    if(player.subscribers > 100000)
        maxReach = 1000000;

    let message = "Tu comunidad respondió normalmente.";

    // Buen rendimiento
    if(chance(15)){

        views *= random(2,4);

        message = "📈 YouTube empezó a recomendar tu video.";

    }

    // Viral
    if(chance(video.viralChance)){

        views *= random(4,12);

        message = "🔥 Tu video se volvió viral.";

    }

    // Fenómeno (ultra raro)
    if(chance(0.02)){

        views *= random(30,120);

        message = "🌎 ¡Todo internet está hablando de tu video!";

    }

    // Aplicar techo
    views = Math.min(Math.floor(views), maxReach);

    const subscribers = Math.max(
        1,
        Math.floor(
            views / random(18,35)
        )
    );

    const money = Math.floor(
        views * random(15,40) / 10000
    );

    return{

        views,
        subscribers,
        money,
        message

    };

}
