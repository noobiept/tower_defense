import { Unit } from "./unit";

export function UnitFly(args) {
    this.name = "flying unit";
    this.image = "creep_fly";
    this.slowImage = "creep_fly_slow";
    this.width = 20;
    this.height = 10;
    this.is_ground_unit = false;
    this.movement_speed = 40;

    // air units fly directly to the destination
    this.final_column = args.destination_column;
    this.final_line = args.destination_line;

    Unit.call(this, args);
}

Utilities.inheritPrototype(UnitFly, Unit);

/**
 * Air units simply move directly to the destination.
 */
UnitFly.prototype.checkNextDestination = function () {
    // we reached the destination
    if (this.final_column === this.column && this.final_line === this.line) {
        this.remove();
        Game.updateLife(-1);
    } else {
        this.move({ column: this.final_column, line: this.final_line });
    }
};
