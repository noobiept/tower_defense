(function(window)
{
function TowerRocket( args )
{
this.name = 'rocket tower';
this.image = 'tower_rocket';

Tower.call( this, args );
}

INHERIT_PROTOTYPE( TowerRocket, Tower );


window.TowerRocket = TowerRocket;

}(window));