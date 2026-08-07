export function createPlayer(data){

    return{

        channel:data.channel,

        age:Number(data.age),

        country:data.country,

        niche:data.niche,

        year:2026,

        quarter:1,

        videosLeft:3,

        subscribers:0,

        views:0,

        money:0,

        reputation:0,

        fame:0,

        creativity:50,

        quality:20,

        burnout:0,

        inventory:[],

        sponsors:[],

        awards:[]

    };

}
