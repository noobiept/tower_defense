import { Unit, UnitArgs } from "./unit";

export class UnitImmune extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "immune unit",
            image: "creep_immune",
            is_immune: true,
            movement_speed: 50,
        });
    }
}
