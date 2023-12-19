import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import nebula from './images/nebula.jpg';
import stars from './images/stars.jpg';

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// shadow map - False(by default)
renderer.shadowMap.enabled = true;

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.5,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

// Create an axes helper
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();

// Box ( mesh = geometry + material)
const boxGeometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, material);

scene.add(box);

// plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

// Sphere
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  wireframe: false,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-5, 3, 0);
sphere.castShadow = true;

// grid helper
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// light - AmbientLight
const ambientLight = new THREE.AmbientLight(0x333333, 10);
scene.add(ambientLight);

// // light- directional light
// const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;

// // directional light - helper
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper);

// //  directional light shadow helper
// const dLightShadowHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );

// scene.add(dLightShadowHelper);

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 100000);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

// SpotLight Helper
const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// Fog to scene in threejs. THere are two methods to add fog to the scene;
// First Method:
// scene.fog = new THREE.Fog(0xffffff, 0, 200);
// scene.fog = new THREE.FogExp2(0xffffff, 0.01);

// Change backgroud color or image
renderer.setClearColor(0xffea00);
// //textureLoader is required to load the image. This bydefault wraps a 2D images. SO, we use cubeTextureLoader to give a 3D cube structure which takes an array of those 6 faces of the cube.
const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars);

// 3d image loader / cubeTextureLoader
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  nebula,
  nebula,
  stars,
  stars,
  stars,
  stars,
]);

// Creating box 2
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
//map: textureLoader.load(imageFile) to add 2D image and wraps to add texture over object's surfaces
const box2Material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  map: textureLoader.load(nebula),
});

// To add each object face with different texture then we map array of each face defining specific image to textureLoader.load() are requried. For instance
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
];

const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);

// dat GUI
const gui = new dat.GUI();

const options = {
  sphereColor: '#ffea00',
  wireframe: false,
  speed: 0.01,
  angle: 0.2,
  intensity: 1,
  penumbra: 0,
};

gui.addColor(options, 'sphereColor').onChange(function (e) {
  sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange((e) => {
  sphere.material.wireframe = e;
});

gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'intensity', 0, 100000);

let step = 0;

// Selecting objects from the scene
const mousePosition = new THREE.Vector2(); //This is mouseposition points of the scene in vector

// We convert these mousePosition to normalise position and for this we use event Listener
window.addEventListener('moveMouse', (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Now we create a instance of RayCaster
const rayCaster = new THREE.Raycaster();

// Animation loop function
function animate(time) {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;

  step += options.speed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));

  spotLight.angle = options.angle;
  spotLight.intensity = options.intensity;
  spotLight.penumbra = options.penumbra;
  sLightHelper.update();

  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  // console.log(intersects);
  // we can use this arrays of intersection points of an object to compare and do something with the intersection of an object with given name or id.

  renderer.render(scene, camera);
}
//render
renderer.setAnimationLoop(animate);

// To make the renderer or scene resize automatically to the window size. We pust "resize" event Listener
window.addEventListener('resize', (e) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
