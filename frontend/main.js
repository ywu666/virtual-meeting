import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//Sound
const nightAudio = new Audio("./resources/mixkit-forest-at-night-1224.wav");
const fireAudio = new Audio("./resources/mixkit-campfire-crackles-1330.wav");
nightAudio.loop = true;
fireAudio.loop = true;
nightAudio.volume = 0.2;
fireAudio.volume = 1;
//comment out to remove audio
// nightAudio.play();
// fireAudio.play();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  45,
  30000
);
camera.position.set(-900, 100, -900);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// scene.add(torus);

// Fire

const loader = new GLTFLoader();

// loader.load(
//   "./resources/camp_fire/scene.gltf",
//   function (gltf) {
//     scene.add(gltf.scene);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

loader.load(
  "./resources/autumn_forest_camp/scene.gltf",
  function (gltf) {
    const camp = gltf.scene;
    camp.scale.set(100, 100, 100);
    scene.add(camp);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 5);
// scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 1500;

//Background

let materialArray = [];
let texture_ft = new THREE.TextureLoader().load("./resources/divine_ft.jpg");
let texture_bk = new THREE.TextureLoader().load("./resources/divine_bk.jpg");
let texture_up = new THREE.TextureLoader().load("./resources/divine_up.jpg");
let texture_dn = new THREE.TextureLoader().load("./resources/divine_dn.jpg");
let texture_rt = new THREE.TextureLoader().load("./resources/divine_rt.jpg");
let texture_lf = new THREE.TextureLoader().load("./resources/divine_lf.jpg");

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

materialArray.forEach((mat) => (mat.side = THREE.BackSide));

let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

//Plane

// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(10000, 10000, 1, 1),
//   new THREE.MeshStandardMaterial({
//     color: 0x544732,
//   })
// );
// plane.castShadow = false;
// plane.receiveShadow = true;
// plane.rotation.x = -Math.PI / 2;
// plane.translateZ(-50);
// scene.add(plane);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  //prevents camera from looking below the ground
  if (camera.position.y < 50) camera.position.y = 50;

  renderer.render(scene, camera);
}

animate();
