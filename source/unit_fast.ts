import { Unit } from "./unit";

export class UnitFast extends Unit {
    constructor(args) {
        super({
            ...args,
            name: "fast unit",
            image: "creep_fast",
            slowImage: "creep_fast_slow",
            width: 20,
            height: 10,
            movement_speed: 80,
        });
    }
}
