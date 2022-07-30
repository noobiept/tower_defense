import { UnitKey } from "./units/unit.util";

export interface CanvasPosition {
    x: number;
    y: number;
}

export interface GridPosition {
    column: number;
    line: number;
}

export interface Wave {
    type:
        | "Unit"
        | "UnitFast"
        | "UnitFly"
        | "UnitGroup"
        | "UnitImmune"
        | "UnitSpawn";
    howMany: number;
    health: number;
    health_regeneration: number;
    gold: number;
    score: number;
    count: 0;
    spawnInterval: number;
}

export interface Lane {
    start: GridPosition;
    end: GridPosition;
    length: number;
    orientation: "horizontal" | "vertical";
}

export interface MapUnitData {
    wave_count_initial: number;
    wave_count_increase_rate: number;
    health_initial: number;
    health_increase_rate: number;
    health_regeneration_initial: number;
    health_regeneration_increase_rate: number;
    gold_initial: number;
    gold_increase_rate: number;
    score_initial: number;
    score_increase_rate: number;
    spawnInterval: number;
}

interface MapObstaclesData {
    startColumn: number;
    startLine: number;
    columnLength: number;
    lineLength: number;
    passable: boolean;
}

export type MapData = {
    numberOfColumns: number;
    numberOfLines: number;
    waveInterval: number;
    creepLanes: Lane[];
    waves: UnitKey[];
    obstacles: MapObstaclesData[];

    Unit: MapUnitData;
    UnitFast: MapUnitData;
    UnitFly: MapUnitData;
    UnitGroup: MapUnitData;
    UnitImmune: MapUnitData;
    UnitSpawn: MapUnitData;
};

export interface MapPositionType {
    passable: number;
    blocked: number;
}

export type MapPosition = GridPosition | null;

export interface TowerStatsData {
    damage: number;
    range: number;
    sell_time: number;
    attack_speed: number;
    upgrade_cost?: number;
    upgrade_time?: number;
    initial_cost?: number;
}

// has an effect radius area
export interface TowerRadiusStatsData extends TowerStatsData {
    attack_radius: number;
}

// has an effect radius area with slow
export interface TowerRadiusSlowStatsData extends TowerRadiusStatsData {
    slow: number;
}

export type MapName = "easy" | "medium" | "hard";
