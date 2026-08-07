export function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

export function chance(percent) {

    return Math.random() * 100 < percent;

}
