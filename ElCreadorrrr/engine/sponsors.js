// engine/sponsors.js
// Compatibilidad con sistemas antiguos. La lógica real de ofertas vive en gameState.
import { gameState } from "./gameState.js";

export function rollSponsor() {
    return gameState.generarOfertaSponsor();
}

export function aceptarSponsor() {
    return gameState.aceptarSponsor();
}

export function rechazarSponsor() {
    return gameState.rechazarSponsor();
}
