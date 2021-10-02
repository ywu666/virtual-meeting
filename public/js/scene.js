/*
 *
 * This uses code from a THREE.js Multiplayer solution using WEB-RTC made by Aidan Nelson:
 * https://github.com/AidanNelson/threejs-webrtc
 *
 *
 */
class Scene {
  constructor(_movementCallback) {
    this.movementCallback = _movementCallback;

    //THREE scene
    this.scene = new THREE.Scene();
    this.keyState = {};

    //Utility
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    //Add Player
    this.addSelf();

    //THREE Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.1,
      5000
    );
    this.camera.position.set(0, 3, 6);
    this.scene.add(this.camera);

    // create an AudioListener and add it to the camera
    this.listener = new THREE.AudioListener();
    this.playerGroup.add(this.listener);

    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialiasing: true,
    });
    this.renderer.setClearColor(new THREE.Color("lightblue"));
    this.renderer.setSize(this.width, this.height);

    // add controls:
    this.controls = new THREE.PlayerControls(this.camera, this.playerGroup);

    //Push the canvas to the DOM
    let domElement = document.getElementById("canvas-container");
    domElement.append(this.renderer.domElement);

    //Setup event listeners for events and handle the states
    window.addEventListener("resize", (e) => this.onWindowResize(e), false);
    window.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    window.addEventListener("keyup", (e) => this.onKeyUp(e), false);

    const groundTexture = new THREE.TextureLoader().load(
      "./resources/dirt-texture.png"
    );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(500, 500);
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000),
      groundMaterial
    );
    mesh.position.y = 0.0;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.addLights();
    createEnvironment(this.scene, this.listener);

    // Start the loop
    this.frameCount = 0;
    this.update();
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Lighting 💡

  addLights() {
    const light = new THREE.AmbientLight(0xffffe6, 0.5);
    this.scene.add(light);

    const fireLight = new THREE.PointLight(0xff0000, 1, 100);
    fireLight.position.set(7, 0.8, -0.8);
    this.scene.add(fireLight);
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Clients 👫

  addSelf() {
    let videoMaterial = makeVideoMaterial("local");

    let _head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), videoMaterial);
    _head.position.set(0, 0, 0);

    // https://threejs.org/docs/index.html#api/en/objects/Group
    this.playerGroup = new THREE.Group();
    this.playerGroup.position.set(3, 2, -0.5);
    this.playerGroup.add(_head);
    loadAvatar("self", this.playerGroup);

    // add group to scene
    this.scene.add(this.playerGroup);
  }

  // add a client meshes, a video element and  canvas for three.js video texture
  addClient(_id) {
    let videoMaterial = makeVideoMaterial(_id);

    let _head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), videoMaterial);

    // set position of head before adding to parent object

    _head.position.set(0, 0, 0);

    // https://threejs.org/docs/index.html#api/en/objects/Group
    var group = new THREE.Group();
    group.position.set(3, 2, -0.5);
    group.add(_head);
    loadAvatar(_id, group);

    // add group to scene
    this.scene.add(group);

    clients[_id].group = group;
    clients[_id].head = _head;
    // clients[_id].char = _char;
    clients[_id].desiredPosition = new THREE.Vector3();
    clients[_id].desiredRotation = new THREE.Quaternion();
    clients[_id].movementAlpha = 0;
  }

  removeClient(_id) {
    this.scene.remove(clients[_id].group);
  }

  // overloaded function can deal with new info or not
  updateClientPositions(_clientProps) {
    for (let _id in _clientProps) {
      // we'll update ourselves separately to avoid lag...
      if (_id != id) {
        // animateWalk(_id);
        clients[_id].desiredPosition = new THREE.Vector3().fromArray(
          _clientProps[_id].position
        );
        clients[_id].desiredRotation = new THREE.Quaternion().fromArray(
          _clientProps[_id].rotation
        );
      }
    }
  }

  // snap to position and rotation if we get close
  interpolatePositions() {
    let snapDistance = 0.5;
    let snapAngle = 0.2; // radians
    for (let _id in clients) {
      clients[_id].group.position.lerp(clients[_id].desiredPosition, 0.2);
      clients[_id].group.quaternion.slerp(clients[_id].desiredRotation, 0.2);
      if (
        clients[_id].group.position.distanceTo(clients[_id].desiredPosition) <
        snapDistance
      ) {
        clients[_id].group.position.set(
          clients[_id].desiredPosition.x,
          clients[_id].desiredPosition.y,
          clients[_id].desiredPosition.z
        );
      }
      if (
        clients[_id].group.quaternion.angleTo(clients[_id].desiredRotation) <
        snapAngle
      ) {
        clients[_id].group.quaternion.set(
          clients[_id].desiredRotation.x,
          clients[_id].desiredRotation.y,
          clients[_id].desiredRotation.z,
          clients[_id].desiredRotation.w
        );
      }
    }
  }

  updateClientVolumes() {
    for (let _id in clients) {
      let audioEl = document.getElementById(_id + "_audio");
      if (audioEl) {
        let distSquared = this.camera.position.distanceToSquared(
          clients[_id].group.position
        );

        if (distSquared > 500) {
          // console.log('setting vol to 0')
          audioEl.volume = 0;
        } else {
          // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
          let volume = Math.min(1, 10 / distSquared);
          audioEl.volume = volume;
          // console.log('setting vol to',volume)
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Interaction 🤾‍♀️

  getPlayerPosition() {
    // TODO: use quaternion or are euler angles fine here?
    return [
      [
        this.playerGroup.position.x,
        this.playerGroup.position.y,
        this.playerGroup.position.z,
      ],
      [
        this.playerGroup.quaternion._x,
        this.playerGroup.quaternion._y,
        this.playerGroup.quaternion._z,
        this.playerGroup.quaternion._w,
      ],
    ];
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Rendering 🎥

  update() {
    animate();
    requestAnimationFrame(() => this.update());
    this.frameCount++;

    // updateEnvironment();

    if (this.frameCount % 25 === 0) {
      this.updateClientVolumes();
      this.movementCallback();
    }

    if (this.camera.position.y < 2) {
      this.camera.position.y = 2;
    }
    this.interpolatePositions();
    this.controls.update();
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  // Event Handlers 🍽

  onWindowResize(e) {
    this.width = window.innerWidth;
    this.height = Math.floor(window.innerHeight - window.innerHeight * 0.3);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  // keystate functions from playercontrols
  onKeyDown(event) {
    event = event || window.event;
    this.keyState[event.keyCode || event.which] = true;
  }

  onKeyUp(event) {
    event = event || window.event;
    this.keyState[event.keyCode || event.which] = false;
  }
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Utilities

function makeVideoMaterial(_id) {
  let videoElement = document.getElementById(_id + "_video");
  let videoTexture = new THREE.VideoTexture(videoElement);

  let videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    overdraw: true,
    side: THREE.DoubleSide,
  });

  return videoMaterial;
}
