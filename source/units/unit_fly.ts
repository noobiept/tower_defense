import { Unit, UnitArgs } from "./unit";
import UnitsData from "../../data/units.json";

export class UnitFly extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "flying unit",
            image: "creep_fly",
            slowImage: "creep_fly_slow",
            width: 20,
            height: 10,
            ...UnitsData.UnitFly,
        });
    }

    setup(args: UnitArgs) {
        // air units fly directly to the destination
        this.destination_column = args.destination_column;
        this.destination_line = args.destination_line;
    }

    /**
     * Air units simply move directly to the destination.
     */
    checkNextDestination() {
        // we reached the destination
        if (
            this.destination_column === this.column &&
            this.destination_line === this.line
        ) {
            this.remove();
            this.onReachDestination();
        } else {
            this.move({
                column: this.destination_column,
                line: this.destination_line,
            });
        }
    }
}
