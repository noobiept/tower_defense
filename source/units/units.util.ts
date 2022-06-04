import { Unit } from "./unit";
import { UnitFast } from "./unit_fast";
import { UnitFly } from "./unit_fly";
import { UnitGroup } from "./unit_group";
import { UnitImmune } from "./unit_immune";
import { UnitSpawn } from "./unit_spawn";

const UNITS_MAP = {
    Unit: Unit,
    UnitFast: UnitFast,
    UnitFly: UnitFly,
    UnitGroup: UnitGroup,
    UnitImmune: UnitImmune,
    UnitSpawn: UnitSpawn,
};

export function mapUnitType(type: string) {
    return UNITS_MAP[type];
}
