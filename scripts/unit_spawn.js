(function(window)
{
/*
    The main creep
 */

function UnitSpawn( args )
{
this.name = 'spawn creep';
this.image = 'creep_spawn';
this.slowImage = 'creep_spawn_slow';
this.width = 15;
this.height = 10;
this.number_spawned_units = 4;
this.already_spawned = false;
this.movement_speed = 50;

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitSpawn, Unit );


UnitSpawn.prototype.tookDamage = function( attacker )
{
var was_killed = Unit.prototype.tookDamage.call( this, attacker );


if ( was_killed && !this.already_spawned )
    {
    this.already_spawned = true;

    var position = Map.calculatePosition( this.getX(), this.getY() );
    var availablePositions = Map.getAvailablePositions( position[ 0 ], position[ 1 ], 1 );
    var spawnedPosition;

    var spawnedHealth = parseInt( this.max_health / 2, 10 );
    var spawnedRegeneration = parseInt( this.health_regeneration / 2, 10 );
    var spawnedGold = parseInt( this.gold / 2, 10 );
    var spawnedScore = parseInt( this.score / 2, 10 );

    for (var a = 0 ; a < this.number_spawned_units ; a++)
        {
            // position the spawned unit in a random position close to the main one
        if ( availablePositions.length > 0 )
            {
            var select = getRandomInt( 0, availablePositions.length - 1 );

            spawnedPosition = availablePositions.splice( select, 1 )[ 0 ];
            }

            // if there's no more available positions, then spawn on the same position as the main one
        else
            {
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
                score: spawnedScore
            });
        }
    }

return was_killed;
};



/*
    What is spawned when the main creep dies
 */

function UnitSpawned( args )
{
this.name = 'spawned creep';
this.image = 'creep_spawned';
this.slowImage = 'creep_spawned_slow';
this.movement_speed = 60;

Unit.call( this, args );
}

INHERIT_PROTOTYPE( UnitSpawned, Unit );


window.UnitSpawn = UnitSpawn;

})(window);
