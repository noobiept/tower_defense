import { Unit, UnitArgs } from "./unit";
import { getRandomInt } from "@drk4/utilities";
import { CanvasPosition, GridPosition } from "../types";
import { Tower } from "../towers/tower";

interface UnitSpawnArgs extends UnitArgs {
    canvasToGrid: (position: CanvasPosition) => GridPosition;
    getAvailablePositions: (
        column: number,
        line: number,
        range: number
    ) => GridPosition[];
}

/**
 * The main creep.
 */
export class UnitSpawn extends Unit {
    private number_spawned_units: number;
    private already_spawned: boolean;
    private canvasToGrid: (position: CanvasPosition) => GridPosition;
    private getAvailablePositions: (
        column: number,
        line: number,
        range: number
    ) => GridPosition[];

    constructor(args: UnitSpawnArgs) {
        super({
            ...args,
            name: "spawn creep",
            image: "creep_spawn",
            slowImage: "creep_spawn_slow",
            width: 15,
            height: 10,
            movement_speed: 50,
        });

        this.number_spawned_units = 4;
        this.already_spawned = false;
        this.canvasToGrid = args.canvasToGrid;
        this.getAvailablePositions = args.getAvailablePositions;
    }

    tookDamage(attacker: Tower) {
        const was_killed = super.tookDamage(attacker);

        if (was_killed && !this.already_spawned) {
            this.already_spawned = true;

            const position = this.canvasToGrid({
                x: this.getX(),
                y: this.getY(),
            });
            const availablePositions = this.getAvailablePositions(
                position.column,
                position.line,
                2
            );
            let spawnedPosition;

            const spawnedHealth = Math.floor(
                this.max_health / this.number_spawned_units
            );
            const spawnedRegeneration = Math.floor(
                this.health_regeneration / 2
            );
            const spawnedGold = Math.floor(this.gold / 2);
            const spawnedScore = Math.floor(this.score / 2);

            for (let a = 0; a < this.number_spawned_units; a++) {
                // position the spawned unit in a random position close to the main one
                if (availablePositions.length > 0) {
                    const select = getRandomInt(
                        0,
                        availablePositions.length - 1
                    );

                    spawnedPosition = availablePositions.splice(select, 1)[0];
                }

                // if there's no more available positions, then spawn on the same position as the main one
                else {
                    spawnedPosition = position;
                }

                new UnitSpawned({
                    column: spawnedPosition.column,
                    line: spawnedPosition.line,
                    destination_column: this.destination_column,
                    destination_line: this.destination_line,
                    health: spawnedHealth,
                    health_regeneration: spawnedRegeneration,
                    gold: spawnedGold,
                    score: spawnedScore,
                    lane_id: this.lane_id,
                    size: this.size,
                    width: this.size,
                    height: this.size,
                    onReachDestination: this.onReachDestination,
                    onUnitKilled: this.onUnitKilled,
                    onUnitRemoved: this.onUnitRemoved,
                    getNextDestination: this.getNextDestination,
                    toCanvasPosition: this.toCanvasPosition,
                });
            }
        }

        return was_killed;
    }
}

/**
 * What is spawned when the main creep dies.
 */
class UnitSpawned extends Unit {
    constructor(args: UnitArgs) {
        super({
            ...args,
            name: "spawned creep",
            image: "creep_spawned",
            slowImage: "creep_spawned_slow",
            movement_speed: 60,
        });
    }
}
