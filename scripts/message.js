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
    font = 'monospace 16px';
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


var textElement = new createjs.Text( args.text, font, color );

textElement.textAlign = 'center';
textElement.x = args.x;
textElement.y = args.y;

G.STAGE.addChild( textElement );


window.setTimeout( function()
    {
    G.STAGE.removeChild( textElement );

    }, 1000 );
}


window.Message = Message;

}(window));