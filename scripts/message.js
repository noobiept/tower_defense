(function(window)
{
/*
    In-game message
 */

function Message( args )
{
var font, color;

if ( typeof args.font == 'undefined' )
    {
    font = '16px monospace';
    }

else
    {
    font = args.font;
    }

if ( typeof args.color == 'undefined' )
    {
    color = 'black';
    }

else
    {
    color = args.color;
    }

if ( typeof args.timeout == 'undefined' )
    {
    args.timeout = 1000;
    }

    // center in the middle of the canvas
if ( typeof args.x == 'undefined' )
    {
    args.x = G.CANVAS.width / 2;
    }

if ( typeof args.y == 'undefined' )
    {
    args.y = G.CANVAS.height / 2;
    }


var textElement = new createjs.Text( args.text, font, color );

textElement.textAlign = 'center';
textElement.x = args.x;
textElement.y = args.y;

G.STAGE.addChild( textElement );

this.textElement = textElement;
this.timeout = window.setTimeout( function()
    {
    G.STAGE.removeChild( textElement );

    if ( typeof args.onEnd !== 'undefined' )
        {
        args.onEnd();
        }

    }, args.timeout );

Message.ALL.push( this );
}

Message.ALL = [];


Message.prototype.remove = function()
{
window.clearTimeout( this.timeout );

G.STAGE.removeChild( this.textElement );

var index = Message.ALL.indexOf( this );

Message.ALL.splice( index, 1 );
};


Message.removeAll = function()
{
for (var a = Message.ALL.length - 1 ; a >= 0 ; a--)
    {
    Message.ALL[ a ].remove();
    }
};



window.Message = Message;

}(window));
