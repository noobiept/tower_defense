import { CanvasPosition, GridPosition, Lane, Wave } from "../types";
import { Unit, UnitArgs } from "./unit";
import { UnitFast } from "./unit_fast";
import { UnitFly } from "./unit_fly";
import { UnitGroup } from "./unit_group";
import { UnitImmune } from "./unit_immune";
import { UnitSpawn } from "./unit_spawn";

export interface CreateUnitArgs {
    column: number;
    line: number;
    wave: Wave;
    lane: Lane;
    size: number;
    lane_id: number;
    onReachDestination: () => void;
    onUnitRemoved: (unit: Unit) => void;
    onUnitKilled: (unit: Unit) => void;
    getNextDestination: (unit: Unit) => GridPosition | undefined;
    toCanvasPosition: (position: GridPosition) => CanvasPosition;
    canvasToGrid: (position: CanvasPosition) => GridPosition;
    getAvailablePositions: (
        column: number,
        line: number,
        range: number
    ) => GridPosition[];
}

const UNITS_MAP = {
    Unit: { type: "Unit", class: Unit },
    UnitFast: { type: "UnitFast", class: UnitFast },
    UnitFly: { type: "UnitFly", class: UnitFly },
    UnitGroup: { type: "UnitGroup", class: UnitGroup },
    UnitImmune: { type: "UnitImmune", class: UnitImmune },
    UnitSpawn: { type: "UnitSpawn", class: UnitSpawn },
} as const;
export type UnitKey = keyof typeof UNITS_MAP;

function mapUnitType(type: UnitKey) {
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
    const type = wave.type;
    const unitInfo = mapUnitType(type);

    switch (unitInfo.type) {
        // the group units work a bit differently //TODO
        // they are added all at the same time (instead of one at a time)
        case "UnitGroup":
            removeWave = true;

            new unitInfo.class({
                ...unitArgs,
                lane,
                howMany: wave.howMany,
            });
            break;

        case "UnitSpawn":
            new unitInfo.class({
                ...unitArgs,
                canvasToGrid,
                getAvailablePositions,
            });
            break;

        default:
            new unitInfo.class(unitArgs);
            break;
    }

    return removeWave;
}
