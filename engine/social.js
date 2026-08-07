export function addNotification(game,title,text){

    game.notifications.unshift({

        id:Date.now(),

        title,

        text,

        read:false

    });

}
