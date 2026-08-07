import Home from "../screens/home.js";
import CreateChannel from "../screens/createChannel.js";

import { render } from "./router.js";

render(Home());

function loadHome(){

    render(Home());

    document
    .getElementById("newGame")
    .onclick=loadCreateChannel;

}

function loadCreateChannel(){

    render(CreateChannel());

    document
    .getElementById("startCareer")
    .onclick=()=>{

        console.log("Crear jugador");

    };

}

loadHome();
