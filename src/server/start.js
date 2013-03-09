/*
 *	start.js
 *
 *	After much aggrevation and deliberation, this file contains 100% of
 *	server-side code.
 *
 */

var port = 2143;	// The port that we will listen on

var io = require('socket.io').listen(port).set('log level', 1);	// Used for WebSockets connections

// We are now using a ray intersection model for physics instead of the
// jigLibJS physics engine, so we may not need to instantiate the physics
// engine.
	
var jigLib = require('./jiglibjs.nodejs.js').jigLib;	// Instantiate the physics object

// No longer necessary since we aren't using a file server

//app.listen(port);

var system = jigLib.PhysicsSystem.getInstance();

// This array will store all data about currently connected users
// This includes their ID, name, position, rotation, and ping.
var users = [];

io.sockets.on('connection', function(socket) {
		
	// Send the client their own ID
	socket.emit( 'news', { type:'id', id:socket.id } );
	
	// We must wait until we know this user's name before completing the connection.
	socket.on( 'name', function(data) {
		
		// Add the new user to the physics system
		physics = new jigLib.JSphere(null, 20);
		physics.moveTo([0, 400, 0]);
		// I'll handle rotation later - I used sphere for now since they're the same from all angles
		physics.set_mass(100);
		physics.set_friction(0);
		system.addBody( physics );
		
		// Send new user all previous users
		for( i = 0; i < users.length; i++ ){
			socket.emit( 'news', { type:'join', id:users[i].id, name:users[i].name, x:users[i].physics.get_x(), y:users[i].physics.get_y(), z:users[i].physics.get_z() } );
		}
		
		// Add the id, name, and physics object
		users.push( { id:socket.id, name:data.name, physics: physics } );
		
		// Send previous users the new user
		socket.broadcast.emit( 'news', { type:'join', id:socket.id, name:data.name, x:0, y:400, z:0 });

	});
	
	// Begin occasional pings
	function sendPing() {
		for( i = 0; i < users.length; i++ ) {
			if( users[i].id == socket.id ) {
				users[i].ping = new Date().getTime();
			}
		}
		socket.emit( 'news', { type:'ping' } );
		setTimeout( sendPing, 5000 );
	}
	socket.on( 'ping', function(data) {
//		console.log( 'Received a ping' );
		for( i = 0; i < users.length; i++ ) {
			if( users[i].id == socket.id ) {
				users[i].ping = new Date().getTime() - users[i].ping;
				socket.emit( 'news', { type:'pingResponse', id:socket.id, ping:users[i].ping } );
				socket.broadcast.emit( 'news', { type:'pingResponse', id:socket.id, ping:users[i].ping } );
			}
		}
	});
	sendPing();
	
	socket.on( 'move', function(data) {
//		console.log( 'Player moved' );
		for( i = 0; i < users.length; i++ ) {
			if( users[i].id == socket.id ) {
				users[i].physics.setVelocity([
					data.x,
					data.y,
					data.z
				]);
			}
		}
		socket.broadcast.emit( 'news', { type:'move', id:socket.id, x:data.x, y:data.y, z:data.z, rot:data.rot });
	});
	
	socket.on( 'stop', function(data) {
//		console.log( 'Player stopped' );
		for( i = 0; i < users.length; i++ ) {
			if( users[i].id == socket.id ) {
				users[i].physics.set_x(data.x);
				users[i].physics.set_y(data.y);
				users[i].physics.set_z(data.z);
			}
		}
		socket.broadcast.emit( 'news', { type:'stop', id:socket.id, x:data.x, y:data.y, z:data.z, rot:data.rot });
	});
	
	function bulletHit(data) {
		for ( i = 0; i < users.length; i++) {
			if ( users[i].id == socket.id )
				continue;
			var BulletDirection = {};
			BulletDirection.x = -Math.sin(data.Rotation);
			BulletDirection.y = 0;
			BulletDirection.z = -Math.cos(data.Rotation);
			var temp = Math.pow(BulletDirection.x, 2) + Math.pow(BulletDirection.y, 2) + Math.pow(BulletDirection.z, 2);
			if (temp == 0.0)
				continue;
			temp = 1.0 / Math.sqrt(temp);
			BulletDirection.x = BulletDirection.x * temp;
			BulletDirection.y = BulletDirection.y * temp;
			BulletDirection.z = BulletDirection.z * temp;
			var OC = {};
			OC.x = users[i].physics.get_x() - data.InitialPosition.x;
			OC.y = users[i].physics.get_y() - data.InitialPosition.y;
			OC.z = users[i].physics.get_z() - data.InitialPosition.z;
			var dist = Math.sqrt(Math.pow(OC.x, 2) + Math.pow(OC.y, 2) + Math.pow(OC.z, 2));
			if (dist > data.MaxDistance)
				continue;
			var t_ca = OC.x * BulletDirection.x + OC.y * BulletDirection.y + OC.z * BulletDirection.z;
			if (t_ca < 0.0 && dist < 20.0)
				continue;
			var t_hc_2 = 400.0 - Math.pow(dist, 2) + Math.pow(t_ca, 2);
			if (t_hc_2 < 0.0)
				continue;
			var t_0 = 0.0;
			if (dist < 20) {
				t_0 = t_ca + Math.sqrt(t_hc_2);
			} else {
				t_0 = t_ca - Math.sqrt(t_hc_2);
			}
			if (t_0 < data.MaxDistance && t_0 > 0.1) {
				socket.emit( 'news', { type:'hit', attacker:socket.id, hit:users[i].id } );
				socket.broadcast.emit( 'news', { type:'hit', attacker:socket.id, hit:users[i].id } );
			}
		}
	}
	
	socket.on( 'bullet', function(data) {
		/* Bullet
		 *		- InitialPosition {x,y,z}
		 *		- CurrentDistance {float}
		 *		- MaxDistance {float}
		 *		- Rotation {float}
		 */
		bulletHit(data);
		socket.broadcast.emit( 'news', { type:'bullet', bullet:data } );
	});
	
	socket.on( 'chat', function(data) {
		socket.broadcast.emit( 'news', { type:'chat', id:socket.id, message:data.message });
	});
	
	socket.on('disconnect', function() {
		console.log( 'User disconnected' );
		for( i = 0; i < users.length; i++ ) {
			if( users[i].id == socket.id ) {
				users.splice( i, 1 );
			}
		}
		socket.broadcast.emit( 'news', { type:'leave', id:socket.id } );
	});
});