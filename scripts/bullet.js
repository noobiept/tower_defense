(function(window)
{
function Bullet( args )
{
this.shooter = args.shooter;
this.target = args.target;

this.width = 4;
this.height = 4;
this.radius = 2;
this.movement_speed = 100;
this.movement_per_tick = G.INTERVAL_SECONDS * this.movement_speed;

this.shape = null;
this.removed = false;

this.setupShape();

Bullet.ALL.push( this );
}

Bullet.ALL = [];



Bullet.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;

var shape = new createjs.Shape();

shape.regX = width / 2;
shape.regY = height / 2;
shape.x = this.shooter.getX();
shape.y = this.shooter.getY();


var g = shape.graphics;

g.beginFill( 'blue' );
g.drawRoundRect( 0, 0, this.width, this.height, 2 );
g.endFill();

G.STAGE.addChild( shape );

this.shape = shape;
};



Bullet.prototype.tick = function()
{
var target = this.target;
var targetX = target.getX();
var targetY = target.getY();
var targetRadius = target.width / 2;

var angle = calculateAngle( this.shape.x, this.shape.y * -1, targetX, targetY * -1 );

this.shape.x += Math.cos( angle ) * this.movement_per_tick;
this.shape.y += Math.sin( angle ) * this.movement_per_tick;

this.shape.rotation = toDegrees( angle );

if ( circleCircleCollision( this.shape.x, this.shape.y, this.radius, targetX, targetY, targetRadius ) )
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

G.STAGE.removeChild( this.shape );

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