/****************************
 * Var Javascript File
 *    Global Variables
 *
 ***************************/

// Window and Camera Sizing Variables
var WIDTH = window.innerWidth;			// Our Window Width
var HEIGHT = window.innerHeight;		// Our Window Height
var VIEW_ANGLE = 60;					// The Perspective Angle of our Camera
var ASPECT = WIDTH / HEIGHT;			// The Aspect Ratio of the Camera
var NEAR = 0.1;							// The Close Range Stop
var FAR = 20000;						// The Far Range Stop

// Our Game Encapsulation Object
var Game = {};

/******************
 * Game Object Globals
 ******************/

// Movement
Game.Gravity	= -9.8;					// The Gravity Constant in the World
Game.Speed		= 25;					// The Movement Speed of the Players
Game.LookSpeed	= 5;					// The Speed at which the Camera Turns
Game.Moving 	= false;				// Variable to tell whether we are in motion

// Sizes
Game.BulletSize = 2;					// The size of the bullets to draw
Game.WallOverlap = 0;					// How far the Walls Overlap Into Each Other

// Network
Game.Server		= "64.250.114.60:2143";	// IP Address (And Socket) of Game Server

// GUI Elements
Game.Menu = document.getElementById('menu');			// Menu DIV Box
Game.Points = document.getElementById('points');		// Points DIV Box
Game.Info = document.getElementById('fps');				// Info (FPS) DIV Box
Game.ChatContainer = document.getElementById('chat');	// Our Chat DIV Box
Game.Stats = document.getElementById('stats');			// Stats DIV Box

// Three.JS Elements
Game.Renderer = new THREE.WebGLRenderer();									// Three.JS WebGLRenderer
Game.Renderer.setSize(WIDTH, HEIGHT);										// Initialize Renderer Size
Game.Camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);	// Three.JS Camera
Game.Scene = new THREE.Scene();												// Three.JS Scene

// Timing
Game.Clock = new THREE.Clock();						// Three.JS Clock

// Physics
Game.Physics = jigLib.PhysicsSystem.getInstance();	// Physics Engine

// Objects
Game.Ground = {};						// The Ground Object
Game.Walls = [];						// Array to Store Walls
Game.Lights = [];						// Array to Store Lights

// Our Maze Arrangement Object
Game.Maze = {};

// Lighting Setup
Game.Lights[0] = new THREE.DirectionalLight( 0xffffff, 2 );
Game.Lights[0].position.set( 1, 1, 1 ).normalize();

Game.Lights[1] = new THREE.DirectionalLight( 0xffffff );
Game.Lights[1].position.set( -1, -1, -1 ).normalize();

// Game Flags
Game.Collision = false;
Game.Chatting = false;
Game.CanJump = true;
Game.Playing = false;

// Game Attack-System
Game.Bullets = [];
Game.BulletSpeed = 100;
Game.MaxAmmo = 10;
Game.AmmoLeft = Game.MaxAmmo;
Game.Reloading = false;
Game.ReloadTime = 2000;
Game.Score = 0;
Game.Weapon = 0;
Game.WeaponCount = 2;

// Controls
Game.Keyboard = new THREEx.KeyboardState();			// Keyboard Handler

// Chat Data
Game.ChatFadeTimout = setTimeout( Game.ChatFade, 0 );	// Used to fade the chat window 30 seconds after a new message
Game.ChatMessages = [];									// Array of all messages receieved via chat

// Player Data
Game.Players = [];						// Array to Store Player Info
Game.Players[0] = {};					// Local Player Object