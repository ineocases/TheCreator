let game = {

    player: null,

    currentScreen: "home",

    currentYear: 2026,

    currentMonth: 1,

    notifications: [],

    world: {}

};

export function getGame() {

    return game;

}

export function setPlayer(player) {

    game.player = player;

}

export function changeScreen(screen) {

    game.currentScreen = screen;

}
