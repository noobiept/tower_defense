import { Unit, UnitArgs } from "./unit";

export interface UnitFastArgs extends UnitArgs {}

export class UnitFast extends Unit {
    constructor(args: UnitFastArgs) {
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
