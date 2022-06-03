import { Unit } from "./unit";

export function UnitImmune(args) {
    this.name = "immune unit";
    this.image = "creep_immune";
    this.is_immune = true;
    this.movement_speed = 50;

    Unit.call(this, args);
}

Utilities.inheritPrototype(UnitImmune, Unit);
