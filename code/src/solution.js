import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let renderer, scene, camera;
const cupcakePositions = [
  new THREE.Vector3(10, 1, 5),
  new THREE.Vector3(-15, 1, 20),
  new THREE.Vector3(0, 1, -25),
  new THREE.Vector3(30, 1, 15),
  new THREE.Vector3(-20, 1, 10),
];

const donutPositions = [
  new THREE.Vector3(5, 0, -30),
  new THREE.Vector3(25, 0, -5),
  new THREE.Vector3(-10, 0, -15),
  new THREE.Vector3(20, 0, 25),
  new THREE.Vector3(-25, 0, -20),
];

const cupcakeOrangePositions = [
  new THREE.Vector3(15, 1, 0),
  new THREE.Vector3(-5, 1, 30),
  new THREE.Vector3(35, 1, -10),
  new THREE.Vector3(-30, 1, 5),
  new THREE.Vector3(10, 1, -35),
];

const cupcakeMarshmallowPositions = [
  new THREE.Vector3(40, 1, 0),
  new THREE.Vector3(-35, 1, 15),
  new THREE.Vector3(0, 1, 35),
  new THREE.Vector3(30, 1, -25),
  new THREE.Vector3(-40, 1, -5),
];

const numCupcakes = 5;
const numDonuts = 5;
const numCupcakeOrange = 5;
const numCupcakeMarshmallow = 5;
const planeSize = 95;
const planeSizeFront = 97.5;
let cameraDistance = 10
const clock = new THREE.Clock();
let delta = 0;

window.init = async (canvas) => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(10, 20, 10);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = -100;
  light.shadow.camera.far = 100;
  light.shadow.camera.left = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  scene.add(light);

  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const texturePlane = new THREE.TextureLoader().load("assets/river.png");
  texturePlane.wrapS = THREE.MirroredRepeatWrapping;
  texturePlane.wrapT = THREE.MirroredRepeatWrapping;
  texturePlane.repeat.set(10, 10);
  const materialPlane = new THREE.MeshPhongMaterial({
    map: texturePlane,
  });

  const ground = new THREE.Mesh(groundGeometry, materialPlane);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const geometry = new THREE.SphereGeometry(2, 32, 32);
  const texture = new THREE.TextureLoader().load("assets/chocolate.avif");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
  });

  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = "sphere";
  sphere.position.y = 1;
  sphere.castShadow = true;
  scene.add(sphere);

  const loader = new GLTFLoader().setPath("models/gltf/");

  for (let i = 0; i < numCupcakes; i++) {
    loader.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(1.5, 1.5, 1.5);
      gltf.scene.position.copy(cupcakePositions[i]);
      scene.add(gltf.scene);
    });
  }

  const loader2 = new GLTFLoader().setPath("models/chocolate_donut/");

  for (let i = 0; i < numDonuts; i++) {
    loader2.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(6, 6, 6);
      gltf.scene.position.copy(donutPositions[i]);
      scene.add(gltf.scene);
    });
  }

  const loader3 = new GLTFLoader().setPath("models/cupcake_orange/");

  for (let i = 0; i < numCupcakeOrange; i++) {
    loader3.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(15, 15, 15);
      gltf.scene.position.copy(cupcakeOrangePositions[i]);
      scene.add(gltf.scene);
    });
  }

  const loader4 = new GLTFLoader().setPath("models/marshmallow_cupcake/");

  for (let i = 0; i < numCupcakeMarshmallow; i++) {
    loader4.load("scene.gltf", (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.position.copy(cupcakeMarshmallowPositions[i]);
      scene.add(gltf.scene);
    });
  }

  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  console.log("made a scene");
};

function showGameOver() {
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  if (gameOverOverlay) {
    gameOverOverlay.style.display = "block";
  }
}
let cupcakesCollected = 0;
let gameRunning = true;

window.loop = (dt, canvas, input) => {
  if (!gameRunning) {
    return;
  }

  const sphere = scene.getObjectByName("sphere");

  delta = clock.getDelta();

  const cupcakeObjects = scene.children.filter((obj) => obj.type === "Group");
  for (const cupcake of cupcakeObjects) {
    if (
      sphere.position.distanceTo(cupcake.position) < 2.5 &&
      !cupcake.isAttached
    ) {
      const originalScale = cupcake.scale.clone();
      const pickedPosition = sphere.position
        .clone()
        .add(sphere.worldToLocal(cupcake.position));
      sphere.add(cupcake);
      cupcake.isAttached = true;
      cupcake.scale.copy(originalScale);
      cupcakesCollected++;
      if (
        cupcakesCollected >=
        numCupcakes + numDonuts + numCupcakeOrange + numCupcakeMarshmallow
      ) {
        gameRunning = false;
        showGameOver();
        break;
      }
      const currentScale = sphere.scale.x;
      const scaleIncrement = 0.03;
      sphere.scale.set(
        currentScale + scaleIncrement,
        currentScale + scaleIncrement,
        currentScale + scaleIncrement
      );
    }
  }

  const moveSpeed = 15;
  const rotationSpeed = 5;

  let moveDirection = new THREE.Vector3();
  if (input.keys.has("ArrowUp") && sphere.position.z > -planeSize / 2)
    moveDirection.z = -1;
  if (input.keys.has("ArrowDown") && sphere.position.z < planeSizeFront / 2)
    moveDirection.z = 1;
  if (input.keys.has("ArrowLeft") && sphere.position.x > -planeSize / 2)
    moveDirection.x = -1;
  if (input.keys.has("ArrowRight") && sphere.position.x < planeSize / 2)
    moveDirection.x = 1;

  moveDirection.normalize().multiplyScalar(moveSpeed * delta);
  sphere.position.add(moveDirection);

  if (moveDirection.x !== 0 || moveDirection.z !== 0) {
    const axis = new THREE.Vector3(
      moveDirection.z,
      0,
      -moveDirection.x
    ).normalize();
    const angle = rotationSpeed * delta;
    sphere.rotateOnAxis(axis, angle);
  }

  camera.position.x = sphere.position.x;
  camera.position.z = sphere.position.z + cameraDistance;
  camera.lookAt(sphere.position);

  renderer.render(scene, camera);
};
