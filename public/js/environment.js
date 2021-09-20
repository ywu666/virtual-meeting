import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let myMesh;

function createEnvironment(scene) {
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

  let skyboxGeo = new THREE.BoxGeometry(5000, 5000, 5000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  const loader = new GLTFLoader();

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
      camp.position.set(0, -0.2, 0);
      camp.scale.set(2, 2, 2);
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
      // const animations = gltf.animations;
      campFire.scale.set(0.7, 0.7, 0.7);
      campFire.position.set(7, 1, -1);
      // campFire.translateY(50);
      // campFire.translateX(350);
      // campFire.translateZ(-50);
      // mixer = new THREE.AnimationMixer(campFire);
      // const action = mixer.clipAction(animations[0]);
      // action.play();
      scene.add(campFire);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function updateEnvironment(scene) {
  // myMesh.position.x += 0.01;
}

window.createEnvironment = createEnvironment;
