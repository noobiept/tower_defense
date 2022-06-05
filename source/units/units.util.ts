import { CanvasPosition, GridPosition } from "../types";
import { Unit, UnitArgs } from "./unit";
import { UnitFast } from "./unit_fast";
import { UnitFly } from "./unit_fly";
import { UnitGroup } from "./unit_group";
import { UnitImmune } from "./unit_immune";
import { UnitSpawn } from "./unit_spawn";

export interface CreateUnitArgs {
    column: number;
    line: number;
    wave: any; //TODO
    lane: any; //TODO
    size: number;
    lane_id: number;
    onReachDestination: () => void;
    onUnitRemoved: () => void;
    onUnitKilled: () => void;
    getNextDestination: (unit: Unit) => GridPosition;
    toCanvasPosition: (position: GridPosition) => CanvasPosition;
    canvasToGrid: (position: CanvasPosition) => GridPosition;
    getAvailablePositions: (
        column: number,
        line: number,
        range: number
    ) => GridPosition[];
}

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

export function createUnit({
    lane,
    wave,
    canvasToGrid,
    getAvailablePositions,
    size,
    ...args
}: CreateUnitArgs) {
    const unitArgs: UnitArgs = {
        size,
        width: size,
        height: size,
        destination_column: lane.end.column,
        destination_line: lane.end.line,
        health: wave.health,
        health_regeneration: wave.health_regeneration,
        gold: wave.gold,
        score: wave.score,
        ...args,
    };
    let removeWave = false;
    const unitClass = mapUnitType(wave.type);

    // the group units work a bit differently //TODO
    // they are added all at the same time (instead of one at a time)
    if (unitClass === UnitGroup) {
        removeWave = true;

        new unitClass({
            ...unitArgs,
            lane,
            howMany: wave.howMany,
        });
    } else if (unitClass === UnitSpawn) {
        new unitClass({
            ...unitArgs,
            canvasToGrid,
            getAvailablePositions,
        });
    } else {
        new unitClass(unitArgs);
    }

    return removeWave;
}
