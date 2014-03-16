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
this.shape = null;
this.width = squareSize;
this.height = squareSize;

this.setupShape();

Tower.ALL.push( this );

Map.addTower( this );
}

Tower.ALL = [];


Tower.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;
var squareSize = Map.getSquareSize();

var shape = new createjs.Shape();

var g = shape.graphics;

g.beginFill( 'blue' );
g.drawRect( 0, 0, width, height );
g.endFill();


shape.regX = width / 2;
shape.regY = height / 2;
shape.x = this.column * squareSize + width / 2;
shape.y = this.line * squareSize + height / 2;

G.STAGE.addChild( shape );

this.shape = shape;
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