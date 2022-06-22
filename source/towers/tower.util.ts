import { CanvasPosition, GridPosition } from "../types";
import { Unit } from "../units/unit";
import { Tower } from "./tower";
import { TowerAntiAir } from "./tower_anti_air";
import { TowerBash } from "./tower_bash";
import { TowerFast } from "./tower_fast";
import { TowerFrost } from "./tower_frost";
import { TowerRocket } from "./tower_rocket";
import TowersData from "../../data/towers.json";

interface CreateTowerArgs {
    type: TowerKey;
    gridPosition: GridPosition;
    canvasPosition: CanvasPosition;
    squareSize: number;
    onRemove: (tower: Tower) => void;
    getUnitsInRange: (
        x: number,
        y: number,
        radius: number,
        tower: Tower,
        limit?: number
    ) => Unit[];
    onSell: (cost: number) => void;
    onUpgrade: (tower: Tower) => void;
}

const TOWERS_MAP = {
    Tower: { type: "Tower", class: Tower },
    TowerFast: { type: "TowerFast", class: TowerFast },
    TowerRocket: { type: "TowerRocket", class: TowerRocket },
    TowerFrost: { type: "TowerFrost", class: TowerFrost },
    TowerAntiAir: { type: "TowerAntiAir", class: TowerAntiAir },
    TowerBash: { type: "TowerBash", class: TowerBash },
} as const;

export type TowerKey = keyof typeof TOWERS_MAP;

function mapTowerType(type: TowerKey) {
    return TOWERS_MAP[type];
}

export function createTower({ type, ...args }: CreateTowerArgs) {
    const info = mapTowerType(type);
    const tower = new info.class(args);

    return tower;
}

export function getTowerInitialCost(key: TowerKey) {
    const info = mapTowerType(key);

    return TowersData[info.type][0].initial_cost ?? 0;
}
