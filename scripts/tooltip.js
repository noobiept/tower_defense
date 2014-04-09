(function(window)
{
function Tooltip( args )
{
var _this = this;
var reference = args.reference;
var element = document.createElement( 'div' );

element.className = 'tooltip';
$( element ).text( args.text );

CONTAINER.appendChild( element );

Tooltip.ALL.push( this );

this.text = args.text;
this.element = element;
this.reference = reference;
this.is_opened = false;

if ( typeof args.enableEvents == 'undefined' || args.enableEvents === true )
    {
    reference.onmouseover = function() { _this.show(); };
    reference.onmouseout = function() { _this.hide(); };
    }
}

var CONTAINER = null;
Tooltip.ALL = [];


Tooltip.init = function()
{
var container = document.createElement( 'div' );

container.id = 'TooltipContainer';
document.body.appendChild( container );

CONTAINER = container;
};

Tooltip.removeAll = function()
{
for (var a = Tooltip.ALL.length - 1 ; a >= 0 ; a--)
    {
    var tooltip = Tooltip.ALL[ a ];

    tooltip.reference.onmouseover = null;
    tooltip.reference.onmouseout = null;

    CONTAINER.removeChild( this.element );

    Tooltip.ALL.splice( a, 1 );
    }
};




Tooltip.prototype.show = function()
{
if ( this.text === '' )
    {
    return;
    }

this.is_opened = true;

var reference = this.reference;
var element = this.element;

var position = $( reference ).offset();

var left = position.left;
var top = position.top - $( element ).outerHeight() - 5;

$( element ).css( 'top', top + 'px' );
$( element ).css( 'left', left + 'px' );

$( element ).addClass( 'tooltip-show' );
};

Tooltip.prototype.hide = function()
{
this.is_opened = false;

$( this.element ).removeClass( 'tooltip-show' );
};

Tooltip.prototype.isOpened = function()
{
return this.is_opened;
};


Tooltip.prototype.updateText = function( text )
{
this.text = text;

$( this.element ).text( text );
};



window.Tooltip = Tooltip;

}(window));