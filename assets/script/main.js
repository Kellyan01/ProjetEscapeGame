import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //loader for GLTF files
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; //controls for camera movement
import { DragControls } from 'three/addons/controls/DragControls.js'; //controls for dragging objects
import { TransformControls } from 'three/addons/controls/TransformControls.js'; //controls for transforming objects

///////////////////////////////////////////////////
//  SCENE SETUP
///////////////////////////////////////////////////

//Create the scene
const scene = new THREE.Scene();
//Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//Add the renderer to the document
document.body.appendChild(renderer.domElement);

///////////////////////////////////////////////////
//  PRIMITIVE OBJECTS
///////////////////////////////////////////////////

//Create a cube geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
//Create a phong material with color
const material = new THREE.MeshPhongMaterial({ color: 0x9900dd });
//Create a mesh with the geometry and material
const cube = new THREE.Mesh(geometry, material);
//Add the cube to the scene
scene.add(cube);
//Cube position
cube.position.set(3, 2, 1); //Position the cube above the ground


//Position the camera to view the cube from 3/4 top angle
camera.position.z = 10;
camera.position.x = 10;
camera.position.y = 10;
camera.lookAt(cube.position);

///////////////////////////////////////////////////
//  GROUND PLANE
///////////////////////////////////////////////////

//Create a ground plane
const planeSize = 42; //Size of the ground plane
const loaderGround = new THREE.TextureLoader(); //Create a texture loader for the ground plane
const texture = loaderGround.load('./public/texture/checker.png'); //Load the texture for the ground plane
texture.wrapS = THREE.RepeatWrapping; //Set the texture to repeat
texture.wrapT = THREE.RepeatWrapping; //Set the texture to repeat
texture.magFilter = THREE.NearestFilter; //Set the texture filter to nearest for pixelated effect
texture.colorSpace = THREE.SRGBColorSpace; //Set the color space for the texture
const repeat = planeSize / 2; //Set the repeat value for the texture
texture.repeat.set(repeat, repeat); //Set the texture to repeat

//Create a plane geometry for the ground
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
//Create a mesh with the plane geometry and the texture material
const planeMaterial = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide
});
//Create a mesh with the plane geometry and the material
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//Rotate the plane to be horizontal
plane.rotation.x = -Math.PI / 2; //Rotate the plane to be horizontal
//Add the plane to the scene
scene.add(plane);

///////////////////////////////////////////////////
//  LOAD 3D MODEL
///////////////////////////////////////////////////

//Load a GLTF model
const loader = new GLTFLoader();
loader.load('./public/model3D/funko_test_model.glb',
    function(gltf) {
        //Add the loaded model to the scene
        scene.add(gltf.scene);
        //Scale the model to fit in the scene
        gltf.scene.scale.set(0.02, 0.02, 0.02);
    },
    undefined,
    function(error) {
        console.error(error);
    }
);

//load blue shell
const loaderShell = new GLTFLoader();
//variables
let isRotating = false;
let lastMouseX = 0;
let lastMouseY = 0;
//Raycaster for detecting mouse clicks on the shell model
const raycaster = new THREE.Raycaster();
//Mouse vector for detecting mouse position
const mouse = new THREE.Vector2();

loaderShell.load('./public/model3D/Shell_(Blue).glb',
    function(gltf) {
        console.log(gltf.scene);

        // create a pivot point for the shell model
        const shellPivot = new THREE.Group();
        scene.add(shellPivot);

        // Set the shell model's position relative to the pivot point
        const boxShell = new THREE.Box3().setFromObject(gltf.scene);
        const centerShell = new THREE.Vector3();
        boxShell.getCenter(centerShell);
        gltf.scene.position.sub(centerShell);

        //create a parent group
        const shellGroup = new THREE.Group();
        //Add the loaded model to the group
        shellGroup.add(gltf.scene); 

        // Set the shell model's position and scale
        shellPivot.add(shellGroup);
        shellPivot.position.set(-5, 2, 1);
        shellPivot.scale.set(0.015, 0.015, 0.015);

        let rotationX = 0;

        // Add event listeners for mouse events to rotate the shell model
        renderer.domElement.addEventListener('mousedown', (event) => {
            // Bounding box calculation to get the mouse position relative to the canvas
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Set the raycaster from the camera and mouse position
            raycaster.setFromCamera(mouse, camera);
            
            // Check for intersections with the shell group
            const intersects = raycaster.intersectObject(shellGroup, true);

            // If there are intersections, start rotating the shell model
            if (intersects.length > 0) {
                isRotating = true;
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
                controls.enabled = false;
            }
        });

        // Add mouse move event listener to rotate the shell model
        renderer.domElement.addEventListener('mousemove', (event) => {
            // If the shell model is being rotated, update its rotation based on mouse movement
            if (isRotating) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;
                shellPivot.rotation.y += deltaX * 0.01; 
                rotationX += deltaY * 0.01;
                shellGroup.rotation.x = rotationX; 
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }
        });

        // Add mouse up event listener to stop rotating the shell model
        renderer.domElement.addEventListener('mouseup', () => {
            isRotating = false;
            controls.enabled = true;
        });
        

    },
    undefined,
    function(error) {
        console.error(error);
    }
);


///////////////////////////////////////////////////
//  LIGHTING
///////////////////////////////////////////////////

//Create an ambient light
const light = new THREE.AmbientLight(0xffffff, 0.5);
//add the light to the scene
scene.add(light);

//Create a hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 5);
//Add the hemisphere light to the scene
scene.add(hemisphereLight);

//Create a directional light
const directionalLight = new THREE.DirectionalLight(0xffffaa, 5);
//Set the position of the directional light
directionalLight.position.set(20, 20, 20);
//Set the target of the directional light to the center of the scene
directionalLight.target.position.set(0, 4, 0);
//Add the directional light to the scene
scene.add(directionalLight);
//Add the target to the scene
scene.add(directionalLight.target);
//Create Directional light helper to visualize the light direction
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
//Add the directional light helper to the scene
scene.add(directionalLightHelper);

///////////////////////////////////////////////////
//  RENDERING
///////////////////////////////////////////////////

//Scene Rendering function
function animate() {
    //move the cube around GLTF Model
    //cube.rotation.y -= 0.01;

    //Render the scene with the camera
    renderer.render(scene, camera);
}
//Animation loop
renderer.setAnimationLoop(animate);

///////////////////////////////////////////////////
//  CONTROLS
///////////////////////////////////////////////////

//Add orbit controls to the camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.update();

//Add drag controls to cube
const dragControls = new DragControls([cube], camera, renderer.domElement);
dragControls.rotateSpeed = 10; //Set the rotation speed for drag controls
//Set the Mouse Buttons
dragControls.mouseButtons = {LEFT : THREE.MOUSE.ROTATE, CENTER : null, RIGHT : THREE.MOUSE.ROTATE};
dragControls.addEventListener('dragstart', function(event) {
    controls.enabled = false; //Disable orbit controls before dragging
});
dragControls.addEventListener('dragend', function(event) {
    controls.enabled = true; //Enable orbit controls after dragging
});

