(function(window)
{
function Bullet( args )
{
this.shooter = args.shooter;
this.target = args.target;

this.width = 4;
this.height = 4;
this.radius = 2;
this.movement_speed = 140;

this.shape = null;
this.removed = false;

this.setupShape();

Bullet.ALL.push( this );
}

Bullet.ALL = [];

var CONTAINER;      // createjs.Container() which will hold all the bullet elements


/**
 * Create the container which will hold all the bullet elements.
 */
Bullet.init = function( parent )
{
CONTAINER = new createjs.Container();

parent.addChild( CONTAINER );
};


Bullet.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;

var shape = new createjs.Bitmap( G.PRELOAD.getResult( 'bullet' ) );

shape.regX = width / 2;
shape.regY = height / 2;
shape.x = this.shooter.getX();
shape.y = this.shooter.getY();

CONTAINER.addChild( shape );

this.shape = shape;
};



Bullet.prototype.tick = function( deltaTime )
{
var target = this.target;

    // target already died
if ( target.removed )
    {
    this.remove();
    return;
    }

var targetX = target.getX();
var targetY = target.getY();
var targetRadius = target.width / 2;

var angle = Utilities.calculateAngle( this.shape.x, this.shape.y * -1, targetX, targetY * -1 );

this.shape.x += Math.cos( angle ) * this.movement_speed * deltaTime;
this.shape.y += Math.sin( angle ) * this.movement_speed * deltaTime;

this.shape.rotation = Utilities.toDegrees( angle );

if ( Utilities.circleCircleCollision( this.shape.x, this.shape.y, this.radius, targetX, targetY, targetRadius ) )
    {
    this.shooter.onBulletHit( target );

    this.remove();
    }
};


Bullet.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

CONTAINER.removeChild( this.shape );

var index = Bullet.ALL.indexOf( this );

Bullet.ALL.splice( index, 1 );
};


Bullet.removeAll = function()
{
for (var a = Bullet.ALL.length - 1 ; a >= 0 ; a--)
    {
    Bullet.ALL[ a ].remove();
    }
};



window.Bullet = Bullet;

}(window));
