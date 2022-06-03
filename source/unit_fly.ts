import { Unit } from "./unit";
import { Game } from "./game";

export class UnitFly extends Unit {
    private final_column: number;
    private final_line: number;

    constructor(args) {
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
            Game.updateLife(-1);
        } else {
            this.move({ column: this.final_column, line: this.final_line });
        }
    }
}
