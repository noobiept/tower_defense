import { Unit, UnitArgs } from "./unit";
import UnitsData from "../../data/units.json";

export class UnitImmune extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "immune unit",
            image: "creep_immune",
            ...UnitsData.UnitImmune,
        });
    }
}
