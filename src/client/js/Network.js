/***************************
 *  Network Module
 *    - Handles Our Server-
 *      Logic
 **************************/

Game.HandleNetwork = function(data) {
	
	// All network data arrives under the event type "news"
	// The data object contains a "type" for this news. We operate according to the type
	switch( data.type ) {
		case 'id':
			// This packet contains the client's ID after a successful connection to the server
			// Store this ID for later use
			Game.Players[0].id = data.id;
			// Respond with the name of the player so the ID and name can be linked
			Game.Socket.emit('name', { name:Game.Players[0].Name });
			break;
		case 'ping':
			// Every 5 seconds the server sends an empty "ping" packet
			// Respond with an empty ping packet of our own.
			Game.Socket.emit('ping', {});
			break;
		case 'pingResponse':
			// When the server recieves a ping, it broadcast's the player's latency.
			for( i = 0; i < Game.Players.length; i++ ) {
				// Find the appropriate player
				if( Game.Players[i].id == data.id ) {
					// And store their latency for later use
					Game.Players[i].Ping = data.ping;
				}
			}
			break;
		case 'join':
			var loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;
			loader.load('models/gummybunnygreen.dae', function colladaReady (collada) {
				// When a new player joins we recieve a "join" message
				i = Game.Players.length;
				// Create an empty object for this new player
				Game.Players[i] = {};
				Game.Players[i].Ready = false;
				// Attach the player's ID
				Game.Players[i].ID = data.id;
				// And attach the player's name
				Game.Players[i].Name = data.name;
				// Assign our Collada Object
				Game.Players[i].Graphics = collada.scene;
				Game.Players[i].Skin = collada.skins[0];
				// Change the Graphics Properties
				Game.Players[i].Graphics.scale.x = Game.Players[i].Graphics.scale.y = Game.Players[i].Graphics.scale.z = 12.0;
				Game.Players[i].Graphics.updateMatrix();
				Game.Players[i].Graphics.position.x = data.x;
				Game.Players[i].Graphics.position.y = data.y;
				Game.Players[i].Graphics.position.z = data.z;
				Game.Scene.add(Game.Players[i].Graphics);
				
				// Create a physics model for the character
				Game.Players[i].Physics = new jigLib.JSphere(null, 20);
				Game.Players[i].Physics.moveTo([
					Game.Players[i].Graphics.position.x,
					Game.Players[i].Graphics.position.y,
					Game.Players[i].Graphics.position.z
				]);
				Game.Players[i].Physics.set_mass(100);
				Game.Players[i].Physics.set_friction(0);
				
				// Add them to the world
				Game.Physics.addBody( Game.Players[i].Physics );
				
				// Set their speed to 0
				Game.Players[i].moveVector = {
					x: 0,
					y: 0,
					z: 0
				}
				// Show the player is ready
				Game.Players[i].Ready = true;
				document.getElementById("game-history").innerHTML += "<font color='yellow'>" + Game.Players[i].Name + "<font color='white'> joined the game.<br //>";
				$("#game-history").scrollTop($("#game-history")[0].scrollHeight);
			});
			break;
		case 'move':
			// When a player starts moving, we recieve their new velocity
			for( i = 1; i < Game.Players.length; i++ ) {
				// Find the player
				if( Game.Players[i].ID == data.id ) {
					// Set their velocity
					Game.Players[i].moveVector = {
						x: data.x,
						y: data.y - 25,
						z: data.z
					};
					Game.Players[i].Physics.setVelocity([
						data.x,
						data.y - 25,
						data.z
					]);
					Game.Players[i].Physics.set_rotationY( data.rot - Math.PI );
				}
			}
			break;
		case 'stop':
			// When a player stops moving, we recieve their position
			for( i = 1; i < Game.Players.length; i++ ) {
				// Find the player
				if( Game.Players[i].ID == data.id ) {
					// Set their position
					Game.Players[i].Physics.set_x( data.x );
					Game.Players[i].Physics.set_y( data.y - 25);
					Game.Players[i].Physics.set_z( data.z );
					Game.Players[i].Physics.set_rotationY( data.rot - Math.PI );
				}
			}
			break;
		case 'bullet':
			// Create the Bullet Object from our Data
			var Bullet = data.bullet;
			// Create the Graphics for the Bullet
			Bullet.Graphics = new THREE.Mesh(
				new THREE.SphereGeometry( Game.BulletSize, 16, 16 ),
				new THREE.MeshLambertMaterial({
					color: 0x000000
				})
			);
			// Set the Graphics Location
			Bullet.Graphics.rotation.y = Bullet.Rotation;
			Bullet.Graphics.position.y = Game.Camera.position.y;
			// Add the Bullet Data to our Array
			Game.Bullets.push(Bullet);
			// Add the Graphics to our Scene
			Game.Scene.add(Game.Bullets[Game.Bullets.length-1].Graphics);
			break;
		case 'hit':
			var attacker = 0, hit = 0;
			for ( i = 0; i < Game.Players.length; i++ )
				if ( Game.Players[i].ID == data.attacker )
					attacker = i;
			for ( i = 0; i < Game.Players.length; i++ )
				if ( Game.Players[i].ID == data.hit )
					hit = i;
			var attackerName = Game.Players[attacker].Name;
			var hitName = Game.Players[hit].Name;
			if (attacker == 0) {
				Game.Score += 100;
				Game.Points.innerHTML = Game.Score;
				Cufon.replace('#points');
				attackerName = "You";
			}
			if (hit == 0) {
				document.getElementById('healthprog').value -= 10;
				hitName = "You";
			}
			document.getElementById("game-history").innerHTML += "<font color='#ff5555'>" + attackerName + "<font color='white'> shot <font color='orange'>" + hitName + "<br //>";
			$("#game-history").scrollTop($("#game-history")[0].scrollHeight);
			break;
		case 'respawn':
			Game.Score = 0;
			Game.Points.innerHTML = Game.Score;
			Cufon.replace('#points');
			document.getElementById('healthprog').value = 100;
			Game.AmmoLeft = Game.MaxAmmo;
			break;
		case 'leave':
			// When a player disconnects we recieve a "leave" packet
			for( i = 1; i < Game.Players.length ; i++ ) {
				// Find the player
				if( Game.Players[i].ID == data.id ) {
					// Remove player from graphics
					Game.Scene.remove( Game.Players[i].Graphics );
					// Remove player from physics
					Game.Physics.removeBody( Game.Players[i].Physics );
					document.getElementById("game-history").innerHTML += "<font color='lightblue'>" + Game.Players[i].Name + "<font color='white'> left the game.<br //>";
					$("#game-history").scrollTop($("#game-history")[0].scrollHeight);
				}
			}
			break;
		case 'chat':
			// A player sent a chat message
			for( i = 1; i < Game.Players.length; i++ ) {
				// Find the player who sent the message
				if( Game.Players[i].ID == data.id ) {
					document.getElementById("chat-history").innerHTML += "<font color='orange'>" + Game.Players[i].Name + "<font color='white'>: " + data.message + "<br //>";
					$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);
				}
			}
			break;
		case 'update':
			// An update from the server
			//	- Someone shot, died
			//	- document.getElementById("game-history").innerHTML += data.update + "<br //>";
			//	- $("#game-history").scrollTop($("#game-history")[0].scrollHeight);
			//	- Update Points (Remember to Cufon.replace('#points');)
			document.getElementById("game-history").innerHTML += "<font color='orange'>" + data.name + "<font color='white'>: " + data.message + "<br //>";
			$("#game-history").scrollTop($("#game-history")[0].scrollHeight);
			//Game.Points.innerHTML = data.points;
			//Cufon.replace('#points');
			break;
		default:
			// If we don't know what type of message it was, we respond with an error
			Game.Socket.emit('error', {message:'Could not determine news type.'});
			break;
	}
	
}