import * as THREE from 'three';
const C={bg:'#102432',edge:'#61d9ff',text:'#f4faff',muted:'#bbd3e1'};
export function textTexture(lines,{width=1024,height=640,title='',active=false}={}){
 const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');
 g.fillStyle=active?'#143b48':C.bg;g.fillRect(0,0,width,height);g.strokeStyle=C.edge;g.lineWidth=9;g.strokeRect(9,9,width-18,height-18);
 g.fillStyle='#8feaff';g.font='bold 48px system-ui';g.fillText(title,48,78);
 g.fillStyle=C.text;g.font='36px system-ui';let y=155;for(const line of lines){g.fillText(line,48,y);y+=64;}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
export function panel(title,lines,w=1.7,h=1.06){const group=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,.045),new THREE.MeshStandardMaterial({color:0x142735,metalness:.5,roughness:.35}));group.add(body);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(w-.035,h-.035),new THREE.MeshBasicMaterial({map:textTexture(lines,{title}),transparent:false,side:THREE.DoubleSide}));face.position.z=.026;group.add(face);
 const halo=new THREE.Mesh(new THREE.BoxGeometry(w+.035,h+.035,.035),new THREE.MeshBasicMaterial({color:0x48c8ff,transparent:true,opacity:.13}));halo.position.z=-.03;group.add(halo);group.userData={kind:'panel',title,face,halo,lines,home:null};return group;}
export function updatePanel(group,lines){const face=group.userData.face;face.material.map.dispose();face.material.map=textTexture(lines,{title:group.userData.title});face.material.needsUpdate=true;}
export function label(text,w=1.2,h=.26){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture([],{title:text,width:1024,height:220}),side:THREE.DoubleSide,transparent:false}));return mesh;}
