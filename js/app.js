import Home from "../screens/home.js";
import CreateChannel from "../screens/createChannel.js";
import Dashboard from "../screens/dashboard.js";

import { render } from "./router.js";

import { createPlayer } from "../engine/player.js";
import { saveGame } from "../engine/save.js";

let player = null;

loadHome();

function loadHome(){

    render(Home());

    document
        .getElementById("newGame")
        .onclick = loadCreateChannel;

}

function loadCreateChannel(){

    render(CreateChannel());

    document
        .getElementById("startCareer")
        .onclick = () => {

            player = createPlayer({

                channel: document.getElementById("channelName").value || "Mi Canal",

                age: document.getElementById("age").value,

                country: document.getElementById("country").value,

                niche: document.getElementById("niche").value

            });

            saveGame(player);

            loadDashboard();

        };

}

function loadDashboard(){

    render(Dashboard(player));

    document
        .getElementById("publishVideo")
        .onclick = ()=>{

            alert("En el próximo paso publicaremos el primer video 🚀");

        };

}
