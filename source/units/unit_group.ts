import { getRandomInt } from "@drk4/utilities";
import { Unit } from "./unit";

export class UnitGroup {
    constructor(args) {
        var a;
        var lane = args.lane;
        var halfLength = Math.floor(lane.length / 2);

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
    constructor(args) {
        super({
            ...args,
            name: "group unit",
            image: "creep_group",
            movement_speed: 50,
        });
    }
}
