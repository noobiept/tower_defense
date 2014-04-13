(function(window)
{
function Unit( args )
{
var squareSize = Map.getSquareSize();
var intervalSeconds = G.INTERVAL_SECONDS;

if ( typeof this.name === 'undefined' )
    {
    this.name = 'unit';
    }

if ( typeof this.stats === 'undefined' )
    {
    this.stats = {
            movement_speed: 60,
            gold: 3 + args.waveNumber * 0.1,
            score: 1,
            health_regeneration: 2
        };
    }

if ( typeof this.image === 'undefined' )
    {
    this.image = 'creep';
    }

if ( typeof this.slowImage === 'undefined' )
    {
    this.slowImage = 'creep_slow';
    }

if ( typeof this.width === 'undefined' )
    {
    this.width = squareSize;
    }

if ( typeof this.height === 'undefined' )
    {
    this.height = squareSize;
    }

if ( typeof this.is_ground_unit === 'undefined' )
    {
    this.is_ground_unit = true;
    }

if ( typeof this.is_immune == 'undefined' )
    {
    this.is_immune = false;
    }


this.column = args.column;
this.line = args.line;

this.waveNumber = args.waveNumber;
this.score = this.stats.score;
this.gold = this.stats.gold;
this.movement_speed = this.stats.movement_speed;    // pixels per second
this.movement_per_tick = intervalSeconds * this.movement_speed; // pixels per tick
this.is_slow_down = false;
this.slow_duration = 2;
this.slow_count = 0;
this.slow_limit = 0;
this.is_stunned = false;
this.stun_count = 0;
this.stun_limit = 0;

this.max_health = args.health;
this.health = this.max_health;
this.health_regeneration = this.stats.health_regeneration;
this.regeneration_count = 0;
this.regeneration_limit = 1 / (intervalSeconds * this.health_regeneration);

this.removed = false;   // so that we don't try to remove the unit multiple times (this may happen if several towers have the .targetUnit pointing at the same unit)

this.path = [];
this.destination_column = args.destination_column;
this.destination_line = args.destination_line;
this.move_x = 0;
this.move_y = 0;
this.next_x = 0;
this.next_y = 0;

this.container = null;
this.slowElement = null;
this.healthBar = null;
this.shape = null;

this.setupShape();
this.tick = this.tick_normal;

Unit.ALL.push( this );

if ( this.is_ground_unit )
    {
    Unit.ALL_GROUND.push( this );
    }

else
    {
    Unit.ALL_AIR.push( this );
    }

this.setMoveDestination( this.destination_column, this.destination_line );
}

Unit.ALL = [];
Unit.ALL_GROUND = [];
Unit.ALL_AIR = [];


Unit.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;
var halfWidth = width / 2;
var halfHeight = height / 2;
var g;

    // the unit
var shape = new createjs.Bitmap( G.PRELOAD.getResult( this.image ) );

shape.regX = halfWidth;
shape.regY = halfHeight;

    // health bar

var healthBar = new createjs.Shape();

healthBar.x = 0;
healthBar.y = -2;
healthBar.regX = halfWidth;
healthBar.regY = halfHeight;

g = healthBar.graphics;

g.beginFill( 'green' );
g.drawRoundRect( 0, 0, width, 2, 1 );
g.endFill();

    // the slow circle (is added when the unit is being slowed down)
var slow = new createjs.Bitmap( G.PRELOAD.getResult( this.slowImage ) );

slow.regX = halfWidth;
slow.regY = halfHeight;

slow.visible = false;

    // container of all the elements
var container = new createjs.Container();

var position = Map.getPosition( this.column, this.line );

container.addChild( shape );
container.addChild( healthBar );
container.addChild( slow );
container.x = position.x + halfWidth;
container.y = position.y + halfHeight;

G.STAGE.addChild( container );

this.container = container;
this.healthBar = healthBar;
this.slowElement = slow;
this.shape = shape;
};



Unit.prototype.setMoveDestination = function( column, line )
{
var startPosition = Map.calculatePosition( this.getX(), this.getY() );

this.path = Map.getPath( startPosition[ 0 ], startPosition[ 1 ], column, line );

    // happens when the unit is at the destination
if ( this.path.length <= 0 )
    {
    return;
    }


    // the first element is the current position of the unit, so we remove it
    // also since if the unit is already moving somewhere, and you give another command, the shape will sometimes move a bit back and then proceeds with the path (this is due to the shape being in a position between the squares)
if ( this.path.length > 2 )
    {
    this.path.shift();
    }

this.move( this.path.shift() );
};


Unit.prototype.move = function( next )
{
var unitX = this.getX();
var unitY = this.getY();
var squareSize = Map.getSquareSize();

    // next.x is column, and next.y is line
    // is only called x/y because of the AStar library
var position = Map.getPosition( next.x, next.y );

var destX = position.x + squareSize / 2;
var destY = position.y + squareSize / 2;

var angleRads = calculateAngle( unitX, unitY * -1, destX, destY * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
this.next_x = destX;
this.next_y = destY;

var rotation = toDegrees( angleRads );

this.shape.rotation = rotation;
this.slowElement.rotation = rotation;
};


Unit.prototype.getX = function()
{
return this.container.x;
};


Unit.prototype.getY = function()
{
return this.container.y;
};


Unit.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

G.STAGE.removeChild( this.container );

    // remove from 'all' array and 'ground' or 'air' array
var index = Unit.ALL.indexOf( this );

Unit.ALL.splice( index, 1 );

if ( this.is_ground_unit )
    {
    index = Unit.ALL_GROUND.indexOf( this );

    Unit.ALL_GROUND.splice( index, 1 );
    }

else
    {
    index = Unit.ALL_AIR.indexOf( this );

    Unit.ALL_AIR.splice( index, 1 );
    }


if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }
};


/*
    Slows down the unit for a certain time (subtract the argument to the current .movement_speed)
 */

Unit.prototype.slowDown = function( minusMovementSpeed )
{
if ( this.is_immune )
    {
    return;
    }

this.is_slow_down = true;

this.slowElement.visible = true;

var intervalSeconds = G.INTERVAL_SECONDS;

var slowMovementSpeed = this.movement_speed - minusMovementSpeed;

this.movement_per_tick = intervalSeconds * slowMovementSpeed;
this.slow_count = 0;
this.slow_limit = this.slow_duration / intervalSeconds;

var angleRads = calculateAngle( this.getX(), this.getY() * -1, this.next_x, this.next_y * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
};


Unit.prototype.returnNormalSpeed = function()
{
this.is_slow_down = false;

this.slowElement.visible = false;

this.movement_per_tick = G.INTERVAL_SECONDS * this.movement_speed;

var angleRads = calculateAngle( this.getX(), this.getY() * -1, this.next_x, this.next_y * -1 );

this.move_x = Math.cos( angleRads ) * this.movement_per_tick;
this.move_y = Math.sin( angleRads ) * this.movement_per_tick;
};


Unit.prototype.stun = function( time )
{
if ( this.is_immune )
    {
    return;
    }

this.is_stunned = true;

this.stun_count = 0;
this.stun_limit = time / G.INTERVAL_SECONDS;

this.tick = this.tick_stunned;
};



Unit.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health < 0 )
    {
    this.health = 0;
    }


this.updateHealthBar();

if ( this.health <= 0 )
    {
    if ( !this.removed )
        {
        new Message({
                text: '+' + this.gold,
                color: 'rgb(125, 124, 55)',
                x: this.getX(),
                y: this.getY() - this.height
            });

            // add the gold earn from killing this unit
        Game.updateGold( this.gold );
        Game.updateScore( this.score );

        this.remove();
        }

    return true;
    }

return false;
};



Unit.prototype.updateHealthBar = function()
{
var ratio = this.health / this.max_health;
var currentHealth = ratio * this.width;
var missingHealth = (1 - ratio) * this.width;

var g = this.healthBar.graphics;

g.beginFill( 'red' );
g.drawRoundRect( 0, 0, missingHealth, 2, 1 );

g.beginFill( 'green' );
g.drawRoundRect( missingHealth, 0, currentHealth, 2, 1 );
g.endFill();
};



Unit.prototype.tick_move = function()
{
if ( this.is_slow_down )
    {
    this.slow_count++;

    if ( this.slow_count >= this.slow_limit )
        {
        this.returnNormalSpeed();
        }
    }

    // deal with the unit's movement
this.container.x += this.move_x;
this.container.y += this.move_y;

if( circlePointCollision( this.getX(), this.getY(), this.width / 8, this.next_x, this.next_y ) )
    {
    this.container.x += this.move_x;
    this.container.y += this.move_y;


    if ( this.path.length == 0 )
        {
        this.remove();
        Game.updateLife( -1 );
        return;
        }

    else
        {
        this.move( this.path.shift() );
        }
    }
};


Unit.prototype.tick_regeneration = function()
{
    // deal with the health regeneration
if ( this.regeneration_count <= 0 )
    {
    if ( this.health < this.max_health )
        {
        this.regeneration_count = this.regeneration_limit;
        this.health++;
        this.updateHealthBar();
        }
    }

else
    {
    this.regeneration_count--;
    }
};


Unit.prototype.tick_normal = function()
{
this.tick_move();
this.tick_regeneration();
};


Unit.prototype.tick_stunned = function()
{
if ( !this.is_stunned )
    {
    return;
    }

this.stun_count++;

if ( this.stun_count >= this.stun_limit )
    {
    this.is_stunned = false;
    this.tick = this.tick_normal;
    }

this.tick_regeneration();
};



Unit.prototype.tick = function()
{
    // this will be overridden by tick_normal(), or tick_stunned()
};



Unit.removeAll = function()
{
for (var a = 0 ; a < Unit.ALL.length ; a++)
    {
    Unit.ALL[ a ].remove();

    a--;
    }
};

/*
    When we add/remove towers, we need to calculate the movement of the units again (since the map was changed)
 */

Unit.redoMoveDestination = function()
{
for (var a = 0 ; a < Unit.ALL.length ; a++)
    {
    var unit = Unit.ALL[ a ];

    unit.setMoveDestination( unit.destination_column, unit.destination_line );
    }
};



window.Unit = Unit;

}(window));
