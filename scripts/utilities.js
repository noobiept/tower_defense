function Timeout()
{
this.is_active = false;
this.id = -1;
}

Timeout.prototype.start = function( functionToCall, interval )
{
var _this = this;

if ( this.is_active )
    {
    this.clear();
    }

this.is_active = true;

this.id = window.setTimeout( function()
    {
    _this.is_active = false;
    console.log('timeout');
    functionToCall();

    }, interval );
};

Timeout.prototype.clear = function()
{
this.is_active = false;
window.clearTimeout( this.id );
};



function getRandomInt( min, max )
{
return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomFloat( min, max )
{
return Math.random() * (max - min) + min;
}




function calculateAngle( aX, aY, bX, bY )
{
    // make a triangle from the position the objectA is in, relative to the objectB position
var triangleOppositeSide = aY - bY;
var triangleAdjacentSide = bX - aX;

    // find the angle, given the two sides (of a right triangle)
return Math.atan2( triangleOppositeSide, triangleAdjacentSide );
}


function toRadians( degrees )
{
return degrees * Math.PI / 180;
}


function toDegrees( radians )
{
return radians * 180 / Math.PI;
}


/*
    Detects collision between 2 boxes
 */

function boxBoxCollision( oneX, oneY, oneWidth, oneHeight, twoX, twoY, twoWidth, twoHeight )
{
return !(
        ( oneY + oneHeight < twoY ) ||
        ( oneY > twoY + twoHeight ) ||
        ( oneX > twoX + twoWidth ) ||
        ( oneX + oneWidth < twoX )
    );
}



function circlePointCollision( circleX, circleY, circleRadius, pointX, pointY )
{
var distanceX = circleX - pointX;
var distanceY = circleY - pointY;

    // pythagoras
var squareDistance = distanceX * distanceX + distanceY * distanceY;

if ( squareDistance < circleRadius * circleRadius )
    {
    return true;
    }

return false;
}


function circleCircleCollision( x1, y1, radius1, x2, y2, radius2 )
{
var distX = x1 - x2;
var distY = y1 - y2;

if ( Math.pow( distX, 2 ) + Math.pow( distY, 2 ) <= Math.pow( radius1 + radius2, 2 ) )
    {
    return true;
    }

return false;
}



/*
 * Converts an object to string, and saves it in storage
 *
 * usage:
 *      localStorage.setObject( "...", { ... } );
 */

Storage.prototype.setObject = function( key, value )
{
this.setItem( key, JSON.stringify( value ) );
};


/*
 * Returns null if it doesn't find, otherwise returns the string correspondent
 */

Storage.prototype.getObject = function( key )
{
var value = this.getItem( key );

return value && JSON.parse( value );
};



/*
 * Used for 'class' inheritance (search prototypal inheritance)
 */

function OBJECT( o )
{
function F(){}

F.prototype = o;

return new F();
}


/*
 * Used for 'class' inheritance (search for parasitic combination inheritance)
 */

function INHERIT_PROTOTYPE( derivedClass, baseClass )
{
var prototype = OBJECT( baseClass.prototype );

prototype.constructor = derivedClass;

derivedClass.prototype = prototype;
}




var EVENT_KEY = {

    backspace  : 8,
    tab        : 9,
    enter      : 13,
    esc        : 27,
    space      : 32,
    end        : 35,
    home       : 36,
    leftArrow  : 37,
    upArrow    : 38,
    rightArrow : 39,
    downArrow  : 40,
    del        : 46,

    "0" : 48,
    "1" : 49,
    "2" : 50,
    "3" : 51,
    "4" : 52,
    "5" : 53,
    "6" : 54,
    "7" : 55,
    "8" : 56,
    "9" : 57,

    a : 65,
    b : 66,
    c : 67,
    d : 68,
    e : 69,
    f : 70,
    g : 71,
    h : 72,
    i : 73,
    j : 74,
    k : 75,
    l : 76,
    m : 77,
    n : 78,
    o : 79,
    p : 80,
    q : 81,
    r : 82,
    s : 83,
    t : 84,
    u : 85,
    v : 86,
    w : 87,
    x : 88,
    y : 89,
    z : 90,

    f1  : 112,
    f2  : 113,
    f3  : 114,
    f4  : 115,
    f5  : 116,
    f6  : 117,
    f7  : 118,
    f8  : 119,
    f9  : 120,
    f10 : 121,
    f11 : 122,
    f12 : 123

};