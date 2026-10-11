import * as THREE from 'three';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'three/addons/webxr/XRHandModelFactory.js';
import {panel,updatePanel,label} from './ui.js';

const scene=new THREE.Scene();scene.background=new THREE.Color(0x172634);scene.fog=new THREE.Fog(0x172634,24,58);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.04,100);camera.position.set(0,1.65,3.5);
const rig=new THREE.Group();rig.add(camera);scene.add(rig);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;renderer.shadowMap.enabled=false;renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');document.body.appendChild(renderer.domElement);
// Use Three.js's native WebXR button directly. Proxy-clicking a hidden
// button can fail browser user-activation requirements on Quest.
const vrButton=VRButton.createButton(renderer);
vrButton.style.display='block';
vrButton.style.zIndex='1000';
vrButton.style.position='fixed';
vrButton.style.bottom='24px';
vrButton.style.left='50%';
vrButton.style.transform='translateX(-50%)';
vrButton.style.padding='14px 22px';
vrButton.style.fontSize='18px';
document.body.appendChild(vrButton);
document.querySelector('#enter')?.remove();
renderer.xr.addEventListener('sessionstart',()=>{document.querySelector('#hint').style.display='none';});
renderer.xr.addEventListener('sessionend',()=>{document.querySelector('#hint').style.display='block';});
scene.add(new THREE.HemisphereLight(0xddefff,0x4b5365,2.8));const sun=new THREE.DirectionalLight(0xffffff,3.0);sun.position.set(-5,10,5);scene.add(sun);
const mat=(color,metalness=.2,roughness=.45)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
function box(w,h,d,m,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o;}
const floor=box(24,.15,24,mat(0x38424d,.4,.34),0,-.09,0);const ceiling=box(24,.2,24,mat(0x26323c,.5,.4),0,6.8,0);
for(let i=-5;i<=5;i+=2){box(.08,.02,20,new THREE.MeshBasicMaterial({color:0xb6f4ff}),i,6.68,0);}
box(24,6.7,.2,mat(0x253541,.55,.4),0,3.25,-12);box(.2,6.7,24,mat(0x253541,.55,.4),-12,3.25,0);box(.2,6.7,24,mat(0x253541,.55,.4),12,3.25,0);
// Window-like glass strips and exterior skyline, kept lightweight for Quest.
for(let x=-9;x<=9;x+=3){box(.09,4,.13,mat(0x9aabb8,.7,.25),x,3.7,-11.83);box(2.85,3.8,.02,new THREE.MeshBasicMaterial({color:0x42677c,transparent:true,opacity:.48}),x+1.45,3.7,-11.9);}
const glow=new THREE.MeshBasicMaterial({color:0x4ddfff});
const table=new THREE.Group();table.position.set(0,0,-1.35);scene.add(table);
box(2.7,.11,1.45,mat(0xe0e7ea,.55,.24),0,.94,0,table);box(2.75,.027,1.48,glow,0,.875,0,table);
for(const x of [-1.05,1.05]){box(.19,.83,.35,mat(0x586a78,.8,.25),x,.43,0,table);}
box(1.9,.06,.92,mat(0x0b1a22,.45,.3),0,1.04,0,table);
const stationTitle=label('3D DESIGN / DATA',1.7,.23);stationTitle.position.set(0,1.22,-.62);table.add(stationTitle);
// Peripheral futuristic stations.
for(const [x,z,title] of [[-5,-3,'3D PRINTING'],[5,-3,'BUSINESS'],[-5,3,'IDEAS'],[5,3,'LIFE TASKS']]){box(2,.1,1,mat(0xcbd8df,.45,.26),x,.88,z);box(1.3,.82,.26,mat(0x4d6471,.6,.3),x,.41,z);const l=label(title,1.45,.23);l.position.set(x,1.25,z-.48);scene.add(l);}
// Back-wall armor pedestals.
for(let i=0;i<4;i++){const x=-7.8+i*5.2;box(1.7,.22,1.15,mat(0x3d4b58,.7,.3),x,.2,-9.7);box(1.8,.045,1.2,glow,x,.33,-9.7);const armor=new THREE.Group();armor.position.set(x,.36,-9.7);scene.add(armor);box(.65,.85,.35,mat(i%2?0x8b141a:0xa93b19,.72,.27),0,1.2,0,armor);box(.32,.37,.3,mat(0xb4a167,.75,.23),0,1.84,0,armor);for(const side of [-1,1]){box(.22,.8,.25,mat(0x84252b,.65,.3),side*.48,1.18,0,armor);box(.22,.9,.26,mat(0x84252b,.65,.3),side*.2,.42,0,armor);}box(.16,.16,.02,new THREE.MeshBasicMaterial({color:0x9ff8ff}),0,1.2,.19,armor);}
// Model library. Real GLBs are loaded when available; a clean geometry is a reliable fallback.
const modelPivot=new THREE.Group();modelPivot.position.set(0,1.48,-1.35);scene.add(modelPivot);
const demo=new THREE.Mesh(new THREE.TorusKnotGeometry(.23,.075,120,16),mat(0x7c9fbd,.7,.2));modelPivot.add(demo);
const models=['assets/iron_man_mk7.glb','assets/iron-man-mk7_2suit.glb'];const loader=new GLTFLoader();let modelIndex=-1;
function changeModel(){modelIndex=(modelIndex+1)%3;while(modelPivot.children.length)modelPivot.remove(modelPivot.children[0]);if(modelIndex===0){modelPivot.add(demo);return;}loader.load(models[modelIndex-1],g=>{const o=g.scene;const bounds=new THREE.Box3().setFromObject(o),size=bounds.getSize(new THREE.Vector3());const max=Math.max(size.x,size.y,size.z);o.scale.setScalar(1.05/Math.max(.001,max));o.position.sub(bounds.getCenter(new THREE.Vector3()).multiplyScalar(o.scale.x));modelPivot.add(o);},()=>{},()=>modelPivot.add(demo));}
const boards=[];const hitMeshes=[];
const boardInfo=[['3D PRINTING',['2 × Bambu P1S','Print queue · demo','Filament inventory · demo']],['BUSINESS',['Orders · demo','Quotes · demo','Product catalog · demo']],['LIFE TASKS',['Today · demo','Schedule · demo','Reminders · demo']],['NOTES',['Design notes · demo','Project details · demo','Drafts · demo']],['IDEAS',['Product concepts · demo','Sketches · demo','Backlog · demo']]];
boardInfo.forEach(([title,lines],i)=>{const b=panel(title,lines,2.15,1.33);const x=(i-2)*2.55;b.position.set(x,2.35,-10.9);b.userData.home={position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()};scene.add(b);boards.push(b);b.traverse(o=>{if(o.isMesh){o.userData.target=b;hitMeshes.push(o);}});});
const menu=panel('JARVIS MENU',['DESIGN / DATA','NEXT MODEL','RETURN PANELS','RECENTER VIEW','Close: B or Y'],1.85,1.72);scene.add(menu);menu.visible=false;
const menuHits=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.75,.27),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.position.set(0,.36-i*.34,.047);m.userData.menuAction=i;menu.add(m);menuHits.push(m);}
let dataMode=false;let menuOpen=false;const tmpV=new THREE.Vector3(),tmpQ=new THREE.Quaternion(),raycaster=new THREE.Raycaster();
function viewPose(){const c=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;c.getWorldPosition(tmpV);c.getWorldQuaternion(tmpQ);return {pos:tmpV.clone(),quat:tmpQ.clone()};}
function setMenu(open){menuOpen=open;menu.visible=open;if(open){const {pos,quat}=viewPose();const dir=new THREE.Vector3(0,0,-1).applyQuaternion(quat);menu.position.copy(pos).addScaledVector(dir,1.55);menu.position.y=Math.max(1.05,menu.position.y);menu.quaternion.copy(quat);}}
function setMode(data){dataMode=data;modelPivot.visible=!data;stationTitle.visible=!data;for(let i=0;i<boards.length;i++){const b=boards[i];if(data){b.position.set((i-2)*1.85,1.85,-2.9);b.scale.setScalar(.76);b.rotation.set(0,0,0);}else{resetBoard(b);}}setMenu(false);}
function resetBoard(b){const h=b.userData.home;b.position.copy(h.position);b.quaternion.copy(h.quaternion);b.scale.copy(h.scale);b.userData.docked=false;}
function dockBoard(b){const idx=boards.indexOf(b);const {pos,quat}=viewPose();const f=new THREE.Vector3(0,0,-1).applyQuaternion(quat);f.y=0;f.normalize();const right=new THREE.Vector3(1,0,0).applyQuaternion(quat);right.y=0;right.normalize();const dock=pos.clone().addScaledVector(f,1.45).addScaledVector(right,(idx%3-1)*1.1);dock.y=1.6+Math.floor(idx/3)*.35;b.position.copy(dock);b.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(b.position,pos,new THREE.Vector3(0,1,0)));b.scale.setScalar(.62);b.userData.docked=true;}
// Both hands and controllers use the same interaction pipeline.
const sources=[];const controllers=[];const controllerFactory=new XRControllerModelFactory();const handFactory=new XRHandModelFactory();
for(let i=0;i<2;i++){const c=renderer.xr.getController(i);rig.add(c);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0x6ee4ff,transparent:true,opacity:.7}));line.scale.z=3;c.add(line);const grip=renderer.xr.getControllerGrip(i);grip.add(controllerFactory.createControllerModel(grip));rig.add(grip);const hand=renderer.xr.getHand(i);hand.add(handFactory.createHandModel(hand,'mesh'));rig.add(hand);const s={controller:c,hand,grip,active:false,target:null,kind:null,startPos:new THREE.Vector3(),startQuat:new THREE.Quaternion(),startObjPos:new THREE.Vector3(),startObjQuat:new THREE.Quaternion(),offset:new THREE.Vector3(),wasPinch:false,hover:null};sources.push(s);controllers.push(c);
 c.addEventListener('selectstart',()=>select(s));c.addEventListener('squeezestart',()=>grab(s));c.addEventListener('squeezeend',()=>release(s));c.addEventListener('selectend',()=>{});
}
let dual=null;
function sourcePose(s,hand=false){const obj=hand?s.hand.joints['index-finger-tip']:s.controller;if(!obj)return null;const pos=new THREE.Vector3(),quat=new THREE.Quaternion();obj.getWorldPosition(pos);obj.getWorldQuaternion(quat);return {pos,quat};}
function rayHit(s,hand=false){const pose=sourcePose(s,hand);if(!pose)return null;const direction=new THREE.Vector3(0,0,-1).applyQuaternion(pose.quat);if(hand){const wrist=s.hand.joints['wrist'];if(wrist){const w=new THREE.Vector3();wrist.getWorldPosition(w);direction.copy(pose.pos).sub(w).normalize();}}raycaster.set(pose.pos,direction);raycaster.far=20;const hits=raycaster.intersectObjects([...hitMeshes,...menuHits],false);return hits[0]||null;}
function select(s,hand=false){const hit=rayHit(s,hand);if(!hit)return;if(hit.object.userData.menuAction!==undefined&&menu.visible){const a=hit.object.userData.menuAction;if(a===0)setMode(!dataMode);else if(a===1)changeModel();else if(a===2)boards.forEach(resetBoard);else if(a===3){rig.position.set(0,0,0);rig.rotation.set(0,0,0);}return;}if(hit.object.userData.target){const b=hit.object.userData.target;dockBoard(b);}}
function grab(s,hand=false){const hit=rayHit(s,hand);if(!hit)return;const target=hit.object.userData.target;if(!target)return;const pose=sourcePose(s,hand);s.active=true;s.target=target;s.kind=hand?'hand':'controller';s.startPos.copy(pose.pos);s.startQuat.copy(pose.quat);s.startObjPos.copy(target.position);s.startObjQuat.copy(target.quaternion);s.offset.copy(target.position).sub(pose.pos);const other=sources.find(t=>t!==s&&t.active&&t.target===target);if(other){const p2=sourcePose(other,other.kind==='hand');if(p2){dual={target,a:s,b:other,distance:Math.max(.08,pose.pos.distanceTo(p2.pos)),scale:target.scale.clone(),mid:pose.pos.clone().add(p2.pos).multiplyScalar(.5),position:target.position.clone(),angle:Math.atan2(pose.pos.z-p2.pos.z,pose.pos.x-p2.pos.x),quat:target.quaternion.clone()};}}}
function release(s){if(s.active&&s.target&&s.target.userData.kind==='panel'&&!dual){dockBoard(s.target);}s.active=false;s.target=null;if(dual&&(dual.a===s||dual.b===s))dual=null;}
function updateGrabs(){if(dual){const a=sourcePose(dual.a,dual.a.kind==='hand'),b=sourcePose(dual.b,dual.b.kind==='hand');if(a&&b){const dist=Math.max(.08,a.pos.distanceTo(b.pos));const scale=THREE.MathUtils.clamp(dist/dual.distance,.35,3);dual.target.scale.copy(dual.scale).multiplyScalar(scale);const mid=a.pos.clone().add(b.pos).multiplyScalar(.5);dual.target.position.copy(dual.position).add(mid.sub(dual.mid));const angle=Math.atan2(a.pos.z-b.pos.z,a.pos.x-b.pos.x);dual.target.quaternion.copy(dual.quat).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle-dual.angle));}return;}
 for(const s of sources){if(!s.active||!s.target)continue;const pose=sourcePose(s,s.kind==='hand');if(!pose)continue;const deltaQ=pose.quat.clone().multiply(s.startQuat.clone().invert());s.target.quaternion.copy(deltaQ).multiply(s.startObjQuat);s.target.position.copy(s.startObjPos).add(pose.pos.clone().sub(s.startPos));}}
function updateHandPinches(){for(const s of sources){const index=s.hand.joints['index-finger-tip'],thumb=s.hand.joints['thumb-tip'];if(!index||!thumb||!index.visible||!thumb.visible){if(s.wasPinch&&s.kind==='hand')release(s);s.wasPinch=false;continue;}const a=new THREE.Vector3(),b=new THREE.Vector3();index.getWorldPosition(a);thumb.getWorldPosition(b);const d=a.distanceTo(b);const pinched=s.wasPinch?d<.045:d<.025;if(pinched&&!s.wasPinch){const hit=rayHit(s,true);if(hit?.object.userData.target)grab(s,true);else select(s,true);}if(!pinched&&s.wasPinch&&s.kind==='hand')release(s);s.wasPinch=pinched;}}
function feedback(){for(const b of boards)b.userData.halo.material.opacity=.1;for(const s of sources){const hit=rayHit(s,s.kind==='hand');s.hover=hit?.object.userData.target||null;if(s.hover)s.hover.userData.halo.material.opacity=.5;if(s.active&&s.target)s.target.userData.halo.material.opacity=.85;}}
let menuLatch=[false,false];const clock=new THREE.Clock();function locomotion(dt){const session=renderer.xr.getSession();if(!session)return;const {quat}=viewPose();const forward=new THREE.Vector3(0,0,-1).applyQuaternion(quat);forward.y=0;forward.normalize();const right=new THREE.Vector3(1,0,0).applyQuaternion(quat);right.y=0;right.normalize();session.inputSources.forEach((input,i)=>{const gp=input.gamepad;if(!gp)return;const ax=gp.axes;const x=ax.length>=4?ax[2]:ax[0]||0;const y=ax.length>=4?ax[3]:ax[1]||0;const isLeft=input.handedness==='left';if(isLeft){if(Math.abs(x)>.18)rig.position.addScaledVector(right,x*3*dt);if(Math.abs(y)>.18)rig.position.addScaledVector(forward,-y*3*dt);}else{if(Math.abs(x)>.22)rig.rotation.y-=x*1.8*dt;}const pressed=gp.buttons.some((btn,j)=>j>=4&&btn.pressed);if(pressed&&!menuLatch[i])setMenu(!menuOpen);menuLatch[i]=pressed;});}
const keys={};window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='m')setMenu(!menuOpen);if(e.key.toLowerCase()==='n')changeModel();if(e.key.toLowerCase()==='d')setMode(!dataMode);});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let dragMouse=false,yaw=0,pitch=0;renderer.domElement.addEventListener('pointerdown',()=>dragMouse=true);window.addEventListener('pointerup',()=>dragMouse=false);window.addEventListener('pointermove',e=>{if(!dragMouse||renderer.xr.isPresenting)return;yaw-=e.movementX*.003;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.003,-1.2,1.2);camera.rotation.set(pitch,yaw,0,'YXZ');});renderer.domElement.addEventListener('click',e=>{if(renderer.xr.isPresenting)return;const mouse=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(hitMeshes,false);if(hits.length)dockBoard(hits[0].object.userData.target);});
renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(renderer.xr.isPresenting){locomotion(dt);updateHandPinches();updateGrabs();feedback();}else{const dir=new THREE.Vector3();if(keys.w)dir.z-=1;if(keys.s)dir.z+=1;if(keys.a)dir.x-=1;if(keys.d&&!keys.shift)dir.x+=1;if(dir.lengthSq()){dir.normalize().applyQuaternion(camera.quaternion);dir.y=0;rig.position.addScaledVector(dir,dt*3);}}renderer.render(scene,camera);});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
