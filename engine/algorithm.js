export function calculateVideo(player, video) {

    // Calidad del creador
    const qualityBonus = player.quality * 25;

    // Creatividad
    const creativityBonus = player.creativity * 18;

    // Suerte
    const luck = Math.floor(Math.random() * 3000);

    // Tendencia
    const trend = Math.floor(Math.random() * 2000);

    // Viral
    let viralMultiplier = 1;
    let viralText = "";

    if (Math.random() * 100 < video.viralChance) {

        viralMultiplier = Math.floor(Math.random() * 8) + 3;

        viralText = "🔥 ¡El algoritmo recomendó tu video!";

    }

    let views = (
        video.minViews +
        qualityBonus +
        creativityBonus +
        luck +
        trend
    ) * viralMultiplier;

    views = Math.floor(views);

    const subscribers = Math.floor(
        views / (18 + Math.random() * 20)
    );

    const money = Math.floor(
        views * 0.0025
    );

    return {

        views,

        subscribers,

        money,

        viralText

    };

}
