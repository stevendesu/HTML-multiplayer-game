/***************************
 *  Controls Module
 *    - Handles Our Control-
 *      Logic
 **************************/

 // This function uses a Ray-Projection to Test for Objects in our Path
Game.CollisionDetection = function(position, view) {
	// Establish the Ray
	var ray = new THREE.Ray(position, view);
	// Send Out for Intersections
	var intersects = ray.intersectObjects(Game.Walls);
	// If we have Intersections
	if (intersects.length > 0) {
		// Find the Distance
		var x1 = Game.Players[0].Graphics.position.x;
		var y1 = Game.Players[0].Graphics.position.y;
		var z1 = Game.Players[0].Graphics.position.z;
		var x2 = intersects[0].point.x;
		var y2 = intersects[0].point.y;
		var z2 = intersects[0].point.z;
		var distance = Math.sqrt( Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
		// If Distance is Less than the Size of our Character
		if (distance <= 20)
			Game.Collision = true;
		// Otherwise
		else
			Game.Collision = false;
	}
};
// Function to Find Max Distance Bullet will Travel
function bulletSetMaxDistance(bullet) {
	// Establish our Direction Vector
	var view = new THREE.Vector3(-Math.sin(bullet.Graphics.rotation.y), 0, -Math.cos(bullet.Graphics.rotation.y));
	// Establish the Ray
	var ray = new THREE.Ray(bullet.Graphics.position, view);
	// Send Out for Intersections
	var intersects = ray.intersectObjects(Game.Walls);
	// If we have an intersection
	if (intersects.length > 0) {
		var x1 = bullet.Graphics.position.x;
		var y1 = bullet.Graphics.position.y;
		var z1 = bullet.Graphics.position.z;
		var x2 = intersects[0].point.x;
		var y2 = intersects[0].point.y;
		var z2 = intersects[0].point.z;
		// Set the Max Distance to the First Intersection
		bullet.MaxDistance = Math.sqrt( Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
	}
};
// Function to Update the Position of our Bullets
Game.UpdateBullets = function () {
	// If we have bullets in our array
	if (Game.Bullets.length > 0) {
		// For each of the bullets
		for (var i = 0; i < Game.Bullets.length; i++) {
			// Update the Distance Travelled
			Game.Bullets[i].CurrentDistance += Game.BulletSpeed;
			// If the bullet is less than the maximum distance update the position
			if (Game.Bullets[i].CurrentDistance <= Game.Bullets[i].MaxDistance) {
				Game.Bullets[i].Graphics.position.x = Game.Bullets[i].InitialPosition.x - Math.sin(Game.Bullets[i].Graphics.rotation.y) * Game.Bullets[i].CurrentDistance;
				Game.Bullets[i].Graphics.position.z = Game.Bullets[i].InitialPosition.z - Math.cos(Game.Bullets[i].Graphics.rotation.y) * Game.Bullets[i].CurrentDistance;
			// Otherwise we remove the bullet from the array
			} else {
				Game.Scene.remove(Game.Bullets[i].Graphics);
				Game.Scene.remove(Game.Bullets[i].Graphics);
				Game.Bullets.splice(i, 1);
			}
		}
	}
};
// This Keyboard Handler is specifically for Events which must only be flagged Once per click
window.addEventListener('keypress', function (event) {
	// Prevent this keypress from triggering multiple times
	event.stopPropagation();
	// Get the right keyCode
	var key = event.which ? event.which : event.keyCode;
	// If the game isn't running, we don't need any event handling
	if (Game.Playing == false)
		return;
	switch(key) {
		case 13:					/* Enter Key - Initialize Chat */
			// If we weren't previously chatting
			if (Game.Chatting == false) {
				// Show our Chat Input
				$("#chat").show('fast');
				// Focus the Text Box
				document.getElementById("message").focus();
				// Animate the Chat-History Resize
				$('#chat-history').animate({
					height: '-=25'
					}, 100, function() {
						// Animation complete.
						$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);
				});
				// Set our Flag to show we're chatting only
				Game.Chatting = true;
			// Otherwise
			} else {
				// Hide our Chat Input
				$("#chat").hide('fast');
				// Send Chat Message if we have one
				if (document.getElementById("message").value.length > 0) {
					// Place the message in our chat history
					document.getElementById("chat-history").innerHTML += "<font color='orange'>" + Game.Players[0].Name + "<font color='white'>: " + document.getElementById("message").value + "<br //>";
					$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);
					// Send the message to the server
					Game.Socket.emit('chat', { message:document.getElementById("message").value });
					// Reset our MessageBox
					document.getElementById("message").value = "";
				}
				// Animate the Chat-History Resize
				$('#chat-history').animate({
					height: '+=25'
					}, 100, function() {
						// Animation complete
						$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);
				});
				// Set our Flag to show we're not chatting anymore
				Game.Chatting = false;
			}
			break;
		default:
			break;
	}
}, false);
window.addEventListener('keyup', function (event) {
	// Prevent the keyup from triggering multiple times
	event.stopPropagation();
	// Get the right keyCode
	var key = event.which ? event.which : event.keyCode;
	// If we're not playing or we're chatting, we don't need to handle the keypress
	if (Game.Playing == false || Game.Chatting == true)
		return;
	// Switch for the keyCode
	switch(key) {
		// the '/' Key - Used for Attacking/Shooting
		case 191:
			if (Game.Reloading == true)
				return;
			// Generate the Bullet Object
			var Bullet = {};
			// Draw the Graphics
			Bullet.Graphics = new THREE.Mesh(
				new THREE.SphereGeometry( Game.BulletSize, 16, 16 ),
				new THREE.MeshLambertMaterial({
					color: 0x000000
				})
			);
			// Establish the Initial Position and Rotation (Camera at the moment)
			Bullet.InitialPosition = {};
			Bullet.InitialPosition.x = Bullet.Graphics.position.x = Game.Camera.position.x;
			Bullet.InitialPosition.y = Bullet.Graphics.position.y = Game.Camera.position.y;
			Bullet.InitialPosition.z = Bullet.Graphics.position.z = Game.Camera.position.z;
			Bullet.Graphics.rotation.y = Game.Players[0].Graphics.rotation.y;
			// The Bullet hasn't travelled from it's initial position
			Bullet.CurrentDistance = 0;
			// Find the MaxDistance
			bulletSetMaxDistance(Bullet);
			// Now we format our network bullet packet
			var NetBullet = {};
			// Pass it InitialPosition
			NetBullet.InitialPosition = Bullet.InitialPosition;
			// Rotation
			NetBullet.Rotation = Bullet.Graphics.rotation.y;
			// Set it's currentdistance
			NetBullet.CurrentDistance = 0;
			// And MaxDistance
			NetBullet.MaxDistance = Bullet.MaxDistance;
			// And Emit the Packet
			Game.Socket.emit('bullet', NetBullet);
			// Add the bullet to our Array
			Game.Bullets.push(Bullet);
			// Add the Graphics to our Scene
			Game.Scene.add(Game.Bullets[Game.Bullets.length-1].Graphics);
			Game.AmmoLeft--;
			document.getElementById("charammo").innerHTML = "Ammo: " + Game.AmmoLeft;
			Cufon.replace('#charammo');
			if (Game.AmmoLeft == 0) {
				document.getElementById("charammo").innerHTML = "Reloading Ammo";
				Cufon.replace('#charammo');
				Game.Reloading = true;
				setTimeout( function() {
					Game.Reloading = false;
					Game.AmmoLeft = Game.MaxAmmo;
					document.getElementById("charammo").innerHTML = "Ammo: " + Game.AmmoLeft;
					Cufon.replace('#charammo');
				}, Game.ReloadTime);
			}
			break;
		// Up Arrow - Cycle Weapon Up
		case 38:
			break;
		// Down Arrow - Cycle Weapon Down
		case 40:
			break;
		default:
			break;
	}
}, false);
// The Function Call to Check for Keyboard Input
Game.QueryControls = function() {
	// If we're chatting, ignore Keyboard Movement
	if (Game.Chatting == true)
		return;
	// Flag to tell if we've turned (For Networking)
	var turned = false;
	// Establish our movement change vectors
	newMoveVector = { x:0, y:0, z:0 };
	rotVector = { x:0, y:0, z:0 };
	// If we press the right arrow key
	if( Game.Keyboard.pressed('right') ) {
		// Adjust our Rotation Change Vector
		rotVector.y -= Game.LookSpeed;
		// Adjust our Physics Object
		Game.Players[0].Physics.set_rotationY( Game.Players[0].Physics.get_rotationY() - Game.LookSpeed * Math.PI / 180);
		// If the vector is below 0, wrap around the other side of the circle
		if (Game.Players[0].Physics.get_rotationY() < 0)
			Game.Players[0].Physics.set_rotationY( Game.Players[0].Physics.get_rotationY() + Math.PI * 2);
		// Set our turned flag
		var turned = true;
	}
	// If we press the left arrow key
	if( Game.Keyboard.pressed('left') ) {
		// Adjust our Rotation Change Vector
		rotVector.y += Game.LookSpeed;
		// Adjust our Physics Object
		Game.Players[0].Physics.set_rotationY( Game.Players[0].Physics.get_rotationY() + Game.LookSpeed * Math.PI / 180);
		// If the vector is below 0, wrap around the other side of the circle
		if (Game.Players[0].Physics.get_rotationY() > Math.PI * 2)
			Game.Players[0].Physics.set_rotationY( Game.Players[0].Physics.get_rotationY() - Math.PI * 2);
		// Set our turned flag
		var turned = true;
	}
	// If we press the W key
	if( Game.Keyboard.pressed('W') ) {
		// Create a temporary movement vector
		var tempNewMoveVector = newMoveVector;
		tempNewMoveVector.x -= Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		tempNewMoveVector.z -= Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		// Create a temporary position vector
		var position = Game.Players[0].Graphics.position;
		position.x += tempNewMoveVector.x;
		position.z += tempNewMoveVector.z;
		// Create a temporary viewing direction
		var view = new THREE.Vector3(-Math.sin(Game.Players[0].Graphics.rotation.y), 0, -Math.cos(Game.Players[0].Graphics.rotation.y));
		// Test to see if it causes a collision
		Game.CollisionDetection(position, view);
		// If we don't have one
		if (Game.Collision == false) {
			// Move to the new spot
			newMoveVector.x -= Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
			newMoveVector.z -= Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		} else {
			// Stop Moving
			newMoveVector.x = 0;
			newMoveVector.z = 0;
		}
	}
	// If we press the D key
	if( Game.Keyboard.pressed('D') ) {
		// Create a temporary movement vector
		var tempNewMoveVector = newMoveVector;
		tempNewMoveVector.x += Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		tempNewMoveVector.z -= Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		// Create a temporary position vector
		var position = Game.Players[0].Graphics.position;
		position.x += tempNewMoveVector.x;
		position.z += tempNewMoveVector.z;
		// Create a temporary viewing direction
		var view = new THREE.Vector3(Math.cos(Game.Players[0].Graphics.rotation.y), 0, -Math.sin(Game.Players[0].Graphics.rotation.y));
		// Test to see if it causes a collision
		Game.CollisionDetection(position, view);
		// If we don't have one
		if (Game.Collision == false) {
			// Move to the new spot
			newMoveVector.x += Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
			newMoveVector.z -= Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		} else {
			// Stop Moving
			newMoveVector.x = 0;
			newMoveVector.z = 0;
		}
	}
	// If we press the S key
	if( Game.Keyboard.pressed('S') ) {
		// Create a temporary movement vector
		var tempNewMoveVector = newMoveVector;
		tempNewMoveVector.x += Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		tempNewMoveVector.z += Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		// Create a temporary position vector
		var position = Game.Players[0].Graphics.position;
		position.x += tempNewMoveVector.x;
		position.z += tempNewMoveVector.z;
		// Create a temporary viewing direction
		var view = new THREE.Vector3(Math.sin(Game.Players[0].Graphics.rotation.y), 0, Math.cos(Game.Players[0].Graphics.rotation.y));
		// Test to see if it causes a collision
		Game.CollisionDetection(position, view);
		// If we don't have one
		if (Game.Collision == false) {
			// Move to the new spot
			newMoveVector.x += Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
			newMoveVector.z += Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		} else {
			// Stop Moving
			newMoveVector.x = 0;
			newMoveVector.z = 0;
		}
	}
	// If we press the A key
	if( Game.Keyboard.pressed('A') ) {
		// Create a temporary movement vector
		var tempNewMoveVector = newMoveVector;
		tempNewMoveVector.x -= Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
		tempNewMoveVector.z += Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		// Create a temporary position vector
		var position = Game.Players[0].Graphics.position;
		position.x += tempNewMoveVector.x;
		position.z += tempNewMoveVector.z;
		// Create a temporary viewing direction
		var view = new THREE.Vector3(-Math.cos(Game.Players[0].Graphics.rotation.y), 0, Math.sin(Game.Players[0].Graphics.rotation.y));
		// Test to see if it causes a collision
		Game.CollisionDetection(position, view);
		// If we don't have one
		if (Game.Collision == false) {
			// Move to the new spot
			newMoveVector.x -= Game.Speed * Math.cos( Game.Players[0].Graphics.rotation.y );
			newMoveVector.z += Game.Speed * Math.sin( Game.Players[0].Graphics.rotation.y );
		} else {
			// Stop Moving
			newMoveVector.x = 0;
			newMoveVector.z = 0;
		}
	}
	// If we press the Space key
	if( Game.Keyboard.pressed('space') ) {
		// Should not be able to jump while jumping or falling
		// Not quite sure how best to implement this yet...
		if (Game.Players[0].Graphics.position.y > 125)
			Game.CanJump = false;
		if (Game.Players[0].Graphics.position.y < 45)
			Game.CanJump = true;
		if (Game.CanJump == true)
			newMoveVector.y += 50;
	}
	// Apply movements
	if( newMoveVector.x == 0 && newMoveVector.y == 0 && newMoveVector.z == 0 && Game.Moving == true ) {
		// We were moving before, but are no longer. Inform the server
		Game.Socket.emit( 'stop', {
			x:Game.Players[0].Graphics.position.x,
			y:Game.Players[0].Graphics.position.y,
			z:Game.Players[0].Graphics.position.z,
			rot:Game.Players[0].Physics.get_rotationY()
		});
		Game.Moving = false;
	}
	if( newMoveVector.x != Game.Players[0].moveVector.x || newMoveVector.y != Game.Players[0].moveVector.y || newMoveVector.z != Game.Players[0].moveVector.z || turned == true) 		{
		newMoveVector.rot = Game.Players[0].Physics.get_rotationY();
		// We've started moving or changed direction. Inform the server
		Game.Socket.emit( 'move', newMoveVector );
		Game.Players[0].Physics.setVelocity([
			newMoveVector.x,
			newMoveVector.y,
			newMoveVector.z
		]);
		Game.Moving = true;
	}
	Game.Players[0].moveVector = newMoveVector;
	// Apply rotations
	if( rotVector.y != 0 ) {
		Game.Players[0].Physics.setAngVel([
			rotVector.x,
			rotVector.y,
			rotVector.z
		]);
	} else {
		Game.Players[0].Physics.setAngVel([0, 0, 0]);
	}
};
// Updates our Physics Model
Game.PhysicsTick = function(timeInterval) {
	Game.Physics.integrate( timeInterval / 75 );
	currentVelocity = Game.Players[0].Physics.getVelocity([0,0,0]);
	// Adjust X and Z velocity for movement
	for( i = 0; i < Game.Players.length; i++ ) {
		// If the player isn't ready, ignore
		if ( Game.Players[i].Ready == false )
			continue;
		currentVelocity = Game.Players[i].Physics.getVelocity([0,0,0]);
		Game.Players[i].Physics.setVelocity([
			Game.Players[i].moveVector.x,
			currentVelocity[1],
			Game.Players[i].moveVector.z
		]);
	}
	for( i = 0; i < Game.Players.length; i++ ) {
		// If the player isn't ready, ignore
		if ( Game.Players[i].Ready == false )
			continue;
		Game.Players[i].Graphics.position.x = Game.Players[i].Physics.get_x();
		Game.Players[i].Graphics.position.y = Game.Players[i].Physics.get_y();
		Game.Players[i].Graphics.position.z = Game.Players[i].Physics.get_z();
		
		Game.Players[i].Graphics.rotation.x = Game.Players[i].Physics.get_rotationX();
		Game.Players[i].Graphics.rotation.y = Game.Players[i].Physics.get_rotationY();
		Game.Players[i].Graphics.rotation.z = Game.Players[i].Physics.get_rotationZ();
	}
};
// Moves the Camera to the Initial Player Element
Game.CameraFollow =  function() {
	// Setting the camera position to the player position aligns the camera with the player's crotch
	Game.Camera.position = Game.Players[0].Graphics.position;
	// To resolve this we'll increase the Y coordinate slightly
	Game.Camera.position.y = Game.Camera.position.y + 25;
	Game.Camera.rotation = Game.Players[0].Graphics.rotation;
};