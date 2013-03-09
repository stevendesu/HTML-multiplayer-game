/***************************
 *  Graphics Module
 *    - Handles Our Graphics
 *      Output Logic
 **************************/
 
// Make Sure Our Window Can Refresh Itself
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	}) ();
}

Game.Maze.BlockSize = 400;
Game.Maze.Width = Game.Maze.Height = 20;
Game.Maze.WallHeight = 400;
Game.Maze.WallWidth = 10;

Game.Maze.Walls = [00, 01, 11, 10, 00, 01, 00, 01, 10, 10, 10, 01, 10, 01, 00, 00, 11, 00, 11, 10,
		10, 01, 01, 10, 11, 00, 11, 10, 10, 00, 01, 10, 01, 10, 11, 10, 00, 11, 00, 11,
		00, 01, 01, 00, 00, 11, 00, 11, 11, 00, 10, 01, 10, 01, 00, 00, 11, 00, 11, 10,
		10, 01, 00, 10, 11, 00, 11, 10, 00, 01, 01, 10, 01, 00, 11, 01, 00, 11, 00, 11,
		01, 11, 10, 01, 01, 10, 10, 01, 11, 01, 00, 11, 00, 01, 10, 00, 01, 10, 01, 10,
		00, 01, 00, 01, 01, 10, 01, 10, 01, 00, 11, 00, 11, 10, 10, 10, 10, 01, 10, 10,
		10, 00, 01, 11, 00, 01, 11, 00, 01, 01, 00, 11, 00, 01, 11, 01, 01, 10, 01, 10,
		10, 01, 00, 11, 10, 00, 01, 01, 01, 10, 10, 00, 11, 10, 10, 10, 10, 01, 10, 11,
		01, 11, 10, 10, 10, 10, 00, 01, 10, 10, 00, 11, 00, 01 ,10, 01, 00, 10, 01, 10,
		00, 01, 01, 00, 10, 10, 01, 11, 10, 00, 00, 01, 11, 10, 11, 00, 10, 01, 00, 10,
		00, 01, 11, 10, 10, 01, 01, 01, 11, 10, 00, 01, 01, 00, 01, 10, 01, 11, 10, 10,
		10, 00, 01, 10, 01, 01, 01, 01, 00, 11, 00, 01, 11, 10, 10, 01, 00, 01, 11, 10,
		10, 10, 10, 00, 01, 00, 01, 01, 11, 00, 11, 01, 01, 11, 01, 01, 01, 10, 01, 11,
		10, 10, 10, 01, 10, 01, 00, 10, 00, 11, 00, 01, 01, 01, 00, 00, 01, 01, 01, 10,
		10, 10, 01, 10, 01, 10, 11, 00, 01, 01, 10, 01, 01, 10, 10, 10, 01, 01, 10, 10,
		10, 01, 11, 01, 10, 01, 01, 10, 00, 10, 00, 01, 01, 10, 10, 01, 00, 01, 11, 10,
		00, 01, 01, 01, 00, 01, 00, 01, 10, 10, 10, 01, 01, 00, 00, 11, 10, 00, 00, 10,
		10, 00, 01, 00, 11, 10, 00, 10, 01, 10, 00, 01, 11, 10, 10, 00, 10, 01, 01, 10,
		10, 10, 01, 11, 00, 11, 10, 01, 00, 01, 10, 01, 01, 10, 10, 10, 01, 01, 10, 10,
		01, 01, 01, 01, 11, 01, 01, 11, 01, 11, 01, 01, 01, 11, 01, 01, 01, 01, 11, 11];

// Load our Floor Texture into Memory and Establish Tiling
Game.FloorTexture = THREE.ImageUtils.loadTexture( "textures/dirt_small.png" );
Game.FloorTexture.wrapT = THREE.RepeatWrapping;
Game.FloorTexture.wrapS = THREE.RepeatWrapping;
Game.FloorTexture.repeat.set(Game.Maze.Width, Game.Maze.Height);
Game.FloorTexture.needsUpdate = true;
Game.FloorMaterial = new THREE.MeshPhongMaterial( { map: Game.FloorTexture });
// Load our Long Wall Texture into Memory and Establish Tiling
Game.WallTexture = THREE.ImageUtils.loadTexture( "textures/wall.png" );
Game.WallTexture.wrapT = THREE.RepeatWrapping;
Game.WallTexture.wrapS = THREE.RepeatWrapping;
Game.WallTexture.repeat.set(Game.Maze.Width, 1);
Game.WallTexture.needsUpdate = true;
Game.WallMaterial = new THREE.MeshLambertMaterial( { map: Game.WallTexture });
// Load our Short Wall Texture into Memory without Tiling
Game.ShortWallTexture = THREE.ImageUtils.loadTexture( "textures/wall.png" );
Game.ShortWallTexture.wrapT = THREE.RepeatWrapping;
Game.ShortWallTexture.wrapS = THREE.RepeatWrapping;
Game.ShortWallTexture.repeat.set(1, 1);
Game.ShortWallTexture.needsUpdate = true;
Game.ShortWallMaterial = new THREE.MeshPhongMaterial( { map: Game.ShortWallTexture });
		
// Our Initialization Function
Game.Initialize = function() {
	Cufon.replace('#menu h1');
	Cufon.replace('#menu h4');
	Cufon.replace('#points');
	// Notify the Player we are Working
	Game.Info.innerHTML = "Loading…";
	
	// Add our Camera Object
	Game.Scene.add(Game.Camera);
	
	// Add our Lights
	Game.Scene.add(Game.Lights[0]);
	Game.Scene.add(Game.Lights[1]);
	
	var urlPrefix = "textures/";
	var urls = [urlPrefix + "mars_positive_x.jpg", 
				urlPrefix + "mars_negative_x.jpg", 
				urlPrefix + "mars_positive_y.jpg", 
				urlPrefix + "mars_negative_y.jpg", 
				urlPrefix + "mars_positive_z.jpg", 
				urlPrefix + "mars_negative_z.jpg"];
	Game.SkyBox = THREE.ImageUtils.loadTextureCube( urls );
	
	var shader = THREE.ShaderUtils.lib["cube"];
	shader.uniforms['tCube'].texture = Game.SkyBox;
	var material = new THREE.ShaderMaterial({
		fragmentShader	: shader.fragmentShader,
		vertexShader	: shader.vertexShader,
		uniforms		: shader.uniforms
	});
	
	Game.SkyBoxMesh = new THREE.Mesh(
		new THREE.CubeGeometry( 20000, 20000, 20000), 
		material 
	);
	
	Game.SkyBoxMesh.flipSided = true;
	
	Game.Scene.add(Game.SkyBoxMesh);
	
	// Add our Render Target to the Page
	document.body.appendChild(Game.Renderer.domElement);
	
	// Establish our Physics
	Game.Physics.setGravity([0, Game.Gravity, 0, 0]);
	Game.Physics.setSolverType('NORMAL');	
	
	// Create the Floor Mesh Object
	Game.Ground.Graphics = new THREE.Mesh(
		new THREE.PlaneGeometry(Game.Maze.Width * Game.Maze.BlockSize, Game.Maze.Height * Game.Maze.BlockSize, 1, 1),
		Game.FloorMaterial
	);
	Game.Ground.Graphics.rotation.x = -90 * Math.PI / 180;
	Game.Scene.add(Game.Ground.Graphics);
	
	// Create the Floor Physics Object
	Game.Ground.Physics = new jigLib.JPlane(null, [0, 1, 0, 0]);
	Game.Ground.Physics.set_friction(10);
	Game.Physics.addBody(Game.Ground.Physics);
	
	// Initialize a Counter for our Walls
	var wallCount = 0;
	
	// Initialize One Outer Wall
	Game.Walls[wallCount] = new THREE.Mesh(
		new THREE.CubeGeometry(Game.Maze.WallWidth, Game.Maze.WallHeight, Game.Maze.BlockSize * Game.Maze.Width + Game.Maze.WallWidth * 2),
		Game.WallMaterial
	);
	
	// Position the Wall
	Game.Walls[wallCount].position.x = Game.Maze.BlockSize * Game.Maze.Width / 2;
	Game.Walls[wallCount].position.y = 0;
	Game.Walls[wallCount].position.z = 0;
	
	// Add it to our Scene and Increment our Counter
	Game.Scene.add(Game.Walls[wallCount]);
	wallCount++;
	
	// Initialize Another Outer Wall
	Game.Walls[wallCount] = new THREE.Mesh(
		new THREE.CubeGeometry(Game.Maze.BlockSize * Game.Maze.Height + Game.Maze.WallWidth * 2, Game.Maze.WallHeight, Game.Maze.WallWidth),
		Game.WallMaterial
	);
	
	// Position the Wall
	Game.Walls[wallCount].position.x = 0;
	Game.Walls[wallCount].position.y = 0;
	Game.Walls[wallCount].position.z = Game.Maze.BlockSize * Game.Maze.Height / 2;
	
	// Add it to our Scene and Increment our Counter
	Game.Scene.add(Game.Walls[wallCount]);
	wallCount++;
	
	// Begin to Loop through our Maze Array, Drawing the Walls
	for (var w = 0; w < Game.Maze.Width; w++) {
		for (var h = 0; h < Game.Maze.Height; h++) {
			// Create the Walls Based on the Current Block
			switch (Game.Maze.Walls[w+Game.Maze.Width*h]) {
				// If the block contains no walls we skip
				case 00:
					break;
				// We draw a Horizontal Wall on the Bottom for a Right Bit
				case 01:
					// Create the Mesh
					Game.Walls[wallCount] = new THREE.Mesh(
						new THREE.CubeGeometry(Game.Maze.BlockSize + Game.WallOverlap, Game.Maze.WallHeight, Game.Maze.WallWidth),
						Game.ShortWallMaterial
					);
					// Position the Mesh along the Bottom Edge of the Current Block
					Game.Walls[wallCount].position.x = (Game.Maze.BlockSize * Game.Maze.Width / 2) - (Game.Maze.BlockSize * w) - (Game.Maze.BlockSize / 2);
					Game.Walls[wallCount].position.y = 0;
					Game.Walls[wallCount].position.z = (Game.Maze.BlockSize * Game.Maze.Height / 2) - (Game.Maze.BlockSize * (h + 1));
					// Add the Mesh to the Scene and Increment our Counter
					Game.Scene.add(Game.Walls[wallCount]);
					wallCount++;
					break;
				// We draw a Vertical Wall on the Right for a Left Bit
				case 10:
					// Create the Mesh
					Game.Walls[wallCount] = new THREE.Mesh(
						new THREE.CubeGeometry(Game.Maze.WallWidth, Game.Maze.WallHeight, Game.Maze.BlockSize + Game.WallOverlap),
						Game.ShortWallMaterial
					);
					// Position the Mesh along the Right Edge of the Current Block
					Game.Walls[wallCount].position.x = (Game.Maze.BlockSize * Game.Maze.Width / 2) - (Game.Maze.BlockSize * (w + 1));
					Game.Walls[wallCount].position.y = 0;
					Game.Walls[wallCount].position.z = (Game.Maze.BlockSize * Game.Maze.Height / 2) - (Game.Maze.BlockSize * h) - (Game.Maze.BlockSize / 2);
					// Add the Mesh to the Scene and Increment our Counter
					Game.Scene.add(Game.Walls[wallCount]);
					wallCount++;
					break;
				// Both Bits means we need to draw the Right and Bottom Wall
				case 11:
					// Create the Bottom Wall
					Game.Walls[wallCount] = new THREE.Mesh(
						new THREE.CubeGeometry(Game.Maze.BlockSize + Game.WallOverlap, Game.Maze.WallHeight, Game.Maze.WallWidth),
						Game.ShortWallMaterial
					);
					Game.Walls[wallCount].position.x = (Game.Maze.BlockSize * Game.Maze.Width / 2) - (Game.Maze.BlockSize * w) - (Game.Maze.BlockSize / 2);
					Game.Walls[wallCount].position.y = 0;
					Game.Walls[wallCount].position.z = (Game.Maze.BlockSize * Game.Maze.Height / 2) - (Game.Maze.BlockSize * (h + 1));
					Game.Scene.add(Game.Walls[wallCount]);
					wallCount++;
					// Create the Right Wall
					Game.Walls[wallCount] = new THREE.Mesh(
						new THREE.CubeGeometry(Game.Maze.WallWidth, Game.Maze.WallHeight, Game.Maze.BlockSize + Game.WallOverlap),
						Game.ShortWallMaterial
					);
					Game.Walls[wallCount].position.x = (Game.Maze.BlockSize * Game.Maze.Width / 2) - (Game.Maze.BlockSize * (w + 1));
					Game.Walls[wallCount].position.y = 0;
					Game.Walls[wallCount].position.z = (Game.Maze.BlockSize * Game.Maze.Height / 2) - (Game.Maze.BlockSize * h) - (Game.Maze.BlockSize / 2);
					Game.Scene.add(Game.Walls[wallCount]);
					wallCount++;
					break;
			}
		}
	}
	
	// Inform the Player We're Ready
	Game.Info.innerHTML = "Loaded!";
};

window.onload = Game.Initialize();

// Link the Play Button to our Start Function
document.getElementById("play_button").addEventListener('click', function (event) {
	event.preventDefault();
	Game.Start();
});

Game.Connect = function() {
	Game.Info.innerHTML = "Connecting...";
	
	// Create Socket Connection to the Server
	Game.Socket = io.connect(Game.Server);
	Game.Socket.on('news', Game.HandleNetwork);
	
	// Create a 'Player' Object to Sync with Movements
	Game.Players[0].Graphics = new THREE.Mesh(
		new THREE.SphereGeometry( 20, 16, 16 ),
		new THREE.MeshLambertMaterial({
			color: Math.random() * 0xff0000
		})
	);
	
	// Put the 'Player' into the Scene
	Game.Players[0].Graphics.position.x = 0;//Math.random() * 2000 - 2000;
	Game.Players[0].Graphics.position.y = 400;
	Game.Players[0].Graphics.position.z = 0;//Math.random() * 2000 - 2000;
	Game.Players[0].Graphics.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
	
	// Move the Camera to the 'Player'
	Game.CameraFollow();
	
	Game.Scene.add( Game.Players[0].Graphics );
	
	// Add the Player to our Physics Model
	Game.Players[0].Physics = new jigLib.JSphere(null, 20);
	Game.Players[0].Physics.moveTo([
		Game.Players[0].Graphics.position.x,
		Game.Players[0].Graphics.position.y,
		Game.Players[0].Graphics.position.z
	]);
	Game.Players[0].Physics.setRotation([
		Game.Players[0].Graphics.rotation.x,
		Game.Players[0].Graphics.rotation.y,
		Game.Players[0].Graphics.rotation.z
	]);
	Game.Players[0].Physics.set_mass(100);
	Game.Players[0].Physics.set_friction(0);
	
	Game.Physics.addBody( Game.Players[0].Physics );
	
	// Set Player Initial Values
	Game.Players[0].Ping = 999;
	Game.Players[0].moveVector = { x:0, y:0, z:0 };
	if (document.getElementById("username").value.length > 0)
		Game.Players[0].Name = document.getElementById("username").value;
	else
		Game.Players[0].Name = "Default" + Math.floor(Math.random() * 999);
	
	document.getElementById("charname").innerHTML = Game.Players[0].Name;
	
	Cufon.replace('#charname');
	
	document.getElementById("charammo").innerHTML = "Ammo: " + Game.AmmoLeft;
	
	Cufon.replace('#charammo');
	
	// Initialize our Timer
	Game.LastUpdate = new Date().getTime();
	
	Game.Info.innerHTML = "Connected!";
}

// Changes the GUI and Starts the Game Loop
Game.Start = function() {
	Game.Connect();
	Game.Menu.style.display = "none";
	Game.Points.style.display = "block";
	$("#stats").show('fast');
	Game.Points.innerHTML = Game.Score;
	Cufon.replace('#points');
	Game.Playing = true;
	Game.Animate();
};

// Game Loop Function
Game.Animate = function() {
	var now = new Date().getTime();
	var diff = now - Game.LastUpdate;
	Game.LastUpdate = now;
	Game.Info.innerHTML = "FPS: " + Math.floor(1000 / diff) + "<br>Ping: " + Game.Players[0].Ping;
	Game.QueryControls();
	Game.PhysicsTick(diff);
	Game.CameraFollow();
	Game.UpdateBullets();
	Game.Renderer.render(Game.Scene, Game.Camera);
	window.requestAnimationFrame(Game.Animate);
};

// Resize our Game on Window Size Changes
window.onresize = function () {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	ASPECT = WIDTH / HEIGHT;
	var camera = new THREE.PerspectiveCamera( VIEW_ANGLE,
								ASPECT,
								NEAR,
								FAR );
	camera.position = Game.Camera.position;
	camera.rotation = Game.Camera.rotation;
	Game.Camera = camera;
	Game.Renderer.setSize(WIDTH, HEIGHT);
};