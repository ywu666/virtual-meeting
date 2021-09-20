import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let myMesh;

function createEnvironment(scene) {
  console.log("Adding environment");

  let texture = new THREE.TextureLoader().load("../assets/texture.png");
  let myGeometry = new THREE.SphereGeometry(3, 12, 12);
  let myMaterial = new THREE.MeshBasicMaterial({ map: texture });
  myMesh = new THREE.Mesh(myGeometry, myMaterial);
  myMesh.position.set(5, 2, 5);
  scene.add(myMesh);
}

function updateEnvironment(scene) {
  // myMesh.position.x += 0.01;
}

function addLoader(scene) {
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

      camp.scale.set(100, 100, 100);
      scene.add(camp);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

window.addLoader = addLoader;
