import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/libs/dat.gui.module.js';

let myMesh, gui, actions, previousAction, activeAction;
const loader = new GLTFLoader();
let mixer;
var clock = new THREE.Clock();

function createEnvironment(scene) {
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

  // Campfire
  loader.load(
    "./resources/campfire/scene.gltf",
    (gltf) => {
      const campFire = gltf.scene;
      // const animations = gltf.animations;
      campFire.scale.set(0.7, 0.7, 0.7);
      campFire.position.set(7, 1, -1);
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

function loadAvatar(playerGroup) {
  let chars;
  loader.load(
    "./resources/robot_expressive/scene.gltf",
    (gltf) => {
      chars = gltf.scene;
      const avatarnAimations = gltf.animations;
      console.log(avatarnAimations);
      mixer = new THREE.AnimationMixer(chars);
      activeAction = mixer.clipAction(avatarnAimations[10]);
      activeAction.play();

      if(typeof gui == "undefined") {
          createAnimationsGUI(avatarnAimations, mixer);
      }

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
function createAnimationsGUI(avatarnAimations, mixer) {
    const emotes = ['Walking','Jump', 'Yes', 'No', 'Wave', 'ThumbsUp' ];
    gui = new GUI();
    actions = {};

    for ( let i = 0; i < avatarnAimations.length; i ++ ) {
        const clip = avatarnAimations[ i ];
        const action = mixer.clipAction( clip );
        actions[ clip.name ] = action;

        if ( emotes.indexOf( clip.name ) >= 0) {
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        }
    }

    console.log(actions);

    const api = { state: 'Walking' };
    // emotes
    const emoteFolder = gui.addFolder( 'Actions' );
    function createEmoteCallback( name ) {
        api[ name ] = function () {
            console.log('call call back' + name);
            fadeToAction( name, 0.2 );
            mixer.addEventListener( 'finished', restoreState);
        };
        emoteFolder.add( api, name );
    }

    console.log(emoteFolder);

    function restoreState() {
        console.log("call restoreState");
        mixer.removeEventListener( 'finished', restoreState );
        console.log(api.state);
        fadeToAction( api.state, 0.2 );
    }

    for ( let i = 0; i < emotes.length; i ++ ) {
        createEmoteCallback( emotes[ i ] );
    }
    emoteFolder.open();

    console.log(api);

    function fadeToAction( name, duration ) {
        previousAction = activeAction;
        activeAction = actions[ name ];
        if ( previousAction !== activeAction ) {
            previousAction.fadeOut( duration );
        }
        console.log("previous: ",previousAction);
        console.log('active: ',activeAction);

        activeAction.reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

    }
}


function avatarWalk() {
  const delta = clock.getDelta();
  console.log(delta);
  if (typeof mixer !== "undefined") {
    mixer.update(delta);
  }
}

function updateEnvironment(scene) {
  // myMesh.position.x += 0.01;
}

window.createEnvironment = createEnvironment;
window.loadAvatar = loadAvatar;
window.avatarWalk = avatarWalk;

