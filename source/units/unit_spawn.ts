import { Unit } from "./unit";
import * as Map from "../map";
import { getRandomInt } from "@drk4/utilities";

/**
 * The main creep.
 */
export class UnitSpawn extends Unit {
    private number_spawned_units: number;
    private already_spawned: boolean;

    constructor(args) {
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
    }

    tookDamage(attacker) {
        var was_killed = Unit.prototype.tookDamage.call(this, attacker);

        if (was_killed && !this.already_spawned) {
            this.already_spawned = true;

            var position = Map.calculatePosition(this.getX(), this.getY());
            var availablePositions = Map.getAvailablePositions(
                position.column,
                position.line,
                2
            );
            var spawnedPosition;

            var spawnedHealth = Math.floor(
                this.max_health / this.number_spawned_units
            );
            var spawnedRegeneration = Math.floor(this.health_regeneration / 2);
            var spawnedGold = Math.floor(this.gold / 2);
            var spawnedScore = Math.floor(this.score / 2);

            for (var a = 0; a < this.number_spawned_units; a++) {
                // position the spawned unit in a random position close to the main one
                if (availablePositions.length > 0) {
                    var select = getRandomInt(0, availablePositions.length - 1);

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
    constructor(args) {
        super({
            ...args,
            name: "spawned creep",
            image: "creep_spawned",
            slowImage: "creep_spawned_slow",
            movement_speed: 60,
        });
    }
}
