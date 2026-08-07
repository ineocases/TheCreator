export function getQuarterName(quarter){

    switch(quarter){

        case 1:
            return "Enero - Marzo";

        case 2:
            return "Abril - Junio";

        case 3:
            return "Julio - Septiembre";

        case 4:
            return "Octubre - Diciembre";

    }

}

export function nextQuarter(player){

    player.quarter++;

    player.videosLeft=3;

    if(player.quarter>4){

        player.quarter=1;

        player.year++;

    }

}
