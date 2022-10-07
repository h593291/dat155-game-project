import MouseLookController from './MouseLookController.js';

import { Renderer, Scene, Node, Mesh, Primitive, Light, BasicMaterial, CubeMapMaterial, PerspectiveCamera, vec3, vec4 } from '../lib/engine/index.js';
import { CollisionObject, PhysicsManager } from './physics/index.js';
import ObstacleManager from './obstacles/ObstacleManager.js';

// Create a Renderer and append the canvas element to the DOM.
let renderer = new Renderer(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Scene.
const scene = new Scene();

// Create a PhysicsManager. The physicsManager will handle all physics related tasks such as collision detection etc.
const physicsManager = new PhysicsManager();

// Create an ObstacleManager. The obstacleManager will create and manage obstacles in the game.
const floorTexture = renderer.loadTexture('resources/dev_dfloor.png');
const blockTexture = renderer.loadTexture('resources/dev_grid.png');
const obstacleManager = new ObstacleManager(scene, physicsManager, floorTexture, blockTexture);

const boxMaterial = new BasicMaterial({
    color: vec4.fromValues(1.0, 0.8, 0.8, 1.0),
    map: renderer.loadTexture('resources/dev_grid.png')
});

// Create a box primitive with the helper function create box.
const boxPrimitive = Primitive.createCube(boxMaterial);

// We create a scenegraph Node to represent the player in the world.
const player = new Node(scene); // We pass scene as an argument to make the player a child of the scene node.

const light = new Light({
    diffuse: vec4.fromValues(134/255, 31/255, 42/255, 1.0),
    specular: vec4.fromValues(0.4, 0.4, 0.4, 1.0)
});

player.add(light);

// Move the player back slightly (-z is forward) so that the first chunk is generated properly.
player.applyTranslation(0, 0, 1);
// Create a Mesh representing the player.
const playerMesh = new Mesh([boxPrimitive]);
playerMesh.applyScale(0.5, 0.5, 0.5);

// Translate mesh so that it touches the floor.
playerMesh.applyTranslation(0.0, -0.25, 0.0);

// Add the Mesh to the player node.
player.add(playerMesh);

// Create a CollisionObject for the player.
const playerCollisionObject = new CollisionObject(playerMesh);
playerCollisionObject.dynamic = true;
playerCollisionObject.health = 3;

// Add an OnIntersectListener so that we can react to the player colliding into other CollisionObjects in the world.
playerCollisionObject.setOnIntersectListener((delta, entity) => {
    // 'entity' is the CollisionObject with which the player intersected.

    // We remove the Mesh from the Scene,
    scene.remove(entity.mesh);

    // and destroy the collision object.
    entity.destroy();

    playerCollisionObject.health -= 1;

    if(playerCollisionObject.health === 0) {
        if(window.alert("You died")) {}
        else    window.location.reload();
    }
});

physicsManager.add(playerCollisionObject);

// We create a PerspectiveCamera with a fovy of 70, aspectRatio, and near and far clipping plane.
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);

// We specify an amount to rotate the camera around the x-axis when following the player object.
// This variable is used further down in the code.
const cameraTilt = -28.5;

// We need to update some properties in the camera and renderer if the window is resized.
window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);


// We create a MouseLookController to enable rotating the camera with a mouse.
// Press 'F' to toggle this mode in the game.
const mouseLookController = new MouseLookController(camera);

// Further down in the code we're gonna add a skybox to the scene.
// To prevent the skybox from rotating with the camera we attach the camera to another node called the moveNode.
// The moveNode will remain axis-aligned (i.e. no rotation).
const moveNode = new Node();
moveNode.add(camera);

// We attach a click lister to the canvas-element so that we can request a pointer lock.
// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
const canvas = renderer.domElement;
canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

let yaw = 0;
let pitch = 0;

function updateCamRotation(event) {
    yaw -= event.movementX * 0.001;
    pitch -= event.movementY * 0.001;
}

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        canvas.addEventListener('mousemove', updateCamRotation, false);
    } else {
        canvas.removeEventListener('mousemove', updateCamRotation, false);
    }
});


let move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.005,
    mode: 0
};

window.addEventListener('keydown', (e) => {
    e.preventDefault();

    if (e.code === 'KeyF') {

        // Toggle move mode.
        move.mode = (move.mode + 1) % 2;

        // Depending on the mode we swiched to we may have to do some stuff.
        if (move.mode === 1) {

            player.remove(moveNode);
            scene.add(moveNode);

            moveNode.setTranslation(player.translation[0], player.translation[1] + 4, player.translation[2] + 8);

        } else {

            // reset moveNode translation and camera rotation.
            moveNode.setTranslation(0.0, 0.0, 0.0);
            camera.setRotationFromEuler(0.0, 0.0, 0.0);

            // place camera according to player
            scene.remove(moveNode);
            player.add(moveNode);
            moveNode.setTranslation(0, 4, 8);

            camera.setRotationFromEuler(cameraTilt, 0.0, 0.0);

        }
    }
});

window.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === 'KeyW') {
        move.forward = true;
    } else if (e.code === 'KeyS') {
        move.backward = true;
    } else if (e.code === 'KeyA') {
        move.left = true;
    } else if (e.code === 'KeyD') {
        move.right = true;
    }
});

window.addEventListener('keyup', (e) => {
    e.preventDefault();
    if (e.code === 'KeyW') {
        move.forward = false;
    } else if (e.code === 'KeyS') {
        move.backward = false;
    } else if (e.code === 'KeyA') {
        move.left = false;
    } else if (e.code === 'KeyD') {
        move.right = false;
    }
});

// To make the camera follow the player we add moveNode to the player node.
player.add(moveNode);

// Position the camera according to the player.
moveNode.setTranslation(0, 4, 8);

// Tilt the camera down slightly.
camera.setRotationFromEuler(cameraTilt, 0.0, 0.0);

let skyBoxMaterial = new CubeMapMaterial({
    map: renderer.loadCubeMap([
        'resources/skybox/right.png',
        'resources/skybox/left.png',
        'resources/skybox/top.png',
        'resources/skybox/bottom.png',
        'resources/skybox/front.png',
        'resources/skybox/back.png'
    ])
});

let skyBoxPrimitive = Primitive.createCube(skyBoxMaterial, true); // Second argument tells the createBox function to invert the faces and normals of the box.

let skyBox = new Mesh([skyBoxPrimitive]);
skyBox.setScale(1500, 1500, 1500);

// Add the skybox to moveNode to increase the sense of distance to the skybox.
moveNode.add(skyBox);


// this update is very important, to make sure nodes are positioned correctly before the first physics update.
scene.update();

// We create a vec3 to hold the players velocity (this way we avoid allocating a new one every frame).
const velocity = vec3.fromValues(0.0, 0.0, 0.0);
let then = 0;
function loop(now) {

    let delta = now - then;
    then = now;

    const moveSpeed = move.speed * delta;

    vec3.set(velocity, 0.0, 0.0, 0.0);


    if (move.left) {
        velocity[0] -= moveSpeed;
    }

    if (move.right) {
        velocity[0] += moveSpeed;
    }

    if (move.mode === 0) {

        velocity[2] -= moveSpeed * 2;
        player.applyTranslation(...velocity); // using the spread operator ( equivalent to ..applyTranslation(velocity[0], velocity[1], velocity[2]); )

    } else if (move.mode === 1) {

        if (move.forward) {
            velocity[2] -= moveSpeed;
        }

        if (move.backward) {
            velocity[2] += moveSpeed;
        }

        // free flight.
        mouseLookController.update(pitch, yaw);

        // apply rotation to velocity vector, and translate moveNode with it.
        vec3.transformQuat(velocity, velocity, camera.rotation);
        moveNode.applyTranslation(...velocity);

    }

    // reset mouse movement accumulator every frame.
    yaw = 0;
    pitch = 0;

    // update chunks here.
    obstacleManager.update(player.translation[2]);

    // physics updates here.
    physicsManager.update(delta);

    // update the world matrices of the entire scene graph.
    scene.update();
    
    renderer.render(scene, camera);

    // Ask the the browser to draw when it's convenient
    window.requestAnimationFrame(loop);

}

window.requestAnimationFrame(loop);