import { Unit, UnitArgs } from "./unit";
import UnitsData from "../../data/units.json";

export class UnitFast extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "fast unit",
            image: "creep_fast",
            slowImage: "creep_fast_slow",
            width: 20,
            height: 10,
            ...UnitsData.UnitFast,
        });
    }
}
