// Import stuff
import * as THREE from '../js/three.module.js';
import { OrbitControls } from '../controls/OrbitControls.js';
import Stats from '../libs/stats.module.js';
import { GUI } from '../gui/dat.gui.module.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';
import { STLExporter } from '../exporters/STLExporter.js';


// Set up variables
var camera, controls, scene, renderer, container, stats;
var hemiLight, dirLight;
var exporter;
var model, skeleton, mixer, clock;
var pendulum;
var mixerUpdateDelta


var ground, grid;


init();

function init() {

	console.log("Version 12")
	clock = new THREE.Clock();

	// Container for UI 
	container = document.getElementById( 'container' );
	
	// Set up exporter
	exporter = new STLExporter();
	var buttonExportBinary = document.getElementById( 'exportBinary' );
	buttonExportBinary.addEventListener( 'click', exportBinary );
	
	// Create the scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 40, 60 );

	// Create the renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// Create a camera
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 25, 35, 25 );
	camera.lookAt( 0, 30, 0 );
	
	// Controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.screenSpacePanning = true;
	controls.enablePan = true;
	controls.minDistance = 25;
	controls.maxDistance = 50;
	controls.target.set( 0, 2, 0 );
	controls.maxPolarAngle = Math.PI * 0.495; //Hopefully restricts vertical camera rotations. Needs further adjustment
	
	controls.update();

	// Add lights
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.position.set( 0, 50, 0 );
	scene.add( hemiLight ); 
	
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 ); 
	dirLight.position.set( - 1, 1.75, 1 );
	dirLight.position.multiplyScalar( 30 );
	scene.add( dirLight );

	dirLight.castShadow = true;

	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	var d = 50;

	dirLight.shadow.camera.left = - d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = - d;

	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = - 0.0001;
	
	// Not sure 100% what this does
	stats = new Stats();
	container.appendChild( stats.dom );
	
	
	
	// Import object using GLFT loader
	var loader = new GLTFLoader();
	/*loader.load( 'models/gltf/GhostPirate.glb', function ( gltf ) {

		model = gltf.scene;
		//model.material.flatShading = false;
		
		scene.add( model );

		model.traverse( function ( object ) {
			if ( object.isMesh ) object.castShadow = true;
		} );
	} ); */
	
	loader.load( 'models/gltf/Cube.glb', function ( gltf ) {

		model = gltf.scene;
		scene.add( model );

		model.traverse( function ( object ) {

			if ( object.isMesh ) object.castShadow = true;

		} );

		skeleton = new THREE.SkeletonHelper( model );
		skeleton.visible = true;
		scene.add( skeleton );

		var animations = gltf.animations;
		mixer = new THREE.AnimationMixer( model );

		
	} );

	createPanel();

	createGround();
	
	animate();
	
}


function exportBinary() {
	var result = exporter.parse( model, { binary: true } );
	saveArrayBuffer( result, 'test2.stl' );
}


function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}

function saveArrayBuffer( buffer, filename ) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

// Animation loop
function animate() {
	

	// Get the time elapsed since the last frame, used for mixer update

	mixerUpdateDelta = clock.getDelta();

	// Update the animation mixer, the stats panel, and render this frame

	mixer.update( mixerUpdateDelta );

	stats.update();
	
	scene.traverse(function(child) {
		if (child instanceof THREE.SKinnedMesh) {
			//child.rotation.y += 0.01;
		
			child.skeleton.bones[0].rotation.z = guiControls.Bone_0;
			child.skeleton.bones[1].rotation.z = guiControls.Bone_1;
			child.skeleton.bones[2].rotation.z = guiControls.Bone_2;
			child.skeleton.bones[3].rotation.z = guiControls.Bone_3;
		}
		else if (child instanceof THREE.SkeletonHelper) {
			child.update();
		}
	});

	renderer.render( scene, camera );
}

// Adds ground and a grid
function createGround() {
	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );
	
	// Add a grid to the ground     GridHelper( size : number, divisions : Number, colorCenterLine : Color, colorGrid : Color )
	grid = new THREE.GridHelper( 100, 100);
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	scene.add( grid );
}


function modifyTimeScale( speed ) {

	mixer.timeScale = speed;

}



/*var controls = new function() {
	this.rotation.z = 0.00;
}*/


function createPanel() {

	var panel = new GUI( { width: 310 } );

	var folder = panel.addFolder( 'Controls' );
	
	

	/*folder.add(settings, 'Bone_0', -3.14, 3.14);
	folder.add(settings, 'Bone_1', -3.14, 3.14);
	folder.add(settings, 'Bone_2', -3.14, 3.14);
	folder.add(settings, 'Bone_3', -3.14, 3.14);*/

}









