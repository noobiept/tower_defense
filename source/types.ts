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
