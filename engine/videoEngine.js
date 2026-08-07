export function publish(player,video){

    const views=Math.floor(

        Math.random()*(video.maxViews-video.minViews)

        +video.minViews

    );

    const subscribers=Math.floor(

        views/18

    );

    const money=Math.floor(

        views*0.003

    );

    player.views+=views;

    player.subscribers+=subscribers;

    player.money+=money;

    player.videos++;

    return{

        views,

        subscribers,

        money

    };

}
