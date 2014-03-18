(function(window)
{
function Tower( args )
{
var squareSize = Map.getSquareSize();

if ( !this.name )
    {
    this.name = 'tower';
    }

this.column = parseInt( args.column, 10 );
this.line = parseInt( args.line, 10 );

this.width = squareSize;
this.height = squareSize;

this.damage = 10;
this.health = 20;
this.range = 50;

this.attack_limit = 50;
this.attack_count = this.attack_limit;
this.attack_speed = 1 / (createjs.Ticker.getInterval() / 1000 * this.attack_limit);
this.targetUnit = null;

this.shape = this.setupShape();


Tower.ALL.push( this );

Map.addTower( this );
}

Tower.ALL = [];


Tower.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;

var shape = new createjs.Shape();

var g = shape.graphics;

g.beginFill( 'blue' );
g.drawRect( 0, 0, width, height );
g.endFill();

var position = Map.getPosition( this.column, this.line );

shape.regX = width / 2;
shape.regY = height / 2;
shape.x = position.x;
shape.y = position.y;

G.STAGE.addChild( shape );

return shape;
};


Tower.prototype.getX = function()
{
return this.shape.x;
};


Tower.prototype.getY = function()
{
return this.shape.y;
};


Tower.prototype.remove = function()
{
G.STAGE.removeChild( this.shape );

Map.removeTower( this );

var index = Tower.ALL.indexOf( this );

Tower.ALL.splice( index, 1 );
};


Tower.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health <= 0 )
    {
//    G.TO_BE_REMOVED.push( this );
    this.remove();
    return true;
    }

return false;
};


Tower.prototype.tick = function()
{
if ( this.damage > 0 )
    {
    var target = this.targetUnit;

        // check if its currently attacking a unit
    if ( target )
        {
            // check if the unit is within the tower's range
        if ( circleCircleCollision( this.getX(), this.getY(), this.range, target.getX(), target.getY(), target.width / 2 ) )
            {
            this.attack_count--;

            if ( this.attack_count < 0 )
                {
                this.attack_count = this.attack_limit;

                    // deal damage, and see if the unit died from this attack or not
                if ( target.tookDamage( this ) )
                    {
                    this.targetUnit = null;
                    }
                }
            }

            // can't attack anymore, find other target
        else
            {
            this.targetUnit = null;
            }
        }

        // find a target
    else
        {
        this.targetUnit = Map.getUnitInRange( this );
        }
    }
};


Tower.removeAll = function()
{
for (var a = 0 ; a < Tower.ALL.length ; a++)
    {
    Tower.ALL[ a ].remove();

    a--;
    }
};



window.Tower = Tower;

}(window));