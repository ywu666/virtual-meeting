# Virtual Campfire Meeting
- **Team:** Group 10
- **Virtual Campfire Web Link (up-to-date with master)**: https://virtual-campfire-meeting.herokuapp.com/
- **Stable Version:** The newest version of master
- Please contact one of us if you are having trouble to access the application via link above.

Full Name | UPI | Email
------------ | ------------- | -----------
| Yujia Wu | ywu660 | ywu660@aucklanduni.ac.nz
| Yuxin Chen | che864 | yche864@aucklanduni.ac.nz
| Justin Rojos | jroj928 | jroj928@aucklanduni.ac.nz
| Francis Lee | clee383 | clee383@aucklanduni.ac.nz
| Habilash Kumar | hkmu724 | hkmu724@aucklanduni.ac.nz

## To run

### Visit 
- https://virtual-campfire-meeting.herokuapp.com/
- Give browser permission to access video and audio source (make sure your video and audio sources are set up properly in your browser).  
- May take a while to load.

OR

### Run the project locally
You must have installed:
- [Node.JS](https://www.npmjs.com/)

then
- git clone: Install the source code 
- npm install : Install all the necessary libraries
- npm start: Run the project locally

```
git clone <this-repo>   
npm install   
npm start 
```
## About
Virtual Campfire Meeting is a web-based, 3D, engaging, virtual world meeting application to help you to interact with other memebers through Video & Audio.

- **Technologies:** Web based. Accessible from windows and MacOS
- **Lanuages:** HTML/CSS/JavaScript
- **3D Libray:** [Three.js](https://threejs.org/)
- **Video Chat:** 
  -  Uses WebRTC for video/audio communication and socket.io for multiplayer implementation
- **Deployment:** [Heroku](https://devcenter.heroku.com/)

## General Functionality
-  Building virtual campfire world
-  Adding avatars to virutal world 
- Avatars animations via Interaction UI:
  - Dance
  - Jump
  - Node YES/NO
- Avatars movement:
  - WASD movement
  - Camera following movement
  - Mouse camera movement (zoom/rotation)
- Communication between avatars:
  - Proximity voice chat
  - Proximity audio chat
- Improve Engagement:
  - Sound effects via SFX:
      - Forest sound effects
      - Campfire sound effets
  - Campfire light effects

## Difference with Project Plan 
- [x] Building virtul campfire world
- [x] Adding multiple avatars to the virutal world 
- [x] Add animations.actions to Avatars:
  - [x] Dance
  - [x] Jump
  - [x] Node YES/NO
  - [ ] Wave
- [x] Avatars hangout virtual world
- [x] Third person camera for avatars
- [x] Campfire sound effects
- [x] Campfire light effects
- [x] Avatars communicates via video chat
- [x] Avatars communicates via audio chat
- [ ] Avatars communicates via messages 
- [ ] Sky light effects

## Credits
This was built on top of a webrtc template by AidanNelson: https://github.com/AidanNelson/threejs-webrtc
