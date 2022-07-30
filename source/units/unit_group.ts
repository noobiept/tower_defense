import { getRandomInt } from "@drk4/utilities";
import { Lane } from "../types";
import { Unit, UnitArgs } from "./unit";
import UnitsData from "../../data/units.json";

interface UnitGroupArgs extends UnitArgs {
    lane: Lane;
    howMany: number;
}

export class UnitGroup {
    constructor(args: UnitGroupArgs) {
        let a;
        const lane = args.lane;
        const halfLength = Math.floor(lane.length / 2);

        // add units randomly in the start zone
        if (lane.orientation == "horizontal") {
            for (a = 0; a < args.howMany; a++) {
                args.line = getRandomInt(
                    lane.start.line - halfLength,
                    lane.start.line + halfLength - 1
                );

                new UnitGroup1(args);
            }
        } else {
            for (a = 0; a < args.howMany; a++) {
                args.column = getRandomInt(
                    lane.start.column - halfLength,
                    lane.start.column + halfLength - 1
                );

                new UnitGroup1(args);
            }
        }
    }
}

class UnitGroup1 extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "group unit",
            image: "creep_group",
            ...UnitsData.UnitGroup,
        });
    }
}
