import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/libs/dat.gui.module.js";

let myMesh, gui, actions, previousAction, activeAction;
const loader = new GLTFLoader();
const envMixers = [];
const avatarMixers = new Map();
var clock = new THREE.Clock();

function createEnvironment(scene, listener) {
  // Background
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

  const sound = new THREE.Audio(listener);
  const sound2 = new THREE.PositionalAudio(listener);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load("./resources/mixkit-forest-at-night-1224.wav", function (
    buffer
  ) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.04);
    sound.play();
  });

  // Campfire scene
  loader.load(
    "./resources/forest_nofire/scene.gltf",
    function (gltf) {
      const camp = gltf.scene;
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

  audioLoader.load("./resources/mixkit-campfire-crackles-1330.wav", function (
    buffer
  ) {
    sound2.setBuffer(buffer);
    sound2.setLoop(true);
    sound2.setVolume(1);
    sound2.setRefDistance(10);
    sound2.play();
  });

  // Campfire
  loader.load(
    "./resources/campfire/scene.gltf",
    (gltf) => {
      const campFire = gltf.scene;
      const animations = gltf.animations;
      campFire.scale.set(0.5, 0.5, 0.5);
      campFire.position.set(7, 0.8, -0.8);
      const mixer = new THREE.AnimationMixer(campFire);
      const action = mixer.clipAction(animations[0]);
      action.play();
      envMixers.push(mixer);
      scene.add(campFire);
      campFire.add(sound2);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

let avatarAnimations;

function loadAvatar(id, playerGroup) {
  let chars;
  loader.load(
    "./resources/robot_expressive/scene.glb",
    (gltf) => {
      chars = gltf.scene;
      avatarAnimations = gltf.animations;
      const mixer = new THREE.AnimationMixer(chars);
      // activeAction = mixer.clipAction(avatarAnimations[2]);
      // activeAction.play();

      if (typeof gui == "undefined") {
        createAnimationsGUI(avatarAnimations, mixer);
      }

      avatarMixers.set(id, mixer);

      chars.scale.set(0.3, 0.3, 0.3);
      chars.position.set(0, -2, 0);
      chars.rotation.y += 3.14;
      playerGroup.add(chars);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_morph.html
function createAnimationsGUI(avatarAnimations, mixer) {
  const emotes = ["Idle", "Dance", "Jump", "Yes", "No"];
  gui = new GUI();
  actions = {};

  for (let i = 0; i < avatarAnimations.length; i++) {
    const clip = avatarAnimations[i];
    const action = mixer.clipAction(clip);
    actions[clip.name] = action;

    if (emotes.indexOf(clip.name) >= 1) {
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
    }
  }

  const api = { state: "Idle" };
  // emotes
  const emoteFolder = gui.addFolder("Actions");
  function createEmoteCallback(name) {
    api[name] = function () {
      fadeToAction(name, 0.2);
      mixer.addEventListener("finished", restoreState);
    };
    emoteFolder.add(api, name);
  }

  function restoreState() {
    mixer.removeEventListener("finished", restoreState);
    fadeToAction(api.state, 0.2);
  }

  for (let i = 1; i < emotes.length; i++) {
    createEmoteCallback(emotes[i]);
  }
  emoteFolder.open();

  function fadeToAction(name, duration) {
    previousAction = activeAction;
    activeAction = actions[name];
    if (previousAction !== activeAction) {
      previousAction.fadeOut(duration);
    }

    activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
  }
}
// Animations for self

function animateWalk(id) {
  if (avatarMixers.get(id)) {
    activeAction = avatarMixers.get(id).clipAction(avatarAnimations[10]);
    activeAction.play();
  }
}

function animateIdle() {
  if (
    typeof activeAction !== "undefined" &&
    activeAction.getClip().name === "Walking"
  ) {
    activeAction.stop();
    activeAction = actions["Idle"];
    activeAction.play();
  }
}

// Animations for clients

function animateClientWalk(id) {
  if (avatarMixers.get(id)) {
    const action = avatarMixers.get(id).clipAction(avatarAnimations[10]);
    action.play();
  }
}

function animateClientIdle(id) {
  if (avatarMixers.get(id)) {
    avatarMixers.get(id).stopAllAction();
    const action = avatarMixers.get(id).clipAction(avatarAnimations[2]);
    action.play();
  }
}

function animateClientJump(id) {
  if (avatarMixers.get(id)) {
    avatarMixers.get(id).stopAllAction();
    const action = avatarMixers.get(id).clipAction(avatarAnimations[3]);
    action.loop = THREE.LoopOnce;
    action.play();
  }
}

function animateClientDance(id) {
  if (avatarMixers.get(id)) {
    avatarMixers.get(id).stopAllAction();
    const action = avatarMixers.get(id).clipAction(avatarAnimations[0]);
    action.loop = THREE.LoopOnce;
    action.play();
  }
}

function animateClientYes(id) {
  if (avatarMixers.get(id)) {
    avatarMixers.get(id).stopAllAction();
    const action = avatarMixers.get(id).clipAction(avatarAnimations[13]);
    action.loop = THREE.LoopOnce;
    action.play();
  }
}

function animateClientNo(id) {
  if (avatarMixers.get(id)) {
    avatarMixers.get(id).stopAllAction();
    const action = avatarMixers.get(id).clipAction(avatarAnimations[4]);
    action.loop = THREE.LoopOnce;
    action.play();
  }
}

function animate() {
  const delta = clock.getDelta();

  // Animate clients
  avatarMixers.forEach(function (value, key) {
    if (value !== "undefined") {
      avatarMixers.get(key).update(delta);
    }
  });

  // Animate environment
  for (let m in envMixers) {
    // console.log(m);
    if (typeof m !== "undefined") {
      // console.log("Campfire animation");
      envMixers[m].update(delta);
    }
  }
}

// Get own action
function getAction() {
  if (activeAction && activeAction.getClip()) {
    return activeAction.getClip().name;
  }
  return "Idle";
}

window.createEnvironment = createEnvironment;
window.loadAvatar = loadAvatar;

window.animateWalk = animateWalk;
window.animateIdle = animateIdle;

window.animateClientWalk = animateClientWalk;
window.animateClientIdle = animateClientIdle;
window.animateClientJump = animateClientJump;
window.animateClientDance = animateClientDance;
window.animateClientYes = animateClientYes;
window.animateClientNo = animateClientNo;

window.animate = animate;
window.getAction = getAction;
