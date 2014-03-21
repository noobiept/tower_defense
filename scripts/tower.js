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

this.width = squareSize * 2;
this.height = squareSize * 2;

this.upgrade_level = 0;
this.stats_level = [
        { damage: 10, health: 20, range: 50, attack_speed: 2, upgrade_cost: 10 },
        { damage: 15, health: 30, range: 55, attack_speed: 4, upgrade_cost: 10 },
        { damage: 20, health: 40, range: 60, attack_speed: 6 }
    ];

var currentLevel = this.stats_level[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.health = currentLevel.health;
this.range = currentLevel.range;
this.cost = Tower.cost;

this.attack_speed = currentLevel.attack_speed;
this.attack_limit = 1 / (createjs.Ticker.getInterval() / 1000 * this.attack_speed);
this.attack_count = 0;

this.targetUnit = null;
this.removed = false;

this.container = null;
this.rangeElement = null;
this.shape = null;

this.setupShape();

Tower.ALL.push( this );

Map.addTower( this );
}

Tower.ALL = [];
Tower.cost = 10;

var SELECTION_MENU;

Tower.init = function()
{
var container = document.querySelector( '#GameMenu-tower' );

var name = container.querySelector( '.name span' );
var health = container.querySelector( '.health span' );
var damage = container.querySelector( '.damage span' );
var attack_speed = container.querySelector( '.attack_speed span' );
var range = container.querySelector( '.range span' );
var upgrade = container.querySelector( '.upgrade' );

upgrade.onclick = function()
    {
        // if we can click on this element, it means we have a tower selected, so we can assume that what we get is a tower object
    var tower = Game.getSelection();
    var upgradeCost = tower.stats_level[ tower.upgrade_level ].upgrade_cost;
    if ( Game.haveEnoughGold( upgradeCost ) )
        {
        tower.upgrade();
        Game.updateGold( -upgradeCost );

            // can't upgrade anymore, we can remove the upgrade button
        if ( tower.maxUpgrade() )
            {
            SELECTION_MENU.showNextUpgrade = false;
            $( upgrade ).css( 'display', 'none' );
            }
        }

    else
        {
        console.log('not enough gold to upgrade');
        }
    };

upgrade.onmouseover = function()
    {
    SELECTION_MENU.showNextUpgrade = true;
    };
upgrade.onmouseout = function()
    {
    SELECTION_MENU.showNextUpgrade = false;
    };


SELECTION_MENU = {
        container: container,
        name: name,
        health: health,
        damage: damage,
        attack_speed: attack_speed,
        range: range,
        upgrade: upgrade,
        showNextUpgrade: false
    };
};


Tower.prototype.setupShape = function()
{
var width = this.width;
var height = this.height;

var shape = new createjs.Shape();

var g = shape.graphics;

g.beginFill( 'blue' );
g.drawRect( 0, 0, width, height );
g.endFill();


    // the range circle
var range = new createjs.Shape();

var g = range.graphics;

g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();

range.visible = false;

range.regX = -(width / 2);
range.regY = -(height / 2);

var container = new createjs.Container();

container.addChild( shape );
container.addChild( range );


var position = Map.getPosition( this.column, this.line );

container.x = position.x;
container.y = position.y;

G.STAGE.addChild( container );

this.container = container;
this.rangeElement = range;
this.shape = shape;
};

Tower.prototype.selected = function()
{
    // show the range
this.rangeElement.visible = true;

    // show the game menu
$( SELECTION_MENU.container ).css( 'display', 'flex' );

if ( this.maxUpgrade() )
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'none' );
    }

else
    {
    $( SELECTION_MENU.upgrade ).css( 'display', 'block' );
    }

    // update the info that won't change during the selection
$( SELECTION_MENU.name ).text( this.name );

};

Tower.prototype.unselected = function()
{
this.rangeElement.visible = false;

    // hide the game menu
$( SELECTION_MENU.container ).css( 'display', 'none' );
};

Tower.prototype.updateSelection = function()
{
var damage = this.damage;
var attack_speed = this.attack_speed;
var range = this.range;
var health = this.health;

if ( SELECTION_MENU.showNextUpgrade )
    {
    var next = this.stats_level[ this.upgrade_level + 1 ];

    damage       += ' (' + next.damage       + ')';
    attack_speed += ' (' + next.attack_speed + ')';
    range        += ' (' + next.range        + ')';
    health       += ' (' + next.health       + ')';
    }


$( SELECTION_MENU.damage ).text( damage );
$( SELECTION_MENU.attack_speed ).text( attack_speed );
$( SELECTION_MENU.range ).text( range );
$( SELECTION_MENU.health ).text( health );
};


Tower.prototype.upgrade = function()
{
    // no more upgrades
if ( this.upgrade_level + 1 >= this.stats_level.length )
    {
    console.log('no more tower upgrades');
    return;
    }

this.upgrade_level++;

var currentLevel = this.stats_level[ this.upgrade_level ];

this.damage = currentLevel.damage;
this.health = currentLevel.health;
this.range = currentLevel.range;
this.attack_speed = currentLevel.attack_speed;


var g = this.rangeElement.graphics;

g.clear();
g.beginStroke( 'gray' );
g.drawCircle( 0, 0, this.range );
g.endStroke();
};


Tower.prototype.maxUpgrade = function()
{
if ( this.upgrade_level + 1 >= this.stats_level.length )
    {
    return true;
    }

return false;
};


Tower.prototype.getX = function()
{
return this.container.x;
};


Tower.prototype.getY = function()
{
return this.container.y;
};


Tower.prototype.remove = function()
{
if ( this.removed )
    {
    return;
    }

this.removed = true;

G.STAGE.removeChild( this.container );

Map.removeTower( this );

var index = Tower.ALL.indexOf( this );

Tower.ALL.splice( index, 1 );

if ( Game.checkIfSelected( this ) )
    {
    Game.clearSelection();
    }
};


Tower.prototype.tookDamage = function( attacker )
{
this.health -= attacker.damage;

if ( this.health <= 0 )
    {
    this.remove();
    return true;
    }

return false;
};


Tower.prototype.tick = function()
{
if ( this.damage > 0 )
    {
        // see if we can attack right now
    if ( this.attack_count <= 0 )
        {
        var target = this.targetUnit;

            // check if its currently attacking a unit
        if ( target )
            {
                // check if the unit is within the tower's range
            if ( circleCircleCollision( this.getX(), this.getY(), this.range, target.getX(), target.getY(), target.width / 2 ) )
                {
                this.attack_count = this.attack_limit;

                    // deal damage, and see if the unit died from this attack or not
                if ( target.tookDamage( this ) )
                    {
                    Game.updateGold( target.gold );
                    this.targetUnit = null;
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

        // we need to wait a bit
    else
        {
        this.attack_count--;
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