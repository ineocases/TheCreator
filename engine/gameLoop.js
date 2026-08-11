// engine/gameLoop.js
// Compatibilidad con el prototipo anterior. La progresión real la controla gameState + router.
import { gameState } from "./gameState.js";

const gameLoop = {
    startQuarter() {
        console.log(`🌱 Iniciando ${gameState.time.año} · T${gameState.time.trimestre}`);
        return gameState.time;
    },
    advanceToNextQuarter() {
        return gameState.nextQuarter();
    }
};

export default gameLoop;
