import { Unit, UnitArgs } from "./unit";

export class UnitFly extends Unit {
    private final_column = 0;
    private final_line = 0;

    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "flying unit",
            image: "creep_fly",
            slowImage: "creep_fly_slow",
            width: 20,
            height: 10,
            is_ground_unit: false,
            movement_speed: 40,
        });
    }

    setup(args: UnitArgs): void {
        // air units fly directly to the destination
        this.final_column = args.destination_column;
        this.final_line = args.destination_line;
    }

    /**
     * Air units simply move directly to the destination.
     */
    checkNextDestination() {
        // we reached the destination
        if (
            this.final_column === this.column &&
            this.final_line === this.line
        ) {
            this.remove();
            this.onReachDestination();
        } else {
            this.move({ column: this.final_column, line: this.final_line });
        }
    }
}
