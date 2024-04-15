import * as THREE from "three";

let renderer, scene, camera;

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
  const texturePlane = new THREE.TextureLoader().load("assets/grass3.webp");
  texturePlane.wrapS = THREE.RepeatWrapping;
  texturePlane.wrapT = THREE.RepeatWrapping;
  texturePlane.repeat.set(6, 6);
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
  sphere.position.y = 2;
  sphere.castShadow = true;
  scene.add(sphere);

  camera.position.set(0, 10, 20);
  camera.lookAt(sphere.position);

  console.log("made a scene", scene);
};

let speed = 0.02;
const planeSize = 95;
let cameraDistance = 10;

window.loop = (dt, canvas, input) => {
  const sphere = scene.getObjectByName("sphere");

  if (input.keys.has("ArrowUp") && sphere.position.z > -planeSize / 2) {
    sphere.position.z -= speed * dt;
    sphere.rotation.y -= speed * dt;
  }
  if (input.keys.has("ArrowDown") && sphere.position.z < planeSize / 2) {
    sphere.position.z += speed * dt;
    sphere.rotation.y += speed * dt;
  }
  if (input.keys.has("ArrowLeft") && sphere.position.x > -planeSize / 2) {
    sphere.position.x -= speed * dt;
    sphere.rotation.y -= speed * dt;
  }
  if (input.keys.has("ArrowRight") && sphere.position.x < planeSize / 2) {
    sphere.position.x += speed * dt;
    sphere.rotation.y += speed * dt;
  }

  camera.position.x = sphere.position.x;
  camera.position.z = sphere.position.z + cameraDistance;
  camera.lookAt(sphere.position);

  renderer.render(scene, camera);
};
