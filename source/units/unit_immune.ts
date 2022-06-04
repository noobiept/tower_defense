import { Unit } from "./unit";

export class UnitImmune extends Unit {
    constructor(args) {
        super({
            ...args,
            name: "immune unit",
            image: "creep_immune",
            is_immune: true,
            movement_speed: 50,
        });
    }
}
