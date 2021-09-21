// import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

var clock = new THREE.Clock();
let mixer;

//Sound
const nightAudio = new Audio("./resources/mixkit-forest-at-night-1224.wav");
const fireAudio = new Audio("./resources/mixkit-campfire-crackles-1330.wav");
nightAudio.loop = true;
fireAudio.loop = true;
nightAudio.volume = 0.2;
fireAudio.volume = 1;
//comment out to remove audio
nightAudio.play();
fireAudio.play();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  45,
  10000
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
  "./resources/forest_nofire/scene.gltf",
  function (gltf) {
    const camp = gltf.scene;
    console.log(camp);
    const fireArray = [
      camp.getObjectByName("Icosphere"),
      camp.getObjectByName("Icosphere001"),
      camp.getObjectByName("Icosphere002"),
      camp.getObjectByName("Icosphere003"),
      camp.getObjectByName("Icosphere004"),
      camp.getObjectByName("Icosphere005"),
      camp.getObjectByName("Icosphere006"),
      camp.getObjectByName("Icosphere007"),
      camp.getObjectByName("Icosphere008"),
      camp.getObjectByName("Icosphere009"),
      camp.getObjectByName("Icosphere010"),
      camp.getObjectByName("Plane002"),
      camp.getObjectByName("Plane009"),
    ];
    fireArray.forEach((stone) => (stone.visible = false));

    camp.scale.set(100, 100, 100);
    scene.add(camp);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "./resources/campfire/scene.gltf",
  (gltf) => {
    const campFire = gltf.scene;
    const animations = gltf.animations;
    campFire.scale.set(40, 40, 40);
    campFire.translateY(50);
    campFire.translateX(350);
    campFire.translateZ(-50);
    mixer = new THREE.AnimationMixer(campFire);
    const action = mixer.clipAction(animations[0]);
    action.play();
    scene.add(campFire);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 105, 500);

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

  const delta = clock.getDelta();
  mixer.update(delta);

  controls.update();
  //prevents camera from looking below the ground
  if (camera.position.y < 50) camera.position.y = 50;

  renderer.render(scene, camera);
}

const webcamButton = document.getElementById("webcamButton");
const answerButton = document.getElementById("answerButton");

function addAvatar() {
  loader.load(
    "./resources/robot_expressive/scene.gltf",
    (gltf) => {
      const chars = gltf.scene;
      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer(chars);
      console.log(animations);
      console.log('robot: ',gltf)
      const action = mixer.clipAction(animations[12]);
      action.play();

      chars.scale.set(30, 30, 30);

      chars.translateY(0);
      chars.translateX(350);
      chars.translateZ(-200);

      scene.add(chars);
      console.log(chars.position)

      //camera.position.set(0,350,-200);
      console.log(camera)

      const currentPosition = new THREE.Vector3();
      const currentLookat = new THREE.Vector3();

      //calculate current position
      const idealOffset = new THREE.Vector3(0, 120, -300);
      idealOffset.applyQuaternion(chars.quaternion);
      idealOffset.add(chars.position);

      //calculate current look at
      const idealLookat = new THREE.Vector3(0, 100, 100);
      idealLookat.applyQuaternion(chars.quaternion);
      idealLookat.add(chars.position);
      console.log(idealLookat);
      console.log(idealOffset);

      currentPosition.lerp(idealOffset, 1);
      currentLookat.lerp(idealLookat, 1);
      console.log(currentPosition)
      console.log(currentLookat)

      camera.position.copy(currentPosition);
      camera.lookAt(currentLookat)


    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

webcamButton.addEventListener("click", addAvatar);

function add2Avatar() {
  loader.load(
    "./resources/robot_expressive/scene.gltf",
    (gltf) => {
      const chars = gltf.scene;
      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer(chars);
      console.log(animations);
      const action = mixer.clipAction(animations[12]);
      action.play();

      chars.scale.set(20, 20, 20);

      chars.translateY(0);
      chars.translateX(350);
      chars.translateZ(90);
      chars.lookAt(50, 50, -900);
      scene.add(chars);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

answerButton.addEventListener("click", add2Avatar);

animate();
