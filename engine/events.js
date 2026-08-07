import commonEvents from "../data/events/common.js";

import { random } from "./random.js";

export function rollEvent(){

    return commonEvents[
        random(0,commonEvents.length-1)
    ];

}
