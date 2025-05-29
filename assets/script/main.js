import * as THREE from 'three';

//Create the scene
const scene = new THREE.Scene();
//Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//Add the renderer to the document
document.body.appendChild(renderer.domElement);

//Scene Rendering function
function animate() {
    renderer.render(scene, camera);
}
//Animation loop
renderer.setAnimationLoop(animate);