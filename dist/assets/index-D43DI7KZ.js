(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();const vl="180",Ru=0,Jl=1,Pu=2,bh=1,Mh=2,Xn=3,fi=0,$e=1,Ge=2,hi=0,vs=1,pn=2,Ql=3,tc=4,Iu=5,Ci=100,Du=101,Lu=102,Uu=103,ku=104,Nu=200,Fu=201,zu=202,Bu=203,So=204,To=205,Ou=206,Hu=207,Gu=208,Vu=209,Wu=210,qu=211,Xu=212,Yu=213,$u=214,Eo=0,Ao=1,Co=2,bs=3,Ro=4,Po=5,Io=6,Do=7,wh=0,Zu=1,ju=2,ui=0,Ku=1,Ju=2,Qu=3,yl=4,td=5,ed=6,nd=7,Sh=300,Ms=301,ws=302,Lo=303,Uo=304,Ma=306,ca=1e3,Ii=1001,ko=1002,on=1003,id=1004,mr=1005,Dn=1006,Ia=1007,Di=1008,Fn=1009,Th=1010,Eh=1011,er=1012,_l=1013,ki=1014,Ln=1015,cr=1016,bl=1017,Ml=1018,nr=1020,Ah=35902,Ch=35899,Rh=1021,Ph=1022,xn=1023,ir=1026,sr=1027,wl=1028,Sl=1029,Ih=1030,Tl=1031,El=1033,ea=33776,na=33777,ia=33778,sa=33779,No=35840,Fo=35841,zo=35842,Bo=35843,Oo=36196,Ho=37492,Go=37496,Vo=37808,Wo=37809,qo=37810,Xo=37811,Yo=37812,$o=37813,Zo=37814,jo=37815,Ko=37816,Jo=37817,Qo=37818,tl=37819,el=37820,nl=37821,il=36492,sl=36494,rl=36495,al=36283,ol=36284,ll=36285,cl=36286,sd=3200,rd=3201,Dh=0,ad=1,ci="",Ke="srgb",Ss="srgb-linear",ha="linear",oe="srgb",Xi=7680,ec=519,od=512,ld=513,cd=514,Lh=515,hd=516,ud=517,dd=518,fd=519,hl=35044,nc="300 es",Un=2e3,ua=2001;class As{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const i=n[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}}const Be=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ic=1234567;const js=Math.PI/180,rr=180/Math.PI;function Zn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Be[s&255]+Be[s>>8&255]+Be[s>>16&255]+Be[s>>24&255]+"-"+Be[t&255]+Be[t>>8&255]+"-"+Be[t>>16&15|64]+Be[t>>24&255]+"-"+Be[e&63|128]+Be[e>>8&255]+"-"+Be[e>>16&255]+Be[e>>24&255]+Be[n&255]+Be[n>>8&255]+Be[n>>16&255]+Be[n>>24&255]).toLowerCase()}function Xt(s,t,e){return Math.max(t,Math.min(e,s))}function Al(s,t){return(s%t+t)%t}function pd(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function md(s,t,e){return s!==t?(e-s)/(t-s):0}function Ks(s,t,e){return(1-e)*s+e*t}function gd(s,t,e,n){return Ks(s,t,1-Math.exp(-e*n))}function xd(s,t=1){return t-Math.abs(Al(s,t*2)-t)}function vd(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function yd(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function _d(s,t){return s+Math.floor(Math.random()*(t-s+1))}function bd(s,t){return s+Math.random()*(t-s)}function Md(s){return s*(.5-Math.random())}function wd(s){s!==void 0&&(ic=s);let t=ic+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Sd(s){return s*js}function Td(s){return s*rr}function Ed(s){return(s&s-1)===0&&s!==0}function Ad(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Cd(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Rd(s,t,e,n,i){const r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),d=a((t-n)/2),p=r((n-t)/2),g=a((n-t)/2);switch(i){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*p,o*c);break;case"YXY":s.set(l*p,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function wn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function se(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const sc={DEG2RAD:js,RAD2DEG:rr,generateUUID:Zn,clamp:Xt,euclideanModulo:Al,mapLinear:pd,inverseLerp:md,lerp:Ks,damp:gd,pingpong:xd,smoothstep:vd,smootherstep:yd,randInt:_d,randFloat:bd,randFloatSpread:Md,seededRandom:wd,degToRad:Sd,radToDeg:Td,isPowerOfTwo:Ed,ceilPowerOfTwo:Ad,floorPowerOfTwo:Cd,setQuaternionFromProperEuler:Rd,normalize:se,denormalize:wn};class yt{constructor(t=0,e=0){yt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Xt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Cs{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[a+0],p=r[a+1],g=r[a+2],x=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=x;return}if(u!==x||l!==d||c!==p||h!==g){let m=1-o;const f=l*d+c*p+h*g+u*x,_=f>=0?1:-1,y=1-f*f;if(y>Number.EPSILON){const E=Math.sqrt(y),C=Math.atan2(E,f*_);m=Math.sin(m*C)/E,o=Math.sin(o*C)/E}const v=o*_;if(l=l*m+d*v,c=c*m+p*v,h=h*m+g*v,u=u*m+x*v,m===1-o){const E=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=E,c*=E,h*=E,u*=E}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*p-c*d,t[e+1]=l*g+h*d+c*u-o*p,t[e+2]=c*g+h*p+o*d-l*u,t[e+3]=h*g-o*u-l*d-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),d=l(n/2),p=l(i/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+o+u;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-i)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-i)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Xt(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+i*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*i+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class T{constructor(t=0,e=0,n=0){T.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(rc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(rc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this.z=Xt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this.z=Xt(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Da.copy(this).projectOnVector(t),this.sub(Da)}reflect(t){return this.sub(Da.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Xt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Da=new T,rc=new Cs;class Wt{constructor(t,e,n,i,r,a,o,l,c){Wt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],x=i[0],m=i[3],f=i[6],_=i[1],y=i[4],v=i[7],E=i[2],C=i[5],I=i[8];return r[0]=a*x+o*_+l*E,r[3]=a*m+o*y+l*C,r[6]=a*f+o*v+l*I,r[1]=c*x+h*_+u*E,r[4]=c*m+h*y+u*C,r[7]=c*f+h*v+u*I,r[2]=d*x+p*_+g*E,r[5]=d*m+p*y+g*C,r[8]=d*f+p*v+g*I,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,g=e*u+n*d+i*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return t[0]=u*x,t[1]=(i*c-h*n)*x,t[2]=(o*n-i*a)*x,t[3]=d*x,t[4]=(h*e-i*l)*x,t[5]=(i*r-o*e)*x,t[6]=p*x,t[7]=(n*l-c*e)*x,t[8]=(a*e-n*r)*x,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(La.makeScale(t,e)),this}rotate(t){return this.premultiply(La.makeRotation(-t)),this}translate(t,e){return this.premultiply(La.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const La=new Wt;function Uh(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function da(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Pd(){const s=da("canvas");return s.style.display="block",s}const ac={};function ar(s){s in ac||(ac[s]=!0,console.warn(s))}function Id(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const oc=new Wt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),lc=new Wt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Dd(){const s={enabled:!0,workingColorSpace:Ss,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===oe&&(i.r=jn(i.r),i.g=jn(i.g),i.b=jn(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===oe&&(i.r=ys(i.r),i.g=ys(i.g),i.b=ys(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ci?ha:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return ar("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return ar("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Ss]:{primaries:t,whitePoint:n,transfer:ha,toXYZ:oc,fromXYZ:lc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ke},outputColorSpaceConfig:{drawingBufferColorSpace:Ke}},[Ke]:{primaries:t,whitePoint:n,transfer:oe,toXYZ:oc,fromXYZ:lc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ke}}}),s}const te=Dd();function jn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ys(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Yi;class Ld{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Yi===void 0&&(Yi=da("canvas")),Yi.width=t.width,Yi.height=t.height;const i=Yi.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=Yi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=da("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=jn(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(jn(e[n]/255)*255):e[n]=jn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Ud=0;class Cl{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=Zn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Ua(i[a].image)):r.push(Ua(i[a]))}else r=Ua(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Ua(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Ld.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let kd=0;const ka=new T;class We extends As{constructor(t=We.DEFAULT_IMAGE,e=We.DEFAULT_MAPPING,n=Ii,i=Ii,r=Dn,a=Di,o=xn,l=Fn,c=We.DEFAULT_ANISOTROPY,h=ci){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=Zn(),this.name="",this.source=new Cl(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new yt(0,0),this.repeat=new yt(1,1),this.center=new yt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ka).x}get height(){return this.source.getSize(ka).y}get depth(){return this.source.getSize(ka).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Sh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ca:t.x=t.x-Math.floor(t.x);break;case Ii:t.x=t.x<0?0:1;break;case ko:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ca:t.y=t.y-Math.floor(t.y);break;case Ii:t.y=t.y<0?0:1;break;case ko:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=Sh;We.DEFAULT_ANISOTROPY=1;class le{constructor(t=0,e=0,n=0,i=1){le.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],x=l[2],m=l[6],f=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,v=(p+1)/2,E=(f+1)/2,C=(h+d)/4,I=(u+x)/4,D=(g+m)/4;return y>v&&y>E?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=C/n,r=I/n):v>E?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=C/i,r=D/i):E<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(E),n=I/r,i=D/r),this.set(n,i,r,e),this}let _=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(_)<.001&&(_=1),this.x=(m-g)/_,this.y=(u-x)/_,this.z=(d-h)/_,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Xt(this.x,t.x,e.x),this.y=Xt(this.y,t.y,e.y),this.z=Xt(this.z,t.z,e.z),this.w=Xt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Xt(this.x,t,e),this.y=Xt(this.y,t,e),this.z=Xt(this.z,t,e),this.w=Xt(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Xt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Nd extends As{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new le(0,0,t,e),this.scissorTest=!1,this.viewport=new le(0,0,t,e);const i={width:t,height:e,depth:n.depth},r=new We(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){const e={minFilter:Dn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const i=Object.assign({},t.textures[e].image);this.textures[e].source=new Cl(i)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ni extends Nd{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class kh extends We{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=on,this.minFilter=on,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Fd extends We{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=on,this.minFilter=on,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Gi{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(vn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(vn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=vn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,vn):vn.fromBufferAttribute(r,a),vn.applyMatrix4(t.matrixWorld),this.expandByPoint(vn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),gr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),gr.copy(n.boundingBox)),gr.applyMatrix4(t.matrixWorld),this.union(gr)}const i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,vn),vn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ls),xr.subVectors(this.max,Ls),$i.subVectors(t.a,Ls),Zi.subVectors(t.b,Ls),ji.subVectors(t.c,Ls),ei.subVectors(Zi,$i),ni.subVectors(ji,Zi),xi.subVectors($i,ji);let e=[0,-ei.z,ei.y,0,-ni.z,ni.y,0,-xi.z,xi.y,ei.z,0,-ei.x,ni.z,0,-ni.x,xi.z,0,-xi.x,-ei.y,ei.x,0,-ni.y,ni.x,0,-xi.y,xi.x,0];return!Na(e,$i,Zi,ji,xr)||(e=[1,0,0,0,1,0,0,0,1],!Na(e,$i,Zi,ji,xr))?!1:(vr.crossVectors(ei,ni),e=[vr.x,vr.y,vr.z],Na(e,$i,Zi,ji,xr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,vn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(vn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Bn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const Bn=[new T,new T,new T,new T,new T,new T,new T,new T],vn=new T,gr=new Gi,$i=new T,Zi=new T,ji=new T,ei=new T,ni=new T,xi=new T,Ls=new T,xr=new T,vr=new T,vi=new T;function Na(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){vi.fromArray(s,r);const o=i.x*Math.abs(vi.x)+i.y*Math.abs(vi.y)+i.z*Math.abs(vi.z),l=t.dot(vi),c=e.dot(vi),h=n.dot(vi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const zd=new Gi,Us=new T,Fa=new T;class Vi{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):zd.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Us.subVectors(t,this.center);const e=Us.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Us,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Fa.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Us.copy(t.center).add(Fa)),this.expandByPoint(Us.copy(t.center).sub(Fa))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}const On=new T,za=new T,yr=new T,ii=new T,Ba=new T,_r=new T,Oa=new T;class Rl{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,On)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=On.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(On.copy(this.origin).addScaledVector(this.direction,e),On.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){za.copy(t).add(e).multiplyScalar(.5),yr.copy(e).sub(t).normalize(),ii.copy(this.origin).sub(za);const r=t.distanceTo(e)*.5,a=-this.direction.dot(yr),o=ii.dot(this.direction),l=-ii.dot(yr),c=ii.lengthSq(),h=Math.abs(1-a*a);let u,d,p,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const x=1/h;u*=x,d*=x,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(za).addScaledVector(yr,d),p}intersectSphere(t,e){On.subVectors(t.center,this.origin);const n=On.dot(this.direction),i=On.dot(On)-n*n,r=t.radius*t.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,On)!==null}intersectTriangle(t,e,n,i,r){Ba.subVectors(e,t),_r.subVectors(n,t),Oa.crossVectors(Ba,_r);let a=this.direction.dot(Oa),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;ii.subVectors(this.origin,t);const l=o*this.direction.dot(_r.crossVectors(ii,_r));if(l<0)return null;const c=o*this.direction.dot(Ba.cross(ii));if(c<0||l+c>a)return null;const h=-o*ii.dot(Oa);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ie{constructor(t,e,n,i,r,a,o,l,c,h,u,d,p,g,x,m){ie.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,d,p,g,x,m)}set(t,e,n,i,r,a,o,l,c,h,u,d,p,g,x,m){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=i,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=u,f[14]=d,f[3]=p,f[7]=g,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ie().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/Ki.setFromMatrixColumn(t,0).length(),r=1/Ki.setFromMatrixColumn(t,1).length(),a=1/Ki.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const d=a*h,p=a*u,g=o*h,x=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=p+g*c,e[5]=d-x*c,e[9]=-o*l,e[2]=x-d*c,e[6]=g+p*c,e[10]=a*l}else if(t.order==="YXZ"){const d=l*h,p=l*u,g=c*h,x=c*u;e[0]=d+x*o,e[4]=g*o-p,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-g,e[6]=x+d*o,e[10]=a*l}else if(t.order==="ZXY"){const d=l*h,p=l*u,g=c*h,x=c*u;e[0]=d-x*o,e[4]=-a*u,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*h,e[9]=x-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const d=a*h,p=a*u,g=o*h,x=o*u;e[0]=l*h,e[4]=g*c-p,e[8]=d*c+x,e[1]=l*u,e[5]=x*c+d,e[9]=p*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const d=a*l,p=a*c,g=o*l,x=o*c;e[0]=l*h,e[4]=x-d*u,e[8]=g*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=p*u+g,e[10]=d-x*u}else if(t.order==="XZY"){const d=a*l,p=a*c,g=o*l,x=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+x,e[5]=a*h,e[9]=p*u-g,e[2]=g*u-p,e[6]=o*h,e[10]=x*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Bd,t,Od)}lookAt(t,e,n){const i=this.elements;return sn.subVectors(t,e),sn.lengthSq()===0&&(sn.z=1),sn.normalize(),si.crossVectors(n,sn),si.lengthSq()===0&&(Math.abs(n.z)===1?sn.x+=1e-4:sn.z+=1e-4,sn.normalize(),si.crossVectors(n,sn)),si.normalize(),br.crossVectors(sn,si),i[0]=si.x,i[4]=br.x,i[8]=sn.x,i[1]=si.y,i[5]=br.y,i[9]=sn.y,i[2]=si.z,i[6]=br.z,i[10]=sn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],x=n[6],m=n[10],f=n[14],_=n[3],y=n[7],v=n[11],E=n[15],C=i[0],I=i[4],D=i[8],M=i[12],w=i[1],L=i[5],N=i[9],B=i[13],$=i[2],W=i[6],Y=i[10],K=i[14],V=i[3],at=i[7],ct=i[11],mt=i[15];return r[0]=a*C+o*w+l*$+c*V,r[4]=a*I+o*L+l*W+c*at,r[8]=a*D+o*N+l*Y+c*ct,r[12]=a*M+o*B+l*K+c*mt,r[1]=h*C+u*w+d*$+p*V,r[5]=h*I+u*L+d*W+p*at,r[9]=h*D+u*N+d*Y+p*ct,r[13]=h*M+u*B+d*K+p*mt,r[2]=g*C+x*w+m*$+f*V,r[6]=g*I+x*L+m*W+f*at,r[10]=g*D+x*N+m*Y+f*ct,r[14]=g*M+x*B+m*K+f*mt,r[3]=_*C+y*w+v*$+E*V,r[7]=_*I+y*L+v*W+E*at,r[11]=_*D+y*N+v*Y+E*ct,r[15]=_*M+y*B+v*K+E*mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],p=t[14],g=t[3],x=t[7],m=t[11],f=t[15];return g*(+r*l*u-i*c*u-r*o*d+n*c*d+i*o*p-n*l*p)+x*(+e*l*p-e*c*d+r*a*d-i*a*p+i*c*h-r*l*h)+m*(+e*c*u-e*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+f*(-i*o*h-e*l*u+e*o*d+i*a*u-n*a*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],p=t[11],g=t[12],x=t[13],m=t[14],f=t[15],_=u*m*c-x*d*c+x*l*p-o*m*p-u*l*f+o*d*f,y=g*d*c-h*m*c-g*l*p+a*m*p+h*l*f-a*d*f,v=h*x*c-g*u*c+g*o*p-a*x*p-h*o*f+a*u*f,E=g*u*l-h*x*l-g*o*d+a*x*d+h*o*m-a*u*m,C=e*_+n*y+i*v+r*E;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/C;return t[0]=_*I,t[1]=(x*d*r-u*m*r-x*i*p+n*m*p+u*i*f-n*d*f)*I,t[2]=(o*m*r-x*l*r+x*i*c-n*m*c-o*i*f+n*l*f)*I,t[3]=(u*l*r-o*d*r-u*i*c+n*d*c+o*i*p-n*l*p)*I,t[4]=y*I,t[5]=(h*m*r-g*d*r+g*i*p-e*m*p-h*i*f+e*d*f)*I,t[6]=(g*l*r-a*m*r-g*i*c+e*m*c+a*i*f-e*l*f)*I,t[7]=(a*d*r-h*l*r+h*i*c-e*d*c-a*i*p+e*l*p)*I,t[8]=v*I,t[9]=(g*u*r-h*x*r-g*n*p+e*x*p+h*n*f-e*u*f)*I,t[10]=(a*x*r-g*o*r+g*n*c-e*x*c-a*n*f+e*o*f)*I,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*p-e*o*p)*I,t[12]=E*I,t[13]=(h*x*i-g*u*i+g*n*d-e*x*d-h*n*m+e*u*m)*I,t[14]=(g*o*i-a*x*i-g*n*l+e*x*l+a*n*m-e*o*m)*I,t[15]=(a*u*i-h*o*i+h*n*l-e*u*l-a*n*d+e*o*d)*I,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,g=r*u,x=a*h,m=a*u,f=o*u,_=l*c,y=l*h,v=l*u,E=n.x,C=n.y,I=n.z;return i[0]=(1-(x+f))*E,i[1]=(p+v)*E,i[2]=(g-y)*E,i[3]=0,i[4]=(p-v)*C,i[5]=(1-(d+f))*C,i[6]=(m+_)*C,i[7]=0,i[8]=(g+y)*I,i[9]=(m-_)*I,i[10]=(1-(d+x))*I,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=Ki.set(i[0],i[1],i[2]).length();const a=Ki.set(i[4],i[5],i[6]).length(),o=Ki.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],yn.copy(this);const c=1/r,h=1/a,u=1/o;return yn.elements[0]*=c,yn.elements[1]*=c,yn.elements[2]*=c,yn.elements[4]*=h,yn.elements[5]*=h,yn.elements[6]*=h,yn.elements[8]*=u,yn.elements[9]*=u,yn.elements[10]*=u,e.setFromRotationMatrix(yn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,i,r,a,o=Un,l=!1){const c=this.elements,h=2*r/(e-t),u=2*r/(n-i),d=(e+t)/(e-t),p=(n+i)/(n-i);let g,x;if(l)g=r/(a-r),x=a*r/(a-r);else if(o===Un)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===ua)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=Un,l=!1){const c=this.elements,h=2/(e-t),u=2/(n-i),d=-(e+t)/(e-t),p=-(n+i)/(n-i);let g,x;if(l)g=1/(a-r),x=a/(a-r);else if(o===Un)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===ua)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Ki=new T,yn=new ie,Bd=new T(0,0,0),Od=new T(1,1,1),si=new T,br=new T,sn=new T,cc=new ie,hc=new Cs;class En{constructor(t=0,e=0,n=0,i=En.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],p=i[10];switch(e){case"XYZ":this._y=Math.asin(Xt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Xt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return cc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(cc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return hc.setFromEuler(this),this.setFromQuaternion(hc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}En.DEFAULT_ORDER="XYZ";class Nh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Hd=0;const uc=new T,Ji=new Cs,Hn=new ie,Mr=new T,ks=new T,Gd=new T,Vd=new Cs,dc=new T(1,0,0),fc=new T(0,1,0),pc=new T(0,0,1),mc={type:"added"},Wd={type:"removed"},Qi={type:"childadded",child:null},Ha={type:"childremoved",child:null};class Ae extends As{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Hd++}),this.uuid=Zn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ae.DEFAULT_UP.clone();const t=new T,e=new En,n=new Cs,i=new T(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ie},normalMatrix:{value:new Wt}}),this.matrix=new ie,this.matrixWorld=new ie,this.matrixAutoUpdate=Ae.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Nh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ji.setFromAxisAngle(t,e),this.quaternion.multiply(Ji),this}rotateOnWorldAxis(t,e){return Ji.setFromAxisAngle(t,e),this.quaternion.premultiply(Ji),this}rotateX(t){return this.rotateOnAxis(dc,t)}rotateY(t){return this.rotateOnAxis(fc,t)}rotateZ(t){return this.rotateOnAxis(pc,t)}translateOnAxis(t,e){return uc.copy(t).applyQuaternion(this.quaternion),this.position.add(uc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(dc,t)}translateY(t){return this.translateOnAxis(fc,t)}translateZ(t){return this.translateOnAxis(pc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Hn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Mr.copy(t):Mr.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hn.lookAt(ks,Mr,this.up):Hn.lookAt(Mr,ks,this.up),this.quaternion.setFromRotationMatrix(Hn),i&&(Hn.extractRotation(i.matrixWorld),Ji.setFromRotationMatrix(Hn),this.quaternion.premultiply(Ji.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(mc),Qi.child=t,this.dispatchEvent(Qi),Qi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Wd),Ha.child=t,this.dispatchEvent(Ha),Ha.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Hn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Hn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Hn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(mc),Qi.child=t,this.dispatchEvent(Qi),Qi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,t,Gd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,Vd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Ae.DEFAULT_UP=new T(0,1,0);Ae.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ae.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const _n=new T,Gn=new T,Ga=new T,Vn=new T,ts=new T,es=new T,gc=new T,Va=new T,Wa=new T,qa=new T,Xa=new le,Ya=new le,$a=new le;class mn{constructor(t=new T,e=new T,n=new T){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),_n.subVectors(t,e),i.cross(_n);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){_n.subVectors(i,e),Gn.subVectors(n,e),Ga.subVectors(t,e);const a=_n.dot(_n),o=_n.dot(Gn),l=_n.dot(Ga),c=Gn.dot(Gn),h=Gn.dot(Ga),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,p=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Vn)===null?!1:Vn.x>=0&&Vn.y>=0&&Vn.x+Vn.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,Vn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Vn.x),l.addScaledVector(a,Vn.y),l.addScaledVector(o,Vn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return Xa.setScalar(0),Ya.setScalar(0),$a.setScalar(0),Xa.fromBufferAttribute(t,e),Ya.fromBufferAttribute(t,n),$a.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(Xa,r.x),a.addScaledVector(Ya,r.y),a.addScaledVector($a,r.z),a}static isFrontFacing(t,e,n,i){return _n.subVectors(n,e),Gn.subVectors(t,e),_n.cross(Gn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return _n.subVectors(this.c,this.b),Gn.subVectors(this.a,this.b),_n.cross(Gn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return mn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return mn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return mn.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return mn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return mn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let a,o;ts.subVectors(i,n),es.subVectors(r,n),Va.subVectors(t,n);const l=ts.dot(Va),c=es.dot(Va);if(l<=0&&c<=0)return e.copy(n);Wa.subVectors(t,i);const h=ts.dot(Wa),u=es.dot(Wa);if(h>=0&&u<=h)return e.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(ts,a);qa.subVectors(t,r);const p=ts.dot(qa),g=es.dot(qa);if(g>=0&&p<=g)return e.copy(r);const x=p*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(es,o);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return gc.subVectors(r,i),o=(u-h)/(u-h+(p-g)),e.copy(i).addScaledVector(gc,o);const f=1/(m+x+d);return a=x*f,o=d*f,e.copy(n).addScaledVector(ts,a).addScaledVector(es,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ri={h:0,s:0,l:0},wr={h:0,s:0,l:0};function Za(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class Mt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ke){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,te.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=te.workingColorSpace){return this.r=t,this.g=e,this.b=n,te.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=te.workingColorSpace){if(t=Al(t,1),e=Xt(e,0,1),n=Xt(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Za(a,r,t+1/3),this.g=Za(a,r,t),this.b=Za(a,r,t-1/3)}return te.colorSpaceToWorking(this,i),this}setStyle(t,e=Ke){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ke){const n=Fh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=jn(t.r),this.g=jn(t.g),this.b=jn(t.b),this}copyLinearToSRGB(t){return this.r=ys(t.r),this.g=ys(t.g),this.b=ys(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ke){return te.workingToColorSpace(Oe.copy(this),t),Math.round(Xt(Oe.r*255,0,255))*65536+Math.round(Xt(Oe.g*255,0,255))*256+Math.round(Xt(Oe.b*255,0,255))}getHexString(t=Ke){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=te.workingColorSpace){te.workingToColorSpace(Oe.copy(this),e);const n=Oe.r,i=Oe.g,r=Oe.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=te.workingColorSpace){return te.workingToColorSpace(Oe.copy(this),e),t.r=Oe.r,t.g=Oe.g,t.b=Oe.b,t}getStyle(t=Ke){te.workingToColorSpace(Oe.copy(this),t);const e=Oe.r,n=Oe.g,i=Oe.b;return t!==Ke?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(ri),this.setHSL(ri.h+t,ri.s+e,ri.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ri),t.getHSL(wr);const n=Ks(ri.h,wr.h,e),i=Ks(ri.s,wr.s,e),r=Ks(ri.l,wr.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Oe=new Mt;Mt.NAMES=Fh;let qd=0;class pi extends As{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qd++}),this.uuid=Zn(),this.name="",this.type="Material",this.blending=vs,this.side=fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=So,this.blendDst=To,this.blendEquation=Ci,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Mt(0,0,0),this.blendAlpha=0,this.depthFunc=bs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ec,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xi,this.stencilZFail=Xi,this.stencilZPass=Xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==vs&&(n.blending=this.blending),this.side!==fi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==So&&(n.blendSrc=this.blendSrc),this.blendDst!==To&&(n.blendDst=this.blendDst),this.blendEquation!==Ci&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==bs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ec&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Xi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Xi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class Me extends pi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=wh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ce=new T,Sr=new yt;let Xd=0;class we{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Xd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=hl,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Sr.fromBufferAttribute(this,e),Sr.applyMatrix3(t),this.setXY(e,Sr.x,Sr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix3(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix4(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyNormalMatrix(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.transformDirection(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=wn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=wn(e,this.array)),e}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=wn(e,this.array)),e}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=wn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=wn(e,this.array)),e}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),i=se(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=se(e,this.array),n=se(n,this.array),i=se(i,this.array),r=se(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==hl&&(t.usage=this.usage),t}}class zh extends we{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Bh extends we{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class jt extends we{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Yd=0;const un=new ie,ja=new Ae,ns=new T,rn=new Gi,Ns=new Gi,Ne=new T;class ue extends As{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=Zn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Uh(t)?Bh:zh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Wt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return un.makeRotationFromQuaternion(t),this.applyMatrix4(un),this}rotateX(t){return un.makeRotationX(t),this.applyMatrix4(un),this}rotateY(t){return un.makeRotationY(t),this.applyMatrix4(un),this}rotateZ(t){return un.makeRotationZ(t),this.applyMatrix4(un),this}translate(t,e,n){return un.makeTranslation(t,e,n),this.applyMatrix4(un),this}scale(t,e,n){return un.makeScale(t,e,n),this.applyMatrix4(un),this}lookAt(t){return ja.lookAt(t),ja.updateMatrix(),this.applyMatrix4(ja.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ns).negate(),this.translate(ns.x,ns.y,ns.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new jt(n,3))}else{const n=Math.min(t.length,e.count);for(let i=0;i<n;i++){const r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];rn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ne.addVectors(this.boundingBox.min,rn.min),this.boundingBox.expandByPoint(Ne),Ne.addVectors(this.boundingBox.max,rn.max),this.boundingBox.expandByPoint(Ne)):(this.boundingBox.expandByPoint(rn.min),this.boundingBox.expandByPoint(rn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){const n=this.boundingSphere.center;if(rn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];Ns.setFromBufferAttribute(o),this.morphTargetsRelative?(Ne.addVectors(rn.min,Ns.min),rn.expandByPoint(Ne),Ne.addVectors(rn.max,Ns.max),rn.expandByPoint(Ne)):(rn.expandByPoint(Ns.min),rn.expandByPoint(Ns.max))}rn.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)Ne.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Ne));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ne.fromBufferAttribute(o,c),l&&(ns.fromBufferAttribute(t,c),Ne.add(ns)),i=Math.max(i,n.distanceToSquared(Ne))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new we(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let D=0;D<n.count;D++)o[D]=new T,l[D]=new T;const c=new T,h=new T,u=new T,d=new yt,p=new yt,g=new yt,x=new T,m=new T;function f(D,M,w){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,w),d.fromBufferAttribute(r,D),p.fromBufferAttribute(r,M),g.fromBufferAttribute(r,w),h.sub(c),u.sub(c),p.sub(d),g.sub(d);const L=1/(p.x*g.y-g.x*p.y);isFinite(L)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(L),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(L),o[D].add(x),o[M].add(x),o[w].add(x),l[D].add(m),l[M].add(m),l[w].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let D=0,M=_.length;D<M;++D){const w=_[D],L=w.start,N=w.count;for(let B=L,$=L+N;B<$;B+=3)f(t.getX(B+0),t.getX(B+1),t.getX(B+2))}const y=new T,v=new T,E=new T,C=new T;function I(D){E.fromBufferAttribute(i,D),C.copy(E);const M=o[D];y.copy(M),y.sub(E.multiplyScalar(E.dot(M))).normalize(),v.crossVectors(C,M);const L=v.dot(l[D])<0?-1:1;a.setXYZW(D,y.x,y.y,y.z,L)}for(let D=0,M=_.length;D<M;++D){const w=_[D],L=w.start,N=w.count;for(let B=L,$=L+N;B<$;B+=3)I(t.getX(B+0)),I(t.getX(B+1)),I(t.getX(B+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new we(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const i=new T,r=new T,a=new T,o=new T,l=new T,c=new T,h=new T,u=new T;if(t)for(let d=0,p=t.count;d<p;d+=3){const g=t.getX(d+0),x=t.getX(d+1),m=t.getX(d+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=e.count;d<p;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ne.fromBufferAttribute(t,e),Ne.normalize(),t.setXYZ(e,Ne.x,Ne.y,Ne.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let p=0,g=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?p=l[x]*o.data.stride+o.offset:p=l[x]*h;for(let f=0;f<h;f++)d[g++]=c[p++]}return new we(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ue,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],p=t(d,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const p=c[u];h.push(p.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const xc=new ie,yi=new Rl,Tr=new Vi,vc=new T,Er=new T,Ar=new T,Cr=new T,Ka=new T,Rr=new T,yc=new T,Pr=new T;class pt extends Ae{constructor(t=new ue,e=new Me){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const o=this.morphTargetInfluences;if(r&&o){Rr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(Ka.fromBufferAttribute(u,t),a?Rr.addScaledVector(Ka,h):Rr.addScaledVector(Ka.sub(e),h))}e.add(Rr)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Tr.copy(n.boundingSphere),Tr.applyMatrix4(r),yi.copy(t.ray).recast(t.near),!(Tr.containsPoint(yi.origin)===!1&&(yi.intersectSphere(Tr,vc)===null||yi.origin.distanceToSquared(vc)>(t.far-t.near)**2))&&(xc.copy(r).invert(),yi.copy(t.ray).applyMatrix4(xc),!(n.boundingBox!==null&&yi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,yi)))}_computeIntersections(t,e,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=a[m.materialIndex],_=Math.max(m.start,p.start),y=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let v=_,E=y;v<E;v+=3){const C=o.getX(v),I=o.getX(v+1),D=o.getX(v+2);i=Ir(this,f,t,n,c,h,u,C,I,D),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const _=o.getX(m),y=o.getX(m+1),v=o.getX(m+2);i=Ir(this,a,t,n,c,h,u,_,y,v),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=a[m.materialIndex],_=Math.max(m.start,p.start),y=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=_,E=y;v<E;v+=3){const C=v,I=v+1,D=v+2;i=Ir(this,f,t,n,c,h,u,C,I,D),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const _=m,y=m+1,v=m+2;i=Ir(this,a,t,n,c,h,u,_,y,v),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}}function $d(s,t,e,n,i,r,a,o){let l;if(t.side===$e?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===fi,o),l===null)return null;Pr.copy(o),Pr.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Pr);return c<e.near||c>e.far?null:{distance:c,point:Pr.clone(),object:s}}function Ir(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Er),s.getVertexPosition(l,Ar),s.getVertexPosition(c,Cr);const h=$d(s,t,e,n,Er,Ar,Cr,yc);if(h){const u=new T;mn.getBarycoord(yc,Er,Ar,Cr,u),i&&(h.uv=mn.getInterpolatedAttribute(i,o,l,c,u,new yt)),r&&(h.uv1=mn.getInterpolatedAttribute(r,o,l,c,u,new yt)),a&&(h.normal=mn.getInterpolatedAttribute(a,o,l,c,u,new T),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new T,materialIndex:0};mn.getNormal(Er,Ar,Cr,d.normal),h.face=d,h.barycoord=u}return h}class Ve extends ue{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,i,a,2),g("x","z","y",1,-1,t,n,-e,i,a,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new jt(c,3)),this.setAttribute("normal",new jt(h,3)),this.setAttribute("uv",new jt(u,2));function g(x,m,f,_,y,v,E,C,I,D,M){const w=v/I,L=E/D,N=v/2,B=E/2,$=C/2,W=I+1,Y=D+1;let K=0,V=0;const at=new T;for(let ct=0;ct<Y;ct++){const mt=ct*L-B;for(let Bt=0;Bt<W;Bt++){const Jt=Bt*w-N;at[x]=Jt*_,at[m]=mt*y,at[f]=$,c.push(at.x,at.y,at.z),at[x]=0,at[m]=0,at[f]=C>0?1:-1,h.push(at.x,at.y,at.z),u.push(Bt/I),u.push(1-ct/D),K+=1}}for(let ct=0;ct<D;ct++)for(let mt=0;mt<I;mt++){const Bt=d+mt+W*ct,Jt=d+mt+W*(ct+1),ee=d+(mt+1)+W*(ct+1),Yt=d+(mt+1)+W*ct;l.push(Bt,Jt,Yt),l.push(Jt,ee,Yt),V+=6}o.addGroup(p,V,M),p+=V,d+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ve(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ts(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Ye(s){const t={};for(let e=0;e<s.length;e++){const n=Ts(s[e]);for(const i in n)t[i]=n[i]}return t}function Zd(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Oh(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:te.workingColorSpace}const jd={clone:Ts,merge:Ye};var Kd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Jd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Kn extends pi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Kd,this.fragmentShader=Jd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ts(t.uniforms),this.uniformsGroups=Zd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Hh extends Ae{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ie,this.projectionMatrix=new ie,this.projectionMatrixInverse=new ie,this.coordinateSystem=Un,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ai=new T,_c=new yt,bc=new yt;class Je extends Hh{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=rr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(js*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ai.x,ai.y).multiplyScalar(-t/ai.z),ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ai.x,ai.y).multiplyScalar(-t/ai.z)}getViewSize(t,e){return this.getViewBounds(t,_c,bc),e.subVectors(bc,_c)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(js*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const is=-90,ss=1;class Qd extends Ae{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Je(is,ss,t,e);i.layers=this.layers,this.add(i);const r=new Je(is,ss,t,e);r.layers=this.layers,this.add(r);const a=new Je(is,ss,t,e);a.layers=this.layers,this.add(a);const o=new Je(is,ss,t,e);o.layers=this.layers,this.add(o);const l=new Je(is,ss,t,e);l.layers=this.layers,this.add(l);const c=new Je(is,ss,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===Un)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ua)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,a),t.setRenderTarget(n,2,i),t.render(e,o),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Gh extends We{constructor(t=[],e=Ms,n,i,r,a,o,l,c,h){super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class tf extends Ni{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Gh(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ve(5,5,5),r=new Kn({name:"CubemapFromEquirect",uniforms:Ts(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:$e,blending:hi});r.uniforms.tEquirect.value=e;const a=new pt(i,r),o=e.minFilter;return e.minFilter===Di&&(e.minFilter=Dn),new Qd(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}}class Kt extends Ae{constructor(){super(),this.isGroup=!0,this.type="Group"}}const ef={type:"move"};class Ja{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Kt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Kt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Kt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const x of t.hand.values()){const m=e.getJointPose(x,n),f=this._getHandJoint(c,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ef)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Kt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}class Pl{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Mt(t),this.density=e}clone(){return new Pl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Vh extends Ae{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new En,this.environmentIntensity=1,this.environmentRotation=new En,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class nf{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=hl,this.updateRanges=[],this.version=0,this.uuid=Zn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Xe=new T;class fa{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.applyMatrix4(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.applyNormalMatrix(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.transformDirection(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=wn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=se(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=se(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=wn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=wn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=wn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=wn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),i=se(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=se(e,this.array),n=se(n,this.array),i=se(i,this.array),r=se(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new we(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new fa(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Wi extends pi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Mt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let rs;const Fs=new T,as=new T,os=new T,ls=new yt,zs=new yt,Wh=new ie,Dr=new T,Bs=new T,Lr=new T,Mc=new yt,Qa=new yt,wc=new yt;class Rs extends Ae{constructor(t=new Wi){if(super(),this.isSprite=!0,this.type="Sprite",rs===void 0){rs=new ue;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new nf(e,5);rs.setIndex([0,1,2,0,2,3]),rs.setAttribute("position",new fa(n,3,0,!1)),rs.setAttribute("uv",new fa(n,2,3,!1))}this.geometry=rs,this.material=t,this.center=new yt(.5,.5),this.count=1}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),as.setFromMatrixScale(this.matrixWorld),Wh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),os.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&as.multiplyScalar(-os.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const a=this.center;Ur(Dr.set(-.5,-.5,0),os,a,as,i,r),Ur(Bs.set(.5,-.5,0),os,a,as,i,r),Ur(Lr.set(.5,.5,0),os,a,as,i,r),Mc.set(0,0),Qa.set(1,0),wc.set(1,1);let o=t.ray.intersectTriangle(Dr,Bs,Lr,!1,Fs);if(o===null&&(Ur(Bs.set(-.5,.5,0),os,a,as,i,r),Qa.set(0,1),o=t.ray.intersectTriangle(Dr,Lr,Bs,!1,Fs),o===null))return;const l=t.ray.origin.distanceTo(Fs);l<t.near||l>t.far||e.push({distance:l,point:Fs.clone(),uv:mn.getInterpolation(Fs,Dr,Bs,Lr,Mc,Qa,wc,new yt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function Ur(s,t,e,n,i,r){ls.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(zs.x=r*ls.x-i*ls.y,zs.y=i*ls.x+r*ls.y):zs.copy(ls),s.copy(t),s.x+=zs.x,s.y+=zs.y,s.applyMatrix4(Wh)}class qh extends We{constructor(t=null,e=1,n=1,i,r,a,o,l,c=on,h=on,u,d){super(null,a,o,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Sc extends we{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const cs=new ie,Tc=new ie,kr=[],Ec=new Gi,sf=new ie,Os=new pt,Hs=new Vi;class rf extends pt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Sc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,sf)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Gi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,cs),Ec.copy(t.boundingBox).applyMatrix4(cs),this.boundingBox.union(Ec)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,cs),Hs.copy(t.boundingSphere).applyMatrix4(cs),this.boundingSphere.union(Hs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(Os.geometry=this.geometry,Os.material=this.material,Os.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Hs.copy(this.boundingSphere),Hs.applyMatrix4(n),t.ray.intersectsSphere(Hs)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,cs),Tc.multiplyMatrices(n,cs),Os.matrixWorld=Tc,Os.raycast(t,kr);for(let a=0,o=kr.length;a<o;a++){const l=kr[a];l.instanceId=r,l.object=this,e.push(l)}kr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Sc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new qh(new Float32Array(i*this.count),i,this.count,wl,Ln));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const to=new T,af=new T,of=new Wt;class Ei{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=to.subVectors(n,e).cross(af.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(to),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||of.getNormalMatrix(t),i=this.coplanarPoint(to).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const _i=new Vi,lf=new yt(.5,.5),Nr=new T;class Il{constructor(t=new Ei,e=new Ei,n=new Ei,i=new Ei,r=new Ei,a=new Ei){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Un,n=!1){const i=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],p=r[7],g=r[8],x=r[9],m=r[10],f=r[11],_=r[12],y=r[13],v=r[14],E=r[15];if(i[0].setComponents(c-a,p-h,f-g,E-_).normalize(),i[1].setComponents(c+a,p+h,f+g,E+_).normalize(),i[2].setComponents(c+o,p+u,f+x,E+y).normalize(),i[3].setComponents(c-o,p-u,f-x,E-y).normalize(),n)i[4].setComponents(l,d,m,v).normalize(),i[5].setComponents(c-l,p-d,f-m,E-v).normalize();else if(i[4].setComponents(c-l,p-d,f-m,E-v).normalize(),e===Un)i[5].setComponents(c+l,p+d,f+m,E+v).normalize();else if(e===ua)i[5].setComponents(l,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(t){_i.center.set(0,0,0);const e=lf.distanceTo(t.center);return _i.radius=.7071067811865476+e,_i.applyMatrix4(t.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(Nr.x=i.normal.x>0?t.max.x:t.min.x,Nr.y=i.normal.y>0?t.max.y:t.min.y,Nr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Nr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class wa extends pi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Mt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const pa=new T,ma=new T,Ac=new ie,Gs=new Rl,Fr=new Vi,eo=new T,Cc=new T;class Dl extends Ae{constructor(t=new ue,e=new wa){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let i=1,r=e.count;i<r;i++)pa.fromBufferAttribute(e,i-1),ma.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=pa.distanceTo(ma);t.setAttribute("lineDistance",new jt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fr.copy(n.boundingSphere),Fr.applyMatrix4(i),Fr.radius+=r,t.ray.intersectsSphere(Fr)===!1)return;Ac.copy(i).invert(),Gs.copy(t.ray).applyMatrix4(Ac);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=c){const f=h.getX(x),_=h.getX(x+1),y=zr(this,t,Gs,l,f,_,x);y&&e.push(y)}if(this.isLineLoop){const x=h.getX(g-1),m=h.getX(p),f=zr(this,t,Gs,l,x,m,g-1);f&&e.push(f)}}else{const p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=c){const f=zr(this,t,Gs,l,x,x+1,x);f&&e.push(f)}if(this.isLineLoop){const x=zr(this,t,Gs,l,g-1,p,g-1);x&&e.push(x)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function zr(s,t,e,n,i,r,a){const o=s.geometry.attributes.position;if(pa.fromBufferAttribute(o,i),ma.fromBufferAttribute(o,r),e.distanceSqToSegment(pa,ma,eo,Cc)>n)return;eo.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(eo);if(!(c<t.near||c>t.far))return{distance:c,point:Cc.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Rc=new T,Pc=new T;class cf extends Dl{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let i=0,r=e.count;i<r;i+=2)Rc.fromBufferAttribute(e,i),Pc.fromBufferAttribute(e,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Rc.distanceTo(Pc);t.setAttribute("lineDistance",new jt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ll extends pi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Mt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Ic=new ie,ul=new Rl,Br=new Vi,Or=new T;class Xh extends Ae{constructor(t=new ue,e=new Ll){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Br.copy(n.boundingSphere),Br.applyMatrix4(i),Br.radius+=r,t.ray.intersectsSphere(Br)===!1)return;Ic.copy(i).invert(),ul.copy(t.ray).applyMatrix4(Ic);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=d,x=p;g<x;g++){const m=c.getX(g);Or.fromBufferAttribute(u,m),Dc(Or,m,l,i,t,e,this)}}else{const d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=d,x=p;g<x;g++)Or.fromBufferAttribute(u,g),Dc(Or,g,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Dc(s,t,e,n,i,r,a){const o=ul.distanceSqToPoint(s);if(o<e){const l=new T;ul.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class Ul extends We{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Yh extends We{constructor(t,e,n=ki,i,r,a,o=on,l=on,c,h=ir,u=1){if(h!==ir&&h!==sr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:t,height:e,depth:u};super(d,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Cl(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class $h extends We{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Li extends ue{constructor(t=1,e=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:i,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));const a=[],o=[],l=[],c=[],h=e/2,u=Math.PI/2*t,d=e,p=2*u+d,g=n*2+r,x=i+1,m=new T,f=new T;for(let _=0;_<=g;_++){let y=0,v=0,E=0,C=0;if(_<=n){const M=_/n,w=M*Math.PI/2;v=-h-t*Math.cos(w),E=t*Math.sin(w),C=-t*Math.cos(w),y=M*u}else if(_<=n+r){const M=(_-n)/r;v=-h+M*e,E=t,C=0,y=u+M*d}else{const M=(_-n-r)/n,w=M*Math.PI/2;v=h+t*Math.sin(w),E=t*Math.cos(w),C=t*Math.sin(w),y=u+d+M*u}const I=Math.max(0,Math.min(1,y/p));let D=0;_===0?D=.5/i:_===g&&(D=-.5/i);for(let M=0;M<=i;M++){const w=M/i,L=w*Math.PI*2,N=Math.sin(L),B=Math.cos(L);f.x=-E*B,f.y=v,f.z=E*N,o.push(f.x,f.y,f.z),m.set(-E*B,C,E*N),m.normalize(),l.push(m.x,m.y,m.z),c.push(w+D,I)}if(_>0){const M=(_-1)*x;for(let w=0;w<i;w++){const L=M+w,N=M+w+1,B=_*x+w,$=_*x+w+1;a.push(L,N,B),a.push(N,$,B)}}}this.setIndex(a),this.setAttribute("position",new jt(o,3)),this.setAttribute("normal",new jt(l,3)),this.setAttribute("uv",new jt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Li(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class kl extends ue{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new T,h=new yt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){const p=n+u/e*i;c.x=t*Math.cos(p),c.y=t*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new jt(a,3)),this.setAttribute("normal",new jt(o,3)),this.setAttribute("uv",new jt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new kl(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class tn extends ue{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],p=[];let g=0;const x=[],m=n/2;let f=0;_(),a===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new jt(u,3)),this.setAttribute("normal",new jt(d,3)),this.setAttribute("uv",new jt(p,2));function _(){const v=new T,E=new T;let C=0;const I=(e-t)/n;for(let D=0;D<=r;D++){const M=[],w=D/r,L=w*(e-t)+t;for(let N=0;N<=i;N++){const B=N/i,$=B*l+o,W=Math.sin($),Y=Math.cos($);E.x=L*W,E.y=-w*n+m,E.z=L*Y,u.push(E.x,E.y,E.z),v.set(W,I,Y).normalize(),d.push(v.x,v.y,v.z),p.push(B,1-w),M.push(g++)}x.push(M)}for(let D=0;D<i;D++)for(let M=0;M<r;M++){const w=x[M][D],L=x[M+1][D],N=x[M+1][D+1],B=x[M][D+1];(t>0||M!==0)&&(h.push(w,L,B),C+=3),(e>0||M!==r-1)&&(h.push(L,N,B),C+=3)}c.addGroup(f,C,0),f+=C}function y(v){const E=g,C=new yt,I=new T;let D=0;const M=v===!0?t:e,w=v===!0?1:-1;for(let N=1;N<=i;N++)u.push(0,m*w,0),d.push(0,w,0),p.push(.5,.5),g++;const L=g;for(let N=0;N<=i;N++){const $=N/i*l+o,W=Math.cos($),Y=Math.sin($);I.x=M*Y,I.y=m*w,I.z=M*W,u.push(I.x,I.y,I.z),d.push(0,w,0),C.x=W*.5+.5,C.y=Y*.5*w+.5,p.push(C.x,C.y),g++}for(let N=0;N<i;N++){const B=E+N,$=L+N;v===!0?h.push($,$+1,B):h.push($+1,$,B),D+=3}c.addGroup(f,D,v===!0?1:2),f+=D}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new tn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Ie extends tn{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new Ie(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class hr extends ue{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],a=[];o(i),c(n),h(),this.setAttribute("position",new jt(r,3)),this.setAttribute("normal",new jt(r.slice(),3)),this.setAttribute("uv",new jt(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const y=new T,v=new T,E=new T;for(let C=0;C<e.length;C+=3)p(e[C+0],y),p(e[C+1],v),p(e[C+2],E),l(y,v,E,_)}function l(_,y,v,E){const C=E+1,I=[];for(let D=0;D<=C;D++){I[D]=[];const M=_.clone().lerp(v,D/C),w=y.clone().lerp(v,D/C),L=C-D;for(let N=0;N<=L;N++)N===0&&D===C?I[D][N]=M:I[D][N]=M.clone().lerp(w,N/L)}for(let D=0;D<C;D++)for(let M=0;M<2*(C-D)-1;M++){const w=Math.floor(M/2);M%2===0?(d(I[D][w+1]),d(I[D+1][w]),d(I[D][w])):(d(I[D][w+1]),d(I[D+1][w+1]),d(I[D+1][w]))}}function c(_){const y=new T;for(let v=0;v<r.length;v+=3)y.x=r[v+0],y.y=r[v+1],y.z=r[v+2],y.normalize().multiplyScalar(_),r[v+0]=y.x,r[v+1]=y.y,r[v+2]=y.z}function h(){const _=new T;for(let y=0;y<r.length;y+=3){_.x=r[y+0],_.y=r[y+1],_.z=r[y+2];const v=m(_)/2/Math.PI+.5,E=f(_)/Math.PI+.5;a.push(v,1-E)}g(),u()}function u(){for(let _=0;_<a.length;_+=6){const y=a[_+0],v=a[_+2],E=a[_+4],C=Math.max(y,v,E),I=Math.min(y,v,E);C>.9&&I<.1&&(y<.2&&(a[_+0]+=1),v<.2&&(a[_+2]+=1),E<.2&&(a[_+4]+=1))}}function d(_){r.push(_.x,_.y,_.z)}function p(_,y){const v=_*3;y.x=t[v+0],y.y=t[v+1],y.z=t[v+2]}function g(){const _=new T,y=new T,v=new T,E=new T,C=new yt,I=new yt,D=new yt;for(let M=0,w=0;M<r.length;M+=9,w+=6){_.set(r[M+0],r[M+1],r[M+2]),y.set(r[M+3],r[M+4],r[M+5]),v.set(r[M+6],r[M+7],r[M+8]),C.set(a[w+0],a[w+1]),I.set(a[w+2],a[w+3]),D.set(a[w+4],a[w+5]),E.copy(_).add(y).add(v).divideScalar(3);const L=m(E);x(C,w+0,_,L),x(I,w+2,y,L),x(D,w+4,v,L)}}function x(_,y,v,E){E<0&&_.x===1&&(a[y]=_.x-1),v.x===0&&v.z===0&&(a[y]=E/2/Math.PI+.5)}function m(_){return Math.atan2(_.z,-_.x)}function f(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new hr(t.vertices,t.indices,t.radius,t.details)}}class Fi extends hr{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Fi(t.radius,t.detail)}}class ti{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){const n=this.getLengths();let i=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);const h=n[i],d=n[i+1]-h,p=(a-h)/d;return(i+p)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new yt:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){const n=new T,i=[],r=[],a=[],o=new T,l=new ie;for(let p=0;p<=t;p++){const g=p/t;i[p]=this.getTangentAt(g,new T)}r[0]=new T,a[0]=new T;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(i[p-1],i[p]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(Xt(i[p-1].dot(i[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,g))}a[p].crossVectors(i[p],r[p])}if(e===!0){let p=Math.acos(Xt(r[0].dot(r[t]),-1,1));p/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],p*g)),a[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Zh extends ti{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new yt){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class hf extends Zh{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Nl(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,p*=h,i(a,o,d,p)},calc:function(r){const a=r*r,o=a*r;return s+t*r+e*a+n*o}}}const Hr=new T,no=new Nl,io=new Nl,so=new Nl;class Fl extends ti{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new T){const n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(Hr.subVectors(i[0],i[1]).add(i[0]),c=Hr);const u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(Hr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Hr),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),p),x=Math.pow(u.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(h),p);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),no.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,x,m),io.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,x,m),so.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(no.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),io.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),so.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(no.calc(l),io.calc(l),so.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new T().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Lc(s,t,e,n,i){const r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function uf(s,t){const e=1-s;return e*e*t}function df(s,t){return 2*(1-s)*s*t}function ff(s,t){return s*s*t}function Js(s,t,e,n){return uf(s,t)+df(s,e)+ff(s,n)}function pf(s,t){const e=1-s;return e*e*e*t}function mf(s,t){const e=1-s;return 3*e*e*s*t}function gf(s,t){return 3*(1-s)*s*s*t}function xf(s,t){return s*s*s*t}function Qs(s,t,e,n,i){return pf(s,t)+mf(s,e)+gf(s,n)+xf(s,i)}class vf extends ti{constructor(t=new yt,e=new yt,n=new yt,i=new yt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new yt){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qs(t,i.x,r.x,a.x,o.x),Qs(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class yf extends ti{constructor(t=new T,e=new T,n=new T,i=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new T){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qs(t,i.x,r.x,a.x,o.x),Qs(t,i.y,r.y,a.y,o.y),Qs(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class _f extends ti{constructor(t=new yt,e=new yt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new yt){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new yt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class bf extends ti{constructor(t=new T,e=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new T){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new T){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Mf extends ti{constructor(t=new yt,e=new yt,n=new yt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new yt){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(Js(t,i.x,r.x,a.x),Js(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class jh extends ti{constructor(t=new T,e=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new T){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(Js(t,i.x,r.x,a.x),Js(t,i.y,r.y,a.y),Js(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class wf extends ti{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new yt){const n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Lc(o,l.x,c.x,h.x,u.x),Lc(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new yt().fromArray(i))}return this}}var Sf=Object.freeze({__proto__:null,ArcCurve:hf,CatmullRomCurve3:Fl,CubicBezierCurve:vf,CubicBezierCurve3:yf,EllipseCurve:Zh,LineCurve:_f,LineCurve3:bf,QuadraticBezierCurve:Mf,QuadraticBezierCurve3:jh,SplineCurve:wf});class ga extends hr{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new ga(t.radius,t.detail)}}class Sa extends hr{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Sa(t.radius,t.detail)}}class zi extends ue{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,d=e/l,p=[],g=[],x=[],m=[];for(let f=0;f<h;f++){const _=f*d-a;for(let y=0;y<c;y++){const v=y*u-r;g.push(v,-_,0),x.push(0,0,1),m.push(y/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let _=0;_<o;_++){const y=_+c*f,v=_+c*(f+1),E=_+1+c*(f+1),C=_+1+c*f;p.push(y,v,C),p.push(v,E,C)}this.setIndex(p),this.setAttribute("position",new jt(g,3)),this.setAttribute("normal",new jt(x,3)),this.setAttribute("uv",new jt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new zi(t.width,t.height,t.widthSegments,t.heightSegments)}}class xa extends ue{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=t;const d=(e-t)/i,p=new T,g=new yt;for(let x=0;x<=i;x++){for(let m=0;m<=n;m++){const f=r+m/n*a;p.x=u*Math.cos(f),p.y=u*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<i;x++){const m=x*(n+1);for(let f=0;f<n;f++){const _=f+m,y=_,v=_+n+1,E=_+n+2,C=_+1;o.push(y,v,C),o.push(v,E,C)}}this.setIndex(o),this.setAttribute("position",new jt(l,3)),this.setAttribute("normal",new jt(c,3)),this.setAttribute("uv",new jt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xa(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class re extends ue{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new T,d=new T,p=[],g=[],x=[],m=[];for(let f=0;f<=n;f++){const _=[],y=f/n;let v=0;f===0&&a===0?v=.5/e:f===n&&l===Math.PI&&(v=-.5/e);for(let E=0;E<=e;E++){const C=E/e;u.x=-t*Math.cos(i+C*r)*Math.sin(a+y*o),u.y=t*Math.cos(a+y*o),u.z=t*Math.sin(i+C*r)*Math.sin(a+y*o),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(C+v,1-y),_.push(c++)}h.push(_)}for(let f=0;f<n;f++)for(let _=0;_<e;_++){const y=h[f][_+1],v=h[f][_],E=h[f+1][_],C=h[f+1][_+1];(f!==0||a>0)&&p.push(y,v,C),(f!==n-1||l<Math.PI)&&p.push(v,E,C)}this.setIndex(p),this.setAttribute("position",new jt(g,3)),this.setAttribute("normal",new jt(x,3)),this.setAttribute("uv",new jt(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new re(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class ur extends ue{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new T,u=new T,d=new T;for(let p=0;p<=n;p++)for(let g=0;g<=i;g++){const x=g/i*r,m=p/n*Math.PI*2;u.x=(t+e*Math.cos(m))*Math.cos(x),u.y=(t+e*Math.cos(m))*Math.sin(x),u.z=e*Math.sin(m),o.push(u.x,u.y,u.z),h.x=t*Math.cos(x),h.y=t*Math.sin(x),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/i),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=i;g++){const x=(i+1)*p+g-1,m=(i+1)*(p-1)+g-1,f=(i+1)*(p-1)+g,_=(i+1)*p+g;a.push(x,m,_),a.push(m,f,_)}this.setIndex(a),this.setAttribute("position",new jt(o,3)),this.setAttribute("normal",new jt(l,3)),this.setAttribute("uv",new jt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ur(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class zl extends ue{constructor(t=new jh(new T(-1,-1,0),new T(-1,1,0),new T(1,1,0)),e=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:i,closed:r};const a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new T,l=new T,c=new yt;let h=new T;const u=[],d=[],p=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new jt(u,3)),this.setAttribute("normal",new jt(d,3)),this.setAttribute("uv",new jt(p,2));function x(){for(let y=0;y<e;y++)m(y);m(r===!1?e:0),_(),f()}function m(y){h=t.getPointAt(y/e,h);const v=a.normals[y],E=a.binormals[y];for(let C=0;C<=i;C++){const I=C/i*Math.PI*2,D=Math.sin(I),M=-Math.cos(I);l.x=M*v.x+D*E.x,l.y=M*v.y+D*E.y,l.z=M*v.z+D*E.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function f(){for(let y=1;y<=e;y++)for(let v=1;v<=i;v++){const E=(i+1)*(y-1)+(v-1),C=(i+1)*y+(v-1),I=(i+1)*y+v,D=(i+1)*(y-1)+v;g.push(E,C,D),g.push(C,I,D)}}function _(){for(let y=0;y<=e;y++)for(let v=0;v<=i;v++)c.x=y/e,c.y=v/i,p.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new zl(new Sf[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}class Ot extends pi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Mt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Dh,this.normalScale=new yt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Tf extends pi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=sd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Ef extends pi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Ta extends Ae{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Mt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Bl extends Ta{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Mt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const ro=new ie,Uc=new T,kc=new T;class Kh{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new yt(512,512),this.mapType=Fn,this.map=null,this.mapPass=null,this.matrix=new ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Il,this._frameExtents=new yt(1,1),this._viewportCount=1,this._viewports=[new le(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Uc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Uc),kc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(kc),e.updateMatrixWorld(),ro.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ro,e.coordinateSystem,e.reversedDepth),e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ro)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Nc=new ie,Vs=new T,ao=new T;class Af extends Kh{constructor(){super(new Je(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new yt(4,2),this._viewportCount=6,this._viewports=[new le(2,1,1,1),new le(0,1,1,1),new le(3,1,1,1),new le(1,1,1,1),new le(3,0,1,1),new le(1,0,1,1)],this._cubeDirections=[new T(1,0,0),new T(-1,0,0),new T(0,0,1),new T(0,0,-1),new T(0,1,0),new T(0,-1,0)],this._cubeUps=[new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,0,1),new T(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,i=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Vs.setFromMatrixPosition(t.matrixWorld),n.position.copy(Vs),ao.copy(n.position),ao.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(ao),n.updateMatrixWorld(),i.makeTranslation(-Vs.x,-Vs.y,-Vs.z),Nc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Nc,n.coordinateSystem,n.reversedDepth)}}class ze extends Ta{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Af}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class Jh extends Hh{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Cf extends Kh{constructor(){super(new Jh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class va extends Ta{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ae.DEFAULT_UP),this.updateMatrix(),this.target=new Ae,this.shadow=new Cf}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Qh extends Ta{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class Rf extends Je{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}function Fc(s,t,e,n){const i=Pf(n);switch(e){case Rh:return s*t;case wl:return s*t/i.components*i.byteLength;case Sl:return s*t/i.components*i.byteLength;case Ih:return s*t*2/i.components*i.byteLength;case Tl:return s*t*2/i.components*i.byteLength;case Ph:return s*t*3/i.components*i.byteLength;case xn:return s*t*4/i.components*i.byteLength;case El:return s*t*4/i.components*i.byteLength;case ea:case na:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case ia:case sa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Fo:case Bo:return Math.max(s,16)*Math.max(t,8)/4;case No:case zo:return Math.max(s,8)*Math.max(t,8)/2;case Oo:case Ho:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Go:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Vo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Wo:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case qo:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Yo:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case $o:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Zo:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case jo:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Ko:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Jo:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Qo:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case tl:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case el:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case nl:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case il:case sl:case rl:return Math.ceil(s/4)*Math.ceil(t/4)*16;case al:case ol:return Math.ceil(s/4)*Math.ceil(t/4)*8;case ll:case cl:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Pf(s){switch(s){case Fn:case Th:return{byteLength:1,components:1};case er:case Eh:case cr:return{byteLength:2,components:1};case bl:case Ml:return{byteLength:2,components:4};case ki:case _l:case Ln:return{byteLength:4,components:1};case Ah:case Ch:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:vl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=vl);function tu(){let s=null,t=!1,e=null,n=null;function i(r,a){e(r,a),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function If(s){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=s.SHORT;else if(c instanceof Uint32Array)p=s.UNSIGNED_INT;else if(c instanceof Int32Array)p=s.INT;else if(c instanceof Int8Array)p=s.BYTE;else if(c instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<u.length;p++){const g=u[d],x=u[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let p=0,g=u.length;p<g;p++){const x=u[p];s.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var Df=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Lf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Uf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ff=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Bf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Of=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Hf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Gf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Vf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Xf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Yf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,$f=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Zf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Kf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Qf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,tp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ep=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,np=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ip=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,sp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,rp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ap=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,op=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lp="gl_FragColor = linearToOutputTexel( gl_FragColor );",cp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,up=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,dp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,fp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,pp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,mp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,gp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,xp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,yp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,_p=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Sp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Tp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ep=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ap=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Cp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ip=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Dp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Lp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Up=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Np=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,zp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Bp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Op=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Hp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Vp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Wp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Xp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Yp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,$p=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,jp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Kp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,em=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,nm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,im=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,am=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,om=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,um=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,dm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,pm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,mm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,gm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,xm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,vm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ym=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,_m=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,bm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Mm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,wm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Em=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Am=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Rm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Pm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Im=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Dm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Um=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Nm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,zm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Bm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Om=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Gm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Wm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,qm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Xm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ym=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$m=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,jm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Km=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Jm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Qm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,t0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,n0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,i0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,s0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,a0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,o0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,l0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,c0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,h0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:Df,alphahash_pars_fragment:Lf,alphamap_fragment:Uf,alphamap_pars_fragment:kf,alphatest_fragment:Nf,alphatest_pars_fragment:Ff,aomap_fragment:zf,aomap_pars_fragment:Bf,batching_pars_vertex:Of,batching_vertex:Hf,begin_vertex:Gf,beginnormal_vertex:Vf,bsdfs:Wf,iridescence_fragment:qf,bumpmap_pars_fragment:Xf,clipping_planes_fragment:Yf,clipping_planes_pars_fragment:$f,clipping_planes_pars_vertex:Zf,clipping_planes_vertex:jf,color_fragment:Kf,color_pars_fragment:Jf,color_pars_vertex:Qf,color_vertex:tp,common:ep,cube_uv_reflection_fragment:np,defaultnormal_vertex:ip,displacementmap_pars_vertex:sp,displacementmap_vertex:rp,emissivemap_fragment:ap,emissivemap_pars_fragment:op,colorspace_fragment:lp,colorspace_pars_fragment:cp,envmap_fragment:hp,envmap_common_pars_fragment:up,envmap_pars_fragment:dp,envmap_pars_vertex:fp,envmap_physical_pars_fragment:Sp,envmap_vertex:pp,fog_vertex:mp,fog_pars_vertex:gp,fog_fragment:xp,fog_pars_fragment:vp,gradientmap_pars_fragment:yp,lightmap_pars_fragment:_p,lights_lambert_fragment:bp,lights_lambert_pars_fragment:Mp,lights_pars_begin:wp,lights_toon_fragment:Tp,lights_toon_pars_fragment:Ep,lights_phong_fragment:Ap,lights_phong_pars_fragment:Cp,lights_physical_fragment:Rp,lights_physical_pars_fragment:Pp,lights_fragment_begin:Ip,lights_fragment_maps:Dp,lights_fragment_end:Lp,logdepthbuf_fragment:Up,logdepthbuf_pars_fragment:kp,logdepthbuf_pars_vertex:Np,logdepthbuf_vertex:Fp,map_fragment:zp,map_pars_fragment:Bp,map_particle_fragment:Op,map_particle_pars_fragment:Hp,metalnessmap_fragment:Gp,metalnessmap_pars_fragment:Vp,morphinstance_vertex:Wp,morphcolor_vertex:qp,morphnormal_vertex:Xp,morphtarget_pars_vertex:Yp,morphtarget_vertex:$p,normal_fragment_begin:Zp,normal_fragment_maps:jp,normal_pars_fragment:Kp,normal_pars_vertex:Jp,normal_vertex:Qp,normalmap_pars_fragment:tm,clearcoat_normal_fragment_begin:em,clearcoat_normal_fragment_maps:nm,clearcoat_pars_fragment:im,iridescence_pars_fragment:sm,opaque_fragment:rm,packing:am,premultiplied_alpha_fragment:om,project_vertex:lm,dithering_fragment:cm,dithering_pars_fragment:hm,roughnessmap_fragment:um,roughnessmap_pars_fragment:dm,shadowmap_pars_fragment:fm,shadowmap_pars_vertex:pm,shadowmap_vertex:mm,shadowmask_pars_fragment:gm,skinbase_vertex:xm,skinning_pars_vertex:vm,skinning_vertex:ym,skinnormal_vertex:_m,specularmap_fragment:bm,specularmap_pars_fragment:Mm,tonemapping_fragment:wm,tonemapping_pars_fragment:Sm,transmission_fragment:Tm,transmission_pars_fragment:Em,uv_pars_fragment:Am,uv_pars_vertex:Cm,uv_vertex:Rm,worldpos_vertex:Pm,background_vert:Im,background_frag:Dm,backgroundCube_vert:Lm,backgroundCube_frag:Um,cube_vert:km,cube_frag:Nm,depth_vert:Fm,depth_frag:zm,distanceRGBA_vert:Bm,distanceRGBA_frag:Om,equirect_vert:Hm,equirect_frag:Gm,linedashed_vert:Vm,linedashed_frag:Wm,meshbasic_vert:qm,meshbasic_frag:Xm,meshlambert_vert:Ym,meshlambert_frag:$m,meshmatcap_vert:Zm,meshmatcap_frag:jm,meshnormal_vert:Km,meshnormal_frag:Jm,meshphong_vert:Qm,meshphong_frag:t0,meshphysical_vert:e0,meshphysical_frag:n0,meshtoon_vert:i0,meshtoon_frag:s0,points_vert:r0,points_frag:a0,shadow_vert:o0,shadow_frag:l0,sprite_vert:c0,sprite_frag:h0},lt={common:{diffuse:{value:new Mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new yt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new Mt(16777215)},opacity:{value:1},center:{value:new yt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},In={basic:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Mt(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Mt(0)},specular:{value:new Mt(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Ye([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new Mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Ye([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new Mt(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Ye([lt.points,lt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Ye([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Ye([lt.common,lt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Ye([lt.sprite,lt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distanceRGBA:{uniforms:Ye([lt.common,lt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distanceRGBA_vert,fragmentShader:qt.distanceRGBA_frag},shadow:{uniforms:Ye([lt.lights,lt.fog,{color:{value:new Mt(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};In.physical={uniforms:Ye([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new yt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new Mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new yt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new Mt(0)},specularColor:{value:new Mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new yt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};const Gr={r:0,b:0,g:0},bi=new En,u0=new ie;function d0(s,t,e,n,i,r,a){const o=new Mt(0);let l=r===!0?0:1,c,h,u=null,d=0,p=null;function g(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?e:t).get(v)),v}function x(y){let v=!1;const E=g(y);E===null?f(o,l):E&&E.isColor&&(f(E,1),v=!0);const C=s.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(y,v){const E=g(v);E&&(E.isCubeTexture||E.mapping===Ma)?(h===void 0&&(h=new pt(new Ve(1,1,1),new Kn({name:"BackgroundCubeMaterial",uniforms:Ts(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:$e,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,I,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),bi.copy(v.backgroundRotation),bi.x*=-1,bi.y*=-1,bi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(bi.y*=-1,bi.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(u0.makeRotationFromEuler(bi)),h.material.toneMapped=te.getTransfer(E.colorSpace)!==oe,(u!==E||d!==E.version||p!==s.toneMapping)&&(h.material.needsUpdate=!0,u=E,d=E.version,p=s.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new pt(new zi(2,2),new Kn({name:"BackgroundMaterial",uniforms:Ts(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:fi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=te.getTransfer(E.colorSpace)!==oe,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||d!==E.version||p!==s.toneMapping)&&(c.material.needsUpdate=!0,u=E,d=E.version,p=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function f(y,v){y.getRGB(Gr,Oh(s)),n.buffers.color.setClear(Gr.r,Gr.g,Gr.b,v,a)}function _(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,v=1){o.set(y),l=v,f(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,f(o,l)},render:x,addToRenderList:m,dispose:_}}function f0(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,a=!1;function o(w,L,N,B,$){let W=!1;const Y=u(B,N,L);r!==Y&&(r=Y,c(r.object)),W=p(w,B,N,$),W&&g(w,B,N,$),$!==null&&t.update($,s.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,v(w,L,N,B),$!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get($).buffer))}function l(){return s.createVertexArray()}function c(w){return s.bindVertexArray(w)}function h(w){return s.deleteVertexArray(w)}function u(w,L,N){const B=N.wireframe===!0;let $=n[w.id];$===void 0&&($={},n[w.id]=$);let W=$[L.id];W===void 0&&(W={},$[L.id]=W);let Y=W[B];return Y===void 0&&(Y=d(l()),W[B]=Y),Y}function d(w){const L=[],N=[],B=[];for(let $=0;$<e;$++)L[$]=0,N[$]=0,B[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:N,attributeDivisors:B,object:w,attributes:{},index:null}}function p(w,L,N,B){const $=r.attributes,W=L.attributes;let Y=0;const K=N.getAttributes();for(const V in K)if(K[V].location>=0){const ct=$[V];let mt=W[V];if(mt===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(mt=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(mt=w.instanceColor)),ct===void 0||ct.attribute!==mt||mt&&ct.data!==mt.data)return!0;Y++}return r.attributesNum!==Y||r.index!==B}function g(w,L,N,B){const $={},W=L.attributes;let Y=0;const K=N.getAttributes();for(const V in K)if(K[V].location>=0){let ct=W[V];ct===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(ct=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(ct=w.instanceColor));const mt={};mt.attribute=ct,ct&&ct.data&&(mt.data=ct.data),$[V]=mt,Y++}r.attributes=$,r.attributesNum=Y,r.index=B}function x(){const w=r.newAttributes;for(let L=0,N=w.length;L<N;L++)w[L]=0}function m(w){f(w,0)}function f(w,L){const N=r.newAttributes,B=r.enabledAttributes,$=r.attributeDivisors;N[w]=1,B[w]===0&&(s.enableVertexAttribArray(w),B[w]=1),$[w]!==L&&(s.vertexAttribDivisor(w,L),$[w]=L)}function _(){const w=r.newAttributes,L=r.enabledAttributes;for(let N=0,B=L.length;N<B;N++)L[N]!==w[N]&&(s.disableVertexAttribArray(N),L[N]=0)}function y(w,L,N,B,$,W,Y){Y===!0?s.vertexAttribIPointer(w,L,N,$,W):s.vertexAttribPointer(w,L,N,B,$,W)}function v(w,L,N,B){x();const $=B.attributes,W=N.getAttributes(),Y=L.defaultAttributeValues;for(const K in W){const V=W[K];if(V.location>=0){let at=$[K];if(at===void 0&&(K==="instanceMatrix"&&w.instanceMatrix&&(at=w.instanceMatrix),K==="instanceColor"&&w.instanceColor&&(at=w.instanceColor)),at!==void 0){const ct=at.normalized,mt=at.itemSize,Bt=t.get(at);if(Bt===void 0)continue;const Jt=Bt.buffer,ee=Bt.type,Yt=Bt.bytesPerElement,Z=ee===s.INT||ee===s.UNSIGNED_INT||at.gpuType===_l;if(at.isInterleavedBufferAttribute){const J=at.data,vt=J.stride,Nt=at.offset;if(J.isInstancedInterleavedBuffer){for(let G=0;G<V.locationSize;G++)f(V.location+G,J.meshPerAttribute);w.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let G=0;G<V.locationSize;G++)m(V.location+G);s.bindBuffer(s.ARRAY_BUFFER,Jt);for(let G=0;G<V.locationSize;G++)y(V.location+G,mt/V.locationSize,ee,ct,vt*Yt,(Nt+mt/V.locationSize*G)*Yt,Z)}else{if(at.isInstancedBufferAttribute){for(let J=0;J<V.locationSize;J++)f(V.location+J,at.meshPerAttribute);w.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=at.meshPerAttribute*at.count)}else for(let J=0;J<V.locationSize;J++)m(V.location+J);s.bindBuffer(s.ARRAY_BUFFER,Jt);for(let J=0;J<V.locationSize;J++)y(V.location+J,mt/V.locationSize,ee,ct,mt*Yt,mt/V.locationSize*J*Yt,Z)}}else if(Y!==void 0){const ct=Y[K];if(ct!==void 0)switch(ct.length){case 2:s.vertexAttrib2fv(V.location,ct);break;case 3:s.vertexAttrib3fv(V.location,ct);break;case 4:s.vertexAttrib4fv(V.location,ct);break;default:s.vertexAttrib1fv(V.location,ct)}}}}_()}function E(){D();for(const w in n){const L=n[w];for(const N in L){const B=L[N];for(const $ in B)h(B[$].object),delete B[$];delete L[N]}delete n[w]}}function C(w){if(n[w.id]===void 0)return;const L=n[w.id];for(const N in L){const B=L[N];for(const $ in B)h(B[$].object),delete B[$];delete L[N]}delete n[w.id]}function I(w){for(const L in n){const N=n[L];if(N[w.id]===void 0)continue;const B=N[w.id];for(const $ in B)h(B[$].object),delete B[$];delete N[w.id]}}function D(){M(),a=!0,r!==i&&(r=i,c(r.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:D,resetDefaultState:M,dispose:E,releaseStatesOfGeometry:C,releaseStatesOfProgram:I,initAttributes:x,enableAttribute:m,disableUnusedAttributes:_}}function p0(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];e.update(p,n,1)}function l(c,h,u,d){if(u===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],h[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*d[x];e.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function m0(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const I=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(I){return!(I!==xn&&n.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){const D=I===cr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(I!==Fn&&n.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Ln&&!D)}function l(I){if(I==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),f=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),y=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),E=g>0,C=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:_,maxVaryings:y,maxFragmentUniforms:v,vertexTextures:E,maxSamples:C}}function g0(s){const t=this;let e=null,n=0,i=!1,r=!1;const a=new Ei,o=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const p=u.length!==0||d||n!==0||i;return i=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,p){const g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,f=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const _=r?0:n,y=_*4;let v=f.clippingState||null;l.value=v,v=h(g,d,y,p);for(let E=0;E!==y;++E)v[E]=e[E];f.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,p,g){const x=u!==null?u.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const f=p+x*4,_=d.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<f)&&(m=new Float32Array(f));for(let y=0,v=p;y!==x;++y,v+=4)a.copy(u[y]).applyMatrix4(_,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}function x0(s){let t=new WeakMap;function e(a,o){return o===Lo?a.mapping=Ms:o===Uo&&(a.mapping=ws),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Lo||o===Uo)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new tf(l.height);return c.fromEquirectangularTexture(s,a),t.set(a,c),a.addEventListener("dispose",i),e(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}const xs=4,zc=[.125,.215,.35,.446,.526,.582],Ri=20,oo=new Jh,Bc=new Mt;let lo=null,co=0,ho=0,uo=!1;const Ai=(1+Math.sqrt(5))/2,hs=1/Ai,Oc=[new T(-Ai,hs,0),new T(Ai,hs,0),new T(-hs,0,Ai),new T(hs,0,Ai),new T(0,Ai,-hs),new T(0,Ai,hs),new T(-1,1,-1),new T(1,1,-1),new T(-1,1,1),new T(1,1,1)],v0=new T;class Hc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100,r={}){const{size:a=256,position:o=v0}=r;lo=this._renderer.getRenderTarget(),co=this._renderer.getActiveCubeFace(),ho=this._renderer.getActiveMipmapLevel(),uo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(lo,co,ho),this._renderer.xr.enabled=uo,t.scissorTest=!1,Vr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ms||t.mapping===ws?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),lo=this._renderer.getRenderTarget(),co=this._renderer.getActiveCubeFace(),ho=this._renderer.getActiveMipmapLevel(),uo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Dn,minFilter:Dn,generateMipmaps:!1,type:cr,format:xn,colorSpace:Ss,depthBuffer:!1},i=Gc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=y0(r)),this._blurMaterial=_0(r,t,e)}return i}_compileMaterial(t){const e=new pt(this._lodPlanes[0],t);this._renderer.compile(e,oo)}_sceneToCubeUV(t,e,n,i,r){const l=new Je(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,p=u.toneMapping;u.getClearColor(Bc),u.toneMapping=ui,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null));const x=new Me({name:"PMREM.Background",side:$e,depthWrite:!1,depthTest:!1}),m=new pt(new Ve,x);let f=!1;const _=t.background;_?_.isColor&&(x.color.copy(_),t.background=null,f=!0):(x.color.copy(Bc),f=!0);for(let y=0;y<6;y++){const v=y%3;v===0?(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[y],r.y,r.z)):v===1?(l.up.set(0,0,c[y]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[y],r.z)):(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[y]));const E=this._cubeSize;Vr(i,v*E,y>2?E:0,E,E),u.setRenderTarget(i),f&&u.render(m,l),u.render(t,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=d,t.background=_}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Ms||t.mapping===ws;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vc());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new pt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Vr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,oo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Oc[(i-r-1)%Oc.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,i,"latitudinal",r),this._halfBlur(a,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new pt(this._lodPlanes[i],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Ri-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):Ri;m>Ri&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ri}`);const f=[];let _=0;for(let I=0;I<Ri;++I){const D=I/x,M=Math.exp(-D*D/2);f.push(M),I===0?_+=M:I<m&&(_+=2*M)}for(let I=0;I<f.length;I++)f[I]=f[I]/_;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:y}=this;d.dTheta.value=g,d.mipInt.value=y-n;const v=this._sizeLods[i],E=3*v*(i>y-xs?i-y+xs:0),C=4*(this._cubeSize-v);Vr(e,E,C,3*v,2*v),l.setRenderTarget(e),l.render(u,oo)}}function y0(s){const t=[],e=[],n=[];let i=s;const r=s-xs+1+zc.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>s-xs?l=zc[a-s+xs-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,x=3,m=2,f=1,_=new Float32Array(x*g*p),y=new Float32Array(m*g*p),v=new Float32Array(f*g*p);for(let C=0;C<p;C++){const I=C%3*2/3-1,D=C>2?0:-1,M=[I,D,0,I+2/3,D,0,I+2/3,D+1,0,I,D,0,I+2/3,D+1,0,I,D+1,0];_.set(M,x*g*C),y.set(d,m*g*C);const w=[C,C,C,C,C,C];v.set(w,f*g*C)}const E=new ue;E.setAttribute("position",new we(_,x)),E.setAttribute("uv",new we(y,m)),E.setAttribute("faceIndex",new we(v,f)),t.push(E),i>xs&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Gc(s,t,e){const n=new Ni(s,t,e);return n.texture.mapping=Ma,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Vr(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function _0(s,t,e){const n=new Float32Array(Ri),i=new T(0,1,0);return new Kn({name:"SphericalGaussianBlur",defines:{n:Ri,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Vc(){return new Kn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Wc(){return new Kn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Ol(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function b0(s){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Lo||l===Uo,h=l===Ms||l===ws;if(c||h){let u=t.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return e===null&&(e=new Hc(s)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&i(p)?(e===null&&(e=new Hc(s)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function M0(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&ar("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function w0(s,t,e,n){const i={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete i[d.id];const p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const p in d)t.update(d[p],s.ARRAY_BUFFER)}function c(u){const d=[],p=u.index,g=u.attributes.position;let x=0;if(p!==null){const _=p.array;x=p.version;for(let y=0,v=_.length;y<v;y+=3){const E=_[y+0],C=_[y+1],I=_[y+2];d.push(E,C,C,I,I,E)}}else if(g!==void 0){const _=g.array;x=g.version;for(let y=0,v=_.length/3-1;y<v;y+=3){const E=y+0,C=y+1,I=y+2;d.push(E,C,C,I,I,E)}}else return;const m=new(Uh(d)?Bh:zh)(d,1);m.version=x;const f=r.get(u);f&&t.remove(f),r.set(u,m)}function h(u){const d=r.get(u);if(d){const p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function S0(s,t,e){let n;function i(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,p){s.drawElements(n,p,r,d*a),e.update(p,n,1)}function c(d,p,g){g!==0&&(s.drawElementsInstanced(n,p,r,d*a,g),e.update(p,n,g))}function h(d,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];e.update(m,n,1)}function u(d,p,g,x){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)c(d[f]/a,p[f],x[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,x,0,g);let f=0;for(let _=0;_<g;_++)f+=p[_]*x[_];e.update(f,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function T0(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function E0(s,t,e){const n=new WeakMap,i=new le;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let w=function(){D.dispose(),n.delete(o),o.removeEventListener("dispose",w)};var p=w;d!==void 0&&d.texture.dispose();const g=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],y=o.morphAttributes.color||[];let v=0;g===!0&&(v=1),x===!0&&(v=2),m===!0&&(v=3);let E=o.attributes.position.count*v,C=1;E>t.maxTextureSize&&(C=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);const I=new Float32Array(E*C*4*u),D=new kh(I,E,C,u);D.type=Ln,D.needsUpdate=!0;const M=v*4;for(let L=0;L<u;L++){const N=f[L],B=_[L],$=y[L],W=E*C*4*L;for(let Y=0;Y<N.count;Y++){const K=Y*M;g===!0&&(i.fromBufferAttribute(N,Y),I[W+K+0]=i.x,I[W+K+1]=i.y,I[W+K+2]=i.z,I[W+K+3]=0),x===!0&&(i.fromBufferAttribute(B,Y),I[W+K+4]=i.x,I[W+K+5]=i.y,I[W+K+6]=i.z,I[W+K+7]=0),m===!0&&(i.fromBufferAttribute($,Y),I[W+K+8]=i.x,I[W+K+9]=i.y,I[W+K+10]=i.z,I[W+K+11]=$.itemSize===4?i.w:1)}}d={count:u,texture:D,size:new yt(E,C)},n.set(o,d),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const x=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",x),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function A0(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}const eu=new We,qc=new Yh(1,1),nu=new kh,iu=new Fd,su=new Gh,Xc=[],Yc=[],$c=new Float32Array(16),Zc=new Float32Array(9),jc=new Float32Array(4);function Ps(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Xc[i];if(r===void 0&&(r=new Float32Array(i),Xc[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function Ue(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function ke(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Ea(s,t){let e=Yc[t];e===void 0&&(e=new Int32Array(t),Yc[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function C0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function R0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;s.uniform2fv(this.addr,t),ke(e,t)}}function P0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ue(e,t))return;s.uniform3fv(this.addr,t),ke(e,t)}}function I0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;s.uniform4fv(this.addr,t),ke(e,t)}}function D0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;jc.set(n),s.uniformMatrix2fv(this.addr,!1,jc),ke(e,n)}}function L0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;Zc.set(n),s.uniformMatrix3fv(this.addr,!1,Zc),ke(e,n)}}function U0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;$c.set(n),s.uniformMatrix4fv(this.addr,!1,$c),ke(e,n)}}function k0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function N0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;s.uniform2iv(this.addr,t),ke(e,t)}}function F0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;s.uniform3iv(this.addr,t),ke(e,t)}}function z0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;s.uniform4iv(this.addr,t),ke(e,t)}}function B0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function O0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;s.uniform2uiv(this.addr,t),ke(e,t)}}function H0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;s.uniform3uiv(this.addr,t),ke(e,t)}}function G0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;s.uniform4uiv(this.addr,t),ke(e,t)}}function V0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(qc.compareFunction=Lh,r=qc):r=eu,e.setTexture2D(t||r,i)}function W0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||iu,i)}function q0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||su,i)}function X0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||nu,i)}function Y0(s){switch(s){case 5126:return C0;case 35664:return R0;case 35665:return P0;case 35666:return I0;case 35674:return D0;case 35675:return L0;case 35676:return U0;case 5124:case 35670:return k0;case 35667:case 35671:return N0;case 35668:case 35672:return F0;case 35669:case 35673:return z0;case 5125:return B0;case 36294:return O0;case 36295:return H0;case 36296:return G0;case 35678:case 36198:case 36298:case 36306:case 35682:return V0;case 35679:case 36299:case 36307:return W0;case 35680:case 36300:case 36308:case 36293:return q0;case 36289:case 36303:case 36311:case 36292:return X0}}function $0(s,t){s.uniform1fv(this.addr,t)}function Z0(s,t){const e=Ps(t,this.size,2);s.uniform2fv(this.addr,e)}function j0(s,t){const e=Ps(t,this.size,3);s.uniform3fv(this.addr,e)}function K0(s,t){const e=Ps(t,this.size,4);s.uniform4fv(this.addr,e)}function J0(s,t){const e=Ps(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Q0(s,t){const e=Ps(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function tg(s,t){const e=Ps(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function eg(s,t){s.uniform1iv(this.addr,t)}function ng(s,t){s.uniform2iv(this.addr,t)}function ig(s,t){s.uniform3iv(this.addr,t)}function sg(s,t){s.uniform4iv(this.addr,t)}function rg(s,t){s.uniform1uiv(this.addr,t)}function ag(s,t){s.uniform2uiv(this.addr,t)}function og(s,t){s.uniform3uiv(this.addr,t)}function lg(s,t){s.uniform4uiv(this.addr,t)}function cg(s,t,e){const n=this.cache,i=t.length,r=Ea(e,i);Ue(n,r)||(s.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==i;++a)e.setTexture2D(t[a]||eu,r[a])}function hg(s,t,e){const n=this.cache,i=t.length,r=Ea(e,i);Ue(n,r)||(s.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||iu,r[a])}function ug(s,t,e){const n=this.cache,i=t.length,r=Ea(e,i);Ue(n,r)||(s.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||su,r[a])}function dg(s,t,e){const n=this.cache,i=t.length,r=Ea(e,i);Ue(n,r)||(s.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||nu,r[a])}function fg(s){switch(s){case 5126:return $0;case 35664:return Z0;case 35665:return j0;case 35666:return K0;case 35674:return J0;case 35675:return Q0;case 35676:return tg;case 5124:case 35670:return eg;case 35667:case 35671:return ng;case 35668:case 35672:return ig;case 35669:case 35673:return sg;case 5125:return rg;case 36294:return ag;case 36295:return og;case 36296:return lg;case 35678:case 36198:case 36298:case 36306:case 35682:return cg;case 35679:case 36299:case 36307:return hg;case 35680:case 36300:case 36308:case 36293:return ug;case 36289:case 36303:case 36311:case 36292:return dg}}class pg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Y0(e.type)}}class mg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=fg(e.type)}}class gg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(t,e[o.id],n)}}}const fo=/(\w+)(\])?(\[|\.)?/g;function Kc(s,t){s.seq.push(t),s.map[t.id]=t}function xg(s,t,e){const n=s.name,i=n.length;for(fo.lastIndex=0;;){const r=fo.exec(n),a=fo.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Kc(e,c===void 0?new pg(o,s,t):new mg(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new gg(o),Kc(e,u)),e=u}}}class ra{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),a=t.getUniformLocation(e,r.name);xg(r,a,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const a=t[i];a.id in e&&n.push(a)}return n}}function Jc(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const vg=37297;let yg=0;function _g(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Qc=new Wt;function bg(s){te._getMatrix(Qc,te.workingColorSpace,s);const t=`mat3( ${Qc.elements.map(e=>e.toFixed(4))} )`;switch(te.getTransfer(s)){case ha:return[t,"LinearTransferOETF"];case oe:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function th(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+_g(s.getShaderSource(t),o)}else return r}function Mg(s,t){const e=bg(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function wg(s,t){let e;switch(t){case Ku:e="Linear";break;case Ju:e="Reinhard";break;case Qu:e="Cineon";break;case yl:e="ACESFilmic";break;case ed:e="AgX";break;case nd:e="Neutral";break;case td:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Wr=new T;function Sg(){te.getLuminanceCoefficients(Wr);const s=Wr.x.toFixed(4),t=Wr.y.toFixed(4),e=Wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tg(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($s).join(`
`)}function Eg(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Ag(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function $s(s){return s!==""}function eh(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function nh(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Cg=/^[ \t]*#include +<([\w\d./]+)>/gm;function dl(s){return s.replace(Cg,Pg)}const Rg=new Map;function Pg(s,t){let e=qt[t];if(e===void 0){const n=Rg.get(t);if(n!==void 0)e=qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return dl(e)}const Ig=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ih(s){return s.replace(Ig,Dg)}function Dg(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function sh(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Lg(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===bh?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Mh?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Xn&&(t="SHADOWMAP_TYPE_VSM"),t}function Ug(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ms:case ws:t="ENVMAP_TYPE_CUBE";break;case Ma:t="ENVMAP_TYPE_CUBE_UV";break}return t}function kg(s){let t="ENVMAP_MODE_REFLECTION";return s.envMap&&s.envMapMode===ws&&(t="ENVMAP_MODE_REFRACTION"),t}function Ng(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case wh:t="ENVMAP_BLENDING_MULTIPLY";break;case Zu:t="ENVMAP_BLENDING_MIX";break;case ju:t="ENVMAP_BLENDING_ADD";break}return t}function Fg(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function zg(s,t,e,n){const i=s.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=Lg(e),c=Ug(e),h=kg(e),u=Ng(e),d=Fg(e),p=Tg(e),g=Eg(r),x=i.createProgram();let m,f,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),f.length>0&&(f+=`
`)):(m=[sh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($s).join(`
`),f=[sh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ui?"#define TONE_MAPPING":"",e.toneMapping!==ui?qt.tonemapping_pars_fragment:"",e.toneMapping!==ui?wg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Mg("linearToOutputTexel",e.outputColorSpace),Sg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter($s).join(`
`)),a=dl(a),a=eh(a,e),a=nh(a,e),o=dl(o),o=eh(o,e),o=nh(o,e),a=ih(a),o=ih(o),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===nc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===nc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const y=_+m+a,v=_+f+o,E=Jc(i,i.VERTEX_SHADER,y),C=Jc(i,i.FRAGMENT_SHADER,v);i.attachShader(x,E),i.attachShader(x,C),e.index0AttributeName!==void 0?i.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(x,0,"position"),i.linkProgram(x);function I(L){if(s.debug.checkShaderErrors){const N=i.getProgramInfoLog(x)||"",B=i.getShaderInfoLog(E)||"",$=i.getShaderInfoLog(C)||"",W=N.trim(),Y=B.trim(),K=$.trim();let V=!0,at=!0;if(i.getProgramParameter(x,i.LINK_STATUS)===!1)if(V=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,x,E,C);else{const ct=th(i,E,"vertex"),mt=th(i,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(x,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+W+`
`+ct+`
`+mt)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):(Y===""||K==="")&&(at=!1);at&&(L.diagnostics={runnable:V,programLog:W,vertexShader:{log:Y,prefix:m},fragmentShader:{log:K,prefix:f}})}i.deleteShader(E),i.deleteShader(C),D=new ra(i,x),M=Ag(i,x)}let D;this.getUniforms=function(){return D===void 0&&I(this),D};let M;this.getAttributes=function(){return M===void 0&&I(this),M};let w=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=i.getProgramParameter(x,vg)),w},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=yg++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=C,this}let Bg=0;class Og{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Hg(t),e.set(t,n)),n}}class Hg{constructor(t){this.id=Bg++,this.code=t,this.usedTimes=0}}function Gg(s,t,e,n,i,r,a){const o=new Nh,l=new Og,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let p=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,w,L,N,B){const $=N.fog,W=B.geometry,Y=M.isMeshStandardMaterial?N.environment:null,K=(M.isMeshStandardMaterial?e:t).get(M.envMap||Y),V=K&&K.mapping===Ma?K.image.height:null,at=g[M.type];M.precision!==null&&(p=i.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));const ct=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,mt=ct!==void 0?ct.length:0;let Bt=0;W.morphAttributes.position!==void 0&&(Bt=1),W.morphAttributes.normal!==void 0&&(Bt=2),W.morphAttributes.color!==void 0&&(Bt=3);let Jt,ee,Yt,Z;if(at){const ne=In[at];Jt=ne.vertexShader,ee=ne.fragmentShader}else Jt=M.vertexShader,ee=M.fragmentShader,l.update(M),Yt=l.getVertexShaderID(M),Z=l.getFragmentShaderID(M);const J=s.getRenderTarget(),vt=s.state.buffers.depth.getReversed(),Nt=B.isInstancedMesh===!0,G=B.isBatchedMesh===!0,$t=!!M.map,ht=!!M.matcap,P=!!K,Pt=!!M.aoMap,bt=!!M.lightMap,Tt=!!M.bumpMap,gt=!!M.normalMap,de=!!M.displacementMap,wt=!!M.emissiveMap,Gt=!!M.metalnessMap,Se=!!M.roughnessMap,fe=M.anisotropy>0,R=M.clearcoat>0,b=M.dispersion>0,z=M.iridescence>0,X=M.sheen>0,Q=M.transmission>0,q=fe&&!!M.anisotropyMap,Rt=R&&!!M.clearcoatMap,rt=R&&!!M.clearcoatNormalMap,Et=R&&!!M.clearcoatRoughnessMap,At=z&&!!M.iridescenceMap,it=z&&!!M.iridescenceThicknessMap,ft=X&&!!M.sheenColorMap,Ft=X&&!!M.sheenRoughnessMap,It=!!M.specularMap,ut=!!M.specularColorMap,Vt=!!M.specularIntensityMap,U=Q&&!!M.transmissionMap,st=Q&&!!M.thicknessMap,ot=!!M.gradientMap,_t=!!M.alphaMap,et=M.alphaTest>0,j=!!M.alphaHash,Ct=!!M.extensions;let Ht=ui;M.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Ht=s.toneMapping);const pe={shaderID:at,shaderType:M.type,shaderName:M.name,vertexShader:Jt,fragmentShader:ee,defines:M.defines,customVertexShaderID:Yt,customFragmentShaderID:Z,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:G,batchingColor:G&&B._colorsTexture!==null,instancing:Nt,instancingColor:Nt&&B.instanceColor!==null,instancingMorph:Nt&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:J===null?s.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Ss,alphaToCoverage:!!M.alphaToCoverage,map:$t,matcap:ht,envMap:P,envMapMode:P&&K.mapping,envMapCubeUVHeight:V,aoMap:Pt,lightMap:bt,bumpMap:Tt,normalMap:gt,displacementMap:d&&de,emissiveMap:wt,normalMapObjectSpace:gt&&M.normalMapType===ad,normalMapTangentSpace:gt&&M.normalMapType===Dh,metalnessMap:Gt,roughnessMap:Se,anisotropy:fe,anisotropyMap:q,clearcoat:R,clearcoatMap:Rt,clearcoatNormalMap:rt,clearcoatRoughnessMap:Et,dispersion:b,iridescence:z,iridescenceMap:At,iridescenceThicknessMap:it,sheen:X,sheenColorMap:ft,sheenRoughnessMap:Ft,specularMap:It,specularColorMap:ut,specularIntensityMap:Vt,transmission:Q,transmissionMap:U,thicknessMap:st,gradientMap:ot,opaque:M.transparent===!1&&M.blending===vs&&M.alphaToCoverage===!1,alphaMap:_t,alphaTest:et,alphaHash:j,combine:M.combine,mapUv:$t&&x(M.map.channel),aoMapUv:Pt&&x(M.aoMap.channel),lightMapUv:bt&&x(M.lightMap.channel),bumpMapUv:Tt&&x(M.bumpMap.channel),normalMapUv:gt&&x(M.normalMap.channel),displacementMapUv:de&&x(M.displacementMap.channel),emissiveMapUv:wt&&x(M.emissiveMap.channel),metalnessMapUv:Gt&&x(M.metalnessMap.channel),roughnessMapUv:Se&&x(M.roughnessMap.channel),anisotropyMapUv:q&&x(M.anisotropyMap.channel),clearcoatMapUv:Rt&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:rt&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Et&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:At&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:it&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:ft&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Ft&&x(M.sheenRoughnessMap.channel),specularMapUv:It&&x(M.specularMap.channel),specularColorMapUv:ut&&x(M.specularColorMap.channel),specularIntensityMapUv:Vt&&x(M.specularIntensityMap.channel),transmissionMapUv:U&&x(M.transmissionMap.channel),thicknessMapUv:st&&x(M.thicknessMap.channel),alphaMapUv:_t&&x(M.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(gt||fe),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!W.attributes.uv&&($t||_t),fog:!!$,useFog:M.fog===!0,fogExp2:!!$&&$.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:vt,skinning:B.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:mt,morphTextureStride:Bt,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ht,decodeVideoTexture:$t&&M.map.isVideoTexture===!0&&te.getTransfer(M.map.colorSpace)===oe,decodeVideoTextureEmissive:wt&&M.emissiveMap.isVideoTexture===!0&&te.getTransfer(M.emissiveMap.colorSpace)===oe,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ge,flipSided:M.side===$e,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ct&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ct&&M.extensions.multiDraw===!0||G)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return pe.vertexUv1s=c.has(1),pe.vertexUv2s=c.has(2),pe.vertexUv3s=c.has(3),c.clear(),pe}function f(M){const w=[];if(M.shaderID?w.push(M.shaderID):(w.push(M.customVertexShaderID),w.push(M.customFragmentShaderID)),M.defines!==void 0)for(const L in M.defines)w.push(L),w.push(M.defines[L]);return M.isRawShaderMaterial===!1&&(_(w,M),y(w,M),w.push(s.outputColorSpace)),w.push(M.customProgramCacheKey),w.join()}function _(M,w){M.push(w.precision),M.push(w.outputColorSpace),M.push(w.envMapMode),M.push(w.envMapCubeUVHeight),M.push(w.mapUv),M.push(w.alphaMapUv),M.push(w.lightMapUv),M.push(w.aoMapUv),M.push(w.bumpMapUv),M.push(w.normalMapUv),M.push(w.displacementMapUv),M.push(w.emissiveMapUv),M.push(w.metalnessMapUv),M.push(w.roughnessMapUv),M.push(w.anisotropyMapUv),M.push(w.clearcoatMapUv),M.push(w.clearcoatNormalMapUv),M.push(w.clearcoatRoughnessMapUv),M.push(w.iridescenceMapUv),M.push(w.iridescenceThicknessMapUv),M.push(w.sheenColorMapUv),M.push(w.sheenRoughnessMapUv),M.push(w.specularMapUv),M.push(w.specularColorMapUv),M.push(w.specularIntensityMapUv),M.push(w.transmissionMapUv),M.push(w.thicknessMapUv),M.push(w.combine),M.push(w.fogExp2),M.push(w.sizeAttenuation),M.push(w.morphTargetsCount),M.push(w.morphAttributeCount),M.push(w.numDirLights),M.push(w.numPointLights),M.push(w.numSpotLights),M.push(w.numSpotLightMaps),M.push(w.numHemiLights),M.push(w.numRectAreaLights),M.push(w.numDirLightShadows),M.push(w.numPointLightShadows),M.push(w.numSpotLightShadows),M.push(w.numSpotLightShadowsWithMaps),M.push(w.numLightProbes),M.push(w.shadowMapType),M.push(w.toneMapping),M.push(w.numClippingPlanes),M.push(w.numClipIntersection),M.push(w.depthPacking)}function y(M,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),w.gradientMap&&o.enable(22),M.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),M.push(o.mask)}function v(M){const w=g[M.type];let L;if(w){const N=In[w];L=jd.clone(N.uniforms)}else L=M.uniforms;return L}function E(M,w){let L;for(let N=0,B=h.length;N<B;N++){const $=h[N];if($.cacheKey===w){L=$,++L.usedTimes;break}}return L===void 0&&(L=new zg(s,w,M,r),h.push(L)),L}function C(M){if(--M.usedTimes===0){const w=h.indexOf(M);h[w]=h[h.length-1],h.pop(),M.destroy()}}function I(M){l.remove(M)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:v,acquireProgram:E,releaseProgram:C,releaseShaderCache:I,programs:h,dispose:D}}function Vg(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function Wg(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function rh(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function ah(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(u,d,p,g,x,m){let f=s[t];return f===void 0?(f={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},s[t]=f):(f.id=u.id,f.object=u,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=x,f.group=m),t++,f}function o(u,d,p,g,x,m){const f=a(u,d,p,g,x,m);p.transmission>0?n.push(f):p.transparent===!0?i.push(f):e.push(f)}function l(u,d,p,g,x,m){const f=a(u,d,p,g,x,m);p.transmission>0?n.unshift(f):p.transparent===!0?i.unshift(f):e.unshift(f)}function c(u,d){e.length>1&&e.sort(u||Wg),n.length>1&&n.sort(d||rh),i.length>1&&i.sort(d||rh)}function h(){for(let u=t,d=s.length;u<d;u++){const p=s[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function qg(){let s=new WeakMap;function t(n,i){const r=s.get(n);let a;return r===void 0?(a=new ah,s.set(n,[a])):i>=r.length?(a=new ah,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function Xg(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new T,color:new Mt};break;case"SpotLight":e={position:new T,direction:new T,color:new Mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new Mt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new Mt,groundColor:new Mt};break;case"RectAreaLight":e={color:new Mt,position:new T,halfWidth:new T,halfHeight:new T};break}return s[t.id]=e,e}}}function Yg(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let $g=0;function Zg(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function jg(s){const t=new Xg,e=Yg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new T);const i=new T,r=new ie,a=new ie;function o(c){let h=0,u=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let p=0,g=0,x=0,m=0,f=0,_=0,y=0,v=0,E=0,C=0,I=0;c.sort(Zg);for(let M=0,w=c.length;M<w;M++){const L=c[M],N=L.color,B=L.intensity,$=L.distance,W=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=N.r*B,u+=N.g*B,d+=N.b*B;else if(L.isLightProbe){for(let Y=0;Y<9;Y++)n.probe[Y].addScaledVector(L.sh.coefficients[Y],B);I++}else if(L.isDirectionalLight){const Y=t.get(L);if(Y.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const K=L.shadow,V=e.get(L);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.directionalShadow[p]=V,n.directionalShadowMap[p]=W,n.directionalShadowMatrix[p]=L.shadow.matrix,_++}n.directional[p]=Y,p++}else if(L.isSpotLight){const Y=t.get(L);Y.position.setFromMatrixPosition(L.matrixWorld),Y.color.copy(N).multiplyScalar(B),Y.distance=$,Y.coneCos=Math.cos(L.angle),Y.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Y.decay=L.decay,n.spot[x]=Y;const K=L.shadow;if(L.map&&(n.spotLightMap[E]=L.map,E++,K.updateMatrices(L),L.castShadow&&C++),n.spotLightMatrix[x]=K.matrix,L.castShadow){const V=e.get(L);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.spotShadow[x]=V,n.spotShadowMap[x]=W,v++}x++}else if(L.isRectAreaLight){const Y=t.get(L);Y.color.copy(N).multiplyScalar(B),Y.halfWidth.set(L.width*.5,0,0),Y.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=Y,m++}else if(L.isPointLight){const Y=t.get(L);if(Y.color.copy(L.color).multiplyScalar(L.intensity),Y.distance=L.distance,Y.decay=L.decay,L.castShadow){const K=L.shadow,V=e.get(L);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,V.shadowCameraNear=K.camera.near,V.shadowCameraFar=K.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=L.shadow.matrix,y++}n.point[g]=Y,g++}else if(L.isHemisphereLight){const Y=t.get(L);Y.skyColor.copy(L.color).multiplyScalar(B),Y.groundColor.copy(L.groundColor).multiplyScalar(B),n.hemi[f]=Y,f++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const D=n.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==x||D.rectAreaLength!==m||D.hemiLength!==f||D.numDirectionalShadows!==_||D.numPointShadows!==y||D.numSpotShadows!==v||D.numSpotMaps!==E||D.numLightProbes!==I)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=v+E-C,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=I,D.directionalLength=p,D.pointLength=g,D.spotLength=x,D.rectAreaLength=m,D.hemiLength=f,D.numDirectionalShadows=_,D.numPointShadows=y,D.numSpotShadows=v,D.numSpotMaps=E,D.numLightProbes=I,n.version=$g++)}function l(c,h){let u=0,d=0,p=0,g=0,x=0;const m=h.matrixWorldInverse;for(let f=0,_=c.length;f<_;f++){const y=c[f];if(y.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),u++}else if(y.isSpotLight){const v=n.spot[p];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),p++}else if(y.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),a.identity(),r.copy(y.matrixWorld),r.premultiply(m),a.extractRotation(r),v.halfWidth.set(y.width*.5,0,0),v.halfHeight.set(0,y.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),g++}else if(y.isPointLight){const v=n.point[d];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),d++}else if(y.isHemisphereLight){const v=n.hemi[x];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:o,setupView:l,state:n}}function oh(s){const t=new jg(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Kg(s){let t=new WeakMap;function e(i,r=0){const a=t.get(i);let o;return a===void 0?(o=new oh(s),t.set(i,[o])):r>=a.length?(o=new oh(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}const Jg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Qg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function tx(s,t,e){let n=new Il;const i=new yt,r=new yt,a=new le,o=new Tf({depthPacking:rd}),l=new Ef,c={},h=e.maxTextureSize,u={[fi]:$e,[$e]:fi,[Ge]:Ge},d=new Kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new yt},radius:{value:4}},vertexShader:Jg,fragmentShader:Qg}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new ue;g.setAttribute("position",new we(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new pt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=bh;let f=this.type;this.render=function(C,I,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const M=s.getRenderTarget(),w=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),N=s.state;N.setBlending(hi),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const B=f!==Xn&&this.type===Xn,$=f===Xn&&this.type!==Xn;for(let W=0,Y=C.length;W<Y;W++){const K=C[W],V=K.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const at=V.getFrameExtents();if(i.multiply(at),r.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/at.x),i.x=r.x*at.x,V.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/at.y),i.y=r.y*at.y,V.mapSize.y=r.y)),V.map===null||B===!0||$===!0){const mt=this.type!==Xn?{minFilter:on,magFilter:on}:{};V.map!==null&&V.map.dispose(),V.map=new Ni(i.x,i.y,mt),V.map.texture.name=K.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();const ct=V.getViewportCount();for(let mt=0;mt<ct;mt++){const Bt=V.getViewport(mt);a.set(r.x*Bt.x,r.y*Bt.y,r.x*Bt.z,r.y*Bt.w),N.viewport(a),V.updateMatrices(K,mt),n=V.getFrustum(),v(I,D,V.camera,K,this.type)}V.isPointLightShadow!==!0&&this.type===Xn&&_(V,D),V.needsUpdate=!1}f=this.type,m.needsUpdate=!1,s.setRenderTarget(M,w,L)};function _(C,I){const D=t.update(x);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Ni(i.x,i.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,s.setRenderTarget(C.mapPass),s.clear(),s.renderBufferDirect(I,null,D,d,x,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,s.setRenderTarget(C.map),s.clear(),s.renderBufferDirect(I,null,D,p,x,null)}function y(C,I,D,M){let w=null;const L=D.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(L!==void 0)w=L;else if(w=D.isPointLight===!0?l:o,s.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){const N=w.uuid,B=I.uuid;let $=c[N];$===void 0&&($={},c[N]=$);let W=$[B];W===void 0&&(W=w.clone(),$[B]=W,I.addEventListener("dispose",E)),w=W}if(w.visible=I.visible,w.wireframe=I.wireframe,M===Xn?w.side=I.shadowSide!==null?I.shadowSide:I.side:w.side=I.shadowSide!==null?I.shadowSide:u[I.side],w.alphaMap=I.alphaMap,w.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,w.map=I.map,w.clipShadows=I.clipShadows,w.clippingPlanes=I.clippingPlanes,w.clipIntersection=I.clipIntersection,w.displacementMap=I.displacementMap,w.displacementScale=I.displacementScale,w.displacementBias=I.displacementBias,w.wireframeLinewidth=I.wireframeLinewidth,w.linewidth=I.linewidth,D.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const N=s.properties.get(w);N.light=D}return w}function v(C,I,D,M,w){if(C.visible===!1)return;if(C.layers.test(I.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&w===Xn)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,C.matrixWorld);const B=t.update(C),$=C.material;if(Array.isArray($)){const W=B.groups;for(let Y=0,K=W.length;Y<K;Y++){const V=W[Y],at=$[V.materialIndex];if(at&&at.visible){const ct=y(C,at,M,w);C.onBeforeShadow(s,C,I,D,B,ct,V),s.renderBufferDirect(D,null,B,ct,C,V),C.onAfterShadow(s,C,I,D,B,ct,V)}}}else if($.visible){const W=y(C,$,M,w);C.onBeforeShadow(s,C,I,D,B,W,null),s.renderBufferDirect(D,null,B,W,C,null),C.onAfterShadow(s,C,I,D,B,W,null)}}const N=C.children;for(let B=0,$=N.length;B<$;B++)v(N[B],I,D,M,w)}function E(C){C.target.removeEventListener("dispose",E);for(const D in c){const M=c[D],w=C.target.uuid;w in M&&(M[w].dispose(),delete M[w])}}}const ex={[Eo]:Ao,[Co]:Io,[Ro]:Do,[bs]:Po,[Ao]:Eo,[Io]:Co,[Do]:Ro,[Po]:bs};function nx(s,t){function e(){let U=!1;const st=new le;let ot=null;const _t=new le(0,0,0,0);return{setMask:function(et){ot!==et&&!U&&(s.colorMask(et,et,et,et),ot=et)},setLocked:function(et){U=et},setClear:function(et,j,Ct,Ht,pe){pe===!0&&(et*=Ht,j*=Ht,Ct*=Ht),st.set(et,j,Ct,Ht),_t.equals(st)===!1&&(s.clearColor(et,j,Ct,Ht),_t.copy(st))},reset:function(){U=!1,ot=null,_t.set(-1,0,0,0)}}}function n(){let U=!1,st=!1,ot=null,_t=null,et=null;return{setReversed:function(j){if(st!==j){const Ct=t.get("EXT_clip_control");j?Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.ZERO_TO_ONE_EXT):Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.NEGATIVE_ONE_TO_ONE_EXT),st=j;const Ht=et;et=null,this.setClear(Ht)}},getReversed:function(){return st},setTest:function(j){j?J(s.DEPTH_TEST):vt(s.DEPTH_TEST)},setMask:function(j){ot!==j&&!U&&(s.depthMask(j),ot=j)},setFunc:function(j){if(st&&(j=ex[j]),_t!==j){switch(j){case Eo:s.depthFunc(s.NEVER);break;case Ao:s.depthFunc(s.ALWAYS);break;case Co:s.depthFunc(s.LESS);break;case bs:s.depthFunc(s.LEQUAL);break;case Ro:s.depthFunc(s.EQUAL);break;case Po:s.depthFunc(s.GEQUAL);break;case Io:s.depthFunc(s.GREATER);break;case Do:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}_t=j}},setLocked:function(j){U=j},setClear:function(j){et!==j&&(st&&(j=1-j),s.clearDepth(j),et=j)},reset:function(){U=!1,ot=null,_t=null,et=null,st=!1}}}function i(){let U=!1,st=null,ot=null,_t=null,et=null,j=null,Ct=null,Ht=null,pe=null;return{setTest:function(ne){U||(ne?J(s.STENCIL_TEST):vt(s.STENCIL_TEST))},setMask:function(ne){st!==ne&&!U&&(s.stencilMask(ne),st=ne)},setFunc:function(ne,zn,An){(ot!==ne||_t!==zn||et!==An)&&(s.stencilFunc(ne,zn,An),ot=ne,_t=zn,et=An)},setOp:function(ne,zn,An){(j!==ne||Ct!==zn||Ht!==An)&&(s.stencilOp(ne,zn,An),j=ne,Ct=zn,Ht=An)},setLocked:function(ne){U=ne},setClear:function(ne){pe!==ne&&(s.clearStencil(ne),pe=ne)},reset:function(){U=!1,st=null,ot=null,_t=null,et=null,j=null,Ct=null,Ht=null,pe=null}}}const r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,_=null,y=null,v=null,E=null,C=null,I=new Mt(0,0,0),D=0,M=!1,w=null,L=null,N=null,B=null,$=null;const W=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,K=0;const V=s.getParameter(s.VERSION);V.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(V)[1]),Y=K>=1):V.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),Y=K>=2);let at=null,ct={};const mt=s.getParameter(s.SCISSOR_BOX),Bt=s.getParameter(s.VIEWPORT),Jt=new le().fromArray(mt),ee=new le().fromArray(Bt);function Yt(U,st,ot,_t){const et=new Uint8Array(4),j=s.createTexture();s.bindTexture(U,j),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ct=0;Ct<ot;Ct++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(st,0,s.RGBA,1,1,_t,0,s.RGBA,s.UNSIGNED_BYTE,et):s.texImage2D(st+Ct,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,et);return j}const Z={};Z[s.TEXTURE_2D]=Yt(s.TEXTURE_2D,s.TEXTURE_2D,1),Z[s.TEXTURE_CUBE_MAP]=Yt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[s.TEXTURE_2D_ARRAY]=Yt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Z[s.TEXTURE_3D]=Yt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),J(s.DEPTH_TEST),a.setFunc(bs),Tt(!1),gt(Jl),J(s.CULL_FACE),Pt(hi);function J(U){h[U]!==!0&&(s.enable(U),h[U]=!0)}function vt(U){h[U]!==!1&&(s.disable(U),h[U]=!1)}function Nt(U,st){return u[U]!==st?(s.bindFramebuffer(U,st),u[U]=st,U===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=st),U===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=st),!0):!1}function G(U,st){let ot=p,_t=!1;if(U){ot=d.get(st),ot===void 0&&(ot=[],d.set(st,ot));const et=U.textures;if(ot.length!==et.length||ot[0]!==s.COLOR_ATTACHMENT0){for(let j=0,Ct=et.length;j<Ct;j++)ot[j]=s.COLOR_ATTACHMENT0+j;ot.length=et.length,_t=!0}}else ot[0]!==s.BACK&&(ot[0]=s.BACK,_t=!0);_t&&s.drawBuffers(ot)}function $t(U){return g!==U?(s.useProgram(U),g=U,!0):!1}const ht={[Ci]:s.FUNC_ADD,[Du]:s.FUNC_SUBTRACT,[Lu]:s.FUNC_REVERSE_SUBTRACT};ht[Uu]=s.MIN,ht[ku]=s.MAX;const P={[Nu]:s.ZERO,[Fu]:s.ONE,[zu]:s.SRC_COLOR,[So]:s.SRC_ALPHA,[Wu]:s.SRC_ALPHA_SATURATE,[Gu]:s.DST_COLOR,[Ou]:s.DST_ALPHA,[Bu]:s.ONE_MINUS_SRC_COLOR,[To]:s.ONE_MINUS_SRC_ALPHA,[Vu]:s.ONE_MINUS_DST_COLOR,[Hu]:s.ONE_MINUS_DST_ALPHA,[qu]:s.CONSTANT_COLOR,[Xu]:s.ONE_MINUS_CONSTANT_COLOR,[Yu]:s.CONSTANT_ALPHA,[$u]:s.ONE_MINUS_CONSTANT_ALPHA};function Pt(U,st,ot,_t,et,j,Ct,Ht,pe,ne){if(U===hi){x===!0&&(vt(s.BLEND),x=!1);return}if(x===!1&&(J(s.BLEND),x=!0),U!==Iu){if(U!==m||ne!==M){if((f!==Ci||v!==Ci)&&(s.blendEquation(s.FUNC_ADD),f=Ci,v=Ci),ne)switch(U){case vs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case pn:s.blendFunc(s.ONE,s.ONE);break;case Ql:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case tc:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case vs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case pn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Ql:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case tc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}_=null,y=null,E=null,C=null,I.set(0,0,0),D=0,m=U,M=ne}return}et=et||st,j=j||ot,Ct=Ct||_t,(st!==f||et!==v)&&(s.blendEquationSeparate(ht[st],ht[et]),f=st,v=et),(ot!==_||_t!==y||j!==E||Ct!==C)&&(s.blendFuncSeparate(P[ot],P[_t],P[j],P[Ct]),_=ot,y=_t,E=j,C=Ct),(Ht.equals(I)===!1||pe!==D)&&(s.blendColor(Ht.r,Ht.g,Ht.b,pe),I.copy(Ht),D=pe),m=U,M=!1}function bt(U,st){U.side===Ge?vt(s.CULL_FACE):J(s.CULL_FACE);let ot=U.side===$e;st&&(ot=!ot),Tt(ot),U.blending===vs&&U.transparent===!1?Pt(hi):Pt(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);const _t=U.stencilWrite;o.setTest(_t),_t&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),wt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?J(s.SAMPLE_ALPHA_TO_COVERAGE):vt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Tt(U){w!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),w=U)}function gt(U){U!==Ru?(J(s.CULL_FACE),U!==L&&(U===Jl?s.cullFace(s.BACK):U===Pu?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):vt(s.CULL_FACE),L=U}function de(U){U!==N&&(Y&&s.lineWidth(U),N=U)}function wt(U,st,ot){U?(J(s.POLYGON_OFFSET_FILL),(B!==st||$!==ot)&&(s.polygonOffset(st,ot),B=st,$=ot)):vt(s.POLYGON_OFFSET_FILL)}function Gt(U){U?J(s.SCISSOR_TEST):vt(s.SCISSOR_TEST)}function Se(U){U===void 0&&(U=s.TEXTURE0+W-1),at!==U&&(s.activeTexture(U),at=U)}function fe(U,st,ot){ot===void 0&&(at===null?ot=s.TEXTURE0+W-1:ot=at);let _t=ct[ot];_t===void 0&&(_t={type:void 0,texture:void 0},ct[ot]=_t),(_t.type!==U||_t.texture!==st)&&(at!==ot&&(s.activeTexture(ot),at=ot),s.bindTexture(U,st||Z[U]),_t.type=U,_t.texture=st)}function R(){const U=ct[at];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function b(){try{s.compressedTexImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function z(){try{s.compressedTexImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function X(){try{s.texSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Q(){try{s.texSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function q(){try{s.compressedTexSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Rt(){try{s.compressedTexSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function rt(){try{s.texStorage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Et(){try{s.texStorage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function At(){try{s.texImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function it(){try{s.texImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ft(U){Jt.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),Jt.copy(U))}function Ft(U){ee.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),ee.copy(U))}function It(U,st){let ot=c.get(st);ot===void 0&&(ot=new WeakMap,c.set(st,ot));let _t=ot.get(U);_t===void 0&&(_t=s.getUniformBlockIndex(st,U.name),ot.set(U,_t))}function ut(U,st){const _t=c.get(st).get(U);l.get(st)!==_t&&(s.uniformBlockBinding(st,_t,U.__bindingPointIndex),l.set(st,_t))}function Vt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},at=null,ct={},u={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,_=null,y=null,v=null,E=null,C=null,I=new Mt(0,0,0),D=0,M=!1,w=null,L=null,N=null,B=null,$=null,Jt.set(0,0,s.canvas.width,s.canvas.height),ee.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:J,disable:vt,bindFramebuffer:Nt,drawBuffers:G,useProgram:$t,setBlending:Pt,setMaterial:bt,setFlipSided:Tt,setCullFace:gt,setLineWidth:de,setPolygonOffset:wt,setScissorTest:Gt,activeTexture:Se,bindTexture:fe,unbindTexture:R,compressedTexImage2D:b,compressedTexImage3D:z,texImage2D:At,texImage3D:it,updateUBOMapping:It,uniformBlockBinding:ut,texStorage2D:rt,texStorage3D:Et,texSubImage2D:X,texSubImage3D:Q,compressedTexSubImage2D:q,compressedTexSubImage3D:Rt,scissor:ft,viewport:Ft,reset:Vt}}function ix(s,t,e,n,i,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new yt,h=new WeakMap;let u;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,b){return p?new OffscreenCanvas(R,b):da("canvas")}function x(R,b,z){let X=1;const Q=fe(R);if((Q.width>z||Q.height>z)&&(X=z/Math.max(Q.width,Q.height)),X<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const q=Math.floor(X*Q.width),Rt=Math.floor(X*Q.height);u===void 0&&(u=g(q,Rt));const rt=b?g(q,Rt):u;return rt.width=q,rt.height=Rt,rt.getContext("2d").drawImage(R,0,0,q,Rt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+q+"x"+Rt+")."),rt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),R;return R}function m(R){return R.generateMipmaps}function f(R){s.generateMipmap(R)}function _(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(R,b,z,X,Q=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let q=b;if(b===s.RED&&(z===s.FLOAT&&(q=s.R32F),z===s.HALF_FLOAT&&(q=s.R16F),z===s.UNSIGNED_BYTE&&(q=s.R8)),b===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.R8UI),z===s.UNSIGNED_SHORT&&(q=s.R16UI),z===s.UNSIGNED_INT&&(q=s.R32UI),z===s.BYTE&&(q=s.R8I),z===s.SHORT&&(q=s.R16I),z===s.INT&&(q=s.R32I)),b===s.RG&&(z===s.FLOAT&&(q=s.RG32F),z===s.HALF_FLOAT&&(q=s.RG16F),z===s.UNSIGNED_BYTE&&(q=s.RG8)),b===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RG8UI),z===s.UNSIGNED_SHORT&&(q=s.RG16UI),z===s.UNSIGNED_INT&&(q=s.RG32UI),z===s.BYTE&&(q=s.RG8I),z===s.SHORT&&(q=s.RG16I),z===s.INT&&(q=s.RG32I)),b===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RGB8UI),z===s.UNSIGNED_SHORT&&(q=s.RGB16UI),z===s.UNSIGNED_INT&&(q=s.RGB32UI),z===s.BYTE&&(q=s.RGB8I),z===s.SHORT&&(q=s.RGB16I),z===s.INT&&(q=s.RGB32I)),b===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(q=s.RGBA16UI),z===s.UNSIGNED_INT&&(q=s.RGBA32UI),z===s.BYTE&&(q=s.RGBA8I),z===s.SHORT&&(q=s.RGBA16I),z===s.INT&&(q=s.RGBA32I)),b===s.RGB&&(z===s.UNSIGNED_INT_5_9_9_9_REV&&(q=s.RGB9_E5),z===s.UNSIGNED_INT_10F_11F_11F_REV&&(q=s.R11F_G11F_B10F)),b===s.RGBA){const Rt=Q?ha:te.getTransfer(X);z===s.FLOAT&&(q=s.RGBA32F),z===s.HALF_FLOAT&&(q=s.RGBA16F),z===s.UNSIGNED_BYTE&&(q=Rt===oe?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT_4_4_4_4&&(q=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(q=s.RGB5_A1)}return(q===s.R16F||q===s.R32F||q===s.RG16F||q===s.RG32F||q===s.RGBA16F||q===s.RGBA32F)&&t.get("EXT_color_buffer_float"),q}function v(R,b){let z;return R?b===null||b===ki||b===nr?z=s.DEPTH24_STENCIL8:b===Ln?z=s.DEPTH32F_STENCIL8:b===er&&(z=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===ki||b===nr?z=s.DEPTH_COMPONENT24:b===Ln?z=s.DEPTH_COMPONENT32F:b===er&&(z=s.DEPTH_COMPONENT16),z}function E(R,b){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==on&&R.minFilter!==Dn?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function C(R){const b=R.target;b.removeEventListener("dispose",C),D(b),b.isVideoTexture&&h.delete(b)}function I(R){const b=R.target;b.removeEventListener("dispose",I),w(b)}function D(R){const b=n.get(R);if(b.__webglInit===void 0)return;const z=R.source,X=d.get(z);if(X){const Q=X[b.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&M(R),Object.keys(X).length===0&&d.delete(z)}n.remove(R)}function M(R){const b=n.get(R);s.deleteTexture(b.__webglTexture);const z=R.source,X=d.get(z);delete X[b.__cacheKey],a.memory.textures--}function w(R){const b=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(b.__webglFramebuffer[X]))for(let Q=0;Q<b.__webglFramebuffer[X].length;Q++)s.deleteFramebuffer(b.__webglFramebuffer[X][Q]);else s.deleteFramebuffer(b.__webglFramebuffer[X]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[X])}else{if(Array.isArray(b.__webglFramebuffer))for(let X=0;X<b.__webglFramebuffer.length;X++)s.deleteFramebuffer(b.__webglFramebuffer[X]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let X=0;X<b.__webglColorRenderbuffer.length;X++)b.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[X]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const z=R.textures;for(let X=0,Q=z.length;X<Q;X++){const q=n.get(z[X]);q.__webglTexture&&(s.deleteTexture(q.__webglTexture),a.memory.textures--),n.remove(z[X])}n.remove(R)}let L=0;function N(){L=0}function B(){const R=L;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),L+=1,R}function $(R){const b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function W(R,b){const z=n.get(R);if(R.isVideoTexture&&Gt(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&z.__version!==R.version){const X=R.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(z,R,b);return}}else R.isExternalTexture&&(z.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+b)}function Y(R,b){const z=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){Z(z,R,b);return}e.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+b)}function K(R,b){const z=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){Z(z,R,b);return}e.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+b)}function V(R,b){const z=n.get(R);if(R.version>0&&z.__version!==R.version){J(z,R,b);return}e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+b)}const at={[ca]:s.REPEAT,[Ii]:s.CLAMP_TO_EDGE,[ko]:s.MIRRORED_REPEAT},ct={[on]:s.NEAREST,[id]:s.NEAREST_MIPMAP_NEAREST,[mr]:s.NEAREST_MIPMAP_LINEAR,[Dn]:s.LINEAR,[Ia]:s.LINEAR_MIPMAP_NEAREST,[Di]:s.LINEAR_MIPMAP_LINEAR},mt={[od]:s.NEVER,[fd]:s.ALWAYS,[ld]:s.LESS,[Lh]:s.LEQUAL,[cd]:s.EQUAL,[dd]:s.GEQUAL,[hd]:s.GREATER,[ud]:s.NOTEQUAL};function Bt(R,b){if(b.type===Ln&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===Dn||b.magFilter===Ia||b.magFilter===mr||b.magFilter===Di||b.minFilter===Dn||b.minFilter===Ia||b.minFilter===mr||b.minFilter===Di)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,at[b.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,at[b.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,at[b.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,ct[b.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,ct[b.minFilter]),b.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,mt[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===on||b.minFilter!==mr&&b.minFilter!==Di||b.type===Ln&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const z=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Jt(R,b){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",C));const X=b.source;let Q=d.get(X);Q===void 0&&(Q={},d.set(X,Q));const q=$(b);if(q!==R.__cacheKey){Q[q]===void 0&&(Q[q]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,z=!0),Q[q].usedTimes++;const Rt=Q[R.__cacheKey];Rt!==void 0&&(Q[R.__cacheKey].usedTimes--,Rt.usedTimes===0&&M(b)),R.__cacheKey=q,R.__webglTexture=Q[q].texture}return z}function ee(R,b,z){return Math.floor(Math.floor(R/z)/b)}function Yt(R,b,z,X){const q=R.updateRanges;if(q.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,b.width,b.height,z,X,b.data);else{q.sort((it,ft)=>it.start-ft.start);let Rt=0;for(let it=1;it<q.length;it++){const ft=q[Rt],Ft=q[it],It=ft.start+ft.count,ut=ee(Ft.start,b.width,4),Vt=ee(ft.start,b.width,4);Ft.start<=It+1&&ut===Vt&&ee(Ft.start+Ft.count-1,b.width,4)===ut?ft.count=Math.max(ft.count,Ft.start+Ft.count-ft.start):(++Rt,q[Rt]=Ft)}q.length=Rt+1;const rt=s.getParameter(s.UNPACK_ROW_LENGTH),Et=s.getParameter(s.UNPACK_SKIP_PIXELS),At=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,b.width);for(let it=0,ft=q.length;it<ft;it++){const Ft=q[it],It=Math.floor(Ft.start/4),ut=Math.ceil(Ft.count/4),Vt=It%b.width,U=Math.floor(It/b.width),st=ut,ot=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,Vt),s.pixelStorei(s.UNPACK_SKIP_ROWS,U),e.texSubImage2D(s.TEXTURE_2D,0,Vt,U,st,ot,z,X,b.data)}R.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,rt),s.pixelStorei(s.UNPACK_SKIP_PIXELS,Et),s.pixelStorei(s.UNPACK_SKIP_ROWS,At)}}function Z(R,b,z){let X=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(X=s.TEXTURE_3D);const Q=Jt(R,b),q=b.source;e.bindTexture(X,R.__webglTexture,s.TEXTURE0+z);const Rt=n.get(q);if(q.version!==Rt.__version||Q===!0){e.activeTexture(s.TEXTURE0+z);const rt=te.getPrimaries(te.workingColorSpace),Et=b.colorSpace===ci?null:te.getPrimaries(b.colorSpace),At=b.colorSpace===ci||rt===Et?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,At);let it=x(b.image,!1,i.maxTextureSize);it=Se(b,it);const ft=r.convert(b.format,b.colorSpace),Ft=r.convert(b.type);let It=y(b.internalFormat,ft,Ft,b.colorSpace,b.isVideoTexture);Bt(X,b);let ut;const Vt=b.mipmaps,U=b.isVideoTexture!==!0,st=Rt.__version===void 0||Q===!0,ot=q.dataReady,_t=E(b,it);if(b.isDepthTexture)It=v(b.format===sr,b.type),st&&(U?e.texStorage2D(s.TEXTURE_2D,1,It,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,It,it.width,it.height,0,ft,Ft,null));else if(b.isDataTexture)if(Vt.length>0){U&&st&&e.texStorage2D(s.TEXTURE_2D,_t,It,Vt[0].width,Vt[0].height);for(let et=0,j=Vt.length;et<j;et++)ut=Vt[et],U?ot&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ft,Ft,ut.data):e.texImage2D(s.TEXTURE_2D,et,It,ut.width,ut.height,0,ft,Ft,ut.data);b.generateMipmaps=!1}else U?(st&&e.texStorage2D(s.TEXTURE_2D,_t,It,it.width,it.height),ot&&Yt(b,it,ft,Ft)):e.texImage2D(s.TEXTURE_2D,0,It,it.width,it.height,0,ft,Ft,it.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){U&&st&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,It,Vt[0].width,Vt[0].height,it.depth);for(let et=0,j=Vt.length;et<j;et++)if(ut=Vt[et],b.format!==xn)if(ft!==null)if(U){if(ot)if(b.layerUpdates.size>0){const Ct=Fc(ut.width,ut.height,b.format,b.type);for(const Ht of b.layerUpdates){const pe=ut.data.subarray(Ht*Ct/ut.data.BYTES_PER_ELEMENT,(Ht+1)*Ct/ut.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,Ht,ut.width,ut.height,1,ft,pe)}b.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,it.depth,ft,ut.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,et,It,ut.width,ut.height,it.depth,0,ut.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else U?ot&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,it.depth,ft,Ft,ut.data):e.texImage3D(s.TEXTURE_2D_ARRAY,et,It,ut.width,ut.height,it.depth,0,ft,Ft,ut.data)}else{U&&st&&e.texStorage2D(s.TEXTURE_2D,_t,It,Vt[0].width,Vt[0].height);for(let et=0,j=Vt.length;et<j;et++)ut=Vt[et],b.format!==xn?ft!==null?U?ot&&e.compressedTexSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ft,ut.data):e.compressedTexImage2D(s.TEXTURE_2D,et,It,ut.width,ut.height,0,ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):U?ot&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ft,Ft,ut.data):e.texImage2D(s.TEXTURE_2D,et,It,ut.width,ut.height,0,ft,Ft,ut.data)}else if(b.isDataArrayTexture)if(U){if(st&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,It,it.width,it.height,it.depth),ot)if(b.layerUpdates.size>0){const et=Fc(it.width,it.height,b.format,b.type);for(const j of b.layerUpdates){const Ct=it.data.subarray(j*et/it.data.BYTES_PER_ELEMENT,(j+1)*et/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,j,it.width,it.height,1,ft,Ft,Ct)}b.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,ft,Ft,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,It,it.width,it.height,it.depth,0,ft,Ft,it.data);else if(b.isData3DTexture)U?(st&&e.texStorage3D(s.TEXTURE_3D,_t,It,it.width,it.height,it.depth),ot&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,ft,Ft,it.data)):e.texImage3D(s.TEXTURE_3D,0,It,it.width,it.height,it.depth,0,ft,Ft,it.data);else if(b.isFramebufferTexture){if(st)if(U)e.texStorage2D(s.TEXTURE_2D,_t,It,it.width,it.height);else{let et=it.width,j=it.height;for(let Ct=0;Ct<_t;Ct++)e.texImage2D(s.TEXTURE_2D,Ct,It,et,j,0,ft,Ft,null),et>>=1,j>>=1}}else if(Vt.length>0){if(U&&st){const et=fe(Vt[0]);e.texStorage2D(s.TEXTURE_2D,_t,It,et.width,et.height)}for(let et=0,j=Vt.length;et<j;et++)ut=Vt[et],U?ot&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ft,Ft,ut):e.texImage2D(s.TEXTURE_2D,et,It,ft,Ft,ut);b.generateMipmaps=!1}else if(U){if(st){const et=fe(it);e.texStorage2D(s.TEXTURE_2D,_t,It,et.width,et.height)}ot&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,ft,Ft,it)}else e.texImage2D(s.TEXTURE_2D,0,It,ft,Ft,it);m(b)&&f(X),Rt.__version=q.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function J(R,b,z){if(b.image.length!==6)return;const X=Jt(R,b),Q=b.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+z);const q=n.get(Q);if(Q.version!==q.__version||X===!0){e.activeTexture(s.TEXTURE0+z);const Rt=te.getPrimaries(te.workingColorSpace),rt=b.colorSpace===ci?null:te.getPrimaries(b.colorSpace),Et=b.colorSpace===ci||Rt===rt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et);const At=b.isCompressedTexture||b.image[0].isCompressedTexture,it=b.image[0]&&b.image[0].isDataTexture,ft=[];for(let j=0;j<6;j++)!At&&!it?ft[j]=x(b.image[j],!0,i.maxCubemapSize):ft[j]=it?b.image[j].image:b.image[j],ft[j]=Se(b,ft[j]);const Ft=ft[0],It=r.convert(b.format,b.colorSpace),ut=r.convert(b.type),Vt=y(b.internalFormat,It,ut,b.colorSpace),U=b.isVideoTexture!==!0,st=q.__version===void 0||X===!0,ot=Q.dataReady;let _t=E(b,Ft);Bt(s.TEXTURE_CUBE_MAP,b);let et;if(At){U&&st&&e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,Vt,Ft.width,Ft.height);for(let j=0;j<6;j++){et=ft[j].mipmaps;for(let Ct=0;Ct<et.length;Ct++){const Ht=et[Ct];b.format!==xn?It!==null?U?ot&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct,0,0,Ht.width,Ht.height,It,Ht.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct,Vt,Ht.width,Ht.height,0,Ht.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ot&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct,0,0,Ht.width,Ht.height,It,ut,Ht.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct,Vt,Ht.width,Ht.height,0,It,ut,Ht.data)}}}else{if(et=b.mipmaps,U&&st){et.length>0&&_t++;const j=fe(ft[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,Vt,j.width,j.height)}for(let j=0;j<6;j++)if(it){U?ot&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,ft[j].width,ft[j].height,It,ut,ft[j].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Vt,ft[j].width,ft[j].height,0,It,ut,ft[j].data);for(let Ct=0;Ct<et.length;Ct++){const pe=et[Ct].image[j].image;U?ot&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct+1,0,0,pe.width,pe.height,It,ut,pe.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct+1,Vt,pe.width,pe.height,0,It,ut,pe.data)}}else{U?ot&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,It,ut,ft[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Vt,It,ut,ft[j]);for(let Ct=0;Ct<et.length;Ct++){const Ht=et[Ct];U?ot&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct+1,0,0,It,ut,Ht.image[j]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ct+1,Vt,It,ut,Ht.image[j])}}}m(b)&&f(s.TEXTURE_CUBE_MAP),q.__version=Q.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function vt(R,b,z,X,Q,q){const Rt=r.convert(z.format,z.colorSpace),rt=r.convert(z.type),Et=y(z.internalFormat,Rt,rt,z.colorSpace),At=n.get(b),it=n.get(z);if(it.__renderTarget=b,!At.__hasExternalTextures){const ft=Math.max(1,b.width>>q),Ft=Math.max(1,b.height>>q);Q===s.TEXTURE_3D||Q===s.TEXTURE_2D_ARRAY?e.texImage3D(Q,q,Et,ft,Ft,b.depth,0,Rt,rt,null):e.texImage2D(Q,q,Et,ft,Ft,0,Rt,rt,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),wt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,Q,it.__webglTexture,0,de(b)):(Q===s.TEXTURE_2D||Q>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,Q,it.__webglTexture,q),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Nt(R,b,z){if(s.bindRenderbuffer(s.RENDERBUFFER,R),b.depthBuffer){const X=b.depthTexture,Q=X&&X.isDepthTexture?X.type:null,q=v(b.stencilBuffer,Q),Rt=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,rt=de(b);wt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,rt,q,b.width,b.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,rt,q,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,q,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Rt,s.RENDERBUFFER,R)}else{const X=b.textures;for(let Q=0;Q<X.length;Q++){const q=X[Q],Rt=r.convert(q.format,q.colorSpace),rt=r.convert(q.type),Et=y(q.internalFormat,Rt,rt,q.colorSpace),At=de(b);z&&wt(b)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,At,Et,b.width,b.height):wt(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,At,Et,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,Et,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function G(R,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const X=n.get(b.depthTexture);X.__renderTarget=b,(!X.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),W(b.depthTexture,0);const Q=X.__webglTexture,q=de(b);if(b.depthTexture.format===ir)wt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Q,0,q):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Q,0);else if(b.depthTexture.format===sr)wt(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Q,0,q):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function $t(R){const b=n.get(R),z=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){const X=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),X){const Q=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,X.removeEventListener("dispose",Q)};X.addEventListener("dispose",Q),b.__depthDisposeCallback=Q}b.__boundDepthTexture=X}if(R.depthTexture&&!b.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");const X=R.texture.mipmaps;X&&X.length>0?G(b.__webglFramebuffer[0],R):G(b.__webglFramebuffer,R)}else if(z){b.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[X]),b.__webglDepthbuffer[X]===void 0)b.__webglDepthbuffer[X]=s.createRenderbuffer(),Nt(b.__webglDepthbuffer[X],R,!1);else{const Q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,q=b.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,q),s.framebufferRenderbuffer(s.FRAMEBUFFER,Q,s.RENDERBUFFER,q)}}else{const X=R.texture.mipmaps;if(X&&X.length>0?e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),Nt(b.__webglDepthbuffer,R,!1);else{const Q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,q=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,q),s.framebufferRenderbuffer(s.FRAMEBUFFER,Q,s.RENDERBUFFER,q)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ht(R,b,z){const X=n.get(R);b!==void 0&&vt(X.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&$t(R)}function P(R){const b=R.texture,z=n.get(R),X=n.get(b);R.addEventListener("dispose",I);const Q=R.textures,q=R.isWebGLCubeRenderTarget===!0,Rt=Q.length>1;if(Rt||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=b.version,a.memory.textures++),q){z.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer[rt]=[];for(let Et=0;Et<b.mipmaps.length;Et++)z.__webglFramebuffer[rt][Et]=s.createFramebuffer()}else z.__webglFramebuffer[rt]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer=[];for(let rt=0;rt<b.mipmaps.length;rt++)z.__webglFramebuffer[rt]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(Rt)for(let rt=0,Et=Q.length;rt<Et;rt++){const At=n.get(Q[rt]);At.__webglTexture===void 0&&(At.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&wt(R)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let rt=0;rt<Q.length;rt++){const Et=Q[rt];z.__webglColorRenderbuffer[rt]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[rt]);const At=r.convert(Et.format,Et.colorSpace),it=r.convert(Et.type),ft=y(Et.internalFormat,At,it,Et.colorSpace,R.isXRRenderTarget===!0),Ft=de(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ft,ft,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,z.__webglColorRenderbuffer[rt])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),Nt(z.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(q){e.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),Bt(s.TEXTURE_CUBE_MAP,b);for(let rt=0;rt<6;rt++)if(b.mipmaps&&b.mipmaps.length>0)for(let Et=0;Et<b.mipmaps.length;Et++)vt(z.__webglFramebuffer[rt][Et],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et);else vt(z.__webglFramebuffer[rt],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0);m(b)&&f(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Rt){for(let rt=0,Et=Q.length;rt<Et;rt++){const At=Q[rt],it=n.get(At);let ft=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ft=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ft,it.__webglTexture),Bt(ft,At),vt(z.__webglFramebuffer,R,At,s.COLOR_ATTACHMENT0+rt,ft,0),m(At)&&f(ft)}e.unbindTexture()}else{let rt=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(rt=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(rt,X.__webglTexture),Bt(rt,b),b.mipmaps&&b.mipmaps.length>0)for(let Et=0;Et<b.mipmaps.length;Et++)vt(z.__webglFramebuffer[Et],R,b,s.COLOR_ATTACHMENT0,rt,Et);else vt(z.__webglFramebuffer,R,b,s.COLOR_ATTACHMENT0,rt,0);m(b)&&f(rt),e.unbindTexture()}R.depthBuffer&&$t(R)}function Pt(R){const b=R.textures;for(let z=0,X=b.length;z<X;z++){const Q=b[z];if(m(Q)){const q=_(R),Rt=n.get(Q).__webglTexture;e.bindTexture(q,Rt),f(q),e.unbindTexture()}}}const bt=[],Tt=[];function gt(R){if(R.samples>0){if(wt(R)===!1){const b=R.textures,z=R.width,X=R.height;let Q=s.COLOR_BUFFER_BIT;const q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Rt=n.get(R),rt=b.length>1;if(rt)for(let At=0;At<b.length;At++)e.bindFramebuffer(s.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+At,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,Rt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+At,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer);const Et=R.texture.mipmaps;Et&&Et.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer);for(let At=0;At<b.length;At++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(Q|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(Q|=s.STENCIL_BUFFER_BIT)),rt){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Rt.__webglColorRenderbuffer[At]);const it=n.get(b[At]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,it,0)}s.blitFramebuffer(0,0,z,X,0,0,z,X,Q,s.NEAREST),l===!0&&(bt.length=0,Tt.length=0,bt.push(s.COLOR_ATTACHMENT0+At),R.depthBuffer&&R.resolveDepthBuffer===!1&&(bt.push(q),Tt.push(q),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Tt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,bt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),rt)for(let At=0;At<b.length;At++){e.bindFramebuffer(s.FRAMEBUFFER,Rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+At,s.RENDERBUFFER,Rt.__webglColorRenderbuffer[At]);const it=n.get(b[At]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,Rt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+At,s.TEXTURE_2D,it,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Rt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const b=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function de(R){return Math.min(i.maxSamples,R.samples)}function wt(R){const b=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Gt(R){const b=a.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function Se(R,b){const z=R.colorSpace,X=R.format,Q=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||z!==Ss&&z!==ci&&(te.getTransfer(z)===oe?(X!==xn||Q!==Fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),b}function fe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=N,this.setTexture2D=W,this.setTexture2DArray=Y,this.setTexture3D=K,this.setTextureCube=V,this.rebindTextures=ht,this.setupRenderTarget=P,this.updateRenderTargetMipmap=Pt,this.updateMultisampleRenderTarget=gt,this.setupDepthRenderbuffer=$t,this.setupFrameBufferTexture=vt,this.useMultisampledRTT=wt}function sx(s,t){function e(n,i=ci){let r;const a=te.getTransfer(i);if(n===Fn)return s.UNSIGNED_BYTE;if(n===bl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Ml)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Ah)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Ch)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Th)return s.BYTE;if(n===Eh)return s.SHORT;if(n===er)return s.UNSIGNED_SHORT;if(n===_l)return s.INT;if(n===ki)return s.UNSIGNED_INT;if(n===Ln)return s.FLOAT;if(n===cr)return s.HALF_FLOAT;if(n===Rh)return s.ALPHA;if(n===Ph)return s.RGB;if(n===xn)return s.RGBA;if(n===ir)return s.DEPTH_COMPONENT;if(n===sr)return s.DEPTH_STENCIL;if(n===wl)return s.RED;if(n===Sl)return s.RED_INTEGER;if(n===Ih)return s.RG;if(n===Tl)return s.RG_INTEGER;if(n===El)return s.RGBA_INTEGER;if(n===ea||n===na||n===ia||n===sa)if(a===oe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ea)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===na)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ia)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ea)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===na)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ia)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===No||n===Fo||n===zo||n===Bo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===No)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Fo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===zo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Bo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Oo||n===Ho||n===Go)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Oo||n===Ho)return a===oe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Go)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Vo||n===Wo||n===qo||n===Xo||n===Yo||n===$o||n===Zo||n===jo||n===Ko||n===Jo||n===Qo||n===tl||n===el||n===nl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Vo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Wo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===qo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Xo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Yo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===$o)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Zo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===jo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ko)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Jo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Qo)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===tl)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===el)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===nl)return a===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===il||n===sl||n===rl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===il)return a===oe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===sl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===rl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===al||n===ol||n===ll||n===cl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===al)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ol)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ll)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===cl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===nr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}const rx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ax=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ox{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new $h(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Kn({vertexShader:rx,fragmentShader:ax,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new pt(new zi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class lx extends As{constructor(t,e){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null;const x=typeof XRWebGLBinding<"u",m=new ox,f={},_=e.getContextAttributes();let y=null,v=null;const E=[],C=[],I=new yt;let D=null;const M=new Je;M.viewport=new le;const w=new Je;w.viewport=new le;const L=[M,w],N=new Rf;let B=null,$=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let J=E[Z];return J===void 0&&(J=new Ja,E[Z]=J),J.getTargetRaySpace()},this.getControllerGrip=function(Z){let J=E[Z];return J===void 0&&(J=new Ja,E[Z]=J),J.getGripSpace()},this.getHand=function(Z){let J=E[Z];return J===void 0&&(J=new Ja,E[Z]=J),J.getHandSpace()};function W(Z){const J=C.indexOf(Z.inputSource);if(J===-1)return;const vt=E[J];vt!==void 0&&(vt.update(Z.inputSource,Z.frame,c||a),vt.dispatchEvent({type:Z.type,data:Z.inputSource}))}function Y(){i.removeEventListener("select",W),i.removeEventListener("selectstart",W),i.removeEventListener("selectend",W),i.removeEventListener("squeeze",W),i.removeEventListener("squeezestart",W),i.removeEventListener("squeezeend",W),i.removeEventListener("end",Y),i.removeEventListener("inputsourceschange",K);for(let Z=0;Z<E.length;Z++){const J=C[Z];J!==null&&(C[Z]=null,E[Z].disconnect(J))}B=null,$=null,m.reset();for(const Z in f)delete f[Z];t.setRenderTarget(y),p=null,d=null,u=null,i=null,v=null,Yt.stop(),n.isPresenting=!1,t.setPixelRatio(D),t.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(i,e)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(Z){if(i=Z,i!==null){if(y=t.getRenderTarget(),i.addEventListener("select",W),i.addEventListener("selectstart",W),i.addEventListener("selectend",W),i.addEventListener("squeeze",W),i.addEventListener("squeezestart",W),i.addEventListener("squeezeend",W),i.addEventListener("end",Y),i.addEventListener("inputsourceschange",K),_.xrCompatible!==!0&&await e.makeXRCompatible(),D=t.getPixelRatio(),t.getSize(I),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Nt=null,G=null;_.depth&&(G=_.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=_.stencil?sr:ir,Nt=_.stencil?nr:ki);const $t={colorFormat:e.RGBA8,depthFormat:G,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer($t),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new Ni(d.textureWidth,d.textureHeight,{format:xn,type:Fn,depthTexture:new Yh(d.textureWidth,d.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const vt={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(i,e,vt),i.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new Ni(p.framebufferWidth,p.framebufferHeight,{format:xn,type:Fn,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Yt.setContext(i),Yt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function K(Z){for(let J=0;J<Z.removed.length;J++){const vt=Z.removed[J],Nt=C.indexOf(vt);Nt>=0&&(C[Nt]=null,E[Nt].disconnect(vt))}for(let J=0;J<Z.added.length;J++){const vt=Z.added[J];let Nt=C.indexOf(vt);if(Nt===-1){for(let $t=0;$t<E.length;$t++)if($t>=C.length){C.push(vt),Nt=$t;break}else if(C[$t]===null){C[$t]=vt,Nt=$t;break}if(Nt===-1)break}const G=E[Nt];G&&G.connect(vt)}}const V=new T,at=new T;function ct(Z,J,vt){V.setFromMatrixPosition(J.matrixWorld),at.setFromMatrixPosition(vt.matrixWorld);const Nt=V.distanceTo(at),G=J.projectionMatrix.elements,$t=vt.projectionMatrix.elements,ht=G[14]/(G[10]-1),P=G[14]/(G[10]+1),Pt=(G[9]+1)/G[5],bt=(G[9]-1)/G[5],Tt=(G[8]-1)/G[0],gt=($t[8]+1)/$t[0],de=ht*Tt,wt=ht*gt,Gt=Nt/(-Tt+gt),Se=Gt*-Tt;if(J.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(Se),Z.translateZ(Gt),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),G[10]===-1)Z.projectionMatrix.copy(J.projectionMatrix),Z.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const fe=ht+Gt,R=P+Gt,b=de-Se,z=wt+(Nt-Se),X=Pt*P/R*fe,Q=bt*P/R*fe;Z.projectionMatrix.makePerspective(b,z,X,Q,fe,R),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function mt(Z,J){J===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(J.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(i===null)return;let J=Z.near,vt=Z.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(vt=m.depthFar)),N.near=w.near=M.near=J,N.far=w.far=M.far=vt,(B!==N.near||$!==N.far)&&(i.updateRenderState({depthNear:N.near,depthFar:N.far}),B=N.near,$=N.far),N.layers.mask=Z.layers.mask|6,M.layers.mask=N.layers.mask&3,w.layers.mask=N.layers.mask&5;const Nt=Z.parent,G=N.cameras;mt(N,Nt);for(let $t=0;$t<G.length;$t++)mt(G[$t],Nt);G.length===2?ct(N,M,w):N.projectionMatrix.copy(M.projectionMatrix),Bt(Z,N,Nt)};function Bt(Z,J,vt){vt===null?Z.matrix.copy(J.matrixWorld):(Z.matrix.copy(vt.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(J.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(J.projectionMatrix),Z.projectionMatrixInverse.copy(J.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=rr*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(Z){l=Z,d!==null&&(d.fixedFoveation=Z),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(Z){return f[Z]};let Jt=null;function ee(Z,J){if(h=J.getViewerPose(c||a),g=J,h!==null){const vt=h.views;p!==null&&(t.setRenderTargetFramebuffer(v,p.framebuffer),t.setRenderTarget(v));let Nt=!1;vt.length!==N.cameras.length&&(N.cameras.length=0,Nt=!0);for(let P=0;P<vt.length;P++){const Pt=vt[P];let bt=null;if(p!==null)bt=p.getViewport(Pt);else{const gt=u.getViewSubImage(d,Pt);bt=gt.viewport,P===0&&(t.setRenderTargetTextures(v,gt.colorTexture,gt.depthStencilTexture),t.setRenderTarget(v))}let Tt=L[P];Tt===void 0&&(Tt=new Je,Tt.layers.enable(P),Tt.viewport=new le,L[P]=Tt),Tt.matrix.fromArray(Pt.transform.matrix),Tt.matrix.decompose(Tt.position,Tt.quaternion,Tt.scale),Tt.projectionMatrix.fromArray(Pt.projectionMatrix),Tt.projectionMatrixInverse.copy(Tt.projectionMatrix).invert(),Tt.viewport.set(bt.x,bt.y,bt.width,bt.height),P===0&&(N.matrix.copy(Tt.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Nt===!0&&N.cameras.push(Tt)}const G=i.enabledFeatures;if(G&&G.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&x){u=n.getBinding();const P=u.getDepthInformation(vt[0]);P&&P.isValid&&P.texture&&m.init(P,i.renderState)}if(G&&G.includes("camera-access")&&x){t.state.unbindTexture(),u=n.getBinding();for(let P=0;P<vt.length;P++){const Pt=vt[P].camera;if(Pt){let bt=f[Pt];bt||(bt=new $h,f[Pt]=bt);const Tt=u.getCameraImage(Pt);bt.sourceTexture=Tt}}}}for(let vt=0;vt<E.length;vt++){const Nt=C[vt],G=E[vt];Nt!==null&&G!==void 0&&G.update(Nt,J,c||a)}Jt&&Jt(Z,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const Yt=new tu;Yt.setAnimationLoop(ee),this.setAnimationLoop=function(Z){Jt=Z},this.dispose=function(){}}}const Mi=new En,cx=new ie;function hx(s,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Oh(s)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function i(m,f,_,y,v){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,v)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),x(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,_,y):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===$e&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===$e&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const _=t.get(f),y=_.envMap,v=_.envMapRotation;y&&(m.envMap.value=y,Mi.copy(v),Mi.x*=-1,Mi.y*=-1,Mi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Mi.y*=-1,Mi.z*=-1),m.envMapRotation.value.setFromMatrix4(cx.makeRotationFromEuler(Mi)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,_,y){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*_,m.scale.value=y*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,_){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===$e&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){const _=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function ux(s,t,e,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,y){const v=y.program;n.uniformBlockBinding(_,v)}function c(_,y){let v=i[_.id];v===void 0&&(g(_),v=h(_),i[_.id]=v,_.addEventListener("dispose",m));const E=y.program;n.updateUBOMapping(_,E);const C=t.render.frame;r[_.id]!==C&&(d(_),r[_.id]=C)}function h(_){const y=u();_.__bindingPointIndex=y;const v=s.createBuffer(),E=_.__size,C=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,E,C),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,y,v),v}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(_){const y=i[_.id],v=_.uniforms,E=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,y);for(let C=0,I=v.length;C<I;C++){const D=Array.isArray(v[C])?v[C]:[v[C]];for(let M=0,w=D.length;M<w;M++){const L=D[M];if(p(L,C,M,E)===!0){const N=L.__offset,B=Array.isArray(L.value)?L.value:[L.value];let $=0;for(let W=0;W<B.length;W++){const Y=B[W],K=x(Y);typeof Y=="number"||typeof Y=="boolean"?(L.__data[0]=Y,s.bufferSubData(s.UNIFORM_BUFFER,N+$,L.__data)):Y.isMatrix3?(L.__data[0]=Y.elements[0],L.__data[1]=Y.elements[1],L.__data[2]=Y.elements[2],L.__data[3]=0,L.__data[4]=Y.elements[3],L.__data[5]=Y.elements[4],L.__data[6]=Y.elements[5],L.__data[7]=0,L.__data[8]=Y.elements[6],L.__data[9]=Y.elements[7],L.__data[10]=Y.elements[8],L.__data[11]=0):(Y.toArray(L.__data,$),$+=K.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,N,L.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(_,y,v,E){const C=_.value,I=y+"_"+v;if(E[I]===void 0)return typeof C=="number"||typeof C=="boolean"?E[I]=C:E[I]=C.clone(),!0;{const D=E[I];if(typeof C=="number"||typeof C=="boolean"){if(D!==C)return E[I]=C,!0}else if(D.equals(C)===!1)return D.copy(C),!0}return!1}function g(_){const y=_.uniforms;let v=0;const E=16;for(let I=0,D=y.length;I<D;I++){const M=Array.isArray(y[I])?y[I]:[y[I]];for(let w=0,L=M.length;w<L;w++){const N=M[w],B=Array.isArray(N.value)?N.value:[N.value];for(let $=0,W=B.length;$<W;$++){const Y=B[$],K=x(Y),V=v%E,at=V%K.boundary,ct=V+at;v+=at,ct!==0&&E-ct<K.storage&&(v+=E-ct),N.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=v,v+=K.storage}}}const C=v%E;return C>0&&(v+=E-C),_.__size=v,_.__cache={},this}function x(_){const y={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(y.boundary=4,y.storage=4):_.isVector2?(y.boundary=8,y.storage=8):_.isVector3||_.isColor?(y.boundary=16,y.storage=12):_.isVector4?(y.boundary=16,y.storage=16):_.isMatrix3?(y.boundary=48,y.storage=48):_.isMatrix4?(y.boundary=64,y.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),y}function m(_){const y=_.target;y.removeEventListener("dispose",m);const v=a.indexOf(y.__bindingPointIndex);a.splice(v,1),s.deleteBuffer(i[y.id]),delete i[y.id],delete r[y.id]}function f(){for(const _ in i)s.deleteBuffer(i[_]);a=[],i={},r={}}return{bind:l,update:c,dispose:f}}class ru{constructor(t={}){const{canvas:e=Pd(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),x=new Int32Array(4);let m=null,f=null;const _=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let E=!1;this._outputColorSpace=Ke;let C=0,I=0,D=null,M=-1,w=null;const L=new le,N=new le;let B=null;const $=new Mt(0);let W=0,Y=e.width,K=e.height,V=1,at=null,ct=null;const mt=new le(0,0,Y,K),Bt=new le(0,0,Y,K);let Jt=!1;const ee=new Il;let Yt=!1,Z=!1;const J=new ie,vt=new T,Nt=new le,G={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $t=!1;function ht(){return D===null?V:1}let P=n;function Pt(S,k){return e.getContext(S,k)}try{const S={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${vl}`),e.addEventListener("webglcontextlost",ot,!1),e.addEventListener("webglcontextrestored",_t,!1),e.addEventListener("webglcontextcreationerror",et,!1),P===null){const k="webgl2";if(P=Pt(k,S),P===null)throw Pt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let bt,Tt,gt,de,wt,Gt,Se,fe,R,b,z,X,Q,q,Rt,rt,Et,At,it,ft,Ft,It,ut,Vt;function U(){bt=new M0(P),bt.init(),It=new sx(P,bt),Tt=new m0(P,bt,t,It),gt=new nx(P,bt),Tt.reversedDepthBuffer&&d&&gt.buffers.depth.setReversed(!0),de=new T0(P),wt=new Vg,Gt=new ix(P,bt,gt,wt,Tt,It,de),Se=new x0(v),fe=new b0(v),R=new If(P),ut=new f0(P,R),b=new w0(P,R,de,ut),z=new A0(P,b,R,de),it=new E0(P,Tt,Gt),rt=new g0(wt),X=new Gg(v,Se,fe,bt,Tt,ut,rt),Q=new hx(v,wt),q=new qg,Rt=new Kg(bt),At=new d0(v,Se,fe,gt,z,p,l),Et=new tx(v,z,Tt),Vt=new ux(P,de,Tt,gt),ft=new p0(P,bt,de),Ft=new S0(P,bt,de),de.programs=X.programs,v.capabilities=Tt,v.extensions=bt,v.properties=wt,v.renderLists=q,v.shadowMap=Et,v.state=gt,v.info=de}U();const st=new lx(v,P);this.xr=st,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const S=bt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=bt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(S){S!==void 0&&(V=S,this.setSize(Y,K,!1))},this.getSize=function(S){return S.set(Y,K)},this.setSize=function(S,k,O=!0){if(st.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=S,K=k,e.width=Math.floor(S*V),e.height=Math.floor(k*V),O===!0&&(e.style.width=S+"px",e.style.height=k+"px"),this.setViewport(0,0,S,k)},this.getDrawingBufferSize=function(S){return S.set(Y*V,K*V).floor()},this.setDrawingBufferSize=function(S,k,O){Y=S,K=k,V=O,e.width=Math.floor(S*O),e.height=Math.floor(k*O),this.setViewport(0,0,S,k)},this.getCurrentViewport=function(S){return S.copy(L)},this.getViewport=function(S){return S.copy(mt)},this.setViewport=function(S,k,O,H){S.isVector4?mt.set(S.x,S.y,S.z,S.w):mt.set(S,k,O,H),gt.viewport(L.copy(mt).multiplyScalar(V).round())},this.getScissor=function(S){return S.copy(Bt)},this.setScissor=function(S,k,O,H){S.isVector4?Bt.set(S.x,S.y,S.z,S.w):Bt.set(S,k,O,H),gt.scissor(N.copy(Bt).multiplyScalar(V).round())},this.getScissorTest=function(){return Jt},this.setScissorTest=function(S){gt.setScissorTest(Jt=S)},this.setOpaqueSort=function(S){at=S},this.setTransparentSort=function(S){ct=S},this.getClearColor=function(S){return S.copy(At.getClearColor())},this.setClearColor=function(){At.setClearColor(...arguments)},this.getClearAlpha=function(){return At.getClearAlpha()},this.setClearAlpha=function(){At.setClearAlpha(...arguments)},this.clear=function(S=!0,k=!0,O=!0){let H=0;if(S){let F=!1;if(D!==null){const nt=D.texture.format;F=nt===El||nt===Tl||nt===Sl}if(F){const nt=D.texture.type,dt=nt===Fn||nt===ki||nt===er||nt===nr||nt===bl||nt===Ml,St=At.getClearColor(),xt=At.getClearAlpha(),kt=St.r,zt=St.g,Dt=St.b;dt?(g[0]=kt,g[1]=zt,g[2]=Dt,g[3]=xt,P.clearBufferuiv(P.COLOR,0,g)):(x[0]=kt,x[1]=zt,x[2]=Dt,x[3]=xt,P.clearBufferiv(P.COLOR,0,x))}else H|=P.COLOR_BUFFER_BIT}k&&(H|=P.DEPTH_BUFFER_BIT),O&&(H|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ot,!1),e.removeEventListener("webglcontextrestored",_t,!1),e.removeEventListener("webglcontextcreationerror",et,!1),At.dispose(),q.dispose(),Rt.dispose(),wt.dispose(),Se.dispose(),fe.dispose(),z.dispose(),ut.dispose(),Vt.dispose(),X.dispose(),st.dispose(),st.removeEventListener("sessionstart",An),st.removeEventListener("sessionend",Xl),mi.stop()};function ot(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function _t(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const S=de.autoReset,k=Et.enabled,O=Et.autoUpdate,H=Et.needsUpdate,F=Et.type;U(),de.autoReset=S,Et.enabled=k,Et.autoUpdate=O,Et.needsUpdate=H,Et.type=F}function et(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function j(S){const k=S.target;k.removeEventListener("dispose",j),Ct(k)}function Ct(S){Ht(S),wt.remove(S)}function Ht(S){const k=wt.get(S).programs;k!==void 0&&(k.forEach(function(O){X.releaseProgram(O)}),S.isShaderMaterial&&X.releaseShaderCache(S))}this.renderBufferDirect=function(S,k,O,H,F,nt){k===null&&(k=G);const dt=F.isMesh&&F.matrixWorld.determinant()<0,St=wu(S,k,O,H,F);gt.setMaterial(H,dt);let xt=O.index,kt=1;if(H.wireframe===!0){if(xt=b.getWireframeAttribute(O),xt===void 0)return;kt=2}const zt=O.drawRange,Dt=O.attributes.position;let Zt=zt.start*kt,ae=(zt.start+zt.count)*kt;nt!==null&&(Zt=Math.max(Zt,nt.start*kt),ae=Math.min(ae,(nt.start+nt.count)*kt)),xt!==null?(Zt=Math.max(Zt,0),ae=Math.min(ae,xt.count)):Dt!=null&&(Zt=Math.max(Zt,0),ae=Math.min(ae,Dt.count));const ye=ae-Zt;if(ye<0||ye===1/0)return;ut.setup(F,H,St,O,xt);let me,ce=ft;if(xt!==null&&(me=R.get(xt),ce=Ft,ce.setIndex(me)),F.isMesh)H.wireframe===!0?(gt.setLineWidth(H.wireframeLinewidth*ht()),ce.setMode(P.LINES)):ce.setMode(P.TRIANGLES);else if(F.isLine){let Ut=H.linewidth;Ut===void 0&&(Ut=1),gt.setLineWidth(Ut*ht()),F.isLineSegments?ce.setMode(P.LINES):F.isLineLoop?ce.setMode(P.LINE_LOOP):ce.setMode(P.LINE_STRIP)}else F.isPoints?ce.setMode(P.POINTS):F.isSprite&&ce.setMode(P.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)ar("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ce.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(bt.get("WEBGL_multi_draw"))ce.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Ut=F._multiDrawStarts,xe=F._multiDrawCounts,Qt=F._multiDrawCount,en=xt?R.get(xt).bytesPerElement:1,qi=wt.get(H).currentProgram.getUniforms();for(let nn=0;nn<Qt;nn++)qi.setValue(P,"_gl_DrawID",nn),ce.render(Ut[nn]/en,xe[nn])}else if(F.isInstancedMesh)ce.renderInstances(Zt,ye,F.count);else if(O.isInstancedBufferGeometry){const Ut=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,xe=Math.min(O.instanceCount,Ut);ce.renderInstances(Zt,ye,xe)}else ce.render(Zt,ye)};function pe(S,k,O){S.transparent===!0&&S.side===Ge&&S.forceSinglePass===!1?(S.side=$e,S.needsUpdate=!0,pr(S,k,O),S.side=fi,S.needsUpdate=!0,pr(S,k,O),S.side=Ge):pr(S,k,O)}this.compile=function(S,k,O=null){O===null&&(O=S),f=Rt.get(O),f.init(k),y.push(f),O.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),S!==O&&S.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();const H=new Set;return S.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const nt=F.material;if(nt)if(Array.isArray(nt))for(let dt=0;dt<nt.length;dt++){const St=nt[dt];pe(St,O,F),H.add(St)}else pe(nt,O,F),H.add(nt)}),f=y.pop(),H},this.compileAsync=function(S,k,O=null){const H=this.compile(S,k,O);return new Promise(F=>{function nt(){if(H.forEach(function(dt){wt.get(dt).currentProgram.isReady()&&H.delete(dt)}),H.size===0){F(S);return}setTimeout(nt,10)}bt.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let ne=null;function zn(S){ne&&ne(S)}function An(){mi.stop()}function Xl(){mi.start()}const mi=new tu;mi.setAnimationLoop(zn),typeof self<"u"&&mi.setContext(self),this.setAnimationLoop=function(S){ne=S,st.setAnimationLoop(S),S===null?mi.stop():mi.start()},st.addEventListener("sessionstart",An),st.addEventListener("sessionend",Xl),this.render=function(S,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),st.enabled===!0&&st.isPresenting===!0&&(st.cameraAutoUpdate===!0&&st.updateCamera(k),k=st.getCamera()),S.isScene===!0&&S.onBeforeRender(v,S,k,D),f=Rt.get(S,y.length),f.init(k),y.push(f),J.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),ee.setFromProjectionMatrix(J,Un,k.reversedDepth),Z=this.localClippingEnabled,Yt=rt.init(this.clippingPlanes,Z),m=q.get(S,_.length),m.init(),_.push(m),st.enabled===!0&&st.isPresenting===!0){const nt=v.xr.getDepthSensingMesh();nt!==null&&Ra(nt,k,-1/0,v.sortObjects)}Ra(S,k,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(at,ct),$t=st.enabled===!1||st.isPresenting===!1||st.hasDepthSensing()===!1,$t&&At.addToRenderList(m,S),this.info.render.frame++,Yt===!0&&rt.beginShadows();const O=f.state.shadowsArray;Et.render(O,S,k),Yt===!0&&rt.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,F=m.transmissive;if(f.setupLights(),k.isArrayCamera){const nt=k.cameras;if(F.length>0)for(let dt=0,St=nt.length;dt<St;dt++){const xt=nt[dt];$l(H,F,S,xt)}$t&&At.render(S);for(let dt=0,St=nt.length;dt<St;dt++){const xt=nt[dt];Yl(m,S,xt,xt.viewport)}}else F.length>0&&$l(H,F,S,k),$t&&At.render(S),Yl(m,S,k);D!==null&&I===0&&(Gt.updateMultisampleRenderTarget(D),Gt.updateRenderTargetMipmap(D)),S.isScene===!0&&S.onAfterRender(v,S,k),ut.resetDefaultState(),M=-1,w=null,y.pop(),y.length>0?(f=y[y.length-1],Yt===!0&&rt.setGlobalState(v.clippingPlanes,f.state.camera)):f=null,_.pop(),_.length>0?m=_[_.length-1]:m=null};function Ra(S,k,O,H){if(S.visible===!1)return;if(S.layers.test(k.layers)){if(S.isGroup)O=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(k);else if(S.isLight)f.pushLight(S),S.castShadow&&f.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||ee.intersectsSprite(S)){H&&Nt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(J);const dt=z.update(S),St=S.material;St.visible&&m.push(S,dt,St,O,Nt.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||ee.intersectsObject(S))){const dt=z.update(S),St=S.material;if(H&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Nt.copy(S.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Nt.copy(dt.boundingSphere.center)),Nt.applyMatrix4(S.matrixWorld).applyMatrix4(J)),Array.isArray(St)){const xt=dt.groups;for(let kt=0,zt=xt.length;kt<zt;kt++){const Dt=xt[kt],Zt=St[Dt.materialIndex];Zt&&Zt.visible&&m.push(S,dt,Zt,O,Nt.z,Dt)}}else St.visible&&m.push(S,dt,St,O,Nt.z,null)}}const nt=S.children;for(let dt=0,St=nt.length;dt<St;dt++)Ra(nt[dt],k,O,H)}function Yl(S,k,O,H){const F=S.opaque,nt=S.transmissive,dt=S.transparent;f.setupLightsView(O),Yt===!0&&rt.setGlobalState(v.clippingPlanes,O),H&&gt.viewport(L.copy(H)),F.length>0&&fr(F,k,O),nt.length>0&&fr(nt,k,O),dt.length>0&&fr(dt,k,O),gt.buffers.depth.setTest(!0),gt.buffers.depth.setMask(!0),gt.buffers.color.setMask(!0),gt.setPolygonOffset(!1)}function $l(S,k,O,H){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[H.id]===void 0&&(f.state.transmissionRenderTarget[H.id]=new Ni(1,1,{generateMipmaps:!0,type:bt.has("EXT_color_buffer_half_float")||bt.has("EXT_color_buffer_float")?cr:Fn,minFilter:Di,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:te.workingColorSpace}));const nt=f.state.transmissionRenderTarget[H.id],dt=H.viewport||L;nt.setSize(dt.z*v.transmissionResolutionScale,dt.w*v.transmissionResolutionScale);const St=v.getRenderTarget(),xt=v.getActiveCubeFace(),kt=v.getActiveMipmapLevel();v.setRenderTarget(nt),v.getClearColor($),W=v.getClearAlpha(),W<1&&v.setClearColor(16777215,.5),v.clear(),$t&&At.render(O);const zt=v.toneMapping;v.toneMapping=ui;const Dt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),f.setupLightsView(H),Yt===!0&&rt.setGlobalState(v.clippingPlanes,H),fr(S,O,H),Gt.updateMultisampleRenderTarget(nt),Gt.updateRenderTargetMipmap(nt),bt.has("WEBGL_multisampled_render_to_texture")===!1){let Zt=!1;for(let ae=0,ye=k.length;ae<ye;ae++){const me=k[ae],ce=me.object,Ut=me.geometry,xe=me.material,Qt=me.group;if(xe.side===Ge&&ce.layers.test(H.layers)){const en=xe.side;xe.side=$e,xe.needsUpdate=!0,Zl(ce,O,H,Ut,xe,Qt),xe.side=en,xe.needsUpdate=!0,Zt=!0}}Zt===!0&&(Gt.updateMultisampleRenderTarget(nt),Gt.updateRenderTargetMipmap(nt))}v.setRenderTarget(St,xt,kt),v.setClearColor($,W),Dt!==void 0&&(H.viewport=Dt),v.toneMapping=zt}function fr(S,k,O){const H=k.isScene===!0?k.overrideMaterial:null;for(let F=0,nt=S.length;F<nt;F++){const dt=S[F],St=dt.object,xt=dt.geometry,kt=dt.group;let zt=dt.material;zt.allowOverride===!0&&H!==null&&(zt=H),St.layers.test(O.layers)&&Zl(St,k,O,xt,zt,kt)}}function Zl(S,k,O,H,F,nt){S.onBeforeRender(v,k,O,H,F,nt),S.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),F.onBeforeRender(v,k,O,H,S,nt),F.transparent===!0&&F.side===Ge&&F.forceSinglePass===!1?(F.side=$e,F.needsUpdate=!0,v.renderBufferDirect(O,k,H,F,S,nt),F.side=fi,F.needsUpdate=!0,v.renderBufferDirect(O,k,H,F,S,nt),F.side=Ge):v.renderBufferDirect(O,k,H,F,S,nt),S.onAfterRender(v,k,O,H,F,nt)}function pr(S,k,O){k.isScene!==!0&&(k=G);const H=wt.get(S),F=f.state.lights,nt=f.state.shadowsArray,dt=F.state.version,St=X.getParameters(S,F.state,nt,k,O),xt=X.getProgramCacheKey(St);let kt=H.programs;H.environment=S.isMeshStandardMaterial?k.environment:null,H.fog=k.fog,H.envMap=(S.isMeshStandardMaterial?fe:Se).get(S.envMap||H.environment),H.envMapRotation=H.environment!==null&&S.envMap===null?k.environmentRotation:S.envMapRotation,kt===void 0&&(S.addEventListener("dispose",j),kt=new Map,H.programs=kt);let zt=kt.get(xt);if(zt!==void 0){if(H.currentProgram===zt&&H.lightsStateVersion===dt)return Kl(S,St),zt}else St.uniforms=X.getUniforms(S),S.onBeforeCompile(St,v),zt=X.acquireProgram(St,xt),kt.set(xt,zt),H.uniforms=St.uniforms;const Dt=H.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Dt.clippingPlanes=rt.uniform),Kl(S,St),H.needsLights=Tu(S),H.lightsStateVersion=dt,H.needsLights&&(Dt.ambientLightColor.value=F.state.ambient,Dt.lightProbe.value=F.state.probe,Dt.directionalLights.value=F.state.directional,Dt.directionalLightShadows.value=F.state.directionalShadow,Dt.spotLights.value=F.state.spot,Dt.spotLightShadows.value=F.state.spotShadow,Dt.rectAreaLights.value=F.state.rectArea,Dt.ltc_1.value=F.state.rectAreaLTC1,Dt.ltc_2.value=F.state.rectAreaLTC2,Dt.pointLights.value=F.state.point,Dt.pointLightShadows.value=F.state.pointShadow,Dt.hemisphereLights.value=F.state.hemi,Dt.directionalShadowMap.value=F.state.directionalShadowMap,Dt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Dt.spotShadowMap.value=F.state.spotShadowMap,Dt.spotLightMatrix.value=F.state.spotLightMatrix,Dt.spotLightMap.value=F.state.spotLightMap,Dt.pointShadowMap.value=F.state.pointShadowMap,Dt.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=zt,H.uniformsList=null,zt}function jl(S){if(S.uniformsList===null){const k=S.currentProgram.getUniforms();S.uniformsList=ra.seqWithValue(k.seq,S.uniforms)}return S.uniformsList}function Kl(S,k){const O=wt.get(S);O.outputColorSpace=k.outputColorSpace,O.batching=k.batching,O.batchingColor=k.batchingColor,O.instancing=k.instancing,O.instancingColor=k.instancingColor,O.instancingMorph=k.instancingMorph,O.skinning=k.skinning,O.morphTargets=k.morphTargets,O.morphNormals=k.morphNormals,O.morphColors=k.morphColors,O.morphTargetsCount=k.morphTargetsCount,O.numClippingPlanes=k.numClippingPlanes,O.numIntersection=k.numClipIntersection,O.vertexAlphas=k.vertexAlphas,O.vertexTangents=k.vertexTangents,O.toneMapping=k.toneMapping}function wu(S,k,O,H,F){k.isScene!==!0&&(k=G),Gt.resetTextureUnits();const nt=k.fog,dt=H.isMeshStandardMaterial?k.environment:null,St=D===null?v.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ss,xt=(H.isMeshStandardMaterial?fe:Se).get(H.envMap||dt),kt=H.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,zt=!!O.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Dt=!!O.morphAttributes.position,Zt=!!O.morphAttributes.normal,ae=!!O.morphAttributes.color;let ye=ui;H.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ye=v.toneMapping);const me=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ce=me!==void 0?me.length:0,Ut=wt.get(H),xe=f.state.lights;if(Yt===!0&&(Z===!0||S!==w)){const qe=S===w&&H.id===M;rt.setState(H,S,qe)}let Qt=!1;H.version===Ut.__version?(Ut.needsLights&&Ut.lightsStateVersion!==xe.state.version||Ut.outputColorSpace!==St||F.isBatchedMesh&&Ut.batching===!1||!F.isBatchedMesh&&Ut.batching===!0||F.isBatchedMesh&&Ut.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ut.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ut.instancing===!1||!F.isInstancedMesh&&Ut.instancing===!0||F.isSkinnedMesh&&Ut.skinning===!1||!F.isSkinnedMesh&&Ut.skinning===!0||F.isInstancedMesh&&Ut.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ut.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ut.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ut.instancingMorph===!1&&F.morphTexture!==null||Ut.envMap!==xt||H.fog===!0&&Ut.fog!==nt||Ut.numClippingPlanes!==void 0&&(Ut.numClippingPlanes!==rt.numPlanes||Ut.numIntersection!==rt.numIntersection)||Ut.vertexAlphas!==kt||Ut.vertexTangents!==zt||Ut.morphTargets!==Dt||Ut.morphNormals!==Zt||Ut.morphColors!==ae||Ut.toneMapping!==ye||Ut.morphTargetsCount!==ce)&&(Qt=!0):(Qt=!0,Ut.__version=H.version);let en=Ut.currentProgram;Qt===!0&&(en=pr(H,k,F));let qi=!1,nn=!1,Ds=!1;const ve=en.getUniforms(),cn=Ut.uniforms;if(gt.useProgram(en.program)&&(qi=!0,nn=!0,Ds=!0),H.id!==M&&(M=H.id,nn=!0),qi||w!==S){gt.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ve.setValue(P,"projectionMatrix",S.projectionMatrix),ve.setValue(P,"viewMatrix",S.matrixWorldInverse);const Ze=ve.map.cameraPosition;Ze!==void 0&&Ze.setValue(P,vt.setFromMatrixPosition(S.matrixWorld)),Tt.logarithmicDepthBuffer&&ve.setValue(P,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ve.setValue(P,"isOrthographic",S.isOrthographicCamera===!0),w!==S&&(w=S,nn=!0,Ds=!0)}if(F.isSkinnedMesh){ve.setOptional(P,F,"bindMatrix"),ve.setOptional(P,F,"bindMatrixInverse");const qe=F.skeleton;qe&&(qe.boneTexture===null&&qe.computeBoneTexture(),ve.setValue(P,"boneTexture",qe.boneTexture,Gt))}F.isBatchedMesh&&(ve.setOptional(P,F,"batchingTexture"),ve.setValue(P,"batchingTexture",F._matricesTexture,Gt),ve.setOptional(P,F,"batchingIdTexture"),ve.setValue(P,"batchingIdTexture",F._indirectTexture,Gt),ve.setOptional(P,F,"batchingColorTexture"),F._colorsTexture!==null&&ve.setValue(P,"batchingColorTexture",F._colorsTexture,Gt));const hn=O.morphAttributes;if((hn.position!==void 0||hn.normal!==void 0||hn.color!==void 0)&&it.update(F,O,en),(nn||Ut.receiveShadow!==F.receiveShadow)&&(Ut.receiveShadow=F.receiveShadow,ve.setValue(P,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(cn.envMap.value=xt,cn.flipEnvMap.value=xt.isCubeTexture&&xt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&k.environment!==null&&(cn.envMapIntensity.value=k.environmentIntensity),nn&&(ve.setValue(P,"toneMappingExposure",v.toneMappingExposure),Ut.needsLights&&Su(cn,Ds),nt&&H.fog===!0&&Q.refreshFogUniforms(cn,nt),Q.refreshMaterialUniforms(cn,H,V,K,f.state.transmissionRenderTarget[S.id]),ra.upload(P,jl(Ut),cn,Gt)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(ra.upload(P,jl(Ut),cn,Gt),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ve.setValue(P,"center",F.center),ve.setValue(P,"modelViewMatrix",F.modelViewMatrix),ve.setValue(P,"normalMatrix",F.normalMatrix),ve.setValue(P,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const qe=H.uniformsGroups;for(let Ze=0,Pa=qe.length;Ze<Pa;Ze++){const gi=qe[Ze];Vt.update(gi,en),Vt.bind(gi,en)}}return en}function Su(S,k){S.ambientLightColor.needsUpdate=k,S.lightProbe.needsUpdate=k,S.directionalLights.needsUpdate=k,S.directionalLightShadows.needsUpdate=k,S.pointLights.needsUpdate=k,S.pointLightShadows.needsUpdate=k,S.spotLights.needsUpdate=k,S.spotLightShadows.needsUpdate=k,S.rectAreaLights.needsUpdate=k,S.hemisphereLights.needsUpdate=k}function Tu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(S,k,O){const H=wt.get(S);H.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),wt.get(S.texture).__webglTexture=k,wt.get(S.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:O,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,k){const O=wt.get(S);O.__webglFramebuffer=k,O.__useDefaultFramebuffer=k===void 0};const Eu=P.createFramebuffer();this.setRenderTarget=function(S,k=0,O=0){D=S,C=k,I=O;let H=!0,F=null,nt=!1,dt=!1;if(S){const xt=wt.get(S);if(xt.__useDefaultFramebuffer!==void 0)gt.bindFramebuffer(P.FRAMEBUFFER,null),H=!1;else if(xt.__webglFramebuffer===void 0)Gt.setupRenderTarget(S);else if(xt.__hasExternalTextures)Gt.rebindTextures(S,wt.get(S.texture).__webglTexture,wt.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Dt=S.depthTexture;if(xt.__boundDepthTexture!==Dt){if(Dt!==null&&wt.has(Dt)&&(S.width!==Dt.image.width||S.height!==Dt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Gt.setupDepthRenderbuffer(S)}}const kt=S.texture;(kt.isData3DTexture||kt.isDataArrayTexture||kt.isCompressedArrayTexture)&&(dt=!0);const zt=wt.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(zt[k])?F=zt[k][O]:F=zt[k],nt=!0):S.samples>0&&Gt.useMultisampledRTT(S)===!1?F=wt.get(S).__webglMultisampledFramebuffer:Array.isArray(zt)?F=zt[O]:F=zt,L.copy(S.viewport),N.copy(S.scissor),B=S.scissorTest}else L.copy(mt).multiplyScalar(V).floor(),N.copy(Bt).multiplyScalar(V).floor(),B=Jt;if(O!==0&&(F=Eu),gt.bindFramebuffer(P.FRAMEBUFFER,F)&&H&&gt.drawBuffers(S,F),gt.viewport(L),gt.scissor(N),gt.setScissorTest(B),nt){const xt=wt.get(S.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+k,xt.__webglTexture,O)}else if(dt){const xt=k;for(let kt=0;kt<S.textures.length;kt++){const zt=wt.get(S.textures[kt]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+kt,zt.__webglTexture,O,xt)}}else if(S!==null&&O!==0){const xt=wt.get(S.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,xt.__webglTexture,O)}M=-1},this.readRenderTargetPixels=function(S,k,O,H,F,nt,dt,St=0){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xt=wt.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&dt!==void 0&&(xt=xt[dt]),xt){gt.bindFramebuffer(P.FRAMEBUFFER,xt);try{const kt=S.textures[St],zt=kt.format,Dt=kt.type;if(!Tt.textureFormatReadable(zt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Tt.textureTypeReadable(Dt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=S.width-H&&O>=0&&O<=S.height-F&&(S.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+St),P.readPixels(k,O,H,F,It.convert(zt),It.convert(Dt),nt))}finally{const kt=D!==null?wt.get(D).__webglFramebuffer:null;gt.bindFramebuffer(P.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(S,k,O,H,F,nt,dt,St=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xt=wt.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&dt!==void 0&&(xt=xt[dt]),xt)if(k>=0&&k<=S.width-H&&O>=0&&O<=S.height-F){gt.bindFramebuffer(P.FRAMEBUFFER,xt);const kt=S.textures[St],zt=kt.format,Dt=kt.type;if(!Tt.textureFormatReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Tt.textureTypeReadable(Dt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Zt=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Zt),P.bufferData(P.PIXEL_PACK_BUFFER,nt.byteLength,P.STREAM_READ),S.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+St),P.readPixels(k,O,H,F,It.convert(zt),It.convert(Dt),0);const ae=D!==null?wt.get(D).__webglFramebuffer:null;gt.bindFramebuffer(P.FRAMEBUFFER,ae);const ye=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Id(P,ye,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Zt),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,nt),P.deleteBuffer(Zt),P.deleteSync(ye),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,k=null,O=0){const H=Math.pow(2,-O),F=Math.floor(S.image.width*H),nt=Math.floor(S.image.height*H),dt=k!==null?k.x:0,St=k!==null?k.y:0;Gt.setTexture2D(S,0),P.copyTexSubImage2D(P.TEXTURE_2D,O,0,0,dt,St,F,nt),gt.unbindTexture()};const Au=P.createFramebuffer(),Cu=P.createFramebuffer();this.copyTextureToTexture=function(S,k,O=null,H=null,F=0,nt=null){nt===null&&(F!==0?(ar("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),nt=F,F=0):nt=0);let dt,St,xt,kt,zt,Dt,Zt,ae,ye;const me=S.isCompressedTexture?S.mipmaps[nt]:S.image;if(O!==null)dt=O.max.x-O.min.x,St=O.max.y-O.min.y,xt=O.isBox3?O.max.z-O.min.z:1,kt=O.min.x,zt=O.min.y,Dt=O.isBox3?O.min.z:0;else{const hn=Math.pow(2,-F);dt=Math.floor(me.width*hn),St=Math.floor(me.height*hn),S.isDataArrayTexture?xt=me.depth:S.isData3DTexture?xt=Math.floor(me.depth*hn):xt=1,kt=0,zt=0,Dt=0}H!==null?(Zt=H.x,ae=H.y,ye=H.z):(Zt=0,ae=0,ye=0);const ce=It.convert(k.format),Ut=It.convert(k.type);let xe;k.isData3DTexture?(Gt.setTexture3D(k,0),xe=P.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(Gt.setTexture2DArray(k,0),xe=P.TEXTURE_2D_ARRAY):(Gt.setTexture2D(k,0),xe=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const Qt=P.getParameter(P.UNPACK_ROW_LENGTH),en=P.getParameter(P.UNPACK_IMAGE_HEIGHT),qi=P.getParameter(P.UNPACK_SKIP_PIXELS),nn=P.getParameter(P.UNPACK_SKIP_ROWS),Ds=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,me.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,me.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,kt),P.pixelStorei(P.UNPACK_SKIP_ROWS,zt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Dt);const ve=S.isDataArrayTexture||S.isData3DTexture,cn=k.isDataArrayTexture||k.isData3DTexture;if(S.isDepthTexture){const hn=wt.get(S),qe=wt.get(k),Ze=wt.get(hn.__renderTarget),Pa=wt.get(qe.__renderTarget);gt.bindFramebuffer(P.READ_FRAMEBUFFER,Ze.__webglFramebuffer),gt.bindFramebuffer(P.DRAW_FRAMEBUFFER,Pa.__webglFramebuffer);for(let gi=0;gi<xt;gi++)ve&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,wt.get(S).__webglTexture,F,Dt+gi),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,wt.get(k).__webglTexture,nt,ye+gi)),P.blitFramebuffer(kt,zt,dt,St,Zt,ae,dt,St,P.DEPTH_BUFFER_BIT,P.NEAREST);gt.bindFramebuffer(P.READ_FRAMEBUFFER,null),gt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(F!==0||S.isRenderTargetTexture||wt.has(S)){const hn=wt.get(S),qe=wt.get(k);gt.bindFramebuffer(P.READ_FRAMEBUFFER,Au),gt.bindFramebuffer(P.DRAW_FRAMEBUFFER,Cu);for(let Ze=0;Ze<xt;Ze++)ve?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,hn.__webglTexture,F,Dt+Ze):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,hn.__webglTexture,F),cn?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,qe.__webglTexture,nt,ye+Ze):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,qe.__webglTexture,nt),F!==0?P.blitFramebuffer(kt,zt,dt,St,Zt,ae,dt,St,P.COLOR_BUFFER_BIT,P.NEAREST):cn?P.copyTexSubImage3D(xe,nt,Zt,ae,ye+Ze,kt,zt,dt,St):P.copyTexSubImage2D(xe,nt,Zt,ae,kt,zt,dt,St);gt.bindFramebuffer(P.READ_FRAMEBUFFER,null),gt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else cn?S.isDataTexture||S.isData3DTexture?P.texSubImage3D(xe,nt,Zt,ae,ye,dt,St,xt,ce,Ut,me.data):k.isCompressedArrayTexture?P.compressedTexSubImage3D(xe,nt,Zt,ae,ye,dt,St,xt,ce,me.data):P.texSubImage3D(xe,nt,Zt,ae,ye,dt,St,xt,ce,Ut,me):S.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,nt,Zt,ae,dt,St,ce,Ut,me.data):S.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,nt,Zt,ae,me.width,me.height,ce,me.data):P.texSubImage2D(P.TEXTURE_2D,nt,Zt,ae,dt,St,ce,Ut,me);P.pixelStorei(P.UNPACK_ROW_LENGTH,Qt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,en),P.pixelStorei(P.UNPACK_SKIP_PIXELS,qi),P.pixelStorei(P.UNPACK_SKIP_ROWS,nn),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ds),nt===0&&k.generateMipmaps&&P.generateMipmap(xe),gt.unbindTexture()},this.initRenderTarget=function(S){wt.get(S).__webglFramebuffer===void 0&&Gt.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Gt.setTextureCube(S,0):S.isData3DTexture?Gt.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Gt.setTexture2DArray(S,0):Gt.setTexture2D(S,0),gt.unbindTexture()},this.resetState=function(){C=0,I=0,D=null,gt.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Un}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=te._getDrawingBufferColorSpace(t),e.unpackColorSpace=te._getUnpackColorSpace()}}function gn(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new ue;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in u.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(u.attributes[p]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in u.morphAttributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[p]===void 0&&(a[p]=[]),a[p].push(u.morphAttributes[p])}if(t){let p;if(e)p=u.index.count;else if(u.attributes.position!==void 0)p=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,h),c+=p}}if(e){let h=0;const u=[];for(let d=0;d<s.length;++d){const p=s[d].index;for(let g=0;g<p.count;++g)u.push(p.getX(g)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(const h in r){const u=lh(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){const p=[];for(let x=0;x<a[h].length;++x)p.push(a[h][x][d]);const g=lh(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function lh(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const a=new t(r),o=new we(a,e,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let d=0,p=h.count;d<p;d++)for(let g=0;g<e;g++){const x=h.getComponent(d,g);o.setComponent(d+u,g,x)}}else a.set(h.array,l);l+=h.count*e}return i!==void 0&&(o.gpuType=i),o}const Qe=(s,t,e)=>Math.max(t,Math.min(e,s)),tr=(s,t,e)=>s+(t-s)*e,Fe=(s,t,e)=>{const n=Qe((e-s)/(t-s),0,1);return n*n*(3-2*n)},qr=(s,t,e,n)=>tr(s,t,1-Math.exp(-e*n)),po=Math.PI*2;function dx(s){let t=s>>>0;return function(){t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function fl(s=1337){const t=dx(s);return{next:t,range:(e,n)=>e+t()*(n-e),int:(e,n)=>Math.floor(e+t()*(n-e+1)),pick:e=>e[Math.floor(t()*e.length)],chance:e=>t()<e,sign:()=>t()<.5?-1:1}}function Xr(s,t,e){let n=Math.imul(s|0,374761393)+Math.imul(t|0,668265263)+Math.imul(e|0,2147483647);return n=(n^n>>>13)*1274126177,((n^n>>>16)>>>0)/4294967296}function au(s,t,e=0){const n=Math.floor(s),i=Math.floor(t),r=s-n,a=t-i,o=r*r*(3-2*r),l=a*a*(3-2*a),c=Xr(n,i,e),h=Xr(n+1,i,e),u=Xr(n,i+1,e),d=Xr(n+1,i+1,e);return tr(tr(c,h,o),tr(u,d,o),l)}function Ws(s,t,e=0,n=4,i=2.03,r=.5){let a=1,o=1,l=0,c=0;for(let h=0;h<n;h++)l+=a*au(s*o,t*o,e+h*131),c+=a,a*=r,o*=i;return l/c}function ch(s,t,e=0,n=4){let i=1,r=1,a=0,o=0;for(let l=0;l<n;l++){const c=1-Math.abs(au(s*r,t*r,e+l*57)*2-1);a+=i*c*c,o+=i,i*=.52,r*=2.07}return a/o}function Hl(s,t){let e=(t-s)%po;return e>Math.PI&&(e-=po),e<-Math.PI&&(e+=po),e}function fx(s){const t=Math.floor(s)%24,e=Math.floor((s-Math.floor(s))*60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`}function px(s,t,e,n){return Math.hypot(s-e,t-n)}const hh={sword:'<path d="M14.5 3.5 20 9l-8.5 8.5-2-2L18 7l-3.5-3.5Z"/><path d="m9.5 13.5 1 1-4 4-2-2 4-4Z"/><path d="M4 20l2-2M3 17l4 4"/>',axe:'<path d="M14 4c3 0 6 2 7 5-2 2-5 3-8 2l-2-2c1-3 1-4 3-5Z"/><path d="M12 9 4 20"/><path d="m6 17 3 3"/>',claws:'<path d="M5 4c-1 5 0 9 3 12M10 3c-1 6 0 10 3 14M15 3c-1 6 0 11 3 15"/><path d="M4 20c3 1 6 1 9 0"/>',bow:'<path d="M6 4c8 2 12 8 12 16M6 4l-2 2m14 14 2-2"/><path d="M4 20 20 4"/><path d="m17 4 3 3-3 1-1-1 1-3Z"/>',shield:'<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="M9 12h6M12 9v6"/>',armor:'<path d="M8 4 5 6l-1 6 3 1v7h10v-7l3-1-1-6-3-2-4 2-4-2Z"/><path d="M8 4c0 3 1 5 4 5s4-2 4-5"/>',potion:'<path d="M9 3h6M10 3v5l-4 8a3 3 0 0 0 3 4h6a3 3 0 0 0 3-4l-4-8V3"/><path d="M7 15h10"/>',food:'<path d="M15 4c3 0 5 2 5 5 0 2-1 3-2 4l-1 1v6h-3v-6l-2-1c-3-1-5-3-5-6 0-2 2-3 4-2 1 1 2 1 3 0 .3-.6.6-1 1-1Z"/><path d="M5 19h6"/>',gold:'<circle cx="12" cy="12" r="8"/><path d="M9 12h6M12 9v6"/>',relic:'<path d="m12 3 5 5-5 13L7 8l5-5Z"/><path d="m7 8 10 0M12 3v13"/>',quest:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',herb:'<path d="M12 21V9"/><path d="M12 13C7 13 5 10 5 5c5 0 7 3 7 8ZM12 10c0-4 2-6 7-6 0 5-3 7-7 6Z"/>',fish:'<path d="M3 12c4-5 9-5 12 0-3 5-8 5-12 0Z"/><path d="m15 12 6-4v8l-6-4Z"/><circle cx="7" cy="11" r=".6" fill="currentColor"/>',ring:'<circle cx="12" cy="14" r="5"/><path d="m9 6 3-3 3 3-3 3-3-3Z"/>',arrow:'<path d="M4 20 20 4M14 4h6v6"/><path d="m4 16 4 4"/>',torch:'<path d="M12 3c3 3 4 5 2 7-1 1-3 1-4 0-2-2 0-5 2-7Z"/><path d="M10 11h4l1 10H9l1-10Z"/>',key:'<circle cx="8" cy="8" r="4"/><path d="m11 11 8 8M16 16l2-2M18 18l2-2"/>',book:'<path d="M4 4h7c1 0 2 1 2 2v14c0-1-1-2-2-2H4V4ZM20 4h-5c-1 0-2 1-2 2v14c0-1 1-2 2-2h5V4Z"/>',fire:'<path d="M12 3c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10Z"/><path d="M12 12c2 2 2 3 1 5-1 1-3 0-3-2 0-1 1-2 2-3Z"/>',bolt:'<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>',heal:'<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/><path d="M12 9v6M9 12h6"/>',ice:'<path d="M12 2v20M3 7l18 10M21 7 3 17"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4M20 14l-4-1 1 4M20 10l-4 1 1-4M4 14l4-1-1 4"/>',bag:'<path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 12h6"/>',map:'<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v14M15 6v14"/>',star:'<path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z"/>',skull:'<path d="M5 11a7 7 0 0 1 14 0c0 3-1 4-2 5v3H7v-3c-1-1-2-2-2-5Z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/><path d="M10 17h4M10 20v-3M14 20v-3"/>',paw:'<circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M12 11c3 0 5 3 4 6-1 3-3 2-4 2s-3 1-4-2c-1-3 1-6 4-6Z"/>',meow:'<path d="M5 5v9c0 3 3 5 7 5s7-2 7-5V5l-4 3H9L5 5Z"/><path d="M9 12h.01M15 12h.01M10 16c1 .7 3 .7 4 0"/>',heart:'<path d="M12 20S4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/>',snow:'<path d="M12 2v20M3 7l18 10M21 7 3 17"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',moon:'<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',chevron:'<path d="m9 6 6 6-6 6"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',sleep:'<path d="M4 6h8l-8 9h8M15 12h6l-6 6h6"/>',crown:'<path d="m3 8 5 4 4-7 4 7 5-4-2 12H5L3 8Z"/><path d="M6 20h12"/>',hand:'<path d="M8 12V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v8M16 12V7a2 2 0 0 1 4 0v7c0 4-3 7-7 7h-1c-2 0-4-1-5-3l-3-5a2 2 0 0 1 3-2l3 2"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',flask:'<path d="M9 3h6M10 3v6L4 20h16L14 9V3"/><path d="M7 15h10"/>',gem:'<path d="M6 3h12l3 6-9 12L3 9l3-6Z"/><path d="M3 9h18M9 3l3 6 3-6M12 9v12"/>',scroll:'<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z"/><path d="M6 4a2 2 0 0 0-2 2v2h3M10 9h6M10 13h6"/>',eye:'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',bell:'<path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Z"/><path d="M10 20h4"/>',fishbone:'<path d="M4 12h13M17 12l3-3v6l-3-3Z"/><path d="M7 9v6M10 8v8M13 9v6"/>',snowflake:'<path d="M12 2v20M4 6l16 12M20 6 4 18"/>'},oi=(s,t="")=>`<svg class="${t}" viewBox="0 0 24 24" aria-hidden="true">${hh[s]||hh.gem}</svg>`,or=[{id:"longhair",name:"Whiskerford Longhair",scale:1.08,fluff:1.35,tufts:!0,muzzle:.95,tail:1.2,blurb:"Bred for draughty castles and dramatic entrances."},{id:"ashpoint",name:"Ashpoint",scale:.96,fluff:.7,tufts:!1,muzzle:1.1,tail:1,darkPoints:!0,blurb:"Elegant, vocal, and convinced the prophecy is about them."},{id:"tabby",name:"Cobble Tabby",scale:1,fluff:.95,tufts:!1,muzzle:1,tail:1,stripes:!0,blurb:"Sturdy alley royalty with a map of the city in their fur."},{id:"sootpaw",name:"Sootpaw",scale:.98,fluff:.85,tufts:!1,muzzle:.95,tail:1.05,blurb:"Sneaks through chimneys. Has opinions about doors."},{id:"calico",name:"Ember Calico",scale:.94,fluff:1,tufts:!1,muzzle:1,tail:1,patches:!0,blurb:"Three colours, nine lives, zero patience."},{id:"snowshoe",name:"Snowshoe",scale:1.02,fluff:1.1,tufts:!1,muzzle:1.05,tail:1.05,socks:!0,blurb:"Born with snow between their toes and a secret in each ear."},{id:"ginger",name:"Ginger Scrapper",scale:1.04,fluff:.9,tufts:!1,muzzle:1,tail:1,stripes:!0,blurb:"One brain cell, used exclusively for combat."},{id:"chinchilla",name:"Silver Chinchilla",scale:.92,fluff:1.25,tufts:!0,muzzle:.9,tail:1.15,blurb:"A cloud that learned to hiss. Distantly related to the moon."}],Bi=[{id:"ember",name:"Ember",base:"#a8643a",hi:"#d99a63",dark:"#5b321c"},{id:"smoke",name:"Smoke",base:"#6f7277",hi:"#a9adb2",dark:"#3c3e42"},{id:"snow",name:"Snow",base:"#d8d5ca",hi:"#f5f1e6",dark:"#a39e91"},{id:"ink",name:"Ink",base:"#2e3038",hi:"#525764",dark:"#141519"},{id:"ginger",name:"Ginger",base:"#c2763f",hi:"#e8a96c",dark:"#7c3f1c"},{id:"moss",name:"Moss",base:"#777b5e",hi:"#a8ab86",dark:"#464a35"},{id:"frost",name:"Frost",base:"#8fa5ad",hi:"#c2d4d9",dark:"#5d7279"},{id:"dusk",name:"Dusk",base:"#675a71",hi:"#998aa3",dark:"#3b3144"}],Oi=[{id:"amber",name:"Amber",color:"#e0b34f"},{id:"jade",name:"Jade",color:"#78c09b"},{id:"ice",name:"Ice",color:"#84c6e8"},{id:"copper",name:"Copper",color:"#cf8a5c"},{id:"violet",name:"Violet",color:"#b08ad8"},{id:"moon",name:"Moon",color:"#e8edf2"}],Ui={wayfarer:{id:"wayfarer",name:"Wayfarer",title:"The Tenth",blurb:"Balanced in blade and bow. A little of everything, like a cat with nine hobbies.",health:110,stamina:105,mana:85,damage:1,magic:1,items:["rustySword","huntingBow","leatherArmor","healthPotion","healthPotion","bread"],equip:{weapon:"rustySword",armor:"leatherArmor",bow:"huntingBow"}},pyrewitch:{id:"pyrewitch",name:"Pyrewitch",title:"Keeper of the Hearth-Spark",blurb:"Fire first, questions later. The robe is singed for a reason.",health:85,stamina:90,mana:135,damage:.85,magic:1.35,items:["oakStaff","mageRobe","healthPotion","manaPotion","manaPotion","bread"],equip:{weapon:"oakStaff",armor:"mageRobe"}},prowler:{id:"prowler",name:"Prowler",title:"Whisker in the Snow",blurb:"Why fight a bear when you can outrun it, then steal its fish?",health:95,stamina:135,mana:75,damage:1.05,magic:.9,items:["huntingBow","clawWraps","leatherArmor","healthPotion","fish","fish"],equip:{weapon:"clawWraps",armor:"leatherArmor",bow:"huntingBow"}}},he={gold:{name:"Gold",type:"gold",icon:"gold",value:1,desc:"Cold, heavy, and universally admired."},rustySword:{name:"Rusty Whiskerblade",type:"weapon",icon:"sword",dmg:8,speed:1,value:18,rarity:"common",desc:"It has killed at least one very unlucky fish."},guardSaber:{name:"Guard's Saber",type:"weapon",icon:"sword",dmg:14,speed:1.05,value:90,rarity:"common",desc:"Standard issue. The tassel is decorative and deeply serious."},frostAxe:{name:"Frostfang Axe",type:"weapon",icon:"axe",dmg:22,speed:.82,effect:"ice",value:240,rarity:"epic",desc:"The haft is warm. The blade is not. Do not lick it."},oathBlade:{name:"Oath of Nine Bells",type:"weapon",icon:"sword",dmg:26,speed:1.1,effect:"holy",value:520,rarity:"epic",desc:"Forged from the ninth bell. It rings only when struck."},oakStaff:{name:"Oakheart Staff",type:"weapon",icon:"torch",dmg:7,magic:12,speed:.95,value:70,rarity:"common",desc:"A walking stick that has learned one trick."},clawWraps:{name:"Claw Wraps",type:"weapon",icon:"claws",dmg:10,speed:1.25,unarmed:!0,value:45,rarity:"common",desc:"Leather strips for a cat who believes in the classics."},huntingBow:{name:"Hunting Bow",type:"bow",icon:"bow",dmg:12,value:60,rarity:"common",desc:"String made from a very tense cat. Metaphorically."},moonBow:{name:"Moonwhisker Bow",type:"bow",icon:"bow",dmg:21,value:280,rarity:"epic",desc:"Draws moonlight. Do not dry-fire it at the moon; it is rude."},leatherArmor:{name:"Snow-Leather Coat",type:"armor",icon:"armor",armor:4,value:50,rarity:"common",desc:"Smells faintly of wet cat and adventure."},ironArmor:{name:"Watchplate Harness",type:"armor",icon:"armor",armor:9,value:160,rarity:"common",desc:"City-watch issue. Comfortable if you are shaped like a barrel."},mageRobe:{name:"Hearth-Spark Robe",type:"armor",icon:"armor",armor:3,magic:18,value:140,rarity:"rare",desc:"The singe marks are a feature. Probably."},wardenArmor:{name:"Frostwarden Plate",type:"armor",icon:"armor",armor:16,magic:10,value:420,rarity:"epic",desc:"Worn by those who guard the barrow. Mostly they guard it from visitors."},emberAmulet:{name:"Ember Charm",type:"trinket",icon:"gem",magic:12,value:180,rarity:"rare",desc:"A coal that refuses to go out. Sentimental."},nineBell:{name:"Ninth Bell",type:"trinket",icon:"bell",armor:3,magic:10,value:0,rarity:"quest",quest:!0,desc:"One of the nine bells of Whiskerhold. It is not supposed to be here."},healthPotion:{name:"Warm Milk Potion",type:"potion",icon:"potion",heal:38,value:22,stack:9,rarity:"common",desc:"Restores 38 health. Tastes like being small and safe."},manaPotion:{name:"Moonwater Flask",type:"potion",icon:"potion",mana:42,value:26,stack:9,rarity:"common",desc:"Restores 42 mana. Bottled under a very patient moon."},staminaPotion:{name:"Brisk Tonic",type:"potion",icon:"potion",stamina:50,value:18,stack:9,rarity:"common",desc:"Restores 50 stamina. Made from nettles and spite."},fish:{name:"River Trout",type:"food",icon:"fish",heal:10,value:6,stack:9,rarity:"common",desc:"A fish. The kingdom runs on them."},bread:{name:"Hearth Loaf",type:"food",icon:"food",heal:14,value:5,stack:9,rarity:"common",desc:"Still warm. Someone is missing it."},cheese:{name:"Wedge of Nine-Cheese",type:"food",icon:"food",heal:20,value:9,stack:9,rarity:"common",desc:"Aged nine years. Nine is a theme here."},stew:{name:"Barrow Stew",type:"food",icon:"food",heal:34,stamina:20,value:16,stack:9,rarity:"common",desc:"Hearty, mysterious, and best not investigated."},locket:{name:"Mittens' Locket",type:"quest",icon:"ring",value:0,rarity:"quest",quest:!0,desc:"A tiny silver locket with a portrait of a fish. Of course."},lute:{name:"Bramble's Lute",type:"quest",icon:"music",value:0,rarity:"quest",quest:!0,desc:"Battered, beloved, and missing one string named Gerald."},riverFish:{name:"River Fish (Quest)",type:"quest",icon:"fish",value:0,rarity:"quest",quest:!0,desc:"Fresh enough to be smug about it."},dreamHerb:{name:"Dreamherb",type:"quest",icon:"herb",value:0,rarity:"quest",quest:!0,desc:"Smells like sleep. Do not eat the whole bunch."},emberRelic:{name:"The First Ember",type:"quest",icon:"gem",value:0,rarity:"quest",quest:!0,desc:"The first warmth the Nine ever stole from the dark. It is still angry."},silverBell:{name:"The Silver Bell",type:"quest",icon:"bell",value:0,rarity:"quest",quest:!0,desc:"The bell that woke the kingdom. It has been trying to apologise ever since."},banditOrders:{name:"Muddy Orders",type:"quest",icon:"scroll",value:0,rarity:"quest",quest:!0,desc:"Instructions in bad handwriting: “Dig where the snow does not melt.”"},frostKey:{name:"Rimewrought Key",type:"quest",icon:"key",value:0,rarity:"quest",quest:!0,desc:"Cold enough to stick to your tongue. Do not test this."}},ou={fireball:{id:"fireball",name:"Ember",cost:18,cooldown:1.2,damage:34,icon:"fire",color:"#ff8b3d",desc:"Hurl a ball of hearth-fire. Excellent at parties, banned in barns."},lightning:{id:"lightning",name:"Fulmin",cost:24,cooldown:2,damage:44,icon:"bolt",color:"#9fd8ff",desc:"Call down a bolt of sky-anger. Chain hits the nearest second target."},heal:{id:"heal",name:"Mend",cost:26,cooldown:4,damage:0,heal:38,icon:"heal",color:"#8ee39b",desc:"Knit flesh and fur with warm light. Does not fix emotional damage."},ice:{id:"ice",name:"Frost",cost:16,cooldown:1.6,damage:22,icon:"ice",color:"#8fd9ff",slow:2.5,desc:"A shard of the old winter. Slows what it does not stop."}},pl=[{id:"blade",name:"Bladecraft",icon:"sword",max:5,desc:"+3 melee damage per rank.",tree:"Hunter"},{id:"claws",name:"Claws of the Tenth",icon:"claws",max:5,desc:"+3 unarmed damage and +4% attack speed per rank.",tree:"Hunter"},{id:"archery",name:"Truewhisker",icon:"bow",max:5,desc:"+4 bow damage per rank.",tree:"Hunter"},{id:"vitality",name:"Nine Lives",icon:"heart",max:5,desc:"+16 maximum health per rank.",tree:"Hunter"},{id:"destruction",name:"Hearth-Spark",icon:"fire",max:5,desc:"+12% spell damage per rank.",tree:"Spell"},{id:"restoration",name:"Warm Milk",icon:"heal",max:5,desc:"+20% healing per rank.",tree:"Spell"},{id:"attunement",name:"Moonwell",icon:"moon",max:5,desc:"+16 maximum mana per rank.",tree:"Spell"},{id:"endurance",name:"Snowstride",icon:"snow",max:5,desc:"+16 maximum stamina per rank.",tree:"Way"},{id:"fortune",name:"Knock It Off The Ledge",icon:"paw",max:5,desc:"+15% gold and loot luck per rank.",tree:"Way"},{id:"prowl",name:"Prowl",icon:"eye",max:5,desc:"+12% damage from behind per rank. Guards will still see you.",tree:"Way"}],lu=[{id:"main1",title:"A Cold Welcome",type:"main",giver:"elder",summary:"Something has gone wrong beneath the snow, and Elder Whiskerby thinks you are the wrong cat for the job. That has never stopped anyone.",desc:"Whiskerby says the Shrine of the Nine has been restless since the first snow. A seer named Mothwhisker has been waiting for a cat with a tenth life. You have a suspiciously tenth-life-shaped feeling.",stages:[{text:"Speak with Seer Mothwhisker at the Shrine of the Nine",event:"talk",target:"seer",marker:"shrine"}],reward:{xp:140,gold:35,items:["healthPotion","manaPotion"]},next:"main2"},{id:"main2",title:"The First Ember",type:"main",giver:"seer",summary:"The Hollow are waking in the old barrows. Recover the First Ember before they remember how to burn.",desc:"The First Ember was the warmth the Nine took from the dark and taught to cats. It was buried in Sunken Pawbarrow when the seal was made. The Hollow have found the door. They have not found the key — you are the key.",stages:[{text:"Enter Sunken Pawbarrow",event:"reach",target:"pawbarrow",marker:"pawbarrow"},{text:"Recover the First Ember",event:"collect",target:"emberRelic",count:1,marker:"pawbarrow"},{text:"Return to Seer Mothwhisker",event:"talk",target:"seer",marker:"shrine"}],reward:{xp:260,gold:60,items:["emberAmulet","healthPotion","healthPotion"]},next:"main3"},{id:"main3",title:"Two Good Paws",type:"main",giver:"seer",summary:"A bard with more courage than sense and a mage with more sense than courage. The prophecy requires both.",desc:"Mothwhisker says the Tenth cannot reach Frostfang alone. Bramble, a bard of the Leaky Whisker, has been singing about you for weeks (badly). Soot, a young mage in Frostpelt, has been dreaming of the barrow. Recruit them both.",stages:[{text:"Recruit Bramble at the Leaky Whisker",event:"recruit",target:"bramble",marker:"bramble"},{text:"Recruit Soot in Frostpelt",event:"recruit",target:"soot",marker:"soot"},{text:"Return to Seer Mothwhisker",event:"talk",target:"seer",marker:"shrine"}],reward:{xp:320,gold:80,items:["manaPotion","healthPotion","stew"]},next:"main4"},{id:"main4",title:"The Silver Bell",type:"main",giver:"seer",summary:"The bell that woke the dark is buried in Cinderdeep. Something else has been sleeping on it.",desc:"Long ago, the Ninth Bell was rung to seal the Empty Bowl. Its echo became the Silver Bell, hidden in Cinderdeep Mine. Marrowmaw, an old hunger in a cat-shaped coat, guards it. The Hollow are already digging.",stages:[{text:"Enter Cinderdeep Mine",event:"reach",target:"cinderdeep",marker:"cinderdeep"},{text:"Defeat Marrowmaw",event:"kill",target:"marrowmaw",count:1,marker:"cinderdeep"},{text:"Take the Silver Bell",event:"collect",target:"silverBell",count:1,marker:"cinderdeep"},{text:"Return to Seer Mothwhisker",event:"talk",target:"seer",marker:"shrine"}],reward:{xp:480,gold:120,items:["oathBlade","wardenArmor","healthPotion","healthPotion"]},next:"main5"},{id:"main5",title:"The Frostfang Pact",type:"main",giver:"seer",summary:"Under Frostfang, the Empty Bowl is awake. It has been very patient. It is done being patient.",desc:"With the Ember and the Bell, the way into Frostfang Barrow is open. Vaelmaw — the Empty Bowl, the Gnawing Dark, the thing the Nine could not kill — is rising. Bring your companions. Bring your claws. Bring a snack.",stages:[{text:"Enter Frostfang Barrow",event:"reach",target:"frostfang",marker:"frostfang"},{text:"Defeat Vaelmaw, the Empty Bowl",event:"kill",target:"vaelmaw",count:1,marker:"frostfang"}],reward:{xp:1e3,gold:500,items:["nineBell"]}},{id:"rats",title:"Pesky, Peskier, Peskiest",type:"side",giver:"farmer",summary:"Frost rats are eating the turnips. The turnips are eating the fence. One problem at a time.",desc:"Pelt-Pincher Nibs has a rat problem. The rats have a Nibs problem. Only one side can win, and the turnips are neutral.",stages:[{text:"Kill frost rats around Hearthwhisker (0/5)",event:"kill",target:"frostRat",count:5,marker:"hearthwhisker"},{text:"Return to Pelt-Pincher Nibs",event:"talk",target:"farmer",marker:"farmer"}],reward:{xp:160,gold:55,items:["cheese","healthPotion"]}},{id:"locket",title:"The Fish In The Locket",type:"side",giver:"mittens",summary:"Mittens dropped her locket in the old barrow. Inside is a portrait of a fish. She would like it back before the fish gets ideas.",desc:"A tiny silver locket, lost in Sunken Pawbarrow. Mittens claims it is an heirloom. The fish in the portrait has been described as “a handsome devil.”",stages:[{text:"Find the locket in Sunken Pawbarrow",event:"collect",target:"locket",count:1,marker:"pawbarrow"},{text:"Return the locket to Mittens",event:"talk",target:"mittens",marker:"mittens"}],reward:{xp:140,gold:45,items:["healthPotion","fish"]}},{id:"lute",title:"The Missing String",type:"side",giver:"bramble",summary:"Bramble's lute was stolen by bandits. Without it, his ballads are just aggressively rhythmic breathing.",desc:"The bandits at Scarwood Camp took Bramble's lute. He says it is priceless. They say it is worth eleven gold and a half-eaten cheese.",stages:[{text:"Recover the lute from Scarwood Camp",event:"collect",target:"lute",count:1,marker:"banditcamp"},{text:"Return the lute to Bramble",event:"talk",target:"bramble",marker:"bramble"}],reward:{xp:180,gold:60,items:["manaPotion","bread"]}},{id:"fish",title:"Three Fish, One Pot",type:"side",giver:"cook",summary:"Cook Barley needs three river fish for the Nine Bells Feast. The river has fish. The fish have opinions.",desc:"The Leaky Whisker is preparing a feast. Barley needs three river fish. Fishing spots along the river and lake will provide. The fish are not consulted.",stages:[{text:"Catch river fish (0/3)",event:"collect",target:"riverFish",count:3,marker:"pawsmouth"},{text:"Deliver the fish to Cook Barley",event:"talk",target:"cook",marker:"cook"}],reward:{xp:120,gold:50,items:["stew","stew","healthPotion"]}},{id:"bandits",title:"Scarwood Trouble",type:"side",giver:"captain",summary:"Bandits are robbing travellers on the north road. The Watch would go, but it is nearly lunch.",desc:"Captain Sable wants the Scarwood bandits thinned out. Four will do. The Watch will handle the paperwork, the funerals, and the group photograph.",stages:[{text:"Defeat Scarwood bandits (0/4)",event:"kill",target:"bandit",count:4,marker:"banditcamp"},{text:"Report to Captain Sable",event:"talk",target:"captain",marker:"captain"}],reward:{xp:220,gold:90,items:["guardSaber","healthPotion"]}},{id:"herb",title:"A Cure For Dreaming",type:"side",giver:"nettle",summary:"The apothecary needs dreamherb from the Whispering Cave. The cave is full of whispers. The herb is full of dreams.",desc:"Nettle of Frostpelt cannot sleep. Dreamherb grows in the Whispering Cave, where the Hollow have been seen. She would fetch it herself, but she is very comfortable.",stages:[{text:"Find dreamherb in the Whispering Cave",event:"collect",target:"dreamHerb",count:1,marker:"whispercave"},{text:"Return to Nettle",event:"talk",target:"nettle",marker:"nettle"}],reward:{xp:180,gold:70,items:["manaPotion","manaPotion","manaPotion"]}}],He=Object.fromEntries(lu.map(s=>[s.id,s])),Sn={pawsmouth:{x:156,z:306,name:"Pawsmouth",sub:"A fishing village with more cats than fish",radius:80},shrine:{x:-40,z:170,name:"Shrine of the Nine",sub:"Nine stones, nine bells, one very tired seer",radius:44},whiskerhold:{x:-280,z:-160,name:"Whiskerhold",sub:"The nine-belled city",radius:115},highpaw:{x:238,z:-292,name:"Highpaw Keep",sub:"Seat of the Snow Queen, who is also a cat",radius:80},hearthwhisker:{x:-392,z:138,name:"Hearthwhisker",sub:"Turnips, tractors, and deeply suspicious geese",radius:70},frostpelt:{x:352,z:206,name:"Frostpelt",sub:"The last warm roofs before the peaks",radius:66},pawbarrow:{x:-360,z:-344,name:"Sunken Pawbarrow",sub:"A ruin that remembers being a temple",radius:55},cinderdeep:{x:392,z:-356,name:"Cinderdeep Mine",sub:"They dug too deep. They were cats; it was inevitable.",radius:50},frostfang:{x:-40,z:-590,name:"Frostfang Barrow",sub:"The door the Nine could not close",radius:55},banditcamp:{x:258,z:72,name:"Scarwood Camp",sub:"Bandits, badly drawn wanted posters",radius:40},whispercave:{x:-126,z:336,name:"Whispering Cave",sub:"It knows your name and is being smug about it",radius:38},leakywhisker:{x:-280,z:-160,name:"The Leaky Whisker",sub:"Warm beer, cold gossip",radius:20},ninegoods:{x:-280,z:-160,name:"Nine Lives Goods",sub:"Everything has a price, including the cat",radius:20},castlehall:{x:238,z:-292,name:"Highpaw Hall",sub:"A throne built for nine, occupied by one",radius:20}},qs=1400,Pi=1.15,mx=[{id:"pawsmouth",x:175,z:306,r:42,h:6.5},{id:"spawn",x:178,z:346,r:22,h:6.8},{id:"shrine",x:-40,z:170,r:38,h:13.5},{id:"whiskerhold",x:-280,z:-160,r:108,h:14},{id:"highpaw",x:238,z:-292,r:76,h:41},{id:"hearthwhisker",x:-392,z:138,r:62,h:8.5},{id:"frostpelt",x:352,z:206,r:56,h:21},{id:"pawbarrow",x:-360,z:-344,r:44,h:17},{id:"cinderdeep",x:392,z:-356,r:42,h:28},{id:"frostfang",x:-40,z:-590,r:46,h:44},{id:"banditcamp",x:258,z:72,r:34,h:14},{id:"whispercave",x:-126,z:336,r:28,h:12}];function aa(s){return 110*Math.sin(s*.0075)+45*Math.sin(s*.019+1.7)}class gx{constructor(t=91731){this.seed=t,this.half=qs/2,this.flats=mx}baseHeight(t,e){const n=this.seed;let i=7.5;i+=Ws(t*.0032+11,e*.0032-7,n,4)*16,i+=Ws(t*.011,e*.011,n+41,4)*4.2,i+=(Ws(t*.04,e*.04,n+9,2)-.5)*1.1;const r=Math.hypot(t,e)/this.half,a=Fe(.56,1.02,r);i+=a*(34+ch(t*.006+3,e*.006-2,n+21,5)*104),i+=Fe(.78,1,r)*ch(t*.018,e*.018,n+77,3)*26;const o=Math.hypot(t+300,e-300);i-=(1-Fe(62,155,o))*11;const l=aa(e),c=Math.abs(t-l);return i-=(1-Fe(3,30,c))*19,i-=(1-Fe(30,62,c))*2.4,i}heightAt(t,e){let n=this.baseHeight(t,e);for(const o of this.flats){const l=Math.hypot(t-o.x,e-o.z);if(l<o.r*1.7){const c=1-Fe(o.r*.62,o.r*1.55,l);n=tr(n,o.h,c*.94)}}const i=aa(e),r=Math.abs(t-i),a=1-Fe(4,26,r);if(a>.01){let o=0;for(const l of this.flats){const c=Math.hypot(t-l.x,e-l.z);c<l.r*1.35&&(o=Math.max(o,1-Fe(l.r*.8,l.r*1.35,c)))}n-=a*14*(1-o*.55)}return n}slopeAt(t,e){const i=this.heightAt(t+1.4,e)-this.heightAt(t-1.4,e),r=this.heightAt(t,e+1.4)-this.heightAt(t,e-1.4);return Math.hypot(i,r)/(1.4*2)}isWater(t,e){return this.heightAt(t,e)<Pi-.15}isNearLandmark(t,e,n=0){for(const i in Sn){const r=Sn[i];if(!(r.radius<30)&&Math.hypot(t-r.x,e-r.z)<r.radius*.82+n)return!0}for(const i of this.flats)if(Math.hypot(t-i.x,e-i.z)<i.r*.9+n)return!0;return!1}buildMesh(){const e=new zi(qs,qs,200,200);e.rotateX(-Math.PI/2);const n=e.attributes.position,i=new Float32Array(n.count*3),r=new Mt,a=new Mt("#e8eef2"),o=new Mt("#c8d8e2"),l=new Mt("#637057"),c=new Mt("#7a8262"),h=new Mt("#666d74"),u=new Mt("#4b535b"),d=new Mt("#776b57"),p=new Mt("#5c594c");for(let m=0;m<n.count;m++){const f=n.getX(m),_=n.getZ(m),y=this.heightAt(f,_);n.setY(m,y);const v=this.slopeAt(f,_),E=Ws(f*.055,_*.055,313,3),C=Ws(f*.014+5,_*.014,117,3),I=Qe(Fe(17,34,y)+Fe(.22,.52,v)*.7+(E-.5)*.4,0,1),D=Fe(38,80,y);r.copy(l).lerp(c,C),r.lerp(d,Fe(.3,.62,v)*.55),r.lerp(p,Fe(3.4,1,y)*.9),r.lerp(h,Fe(.42,.9,v)*.85),r.lerp(u,D*.6),r.lerp(o,I*.65),r.lerp(a,Qe(I*.9+D*.8,0,1));const M=Math.abs(f-aa(_)),w=(1-Fe(5,20,M))*(1-Fe(2,.5,y));r.lerp(d,w*.55);const L=.93+E*.14;i[m*3]=r.r*L,i[m*3+1]=r.g*L,i[m*3+2]=r.b*L}e.setAttribute("color",new we(i,3)),e.computeVertexNormals();const g=new Ot({vertexColors:!0,roughness:.97,metalness:0}),x=new pt(e,g);return x.receiveShadow=!0,x.name="terrain",x}buildWater(){const t=new zi(qs+120,qs+120,1,1);t.rotateX(-Math.PI/2);const e=128,n=new Uint8Array(e*e*4);for(let o=0;o<e;o++)for(let l=0;l<e;l++){const c=(o*e+l)*4,h=Math.sin(l*.32+o*.13)*.5+Math.sin(l*.11-o*.27)*.5,u=Math.cos(l*.17-o*.29)*.5+Math.cos(l*.09+o*.21)*.5;n[c]=128+h*45,n[c+1]=128+u*45,n[c+2]=255,n[c+3]=255}const i=new qh(n,e,e,xn);i.wrapS=i.wrapT=ca,i.repeat.set(60,60),i.needsUpdate=!0;const r=new Ot({color:3038059,roughness:.18,metalness:.32,transparent:!0,opacity:.86,normalMap:i,normalScale:new yt(.45,.45),depthWrite:!1}),a=new pt(t,r);return a.position.y=Pi,a.receiveShadow=!0,a.name="water",a.renderOrder=2,this.waterMat=r,this.waterTex=i,a}buildRoads(){const t=[[[175,306],[120,270],[40,220],[-40,170]],[[-40,170],[-140,100],[-230,-40],[-280,-160]],[[-280,-160],[-350,-40],[-392,138]],[[-280,-160],[-80,-220],[120,-270],[238,-292]],[[175,306],[270,280],[330,240],[352,206]],[[352,206],[390,60],[410,-150],[392,-356]],[[238,-292],[300,-330],[392,-356]],[[-40,170],[-20,20],[-10,-180],[-25,-400],[-40,-590]],[[175,306],[230,210],[258,72]],[[-280,-160],[-320,-240],[-360,-344]],[[175,306],[30,330],[-126,336]],[[238,-292],[190,-380],[40,-470],[-40,-590]]],e=[],n=new Mt("#6d6250");this.roadPoints=[];for(const o of t){const l=o.map(([m,f])=>new T(m,0,f)),c=new Fl(l,!1,"catmullrom",.35),h=Math.max(30,Math.floor(c.getLength()/4)),u=[],d=[],p=[],g=3.2;for(let m=0;m<=h;m++){const f=m/h,_=c.getPoint(f);m%4===0&&this.roadPoints.push(_);const y=c.getPoint(Math.min(1,f+.002)),v=y.x-_.x,E=y.z-_.z,C=Math.hypot(v,E)||1,I=-E/C,D=v/C;for(const M of[-1,1]){const w=_.x+I*g*M,L=_.z+D*g*M,N=this.heightAt(w,L)+.1;u.push(w,N,L);const B=.9+m%3*.035;d.push(n.r*B,n.g*B,n.b*B)}if(m<h){const M=m*2;p.push(M,M+1,M+2,M+1,M+3,M+2)}}const x=new ue;x.setAttribute("position",new jt(u,3)),x.setAttribute("color",new jt(d,3)),x.setIndex(p),x.computeVertexNormals(),e.push(x)}const i=xx(e),r=new Ot({vertexColors:!0,roughness:1,metalness:0,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),a=new pt(i,r);return a.receiveShadow=!0,a.name="roads",a}}function xx(s){let t=0;for(const l of s)t+=l.attributes.position.count;const e=new Float32Array(t*3),n=new Float32Array(t*3),i=[];let r=0,a=0;for(const l of s){e.set(l.attributes.position.array,r*3),n.set(l.attributes.color.array,r*3);const c=l.index.array;for(let h=0;h<c.length;h++)i.push(c[h]+a);r+=l.attributes.position.count,a+=l.attributes.position.count}const o=new ue;return o.setAttribute("position",new we(e,3)),o.setAttribute("color",new we(n,3)),o.setIndex(i),o.computeVertexNormals(),o}function vx(){const s=new re(1600,32,20),t={topColor:{value:new Mt("#1c4257")},horizonColor:{value:new Mt("#b9cdd6")},bottomColor:{value:new Mt("#6d8794")},sunColor:{value:new Mt("#ffd9a0")},sunDir:{value:new T(.4,.5,.2)},night:{value:0},time:{value:0}},e=new Kn({side:$e,depthWrite:!1,fog:!1,uniforms:t,vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`
      varying vec3 vDir; uniform vec3 topColor,horizonColor,bottomColor,sunColor,sunDir; uniform float night,time;
      void main(){
        float y = clamp(vDir.y*0.5+0.5,0.0,1.0);
        vec3 col = mix(bottomColor,horizonColor,smoothstep(0.38,0.52,y));
        col = mix(col,topColor,smoothstep(0.5,0.92,y));
        float sun = max(dot(normalize(vDir),normalize(sunDir)),0.0);
        col += sunColor*pow(sun,180.0)*1.6;
        col += sunColor*pow(sun,8.0)*0.18;
        // faint moving cloud bands
        float band = sin(vDir.x*6.0+vDir.z*4.0+time*0.03)*0.5+0.5;
        band *= smoothstep(0.35,0.6,y)*(1.0-smoothstep(0.75,0.95,y));
        col = mix(col, vec3(0.82,0.86,0.9), band*0.08*(1.0-night));
        // night blue
        vec3 ncol = mix(vec3(0.02,0.035,0.08),vec3(0.05,0.08,0.14),y);
        col = mix(col,ncol,night*0.92);
        gl_FragColor = vec4(col,1.0);
      }`}),n=new pt(s,e);return n.frustumCulled=!1,n.renderOrder=-10,{mesh:n,uniforms:t}}function yx(s){const e=new Float32Array(4200);for(let a=0;a<1400;a++){const o=s.next()*Math.PI*2,l=Math.acos(s.range(.05,1)),c=1200;e[a*3]=Math.sin(l)*Math.cos(o)*c,e[a*3+1]=Math.cos(l)*c,e[a*3+2]=Math.sin(l)*Math.sin(o)*c}const n=new ue;n.setAttribute("position",new we(e,3));const i=new Ll({color:14674431,size:2.2,transparent:!0,opacity:0,depthWrite:!1,sizeAttenuation:!1,fog:!1}),r=new Xh(n,i);return r.frustumCulled=!1,r.renderOrder=-9,r}function _x(s){const t=new Kt,e=document.createElement("canvas");e.width=256,e.height=128;const n=e.getContext("2d"),i=n.createRadialGradient(128,64,4,128,64,120);i.addColorStop(0,"rgba(255,255,255,.55)"),i.addColorStop(.5,"rgba(255,255,255,.2)"),i.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=i,n.fillRect(0,0,256,128);const r=new Ul(e),a=new Wi({map:r,transparent:!0,opacity:.55,depthWrite:!1,fog:!1});for(let o=0;o<22;o++){const l=new Rs(a),c=s.next()*Math.PI*2,h=s.range(300,1e3);l.position.set(Math.cos(c)*h,s.range(120,230),Math.sin(c)*h),l.scale.set(s.range(140,320),s.range(45,90),1),t.add(l)}return t.renderOrder=-8,t}const $n={stone:new Ot({color:8094601,roughness:.96,flatShading:!0}),stoneDark:new Ot({color:5528675,roughness:.98,flatShading:!0}),stoneLight:new Ot({color:10134698,roughness:.95,flatShading:!0}),wood:new Ot({color:7031343,roughness:.92,flatShading:!0}),woodDark:new Ot({color:4140061,roughness:.95,flatShading:!0}),woodLight:new Ot({color:9267010,roughness:.92,flatShading:!0}),plaster:new Ot({color:13222058,roughness:.98,flatShading:!0}),plasterDark:new Ot({color:11050374,roughness:.98,flatShading:!0}),roof:new Ot({color:14542829,roughness:.9,flatShading:!0}),roofDark:new Ot({color:4864560,roughness:.92,flatShading:!0}),roofTeal:new Ot({color:4156016,roughness:.9,flatShading:!0}),window:new Ot({color:3811864,emissive:16757850,emissiveIntensity:.55,roughness:.5}),gold:new Ot({color:13214300,metalness:.65,roughness:.35,flatShading:!0}),iron:new Ot({color:5134430,metalness:.7,roughness:.45,flatShading:!0}),ice:new Ot({color:10475756,transparent:!0,opacity:.72,roughness:.15,metalness:.1,flatShading:!0}),iceDeep:new Ot({color:5082280,transparent:!0,opacity:.85,roughness:.25,flatShading:!0}),dirt:new Ot({color:6114103,roughness:1,flatShading:!0}),clothRed:new Ot({color:9255733,roughness:.98,side:Ge}),clothTeal:new Ot({color:2845296,roughness:.98,side:Ge}),clothBlue:new Ot({color:3562115,roughness:.98,side:Ge}),clothCream:new Ot({color:14207397,roughness:.98,side:Ge}),bone:new Ot({color:14077366,roughness:.9,flatShading:!0}),crystal:new Ot({color:7985128,emissive:1994116,emissiveIntensity:.8,roughness:.15,metalness:.2,transparent:!0,opacity:.88,flatShading:!0}),lava:new Ot({color:16738852,emissive:16730640,emissiveIntensity:1.4,roughness:.6}),dark:new Ot({color:527117,roughness:1})};class cu{constructor(){this.buckets=new Map,this.count=0}add(t,e,n=[0,0,0],i=[0,0,0],r=[1,1,1]){const a=new ie,o=new Cs().setFromEuler(new En(i[0],i[1],i[2]));return a.compose(new T(n[0],n[1],n[2]),o,new T(r[0],r[1],r[2])),t.applyMatrix4(a),this.buckets.has(e)||this.buckets.set(e,[]),this.buckets.get(e).push(t),this.count++,t}box(t,e,n,i=[0,0,0]){return this.add(new Ve(n[0],n[1],n[2]),t,e,i)}cyl(t,e,n,i,r,a=8,o=[0,0,0]){return this.add(new tn(n,i,r,a),t,e,o)}sphere(t,e,n,i=8,r=[1,1,1]){return this.add(new re(n,i,Math.max(5,i-2)),t,e,[0,0,0],r)}cone(t,e,n,i,r=8,a=[0,0,0]){return this.add(new Ie(n,i,r),t,e,a)}build(t,e=!0){for(const[n,i]of this.buckets){if(!i.length)continue;const r=gn(i,!1);i.forEach(o=>o.dispose());const a=new pt(r,$n[n]||$n.stone);a.castShadow=e&&n!=="window",a.receiveShadow=!0,a.name="batch-"+n,t.add(a)}this.buckets.clear()}}function Gl(s,t,e,n,i,r,a,o=0,l="roof",c="roofDark"){const h=n/2,u=Math.atan2(a,h),d=Math.hypot(h,a)+.7,p=Math.cos(o),g=Math.sin(o);for(const x of[-1,1]){const m=x*n*.25,f=r+a*.5,_=t+m*p,y=e-m*g;s.batch.box(l,[_,f,y],[d,.22,i+1.1],[0,o,x*u]),s.batch.box(c,[_,f-.16,y],[d*.99,.12,i+1.02],[0,o,x*u])}s.batch.box("roof",[t,r+a+.02,e],[.36,.2,i+1.15],[0,o,0])}function je(s,t){const{x:e,z:n,ry:i=0,width:r=8,depth:a=10,height:o=4.2,style:l="wood",door:c=!0,enter:h=null,name:u="House",chimney:d=!0}=t,p=Math.cos(i),g=Math.sin(i),x=(y,v)=>e+y*p+v*g,m=(y,v)=>n-y*g+v*p,f=l==="plaster"?"plaster":l==="stone"?"stone":"wood",_="woodDark";s.batch.box("stoneDark",[e,.35,n],[r+.5,.7,a+.5],[0,i,0]),s.batch.box(f,[e,.7+o/2,n],[r,o,a],[0,i,0]);for(const y of[-r/2+.14,r/2-.14])for(const v of[-a/2+.14,a/2-.14])s.batch.box(_,[x(y,v),.7+o/2,m(y,v)],[.24,o,.24],[0,i,0]);s.batch.box(_,[x(0,a/2+.03),.7+o-.18,m(0,a/2+.03)],[r,.26,.14],[0,i,0]),s.batch.box(_,[x(0,-a/2-.03),.7+o-.18,m(0,-a/2-.03)],[r,.26,.14],[0,i,0]),Gl(s,e,n,r,a,.7+o,2.1+r*.07,i,"roof","roofDark"),c&&(s.batch.box("woodDark",[x(0,a/2+.05),1.95,m(0,a/2+.05)],[1.7,2.5,.16],[0,i,0]),s.batch.box("gold",[x(.55,a/2+.15),1.9,m(.55,a/2+.15)],[.1,.1,.08],[0,i,0]),s.batch.box("stoneLight",[x(0,a/2+.5),.55,m(0,a/2+.5)],[2.4,.3,1],[0,i,0]));for(const y of[-1,1])for(const v of[-a*.22,a*.22])s.batch.box("window",[x(y*(r/2+.05),v),.7+o*.58,m(y*(r/2+.05),v)],[.1,1,.9],[0,i,0]),s.batch.box("woodDark",[x(y*(r/2+.1),v),.7+o*.58,m(y*(r/2+.1),v)],[.06,1.15,1.05],[0,i,0]);if(s.batch.box("window",[x(0,-a/2-.05),.7+o*.6,m(0,-a/2-.05)],[1.2,.9,.1],[0,i,0]),d&&(s.batch.box("stone",[x(r*.3,-a*.22),.7+o+2.6,m(r*.3,-a*.22)],[.8,2.2,.8],[0,i,0]),s.batch.box("stoneDark",[x(r*.3,-a*.22),.7+o+3.7,m(r*.3,-a*.22)],[.95,.2,.95],[0,i,0])),s.addCollider(e,n,r/2+.3,a/2+.3,i),h){const y=x(0,a/2+1.2),v=m(0,a/2+1.2);s.addInteractable({id:"door_"+h,x:y,z:v,y:s.terrain.heightAt(y,v)+1.2,radius:2.6,label:u,icon:"door",action:E=>E.world.enterInterior(h,E)})}return{x:e,z:n}}function mo(s,t){const{x:e,z:n,ry:i=0,width:r=12,depth:a=16,name:o="Longhouse",enter:l=null}=t,c=Math.cos(i),h=Math.sin(i),u=(p,g)=>e+p*c+g*h,d=(p,g)=>n-p*h+g*c;s.batch.box("stoneDark",[e,.5,n],[r+.8,1,a+.8],[0,i,0]),s.batch.box("wood",[e,1+4.6,n],[r,9.2,a],[0,i,0]);for(let p=-2;p<=2;p++)s.batch.box("woodDark",[u(p*r*.2,a/2+.04),1+4.6,d(p*r*.2,a/2+.04)],[.3,9.2,.2],[0,i,0]);for(const p of[3.2,6.2])s.batch.box("woodDark",[u(0,a/2+.06),p,d(0,a/2+.06)],[r,.24,.15],[0,i,0]);if(Gl(s,e,n,r,a,10.2,3.2,i,"roof","roofDark"),s.batch.box("woodDark",[u(0,a/2+.1),12.1,d(0,a/2+.1)],[.22,2.4,.2],[0,i,.55]),s.batch.box("woodDark",[u(0,a/2+.1),12.1,d(0,a/2+.1)],[.22,2.4,.2],[0,i,-.55]),s.batch.box("woodDark",[u(0,a/2+.08),2.6,d(0,a/2+.08)],[2.2,3.4,.18],[0,i,0]),s.batch.box("window",[u(-3.4,a/2+.06),5.4,d(-3.4,a/2+.06)],[1.2,1.4,.1],[0,i,0]),s.batch.box("window",[u(3.4,a/2+.06),5.4,d(3.4,a/2+.06)],[1.2,1.4,.1],[0,i,0]),s.addCollider(e,n,r/2+.4,a/2+.4,i),l){const p=u(0,a/2+1.4),g=d(0,a/2+1.4);s.addInteractable({id:"door_"+l,x:p,z:g,y:s.terrain.heightAt(p,g)+1.2,radius:3,label:o,icon:"door",action:x=>x.world.enterInterior(l,x)})}}function Cn(s,t,e,n=4,i=16,r=!0,a=0){const o=s.terrain.heightAt(t,e);s.batch.cyl("stone",[t,o+i/2,e],n*.94,n,i,10),s.batch.cyl("stoneDark",[t,o+1.2,e],n+.3,n+.45,2.4,10);for(let l=0;l<8;l++){const c=l/8*Math.PI*2;s.batch.box("stone",[t+Math.cos(c)*n*.9,o+i+.55,e+Math.sin(c)*n*.9],[1.1,1.1,.8],[0,-c,0])}r&&(s.batch.cone("roof",[t,o+i+2.8,e],n*1.15,4.2,8,[0,0,0]),s.batch.cyl("woodDark",[t,o+i+.2,e],n*.8,n*.9,.4,10));for(const l of[i*.45,i*.75])s.batch.box("window",[t+n*.98,o+l,e],[.16,1.1,.7],[0,0,0]);s.addCollider(t,e,n+.2,n+.2,0,!0)}function us(s,t,e,n,i,r=8,a=2.6,o=!1){const l=s.terrain.heightAt(t,e);if(o){s.batch.box("stone",[t-Math.cos(i)*(n/2+2),l+r/2,e+Math.sin(i)*(n/2+2)],[n,r,a],[0,i,0]);return}s.batch.box("stone",[t,l+r/2,e],[n,r,a],[0,i,0]),s.batch.box("stoneDark",[t,l+r+.25,e],[n+.2,.5,a+.4],[0,i,0]);const c=Math.max(2,Math.floor(n/3.2));for(let h=0;h<c;h++){const u=(h+.5)/c-.5,d=Math.cos(i)*u*n,p=-Math.sin(i)*u*n;s.batch.box("stone",[t+d,l+r+1,e+p],[1.5,1.4,a*.9],[0,i,0])}s.addCollider(t,e,n/2,a/2,i)}function uh(s,t,e,n=0,i=12,r=12){const a=s.terrain.heightAt(t,e),o=Math.cos(n),l=Math.sin(n),c=(d,p)=>t+d*o+p*l,h=(d,p)=>e-d*l+p*o,u=i/2;for(const d of[-1,1])s.batch.box("stone",[c(d*u,0),a+r/2,h(d*u,0)],[4,r,5],[0,n,0]),s.addCollider(c(d*u,0),h(d*u,0),2,2.5,n);s.batch.box("stone",[t,a+r-1.2,e],[i+8,3.2,5.2],[0,n,0]),s.batch.box("stoneDark",[t,a+r+.4,e],[i+8.4,.6,5.6],[0,n,0]),s.batch.box("stoneDark",[t,a+r-4.2,e],[i,1.2,4.6],[0,n,0]);for(let d=-2;d<=2;d++)s.batch.box("iron",[c(d*1.4,0),a+r-5.4,h(d*1.4,0)],[.22,2.6,.3],[0,n,0]);Yn(s,c(-4.5,0),a+8.2,h(-4.5,0),2.4,5,"clothTeal",n),Yn(s,c(4.5,0),a+8.2,h(4.5,0),2.4,5,"clothTeal",n),s.batch.box("window",[c(0,-2.65),a+r-2.4,h(0,-2.65)],[2.2,1.2,.1],[0,n,0])}function Yn(s,t,e,n,i,r,a,o=0,l=!0){const c=new zi(i,r,1,4),h=c.attributes.position;for(let u=0;u<h.count;u++){const d=h.getY(u);h.setZ(u,Math.sin((d/r+.5)*Math.PI)*.12)}if(s.batch.add(c,a,[t,e,n],[0,o,0]),l){const u=new kl(.42,8);s.batch.add(u,"gold",[t,e+.3,n+.02],[0,o,0])}}function Yr(s,t,e,n,i="clothRed"){const r=s.terrain.heightAt(t,e),a=Math.cos(n),o=Math.sin(n);s.batch.box("woodDark",[t-1.5*a,r+1,e+1.5*o],[.15,2.2,.15],[0,n,0]),s.batch.box("woodDark",[t+1.5*a,r+1,e-1.5*o],[.15,2.2,.15],[0,n,0]),s.batch.box("wood",[t,r+1.1,e],[3.6,.16,1.4],[0,n,0]),s.batch.box(i,[t,r+2.5,e],[3.8,.12,2.4],[0,n,-.18]);for(let l=-1;l<=1;l++)s.batch.sphere("gold",[t+l*.9*a,r+1.35,e-l*.9*o],.2,6,[1,.7,1]);s.addCollider(t,e,1.9,1.1,n)}function Xs(s,t,e){const n=s.terrain.heightAt(t,e);s.batch.cyl("stone",[t,n+.55,e],2,2.2,1.1,10),s.batch.cyl("stoneDark",[t,n+1.15,e],1.7,1.7,.2,10),s.batch.cyl("dark",[t,n+1.2,e],1.5,1.5,.1,10);for(const i of[-1,1])s.batch.box("woodDark",[t+i*1.8,n+2.3,e],[.2,3,.2]);s.batch.box("wood",[t,n+3.8,e],[4.2,.2,.25]),s.batch.cyl("woodDark",[t,n+3.6,e],.12,.12,4,6,[0,0,Math.PI/2]),s.addCollider(t,e,2.2,2.2,0,!0)}function dh(s,t,e,n=0,i=16){const r=s.terrain.heightAt(t,e),a=Math.cos(n),o=Math.sin(n);for(let l=0;l<Math.floor(i/2);l++)s.batch.box("woodLight",[t+a*(l*2-i/2),Math.max(1.4,r+.3),e-o*(l*2-i/2)],[2.2,.18,2],[0,n,0]);for(let l=0;l<4;l++){const c=l/3-.5;for(const h of[-1,1])s.batch.cyl("woodDark",[t+a*c*i+o*h*1,Math.max(.3,r-.4),e-o*c*i+a*h*1],.15,.18,3.2,6)}for(let l=0;l<4;l++){const c=l/3-.5;s.batch.cyl("woodDark",[t+a*c*i+o*1.05,r+1.1,e-o*c*i+a*1.05],.08,.1,1,5)}}function go(s,t,e,n=0){const i=WATER_LEVEL+.25,r=new re(1.6,8,5,0,Math.PI*2,0,Math.PI/2);r.scale(1.6,.55,.75),s.batch.add(r,"wood",[t,i,e],[0,n,0]),s.batch.box("woodDark",[t,i+.18,e],[2.8,.12,.9],[0,n,0]),s.batch.box("woodDark",[t,i+1.2,e],[.1,2.1,.1],[0,n,0])}function wi(s,t,e,n,i=10){const r=s.terrain.heightAt(t,e),a=Math.cos(n),o=Math.sin(n),l=Math.max(2,Math.floor(i/1.6));for(let c=0;c<=l;c++){const h=c/l-.5;s.batch.box("woodDark",[t+a*h*i,r+.65,e-o*h*i],[.12,1.3,.12],[0,n,0])}for(const c of[.5,1])s.batch.box("wood",[t,r+c,e],[i,.1,.08],[0,n,0])}function bx(s,t,e,n=0){const i=s.terrain.heightAt(t,e),r=16,a=22,o=8;s.batch.box("stoneDark",[t,i+.5,e],[r+.6,1,a+.6],[0,n,0]),s.batch.box("wood",[t,i+1+o/2,e],[r,o,a],[0,n,0]),Gl(s,t,e,r,a,i+1+o,4,n,"roof","roofDark");const l=Math.cos(n),c=Math.sin(n);s.batch.box("woodDark",[t+c*(a/2+.05),i+3.2,e+l*(a/2+.05)],[5,5.5,.2],[0,n,0]),s.batch.box("woodDark",[t,i+3.2,e+l*(a/2+.1)],[.3,5.5,.22],[0,n,.5]),s.batch.box("woodDark",[t,i+3.2,e+l*(a/2+.1)],[.3,5.5,.22],[0,n,-.5]),s.addCollider(t,e,r/2+.3,a/2+.3,n)}function Mx(s,t,e){const n=s.terrain.heightAt(t,e);s.batch.cyl("stone",[t,n+7,e],4.2,6,14,10),s.batch.cone("roof",[t,n+16.5,e],4.8,5,10),s.batch.box("woodDark",[t,n+11.5,e+4.4],[2.2,1.2,.2]),s.batch.box("window",[t,n+8,e+4.8],[1.2,1.4,.2]);const i=new Kt;i.position.set(t,n+13,e+5);for(let a=0;a<4;a++){const o=new pt(new Ve(1.2,9,.18),$n.woodLight);o.position.y=4.5,o.rotation.z=a*Math.PI/2;const l=new Kt;l.add(o),l.rotation.z=a*Math.PI/2,i.add(l)}const r=new pt(new tn(.4,.4,.7,8),$n.iron);r.rotation.x=Math.PI/2,i.add(r),s.group.add(i),s.animated.push({type:"windmill",obj:i}),s.addCollider(t,e,5.4,5.4,0,!0)}function wx(s){const n=s.terrain.heightAt(-40,170);for(let a=0;a<9;a++){const o=a/9*Math.PI*2-Math.PI/2,l=-40+Math.cos(o)*17,c=170+Math.sin(o)*17,h=s.terrain.heightAt(l,c),u=5.5+a%3*1.1;s.batch.box("stoneDark",[l,h+u/2,c],[1.4,u,1],[0,-o,a%2?.03:-.02]),s.batch.box("stone",[l,h+u+.1,c],[1.6,.25,1.2],[0,-o,0]),s.batch.box("crystal",[l-Math.sin(o)*.52,h+u*.62,c-Math.cos(o)*.52],[.1,.9,.5],[0,-o,0]),s.addCollider(l,c,.9,.7,-o)}s.batch.box("stone",[-40,n+.55,170],[3.2,1.1,2.2]),s.batch.box("stoneLight",[-40,n+1.15,170],[2.6,.2,1.7]),s.batch.cyl("stoneDark",[-40,n+1.4,170],.7,.9,.5,8);const i=new pt(new Ie(.55,1.8,6),new Me({color:9430271,transparent:!0,opacity:.85}));i.position.set(-40,n+2.45,170),s.group.add(i);const r=new ze(9430271,10,20,2);r.position.set(-40,n+2.6,170),s.group.add(r),s.animated.push({type:"flame",obj:i,light:r,baseY:n+2.45}),s.addInteractable({id:"shrine_rest",x:-40,z:170,y:n+1.2,radius:4.2,label:"Rest at the Shrine of the Nine",icon:"shrine",action:a=>a.restAtShrine("Shrine of the Nine",-40,170,n)}),s.addCollider(-40,170,1.8,1.2,0);for(let a=0;a<12;a++){const o=a*.6,l=-40+Math.cos(o)*(5+a*.9),c=170+Math.sin(o)*(5+a*.9);s.batch.box("stoneLight",[l,s.terrain.heightAt(l,c)+.05,c],[1,.12,.8],[0,o,0])}}function Sx(s,t,e,n=1){const i=s.terrain.heightAt(t,e);for(let r=0;r<6;r++){const a=r/6*Math.PI*2,o=t+Math.cos(a)*10*n,l=e+Math.sin(a)*10*n,c=s.terrain.heightAt(o,l),h=(r%2?3:7)*n;s.batch.box("stoneDark",[o,c+h/2,l],[1.4*n,h,1.4*n],[0,a,r%3?.04:-.03]),s.batch.box("stone",[o,c+h,l],[1.7*n,.3,1.7*n],[0,a,0])}s.batch.box("stone",[t-4*n,i+6*n,e],[1.2*n,8*n,1.2*n],[0,.2,.05]),s.batch.box("stone",[t+4*n,i+6*n,e],[1.2*n,8*n,1.2*n],[0,-.2,-.05]),s.batch.box("stoneDark",[t,i+10.2*n,e],[9.5*n,1.2*n,1.4*n],[0,0,.02]);for(let r=0;r<10;r++){const a=t+Math.sin(r*3.1)*12*n,o=e+Math.cos(r*2.7)*12*n;s.batch.box("stoneDark",[a,s.terrain.heightAt(a,o)+.3,o],[1.2,.7,1],[.2,r,.1])}for(let r=0;r<5;r++)s.batch.box("stone",[t,i+.2-r*.25,e+5+r*1.2],[5,.5,1.2])}function Tx(s,t,e,n=0){const i=s.terrain.heightAt(t,e),r=Math.cos(n),a=Math.sin(n);for(let o=0;o<8;o++){const l=t+Math.sin(o*2.4)*7,c=e+Math.cos(o*1.7)*4;s.batch.add(new Fi(3.2,0),"stoneDark",[l,i+2.2+o%3,c],[o,o*.7,o*.3],[1.4,1,1.1])}for(const o of[-1,1])s.batch.box("woodDark",[t+a*o*3.2,i+2.6,e+r*o*3.2],[.5,5.2,.5],[0,n,0]);s.batch.box("woodDark",[t,i+5.1,e],[7.4,.6,.6],[0,n,0]),s.batch.box("wood",[t,i+5.5,e],[8.2,.25,1.1],[0,n,0]),s.batch.box("dark",[t,i+2.2,e],[5.8,4.4,.4],[0,n,0]);for(const o of[-1,1])s.batch.box("iron",[t+a*o*1.4,i+.12,e+r*6],[.12,.12,12],[0,n,0]);for(let o=0;o<4;o++){const l=t+Math.sin(o*3.7)*8,c=e+Math.cos(o*2.2)*6;s.batch.cone("crystal",[l,s.terrain.heightAt(l,c)+.7,c],.4,1.5,5,[.2,o,.3])}s.addInteractable({id:"enter_cinderdeep",x:t,z:e,y:i+1.5,radius:5,label:"Enter Cinderdeep Mine",icon:"mine",action:o=>o.world.enterInterior("cinderdeep",o)})}function fh(s,t,e){const n=s.terrain.heightAt(t,e);for(let i=0;i<10;i++){const r=i/10*Math.PI*2,a=t+Math.cos(r)*6,o=e+Math.sin(r)*4;s.batch.add(new Fi(2.6,0),"stoneDark",[a,n+2.4+i%2*1.4,o],[i,r,i*.4],[1.3,1.1,1])}s.batch.box("dark",[t,n+2,e],[5.2,4,.5]),s.batch.cone("crystal",[t+4.2,n+.7,e+2],.3,1.2,5,[.3,.4,.2]),s.batch.cone("crystal",[t-4.4,n+.5,e+1],.25,1,5,[.2,.8,.3]),s.addInteractable({id:"enter_whispercave",x:t,z:e,y:n+1.4,radius:4.5,label:"Enter the Whispering Cave",icon:"cave",action:i=>i.world.enterInterior("whispercave",i)})}function Ex(s,t,e){const n=s.terrain.heightAt(t,e);for(let i=0;i<14;i++){const r=i/14*Math.PI*2,a=t+Math.cos(r)*12,o=e+Math.sin(r)*7;s.batch.add(new Fi(4.2,0),"stoneDark",[a,n+4+i%3*2,o],[i,r,i*.2],[1.2,1.1,1])}s.batch.box("stone",[t,n+6.2,e],[11,12.4,2.4]),s.batch.box("stoneDark",[t,n+12.6,e],[12.5,.8,3]),s.batch.box("iceDeep",[t,n+3.2,e-1.4],[5.6,6.4,.6]);for(let i=0;i<4;i++)s.batch.cone("crystal",[t-4+i*2.6,n+9.5,e-1.8],.35,2.2,5,[.1,i,.2]);s.batch.sphere("gold",[t-1.6,n+3.4,e-1.85],.55,8,[1,1,.4]),s.batch.sphere("gold",[t+1.6,n+3.4,e-1.85],.55,8,[1,1,.4]),s.addInteractable({id:"frost_door",x:t,z:e-2.2,y:n+2.5,radius:5,label:"The Frostfang Door",icon:"door",action:i=>i.world.tryFrostDoor(i)})}function Ax(s,t,e){const n=s.terrain.heightAt(t,e);for(let c=0;c<14;c++){const h=c/14*Math.PI*2,u=t+Math.cos(h)*13,d=e+Math.sin(h)*11;Math.abs(u-t)<3&&d>e||s.batch.cyl("woodDark",[u,n+1.6,d],.22,.28,3.2,5,[.04,h,.06])}for(const[c,h,u]of[[-5,-3,.4],[5,2,-.5],[1,-6,1.1]]){const d=s.terrain.heightAt(t+c,e+h);s.batch.cone("clothRed",[t+c,d+1.9,e+h],3.2,3.8,4,[0,u,0]),s.batch.box("woodDark",[t+c,d+.8,e+h],[.2,1.6,.2])}const i=t+1,r=e+3,a=s.terrain.heightAt(i,r);for(let c=0;c<7;c++){const h=c/7*Math.PI*2;s.batch.box("stoneDark",[i+Math.cos(h)*1.1,a+.2,r+Math.sin(h)*1.1],[.5,.35,.5],[0,h,0])}const o=new pt(new Ie(.6,1.5,6),new Me({color:16751421,transparent:!0,opacity:.9}));o.position.set(i,a+.9,r),s.group.add(o);const l=new ze(16747069,8,18,2);l.position.set(i,a+1.6,r),s.group.add(l),s.animated.push({type:"flame",obj:o,light:l,baseY:a+.9}),s.batch.box("woodDark",[t+7,n+1.2,e-5],[2.2,2.4,2.2]);for(let c=0;c<4;c++)s.batch.box("iron",[t+6.2+c*.5,n+1.3,e-3.9],[.08,2.2,.08])}function dn(s,t,e,n,i=0){const r=s.terrain.heightAt(t,e);s.batch.box("woodDark",[t,r+1.2,e],[.22,2.4,.22]);const a=document.createElement("canvas");a.width=512,a.height=128;const o=a.getContext("2d");o.fillStyle="#5b422b",o.fillRect(0,0,512,128),o.strokeStyle="#2f2115",o.lineWidth=8,o.strokeRect(4,4,504,120),o.fillStyle="#eadfc3",o.font="bold 52px Georgia",o.textAlign="center",o.textBaseline="middle",o.fillText(n,256,68);const l=new Ul(a),c=new Ot({map:l,roughness:.9}),h=new pt(new Ve(3.4,.85,.12),c);h.position.set(t,r+2.1,e),h.rotation.y=i,s.group.add(h),s.batch.box("woodDark",[t,r+2.1,e],[3.6,.95,.14],[0,i,0]),h.position.z+=.08,h.rotation.y=i}function ph(s,t,e,n=0){const i=s.terrain.heightAt(t,e);s.batch.box("stoneDark",[t,i+.7,e],[4,1.4,4]),s.batch.box("stone",[t,i+1.5,e],[3.2,.4,3.2]),s.batch.sphere("stone",[t,i+3.4,e],1.5,10,[1,1.4,1]),s.batch.sphere("stone",[t,i+5.4,e],1.1,10,[1,.95,.95]),s.batch.cone("stone",[t-.65,i+6.3,e],.42,1.1,4,[0,0,-.2]),s.batch.cone("stone",[t+.65,i+6.3,e],.42,1.1,4,[0,0,.2]),s.batch.sphere("stone",[t,i+2.2,e-.4],1.2,8,[1,.7,1.6]),s.addCollider(t,e,2,2,0,!0),s.batch.box("gold",[t,i+1.7,e+2.05],[1.2,.5,.1])}function Cx(s,t,e,n=0,i=30){const r=WATER_LEVEL+1.8,a=Math.cos(n),o=Math.sin(n);for(let l=0;l<Math.floor(i/1.8);l++){const c=(l+.5)/Math.floor(i/1.8)-.5;s.batch.box("woodLight",[t+a*c*i,r,e-o*c*i],[2.6,.22,1.9],[0,n,0])}for(const l of[-1,1]){for(let c=0;c<6;c++){const h=(c+.5)/6-.5;s.batch.cyl("woodDark",[t+a*h*i+o*l*1.15,r+.8,e-o*h*i+a*l*1.15],.07,.09,1.6,5)}s.batch.box("woodDark",[t+o*l*1.15,r+1.55,e+a*l*1.15],[i,.12,.12],[0,n,0])}for(const l of[-.42,.42])s.batch.box("stoneDark",[t+a*l*i,r-.9,e-o*l*i],[3.2,2.2,2.4],[0,n,0])}function hu(s,t,e,n=null){const i=n??s.terrain.heightAt(t,e),r=new Kt;r.position.set(t,i,e);const a=new pt(new Ve(1.25,.7,.8),$n.wood);a.position.y=.35;const o=new Kt;o.position.set(0,.7,-.4);const l=new pt(new Ve(1.3,.28,.85),$n.woodDark);l.position.set(0,.14,.4),o.add(l);const c=new pt(new Ve(1.35,.1,.9),$n.gold);c.position.y=.04;const h=new pt(new Ve(.2,.24,.08),$n.gold);h.position.set(0,.5,.42),r.add(a,o,c,h),r.traverse(d=>{d.isMesh&&(d.castShadow=!0,d.receiveShadow=!0)}),s.group.add(r);const u=new Rs(new Wi({color:16765818,map:Is(),transparent:!0,opacity:.45,depthWrite:!1,blending:pn}));return u.scale.set(2.2,2.2,1),u.position.set(t,i+1.1,e),s.group.add(u),{group:r,lidPivot:o,glow:u,opened:!1,x:t,y:i,z:e}}let $r=null;function Is(){if($r)return $r;const s=document.createElement("canvas");s.width=s.height=128;const t=s.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);return e.addColorStop(0,"rgba(255,255,255,1)"),e.addColorStop(.25,"rgba(255,220,150,.7)"),e.addColorStop(1,"rgba(255,180,80,0)"),t.fillStyle=e,t.fillRect(0,0,128,128),$r=new Ul(s),$r}function ds(s,t,e,n=16761975){const i=s.terrain.heightAt(t,e);s.batch.box("woodDark",[t,i+2.2,e],[.16,4.4,.16]),s.batch.box("iron",[t,i+4.3,e],[.7,.12,.12]);const r=new pt(new re(.22,8,6),new Me({color:n}));r.position.set(t,i+4.1,e+.3),s.group.add(r);const a=new Rs(new Wi({map:Is(),color:n,transparent:!0,opacity:.5,depthWrite:!1,blending:pn}));a.position.set(t,i+4.1,e+.3),a.scale.set(2.4,2.4,1),s.group.add(a)}function Zr(s,t,e,n,i=0){s.batch.box("stoneDark",[t,e+1.2,n],[3.4,2.4,.9],[0,i,0]),s.batch.box("dark",[t,e+.9,n+.46],[2,1.6,.1],[0,i,0]);const r=new pt(new Ie(.7,1.2,6),new Me({color:16752708,transparent:!0,opacity:.9}));r.position.set(t,e+1,n+.5),s.group.add(r);const a=new ze(16749636,14,22,2);a.position.set(t,e+1.6,n+.9),s.group.add(a),s.animated.push({type:"flame",obj:r,light:a,baseY:e+1})}function Rx(s,t,e,n,i=0){s.batch.box("wood",[t,e+.78,n],[2.2,.14,1.1],[0,i,0]);for(const r of[-.9,.9])for(const a of[-.4,.4]){const o=Math.cos(i),l=Math.sin(i);s.batch.box("woodDark",[t+r*o+a*l,e+.38,n-r*l+a*o],[.12,.76,.12],[0,i,0])}for(const[r,a]of[[-.6,.7],[.6,-.7],[.7,.7]]){const o=Math.cos(i),l=Math.sin(i);s.batch.box("woodDark",[t+r*o+a*l,e+.42,n-r*l+a*o],[.42,.1,.42],[0,i,0]),s.batch.box("woodDark",[t+r*o+a*l,e+.22,n-r*l+a*o],[.08,.42,.08],[0,i,0])}}function bn(s,t,e,n,i=.7,r=0){s.batch.box("woodLight",[t,e+i/2,n],[i,i,i],[0,r,0]),s.batch.box("woodDark",[t,e+i/2,n],[i*1.02,.07,i*1.02],[0,r,0])}function ms(s,t,e,n){s.batch.cyl("woodLight",[t,e+.55,n],.4,.45,1.1,8),s.batch.cyl("iron",[t,e+.3,n],.43,.43,.08,8),s.batch.cyl("iron",[t,e+.8,n],.41,.41,.08,8)}function Wn(s){const t=new Kt;t.visible=!1;const e={name:s,group:t,batch:new cu,colliders:[],interactables:[],animated:[],chests:[],lights:[],addCollider(n,i,r,a,o=0,l=!1){e.colliders.push({x:n,z:i,hx:r,hz:a,ry:o,circle:l})},addInteractable(n){e.interactables.push(n)},addChest(n,i,r,a,o=0){const l=hu({group:e.group,terrain:{heightAt:()=>o}},n,i,o);return l.items=r,l.id=a,e.chests.push(l),e.addInteractable({id:"chest_"+a,x:n,z:i,y:o+.8,radius:2.4,label:"Open chest",icon:"chest",chest:l,action:c=>c.openChest(l)}),l},finish(){return e.batch.build(e.group),e}};return e}function uu(s,t,e,n,i,r="stoneDark",a=0){s.batch.box(r,[t,a-.15,e],[n,.3,i])}function du(s,t,e,n,i,r,a="stoneDark"){s.batch.box(a,[t,r,e],[n,.4,i])}function Zs(s,t,e,n,i,r,a="stoneDark",o=0){s.batch.box(a,[t,o+r/2,e],[n,r,i]),s.addCollider(t,e,n/2,i/2)}function De(s,t){const{x:e,z:n,w:i,d:r,h:a=5.5,mat:o="stoneDark",floorMat:l="stone",ceil:c=!0,doors:h={},y:u=0}=t;uu(s,e,n,i,r,l,u),c&&du(s,e,n,i,r,u+a,o);const d=.55,p={n:{axis:"x",pos:[e,n-r/2],len:i},s:{axis:"x",pos:[e,n+r/2],len:i},w:{axis:"z",pos:[e-i/2,n],len:r},e:{axis:"z",pos:[e+i/2,n],len:r}};for(const g in p){const x=p[g],m=h[g];if(!m)x.axis==="x"?Zs(s,x.pos[0],x.pos[1],x.len,d,a,o,u):Zs(s,x.pos[0],x.pos[1],d,x.len,a,o,u);else{const f=m.width||4,_=m.offset||0,y=x.len/2,v=[[-y,_-f/2],[_+f/2,y]];for(const[E,C]of v){if(C-E<.1)continue;const I=(E+C)/2,D=C-E;x.axis==="x"?Zs(s,x.pos[0]+I,x.pos[1],D,d,a,o,u):Zs(s,x.pos[0],x.pos[1]+I,d,D,a,o,u)}x.axis==="x"?s.batch.box(o,[x.pos[0]+_,u+a-1.2,x.pos[1]],[f,2.4,d],[0,0,0]):s.batch.box(o,[x.pos[0],u+a-1.2,x.pos[1]+_],[d,2.4,f],[0,0,0])}}}function Rn(s,t,e,n,i,r=4.5,a=4.5,o="stoneDark"){const l=(t+n)/2,c=(e+i)/2,h=Math.hypot(n-t,i-e),u=Math.atan2(n-t,i-e);uu(s,l,c,r,h,"stone",0),du(s,l,c,r,h,a,o);const d=Math.cos(u),p=Math.sin(u);for(const g of[-1,1]){const x=l+d*g*r/2,m=c-p*g*r/2;Zs(s,x,m,.55,h,a,o)}}function Le(s,t,e,n,i=16753500){s.batch.cyl("woodDark",[t,e+.4,n],.08,.1,.8,5);const r=new pt(new Ie(.22,.7,5),new Me({color:i,transparent:!0,opacity:.9}));r.position.set(t,e+1,n),s.group.add(r);const a=new ze(i,9,15,2);a.position.set(t,e+1.2,n),s.group.add(a),s.lights.push(a),s.animated.push({type:"flame",obj:r,light:a,baseY:e+1})}function fs(s,t,e,n=0,i=0){Rx(s,t,n,e,i)}function jr(s,t,e,n=0){ms(s,t,n,e)}function Kr(s,t,e,n=0,i=.7){bn(s,t,n,e,i)}function qn(s,t,e,n=0,i="Leave"){s.batch.box("woodDark",[t,n+1.6,e],[2.2,3.2,.25]),s.batch.box("gold",[t,n+1.5,e+.15],[.14,.14,.1]),s.addInteractable({id:"exit_door",x:t,z:e,y:n+1.3,radius:3,label:i,icon:"door",action:r=>r.world.exitInterior(r)})}const Px={tavern(){const s=Wn("The Leaky Whisker"),t=7;De(s,{x:0,z:0,w:24,d:18,h:t,mat:"woodDark",floorMat:"wood",doors:{s:{width:4}}});for(let n=-2;n<=2;n++)s.batch.box("woodDark",[0,t-.35,n*4],[24,.45,.45]);s.batch.box("woodDark",[0,t-.7,0],[.5,.5,18]),s.batch.box("woodLight",[-7,1.1,-4],[12,1.2,2]),s.batch.box("woodDark",[-7,.55,-4],[12.4,.2,2.4]);for(let n=-5;n<=5;n+=2)jr(s,-7+n,-5.4,0);for(let n=0;n<5;n++){s.batch.box("woodDark",[-7,3.2+n%2*.7,-8.4],[11,.14,.6]);for(let i=0;i<8;i++)s.batch.cyl(i%2?"clothTeal":"gold",[-12+i*1.4,3.4+n%2*.7,-8.4],.08,.1,.3,5)}Zr(s,8,0,-8.2,0),fs(s,4,2),fs(s,9,3,0,.4),fs(s,-1,5,0,-.3);for(let n=0;n<5;n++)Kr(s,10.2,-5+n*1.6,0,.6);s.batch.box("clothRed",[0,.03,1.5],[8,.06,6]),s.batch.cyl("iron",[0,t-1.6,0],.06,.06,2.2,5);for(let n=0;n<6;n++){const i=n/6*Math.PI*2;s.batch.sphere("gold",[Math.cos(i)*1.2,t-2.7,Math.sin(i)*1.2],.12,5)}const e=new ze(16762234,14,20,2);return e.position.set(0,t-2.6,0),s.group.add(e),s.lights.push(e),Le(s,-11,3,0),Le(s,11,3,1),s.batch.box("woodLight",[-9,.35,5.4],[5,.7,4]),jr(s,-11,3.5,0),qn(s,0,8.6,0,"Leave the Leaky Whisker"),s.finish()},shop(){const s=Wn("Nine Lives Goods"),t=6;De(s,{x:0,z:0,w:18,d:14,h:t,mat:"woodDark",floorMat:"wood",doors:{s:{width:4}}}),s.batch.box("woodLight",[0,1.1,-2.5],[10,1.2,1.8]),s.batch.box("gold",[0,1.74,-2.5],[10.2,.08,1.9]);for(let e=0;e<6;e++)s.batch.box("woodDark",[-4.5+e*1.8,.5,-3.4],[1.4,.9,.3]);for(let e of[-1,1])for(let n=0;n<3;n++){s.batch.box("woodDark",[e*8.4,1.6+n*1.3,0],[.5,.15,11]);for(let i=0;i<6;i++){const r=["clothRed","clothTeal","gold","iron","clothBlue"];s.batch.box(r[(n+i)%5],[e*8.2,1.8+n*1.3,-4.5+i*1.7],[.5,.5,.7])}}for(const[e,n]of[[-5,3],[5,3]]){s.batch.cyl("iron",[e,t-1.2,n],.05,.05,1.8,5);const i=new pt(new re(.24,7,5),new Me({color:16765066}));i.position.set(e,t-2.1,n),s.group.add(i);const r=new ze(16761722,8,14,2);r.position.copy(i.position),s.group.add(r),s.lights.push(r)}return Kr(s,7,-5,0,.8),Kr(s,7.8,-4.2,0,.6),jr(s,-7,5,0),qn(s,0,6.6,0,"Leave the shop"),s.finish()},castlehall(){const s=Wn("Highpaw Hall"),t=12;De(s,{x:0,z:0,w:30,d:24,h:t,mat:"stoneDark",floorMat:"stone",doors:{s:{width:5}}});for(const e of[-11,11])for(const n of[-8,0,8])s.batch.cyl("stone",[e,t/2,n],1,1.3,t,10),s.batch.box("stoneLight",[e,.4,n],[3.2,.8,3.2]),s.addCollider(e,n,1.3,1.3);s.batch.box("stone",[0,.5,-9],[12,1,6]),s.batch.box("stoneLight",[0,1.1,-9],[10,.2,4.6]),s.batch.box("gold",[0,2.2,-10.2],[3.4,2.4,.6]),s.batch.box("clothTeal",[0,2.6,-9.9],[2.6,2.8,.3]),s.batch.sphere("gold",[0,4.1,-9.9],.55,8,[1,.8,.4]);for(const e of[-1,1])s.batch.cone("gold",[e*1.4,4.2,-10],.3,1.2,4,[0,0,-e*.3]),Yn(s,e*6.5,7.5,-11.6,3,7,"clothTeal");Zr(s,-12,0,10.8,0),Zr(s,12,0,10.8,0),fs(s,-5,4,0,0),fs(s,5,4,0,0),s.batch.box("clothRed",[0,.04,1],[16,.05,8]),s.batch.box("woodDark",[13.5,1.4,-2],[.3,2.8,6]);for(let e=0;e<4;e++)s.batch.box("iron",[13.3,1.9,-4.4+e*1.6],[.08,2.6,.3],[.2,0,0]);return qn(s,0,11.6,0,"Leave Highpaw Hall"),s.finish()},cottage(){const s=Wn("Crooked Cottage");return De(s,{x:0,z:0,w:14,d:12,h:5,mat:"woodDark",floorMat:"wood",doors:{s:{width:3.5}}}),Zr(s,-5,0,-5.4,0),s.batch.box("clothBlue",[2,.55,-3],[3.2,.5,4.4]),s.batch.box("clothCream",[2,.85,-4.4],[2.6,.35,1.2]),fs(s,4.5,2.5,0,.3),s.batch.box("woodDark",[4.5,1.5,2.5],[.12,.6,.12]),s.batch.cyl("woodDark",[-2,1.2,-5.6],.7,.7,.12,8,[Math.PI/2,0,0]),Kr(s,5.5,-4.5,0,.8),jr(s,-5.5,3.8,0),s.batch.box("clothRed",[0,.03,2],[6,.05,4]),Le(s,-6.4,2.4,2),qn(s,0,5.6,0,"Leave the cottage"),s.finish()},pawbarrow(){const s=Wn("Sunken Pawbarrow");De(s,{x:0,z:8,w:18,d:14,h:6,doors:{n:{width:5},s:{width:3}}}),qn(s,0,14.4,0,"Climb back to the surface"),Rn(s,0,1,0,-4,5,5),De(s,{x:0,z:-16,w:24,d:20,h:7,doors:{s:{width:5},n:{width:5},w:{width:4},e:{width:4}}});for(const n of[-7,7])for(const i of[-21,-11])s.batch.cyl("stone",[n,3.5,i],1,1.3,7,8),s.batch.box("stoneLight",[n,.4,i],[3,.8,3]),s.addCollider(n,i,1.3,1.3);Rn(s,-12,-16,-18,-16,4,4.5),De(s,{x:-26,z:-16,w:12,d:12,h:5,doors:{e:{width:4}}}),s.addChest(-28,-18,["locket","healthPotion","gold"],"pawbarrow_secret"),Rn(s,12,-16,18,-16,4,4.5),De(s,{x:26,z:-16,w:12,d:12,h:5,doors:{w:{width:4}}}),s.addChest(28,-18,["dreamHerb","manaPotion"],"pawbarrow_east"),Rn(s,0,-26,0,-32,5,5),De(s,{x:0,z:-46,w:24,d:20,h:9,doors:{s:{width:5}}}),s.batch.box("stone",[0,.6,-50],[4,1.2,4]),s.batch.box("stoneLight",[0,1.3,-50],[3,.2,3]);const t=new pt(new Sa(.55,0),new Me({color:16757084}));t.position.set(0,2.4,-50),s.group.add(t);const e=new ze(16751178,16,24,2);e.position.set(0,2.8,-50),s.group.add(e),s.lights.push(e),s.animated.push({type:"relic",obj:t,light:e,baseY:2.4}),s.addInteractable({id:"relic_ember",x:0,z:-50,y:2.4,radius:3.4,label:"Take the First Ember",icon:"relic",action:n=>n.takeRelic("emberRelic","The First Ember",t,e)});for(let n=0;n<12;n++){const i=-10+n*7%20,r=-40+n*5%12;s.batch.box("bone",[i,.1,r],[.5,.15,.15],[0,n,0])}return Le(s,-10,3,-8),Le(s,10,3,-8),Le(s,-10,3,-24),Le(s,10,3,-24),Le(s,0,4,-38),Le(s,-9,3,-50),Le(s,9,3,-50),s.batch.box("clothTeal",[0,.04,-46],[16,.05,12]),s.finish()},cinderdeep(){const s=Wn("Cinderdeep Mine");De(s,{x:0,z:10,w:16,d:14,h:5.5,mat:"stoneDark",floorMat:"dirt",doors:{n:{width:5},s:{width:3}}}),qn(s,0,16.4,0,"Climb back to the surface"),Rn(s,0,3,0,-2,5,5,"woodDark"),De(s,{x:0,z:-16,w:28,d:22,h:8,mat:"stoneDark",floorMat:"dirt",doors:{s:{width:5},e:{width:4},n:{width:5}}});for(const i of[-9,9])for(const r of[-24,-8])s.batch.box("woodDark",[i,3.5,r],[.5,7,.5]),s.batch.box("woodDark",[i,6.8,r],[.4,.4,8],[.5,0,0]),s.addCollider(i,r,.4,.4);s.batch.box("lava",[4,.05,-12],[7,.12,5]);const t=new ze(16734750,14,22,2);t.position.set(4,1.2,-12),s.group.add(t),s.lights.push(t);for(let i=0;i<10;i++){const r=i/10*Math.PI*2,a=Math.cos(r)*12,o=-16+Math.sin(r)*9;s.batch.cone("crystal",[a,.8,o],.35,1.8,5,[.2,r,.3])}Rn(s,14,-16,21,-16,4,4.5,"woodDark"),De(s,{x:28,z:-16,w:14,d:14,h:5,mat:"stoneDark",floorMat:"dirt",doors:{w:{width:4}}}),s.addChest(30,-19,["frostAxe","healthPotion","gold"],"cinder_side"),Rn(s,0,-27,0,-34,6,5,"woodDark"),De(s,{x:0,z:-50,w:30,d:24,h:12,mat:"stoneDark",floorMat:"dirt",doors:{s:{width:6}}});for(const i of[-10,10])for(const r of[-58,-44])s.batch.cyl("stoneDark",[i,5,r],1.4,1.8,10,8),s.addCollider(i,r,1.8,1.8);s.batch.box("stone",[0,.7,-58],[4.4,1.4,4.4]);const e=new pt(new tn(.35,.7,1,8),new Ot({color:14214895,metalness:.9,roughness:.2,emissive:2771546,emissiveIntensity:.6}));e.position.set(0,2,-58),s.group.add(e);const n=new ze(11068159,14,24,2);return n.position.set(0,2.4,-58),s.group.add(n),s.lights.push(n),s.animated.push({type:"relic",obj:e,light:n,baseY:2}),s.addInteractable({id:"relic_bell",x:0,z:-58,y:2,radius:3.4,label:"Take the Silver Bell",icon:"bell",action:i=>i.takeRelic("silverBell","The Silver Bell",e,n)}),Le(s,-13,4,-50),Le(s,13,4,-50),Le(s,0,5,-60),s.finish()},frostfang(){const s=Wn("Frostfang Barrow");De(s,{x:0,z:10,w:18,d:16,h:7,mat:"stoneDark",floorMat:"ice",doors:{n:{width:5},s:{width:3}}}),qn(s,0,18.4,0,"Retreat from Frostfang"),Rn(s,0,2,0,-4,5,6,"stoneDark"),De(s,{x:0,z:-18,w:26,d:24,h:10,mat:"stoneDark",floorMat:"ice",doors:{s:{width:5},n:{width:6}}});for(const n of[-8,8])for(const i of[-26,-10])s.batch.cyl("iceDeep",[n,5,i],.8,1.6,10,7),s.batch.cone("ice",[n,10.6,i],1.1,2.2,6),s.addCollider(n,i,1.5,1.5);for(let n=0;n<14;n++){const i=n/14*Math.PI*2;s.batch.cone("crystal",[Math.cos(i)*11,.7,-18+Math.sin(i)*9],.35,2.4,5,[.1,i,.2])}Rn(s,0,-30,0,-36,6,7,"stoneDark"),De(s,{x:0,z:-54,w:34,d:30,h:15,mat:"stoneDark",floorMat:"ice",doors:{s:{width:6}}});for(let n=0;n<16;n++){const i=n/16*Math.PI*2;s.batch.cone("crystal",[Math.cos(i)*14,1.2,-54+Math.sin(i)*12],.5,3.5,5,[.1,i,.2])}s.batch.box("stone",[0,.8,-67],[10,1.6,5]),s.batch.box("iceDeep",[0,2.4,-68],[6,3,1.2]);const t=new pt(new re(1.2,12,8),new Me({color:2821946}));t.position.set(0,5,-67),s.group.add(t);const e=new ze(10178047,20,30,2);return e.position.set(0,5.5,-67),s.group.add(e),s.lights.push(e),s.animated.push({type:"void",obj:t,light:e}),Le(s,-12,4,-18),Le(s,12,4,-18),Le(s,-13,5,-54),Le(s,13,5,-54),s.finish()},whispercave(){const s=Wn("Whispering Cave");De(s,{x:0,z:6,w:18,d:14,h:5,mat:"stoneDark",floorMat:"dirt",doors:{n:{width:4},s:{width:3}}}),qn(s,0,12.4,0,"Leave the cave"),Rn(s,0,-1,0,-6,4,4,"stoneDark"),De(s,{x:0,z:-18,w:20,d:18,h:6,mat:"stoneDark",floorMat:"dirt",doors:{s:{width:4}}});for(let n=0;n<9;n++){const i=n/9*Math.PI*2;s.batch.cone("crystal",[Math.cos(i)*7,.6,-18+Math.sin(i)*6],.3,1.5,5,[.2,i,.2])}s.addChest(-4,-21,["dreamHerb","healthPotion","gold"],"whisper_herb"),s.batch.box("stone",[5,.5,-20],[2,1,2]);const t=new pt(new re(.3,8,6),new Me({color:10479871,transparent:!0,opacity:.8}));t.position.set(5,2,-20),s.group.add(t);const e=new ze(8378344,8,14,2);return e.position.set(5,2.2,-20),s.group.add(e),s.lights.push(e),s.animated.push({type:"wisp",obj:t,light:e}),Le(s,-7,2.5,2),Le(s,7,2.5,-12),s.finish()},secrets(){const s=Wn("The Hollow Hollow");De(s,{x:0,z:0,w:16,d:14,h:4.5,mat:"stoneDark",floorMat:"dirt",doors:{s:{width:3}}}),qn(s,0,6.4,0,"Leave the hidden cave");for(let e=0;e<10;e++){const n=e/10*Math.PI*2;s.batch.cone("crystal",[Math.cos(n)*6,.5,Math.sin(n)*5],.22,1.1,5,[.2,n,.3])}s.addChest(0,-3,["moonBow","wardenArmor","healthPotion","gold"],"secret_chest"),s.batch.box("stone",[0,.3,-5],[5,.6,1.2]),s.batch.box("bone",[0,.8,-5],[.5,.4,.5]);const t=new ze(10479871,8,18,2);return t.position.set(0,2.5,0),s.group.add(t),s.lights.push(t),s.finish()}};function Ix(s){const t=Px[s];if(!t)throw new Error("Unknown interior "+s);return t()}function Dx(s){return s==="tavern"?{x:0,z:7.2,yaw:Math.PI}:s==="shop"?{x:0,z:5.6,yaw:Math.PI}:s==="castlehall"?{x:0,z:10.2,yaw:Math.PI}:s==="cottage"?{x:0,z:4.6,yaw:Math.PI}:s==="pawbarrow"?{x:0,z:12.5,yaw:Math.PI}:s==="cinderdeep"?{x:0,z:14.5,yaw:Math.PI}:s==="frostfang"?{x:0,z:16.5,yaw:Math.PI}:s==="whispercave"?{x:0,z:10.5,yaw:Math.PI}:s==="secrets"?{x:0,z:4.5,yaw:Math.PI}:{x:0,z:5,yaw:Math.PI}}const Nn=(s,t)=>{const e=new Mt(t),n=s.attributes.position.count,i=new Float32Array(n*3);for(let r=0;r<n;r++)i[r*3]=e.r,i[r*3+1]=e.g,i[r*3+2]=e.b;return s.setAttribute("color",new we(i,3)),s};function Lx(){const s=[],t=new tn(.22,.36,3.2,5);t.translate(0,1.6,0),Nn(t,"#4a3524"),s.push(t);const e=[{y:2.4,r:2.6,h:3.2,col:"#294238"},{y:4.5,r:2.1,h:2.9,col:"#2d4a3d"},{y:6.4,r:1.55,h:2.6,col:"#315144"},{y:8.1,r:1,h:2.2,col:"#365a4b"}];for(const n of e){const i=new Ie(n.r,n.h,7);i.translate(0,n.y,0),Nn(i,n.col),s.push(i);const r=new Ie(n.r*.82,n.h*.48,7);r.translate(0,n.y+n.h*.22,0),Nn(r,"#e6edf1"),s.push(r)}return gn(s,!1)}function Ux(){const s=[],t=new tn(.18,.34,5.2,5);t.translate(0,2.6,0),Nn(t,"#4b3a2b"),s.push(t);for(let e=0;e<5;e++){const n=new tn(.05,.13,2.6,4);n.translate(0,1.3,0),n.rotateZ(.7+e%3*.22),n.rotateY(e*1.25),n.translate(0,2.8+e%3*.6,0),Nn(n,"#4b3a2b"),s.push(n)}return gn(s,!1)}function kx(){const s=[],t=new Fi(1.5,0);t.scale(1.3,.8,1.1),t.translate(0,.7,0),Nn(t,"#6a7077"),s.push(t);const e=new Fi(1.1,0);return e.scale(1.25,.3,1.1),e.translate(0,1.35,0),Nn(e,"#e2eaef"),s.push(e),gn(s,!1)}function Nx(){const s=[],t=new ga(.9,0);t.scale(1.4,.8,1.2),t.translate(0,.5,0),Nn(t,"#4f5c45"),s.push(t);const e=new ga(.75,0);return e.scale(1.3,.35,1.1),e.translate(0,.95,0),Nn(e,"#dfe8ed"),s.push(e),gn(s,!1)}function Fx(){const s=[];for(let t=0;t<3;t++){const e=new Ie(.1,.9,3);e.rotateZ(.2+t*.2),e.rotateY(t*2.1),e.translate((t-1)*.2,.45,0),Nn(e,"#9d9a72"),s.push(e)}return gn(s,!1)}class zx{constructor(t,e=91731){this.scene=t,this.seed=e,this.rng=fl(e+44),this.terrain=new gx(e),this.group=new Kt,this.group.name="outdoor",t.add(this.group),this.colliders=[],this.interactables=[],this.chests=[],this.animated=[],this.batch=new cu,this.interiors=new Map,this.activeInterior=null,this.activeInteriorId=null,this.returnPosition=null,this.lastArea=null,this.roadPoints=[],this.build()}addCollider(t,e,n,i,r=0,a=!1){this.colliders.push({x:t,z:e,hx:n,hz:i,ry:r,circle:a})}addInteractable(t){return t.y===void 0&&(t.y=this.terrain.heightAt(t.x,t.z)+1),t.radius=t.radius||3,this.interactables.push(t),t}addChest(t,e,n,i,r=null){const a=hu(this,t,e,r);return a.items=n,a.id=i,this.chests.push(a),this.addInteractable({id:"chest_"+i,x:t,z:e,y:a.y+.8,radius:2.6,label:"Open chest",icon:"chest",chest:a,action:o=>o.openChest(a)}),a}addGlow(t,e,n,i=16761975,r=2){const a=new Rs(new Wi({map:Is(),color:i,transparent:!0,opacity:.42,depthWrite:!1,blending:pn}));a.position.set(t,e,n),a.scale.set(r,r,1),this.group.add(a)}build(){const t=this.terrain;this.terrainMesh=t.buildMesh(),this.group.add(this.terrainMesh),this.water=t.buildWater(),this.group.add(this.water),this.roads=t.buildRoads(),this.group.add(this.roads),this.roadPoints=t.roadPoints||[];const e=vx();this.sky=e.mesh,this.skyUniforms=e.uniforms,this.group.add(this.sky),this.stars=yx(this.rng),this.group.add(this.stars),this.clouds=_x(this.rng),this.group.add(this.clouds),this.hemi=new Bl(13624047,5130814,1.35),this.scene.add(this.hemi),this.ambient=new Qh(9414328,.25),this.scene.add(this.ambient),this.sun=new va(16769456,2.1),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(1024,1024),this.sun.shadow.camera.left=-55,this.sun.shadow.camera.right=55,this.sun.shadow.camera.top=55,this.sun.shadow.camera.bottom=-55,this.sun.shadow.camera.near=1,this.sun.shadow.camera.far=260,this.sun.shadow.bias=-7e-4,this.scene.add(this.sun),this.scene.add(this.sun.target),this.moonLight=new va(9417960,0),this.scene.add(this.moonLight);const n=new pt(new re(18,16,12),new Me({color:14543090,fog:!1}));n.position.set(-400,500,-600),this.group.add(n),this.moon=n,this.scene.fog=new Pl(12570840,.0025),this.buildCities(),this.buildWilds(),this.buildDungeonMouths(),this.buildNature(),this.buildBridges(),this.batch.build(this.group),this.buildBirds(),this.finalize(),this.setTime(9.2)}buildCities(){const t=this;this.rng;{je(t,{x:200,z:288,ry:-.25,width:8,depth:10,style:"wood",name:"Enter Gull's House",enter:"cottage"}),je(t,{x:210,z:328,ry:.2,width:9,depth:9,style:"plaster",name:"Enter Mittens' House"}),je(t,{x:162,z:352,ry:.7,width:8,depth:10,style:"wood",name:"Enter the Fisher's House"}),je(t,{x:198,z:272,ry:-.6,width:7,depth:8,style:"wood",name:"Enter the Net Mender's House"}),je(t,{x:146,z:330,ry:1.35,width:8,depth:9,style:"plaster",name:"Enter the Salty Whisker"}),Xs(t,180,315),dh(t,150,300,Math.PI/2,30),dh(t,152,278,Math.PI/2,18),go(t,123,302,.1),go(t,118,322,-.2),go(t,128,276,.3),wi(t,192,346,.2,20),wi(t,226,304,Math.PI/2,18),dn(t,190,352,"PAWMOUTH"),dn(t,160,270,"WHISKERHOLD  ›"),ds(t,172,320),ds(t,195,312),ds(t,186,296),Yr(t,190,318,.2,"clothRed"),bn(t,160,310,0,.8),bn(t,161,311,0,.6),ms(t,158,308,0),bn(t,152,298,1.45,.7),bn(t,153,299,1.45,.5);for(let e=0;e<3;e++){t.batch.box("woodDark",[160+e*4,t.terrain.heightAt(160+e*4,340)+1.2,340],[.12,2.4,.12]),t.batch.box("wood",[160+e*4,t.terrain.heightAt(160+e*4,340)+2.2,340],[3.8,.08,.08]);for(let n=0;n<4;n++)t.batch.sphere("bone",[159+e*4+n*.8,t.terrain.heightAt(160+e*4,340)+1.7,340],.16,5,[1,.4,.6])}t.addInteractable({id:"fish_pawsmouth",x:128,z:300,y:Pi+1.2,radius:3.5,label:"Fish from the dock",icon:"fish",action:e=>e.fish()}),t.batch.box("woodDark",[206,t.terrain.heightAt(206,312)+1.3,312],[.2,2.6,.2]),t.batch.box("wood",[206,t.terrain.heightAt(206,312)+2.1,312],[2.6,1.5,.14],[0,.3,0]),t.batch.box("clothCream",[206.1,t.terrain.heightAt(206,312)+2.1,312.09],[2.2,1.15,.05],[0,.3,0])}{us(t,-332,-80,76,0,8.5,2.8),us(t,-228,-80,76,0,8.5,2.8),uh(t,-280,-80,0,12,12),us(t,-280,-240,190,0,8.5,2.8),us(t,-375,-160,160,Math.PI/2,8.5,2.8),us(t,-185,-160,160,Math.PI/2,8.5,2.8);for(const[h,u]of[[-375,-80],[-185,-80],[-375,-240],[-185,-240]])Cn(t,h,u,5,17,!0);for(const[h,u]of[[-375,-160],[-185,-160],[-280,-240]])Cn(t,h,u,4,14,!0);Yn(t,-286,t.terrain.heightAt(-286,-80)+9.5,-80+2.7,2.6,6,"clothTeal"),Yn(t,-274,t.terrain.heightAt(-274,-80)+9.5,-80+2.7,2.6,6,"clothTeal");for(let h=0;h<14;h++){const u=-86-h*6;t.batch.box("stoneLight",[-280,t.terrain.heightAt(-280,u)+.08,u],[7,.12,5.8],[0,.04,0])}mo(t,{x:-280,z:-218,ry:0,width:22,depth:20,name:"Enter the Hall of Nine Bells",enter:"castlehall"}),Cn(t,-300,-218,3.5,14,!0),Cn(t,-260,-218,3.5,14,!0),mo(t,{x:-332,z:-154,ry:.1,width:14,depth:16,name:"Enter The Leaky Whisker",enter:"tavern"}),je(t,{x:-230,z:-160,ry:-.1,width:11,depth:10,style:"plaster",name:"Enter Nine Lives Goods",enter:"shop"});const c=[[-352,-112,.2,9,10,"wood"],[-314,-112,-.1,8,9,"plaster"],[-352,-196,-.2,8,10,"plaster"],[-216,-196,.15,9,10,"wood"],[-218,-112,-.3,8,8,"wood"],[-258,-110,.3,7,8,"plaster"],[-352,-70,0,8,8,"wood"],[-208,-70,0,8,8,"plaster"]];for(const[h,u,d,p,g,x]of c)je(t,{x:h,z:u,ry:d,width:p,depth:g,style:x,name:"Enter the house",enter:x==="plaster"&&h===-352?"cottage":null});ph(t,-280,-130,.1),Xs(t,-248,-136),Yr(t,-298,-146,.4,"clothRed"),Yr(t,-264,-146,-.3,"clothTeal"),Yr(t,-310,-126,1.1,"clothBlue");for(let h=0;h<8;h++)ds(t,-280+(h%2?18:-18),-100-Math.floor(h/2)*24);bn(t,-330,-142,0,.8),ms(t,-326,-140,0),ms(t,-325,-142,0),bn(t,-234,-150,0,.7),dn(t,-280,-92,"WHISKERHOLD"),dn(t,-282,-250,"HIGHPaw  ›"),Yn(t,-292,t.terrain.heightAt(-292,-208)+13,-208,2.6,6,"clothTeal"),Yn(t,-268,t.terrain.heightAt(-268,-208)+13,-208,2.6,6,"clothTeal")}{const i=this.terrain.heightAt(238,-292);for(let r=0;r<8;r++){const a=r/8*Math.PI*2,o=238+Math.cos(a)*44,l=-292+Math.sin(a)*44;us(t,o,l,34,-a+Math.PI/2,9,2.8)}for(let r=0;r<4;r++){const a=r/4*Math.PI*2+Math.PI/4;Cn(t,238+Math.cos(a)*44,-292+Math.sin(a)*44,4.5,16,!0)}uh(t,238,-246,0,12,12),mo(t,{x:238,z:-300,ry:0,width:26,depth:24,name:"Enter Highpaw Hall",enter:"castlehall"}),Cn(t,220,-312,4,18,!0),Cn(t,256,-312,4,18,!0),Cn(t,220,-286,3.5,14,!0),Cn(t,256,-286,3.5,14,!0),ph(t,238,-262,0),Xs(t,260,-270);for(let r=0;r<6;r++)ds(t,218+r%2*40,-278+Math.floor(r/2)*12);Yn(t,229,i+13,-290,2.8,6.5,"clothRed"),Yn(t,247,i+13,-290,2.8,6.5,"clothRed"),dn(t,238,-238,"HIGHPaw KEEP")}{bx(t,-416,118,.2),Mx(t,-358,110),je(t,{x:-386,z:150,ry:.3,width:10,depth:12,style:"plaster",name:"Enter the Farmhouse",enter:"cottage"}),je(t,{x:-410,z:158,ry:-.4,width:8,depth:9,style:"wood",name:"Enter the Bunkhouse"}),je(t,{x:-364,z:156,ry:.8,width:8,depth:9,style:"wood",name:"Enter the Grain Store"}),Xs(t,-390,140);for(let i=0;i<4;i++)for(let r=0;r<3;r++){const a=-436+i*11,o=172+r*10,l=this.terrain.heightAt(a,o);this.batch.box("dirt",[a,l+.08,o],[9,.16,7]);for(let c=0;c<4;c++)this.batch.sphere("clothCream",[a-3+c*2,l+.3,o],.3,5,[1,.5,1])}wi(t,-436,196,0,40),wi(t,-436,196,Math.PI/2,30),wi(t,-380,196,0,34),this.batch.box("woodDark",[-412,this.terrain.heightAt(-412,180)+1.4,180],[.15,2.8,.15]),this.batch.box("woodDark",[-412,this.terrain.heightAt(-412,180)+2.2,180],[2.2,.12,.12]),this.batch.sphere("clothCream",[-412,this.terrain.heightAt(-412,180)+2.6,180],.45,6),this.batch.cone("clothRed",[-412,this.terrain.heightAt(-412,180)+3.15,180],.55,.6,5),dn(t,-390,200,"HEARTHWHISKER"),bn(t,-372,142,0,.8),ms(t,-370,143,0)}{je(t,{x:334,z:198,ry:.4,width:9,depth:10,style:"wood",name:"Enter the Apothecary",enter:"cottage"}),je(t,{x:366,z:218,ry:-.3,width:8,depth:9,style:"plaster",name:"Enter the Hunter's Lodge"}),je(t,{x:342,z:226,ry:.2,width:8,depth:10,style:"wood",name:"Enter the Furrier"}),je(t,{x:376,z:188,ry:-.6,width:7,depth:8,style:"wood",name:"Enter the Storehouse"}),Cn(t,388,180,3.5,15,!0),Xs(t,354,212),wi(t,322,238,0,30),wi(t,322,238,Math.PI/2,18);for(let i=0;i<4;i++)ds(t,338+i*10,208);dn(t,354,240,"FROSTPELT"),bn(t,372,210,0,.8),bn(t,373,211,0,.6),ms(t,370,208,0)}wx(t),Ax(t,258,72),this.addChest(266,66,["lute","gold","healthPotion"],"bandit_lute"),this.addInteractable({id:"bandit_orders",x:252,z:68,y:this.terrain.heightAt(252,68)+1.2,radius:2.2,label:"Read muddy orders",icon:"scroll",action:e=>e.readNote("The orders are smudged. You can make out: “Dig where the snow does not melt. The Hollow pay double.”")}),dn(t,240,60,"SCARWOOD"),this.addChest(-300,268,["gold","healthPotion","fish"],"lake_chest"),this.addChest(-462,-30,["manaPotion","cheese","gold"],"forest_chest"),this.addChest(320,350,["staminaPotion","healthPotion","gold"],"mountain_chest"),fh(t,-500,24),this.addInteractable({id:"enter_secrets",x:-500,z:24,y:this.terrain.heightAt(-500,24)+1.4,radius:4.5,label:"Enter a hidden cave",icon:"cave",action:e=>e.world.enterInterior("secrets",e)}),this.addChest(-374,-200,["gold","manaPotion","healthPotion"],"city_secret"),this.addInteractable({id:"city_shrine",x:-280,z:-130,y:this.terrain.heightAt(-280,-130)+1.6,radius:3.5,label:"Touch the statue of the First Cat",icon:"shrine",action:e=>e.restAtShrine("Whiskerhold",-280,-122,this.terrain.heightAt(-280,-122))})}buildWilds(){this.rng;const t=[{x:-120,z:-40,t:"camp"},{x:80,z:-360,t:"camp"},{x:-470,z:300,t:"stones"},{x:300,z:380,t:"stones"},{x:40,z:-240,t:"stones"},{x:-200,z:400,t:"camp"}];for(const r of t){const a=this.terrain.heightAt(r.x,r.z);if(r.t==="camp"){for(let o=0;o<4;o++){const l=o/4*Math.PI*2;this.batch.box("stoneDark",[r.x+Math.cos(l)*.9,a+.2,r.z+Math.sin(l)*.9],[.5,.35,.5],[0,l,0])}this.batch.box("woodDark",[r.x,a+.2,r.z],[1.4,.2,1.4],[0,.6,0]),bn(this,r.x+2,a,r.z+1,.6)}else for(let o=0;o<5;o++){const l=o/5*Math.PI*2,c=r.x+Math.cos(l)*6,h=r.z+Math.sin(l)*6,u=this.terrain.heightAt(c,h);this.batch.box("stoneDark",[c,u+1.8,h],[1.1,3.6,.8],[0,-l,.03]),this.batch.box("crystal",[c-Math.sin(l)*.42,u+2.2,h-Math.cos(l)*.42],[.08,.6,.35],[0,-l,0])}}const e=-350,n=250,i=this.terrain.heightAt(e,n);for(let r=0;r<8;r++)this.batch.cone("ice",[e+(r-4)*.8,i+1.2,n],.35,2.4,5,[.1,r,.15]);for(let r=0;r<7;r++){const a=r/7*Math.PI*2,o=-300+Math.cos(a)*20,l=300+Math.sin(a)*20,c=this.terrain.heightAt(o,l);this.batch.box("stoneDark",[o,c+2.2,l],[1.3,4.4,1],[0,-a,.04])}}buildDungeonMouths(){Sx(this,-360,-344,1.3),this.addInteractable({id:"enter_pawbarrow",x:-360,z:-338,y:this.terrain.heightAt(-360,-338)+1.4,radius:5,label:"Descend into Sunken Pawbarrow",icon:"ruin",action:t=>t.world.enterInterior("pawbarrow",t)}),this.addChest(-338,-330,["gold","cheese","healthPotion"],"pawbarrow_out"),Tx(this,392,-356,Math.PI),Ex(this,-40,-590),fh(this,-126,336),dn(this,-360,-320,"SUNKEN PAWBARROW"),dn(this,392,-332,"CINDERDEEP"),dn(this,-40,-566,"FROSTFANG"),dn(this,-126,352,"WHISPERING CAVE")}buildNature(){const t=this.rng,e=(m,f,_=5)=>{for(let y=0;y<this.roadPoints.length;y+=2){const v=this.roadPoints[y];if(Math.abs(v.x-m)<_&&Math.abs(v.z-f)<_)return!0}return!1},n=Lx(),i=Ux(),r=kx(),a=Nx(),o=Fx(),l=new Ot({vertexColors:!0,roughness:.98,metalness:0,flatShading:!0}),c=[],h=[],u=[],d=[],p=[];let g=0;for(;c.length+h.length<1500&&g<22e3;){g++;const m=t.range(-660,660),f=t.range(-660,660),_=this.terrain.heightAt(m,f);if(_<Pi+.8||_>58||this.terrain.slopeAt(m,f)>.72||this.terrain.isNearLandmark(m,f,-8)||e(m,f,5.5))continue;const E=Fe(.36,.62,.55+(Math.sin(m*.017)+Math.cos(f*.013))*.12)*(.5+Math.sin(m*.041+f*.023)*.25);if(t.next()>E*1.5)continue;const C=t.range(.55,1.35),I={x:m,z:f,y:_-.15,s:C,ry:t.next()*Math.PI*2};t.chance(.78)?c.push(I):h.push(I)}for(let m=0;m<460;m++){const f=t.range(-660,660),_=t.range(-660,660),y=this.terrain.heightAt(f,_);y<Pi+.3||this.terrain.isNearLandmark(f,_,-4)||u.push({x:f,z:_,y:y-.2,s:t.range(.5,2.2),ry:t.next()*6.28})}for(let m=0;m<620;m++){const f=t.range(-660,660),_=t.range(-660,660),y=this.terrain.heightAt(f,_);y<Pi+.4||y>55||this.terrain.isNearLandmark(f,_,-5)||e(f,_,4)||d.push({x:f,z:_,y:y-.1,s:t.range(.6,1.5),ry:t.next()*6.28})}for(let m=0;m<1600;m++){const f=t.range(-660,660),_=t.range(-660,660),y=this.terrain.heightAt(f,_);y<Pi+.5||y>50||this.terrain.isNearLandmark(f,_,-10)||e(f,_,3)||p.push({x:f,z:_,y:y-.05,s:t.range(.5,1.2),ry:t.next()*6.28})}const x=(m,f,_=!1)=>{if(!f.length)return null;const y=new rf(m,l,f.length),v=new Ae;for(let E=0;E<f.length;E++){const C=f[E];v.position.set(C.x,C.y,C.z),v.rotation.set(0,C.ry,0),v.scale.setScalar(C.s),v.updateMatrix(),y.setMatrixAt(E,v.matrix)}return y.instanceMatrix.needsUpdate=!0,y.castShadow=_,y.receiveShadow=!1,y.frustumCulled=!1,this.group.add(y),y};this.pines=x(n,c,!1),this.bares=x(i,h,!1),this.rocks=x(r,u,!1),this.bushes=x(a,d,!1),this.grasses=x(o,p,!1),this.natureCount=c.length+h.length}buildBridges(){const t=[{z:270,ry:Math.PI/2},{z:170,ry:Math.PI/2},{z:30,ry:Math.PI/2},{z:-160,ry:Math.PI/2},{z:-340,ry:Math.PI/2},{z:306,ry:Math.PI/2}];for(const e of t){const n=aa(e.z);Cx(this,n,e.z,e.ry,34)}}buildBirds(){this.birds=[];const t=new ue,e=new Float32Array([-.6,0,0,0,.1,.2,0,0,0,.6,0,0,0,.1,.2,0,0,0]);t.setAttribute("position",new we(e,3));const n=new Me({color:2569018,side:Ge});for(let i=0;i<26;i++){const r=new pt(t,n);r.scale.setScalar(.8+this.rng.next());const a=this.rng.next()*Math.PI*2,o=this.rng.range(30,200);r.position.set(Math.cos(a)*o,this.rng.range(30,70),Math.sin(a)*o),r.userData={a,r:o,y:r.position.y,speed:this.rng.range(.05,.15),phase:this.rng.next()*6},this.group.add(r),this.birds.push(r)}}buildInteriorIfNeeded(t){if(!this.interiors.has(t)){const e=Ix(t);e.spawn=Dx(t),this.scene.add(e.group),this.interiors.set(t,e)}return this.interiors.get(t)}enterInterior(t,e){if(this.activeInterior)return;const n=this.buildInteriorIfNeeded(t);this.returnPosition={x:e.player.position.x,z:e.player.position.z,yaw:e.player.yaw},this.activeInterior=n,this.activeInteriorId=t,this.outdoorVisible(!1),n.group.visible=!0,this.colliders=n.colliders,this.interactables=n.interactables;const i=n.spawn;e.player.teleport(i.x,0,i.z,i.yaw),e.player.velocity.set(0,0,0),e.setIndoor(!0,n),e.audio.playDoor(),this.lastArea=n.name,e.currentArea={id:t,name:n.name,sub:"Shelter from the snow",interior:!0},e.ui.showArea(n.name,"Shelter from the snow"),e.npcs.setInterior(t),e.enemies?.setInterior?.(t),e.quests?.event?.("reach",t,1)}exitInterior(t){if(!this.activeInterior)return;const e=this.activeInterior;e.group.visible=!1,this.activeInterior=null,this.activeInteriorId=null,this.outdoorVisible(!0),this.colliders=this.outdoorColliders||[],this.interactables=this.outdoorInteractables||[];const n=this.returnPosition||{x:178,z:346,yaw:Math.PI};t.player.teleport(n.x,this.terrain.heightAt(n.x,n.z)+.1,n.z,n.yaw),t.player.velocity.set(0,0,0),t.setIndoor(!1,null),t.audio.playDoor(),t.npcs.setInterior(null),t.enemies?.setInterior?.(null),this.lastArea=null}outdoorVisible(t){this.group.visible=t,this.hemi.visible=t,this.ambient.visible=t,this.sun.visible=t,this.moonLight.visible=t,t&&(this.colliders=this.outdoorColliders||[],this.interactables=this.outdoorInteractables||[])}tryFrostDoor(t){const e=t.inventory;if(e.has("emberRelic")&&e.has("silverBell"))t.ui.toast("The Ember and Bell answer. The door remembers warmth.","magic"),this.enterInterior("frostfang",t);else{const n=[];e.has("emberRelic")||n.push("the First Ember"),e.has("silverBell")||n.push("the Silver Bell"),t.ui.toast("Two sockets wait. You are missing "+n.join(" and ")+".","bad"),t.audio.playFail()}}setTime(t){this.hours=t;const e=Math.sin((t-6)/24*Math.PI*2),n=(t-6)/24*Math.PI*2,i=new T(Math.cos(n)*.8,e,Math.sin(n)*.5).normalize();this.sunDir=i,this.skyUniforms.sunDir.value.copy(i);const r=1-Fe(-.14,.22,e);this.night=r,this.skyUniforms.night.value=r,this.skyUniforms.time.value=performance.now()*.001;const a=1-Math.min(1,Math.abs(e)/.35),o=new Mt("#1c4257").lerp(new Mt("#090d18"),r),l=new Mt("#b9cdd6").lerp(new Mt("#2a3448"),r),c=new Mt("#6d8794").lerp(new Mt("#141a24"),r);this.skyUniforms.topColor.value.copy(o),this.skyUniforms.horizonColor.value.copy(l),this.skyUniforms.bottomColor.value.copy(c),this.skyUniforms.sunColor.value.set(a>.5?"#ff9b63":"#ffe4b8"),this.stars.material.opacity=r*.9,this.moon.position.set(-i.x*700,Math.max(120,-i.y*700+120),-i.z*700),this.moon.visible=r>.15,this.sun.intensity=Math.max(0,e)*2.6+.05,this.sun.color.set(a>.55?16754539:16773328),this.moonLight.intensity=r*.45,this.hemi.intensity=.55+(1-r)*.9,this.hemi.color.set(r>.5?5204618:13624047),this.hemi.groundColor.set(r>.5?1712168:5130814),this.ambient.intensity=.16+(1-r)*.12,this.clouds.children.forEach(h=>h.material.opacity=.5*(1-r*.8)),this.water&&this.water.material.color.set(r>.5?1588298:3038059),this.scene.fog&&this.scene.fog.color.copy(new Mt("#bfd0d8").lerp(new Mt("#101826"),r)),$n.window.emissiveIntensity=.25+r*2.8;for(const h of this.animated)h.light&&(h.light.intensity=(h.type==="flame"?9:12)*(.45+r*.9))}update(t,e){const n=performance.now()*.001;this.waterTex&&(this.waterTex.offset.x+=t*.004,this.waterTex.offset.y+=t*.002);for(const i of this.animated)i.type==="flame"?(i.obj.scale.y=.85+Math.sin(n*9+i.baseY)*.15,i.obj.scale.x=.9+Math.sin(n*7.1+i.baseY)*.08,i.obj.position.y=i.baseY+Math.sin(n*5+i.baseY)*.04,i.light&&(i.light.intensity=(9+Math.sin(n*13)*2)*(.45+this.night*.9))):i.type==="relic"?(i.obj.rotation.y+=t*.8,i.obj.position.y=i.baseY+Math.sin(n*1.4)*.12,i.light&&(i.light.intensity=12+Math.sin(n*2.2)*3)):i.type==="wisp"?(i.obj.position.y=2+Math.sin(n*1.6)*.4,i.obj.position.x=5+Math.sin(n*.7)*1.4):i.type==="void"?(i.obj.scale.setScalar(1+Math.sin(n*1.3)*.06),i.obj.rotation.y+=t*.2):i.type==="windmill"&&(i.obj.rotation.z+=t*.5);if(this.birds)for(const i of this.birds){const r=i.userData;r.a+=t*r.speed*.4,i.position.x=Math.cos(r.a)*r.r,i.position.z=Math.sin(r.a)*r.r,i.position.y=r.y+Math.sin(n*.5+r.phase)*3,i.rotation.y=-r.a,i.visible=this.night<.6}if(e.player){const i=e.player.position,r=this.sunDir?this.sunDir.clone().multiplyScalar(110):new T(40,90,40);this.sun.position.set(i.x+r.x,i.y+Math.max(40,r.y),i.z+r.z),this.sun.target.position.set(i.x,i.y,i.z),this.sun.target.updateMatrixWorld(),this.moonLight.position.set(i.x-r.x,i.y+60,i.z-r.z);const a=this.locationAt(i.x,i.z);a&&a.id!==this.lastArea&&(this.lastArea=a.id,e.onAreaChange(a))}for(const i of this.chests)i.opened?(i.glow.material.opacity=Math.max(0,i.glow.material.opacity-t*.7),i.lidPivot&&(i.lidPivot.rotation.x=Math.min(1.9,i.lidPivot.rotation.x+t*4))):i.glow.material.opacity=.25+Math.sin(n*2.4+i.x)*.12}locationAt(t,e){if(this.activeInterior)return{id:this.activeInterior.name,name:this.activeInterior.name,sub:"Shelter from the snow",interior:!0};let n=null;for(const i in Sn){const r=Sn[i];if(r.radius<30)continue;const a=Math.hypot(t-r.x,e-r.z);a<r.radius&&(!n||a<n.d)&&(n={id:i,name:r.name,sub:r.sub,d:a})}return n||(e<-470?{id:"frostfang_approach",name:"The Frostfang Approach",sub:"The wind has teeth here"}:t>330?{id:"cinder_foothills",name:"Cinderpeak Foothills",sub:"Warm stone under cold snow"}:t<-330?{id:"hearth_vale",name:"Hearthwhisker Vale",sub:"Turnip country"}:e>380?{id:"south_reach",name:"The Pale Reach",sub:"Snow, pines, and very opinionated crows"}:{id:"catterfall",name:"Catterfall",sub:"The kingdom beneath the snow"})}groundHeight(t,e){return this.activeInterior?0:this.terrain.heightAt(t,e)}collidesCircle(t,e,n=.4){for(const i of this.colliders)if(i.circle){if(Math.hypot(t-i.x,e-i.z)<i.hx+n)return!0}else{const r=t-i.x,a=e-i.z,o=Math.cos(-i.ry||0),l=Math.sin(-i.ry||0),c=r*o-a*l,h=r*l+a*o,u=Math.max(-i.hx,Math.min(i.hx,c)),d=Math.max(-i.hz,Math.min(i.hz,h));if(Math.hypot(c-u,h-d)<n)return!0}return!1}collectOutdoorState(){this.outdoorColliders=this.outdoorColliders||this.colliders,this.outdoorInteractables=this.outdoorInteractables||this.interactables}finalize(){this.outdoorColliders=this.colliders,this.outdoorInteractables=this.interactables}}const Si=new Ot({vertexColors:!0,roughness:.92,metalness:0});new Ot({vertexColors:!0,roughness:1,metalness:0});const Bx=new Me({vertexColors:!0}),fu=new Ot({color:11451329,metalness:.85,roughness:.32,flatShading:!0}),ml=new Ot({color:6055531,metalness:.7,roughness:.45,flatShading:!0}),Aa=new Ot({color:5913640,roughness:.9,flatShading:!0}),Ox=new wa({color:16777215,transparent:!0,opacity:.45}),Hx=new Ot({color:15261647,roughness:.5,metalness:.1}),Gx=s=>new Mt(s);function pu(s,t){const e=Gx(t),n=s.attributes.position.count,i=new Float32Array(n*3);for(let r=0;r<n;r++)i[r*3]=e.r,i[r*3+1]=e.g,i[r*3+2]=e.b;return s.setAttribute("color",new we(i,3)),s}function dr(s,t,e,n=[0,0,0],i=[0,0,0],r=[1,1,1]){return t.scale(r[0],r[1],r[2]),(i[0]||i[1]||i[2])&&(t.rotateX(i[0]),t.rotateY(i[1]),t.rotateZ(i[2])),t.translate(n[0],n[1],n[2]),pu(t,e),s.push(t),t}function ge(s,t,e,n,i=8,r=[1,1,1],a=[0,0,0]){return dr(s,new re(n,i,Math.max(5,i-2)),t,e,a,r)}function Ti(s,t,e,n,i,r=[1,1,1],a=[0,0,0]){return dr(s,new Li(n,i,3,7),t,e,a,r)}function fn(s,t,e,n,i=[0,0,0]){return dr(s,new Ve(n[0],n[1],n[2]),t,e,i)}function an(s,t,e,n,i,r=5,a=[0,0,0],o=[1,1,1]){return dr(s,new Ie(n,i,r),t,e,a,o)}function xo(s,t,e,n,i,r,a=7,o=[0,0,0]){return dr(s,new tn(n,i,r,a),t,e,o)}function li(s){if(!s.length)return null;const t=gn(s,!1);return s.forEach(e=>e.dispose()),t}function Vx(s){const t=new Kt,e=s==="oathBlade"?new Ot({color:14270586,metalness:.9,roughness:.22,emissive:4863505,emissiveIntensity:.4,flatShading:!0}):fu,n=new pt(new Ve(.065,.78,.016),e);n.position.y=.48;const i=new pt(new Ie(.046,.14,4),e);i.position.y=.94,i.rotation.y=Math.PI/4;const r=new pt(new Ve(.26,.04,.05),ml);r.position.y=.08;const a=new pt(new tn(.028,.032,.22,6),Aa);a.position.y=-.05;const o=new pt(new re(.042,6,5),ml);return o.position.y=-.18,t.add(n,i,r,a,o),t}function Wx(){const s=new Kt,t=new pt(new tn(.028,.034,.92,6),Aa);t.position.y=.4;const e=new pt(new Ve(.04,.28,.3),fu);e.position.set(0,.82,.1);const n=new pt(new Ie(.17,.3,4),new Ot({color:12577279,metalness:.8,roughness:.2,emissive:1788774,emissiveIntensity:.5,flatShading:!0}));return n.rotation.z=Math.PI/2,n.rotation.y=Math.PI/4,n.position.set(0,.82,.26),n.scale.set(.5,1,1),s.add(t,e,n),s}function qx(){const s=new Kt,t=new pt(new tn(.026,.034,1.4,6),Aa);t.position.y=.55;const e=new pt(new ur(.1,.018,5,8,Math.PI*1.4),ml);e.position.y=1.25,e.rotation.z=-.2;const n=new pt(new re(.07,8,6),new Ot({color:16753994,emissive:16742946,emissiveIntensity:1.4,roughness:.3}));return n.position.y=1.27,s.add(t,e,n),s.userData.orb=n,s}function Xx(){const s=new Kt;for(let t=-1;t<=1;t++){const e=new pt(new Ie(.014,.13,4),Hx);e.position.set(t*.035,.04,.02),e.rotation.x=Math.PI*.6,s.add(e)}return s}function Yx(){const s=new Kt,t=[];for(let a=0;a<=10;a++){const o=a/10,l=-1.1+o*2.2;t.push(new T(Math.cos(l)*.34,Math.sin(l)*.55,0))}const e=new Fl(t),n=new pt(new zl(e,10,.018,4,!1),Aa),i=new ue().setFromPoints([t[0],new T(-.04,0,0),t[10]]),r=new Dl(i,new wa({color:14209728,transparent:!0,opacity:.7}));return s.add(n,r),s}function Ca(s={}){const t=or.find(ht=>ht.id===s.breed)||or[2],e=Bi.find(ht=>ht.id===s.fur)||Bi[0],n=Oi.find(ht=>ht.id===s.eye)||Oi[0],i=(s.scale||1)*t.scale,r=!!s.isPlayer,a=new Kt;a.scale.setScalar(i);const o=new Kt;a.add(o);const l=e.base,c=e.hi,h=e.dark,u=t.socks?"#e9e4d8":c,d=t.darkPoints?h:l,p=[];if(ge(p,l,[0,1.06,0],.3,9,[1.16,1.05,.92]),ge(p,l,[0,.84,0],.27,9,[1.1,.8,.95]),ge(p,c,[0,1.1,.16],.21,8,[.9,.95,.5]),t.fluff>1.1&&(ge(p,c,[0,1.33,.02],.22,8,[1.15,.55,1]),ge(p,c,[0,.9,-.2],.2,8,[1.2,.8,.7])),t.stripes){for(let ht=0;ht<3;ht++)fn(p,h,[0,1.16-ht*.14,.285],[.36-ht*.04,.035,.02],[0,0,ht%2?.08:-.08]);fn(p,h,[.18,1.3,.14],[.08,.2,.04],[0,0,.3]),fn(p,h,[-.18,1.3,.14],[.08,.2,.04],[0,0,-.3])}t.patches&&(ge(p,"#e9e2d2",[-.17,1.1,.17],.17,7,[.8,1.1,.5]),ge(p,"#3a3130",[.19,.97,.16],.15,7,[.9,.8,.5]),ge(p,"#c96b3a",[.08,1.28,.12],.13,7,[1,.7,.5]));const g=new pt(li(p),Si);g.castShadow=!0,g.receiveShadow=!0,o.add(g);const x=new Kt;x.position.set(0,1.5,.01),o.add(x);const m=[];ge(m,l,[0,.04,0],.285,10,[1,.95,.92]),ge(m,c,[0,-.01,.2],.15,8,[1.2,.68,.85]),ge(m,c,[.15,-.02,.15],.1,7,[.9,.75,.7]),ge(m,c,[-.15,-.02,.15],.1,7,[.9,.75,.7]),ge(m,"#2a1a18",[0,.02,.318],.042,6,[1.15,.75,.6]),fn(m,h,[0,-.075,.315],[.018,.055,.02]),t.fluff>1&&(an(m,c,[.25,-.03,.08],.09,.2,4,[0,0,-1.1]),an(m,c,[-.25,-.03,.08],.09,.2,4,[0,0,1.1]));const f=.17,_=.29;an(m,d,[f,_,-.01],.135,.27,4,[0,.4,-.22]),an(m,d,[-f,_,-.01],.135,.27,4,[0,-.4,.22]),an(m,"#d68f8b",[f-.005,_-.015,.035],.08,.16,4,[0,.4,-.22]),an(m,"#d68f8b",[-f+.005,_-.015,.035],.08,.16,4,[0,-.4,.22]),t.tufts&&(an(m,c,[f+.03,_+.13,0],.035,.12,4,[0,0,-.35]),an(m,c,[-f-.03,_+.13,0],.035,.12,4,[0,0,.35])),fn(m,h,[.12,.135,.255],[.1,.022,.02],[0,0,-.2]),fn(m,h,[-.12,.135,.255],[.1,.022,.02],[0,0,.2]),t.darkPoints&&(ge(m,h,[0,.02,.27],.11,7,[1.25,.9,.45]),an(m,h,[f,_,-.01],.14,.28,4,[0,.4,-.22]),an(m,h,[-f,_,-.01],.14,.28,4,[0,-.4,.22]));const y=new pt(li(m),Si);y.castShadow=!0,x.add(y);const v=[];ge(v,n.color,[.112,.08,.252],.068,7,[1,1.18,.42]),ge(v,n.color,[-.112,.08,.252],.068,7,[1,1.18,.42]),fn(v,"#0b0b0d",[.112,.08,.282],[.018,.09,.012]),fn(v,"#0b0b0d",[-.112,.08,.282],[.018,.09,.012]),ge(v,"#ffffff",[.132,.112,.288],.014,5,[1,1,.4]),ge(v,"#ffffff",[-.092,.112,.288],.014,5,[1,1,.4]);const E=new pt(li(v),Bx);x.add(E);const C=[];for(const ht of[-1,1])for(let P=0;P<3;P++){const Pt=-.03+P*.035;C.push(new T(ht*.15,Pt,.3)),C.push(new T(ht*(.4+P*.03),Pt+.03-P*.02,.24+P*.015))}const I=new cf(new ue().setFromPoints(C),Ox);x.add(I);const D=new pt(new re(.05,6,5),new Me({color:4202274}));D.scale.set(1,.5,.4),D.position.set(0,-.075,.318),D.visible=!1,x.add(D);function M(ht){const P=new Kt;P.position.set(ht*.33,1.28,0);const Pt=[];Ti(Pt,l,[0,-.16,0],.085,.2,[1,1,.95]),Ti(Pt,ht>0?l:c,[0,-.4,.025],.07,.19,[1,1,.95]),ge(Pt,u,[0,-.57,.04],.09,7,[1,.8,1.05]);for(let Tt=-1;Tt<=1;Tt++){const gt=new Ie(.011,.055,4);gt.rotateX(Math.PI*.55),gt.translate(Tt*.026,-.61,.13),pu(gt,"#efe8da"),Pt.push(gt)}const bt=new pt(li(Pt),Si);return bt.castShadow=!0,P.add(bt),o.add(P),P}const w=M(1),L=M(-1);w.rotation.z=-.12,L.rotation.z=.12;function N(ht){const P=new Kt;P.position.set(ht*.155,.86,0);const Pt=[];Ti(Pt,l,[0,-.19,.01],.11,.2,[1,1,.95]),Ti(Pt,l,[0,-.46,.03],.08,.21,[1,1,.9]),ge(Pt,u,[0,-.71,.075],.1,7,[1,.62,1.5]);const bt=new pt(li(Pt),Si);return bt.castShadow=!0,P.add(bt),o.add(P),P}const B=N(1),$=N(-1),W=new Kt;W.position.set(0,.88,-.22),o.add(W);const Y=[],K=t.fluff*1;Ti(Y,l,[0,.02,-.12],.06*K,.2,[1,1,1],[.7,0,0]),Ti(Y,l,[0,.16,-.3],.055*K,.18,[1,1,1],[1.05,0,0]),Ti(Y,d,[0,.36,-.42],.05*K,.17,[1,1,1],[1.4,0,0]),ge(Y,d,[0,.5,-.47],.06*K,6,[1,1.2,1]);const V=new pt(li(Y),Si);V.castShadow=!0,W.add(V);const at=new Kt;o.add(at);let ct=null,mt=null,Bt=null,Jt=null;const ee=new Kt;ee.position.set(0,-.57,.05),w.add(ee);const Yt=new Kt;Yt.position.set(-.02,1.16,-.28),Yt.rotation.z=.3,o.add(Yt);function Z(ht){mt&&(ee.remove(mt),mt=null),ht&&(ht==="frostAxe"?mt=Wx():ht==="oakStaff"?mt=qx():ht==="clawWraps"?mt=Xx():mt=Vx(ht),mt&&(mt.position.set(0,0,0),mt.rotation.set(-.15,0,0),ee.add(mt)))}function J(ht){ct&&(at.remove(ct),ct=null);const P=he[ht];if(!P||P.type!=="armor")return;const Pt=[];if(ht==="mageRobe"){xo(Pt,"#6d4a86",[0,.72,0],.28,.46,.66,8),fn(Pt,"#c8a4e0",[0,1.08,.21],[.38,.1,.06]),an(Pt,"#4e3562",[.33,1.3,0],.13,.3,5,[0,0,-.3]),an(Pt,"#4e3562",[-.33,1.3,0],.13,.3,5,[0,0,.3]);for(const Tt of[-1,1])fn(Pt,"#d6b36a",[Tt*.3,.72,.08],[.02,.5,.02])}else{const bt=ht==="wardenArmor"?"#7d9aa8":ht==="ironArmor"?"#8a9397":"#6b4b32",Tt=ht==="wardenArmor"?"#cfe6ef":"#b08d5a";ge(Pt,bt,[0,1.08,.02],.31,8,[1.05,.9,1]),fn(Pt,Tt,[0,.98,.26],[.5,.06,.03]),ge(Pt,bt,[.33,1.3,0],.13,6,[1,.7,1]),ge(Pt,bt,[-.33,1.3,0],.13,6,[1,.7,1]),ht==="wardenArmor"&&an(Pt,Tt,[0,1.36,.06],.06,.16,5),xo(Pt,"#4a3322",[0,.88,0],.29,.3,.08,8)}ct=new pt(li(Pt),Si),ct.castShadow=!0,at.add(ct)}function vt(ht){Bt&&(Yt.remove(Bt),Bt=null),ht&&(Bt=Yx(),Bt.scale.setScalar(1.15),Bt.position.set(0,.1,-.04),Bt.rotation.set(0,.2,Math.PI*.55),Yt.add(Bt))}function Nt(ht){if(Jt&&(at.remove(Jt),Jt=null),!ht)return;const P=[];xo(P,ht,[0,1.34,.01],.23,.25,.09,9),fn(P,ht,[.1,1.18,.24],[.12,.32,.03],[.1,0,.16]),Jt=new pt(li(P),Si),at.add(Jt)}const G={phase:Math.random()*10,t:Math.random()*10,attack:0,hurt:0,cast:0,talk:0,dead:0,sit:0,sleep:0,blink:2+Math.random()*4,blinkT:0,speed:0,block:0,aim:0},$t={root:a,rig:o,head:x,bodyMesh:g,headMesh:y,eyeMesh:E,mouth:D,armR:w,armL:L,legR:B,legL:$,tailPivot:W,gear:at,handAnchor:ee,backAnchor:Yt,anim:G,scale:i,breed:t,fur:e,eye:n,isPlayer:r,weaponItem:null,armorItem:null,bowItem:null,setWeapon:Z,setArmor:J,setBow:vt,setScarf:Nt,setAppearance(ht){},playAttack(){G.attack=.42},playCast(){G.cast=.55},playHurt(){G.hurt=.3},playTalk(){G.talk=.16},die(){G.dead=1},revive(){G.dead=0},setVisible(ht){a.visible=ht},update(ht,P={}){G.t+=ht,G.attack=Math.max(0,G.attack-ht),G.hurt=Math.max(0,G.hurt-ht),G.cast=Math.max(0,G.cast-ht),G.talk=Math.max(0,G.talk-ht),G.blink-=ht,G.blink<=0&&(G.blinkT=.13,G.blink=2.2+Math.random()*4.5),G.blinkT=Math.max(0,G.blinkT-ht);const Pt=P.speed||0,bt=Pt>.15,Tt=sc.clamp((Pt-3.8)/4.5,0,1);G.speed=Pt;const gt=P.sitting?1:0;G.sit+=(gt-G.sit)*Math.min(1,ht*5);const de=P.sleeping?1:0;G.sleep+=(de-G.sleep)*Math.min(1,ht*4);const wt=P.blocking?1:0;G.block+=(wt-G.block)*Math.min(1,ht*10);const Gt=P.aiming?1:0;G.aim+=(Gt-G.aim)*Math.min(1,ht*8),bt&&(G.phase+=ht*(4.5+Pt*1.15));const Se=G.phase,fe=bt?Math.sin(Se):0,R=bt?Math.cos(Se):0,b=sc.clamp(Pt/4.2,.35,1.25);B.rotation.x=fe*.72*b-G.sit*1.45,$.rotation.x=-fe*.72*b-G.sit*1.45,B.rotation.z=G.sit*.16,$.rotation.z=-G.sit*.16,B.position.y=.86+Math.max(0,R)*.035*b-G.sit*.22,$.position.y=.86+Math.max(0,-R)*.035*b-G.sit*.22;let z=-fe*.55*b;G.sit>.2&&(z=-.5*G.sit);let X=z,Q=-z;if(G.attack>0){const Et=1-G.attack/.42,At=Math.sin(Et*Math.PI);X=-.7-At*2.1,w.rotation.z=-.12-At*.25}else w.rotation.z=-.12-G.block*.55;w.rotation.x=X-G.cast*1.3-G.aim*.65+G.sleep*.35,L.rotation.x=Q-G.cast*.4-G.aim*1.35+G.sleep*.35,L.rotation.z=.12+G.block*.35;const q=bt?Math.abs(fe)*.045*b:Math.sin(G.t*1.6)*.012;o.position.y=q-G.sit*.34-G.sleep*.05,o.rotation.x=Tt*.12-G.sit*.1+G.sleep*.18,o.rotation.z=bt?R*.025:0,g.scale.set(1,1+Math.sin(G.t*1.6)*.012,1),o.position.z=G.sleep*-.06,x.rotation.x=-Tt*.1+G.sleep*.35+G.hurt*.3,x.rotation.y=P.lookYaw||0,x.rotation.z=Math.sin(G.t*.7)*.02+(P.tilt||0),x.position.y=1.5+G.sit*.02;const Rt=bt?5.5:1.4;W.rotation.y=Math.sin(G.t*Rt)*(bt?.22:.4)*(1-G.sleep*.7),W.rotation.x=(bt?-.15-Tt*.35:.05)+G.sit*.4+G.sleep*.2,W.rotation.z=Math.cos(G.t*1.1)*.12;const rt=G.blinkT>0?.08:1;E.scale.y=rt*(1-G.sleep*.9),D.visible=G.talk>0||P.talking&&Math.sin(G.t*9)>.2,D.scale.y=.5+Math.abs(Math.sin(G.t*11))*.5,D.scale.x=1+Math.sin(G.t*5)*.1,G.dead&&(o.rotation.z+=(1.45-o.rotation.z)*Math.min(1,ht*4),o.position.y+=(-.05-o.position.y)*Math.min(1,ht*4)),mt&&mt.userData.orb&&mt.userData.orb.scale.setScalar(1+Math.sin(G.t*4)*.12)}};return a.userData.cat=$t,s.weapon&&Z(s.weapon),s.armor&&J(s.armor),s.bow&&vt(s.bow),s.scarf&&Nt(s.scarf),$t}function $x(s,t={}){const e=t.breed?or.find(r=>r.id===t.breed):s.pick(or),n=t.fur?Bi.find(r=>r.id===t.fur):s.pick(Bi),i=t.eye?Oi.find(r=>r.id===t.eye):s.pick(Oi);return{breed:e.id,fur:n.id,eye:i.id,scale:t.scale||1}}function Vl(s,t){if(!t)return;const e=typeof s.fur=="string"?s.fur:s.fur?.id,n=typeof s.eye=="string"?s.eye:s.eye?.id,i=Bi.find(a=>a.id===e)||Bi[0],r=Oi.find(a=>a.id===n)||Oi[0];t.style.setProperty("--fur",i.base),t.style.setProperty("--fur-hi",i.hi),t.style.setProperty("--eye",r.color)}const Zx=4.4,jx=8.1,Kx=2.7,Jx=2.3,Qx=24,tv=8.6;class mu{constructor(t,e={}){this.game=t,this.look=e.look||{breed:"tabby",fur:"ember",eye:"amber"},this.cls=e.cls||"wayfarer",this.name=e.name||"Moth",this.cat=Ca({...this.look,scale:1,isPlayer:!0}),this.group=this.cat.root,t.scene.add(this.group),this.position=new T(178,0,346),this.velocity=new T,this.yaw=Math.PI,this.camYaw=Math.PI,this.camPitch=.18,this.camDist=6.6,this.camTarget=new T;const n={wayfarer:[110,105,85],pyrewitch:[85,90,135],prowler:[95,135,75]}[this.cls]||[110,105,85];this.baseHealth=n[0],this.baseStamina=n[1],this.baseMana=n[2],this.maxHealth=n[0],this.maxStamina=n[1],this.maxMana=n[2],this.health=this.maxHealth,this.stamina=this.maxStamina,this.mana=this.maxMana,this.level=1,this.xp=0,this.xpNext=100,this.skillPoints=0,this.skills=Object.fromEntries(pl.map(i=>[i.id,0])),this.dead=!1,this.deathTimer=0,this.grounded=!0,this.swimming=!1,this.climbing=!1,this.sprinting=!1,this.blocking=!1,this.aiming=!1,this.invuln=0,this.hurtFlash=0,this.cameraShake=0,this.attackCd=0,this.spellCd={fireball:0,lightning:0,heal:0,ice:0},this.combatT=0,this.stepT=0,this.regenT=0,this.footT=0,this.bowCd=0,this.aimBlend=0,this.lastSafe={x:178,y:0,z:346},this.interactTarget=null,this.nearNPC=null,this.attackAnimT=0,this.castAnimT=0,this.hitEnemies=new Set,this.refreshGear(),this.teleport(this.position.x,t.world?t.world.terrain.heightAt(this.position.x,this.position.z):6.8,this.position.z,Math.PI)}get damageBonus(){return this.skills.blade*3}refreshGear(){const t=this.game.inventory?.equipment||{};this.cat.setWeapon(t.weapon||null),this.cat.setArmor(t.armor||null),this.cat.setBow(t.bow||null),this.recalcStats()}recalcStats(){const t={h:this.maxHealth,s:this.maxStamina,m:this.maxMana};this.maxHealth=this.baseHealth+this.skills.vitality*16+(this.level-1)*7,this.maxStamina=this.baseStamina+this.skills.endurance*16+(this.level-1)*4,this.maxMana=this.baseMana+this.skills.attunement*16+(this.level-1)*5;const e=(n,i,r)=>i>0?n/i*r:r;this.health=Qe(e(this.health,t.h,this.maxHealth),1,this.maxHealth),this.stamina=Qe(e(this.stamina,t.s,this.maxStamina),0,this.maxStamina),this.mana=Qe(e(this.mana,t.m,this.maxMana),0,this.maxMana)}get armorValue(){const t=this.game.inventory?.equipment||{},e=he[t.armor],n=he[t.trinket];return(e?.armor||0)+(n?.armor||0)}get weapon(){const t=this.game.inventory?.equipment?.weapon;return t?he[t]:null}get bow(){const t=this.game.inventory?.equipment?.bow;return t?he[t]:null}teleport(t,e,n,i=this.yaw){this.position.set(t,e,n),this.group.position.copy(this.position),this.yaw=i,this.camYaw=i,this.velocity.set(0,0,0),this.grounded=!0,this.climbing=!1,this.swimming=!1,this.group.rotation.y=i,this.snapCamera()}takeDamage(t,e){if(this.dead||this.invuln>0)return;let n=t;const i=this.armorValue;n=n*(1-Math.min(.62,i*.022)),this.blocking&&this.stamina>4&&(n*=.35,this.stamina=Math.max(0,this.stamina-12),this.game.audio.playBlock(),this.game.effects.spark(this.position.clone().add(new T(0,1.2,0)),13625599)),n=Math.max(1,Math.round(n)),this.health-=n,this.invuln=.42,this.hurtFlash=.5,this.combatT=6,this.cameraShake=Math.min(.6,this.cameraShake+.22),this.cat.playHurt(),this.game.ui.damageNumber(this.position.clone().add(new T(0,1.9,0)),n,""),this.game.ui.hurtFlash(),this.game.audio.playHurt(),this.health<=0&&(this.health=0,this.die())}die(){this.dead||(this.dead=!0,this.deathTimer=0,this.cat.die(),this.game.audio.playDeath(),this.game.onPlayerDeath())}reviveAt(t,e,n){this.dead=!1,this.health=Math.round(this.maxHealth*.65),this.stamina=this.maxStamina,this.mana=Math.round(this.maxMana*.5),this.cat.revive(),this.teleport(t,e,n,Math.PI),this.game.ui.hideDeath()}heal(t){if(this.dead)return;const e=this.health,n=t*(1+this.skills.restoration*.2);this.health=Math.min(this.maxHealth,this.health+n);const i=Math.round(this.health-e);i>0&&this.game.ui.damageNumber(this.position.clone().add(new T(0,2.1,0)),i,"heal")}restoreMana(t){this.mana=Math.min(this.maxMana,this.mana+t)}restoreStamina(t){this.stamina=Math.min(this.maxStamina,this.stamina+t)}addXP(t){if(t){for(this.xp+=t;this.xp>=this.xpNext;)this.xp-=this.xpNext,this.level++,this.xpNext=Math.round(100*Math.pow(this.level,1.34)),this.skillPoints++,this.recalcStats(),this.health=this.maxHealth,this.stamina=this.maxStamina,this.mana=this.maxMana,this.game.ui.toast(`<b>Level ${this.level}</b><br>+1 skill point. The snow notices.`,"good"),this.game.audio.playLevelUp(),this.game.effects.ring(this.position,16765562,5,.9),this.game.ui.showArea(`Level ${this.level}`,"The Tenth grows");this.game.ui.updateHUD()}}spendSkill(t){const e=pl.find(n=>n.id===t);return!e||this.skillPoints<=0||(this.skills[t]||0)>=e.max?!1:(this.skills[t]++,this.skillPoints--,this.recalcStats(),this.game.audio.playEquip(),this.game.ui.toast(`<b>${e.name}</b> rank ${this.skills[t]}`,"good"),this.game.ui.refreshSkills(),this.game.ui.updateHUD(),!0)}get forward(){return new T(Math.sin(this.camYaw),0,Math.cos(this.camYaw))}aimDirection(){const t=new T;return this.game.camera.getWorldDirection(t),t.y=0,t.lengthSq()<.01&&t.set(Math.sin(this.camYaw),0,Math.cos(this.camYaw)),t.normalize()}update(t){const e=this.game,n=e.input;if(this.dead){this.deathTimer+=t,this.cat.update(t,{speed:0,sleeping:!0}),this.updateCamera(t);return}this.invuln=Math.max(0,this.invuln-t),this.hurtFlash=Math.max(0,this.hurtFlash-t),this.attackCd=Math.max(0,this.attackCd-t),this.bowCd=Math.max(0,this.bowCd-t),this.combatT=Math.max(0,this.combatT-t);for(const y in this.spellCd)this.spellCd[y]=Math.max(0,this.spellCd[y]-t);this.cameraShake=Math.max(0,this.cameraShake-t*1.8),this.blocking=!!n.block&&!this.aiming&&this.stamina>2;const i=new T;(n.keys.w||n.keys.arrowup)&&(i.z+=1),(n.keys.s||n.keys.arrowdown)&&(i.z-=1),(n.keys.a||n.keys.arrowleft)&&(i.x-=1),(n.keys.d||n.keys.arrowright)&&(i.x+=1),i.lengthSq()>0&&i.normalize();const r=new T(Math.sin(this.camYaw),0,Math.cos(this.camYaw)),a=new T(Math.cos(this.camYaw),0,-Math.sin(this.camYaw)),o=r.multiplyScalar(i.z).add(a.multiplyScalar(i.x)),l=o.lengthSq()>.01;l&&o.normalize(),e.world.groundHeight(this.position.x,this.position.z);const c=!e.world.activeInteriorId&&e.world.terrain.heightAt(this.position.x,this.position.z)<1;this.swimming=c&&this.position.y<1.35,this.climbing=!!n.keys.c&&!this.swimming;let h=Zx;this.sprinting=!1,this.swimming?h=Kx:this.climbing?h=Jx:n.keys.shift&&this.stamina>1&&l&&(h=jx,this.sprinting=!0,this.stamina=Math.max(0,this.stamina-t*15)),this.blocking&&(h*=.45,this.stamina=Math.max(0,this.stamina-t*3)),this.aiming&&(h*=.6),l&&(this.yaw=Math.atan2(o.x,o.z)),(this.blocking||this.attackAnimT>0&&!l)&&(this.yaw=this.aimDirection().lengthSq()>0?Math.atan2(this.aimDirection().x,this.aimDirection().z):this.yaw);const u=l?h:0,d=this.grounded?14:5;this.velocity.x=qr(this.velocity.x,o.x*u,d,t),this.velocity.z=qr(this.velocity.z,o.z*u,d,t),this.swimming?(this.velocity.y=0,n.jumpQueued=!1):((n.keys[" "]||n.jumpQueued)&&this.grounded&&!this.climbing&&(this.velocity.y=tv,this.grounded=!1,this.game.audio.playJump()),n.jumpQueued=!1,this.velocity.y-=Qx*t);const p=this.velocity.x*t,g=this.velocity.z*t,x=(y,v)=>{if(e.world.collidesCircle(y,v,.42))return!1;if(e.world.activeInteriorId)return!0;const E=e.world.terrain.heightAt(y,v);return E<.9&&!this.swimming&&!this.climbing?!0:!(!this.climbing&&!this.swimming&&E-this.position.y>1.05)};p!==0&&x(this.position.x+p,this.position.z)&&(this.position.x+=p),g!==0&&x(this.position.x,this.position.z+g)&&(this.position.z+=g);const m=e.world.groundHeight(this.position.x,this.position.z);this.swimming?(this.position.y=qr(this.position.y,.72,6,t),this.velocity.y=0,this.grounded=!1,l&&(this.stamina=Math.max(0,this.stamina-t*2.5))):this.climbing&&l?(this.position.y=Math.min(m,this.position.y+t*2.6),this.stamina=Math.max(0,this.stamina-t*8),this.velocity.y=0,this.grounded=!0):(this.position.y+=this.velocity.y*t,this.position.y<=m?(!this.grounded&&this.velocity.y<-12&&this.game.audio.playLand(),this.position.y=m,this.velocity.y=0,this.grounded=!0):this.grounded=!1),!this.swimming&&!this.climbing&&m>-2&&(this.lastSafe={x:this.position.x,y:m,z:this.position.z}),!this.sprinting&&!this.blocking&&!this.climbing&&(this.stamina=Math.min(this.maxStamina,this.stamina+t*(this.combatT>0?9:16))),this.mana=Math.min(this.maxMana,this.mana+t*3.2),this.combatT<=0&&this.health<this.maxHealth?(this.regenT+=t,this.regenT>1&&(this.regenT=0,this.health=Math.min(this.maxHealth,this.health+.6))):this.regenT=0,this.group.position.copy(this.position);const f=Hl(this.group.rotation.y,this.yaw);this.group.rotation.y+=f*Math.min(1,t*14);const _=Math.hypot(this.velocity.x,this.velocity.z);this.cat.update(t,{speed:this.swimming?1.2:_,blocking:this.blocking,aiming:this.aiming,lookYaw:Qe(this.camYaw-this.group.rotation.y,-.6,.6)*.4}),_>.6&&this.grounded&&!this.swimming&&(this.footT-=t*(.6+_*.22),this.footT<=0&&(this.footT=1,this.game.audio.playStep(this.swimming,this.game.world.activeInteriorId?"wood":"snow"))),this.attackAnimT=Math.max(0,this.attackAnimT-t),this.castAnimT=Math.max(0,this.castAnimT-t),this.updateInteractions(),this.updateCamera(t)}updateInteractions(){const t=this.game,e=this.position;let n=null,i=3.2;for(const a of t.world.interactables){if(a.used)continue;const o=Math.hypot(e.x-a.x,e.z-a.z),l=Math.abs((a.y||e.y)-(e.y+1.2));o<(a.radius||3)&&l<3.2&&o<i&&(i=o,n=a)}this.interactTarget=n;const r=t.npcs?.nearestTalkable(e,3.6);this.nearNPC=r,r&&(!n||i>1.8)?t.ui.showInteract(`Talk to ${r.name}`):n?t.ui.showInteract(n.label||"Interact"):t.ui.hideInteract()}interact(){const t=this.game;if(this.nearNPC)return t.dialogue.start(this.nearNPC),!0;if(this.interactTarget){const e=this.interactTarget;return e.action&&e.action(t),!0}return!1}meleeAttack(){if(this.dead||this.attackCd>0||this.aiming)return;if(this.stamina<6){this.game.ui.toast("Too winded. Catch your breath.","bad");return}const t=this.weapon,e=t?.speed||1;this.attackCd=.52/e,this.attackAnimT=.4,this.stamina-=7,this.combatT=6,this.cat.playAttack(),this.game.audio.playSword();const n=this.aimDirection();this.yaw=Math.atan2(n.x,n.z),this.group.rotation.y=this.yaw,this.position.clone().add(new T(0,1.1,0)).addScaledVector(n,1.1),this.game.effects.slash(this.position.clone().addScaledVector(n,1.2),this.yaw,t?.effect==="ice"?10479871:16773327);const i=(t?.dmg||4)+this.skills.blade*3+(t?.unarmed?this.skills.claws*3:0)+(this.level-1)*.8,r=2.9,a=[];for(const o of this.game.enemies){if(!o.alive||(o.interior||null)!==(this.game.world.activeInteriorId||null))continue;const l=o.group.position.x-this.position.x,c=o.group.position.z-this.position.z,h=Math.hypot(l,c);h>r+(o.hitRadius||0)||(l*n.x+c*n.z)/(h||1)<.35||a.push(o)}if(a.length){for(const o of a){let l=i*(.9+Math.random()*.2);const c=new T(Math.sin(o.group.rotation.y),0,Math.cos(o.group.rotation.y)),h=new T(this.position.x-o.group.position.x,0,this.position.z-o.group.position.z).normalize();c.dot(h)>.35&&(l*=1+this.skills.prowl*.12),this.game.enemies.damageEnemy(o,Math.round(l),this),t?.effect==="ice"&&o.applySlow&&o.applySlow(1.8)}this.game.player.cameraShake=Math.max(this.game.player.cameraShake,.12)}}toggleAim(){if(!this.bow){this.game.ui.toast("You have no bow equipped.","bad");return}this.aiming=!this.aiming,this.game.ui.setAiming(this.aiming),this.aiming&&this.game.ui.toast("Bow drawn. Left-click to loose.","magic")}shootBow(){if(!this.bow||this.bowCd>0)return;if(this.stamina<8){this.game.ui.toast("Not enough stamina to draw.","bad");return}this.stamina-=8,this.bowCd=.7,this.combatT=6,this.cat.playAttack(),this.game.audio.playBow();const t=this.position.clone().add(new T(0,1.45,0)),e=this.aimDirection(),n=(this.bow.dmg||10)+this.skills.archery*4+(this.level-1)*.6;this.game.effects.spawnProjectile({pos:t,dir:e,speed:42,damage:Math.round(n),owner:"player",type:"arrow",color:16769184,size:.1,life:1.6}),this.aiming=!1,this.game.ui.setAiming(!1)}castSpell(t){if(this.dead)return;const e=ou[t];if(!e||this.spellCd[t]>0)return;if(this.mana<e.cost){this.game.ui.toast("Not enough mana.","bad"),this.game.audio.playFail();return}this.mana-=e.cost,this.spellCd[t]=e.cooldown,this.combatT=6,this.castAnimT=.6,this.cat.playCast(),this.game.audio.playMagic(t);const n=this.aimDirection();this.yaw=Math.atan2(n.x,n.z);const i=this.position.clone().add(new T(0,1.5,0)),r=(1+this.skills.destruction*.12)*(this.game.inventory.statSummary().magic?1+this.game.inventory.statSummary().magic*.012:1);if(t==="heal"){this.heal(e.heal),this.game.effects.ring(this.position,9364379,3.4,.8),this.game.effects.burst(this.position.clone().add(new T(0,1.2,0)),9364379,22,3,1);return}if(t==="lightning"){let a=null,o=22;for(const u of this.game.enemies){if(!u.alive||(u.interior||null)!==(this.game.world.activeInteriorId||null))continue;const d=u.group.position.clone().sub(this.position),p=d.length();p>o||(d.normalize(),!(d.dot(n)<.55)&&(o=p,a=u))}if(!a){const u=this.position.clone().addScaledVector(n,16).add(new T(0,1,0));this.game.effects.beam(i,u,10475775,.25),this.game.effects.burst(u,10475775,12,4,.5);return}const l=a.group.position.clone().add(new T(0,a.hitHeight||1,0));this.game.effects.beam(i,l,10475775,.3),this.game.enemies.damageEnemy(a,Math.round(e.damage*r),this);let c=null,h=10;for(const u of this.game.enemies){if(!u.alive||u===a||(u.interior||null)!==(this.game.world.activeInteriorId||null))continue;const d=u.group.position.distanceTo(a.group.position);d<h&&(h=d,c=u)}if(c){const u=c.group.position.clone().add(new T(0,c.hitHeight||1,0));this.game.effects.beam(l,u,11064575,.22),this.game.enemies.damageEnemy(c,Math.round(e.damage*.55*r),this)}this.cameraShake=Math.max(this.cameraShake,.2);return}t==="fireball"?this.game.effects.spawnProjectile({pos:i,dir:n,speed:30,damage:Math.round(e.damage*r),owner:"player",type:"fire",color:16747325,size:.28,aoe:3.4,life:2.4}):t==="ice"&&this.game.effects.spawnProjectile({pos:i,dir:n,speed:34,damage:Math.round(e.damage*r),owner:"player",type:"ice",color:9427455,size:.22,slow:2.5,life:2.2,onHit:(a,o)=>{a.takeDamage(o.damage,this),a.applySlow&&a.applySlow(2.5),this.game.effects.burst(o.group.position.clone(),9427455,16,3,.5)}})}snapCamera(){this.updateCamera(0,!0)}updateCamera(t,e=!1){const n=this.game.camera;if(!n)return;this.aimBlend=qr(this.aimBlend,this.aiming?1:0,10,t);const i=this.camDist-this.aimBlend*3.4,r=this.camPitch+this.aimBlend*.06,a=this.position.y+1.55+this.aimBlend*.25,o=new T(this.position.x,a,this.position.z),l=this.aimBlend*.75,c=new T(Math.cos(this.camYaw),0,-Math.sin(this.camYaw));o.addScaledVector(c,l),this.camTarget.lerp(o,e?1:Math.min(1,t*12));const h=new T(-Math.sin(this.camYaw)*Math.cos(r),Math.sin(r),-Math.cos(this.camYaw)*Math.cos(r)).multiplyScalar(i),u=this.camTarget.clone().add(h),d=this.game.world.groundHeight(u.x,u.z);if(u.y<d+.6&&(u.y=d+.6),this.cameraShake>.001){const g=this.cameraShake*.45;u.x+=(Math.random()-.5)*g,u.y+=(Math.random()-.5)*g,u.z+=(Math.random()-.5)*g}n.position.copy(u);const p=this.camTarget.clone();p.y+=this.aimBlend*.35,n.lookAt(p)}save(){return{name:this.name,cls:this.cls,look:this.look,position:{x:this.position.x,y:this.position.y,z:this.position.z},yaw:this.yaw,health:this.health,stamina:this.stamina,mana:this.mana,level:this.level,xp:this.xp,xpNext:this.xpNext,skillPoints:this.skillPoints,skills:this.skills,lastSafe:this.lastSafe}}load(t){if(!t)return;this.name=t.name||this.name,this.level=t.level||1,this.xp=t.xp||0,this.xpNext=t.xpNext||100,this.skillPoints=t.skillPoints||0,this.skills={...this.skills,...t.skills||{}},this.recalcStats(),this.health=t.health??this.maxHealth,this.stamina=t.stamina??this.maxStamina,this.mana=t.mana??this.maxMana,this.lastSafe=t.lastSafe||this.lastSafe;const e=t.position||this.position;this.teleport(e.x,e.y,e.z,t.yaw||Math.PI)}}const mh=["Biscuit","Marmalade","Pebble","Noodle","Thimble","Crumb","Sorrel","Pip","Tansy","Bramble","Moss","Clove","Rook","Dumpling","Wick","Fig","Cinder","Barley","Nutmeg","Sable","Custard","Rye","Mothball","Plum"],Jr=["Mrrp.","I was not sleeping. I was inspecting my eyelids.","The fish was already dead when I ate it.","Have you seen my other boot? It is also a cat.","I could catch that bird. I am choosing not to.","The snow is falling. I have notes.","Do not tell the guards about the thing in the well.","Nine lives, and I have spent six of them on this conversation.","I am not lost. I am exploring aggressively.","Everything is fine. My tail is simply alarmed.","I meant to knock that off the table.","Mrow. That means “good morning” and also “move.”","The prophecy says nothing about paperwork.","I have a very important sit to attend to."],Wl=[{id:"elder",name:"Elder Whiskerby",role:"Elder of Pawsmouth",breed:"longhair",fur:"smoke",eye:"amber",scale:1.04,x:175,z:322,home:{x:175,z:322},work:{x:175,z:322},mapPos:{x:175,z:306},gear:{scarf:"#8d6b3f"},greet:["You are late. The snow has been waiting three days for you, and it is not a patient snow.","Another adventurer. You smell of wet ambition and fish. Good. We can work with that."],lore:"Pawsmouth was built on the one stretch of river that refuses to freeze. The fish are smug about it. The cats are smugder.",prophecy:"Nine lives were given to the first cats. A tenth was withheld, because the Nine were afraid of what it might do. The snow remembers. I remember. I am also very old."},{id:"mittens",name:"Mittens",role:"Locket Enthusiast",breed:"calico",fur:"snow",eye:"jade",scale:.96,x:208,z:330,home:{x:208,z:330},work:{x:196,z:318},mapPos:{x:208,z:330},greet:["I had a locket. Silver. A fish inside. Do not look at me like that. It was a very handsome fish.","If you find a small silver locket in the old barrow, I will pay you. In gold. Not fish. Probably."],lore:"The locket belonged to my grandmother. Or her fish. The family history is complicated."},{id:"gull",name:"Gull",role:"Fishmonger",breed:"snowshoe",fur:"frost",eye:"copper",scale:1,x:148,z:300,home:{x:190,z:290},work:{x:148,z:300},mapPos:{x:148,z:300},merchant:{stock:["fish","stew","bread","healthPotion"],line:"Fresh fish. Fresh opinions. Both are non-refundable."},greet:["The river gives fish. The fish give opinions. The opinions give me a headache.","Buy a fish. It is the most honest transaction in Catterfall."],lore:"The river runs north in winter and south in summer. Nobody knows why. The fish refuse to comment."},{id:"brindle",name:"Guard Brindle",role:"Village Watch",breed:"tabby",fur:"ginger",eye:"amber",scale:1.02,x:190,z:306,home:{x:190,z:306},work:{x:186,z:302},mapPos:{x:190,z:306},gear:{armor:"ironArmor",weapon:"guardSaber"},guard:!0,greet:["Move along. Or don't. I am not your mother. She is probably asleep in a box somewhere.","No trouble in Pawsmouth. We have enough trouble in Whiskerhold. It is a distribution problem."],lore:"The Watch protects the village from wolves, bandits, and people who say the fish here are “just okay.”"},{id:"whisker",name:"Old Whisker",role:"Net Mender",breed:"longhair",fur:"moss",eye:"jade",scale:1,x:158,z:340,home:{x:158,z:340},work:{x:162,z:338},mapPos:{x:158,z:340},greet:["You can tell a lot about a cat by their knots. Yours are... ambitious.","The river took my best net. The river has expensive taste."],lore:"Every net in Pawsmouth is mended by a cat who cannot swim. It builds character. And a healthy fear of water."},{id:"seer",name:"Seer Mothwhisker",role:"Keeper of the Nine",breed:"chinchilla",fur:"dusk",eye:"moon",scale:1,x:-40,z:162,home:{x:-40,z:162},work:{x:-40,z:166},mapPos:{x:-40,z:170},gear:{armor:"mageRobe",weapon:"oakStaff"},seer:!0,greet:["You have a tenth life. I can see it. It is... a bit scruffy.","The stones have been humming since dawn. Either the prophecy is beginning, or someone brought a very resonant fish."],lore:"The Shrine of the Nine was raised before Whiskerhold had walls, before the river had a name, before the first cat decided that sitting in a box was a political act.",prophecy:"The Nine sealed the Empty Bowl beneath Frostfang. They left a door, a bell, and a promise: the Tenth would finish what they could not. The Tenth is late. The Tenth is you."},{id:"bramble",name:"Bramble",role:"Bard of the Leaky Whisker",breed:"ginger",fur:"ginger",eye:"copper",scale:1,interior:"tavern",x:-8,z:3,home:{x:-8,z:3},mapPos:{x:-332,z:-146},gear:{scarf:"#8d3b35",weapon:"clawWraps"},companion:!0,companionType:"bard",greet:["I have written forty-seven ballads about you. Most of them rhyme. Two are legally actionable.","You have the look of a cat who has never been in a ballad. That is about to change. Badly."],lore:"I was the finest bard in Whiskerhold until the lute was stolen. Now I am a cat with a lot of feelings and no chord progression.",combatLine:"For the chorus!"},{id:"cook",name:"Cook Barley",role:"Cook of the Leaky Whisker",breed:"tabby",fur:"ember",eye:"amber",scale:1.05,interior:"tavern",x:6,z:0,home:{x:6,z:0},mapPos:{x:-332,z:-146},gear:{armor:"leatherArmor"},greet:["I need three fish. Not two. Two is a snack. Three is a feast. Four is a diplomatic incident.","The stew is fine. The stew is always fine. Do not ask what is in the stew."],lore:"The Nine Bells Feast happens every winter. Last year the bell was stolen. This year we are using a very large spoon."},{id:"marrow",name:"Marrow",role:"Proprietor, Nine Lives Goods",breed:"sootpaw",fur:"ink",eye:"amber",scale:1,interior:"shop",x:0,z:-1,home:{x:0,z:-1},mapPos:{x:-230,z:-160},merchant:{stock:["healthPotion","manaPotion","staminaPotion","bread","cheese","stew","leatherArmor","ironArmor","moonBow","emberAmulet"],line:"Everything is negotiable except the fish."},greet:["Buy something or stop breathing my air. Actually, buy something and keep breathing. Package deal.","You look like you need a potion. Or several. I have several."],lore:"Nine Lives Goods has served Whiskerhold for six generations. We have never once sold a ninth life. Not for lack of trying."},{id:"forge",name:"Forge",role:"Smith of Whiskerhold",breed:"tabby",fur:"smoke",eye:"copper",scale:1.08,x:-300,z:-140,home:{x:-330,z:-132},work:{x:-300,z:-140},mapPos:{x:-300,z:-140},merchant:{stock:["guardSaber","frostAxe","ironArmor","wardenArmor","oathBlade"],line:"I make swords. You break swords. It is a beautiful economy."},gear:{armor:"leatherArmor"},smith:!0,greet:["I make swords. You break swords. It is a beautiful economy.","That blade is rusty. Rust is a seasoning, not a strategy."],lore:"The smithy has been in my family for nine generations. The ninth generation was a cat. The eighth was also a cat. It is a pattern."},{id:"captain",name:"Captain Sable",role:"Captain of the Watch",breed:"sootpaw",fur:"ink",eye:"jade",scale:1.08,x:-280,z:-102,home:{x:-280,z:-102},work:{x:-280,z:-96},mapPos:{x:-280,z:-102},gear:{armor:"wardenArmor",weapon:"guardSaber",scarf:"#2b6a70"},guard:!0,greet:["Bandits on the north road. We would go, but it is nearly lunch.","You have the look of someone who solves problems with a sword. We have a problem-shaped opening."],lore:"The Watch has nine bells. One for each district. We lost the ninth bell. We are not allowed to talk about it."},{id:"courtMage",name:"Court Mage Pellucid",role:"Reader of Falling Skies",breed:"ashpoint",fur:"dusk",eye:"ice",scale:1,x:224,z:-266,home:{x:224,z:-266},work:{x:228,z:-270},mapPos:{x:224,z:-266},gear:{armor:"mageRobe",weapon:"oakStaff"},greet:["The sky is falling. Not literally. Metaphorically. Possibly literally. I am still reading.","I have consulted the stars. They have asked me to stop."],lore:"Highpaw Keep was built on a hill because hills are easier to defend and much easier to look dramatic on."},{id:"steward",name:"Steward Pell",role:"Steward of Highpaw",breed:"snowshoe",fur:"frost",eye:"moon",scale:.98,interior:"castlehall",x:0,z:-3,home:{x:0,z:-3},mapPos:{x:238,z:-292},gear:{scarf:"#365a83"},greet:["The Queen is... resting. She has been resting for eleven years. It is a very long nap.","Highpaw welcomes you. Please do not touch the throne. Or the Queen. Especially the Queen."],lore:"The Snow Queen has ruled Highpaw for forty years. For the last eleven, the Steward has ruled Highpaw and the Queen has ruled the duvet."},{id:"farmer",name:"Pelt-Pincher Nibs",role:"Turnip Magnate",breed:"tabby",fur:"moss",eye:"amber",scale:1.02,x:-398,z:142,home:{x:-398,z:142},work:{x:-408,z:154},mapPos:{x:-398,z:142},greet:["Rats. Big as my regrets. Twice as hungry.","The turnips are fine. The fence is fine. The rats are... a growth opportunity."],lore:"Hearthwhisker feeds half the kingdom. The other half says the turnips are “earthy.” We have chosen to take that as a compliment."},{id:"farmhand",name:"Sprout",role:"Farmhand",breed:"ginger",fur:"ginger",eye:"jade",scale:.94,x:-380,z:150,home:{x:-380,z:150},work:{x:-386,z:158},mapPos:{x:-380,z:150},greet:["I am not scared of the rats. I am scared of what the turnips will do when they find out.","I have been here three weeks. The geese know my name. I do not know theirs."],lore:"The windmill grinds grain, gossip, and occasionally a very unlucky bird."},{id:"soot",name:"Soot",role:"Apprentice of Frostpelt",breed:"sootpaw",fur:"ink",eye:"violet",scale:.9,x:340,z:220,home:{x:340,z:220},work:{x:336,z:214},mapPos:{x:340,z:220},gear:{armor:"mageRobe",weapon:"oakStaff"},companion:!0,companionType:"mage",greet:["I dreamed of a door under the mountain. It had my name on it. My name is Soot. It is a very short name for a door.","You are the Tenth. I knew it. I drew a picture. It is mostly a circle with ears."],lore:"I am apprenticed to Nettle. She teaches me potions, patience, and how to pretend I meant to set that on fire.",combatLine:"Please stop moving. I am trying to aim."},{id:"nettle",name:"Nettle",role:"Apothecary",breed:"ashpoint",fur:"smoke",eye:"jade",scale:.98,x:326,z:198,home:{x:326,z:198},work:{x:330,z:200},mapPos:{x:326,z:198},merchant:{stock:["healthPotion","manaPotion","staminaPotion","dreamHerb"],line:"Potions, tinctures, and one jar of something that is definitely not jam."},gear:{armor:"mageRobe"},greet:["Dreamherb. It makes you sleep. Or it makes you see the sleeping. One of those. I forget.","You look tired. Or haunted. I have something for both. The haunted one is more expensive."],lore:"Frostpelt is the last warm roof before the peaks. After that, it is just snow, wind, and the occasional deeply rude mountain goat."},{id:"hunter",name:"Hunter Vane",role:"Trapper",breed:"snowshoe",fur:"frost",eye:"copper",scale:1,x:370,z:230,home:{x:370,z:230},work:{x:376,z:224},mapPos:{x:370,z:230},gear:{armor:"leatherArmor",bow:"huntingBow"},greet:["Wolves do not hate you. They just think you are made of meat. Which, to be fair...","The mountain is quiet today. That is how it lures you in."],lore:"I have trapped every kind of animal in Catterfall except the snow hare. It knows what I am thinking. I respect it."}],ev=Wl.filter(s=>s.interior),nv=Wl.filter(s=>!s.interior);class iv{constructor(t){this.game=t,this.rng=fl(5521),this.list=[],this.byId={},this.interiorId=null,this.barks=0,this.ambientTimer=8,this.createOutdoor(),this.createAmbient()}buildNpc(t,e,n=!1){const i=Ca({breed:t.breed,fur:t.fur,eye:t.eye,scale:t.scale||1,weapon:t.gear?.weapon,armor:t.gear?.armor,bow:t.gear?.bow,scarf:t.gear?.scarf});i.root.name="npc-"+t.id,e.add(i.root);const r={...t,def:t,cat:i,group:i.root,local:n,companion:!1,recruited:!1,hp:100,maxHp:100,alive:!0,dead:!1,speed:0,target:null,state:"idle",idleT:this.rng.range(0,4),chatT:this.rng.range(8,30),wanderT:0,stuck:0,attackCd:0,downed:0,marker:null,facing:0,interior:t.interior||null,baseX:t.x,baseZ:t.z,mapPos:t.mapPos||{x:t.x,z:t.z}};n?r.group.position.set(t.x,0,t.z):r.group.position.set(t.x,this.game.world.terrain.heightAt(t.x,t.z),t.z);const a=new pt(new Sa(.16,0),new Me({color:16764778}));return a.position.y=2.45,a.visible=!1,r.group.add(a),r.marker=a,this.list.push(r),this.byId[r.id]=r,r}createOutdoor(){for(const t of nv)this.buildNpc(t,this.game.world.group)}createAmbient(){const t=[{x:-292,z:-128,n:5,r:20},{x:-260,z:-180,n:3,r:18},{x:190,z:316,n:3,r:14},{x:-392,z:130,n:2,r:16},{x:352,z:214,n:2,r:12},{x:238,z:-280,n:2,r:12}];let e=0;for(const n of t)for(let i=0;i<n.n;i++){const r=$x(this.rng,{}),a="citizen"+e++,o=n.x+this.rng.range(-n.r,n.r),l=n.z+this.rng.range(-n.r,n.r),c={id:a,name:mh[e%mh.length],role:"Citizen",breed:r.breed,fur:r.fur,eye:r.eye,scale:this.rng.range(.86,1.06),x:o,z:l,home:{x:n.x,z:n.z},work:{x:n.x+this.rng.range(-6,6),z:n.z+this.rng.range(-6,6)},mapPos:{x:o,z:l},ambient:!0,greet:[this.rng.pick(Jr),this.rng.pick(Jr)],lore:this.rng.pick(["I have lived here all my lives.","The snow is louder than it looks.","Do not trust the geese."]),gear:this.rng.chance(.25)?{armor:"leatherArmor"}:{}},h=this.buildNpc(c,this.game.world.group);h.home=c.home,h.work=c.work,h.wander={x:n.x,z:n.z,r:n.r}}}setInterior(t){if(this.interiorId=t,t){const e=this.game.world.interiors.get(t);if(!e)return;for(const r of this.list)!r.interior&&!r.companion&&(r.group.visible=!1);for(const r of ev.filter(a=>a.interior===t)){if(!this.byId[r.id]){const a=this.buildNpc(r,e.group,!0);a.interior=t,a.home={x:r.x,z:r.z},a.work={x:r.x,z:r.z}}this.byId[r.id].group.visible=!0}const n=e.spawn||{z:8};let i=0;for(const r of this.list)r.companion?(r.group.parent!==e.group&&e.group.add(r.group),r.group.position.set(1.4+i*.9,0,n.z-2.4-i*.8),r.group.visible=!0,r.facing=Math.PI,i++):r.interior&&r.interior!==t&&(r.group.visible=!1)}else for(const e of this.list)if(e.companion){this.game.world.group.add(e.group);const n=this.game.player.position;e.group.position.set(n.x+1.6,this.game.world.terrain.heightAt(n.x+1.6,n.z+1.6),n.z+1.6),e.group.visible=!0}else e.interior?e.group.visible=!1:e.group.visible=!0}reset(){for(const t of this.list)t.group&&t.group.parent&&t.group.parent.remove(t.group);this.list=[],this.byId={},this.interiorId=null,this.rng=fl(5521),this.createOutdoor(),this.createAmbient()}talkables(){return this.list.filter(t=>t.group.visible&&!t.dead&&(this.interiorId?t.interior===this.interiorId:!t.interior))}nearestTalkable(t,e=3.4){let n=null,i=e;for(const r of this.talkables()){if(r.companion)continue;const a=t.distanceTo(r.group.position);a<i&&(i=a,n=r)}return n}recruit(t){t.companion||(t.companion=!0,t.recruited=!0,t.hp=140,t.maxHp=140,this.game.companions.push(t),this.game.quests.event("recruit",t.id,1),this.game.ui.toast(`<b>${t.name}</b> joins you.`,"good"),this.game.audio.playQuestComplete())}setCompanionWait(t,e){t.waiting=e,this.game.ui.toast(e?`${t.name} will wait here.`:`${t.name} follows.`)}update(t){const e=this.game,n=e.time.hours,i=n>=21||n<7,r=e.player.position;let a=null,o=18;for(const l of e.enemies){if(!l.alive)continue;const c=r.distanceTo(l.group.position);c<o&&(o=c,a=l)}for(const l of this.list){if(!l.group.visible||l.dead)continue;if(l.companion?this.updateCompanion(l,t,a):l.guard&&a&&!this.interiorId&&o<15?this.updateGuard(l,t,a):l.ambient?this.updateAmbient(l,t,i,n):this.updateScheduled(l,t,i,n),e.mode==="dialogue"&&e.dialogue?.npc===l){const d=r.clone().sub(l.group.position);l.facing=Math.atan2(d.x,d.z)}l.group.rotation.y+=Hl(l.group.rotation.y,l.facing)*Math.min(1,t*6),l.cat.update(t,{speed:l.speed,sitting:l.sitting,sleeping:l.sleeping,talking:e.mode==="dialogue"&&e.dialogue?.npc===l,lookYaw:l.lookYaw||0});const c=e.quests.pendingTalk(l.id),h=e.quests.offersFor(l.id),u=!!(c||h.length);if(l.marker.visible=u&&!l.companion,u&&(l.marker.position.y=2.45+Math.sin(performance.now()*.002+l.group.position.x)*.08,l.marker.rotation.y+=t*1.5,l.marker.material.color.set(c?9364379:16764778)),l.chatT-=t,l.chatT<=0&&(l.chatT=this.rng.range(18,44),r.distanceTo(l.group.position)<13&&e.mode==="play"&&!l.companion)){const d=this.rng.pick(l.ambient?Jr:l.greet||Jr);e.ui.subtitle(`${l.name}: ${d}`,4.5),e.audio.meow(this.rng.range(.7,1.2)),l.ambient&&l.cat.playTalk()}}this.ambientTimer-=t,this.ambientTimer<=0&&(this.ambientTimer=this.rng.range(16,35),e.mode==="play"&&(e.audio.meow(this.rng.range(.6,1.4)),Math.random()<.45&&e.ui.subtitle(this.rng.pick(["Somewhere, a cat is very disappointed in you.","A distant meow. It sounds judgmental.","You hear a box being sat in."]),3.5)))}updateScheduled(t,e,n,i){const r=this.game;t.attackCd=Math.max(0,t.attackCd-e);let a=t.work;(n||i<8||i>19)&&(a=t.home);const o=a.x,l=a.z,c=o-t.group.position.x,h=l-t.group.position.z,u=Math.hypot(c,h);if(u>1.3){t.sleeping=!1,t.sitting=!1;const d=1.35;t.facing=Math.atan2(c,h);let p=t.group.position.x+c/u*d*e,g=t.group.position.z+h/u*d*e;if(r.world.collidesCircle(p,g,.45)){const x=t.facing+Math.PI/2;p=t.group.position.x+Math.sin(x)*d*e,g=t.group.position.z+Math.cos(x)*d*e,t.stuck+=e,t.stuck>3&&(t.group.position.set(o,r.world.groundHeight(o,l),l),t.stuck=0)}t.group.position.x=p,t.group.position.z=g,t.group.position.y=r.world.groundHeight(p,g),t.speed=d,t.state="walk"}else t.speed=0,t.state="idle",t.sitting=n||i>20,t.sleeping=n,t.sleeping&&(t.facing=t.home.rot||t.facing),!t.sitting&&Math.random()<e*.4&&(t.facing+=this.rng.range(-1.2,1.2))}updateAmbient(t,e,n,i){const r=this.game;if(t.speed=0,n){t.sitting=!0,t.sleeping=!0;return}if(t.sleeping=!1,t.idleT-=e,t.idleT<=0){t.idleT=this.rng.range(3,9);const a=t.wander||{x:t.home.x,z:t.home.z,r:8};t.wanderTarget={x:a.x+this.rng.range(-a.r,a.r),z:a.z+this.rng.range(-a.r,a.r)},t.sitting=this.rng.chance(.35)}if(t.wanderTarget&&!t.sitting){const a=t.wanderTarget.x-t.group.position.x,o=t.wanderTarget.z-t.group.position.z;if(Math.hypot(a,o)>.6){t.facing=Math.atan2(a,o);const c=t.group.position.x+Math.sin(t.facing)*1.1*e,h=t.group.position.z+Math.cos(t.facing)*1.1*e;r.world.collidesCircle(c,h,.4)?t.idleT=0:(t.group.position.set(c,r.world.groundHeight(c,h),h),t.speed=1.1)}else t.speed=0,t.sitting=!0}}updateGuard(t,e,n){const i=this.game;t.attackCd=Math.max(0,t.attackCd-e);const r=n.group.position.x-t.group.position.x,a=n.group.position.z-t.group.position.z,o=Math.hypot(r,a);if(t.facing=Math.atan2(r,a),o>2.2){const l=t.group.position.x+r/o*2*e,c=t.group.position.z+a/o*2*e;t.group.position.set(l,i.world.groundHeight(l,c),c),t.speed=2,t.sitting=!1,t.sleeping=!1}else t.speed=0,t.attackCd<=0&&(t.attackCd=1.3,t.cat.playAttack(),i.audio.playSword(),n.takeDamage(10,t),i.effects.spark(n.group.position.clone().add(new T(0,1,0)),16766880))}updateCompanion(t,e,n){const i=this.game;if(t.downed>0){t.downed-=e,t.sitting=!0,t.speed=0;return}t.sitting=!1,t.sleeping=!1,t.attackCd=Math.max(0,t.attackCd-e),t.healCd=Math.max(0,(t.healCd||0)-e);const r=i.player.position,a=this.findEnemyFor(t,16);if(a){const o=a.group.position.x-t.group.position.x,l=a.group.position.z-t.group.position.z,c=Math.hypot(o,l);if(t.facing=Math.atan2(o,l),c>(t.companionType==="mage"?7:2.2)){const h=t.group.position.x+o/c*3.2*e,u=t.group.position.z+l/c*3.2*e;i.world.collidesCircle(h,u,.4)||t.group.position.set(h,i.world.groundHeight(h,u),u),t.speed=3.2}else if(t.speed=0,t.attackCd<=0)if(t.attackCd=t.companionType==="mage"?1.9:1.1,t.companionType==="mage"){t.cat.playCast();const h=t.group.position.clone().add(new T(0,1.5,0)),u=a.group.position.clone().add(new T(0,1,0)).sub(h).normalize();i.effects.spawnProjectile({pos:h,dir:u,speed:22,damage:16,owner:"player",type:"ice",color:10475775,size:.18,onHit:d=>{d.takeDamage(16,t),d.applySlow&&d.applySlow(2)}}),i.audio.playMagic("ice")}else t.cat.playAttack(),i.audio.playSword(),a.takeDamage(12,t),i.effects.spark(a.group.position.clone().add(new T(0,1,0)),16766880);t.companionType==="mage"&&t.healCd<=0&&i.player.health<i.player.maxHealth*.55&&(t.healCd=8,t.cat.playCast(),i.player.heal(18),i.effects.burst(i.player.position.clone().add(new T(0,1,0)),9364379,16,2.4,.8),i.ui.toast(`${t.name} mends your fur.`,"good"))}else if(t.waiting)t.speed=0;else{const o=r.x-t.group.position.x,l=r.z-t.group.position.z,c=Math.hypot(o,l);if(c>3.2){t.facing=Math.atan2(o,l);const h=c>12?7.5:3.8,u=t.group.position.x+o/c*h*e,d=t.group.position.z+l/c*h*e;i.world.collidesCircle(u,d,.4)||t.group.position.set(u,i.world.groundHeight(u,d),d),t.speed=h}else t.speed=0,c<2&&(t.facing=Math.atan2(-o,-l))}}findEnemyFor(t,e){let n=null,i=e;for(const r of this.game.enemies){if(!r.alive||this.interiorId&&r.interior!==this.interiorId)continue;const a=t.group.position.distanceTo(r.group.position);a<i&&(i=a,n=r)}return n}companionDown(t){t.downed=18,t.sitting=!0,this.game.ui.toast(`${t.name} is down. They will recover in a moment.`,"bad")}save(){return this.list.filter(t=>t.companion).map(t=>t.id)}loadCompanions(t){for(const e of t||[]){let n=this.byId[e];if(!n){const i=Wl.find(r=>r.id===e);if(i){const r=i.interior?this.game.world.buildInteriorIfNeeded(i.interior).group:this.game.world.group;n=this.buildNpc(i,r,!!i.interior),i.interior&&(n.interior=i.interior,n.home={x:i.x,z:i.z},n.work={x:i.x,z:i.z})}}n&&(n.companion=!0,n.recruited=!0,n.hp=140,n.maxHp=140,this.game.companions.includes(n)||this.game.companions.push(n))}}}const Qr=new Ot({vertexColors:!0,roughness:.95,metalness:0}),sv=new Me({vertexColors:!0});function rv(s,t){const e=new Mt(t),n=s.attributes.position.count,i=new Float32Array(n*3);for(let r=0;r<n;r++)i[r*3]=e.r,i[r*3+1]=e.g,i[r*3+2]=e.b;return s.setAttribute("color",new we(i,3)),s}function Te(s,t,e,n=[0,0,0],i=[0,0,0],r=[1,1,1]){t.scale(r[0],r[1],r[2]),(i[0]||i[1]||i[2])&&(t.rotateX(i[0]),t.rotateY(i[1]),t.rotateZ(i[2])),t.translate(n[0],n[1],n[2]),rv(t,e),s.push(t)}const gh={wolf:{body:"#9aa4ab",belly:"#d8dde0",dark:"#4f5a61",eye:"#ffcf6b",scale:1,len:1.5,height:1.05,ears:"point",tail:.8,snout:.5},frostRat:{body:"#8a7c6a",belly:"#c9bca8",dark:"#4e4337",eye:"#ff8a5c",scale:1,len:.8,height:.55,ears:"round",tail:.9,snout:.5},bear:{body:"#d4d9dc",belly:"#eef2f4",dark:"#7b858b",eye:"#ffb35c",scale:1,len:2.2,height:1.5,ears:"round",tail:.35,snout:.6},deer:{body:"#9b7f61",belly:"#d8c9b4",dark:"#5c4631",eye:"#2a2018",scale:1,len:1.4,height:1.2,ears:"leaf",tail:.25,snout:.55},rabbit:{body:"#d9d2c6",belly:"#f2ede4",dark:"#9c9184",eye:"#3a2b22",scale:1,len:.5,height:.45,ears:"long",tail:.3,snout:.3}};function av(s="wolf",t=null){const e=gh[s]||gh.wolf,n=t||e.body,i=new Kt,r=new Kt;i.add(r);const a=e.len,o=e.height,l=[];Te(l,new re(.36,9,7),n,[0,o,0],[0,0,0],[1,.9,a*1.4]),Te(l,new re(.3,8,6),e.belly,[0,o-.12,.05],[0,0,0],[.9,.7,a*1.25]);const c=new Kt;c.position.set(0,o+.28,a*.72),r.add(c);const h=[];Te(h,new re(.3,9,7),n,[0,0,0],[0,0,0],[1,.92,1.05]),Te(h,new re(.18,7,5),e.belly,[0,-.08,.27],[0,0,0],[1.1,.7,1]),Te(h,new re(.06,5,4),"#20171a",[0,-.06,.43],[0,0,0],[1,.8,.8]),e.ears==="point"?(Te(h,new Ie(.1,.24,4),e.dark,[-.18,.26,-.02],[0,0,.2]),Te(h,new Ie(.1,.24,4),e.dark,[.18,.26,-.02],[0,0,-.2])):e.ears==="round"?(Te(h,new re(.12,6,5),e.dark,[-.2,.22,-.04],[0,0,0],[1,1,.4]),Te(h,new re(.12,6,5),e.dark,[.2,.22,-.04],[0,0,0],[1,1,.4])):e.ears==="long"?(Te(h,new Li(.06,.3,3,5),e.dark,[-.12,.32,-.02],[.1,0,.1]),Te(h,new Li(.06,.3,3,5),e.dark,[.12,.32,-.02],[.1,0,-.1])):(Te(h,new Ie(.13,.22,4),e.dark,[-.22,.18,0],[0,0,.8]),Te(h,new Ie(.13,.22,4),e.dark,[.22,.18,0],[0,0,-.8]));const u=new pt(gn(h,!1),Qr);u.castShadow=!0,c.add(u);const d=[];Te(d,new re(.06,6,5),e.eye,[-.14,.05,.24],[0,0,0],[1,1,.5]),Te(d,new re(.06,6,5),e.eye,[.14,.05,.24],[0,0,0],[1,1,.5]),Te(d,new re(.028,5,4),"#090909",[-.14,.05,.285],[0,0,0],[.6,1,.4]),Te(d,new re(.028,5,4),"#090909",[.14,.05,.285],[0,0,0],[.6,1,.4]),c.add(new pt(gn(d,!1),sv));const p=new pt(gn(l,!1),Qr);p.castShadow=!0,r.add(p);const g=[],x=[[-.28,o-.18,a*.45],[.28,o-.18,a*.45],[-.28,o-.18,-a*.45],[.28,o-.18,-a*.45]];for(const[E,C,I]of x){const D=new Kt;D.position.set(E,C,I);const M=[];Te(M,new Li(.09,.32,3,5),n,[0,-.22,0],[0,0,0],[1,1,1]),Te(M,new re(.1,6,5),e.dark,[0,-.45,.03],[0,0,0],[1,.5,1.4]);const w=new pt(gn(M,!1),Qr);w.castShadow=!0,D.add(w),r.add(D),g.push(D)}const m=new Kt;m.position.set(0,o+.02,-a*.68);const f=[];Te(f,new Li(.07,e.tail*.9,3,5),e.dark,[0,-.05,-e.tail*.4],[Math.PI*.42,0,0]),Te(f,new re(.08,5,4),e.belly,[0,-.1,-e.tail*.78]);const _=new pt(gn(f,!1),Qr);m.add(_),r.add(m);const y={t:Math.random()*10,phase:Math.random()*10,dead:0,attack:0,hurt:0};i.scale.setScalar(e.scale);const v={root:i,rig:r,head:c,bodyMesh:p,legs:g,tail:m,anim:y,kind:s,playAttack(){y.attack=.36},playHurt(){y.hurt=.25},die(){y.dead=1},update(E,C={}){y.t+=E,y.attack=Math.max(0,y.attack-E),y.hurt=Math.max(0,y.hurt-E);const I=C.speed||0,D=I>.1;D&&(y.phase+=E*(6+I*1.6));const M=Math.sin(y.phase),w=Math.min(1.2,I/3);g[0].rotation.x=M*.65*w,g[1].rotation.x=-M*.65*w,g[2].rotation.x=-M*.65*w,g[3].rotation.x=M*.65*w,r.position.y=D?Math.abs(M)*.04*w:Math.sin(y.t*1.8)*.01,c.rotation.x=Math.sin(y.t*1.2)*.04-y.attack*.3,c.rotation.y=C.lookYaw||0,m.rotation.y=Math.sin(y.t*(D?5:1.5))*.3,m.rotation.x=-.2+Math.sin(y.t*1.1)*.1,y.dead&&(r.rotation.z+=(1.5-r.rotation.z)*Math.min(1,E*4),r.position.y+=(-.15-r.position.y)*Math.min(1,E*4))}};return i.userData.beast=v,v}const ov={snowWolf:{name:"Snow Wolf",hp:55,dmg:10,speed:5.2,xp:50,aggro:18,range:2.3,hitHeight:.85,hitRadius:.8,beast:"wolf",scale:1.05,loot:[["gold",8,18],["fish",1,1]],faction:"wild"},frostRat:{name:"Frost Rat",hp:30,dmg:6,speed:4.4,xp:25,aggro:13,range:1.5,hitHeight:.5,hitRadius:.55,beast:"frostRat",scale:1.25,loot:[["gold",3,8]],faction:"wild"},bandit:{name:"Scarwood Bandit",hp:85,dmg:14,speed:4.3,xp:70,aggro:19,range:2.5,hitHeight:1.1,hitRadius:.7,cat:{breed:"tabby",fur:"ember",eye:"copper",scale:1.02,weapon:"guardSaber",armor:"leatherArmor",scarf:"#8d3b35"},loot:[["gold",12,26],["healthPotion",1,1]],faction:"bandit"},banditArcher:{name:"Scarwood Archer",hp:65,dmg:11,speed:4,xp:80,aggro:22,range:14,hitHeight:1.1,hitRadius:.7,ranged:!0,cat:{breed:"snowshoe",fur:"smoke",eye:"jade",scale:1,weapon:"clawWraps",armor:"leatherArmor",scarf:"#8d3b35"},loot:[["gold",14,30],["staminaPotion",1,1]],faction:"bandit"},hollow:{name:"Hollow Cat",hp:95,dmg:16,speed:4.6,xp:95,aggro:20,range:2.6,hitHeight:1.1,hitRadius:.75,cat:{breed:"sootpaw",fur:"ink",eye:"violet",scale:1.04,weapon:"clawWraps",armor:"wardenArmor",scarf:"#3b2a4a"},loot:[["gold",15,32],["manaPotion",1,1]],faction:"hollow",aura:9063896},frostMage:{name:"Rime Cultist",hp:75,dmg:13,speed:3.8,xp:110,aggro:24,range:16,hitHeight:1.1,hitRadius:.7,ranged:!0,magic:!0,cat:{breed:"ashpoint",fur:"frost",eye:"ice",scale:1,weapon:"oakStaff",armor:"mageRobe"},loot:[["gold",18,36],["manaPotion",1,1]],faction:"hollow"},hollowWarden:{name:"The Hollow Warden",hp:300,dmg:20,speed:4,xp:260,aggro:26,range:3,hitHeight:1.4,hitRadius:1,boss:!0,cat:{breed:"longhair",fur:"ink",eye:"violet",scale:1.45,weapon:"frostAxe",armor:"wardenArmor",scarf:"#3b2a4a"},loot:[["gold",80,120],["healthPotion",2,2],["emberAmulet",1,1]],faction:"hollow",aura:9063896},marrowmaw:{name:"Marrowmaw, the Unfed",hp:620,dmg:23,speed:4.8,xp:500,aggro:32,range:3.4,hitHeight:1.7,hitRadius:1.2,boss:!0,cat:{breed:"tabby",fur:"moss",eye:"amber",scale:1.85,weapon:"frostAxe",armor:"wardenArmor",scarf:"#6b2f24"},loot:[["gold",180,240],["healthPotion",3,3],["staminaPotion",2,2]],faction:"hollow",aura:16738852},vaelmaw:{name:"Vaelmaw, the Empty Bowl",hp:1050,dmg:28,speed:4.2,xp:1200,aggro:45,range:3.8,hitHeight:2,hitRadius:1.5,boss:!0,cat:{breed:"chinchilla",fur:"ink",eye:"violet",scale:2.25,weapon:"oathBlade",armor:"wardenArmor",scarf:"#3b2a4a"},loot:[["gold",400,500],["healthPotion",3,3],["manaPotion",3,3]],faction:"hollow",aura:10178047,finalBoss:!0}},lv=[{type:"snowWolf",x:300,z:360},{type:"snowWolf",x:330,z:380},{type:"snowWolf",x:70,z:-340},{type:"snowWolf",x:-460,z:40},{type:"snowWolf",x:-480,z:70},{type:"snowWolf",x:440,z:80},{type:"snowWolf",x:400,z:260},{type:"snowWolf",x:-220,z:400},{type:"frostRat",x:-430,z:178},{type:"frostRat",x:-414,z:186},{type:"frostRat",x:-446,z:190},{type:"frostRat",x:-420,z:205},{type:"frostRat",x:-400,z:185},{type:"frostRat",x:-455,z:160},{type:"frostRat",x:-386,z:196},{type:"frostRat",x:-440,z:215},{type:"bandit",x:250,z:66},{type:"bandit",x:266,z:78},{type:"bandit",x:246,z:84},{type:"bandit",x:272,z:62},{type:"bandit",x:258,z:92},{type:"bandit",x:238,z:74},{type:"banditArcher",x:278,z:84},{type:"banditArcher",x:240,z:58},{type:"hollow",x:-330,z:-318},{type:"hollow",x:-344,z:-326},{type:"hollow",x:-320,z:-350},{type:"frostMage",x:-20,z:-520},{type:"frostMage",x:20,z:-540},{type:"snowWolf",x:-120,z:-500},{type:"snowWolf",x:60,z:-480},{type:"bandit",x:120,z:150},{type:"bandit",x:150,z:120}],cv={pawbarrow:[{type:"hollow",x:0,z:-12},{type:"hollow",x:-7,z:-20},{type:"hollow",x:7,z:-20},{type:"hollow",x:26,z:-16},{type:"hollow",x:-26,z:-14},{type:"hollowWarden",x:0,z:-50}],cinderdeep:[{type:"hollow",x:-6,z:-12},{type:"hollow",x:8,z:-20},{type:"hollow",x:28,z:-14},{type:"frostMage",x:28,z:-20},{type:"hollow",x:0,z:-46},{type:"marrowmaw",x:0,z:-54}],frostfang:[{type:"hollow",x:-8,z:-14},{type:"hollow",x:8,z:-18},{type:"frostMage",x:0,z:-26},{type:"hollow",x:-8,z:-50},{type:"hollow",x:8,z:-50},{type:"vaelmaw",x:0,z:-58}],whispercave:[{type:"hollow",x:0,z:-16},{type:"hollow",x:-5,z:-21},{type:"hollow",x:5,z:-20}]};class hv{constructor(t){this.game=t,this.all=[],this.spawnedInteriors=new Set,this.glowTex=Is(),this.nextId=0,this.killCounts=new Map,this.spawnOutdoor()}spawnOutdoor(){for(const t of lv)this.spawn(t.type,t.x,t.z,null)}reset(){for(const t of this.all)t.group&&t.group.parent&&t.group.parent.remove(t.group);this.all=[],this.spawnedInteriors.clear(),this.nextId=0,this.killCounts=new Map,this.game.enemies=this.all,this.spawnOutdoor()}setInterior(t){if(t&&!this.spawnedInteriors.has(t)){this.spawnedInteriors.add(t);const e=this.game.world.buildInteriorIfNeeded(t);for(const n of cv[t]||[])this.spawn(n.type,n.x,n.z,t,e.group)}for(const e of this.all)e.interior?e.group.visible=e.interior===t&&e.alive:e.group.visible=!t&&e.alive}spawn(t,e,n,i=null,r=null){const a=ov[t];if(!a)return null;let o;a.beast?o=av(a.beast,a.color):o=Ca(a.cat),a.scale&&o.root.scale.multiplyScalar(a.scale);const l=o.root,c=i?0:this.game.world.terrain.heightAt(e,n);l.position.set(e,c,n),(r||this.game.world.group).add(l);const h={id:"enemy"+this.nextId++,type:t,def:a,model:o,group:l,interior:i,hp:a.hp,maxHp:a.hp,alive:!0,dead:!1,speed:a.speed,damage:a.dmg,xp:a.xp,aggroRange:a.aggro,attackRange:a.range,hitHeight:a.hitHeight||1,hitRadius:a.hitRadius||.7,home:{x:e,z:n},state:"idle",facing:Math.random()*6.28,attackCd:0,wanderT:2,slowT:0,hurtT:0,specialCd:4,boss:!!a.boss,target:null,aggro:!1,loot:a.loot||[],faction:a.faction||"wild",name:a.name,ranged:!!a.ranged,magic:!!a.magic};if(a.aura||a.boss){const u=a.aura||9063896,d=new Rs(new Wi({map:this.glowTex,color:u,transparent:!0,opacity:a.boss?.35:.2,depthWrite:!1,blending:pn}));if(d.scale.setScalar(a.boss?3.2:1.6),d.position.y=a.boss?1.4:.9,l.add(d),h.aura=d,a.boss){const p=new ze(u,8,18,2);if(p.position.y=1.6,l.add(p),h.auraLight=p,t==="vaelmaw"){const g=new Ot({color:2758712,roughness:.5,metalness:.3});for(const m of[-1,1]){const f=new pt(new Ie(.12,.8,5),g);f.position.set(m*.32,2,0),f.rotation.z=-m*.5,l.add(f)}const x=new pt(new ur(.34,.04,5,10),new Ot({color:10178047,emissive:5905802,emissiveIntensity:1.2}));x.rotation.x=Math.PI/2,x.position.y=1.95,l.add(x)}}}return this.all.push(h),this.game.enemies=this.all,h}spawnMinion(t,e,n){const i=this.spawn(t,e.x,e.z,n,n?this.game.world.interiors.get(n)?.group:null);return i&&(i.aggro=!0,i.state="chase",this.game.effects.burst(e.clone().add(new T(0,1,0)),9063896,18,3)),i}update(t){const e=this.game;e.player;for(const n of this.all){if(!n.alive||n.interior&&n.interior!==e.world.activeInteriorId||!n.interior&&e.world.activeInteriorId)continue;n.attackCd=Math.max(0,n.attackCd-t),n.specialCd=Math.max(0,n.specialCd-t),n.slowT=Math.max(0,n.slowT-t),n.hurtT=Math.max(0,n.hurtT-t);const i=this.pickTarget(n),r=i.position.x-n.group.position.x,a=i.position.z-n.group.position.z,o=Math.hypot(r,a);if(!n.aggro&&o<n.aggroRange&&this.canSee(n,i)&&(n.aggro=!0,n.state="chase",e.setEnemyTarget(n),n.boss?(e.ui.showArea(n.name,n.def.finalBoss?"The Empty Bowl wakes":"A hunger stirs"),e.audio.playBossRoar()):e.audio.playGrowl()),n.aggro){n.facing=Math.atan2(r,a);const l=n.slowT>0?.4:1,c=n.speed*l;if(n.ranged)o>n.attackRange?this.moveEnemy(n,r,a,o,c,t):o<5?this.moveEnemy(n,-r,-a,o,c*.7,t):n.state="idle",n.attackCd<=0&&o<n.attackRange+2&&(n.attackCd=n.magic?2.2:1.8,n.model.playCast?n.model.playCast():n.model.playAttack(),this.shoot(n,i));else if(o>n.attackRange)this.moveEnemy(n,r,a,o,c,t);else if(n.state="attack",n.attackCd<=0){n.attackCd=n.boss?1.1:1.35,n.model.playAttack(),e.audio.playEnemySwing();const h=Math.round(n.damage*(.9+Math.random()*.2));setTimeout(()=>{if(!n.alive)return;Math.hypot(i.position.x-n.group.position.x,i.position.z-n.group.position.z)<n.attackRange+1.4&&(i.takeDamage(h,n),e.effects.spark(i.position.clone().add(new T(0,1,0)),16751226))},180)}n.boss&&this.bossSpecials(n,t,i,o)}else if(n.wanderT-=t,n.wanderT<=0&&(n.wanderT=2+Math.random()*4,n.wanderTarget={x:n.home.x+(Math.random()-.5)*8,z:n.home.z+(Math.random()-.5)*8}),n.wanderTarget){const l=n.wanderTarget.x-n.group.position.x,c=n.wanderTarget.z-n.group.position.z,h=Math.hypot(l,c);h>.8?(n.facing=Math.atan2(l,c),this.moveEnemy(n,l,c,h,1.2,t)):n.model.anim&&(n.model.anim.speed=0)}if(n.group.rotation.y+=Hl(n.group.rotation.y,n.facing)*Math.min(1,t*7),(n.state==="chase"||n.state==="attack")&&n.aggro,n.model.update(t,{speed:n.state==="chase"?n.speed*(n.slowT>0?.4:1):0,lookYaw:0}),!n.interior){const l=e.world.terrain.heightAt(n.group.position.x,n.group.position.z);n.group.position.y=l,l<1&&(n.group.position.x-=Math.sin(n.facing)*t*2,n.group.position.z-=Math.cos(n.facing)*t*2)}n.aura&&(n.aura.material.opacity=.18+Math.sin(performance.now()*.002+n.id.length)*.06),n.auraLight&&(n.auraLight.intensity=7+Math.sin(performance.now()*.003)*2),e.enemyTarget===n&&e.ui.updateEnemyBar(n)}}pickTarget(t){const e=this.game;let n=e.player,i=e.player.position.distanceTo(t.group.position);for(const r of e.companions){if(!r||r.dead||r.downed>0)continue;const a=r.group.position.distanceTo(t.group.position);a<i*.7&&(i=a,n={position:r.group.position,takeDamage:o=>this.damageCompanion(r,o),isCompanion:!0,companion:r})}return n}damageCompanion(t,e){t.hp-=e,this.game.ui.damageNumber(t.group.position,e,""),t.hp<=0&&(t.hp=0,this.game.npcs.companionDown(t))}canSee(t,e){return t.interior,!0}moveEnemy(t,e,n,i,r,a){const o=this.game;if(i<.01)return;let l=t.group.position.x+e/i*r*a,c=t.group.position.z+n/i*r*a;if(o.world.collidesCircle(l,c,.5)){const h=t.facing+Math.PI/2;if(l=t.group.position.x+Math.sin(h)*r*a,c=t.group.position.z+Math.cos(h)*r*a,o.world.collidesCircle(l,c,.5))return}t.group.position.x=l,t.group.position.z=c,t.state="chase",t.model.anim&&(t.model.anim.speed=r)}shoot(t,e){const n=this.game,i=t.group.position.clone().add(new T(0,1.4,0)),a=e.position.clone().add(new T(0,1,0)).sub(i).normalize();t.magic?(n.effects.spawnProjectile({pos:i,dir:a,speed:18,damage:t.damage,owner:"enemy",type:"ice",color:10475775,size:.22,slow:1.5}),n.audio.playMagic("ice")):(n.effects.spawnProjectile({pos:i,dir:a,speed:30,damage:t.damage,owner:"enemy",type:"arrow",color:16769184,size:.1}),n.audio.playBow())}bossSpecials(t,e,n,i){const r=this.game;if(!(t.specialCd>0))if(t.type==="marrowmaw")t.specialCd=6.5,i<10?(r.ui.subtitle(`${t.name}: “MINE.”`,2),r.effects.ring(t.group.position,16738852,8,.7),r.player.cameraShake=.5,r.audio.playBossSlam(),i<8&&r.player.takeDamage(18,t),setTimeout(()=>{t.alive&&r.effects.burst(t.group.position.clone().add(new T(0,1,0)),16738852,30,7,.8)},100)):(r.ui.subtitle(`${t.name} is winding up something unpleasant.`,1.8),t.speed=7.5,setTimeout(()=>{t.alive&&(t.speed=t.def.speed)},1600));else if(t.type==="vaelmaw"){t.specialCd=5.5;const a=t.group.position.clone().add(new T(0,2,0)),o=n.position.clone().add(new T(0,1,0)).sub(a).normalize();for(let l=-2;l<=2;l++){const c=o.clone().applyAxisAngle(new T(0,1,0),l*.18);r.effects.spawnProjectile({pos:a.clone(),dir:c,speed:15,damage:14,owner:"enemy",type:"dark",color:11827967,size:.28,aoe:0})}r.audio.playBossCast(),r.ui.subtitle(`${t.name}: “Nine little candles. One empty bowl.”`,2.5),t.hp<t.maxHp*.5&&!t.summoned&&(t.summoned=!0,r.enemies.spawnMinion("hollow",t.group.position.clone().add(new T(-3,0,2)),t.interior),r.enemies.spawnMinion("hollow",t.group.position.clone().add(new T(3,0,2)),t.interior),r.ui.toast("The Empty Bowl calls its Hollow.","bad"))}else t.type==="hollowWarden"&&(t.specialCd=7,r.effects.ring(t.group.position,9063896,5.5,.6),i<6&&r.player.takeDamage(12,t))}damageEnemy(t,e,n){if(!t.alive)return;const i=Math.random()<.1,r=Math.round(e*(i?1.7:1));if(t.hp-=r,t.aggro=!0,t.hurtT=.2,this.game.effects.damageNumber(t.group.position.clone().add(new T(0,t.hitHeight,0)),r,i?"crit":""),this.game.effects.spark(t.group.position.clone().add(new T(0,t.hitHeight,0)),i?16765562:16757370),this.game.audio.playHit(i),this.game.setEnemyTarget(t),n&&n.position){const a=t.group.position.x-n.position.x,o=t.group.position.z-n.position.z,l=Math.hypot(a,o)||1;t.group.position.x+=a/l*.35,t.group.position.z+=o/l*.35}t.model.playHurt&&t.model.playHurt(),t.hp<=0&&this.kill(t)}applySlow(t,e){t.slowT=Math.max(t.slowT,e)}kill(t){t.alive=!1,t.dead=!0,t.hp=0,t.model.die&&t.model.die(),this.killCounts.set(t.type,(this.killCounts.get(t.type)||0)+1),this.game.audio.playEnemyDeath(),this.game.quests.event("kill",t.type,1),this.game.player.addXP(t.xp);for(const[e,n,i]of t.loot){const r=Math.floor(n+Math.random()*(i-n+1));r>0&&this.game.inventory.add(e,r,e==="gold")}this.game.ui.toast(`<b>${t.name}</b> falls. +${t.xp} XP`,"good"),this.game.audio.playLoot(),t.boss&&(this.game.effects.burst(t.group.position.clone().add(new T(0,1.5,0)),t.def.aura||16765562,50,8,1.2,.18),this.game.player.cameraShake=.7,this.game.onBossDefeated(t)),this.game.enemyTarget===t&&this.game.setEnemyTarget(null)}}const xh=["main1","main2","main3","main4","main5"];class gu{constructor(t){this.game=t,this.states=new Map,this.tracked=null,this.reachTimer=0}isActive(t){const e=this.states.get(t);return!!e&&!e.complete}isComplete(t){return!!this.states.get(t)?.complete}get(t){return this.states.get(t)}def(t){return He[t]}canStart(t){const e=He[t];if(!e||this.isActive(t)||this.isComplete(t))return!1;if(e.type==="main"){const n=xh.indexOf(t);if(n>0&&!this.isComplete(xh[n-1]))return!1}return!0}start(t,e=!1){if(!this.canStart(t))return!1;const n=He[t];return this.states.set(t,{id:t,stage:0,progress:0,complete:!1,started:!0,killBase:{}}),this.game.compassTarget=null,(!this.tracked||n.type==="main")&&(this.tracked=t),e||(this.game.ui.toast(`<b>Quest started:</b> ${n.title}`,"quest"),this.game.audio.playQuest(),this.game.ui.showArea(n.title,n.type==="main"?"Main quest":"Side quest")),this.game.ui.refreshQuests(),this.game.ui.updateHUD(),!0}currentStage(t){return He[t.id]?.stages[t.stage]}event(t,e,n=1){let i=!1;for(const r of this.states.values()){if(r.complete)continue;const a=this.currentStage(r);if(!(!a||a.event!==t||a.target!==e)){if((t==="kill"||t==="collect")&&(r.progress=Math.min(a.count||1,r.progress+n),r.progress<(a.count||1))){this.game.ui.updateHUD(),this.game.ui.refreshQuests();continue}this.advance(r),i=!0}}i&&(this.game.ui.updateHUD(),this.game.ui.refreshQuests(),this.game.save(!0))}advance(t){const e=He[t.id];t.stage++,t.progress=0,t.killBase={},this.game.compassTarget=null,t.stage>=e.stages.length?this.complete(t):(this.game.ui.toast(`<b>${e.title}</b><br>${e.stages[t.stage].text}`,"quest"),this.game.audio.playQuest())}complete(t){const e=He[t.id];t.complete=!0,t.stage=e.stages.length-1;const n=e.reward||{};n.xp&&this.game.player.addXP(n.xp),n.gold&&this.game.inventory.add("gold",n.gold);for(const i of n.items||[])this.game.inventory.add(i,1,!0);if(this.game.ui.toast(`<b>Quest complete:</b> ${e.title}<br>+${n.xp||0} XP · +${n.gold||0} gold`,"good"),this.game.audio.playQuestComplete(),this.tracked===t.id){const i=[...this.states.values()].find(r=>!r.complete&&He[r.id].type==="main");this.tracked=i?i.id:[...this.states.values()].find(r=>!r.complete)?.id||null}t.id==="main5"&&this.game.victory(),this.game.ui.refreshQuests()}pendingTalk(t){for(const e of this.states.values()){if(e.complete)continue;const n=this.currentStage(e);if(n&&n.event==="talk"&&n.target===t)return e}return null}offersFor(t){return lu.filter(e=>e.giver===t&&this.canStart(e.id))}turnIn(t){return this.pendingTalk(t)?(this.event("talk",t,1),!0):!1}update(t){if(this.reachTimer-=t,this.reachTimer>0)return;this.reachTimer=.45;const e=this.game.player.position;for(const n of this.states.values()){if(n.complete)continue;const i=this.currentStage(n);if(!i||i.event!=="reach")continue;const r=Sn[i.target];r&&px(e.x,e.z,r.x,r.z)<(r.radius||30)*.82&&this.event("reach",i.target,1)}}markerPosition(t){const e=this.states.get(t);if(!e||e.complete)return null;const n=this.currentStage(e);if(!n)return null;const i=n.marker||n.target,r=this.game.npcs?.byId?.[i];if(r)return r.mapPos?{x:r.mapPos.x,z:r.mapPos.z,name:r.name}:{x:r.group.position.x,z:r.group.position.z,name:r.name};const a=Sn[i];return a?{x:a.x,z:a.z,name:a.name}:null}trackedInfo(){if(!this.tracked){const r=[...this.states.values()].find(a=>!a.complete&&He[a.id].type==="main");r&&(this.tracked=r.id)}const t=this.tracked?this.states.get(this.tracked):null;if(!t||t.complete)return null;const e=He[t.id],n=this.currentStage(t);if(!n)return null;let i=n.text;return(n.count||1)>1&&(i=i.replace(/\(\d+\/\d+\)/,`(${t.progress}/${n.count})`)),{id:t.id,title:e.title,type:e.type,text:i,stage:n,marker:this.markerPosition(t.id),progress:t.progress,count:n.count||1}}save(){return{states:[...this.states.entries()],tracked:this.tracked}}load(t){t&&(this.states=new Map(t.states||[]),this.tracked=t.tracked||null)}}class xu{constructor(t){this.game=t,this.slots=new Map,this.gold=0,this.equipment={weapon:null,armor:null,trinket:null,bow:null}}initFromClass(t){this.slots.clear();for(const e of t.items)this.add(e,1,!0);this.gold=35;for(const e in t.equip){const n=t.equip[e];n&&he[n]&&(this.equipment[e]=n)}}add(t,e=1,n=!1){if(t==="gold"){this.gold+=e,n||this.game.ui.toast(`+${e} gold`,"good");return}const i=he[t];if(!i)return;const r=this.slots.get(t)||0;this.slots.set(t,r+e),n||(this.game.ui.toast(`+ ${i.name}${e>1?" ×"+e:""}`,"good"),this.game.audio.playPickup()),this.game.quests?.event("collect",t,e),this.game.ui?.refreshInventory()}remove(t,e=1){const n=this.slots.get(t)||0;if(n<e)return!1;n===e?this.slots.delete(t):this.slots.set(t,n-e);for(const i in this.equipment)this.equipment[i]===t&&!this.has(t)&&(this.equipment[i]=null);return this.game.ui?.refreshInventory(),!0}has(t,e=1){return(this.slots.get(t)||0)>=e}count(t){return this.slots.get(t)||0}equip(t){const e=he[t];if(!e)return;let n=null;e.type==="weapon"?n="weapon":e.type==="armor"?n="armor":e.type==="trinket"?n="trinket":e.type==="bow"&&(n="bow"),n&&(this.equipment[n]=this.equipment[n]===t?null:t,this.game.audio.playEquip(),this.game.player?.refreshGear(),this.game.ui?.refreshInventory(),this.game.ui?.toast(this.equipment[n]?`Equipped ${e.name}`:`Unequipped ${e.name}`))}use(t){const e=he[t];if(!e)return!1;if(e.type==="potion"||e.type==="food"){const n=this.game.player;return e.heal&&n.heal(e.heal),e.mana&&n.restoreMana(e.mana),e.stamina&&n.restoreStamina(e.stamina),this.remove(t,1),this.game.audio.playDrink(),this.game.effects.burst(n.position.clone().add(new T(0,1,0)),e.type==="potion"?16767392:10216859,12,2),this.game.ui.toast(`Used ${e.name}`,"good"),!0}return!1}quickHeal(){for(const t of["healthPotion","stew","cheese","bread","fish"])if(this.has(t))return this.use(t),!0;return this.game.ui.toast("No potions or food left. Try not dying.","bad"),!1}weight(){let t=0;for(const[e,n]of this.slots){const i=he[e];t+=(i?.type==="armor"?4:i?.type==="weapon"?3:.4)*n}return Math.round(t*10)/10}statSummary(){const t=this.equipment,e=he[t.weapon],n=he[t.armor],i=he[t.trinket],r=he[t.bow];return{damage:(e?.dmg||0)+(i?.dmg||0),armor:(n?.armor||0)+(i?.armor||0),magic:(e?.magic||0)+(n?.magic||0)+(i?.magic||0),bow:r?.dmg||0,weaponSpeed:e?.speed||1,weaponName:e?.name||"Claws",bowName:r?.name||"No bow",armorName:n?.name||"No armor",trinketName:i?.name||"No trinket"}}save(){return{slots:[...this.slots.entries()],gold:this.gold,equipment:{...this.equipment}}}load(t){t&&(this.slots=new Map(t.slots||[]),this.gold=t.gold||0,this.equipment={weapon:null,armor:null,trinket:null,bow:null,...t.equipment||{}})}}const ta=new T;class uv{constructor(t){this.game=t,this.scene=t.scene,this.projectiles=[],this.particles=[],this.arcs=[],this.lines=[],this.rings=[],this.lightPool=[],this.glowTex=Is()}burst(t,e=16764810,n=14,i=3,r=.8,a=.12){const o=new re(a,4,3);for(let l=0;l<n;l++){const c=new Me({color:e,transparent:!0,opacity:1,blending:pn,depthWrite:!1}),h=new pt(o,c);h.position.copy(t);const u=new T(Math.random()-.5,Math.random()*.8+.1,Math.random()-.5).normalize();h.userData.vel=u.multiplyScalar(i*(.4+Math.random())),h.userData.life=r*(.6+Math.random()*.6),h.userData.max=h.userData.life,this.scene.add(h),this.particles.push(h)}}spark(t,e=16769184){this.burst(t,e,7,2.2,.35,.08)}slash(t,e,n=16773327){const i=new xa(.9,2.1,18,1,-.7,1.4),r=new Me({color:n,transparent:!0,opacity:.75,side:Ge,blending:pn,depthWrite:!1}),a=new pt(i,r);a.rotation.x=-Math.PI/2,a.rotation.z=-e+Math.PI/2,a.position.copy(t).add(new T(0,1.1,0)),this.scene.add(a),this.arcs.push({mesh:a,life:.22,max:.22})}ring(t,e=16765562,n=4,i=.5){const r=new xa(n*.2,n,32),a=new Me({color:e,transparent:!0,opacity:.7,side:Ge,blending:pn,depthWrite:!1}),o=new pt(r,a);o.rotation.x=-Math.PI/2,o.position.copy(t).add(new T(0,.15,0)),this.scene.add(o),this.rings.push({mesh:o,life:i,max:i,radius:n})}beam(t,e,n=10475775,i=.25){const r=[];for(let u=0;u<=8;u++){const d=u/8,p=t.clone().lerp(e,d);u>0&&u<8&&(p.x+=(Math.random()-.5)*.8,p.y+=(Math.random()-.5)*.8,p.z+=(Math.random()-.5)*.8),r.push(p)}const o=new ue().setFromPoints(r),l=new wa({color:n,transparent:!0,opacity:1,blending:pn}),c=new Dl(o,l);this.scene.add(c),this.lines.push({mesh:c,life:i,max:i});const h=new ze(n,16,25,2);h.position.copy(e),this.scene.add(h),this.lightPool.push({light:h,life:.25}),this.burst(e,n,16,4,.5,.1)}spawnProjectile(t){const e=new Kt,n=t.color||16751429,i=new pt(new re(t.size||.22,8,6),new Me({color:n})),r=new Rs(new Wi({map:this.glowTex,color:n,transparent:!0,opacity:.75,depthWrite:!1,blending:pn}));r.scale.setScalar((t.size||.22)*9),e.add(i,r),e.position.copy(t.pos),this.scene.add(e);const a=new ze(n,7,12,2);e.add(a);const o={group:e,core:i,color:n,light:a,vel:t.dir.clone().normalize().multiplyScalar(t.speed||26),damage:t.damage||10,owner:t.owner||"player",type:t.type||"fire",radius:t.radius||.55,life:t.life||3.2,age:0,onHit:t.onHit,aoe:t.aoe||0,slow:t.slow||0,target:t.target||null,homing:t.homing||0};return this.projectiles.push(o),o}update(t){const e=this.game;for(let n=this.particles.length-1;n>=0;n--){const i=this.particles[n];if(i.userData.life-=t,i.userData.life<=0){this.scene.remove(i),i.material.dispose(),this.particles.splice(n,1);continue}i.userData.vel.y-=9.8*t,i.position.addScaledVector(i.userData.vel,t),i.material.opacity=i.userData.life/i.userData.max,i.scale.setScalar(.5+i.userData.life/i.userData.max)}for(let n=this.arcs.length-1;n>=0;n--){const i=this.arcs[n];if(i.life-=t,i.life<=0){this.scene.remove(i.mesh),i.mesh.geometry.dispose(),i.mesh.material.dispose(),this.arcs.splice(n,1);continue}i.mesh.material.opacity=.75*(i.life/i.max),i.mesh.scale.setScalar(1+(1-i.life/i.max)*.35)}for(let n=this.rings.length-1;n>=0;n--){const i=this.rings[n];if(i.life-=t,i.life<=0){this.scene.remove(i.mesh),i.mesh.geometry.dispose(),i.mesh.material.dispose(),this.rings.splice(n,1);continue}const r=1-i.life/i.max;i.mesh.scale.setScalar(.4+r*1.5),i.mesh.material.opacity=.7*(1-r)}for(let n=this.lines.length-1;n>=0;n--){const i=this.lines[n];if(i.life-=t,i.life<=0){this.scene.remove(i.mesh),i.mesh.geometry.dispose(),i.mesh.material.dispose(),this.lines.splice(n,1);continue}i.mesh.material.opacity=i.life/i.max}for(let n=this.lightPool.length-1;n>=0;n--){const i=this.lightPool[n];i.life-=t,i.light.intensity=Math.max(0,16*(i.life/.25)),i.life<=0&&(this.scene.remove(i.light),this.lightPool.splice(n,1))}for(let n=this.projectiles.length-1;n>=0;n--){const i=this.projectiles[n];i.age+=t,i.life-=t;let r=!1;if(i.homing&&i.target&&i.target.alive){const o=i.target.group.position.clone().add(new T(0,1,0)).sub(i.group.position).normalize().multiplyScalar(i.vel.length());i.vel.lerp(o,Math.min(1,t*3))}i.group.position.addScaledVector(i.vel,t),i.group.position.y+=Math.sin(i.age*12)*.002;const a=e.world.groundHeight(i.group.position.x,i.group.position.z);if(i.group.position.y<a+.2&&(r=!0),i.age>i.life&&(r=!0),!r)if(i.owner==="player"){for(const o of e.enemies)if(!(!o.alive||(o.interior||null)!==(e.world.activeInteriorId||null))&&(ta.copy(o.group.position).add(new T(0,o.hitHeight||1,0)),i.group.position.distanceTo(ta)<(o.hitRadius||.7)+i.radius)){this.projectileHit(i,o),r=!0;break}}else{const o=[e.player,...e.companions];for(const l of o)if(!(!l||l.dead)&&(ta.copy(l.position).add(new T(0,1,0)),i.group.position.distanceTo(ta)<1+i.radius)){this.projectileHit(i,l),r=!0;break}}r&&this.explodeProjectile(i,n)}}projectileHit(t,e){t.onHit?t.onHit(e,t):e.takeDamage&&e.takeDamage(t.damage,t)}explodeProjectile(t,e){const n=this.game,i=t.group.position.clone();if(this.scene.remove(t.group),t.core.geometry.dispose(),t.core.material.dispose(),t.aoe>0){this.burst(i,t.color,24,6,.7,.14),this.ring(i,t.color,t.aoe,.5);const r=t.owner==="player"?n.enemies:[n.player,...n.companions];for(const a of r){if(!a||!a.alive||a.dead)continue;const o=a.group?a.group.position.distanceTo(i):a.position.distanceTo(i);if(o<t.aoe){const l=1-o/t.aoe*.55;a.takeDamage&&a.takeDamage(Math.round(t.damage*l),t)}}this.game.audio.playExplosion(),this.game.player.cameraShake=Math.max(this.game.player.cameraShake,.22)}else this.burst(i,t.color,10,3,.45,.1);this.projectiles.splice(e,1)}damageNumber(t,e,n=""){const i=this.game,r=t.clone().add(new T((Math.random()-.5)*.6,1.4+Math.random()*.4,0));r.project(i.camera);const a=(r.x*.5+.5)*window.innerWidth,o=(-r.y*.5+.5)*window.innerHeight,l=document.createElement("div");l.className="dmg "+n,l.textContent=(n==="heal"?"+":"")+e,l.style.left=a+"px",l.style.top=o+"px",i.ui.floatLayer.appendChild(l),setTimeout(()=>l.remove(),1e3)}screenFlash(t="#ffcf8a",e=.22){const n=document.createElement("div");n.style.cssText=`position:fixed;inset:0;background:${t};opacity:${e};pointer-events:none;z-index:15;transition:opacity .35s`,document.body.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="0"}),setTimeout(()=>n.remove(),500)}}const vh=[["Meow.","A measured response. The cat respects it."],["Mrrrp?","The cat tilts their head. You have asked a very cat question."],["*slow blink*","A great honour. You are now friends, or at least not enemies."],["*knocks a nearby object off a ledge*","The cat looks at the object, then at you, then at the object. No regrets."],["I am the Tenth.","“We know,” says the cat. “You are also standing on my tail.”"]];class dv{constructor(t){this.game=t,this.npc=null,this.node=null,this.history=[],this.el={screen:document.getElementById("dialogue"),name:document.getElementById("dlg-name"),text:document.getElementById("dlg-text"),options:document.getElementById("dlg-options"),avatar:document.getElementById("dlg-avatar"),close:document.getElementById("dlg-close")},this.el.close?.addEventListener("click",()=>this.close())}get open(){return this.game.mode==="dialogue"&&!!this.npc}start(t){if(!t||this.open)return;this.npc=t,this.game.mode="dialogue",this.game.input.clear?.(),this.game.ui.hideInteract(),this.game.audio.meow(.9+Math.random()*.3),t.cat.playTalk(),Vl(t.cat,this.el.avatar),this.el.name.textContent=t.name,this.el.screen.classList.add("show"),this.game.ui.setAiming(!1),this.game.player.aiming=!1;const e=this.game.player.position;t.facing=Math.atan2(e.x-t.group.position.x,e.z-t.group.position.z),this.game.player.yaw=Math.atan2(t.group.position.x-e.x,t.group.position.z-e.z),this.game.player.group.rotation.y=this.game.player.yaw,this.root()}close(){if(!this.npc)return;const t=this.npc;this.el.screen.classList.remove("show"),this.npc=null,this.node=null,this.game.mode="play",t.cat&&(t.cat.anim.talk=0),this.game.input.clear?.()}say(t,e){this.el.text.innerHTML=t,this.el.options.innerHTML="";const n=e||[];n.forEach((i,r)=>{const a=document.createElement("button");a.className="dlg-opt",a.innerHTML=`${i.label}${i.tag?`<span class="tag ${i.kind||""}">${i.tag}</span>`:""}`,a.addEventListener("click",()=>{this.game.audio.playUIClick(),i.action&&i.action()}),this.el.options.appendChild(a),r===0&&setTimeout(()=>a.focus?.(),20)}),this.node={text:t,options:n}}root(){const t=this.game,e=this.npc;if(!e)return;const n=t.quests.pendingTalk(e.id),i=t.quests.offersFor(e.id),r=e.greet?.[Math.floor(Math.random()*e.greet.length)]||"Mrrp.";if(n){const o=t.quests.currentStage(n),l=He[n.id],c=o.event==="talk",h=[];c&&h.push({label:this.turnInLabel(e,n),tag:"Quest",kind:"quest",action:()=>this.turnIn(e,n)}),h.push(...this.commonOptions(e)),this.say(`“${this.pendingLine(e,l)}”`,h);return}const a=[];if(i.length)for(const o of i)a.push({label:`“${this.offerPrompt(o,e)}”`,tag:o.type==="main"?"Main quest":"Side quest",kind:"quest",action:()=>this.offer(o)});e.def?.companion&&!e.recruited&&a.push({label:`“Walk with me, ${e.name.split(" ")[0]}.”`,tag:"Companion",kind:"quest",action:()=>this.recruit(e)}),e.recruited&&e.companion&&a.push({label:e.waiting?"“Follow me again.”":"“Wait here for now.”",tag:"Companion",kind:"quest",action:()=>{t.npcs.setCompanionWait(e,!e.waiting),this.root()}}),e.merchant&&a.push({label:"“Show me your wares.”",tag:"Trade",kind:"shop",action:()=>{this.close(),t.openShop(e)}}),a.push(...this.commonOptions(e)),this.say(`“${r}”`,a)}commonOptions(t){const e=this.game,n=[];return t.id==="seer"&&(n.push({label:"“Tell me about the Tenth.”",action:()=>this.say(`“${t.prophecy}”`,[{label:"“That is either profound or a threat.”",action:()=>this.say("“Yes,” says Mothwhisker, and refuses to elaborate.",this.commonOptions(t))},{label:"Back",action:()=>this.root()}])}),n.push({label:"“Can I rest here?”",action:()=>{this.say("“The stones remember warmth. Take some. Try not to take all of it.”",[{label:"Rest at the shrine",action:()=>{this.close(),e.restAtShrine("Shrine of the Nine",-40,178)}},{label:"Back",action:()=>this.root()}])}})),t.lore&&n.push({label:"“Tell me of this place.”",action:()=>this.say(`“${t.lore}”`,[{label:"“Fascinating.”",action:()=>this.say("“It is,” the cat agrees, and waits for you to leave.",this.commonOptions(t))},{label:"Back",action:()=>this.root()}])}),t.merchant&&n.push({label:"“What do you sell?”",action:()=>this.say(`“${t.merchant.line}”`,[{label:"Browse the wares",tag:"Trade",kind:"shop",action:()=>{this.close(),e.openShop(t)}},{label:"Back",action:()=>this.root()}])}),t.guard&&n.push({label:"“Any trouble on the roads?”",action:()=>this.say(this.guardLine(t),[{label:"“I will look into it.”",action:()=>this.say("“See that you do. The paperwork is already filed.”",this.commonOptions(t))},{label:"Back",action:()=>this.root()}])}),n.push({label:"“*meow*”",action:()=>{const i=vh[Math.floor(Math.random()*vh.length)];this.game.audio.meow(1.2),this.say(`${i[0]}<br/><span style="color:#7f96a1;font-style:italic">${i[1]}</span>`,this.commonOptions(t))}}),n.push({label:"“Farewell.”",action:()=>this.close()}),n}guardLine(t){return t.id==="captain"?"“Bandits at Scarwood Camp. Four of them will do. Bring proof, or at least a convincing limp.”":t.id==="brindle"?"“Wolves in the hills. Rats in the fields. And a rumour that the fish have formed a union.”":"“Nothing I cannot handle. Probably. Do not quote me.”"}offerPrompt(t,e){if(t.type==="main")return t.id==="main1"?"I am listening. Make it quick.":"What does the prophecy require now?";switch(t.id){case"rats":return"You look like you can kill things. Small things. Rats.";case"locket":return"Have you seen a locket? Silver? Fish-related?";case"lute":return"A tragedy has occurred. My lute has been stolen.";case"fish":return"Three fish. I need three fish. Do not make it weird.";case"bandits":return"You. You have a sword-shaped look about you.";case"herb":return"Do you fetch things? I need a thing fetched.";default:return"I have a task."}}offer(t){const e=this.game,n=[{label:t.type==="main"?"“I will do it.”":"“Fine. I will help.”",tag:"Accept",kind:"quest",action:()=>{e.quests.start(t.id),this.say(`“${this.acceptLine(t)}”`,this.commonOptions(this.npc))}},{label:"“Not right now.”",action:()=>this.root()}];this.say(`<b>${t.title}</b><br/>${t.summary}`,n)}acceptLine(t){switch(t.id){case"main1":return"Good. The seer waits at the Shrine of the Nine. Try not to be late twice.";case"main2":return"The barrow is west of the city. The Hollow are already inside. Bring something sharp and something warm.";case"main3":return"Bramble is in the Leaky Whisker. Soot is in Frostpelt. They will pretend to be hard to convince.";case"main4":return"Cinderdeep, in the eastern peaks. Marrowmaw guards the bell. He is very hungry and very rude.";case"main5":return"The door beneath Frostfang. Bring the Ember and the Bell. Bring your friends. Do not bring snacks; the Bowl is listening.";case"rats":return"Five rats. The turnips are counting on you. So am I. Mostly the turnips.";case"locket":return"The old barrow, west of the city. If the fish is still handsome, do not tell it.";case"lute":return"Scarwood Camp, north of here. Mind the bandits. And the lute. It is sensitive.";case"fish":return"The river and the lake. Three fish. If they resist, remind them of their place in the food chain.";case"bandits":return"Four bandits at Scarwood. The Watch will handle the forms.";case"herb":return"The Whispering Cave. It knows your name. Do not give it your address.";default:return"Good. Off you go."}}pendingLine(t,e){return e?e.type==="main"?e.id==="main1"?"You are here. The stones are humming. That is either prophecy or indigestion.":"You return. The snow has been telling stories about you. Mostly flattering.":t.id==="mittens"?"You have it? You have the locket? Do not look at the fish.":"You are back. Good. I was starting to write a ballad about your death.":"You have something for me?"}turnInLabel(t,e){const n=He[e.id];return n.type==="main"?"“I have done what you asked.”":`“About ${n.title}…”`}turnIn(t,e){const n=this.game,i=He[e.id];e.stage,n.quests.turnIn(t.id);const r=n.quests.get(e.id),a=r?.complete;let o;if(a){const c=i.reward||{};o=`“${this.completeLine(i)}”<br/><span style="color:#d8b16a">+${c.xp||0} XP · +${c.gold||0} gold</span>`}else{const c=n.quests.currentStage(r);o=`“${this.nextLine(i,c)}”`}const l=this.commonOptions(t);this.say(o,l)}completeLine(t){switch(t.id){case"main1":return"Then it begins. The Tenth has arrived, and the snow is already nervous.";case"main2":return"The Ember. Still warm. Still angry. Keep it close; the dark knows its shape.";case"main3":return"A bard and a mage. The prophecy has a sense of humour after all.";case"main4":return"The Bell. It has been trying to apologise for a thousand years. Let it.";case"main5":return"The Bowl is empty. The kingdom is not. That is the difference, little hunter.";case"rats":return"Five rats fewer. The turnips have nominated you for a medal.";case"locket":return"The fish is safe. He looks relieved. Do not ask how I can tell.";case"lute":return"My lute! Gerald the string is still missing, but the rest of the chord progression is intact.";case"fish":return"Three fish. The feast is saved. The fish are not.";case"bandits":return"The north road is quiet. I have filed the paperwork in triplicate.";case"herb":return"Dreamherb. I can finally sleep. Or see the sleeping. Either way, thank you.";default:return"Well done."}}nextLine(t,e){return e?e.text:"Well done."}recruit(t){this.game.npcs.recruit(t),this.game.quests.event("recruit",t.id,1);const n=t.companionType==="mage"?"“I packed three potions and one very bad idea. Let us go.”":"“Finally. I have been practising my heroic entrance for weeks. How was it?”";this.say(n,this.commonOptions(t))}}class fv{constructor(){this.ctx=null,this.master=null,this.sfxBus=null,this.musicBus=null,this.ambientBus=null,this.ready=!1,this.musicVol=.5,this.sfxVol=.8,this.enabled=!0,this.night=0,this.ambientT=3,this.birdT=4,this.musicT=6,this.chordIndex=0,this.creakT=20,this._unlockHandler=()=>this.unlock(),window.addEventListener("pointerdown",this._unlockHandler,{once:!0}),window.addEventListener("keydown",this._unlockHandler,{once:!0})}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=.9,this.master.connect(this.ctx.destination),this.sfxBus=this.ctx.createGain(),this.sfxBus.gain.value=this.sfxVol,this.sfxBus.connect(this.master),this.musicBus=this.ctx.createGain(),this.musicBus.gain.value=this.musicVol*.5,this.musicBus.connect(this.master),this.ambientBus=this.ctx.createGain(),this.ambientBus.gain.value=.5,this.ambientBus.connect(this.master),this.ready=!0,this.startWind(),this.startMusic()}catch(e){console.warn("Audio unavailable",e)}}setMusicVolume(t){this.musicVol=t,this.musicBus&&this.musicBus.gain.setTargetAtTime(t*.5,this.ctx.currentTime,.1)}setSfxVolume(t){this.sfxVol=t,this.sfxBus&&this.sfxBus.gain.setTargetAtTime(t,this.ctx.currentTime,.1)}setNight(t){this.night=t}now(){return this.ctx?this.ctx.currentTime:0}tone(t,e,n="sine",i=.12,r=null,a=0,o=null){if(!this.ready)return;const l=this.now()+a,c=this.ctx.createOscillator(),h=this.ctx.createGain();c.type=n,c.frequency.setValueAtTime(t,l),r&&c.frequency.exponentialRampToValueAtTime(Math.max(20,r),l+e),h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(Math.max(1e-4,i),l+Math.min(.02,e*.2)),h.gain.exponentialRampToValueAtTime(1e-4,l+e),c.connect(h),h.connect(o||this.sfxBus),c.start(l),c.stop(l+e+.05)}noise(t=.2,e=.15,n=1200,i="bandpass",r=0,a=1){if(!this.ready)return;const o=this.now()+r,l=Math.max(1,Math.floor(this.ctx.sampleRate*t)),c=this.ctx.createBuffer(1,l,this.ctx.sampleRate),h=c.getChannelData(0);for(let g=0;g<l;g++)h[g]=Math.random()*2-1;const u=this.ctx.createBufferSource();u.buffer=c;const d=this.ctx.createBiquadFilter();d.type=i,d.frequency.value=n,d.Q.value=a;const p=this.ctx.createGain();p.gain.setValueAtTime(e,o),p.gain.exponentialRampToValueAtTime(1e-4,o+t),u.connect(d),d.connect(p),p.connect(this.sfxBus),u.start(o),u.stop(o+t+.02)}startWind(){if(!this.ctx)return;const t=this.ctx.sampleRate*4,e=this.ctx.createBuffer(1,t,this.ctx.sampleRate),n=e.getChannelData(0);let i=0;for(let u=0;u<t;u++)i=(i+(Math.random()*2-1)*.03)*.996,n[u]=i*3;const r=this.ctx.createBufferSource();r.buffer=e,r.loop=!0;const a=this.ctx.createBiquadFilter();a.type="lowpass",a.frequency.value=520,a.Q.value=.4;const o=this.ctx.createGain();o.gain.value=.16,r.connect(a),a.connect(o),o.connect(this.ambientBus),r.start(),this.windGain=o,this.windFilter=a;const l=this.ctx.createBufferSource();l.buffer=e,l.loop=!0;const c=this.ctx.createBiquadFilter();c.type="bandpass",c.frequency.value=1500,c.Q.value=3;const h=this.ctx.createGain();h.gain.value=.02,l.connect(c),c.connect(h),h.connect(this.ambientBus),l.start(),this.whistle=h}startMusic(){this.pad=[];const t=[110,130.81,146.83,98];for(const e of t){const n=this.ctx.createOscillator(),i=this.ctx.createGain();n.type="sine",n.frequency.value=e,i.gain.value=0;const r=this.ctx.createOscillator(),a=this.ctx.createGain();r.frequency.value=.05+Math.random()*.05,a.gain.value=1.2,r.connect(a),a.connect(n.frequency),n.connect(i),i.connect(this.musicBus),n.start(),r.start(),this.pad.push({osc:n,g:i})}this.padGain=.035}update(t,e){if(!this.ready)return;const n=this.now();this.windGain&&this.windGain.gain.setTargetAtTime(.1+Math.sin(n*.11)*.05+(this.night>.5?.05:0),n,.6),this.whistle&&this.whistle.gain.setTargetAtTime(.012+Math.sin(n*.23)*.01,n,.8);for(let i=0;i<this.pad.length;i++){const r=this.pad[i],a=this.padGain*(.5+Math.sin(n*.07+i*1.7)*.5)*(this.gamePaused?.25:1);r.g.gain.setTargetAtTime(a,n,.8)}this.gamePaused||(this.birdT-=t,this.birdT<=0&&(this.birdT=2.5+Math.random()*7,this.night<.45&&this.chirp()),this.creakT-=t,this.creakT<=0&&(this.creakT=14+Math.random()*26,this.night>.5?this.tone(60+Math.random()*40,1.8,"sine",.03,45):this.noise(1.4,.02,700,"lowpass")),this.musicT-=t,this.musicT<=0&&(this.musicT=4+Math.random()*6,this.bell()))}chirp(){if(!this.ready)return;const t=1600+Math.random()*1400,e=2+Math.floor(Math.random()*3);for(let n=0;n<e;n++)this.tone(t+Math.random()*400,.07,"sine",.018,t-300,n*.09,this.ambientBus)}bell(){if(!this.ready)return;const t=[261.63,293.66,329.63,392,440,523.25,587.33],e=t[Math.floor(Math.random()*t.length)]*(Math.random()<.3?2:1);this.tone(e,3.2,"sine",.028,e*.995,0,this.musicBus),this.tone(e*2.01,2.2,"sine",.012,e*2,0,this.musicBus),this.tone(e*3.02,1.4,"sine",.006,e*3,0,this.musicBus)}playStep(t=!1,e="snow"){if(t){this.noise(.22,.07,900,"lowpass");return}e==="wood"?this.noise(.09,.05,420,"bandpass",0,2):this.noise(.11,.035,900+Math.random()*500,"highpass")}playSword(){this.noise(.16,.11,2600,"bandpass",0,2),this.tone(420,.1,"triangle",.03,260)}playEnemySwing(){this.noise(.2,.09,900,"bandpass",0,1.5)}playHit(t=!1){this.noise(.12,t?.2:.13,t?800:600,"lowpass"),this.tone(t?160:120,.12,"square",.05,60)}playBlock(){this.noise(.18,.16,3200,"bandpass",0,4),this.tone(700,.2,"triangle",.04,500)}playHurt(){this.tone(180,.22,"sawtooth",.05,90),this.noise(.14,.06,500)}playDeath(){this.tone(140,1.2,"sine",.1,55),this.tone(95,1.6,"triangle",.06,40,.15)}playJump(){this.tone(320,.12,"sine",.035,480)}playLand(){this.noise(.1,.05,300,"lowpass")}playDoor(){this.noise(.35,.07,260,"lowpass"),this.tone(90,.4,"triangle",.04,60)}playPickup(){this.tone(720,.12,"sine",.05,960),this.tone(1080,.1,"sine",.03,1200,.06)}playLoot(){this.tone(520,.16,"triangle",.04,700)}playEquip(){this.noise(.1,.05,1800,"bandpass"),this.tone(300,.12,"triangle",.04,420)}playDrink(){this.tone(300,.18,"sine",.05,500),this.tone(600,.14,"sine",.03,700,.1)}playBow(){this.noise(.1,.07,2200,"bandpass",0,3),this.tone(600,.2,"triangle",.03,180)}playQuest(){[523,659,784].forEach((t,e)=>this.tone(t,.4,"sine",.05,t,e*.1))}playQuestComplete(){[392,523,659,784,1046].forEach((t,e)=>this.tone(t,.7,"sine",.055,t,e*.12))}playLevelUp(){[261,329,392,523,659,784].forEach((t,e)=>this.tone(t,.9,"triangle",.05,t,e*.09))}playFail(){this.tone(220,.18,"square",.035,160)}playUIClick(){this.tone(660,.05,"triangle",.025,700)}playUIConfirm(){this.tone(520,.09,"triangle",.03,780)}playGrowl(){this.tone(90,.5,"sawtooth",.045,60),this.noise(.4,.04,300,"lowpass")}playEnemyDeath(){this.tone(200,.5,"sawtooth",.04,70),this.noise(.3,.05,400)}playBossRoar(){this.tone(70,1.8,"sawtooth",.09,40),this.tone(105,1.5,"square",.04,55,.1),this.noise(1.4,.08,260,"lowpass")}playBossSlam(){this.noise(.5,.2,180,"lowpass"),this.tone(60,.6,"sine",.12,35)}playBossCast(){this.tone(300,.7,"sawtooth",.05,900),this.tone(450,.9,"sine",.04,1200,.1)}playExplosion(){this.noise(.5,.2,320,"lowpass"),this.tone(80,.4,"square",.07,40)}playMagic(t="fire"){this.ready&&(t==="fire"?(this.noise(.4,.12,800,"lowpass"),this.tone(220,.3,"sawtooth",.05,90),this.tone(440,.25,"sine",.03,880)):t==="ice"?(this.tone(900,.35,"sine",.05,1600),this.tone(1400,.4,"triangle",.03,2100,.05),this.noise(.25,.04,3e3,"bandpass")):t==="lightning"?(this.noise(.3,.18,2400,"bandpass",0,2),this.tone(1200,.2,"sawtooth",.05,200)):t==="heal"?[523,659,784,1046].forEach((e,n)=>this.tone(e,.5,"sine",.04,e,n*.08)):this.tone(500,.3,"sine",.04,800))}meow(t=1){if(!this.ready)return;const e=420*t,n=.42,i=this.now(),r=this.ctx.createOscillator(),a=this.ctx.createGain(),o=this.ctx.createBiquadFilter();o.type="bandpass",o.frequency.value=1100*t,o.Q.value=2.5,r.type="sawtooth",r.frequency.setValueAtTime(e*.8,i),r.frequency.exponentialRampToValueAtTime(e*1.5,i+.1),r.frequency.exponentialRampToValueAtTime(e*1.1,i+.28),r.frequency.exponentialRampToValueAtTime(e*.7,i+n),a.gain.setValueAtTime(1e-4,i),a.gain.exponentialRampToValueAtTime(.09,i+.05),a.gain.exponentialRampToValueAtTime(1e-4,i+n),r.connect(o),o.connect(a),a.connect(this.sfxBus),r.start(i),r.stop(i+n+.05)}purr(){this.ready&&this.noise(1.2,.03,120,"lowpass")}}const _e=s=>document.getElementById(s),Ee=(s,t,e)=>{const n=document.createElement(s);return t&&(n.className=t),e!=null&&(n.innerHTML=e),n},ps=s=>Math.max(0,Math.ceil(s));class pv{constructor(t){this.game=t,this.invFilter="all",this.questSelected=null,this.panel=null,this.toastCount=0,this.areaTimer=null,this.subTimer=null,this.compassT=0,this.mapOpen=!1,this.shopNpc=null,this.hudHidden=!1,this.photo=!1,this.lastWeather="",this.mapMarkers=[],this.questMarkerEls=null,this.refs={},this.cache(),this.icons(),this.buildCreator(),this.buildCompass(),this.wire(),this.floatLayer=this.refs.floatLayer}cache(){const t=["hud","hud-avatar","hud-level","hud-name","hud-class","bar-health","txt-health","bar-stamina","txt-stamina","bar-mana","txt-mana","bar-xp","txt-xp","hud-gold","hud-time","hud-weather","location","compass-strip","quest-tracker","qt-type","qt-title","qt-obj","qt-dist","enemy-frame","enemy-name","enemy-hp","crosshair","hotbar","weapon-ico","weapon-name","weapon-stat","potion-count","hint-text","interact-prompt","interact-text","toasts","float-layer","subtitle","area-banner","area-eyebrow","area-name","area-sub","photo-badge","mobile-controls","inv-gold","inv-weight","eq-weapon","eq-armor","eq-trinket","eq-bow","stats-card","inv-grid","skill-points","skill-body","quest-list","quest-detail","map-canvas","map-loc","map-desc","map-markers","shop-eyebrow","shop-name","shop-gold","shop-buy","shop-sell","shop-line","shop","inventory","skills","quests","map","pause","help","death","victory","death-line","victory-stats","victory-line","settings-box","pause-save-note","load-fill","load-text","loading","menu","creator","breed-chips","fur-swatches","eye-swatches","class-cards","class-blurb","cat-name","preview","dialogue","dlg-avatar","dlg-name","dlg-text","dlg-options"];for(const e of t)this.refs[this.camel(e)]=_e(e)}camel(t){return t.replace(/-([a-z])/g,(e,n)=>n.toUpperCase())}icons(){document.querySelectorAll("[data-ico]").forEach(t=>{t.innerHTML=oi(t.dataset.ico)}),this.refs.weaponIco&&(this.refs.weaponIco.innerHTML=oi("sword"))}buildCreator(){const t=this.game,e=this.refs.breedChips;if(e){e.innerHTML="";for(const a of or){const o=Ee("button","chip",a.name.split(" ")[0]);o.dataset.breed=a.id,o.title=a.blurb,o.addEventListener("click",()=>{t.creator.breed=a.id,this.syncCreator(),t.audio.playUIClick()}),e.appendChild(o)}}const n=this.refs.furSwatches;if(n){n.innerHTML="";for(const a of Bi){const o=Ee("button","swatch");o.style.background=`radial-gradient(circle at 38% 32%, ${a.hi}, ${a.base} 60%, ${a.dark})`,o.dataset.fur=a.id,o.title=a.name,o.addEventListener("click",()=>{t.creator.fur=a.id,this.syncCreator(),t.audio.playUIClick()}),n.appendChild(o)}}const i=this.refs.eyeSwatches;if(i){i.innerHTML="";for(const a of Oi){const o=Ee("button","swatch eye");o.style.background=`radial-gradient(circle at 38% 32%, #fff, ${a.color} 55%, #1a1712)`,o.dataset.eye=a.id,o.title=a.name,o.addEventListener("click",()=>{t.creator.eye=a.id,this.syncCreator(),t.audio.playUIClick()}),i.appendChild(o)}}const r=this.refs.classCards;if(r){r.innerHTML="";for(const a in Ui){const o=Ui[a],l=Ee("button","class-card",`<b>${o.name}</b><span>${o.blurb}</span>`);l.dataset.cls=a,l.addEventListener("click",()=>{t.creator.cls=a,this.syncCreator(),t.audio.playUIConfirm()}),r.appendChild(l)}}this.syncCreator()}syncCreator(){const t=this.game.creator;document.querySelectorAll("#breed-chips .chip").forEach(e=>e.classList.toggle("active",e.dataset.breed===t.breed)),document.querySelectorAll("#fur-swatches .swatch").forEach(e=>e.classList.toggle("active",e.dataset.fur===t.fur)),document.querySelectorAll("#eye-swatches .swatch").forEach(e=>e.classList.toggle("active",e.dataset.eye===t.eye)),document.querySelectorAll("#class-cards .class-card").forEach(e=>e.classList.toggle("active",e.dataset.cls===t.cls)),this.refs.classBlurb&&(this.refs.classBlurb.textContent=Ui[t.cls]?.blurb||""),this.game.preview?.refresh(t)}readCreator(){const t=(this.refs.catName?.value||"Moth").trim().slice(0,18)||"Moth";return{...this.game.creator,name:t}}buildCompass(){const t=this.refs.compassStrip;if(!t)return;t.innerHTML="",this.compassItems=[];const e=[["N",0],["NE",Math.PI/4],["E",Math.PI/2],["SE",Math.PI*3/4],["S",Math.PI],["SW",-Math.PI*3/4],["W",-Math.PI/2],["NW",-Math.PI/4]];for(const[i,r]of e){const a=Ee("span","card",i);a.dataset.bearing=r,t.appendChild(a),this.compassItems.push({e:a,bearing:r})}for(let i=0;i<24;i++){const r=i/24*Math.PI*2,a=Ee("span","tick");a.dataset.bearing=r,t.appendChild(a),this.compassItems.push({e:a,bearing:r})}const n=Ee("div","qmark");t.appendChild(n),this.questMark=n}updateCompass(){const t=this.game.player;if(!t||!this.compassItems)return;this.compassT-=1;const e=t.camYaw,n=Math.atan2(Math.sin(e),-Math.cos(e)),i=92,r=(this.refs.compassStrip.parentElement?.clientWidth||360)/2;for(const l of this.compassItems){let c=l.bearing-n;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;if(Math.abs(c)>1.7){l.e.style.display="none";continue}l.e.style.display="",l.e.style.left=`calc(50% + ${c*i}px)`}const a=this.game.quests?.trackedInfo();let o=null;if(a?.marker&&(o=a.marker),this.game.compassTarget&&(o=this.game.compassTarget),o&&this.questMark){let c=Math.atan2(o.x-t.position.x,-(o.z-t.position.z))-n;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;if(Math.abs(c)<1.6)this.questMark.style.display="",this.questMark.style.left=`calc(50% + ${c*i}px)`;else{this.questMark.style.display="none";const h=c>0?1:-1;this.questMark.style.display="",this.questMark.style.left=`calc(50% + ${h*r*.92}px)`,this.questMark.style.opacity="0.45"}Math.abs(c)<1.6&&(this.questMark.style.opacity="1")}else this.questMark&&(this.questMark.style.display="none")}wire(){const t=this.game;document.querySelectorAll("[data-close]").forEach(e=>{e.addEventListener("click",()=>this.closePanel(e.dataset.close))}),document.querySelectorAll(".hud-btn").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.action;n==="inventory"?this.togglePanel("inventory"):n==="quests"?this.togglePanel("quests"):n==="map"?this.togglePanel("map"):n==="skills"&&this.togglePanel("skills")})}),document.querySelectorAll("#hotbar .slot").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.spell;n&&t.player?.castSpell(n)})}),_e("btn-potion")?.addEventListener("click",()=>t.usePotion?.()),document.querySelectorAll(".tabs button").forEach(e=>{e.addEventListener("click",()=>{this.invFilter=e.dataset.filter,document.querySelectorAll(".tabs button").forEach(n=>n.classList.toggle("active",n===e)),this.refreshInventory()})}),document.querySelectorAll(".equip-slot").forEach(e=>{e.addEventListener("click",()=>{const n=t.inventory.equipment[e.dataset.slot];n&&(t.inventory.equip(n),this.refreshInventory())})}),_e("btn-resume")?.addEventListener("click",()=>t.togglePause(!1)),_e("btn-save")?.addEventListener("click",()=>{t.save(),this.setSaveNote("Saved. The snow remembers.")}),_e("btn-pause-settings")?.addEventListener("click",()=>this.refs.settingsBox?.classList.toggle("hidden")),_e("btn-help")?.addEventListener("click",()=>{this.closePanel("pause"),this.openPanel("help")}),_e("btn-quit")?.addEventListener("click",()=>t.quitToMenu()),_e("btn-respawn")?.addEventListener("click",()=>t.respawn()),_e("btn-victory-continue")?.addEventListener("click",()=>t.victoryContinue()),_e("set-music")?.addEventListener("input",e=>{t.audio.setMusicVolume(+e.target.value),t.settings.music=+e.target.value}),_e("set-sfx")?.addEventListener("input",e=>{t.audio.setSfxVolume(+e.target.value),t.settings.sfx=+e.target.value}),_e("set-quality")?.addEventListener("change",e=>t.setQuality(e.target.value)),_e("set-snow")?.addEventListener("change",e=>{t.settings.snow=e.target.value}),_e("set-motion")?.addEventListener("change",e=>{t.settings.reduceMotion=e.target.checked,document.body.classList.toggle("reduce-motion",e.target.checked)}),_e("btn-continue")?.addEventListener("click",()=>t.continueGame()),_e("btn-new")?.addEventListener("click",()=>t.showCreator()),_e("btn-how")?.addEventListener("click",()=>{this.refs.menu?.classList.remove("show"),this.openPanel("help")}),_e("btn-settings")?.addEventListener("click",()=>{this.refs.menu?.classList.remove("show"),this.openPanel("pause"),this.refs.settingsBox?.classList.remove("hidden"),this.refs.pause?.classList.add("show")}),_e("btn-back-menu")?.addEventListener("click",()=>t.backToMenu()),_e("btn-begin")?.addEventListener("click",()=>t.beginGame()),_e("dlg-close")?.addEventListener("click",()=>t.dialogue?.close()),window.addEventListener("resize",()=>{this.panel==="map"&&this.drawMap()})}setLoading(t,e){this.refs.loadFill&&(this.refs.loadFill.style.width=`${Qe(t,0,100)}%`),e&&this.refs.loadText&&(this.refs.loadText.textContent=e)}hideLoading(){const t=this.refs.loading;t&&(t.classList.add("fade"),setTimeout(()=>t.classList.remove("show"),750))}showHUD(t){this.refs.hud?.classList.toggle("show",t)}showMenu(t){this.refs.menu?.classList.toggle("show",t)}showCreator(t){this.refs.creator?.classList.toggle("show",t)}setSaveNote(t){this.refs.pauseSaveNote&&(this.refs.pauseSaveNote.textContent=t)}toast(t,e=""){const n=Ee("div","toast "+e,t);for(this.refs.toasts?.appendChild(n),this.toastCount++;this.refs.toasts&&this.refs.toasts.children.length>5;)this.refs.toasts.firstChild.remove();setTimeout(()=>{n.classList.add("out"),setTimeout(()=>n.remove(),400)},3400)}showArea(t,e="",n="Now entering"){const i=this.refs.areaBanner;i&&(this.refs.areaName&&(this.refs.areaName.textContent=t),this.refs.areaSub&&(this.refs.areaSub.textContent=e),this.refs.areaEyebrow&&(this.refs.areaEyebrow.textContent=n),i.classList.remove("hidden"),i.style.animation="none",i.offsetWidth,i.style.animation="",clearTimeout(this.areaTimer),this.areaTimer=setTimeout(()=>i.classList.add("hidden"),4400))}subtitle(t,e=4){const n=this.refs.subtitle;n&&(n.innerHTML=t,n.classList.remove("hidden"),clearTimeout(this.subTimer),this.subTimer=setTimeout(()=>n.classList.add("hidden"),e*1e3))}showInteract(t){const e=this.refs.interactPrompt;e&&(this.refs.interactText.textContent=t,e.classList.remove("hidden"))}hideInteract(){this.refs.interactPrompt?.classList.add("hidden")}setAiming(t){this.refs.crosshair?.classList.toggle("hidden",!t)}hurtFlash(){const t=this.refs.vignette||document.getElementById("vignette");t&&(t.style.transition="none",t.style.background="radial-gradient(ellipse at 50% 45%, rgba(180,40,30,.28) 20%, rgba(80,10,8,.55) 100%)",requestAnimationFrame(()=>{t.style.transition="background .5s",setTimeout(()=>{t.style.background=""},60)}))}hideDeath(){this.refs.death?.classList.remove("show")}showDeath(t){this.refs.deathLine&&(this.refs.deathLine.textContent=t||"A cat always lands on their feet. Eventually."),this.refs.death?.classList.add("show")}showVictory(t){this.refs.victoryStats&&(this.refs.victoryStats.innerHTML=Object.entries(t).map(([e,n])=>`<div><b>${n}</b>${e}</div>`).join("")),this.refs.victory?.classList.add("show")}hideVictory(){this.refs.victory?.classList.remove("show")}setPhoto(t){this.photo=t,this.refs.hud?.classList.toggle("photo",t),this.refs.photoBadge?.classList.toggle("hidden",!t)}toggleHUD(){this.hudHidden=!this.hudHidden,this.refs.hud?.classList.toggle("hidden",this.hudHidden)}openPanel(t){this.panel&&this.panel!==t&&this.closePanel(this.panel,!0);const e={inventory:"inventory",skills:"skills",quests:"quests",map:"map",shop:"shop",pause:"pause",help:"help"},n=this.refs[e[t]];n&&(this.panel=t,n.classList.add("show"),this.game.mode=t==="pause"||t==="help"?"paused":"panel",t==="inventory"&&this.refreshInventory(),t==="skills"&&this.refreshSkills(),t==="quests"&&this.refreshQuests(),t==="map"&&(this.drawMap(),this.refreshMapSide()),t==="shop"&&this.refreshShop(),t==="pause"&&this.setSaveNote("Autosaves when you enter a hold or shrine."),this.game.input?.clear?.())}closePanel(t,e=!1){const n={inventory:"inventory",skills:"skills",quests:"quests",map:"map",shop:"shop",pause:"pause",help:"help"};this.refs[n[t||this.panel]]?.classList.remove("show"),e?t===this.panel&&(this.panel=null):(this.panel=null,this.game.mode="play",this.game.shopNpc=null,this.game.input?.clear?.(),t==="pause"&&this.refs.settingsBox?.classList.add("hidden"))}togglePanel(t){this.panel===t?this.closePanel(t):this.openPanel(t)}updateHUD(){const t=this.game,e=t.player;if(!e||!this.refs.hud)return;const n=this.refs,i=(a,o,l)=>{a&&(a.style.transform=`scaleX(${Qe(o/Math.max(1,l),0,1)})`)};i(n.barHealth,e.health,e.maxHealth),i(n.barStamina,e.stamina,e.maxStamina),i(n.barMana,e.mana,e.maxMana),n.txtHealth&&(n.txtHealth.textContent=ps(e.health)),n.txtStamina&&(n.txtStamina.textContent=ps(e.stamina)),n.txtMana&&(n.txtMana.textContent=ps(e.mana)),n.barXp&&(n.barXp.style.width=`${Qe(e.xp/e.xpNext,0,1)*100}%`),n.txtXp&&(n.txtXp.textContent=`${Math.floor(e.xp)} / ${e.xpNext}`),n.hudLevel&&(n.hudLevel.textContent=e.level),n.hudName&&(n.hudName.textContent=e.name),n.hudClass&&(n.hudClass.textContent=Ui[e.cls]?.name||"Wayfarer"),n.hudGold&&(n.hudGold.textContent=t.inventory.gold),n.hudTime&&(n.hudTime.textContent=fx(t.time.hours)),n.hudWeather&&(n.hudWeather.textContent=t.weather?.label||"Snow"),n.location&&(n.location.textContent=t.currentArea?.name||"Catterfall");const r=t.inventory.statSummary();if(n.weaponName&&(n.weaponName.textContent=r.weaponName),n.weaponStat){const a=t.player.weapon;n.weaponStat.textContent=`${a?.dmg||4} damage · ${a?.unarmed?"Claws":a?.type==="bow"?"Bow":"Blade"}`}if(n.weaponIco){const a=t.player.weapon?.icon||"claws";n.weaponIco.dataset.last!==a&&(n.weaponIco.dataset.last=a,n.weaponIco.innerHTML=oi(a))}if(n.potionCount){const a=(t.inventory.count("healthPotion")||0)+(t.inventory.count("stew")||0)+(t.inventory.count("cheese")||0)+(t.inventory.count("bread")||0);n.potionCount.textContent=a}document.querySelectorAll("#hotbar .slot").forEach(a=>{const o=a.dataset.spell,l=ou[o];if(!l)return;const c=t.player.spellCd[o]||0,h=a.querySelector(".cd");h&&(h.style.transform=`scaleY(${Qe(c/l.cooldown,0,1)})`),a.classList.toggle("empty",t.player.mana<l.cost)}),this.updateQuestTracker(),this.updateCompass(),this.updateEnemyFrame(),t.enemyTarget&&t.enemyTarget.alive?this.updateEnemyBar(t.enemyTarget):this.refs.enemyFrame?.classList.add("hidden")}updateQuestTracker(){const t=this.game.quests?.trackedInfo(),e=this.refs.questTracker;if(e){if(!t){e.classList.add("hidden");return}if(e.classList.remove("hidden"),this.refs.qtType&&(this.refs.qtType.textContent=t.type==="main"?"MAIN":"SIDE"),this.refs.qtTitle&&(this.refs.qtTitle.textContent=t.title),this.refs.qtObj&&(this.refs.qtObj.textContent=t.text),this.refs.qtDist)if(t.marker){const n=this.game.player.position,i=Math.hypot(t.marker.x-n.x,t.marker.z-n.z);this.refs.qtDist.textContent=`${t.marker.name||""} · ${Math.round(i)}m`}else this.refs.qtDist.textContent=""}}updateEnemyFrame(){const t=this.game.enemyTarget;!t||!t.alive?this.refs.enemyFrame?.classList.add("hidden"):this.updateEnemyBar(t)}updateEnemyBar(t){this.refs.enemyFrame&&(this.refs.enemyFrame.classList.remove("hidden"),this.refs.enemyName&&(this.refs.enemyName.textContent=t.name),this.refs.enemyHp&&(this.refs.enemyHp.style.width=`${Qe(t.hp/t.maxHp,0,1)*100}%`))}damageNumber(t,e,n=""){if(!this.floatLayer)return;const i=t.clone().project(this.game.camera);if(i.z>1)return;const r=(i.x*.5+.5)*window.innerWidth,a=(-i.y*.5+.5)*window.innerHeight,o=Ee("div","dmg "+n,(n==="heal"?"+":"")+e);o.style.left=`${r+(Math.random()-.5)*22}px`,o.style.top=`${a}px`,this.floatLayer.appendChild(o),setTimeout(()=>o.remove(),1e3)}refreshInventory(){const t=this.game,e=t.inventory;if(!e)return;this.refs.invGold&&(this.refs.invGold.textContent=e.gold),this.refs.invWeight&&(this.refs.invWeight.textContent=e.weight());const n={weapon:this.refs.eqWeapon,armor:this.refs.eqArmor,trinket:this.refs.eqTrinket,bow:this.refs.eqBow};for(const l in n){const c=n[l];if(!c)continue;const h=e.equipment[l],u=he[h];c.innerHTML=u?`${oi(u.icon)}<b>${u.name}</b>`:'<span class="empty">Empty</span>',c.style.color=u?"#d8b16a":""}const i=e.statSummary();this.refs.statsCard&&(this.refs.statsCard.innerHTML=[["Damage",i.damage||4],["Armor",i.armor],["Spell power",i.magic],["Bow",i.bow||0],["Attack speed",i.weaponSpeed.toFixed(2)+"×"],["Health",`${ps(t.player.health)} / ${t.player.maxHealth}`],["Mana",`${ps(t.player.mana)} / ${t.player.maxMana}`],["Stamina",`${ps(t.player.stamina)} / ${t.player.maxStamina}`]].map(([l,c])=>`<div class="stat-row"><span>${l}</span><b>${c}</b></div>`).join(""));const r=this.refs.invGrid;if(!r)return;r.innerHTML="";const a=[...e.slots.entries()].filter(([l])=>{const c=he[l];return c?this.invFilter==="all"?!0:this.invFilter==="potion"?c.type==="potion"||c.type==="food":this.invFilter==="quest"?c.type==="quest"||c.rarity==="quest":c.type===this.invFilter:!1});if(!a.length){r.appendChild(Ee("div","inv-empty","Nothing here. A very tidy, very suspicious bag."));return}const o={weapon:0,armor:1,bow:2,trinket:3,potion:4,food:5,quest:6};a.sort((l,c)=>(o[he[l[0]]?.type]??9)-(o[he[c[0]]?.type]??9));for(const[l,c]of a){const h=he[l];if(!h)continue;const u=Object.values(e.equipment).includes(l),d=Ee("div","inv-cell"+(u?" equipped":"")+(h.rarity==="rare"?" rare":h.rarity==="epic"?" epic":h.rarity==="quest"?" quest":""));d.innerHTML=`<span class="rarity"></span>${c>1?`<span class="qty">${c}</span>`:""}<span class="item-ico">${oi(h.icon)}</span><span class="item-name">${h.name}</span>`,d.title=`${h.name}
${h.desc}`,d.addEventListener("click",p=>{if(p.shiftKey){e.remove(l,1)&&this.toast(`Dropped ${h.name}. It is someone else’s problem now.`),this.refreshInventory();return}["weapon","armor","trinket","bow"].includes(h.type)?e.equip(l):h.type==="potion"||h.type==="food"?(e.use(l),this.updateHUD()):this.toast(`<b>${h.name}</b><br>${h.desc}`,h.rarity==="quest"?"quest":""),this.refreshInventory()}),r.appendChild(d)}}refreshSkills(){const e=this.game.player;if(!e||!this.refs.skillBody)return;this.refs.skillPoints&&(this.refs.skillPoints.textContent=e.skillPoints);const n={};for(const r of pl)(n[r.tree]||=[]).push(r);const i={Hunter:"Teeth, arrows, and the confidence to use them.",Spell:"The Hearth-Spark and the Moonwell answer those who ask politely.",Way:"Snowstride, fortune, and the ancient art of knocking things off ledges."};this.refs.skillBody.innerHTML="";for(const r in n){const a=Ee("div","skill-tree");a.appendChild(Ee("h3","",r)),a.appendChild(Ee("p","",i[r]||""));for(const o of n[r]){const l=e.skills[o.id]||0,c=l>=o.max,h=Ee("button","skill-node"+(c?" maxed":"")+(e.skillPoints<=0?" locked":"")),u=Array.from({length:o.max},(d,p)=>`<i class="${p<l?"on":""}"></i>`).join("");h.innerHTML=`<span class="sn-ico">${oi(o.icon)}</span><span class="sn-txt"><b>${o.name}</b><span>${o.desc}</span><span class="pips">${u}</span></span>${c?'<span class="cost">MAX</span>':'<span class="cost">+1</span>'}`,h.addEventListener("click",()=>{e.spendSkill(o.id)?this.refreshSkills():e.skillPoints<=0&&this.toast("No skill points. Level up, little hunter.","bad")}),a.appendChild(h)}this.refs.skillBody.appendChild(a)}}refreshQuests(){const t=this.game,e=this.refs.questList;if(!e)return;e.innerHTML="";const n=[...t.quests.states.values()].filter(a=>!a.complete),i=[...t.quests.states.values()].filter(a=>a.complete),r=[...n,...i];if(!r.length){e.appendChild(Ee("div","empty-note","No quests yet. Talk to someone. Anyone. They all have opinions.")),this.refs.questDetail.innerHTML='<div class="empty-note">Your ledger is empty.</div>';return}(!this.questSelected||!r.find(a=>a.id===this.questSelected))&&(this.questSelected=r[0].id);for(const a of r){const o=He[a.id];if(!o)continue;const l=Ee("button","quest-item"+(a.complete?" done":"")+(this.questSelected===a.id?" active":""));l.innerHTML=`<span class="qtype">${o.type==="main"?"Main quest":"Side quest"}${a.complete?" · complete":""}</span><b>${o.title}</b><span>${a.complete?"Done. Mostly.":o.stages[a.stage]?.text||""}</span>`,l.addEventListener("click",()=>{this.questSelected=a.id,this.refreshQuests()}),e.appendChild(l)}this.renderQuestDetail(this.questSelected)}renderQuestDetail(t){const e=this.game,n=e.quests.get(t),i=He[t],r=this.refs.questDetail;if(!r)return;if(!i||!n){r.innerHTML='<div class="empty-note">Select a quest.</div>';return}const a=i.stages.map((l,c)=>{let h=c<n.stage||n.complete,u=l.text;return c===n.stage&&!n.complete&&(l.count||1)>1&&(u=u.replace(/\(\d+\/\d+\)/,`(${n.progress}/${l.count})`)),`<li class="${h?"done":""}">${u}</li>`}).join(""),o=i.reward||{};r.innerHTML=`
      <h3>${i.title}</h3>
      <div class="qmeta">${i.type==="main"?"Main quest":"Side quest"} · ${n.complete?"Complete":"Active"}</div>
      <p>${i.desc}</p>
      <ul class="quest-obj-list">${a}</ul>
      <div class="quest-reward">Reward: ${o.xp||0} XP · ${o.gold||0} gold${o.items?.length?" · "+o.items.map(l=>he[l]?.name||l).join(", "):""}</div>
      <div style="margin-top:16px;display:flex;gap:8px">
        <button class="btn gold small" id="btn-track-quest">${e.quests.tracked===t?"Tracked":"Track this quest"}</button>
      </div>`,_e("btn-track-quest")?.addEventListener("click",()=>{e.quests.tracked=t,e.compassTarget=null,this.refreshQuests(),this.updateQuestTracker(),this.toast(`Tracking <b>${i.title}</b>`)})}refreshMapSide(){const t=this.game,e=this.refs.mapMarkers;if(!e)return;e.innerHTML="";const n=t.currentArea?.name||"Catterfall";this.refs.mapLoc&&(this.refs.mapLoc.textContent=n),this.refs.mapDesc&&(this.refs.mapDesc.textContent=t.currentArea?.sub||"Snow, stone, and the occasional deeply rude goat.");const i=[];for(const r of t.quests.states.values()){if(r.complete)continue;const a=t.quests.markerPosition(r.id),o=He[r.id];a&&o&&i.push({...a,kind:o.type,title:o.title,id:r.id})}for(const r in Sn){const a=Sn[r];a.radius<30||i.find(o=>Math.hypot(o.x-a.x,o.z-a.z)<8)||i.push({x:a.x,z:a.z,name:a.name,title:a.name,kind:"town",id:r})}for(const r of i){const a=Ee("button","map-marker",`<b>${r.title||r.name}</b><span>${r.kind==="main"?"Main quest":r.kind==="side"?"Side quest":"Landmark"}</span>`);a.addEventListener("click",()=>{t.compassTarget={x:r.x,z:r.z,name:r.title||r.name},this.toast(`Compass set: <b>${r.title||r.name}</b>`)}),e.appendChild(a)}this.mapMarkers=i}drawMap(){const t=this.game,e=this.refs.mapCanvas;if(!e)return;const n=e.getBoundingClientRect(),i=Math.min(2,window.devicePixelRatio||1),r=Math.max(320,n.width),a=Math.max(260,n.height);e.width=r*i,e.height=a*i;const o=e.getContext("2d");o.setTransform(i,0,0,i,0,0);const c=Math.min(r,a)-22*2,h=(r-c)/2,u=(a-c)/2,d=(f,_)=>[h+(f+700)/1400*c,u+(_+700)/1400*c],p=o.createRadialGradient(r/2,a/2,20,r/2,a/2,c*.75);p.addColorStop(0,"#152b34"),p.addColorStop(.6,"#0d1c24"),p.addColorStop(1,"#070f14"),o.fillStyle=p,o.fillRect(0,0,r,a),o.strokeStyle="rgba(216,177,106,.08)",o.lineWidth=1;for(let f=1;f<8;f++){const _=h+f/8*c;o.beginPath(),o.moveTo(_,u),o.lineTo(_,u+c),o.stroke();const y=u+f/8*c;o.beginPath(),o.moveTo(h,y),o.lineTo(h+c,y),o.stroke()}o.strokeStyle="rgba(216,177,106,.35)",o.strokeRect(h-1,u-1,c+2,c+2),o.strokeStyle="rgba(100,199,201,.4)",o.lineWidth=3.2,o.beginPath();for(let f=-700;f<=700;f+=10){const _=110*Math.sin(f*.0075)+45*Math.sin(f*.019+1.7),[y,v]=d(_,f);f===-700?o.moveTo(y,v):o.lineTo(y,v)}o.stroke();const[g,x]=d(-300,300);if(o.fillStyle="rgba(80,150,170,.3)",o.beginPath(),o.ellipse(g,x,c*.075,c*.06,0,0,Math.PI*2),o.fill(),t.world?.roadPoints?.length){o.strokeStyle="rgba(190,170,130,.28)",o.lineWidth=1.6,o.beginPath();let f=null;for(const _ of t.world.roadPoints){const[y,v]=d(_.x,_.z);!f||Math.hypot(y-f[0],v-f[1])>c*.25?o.moveTo(y,v):o.lineTo(y,v),f=[y,v]}o.stroke()}o.fillStyle="rgba(210,225,232,.10)";for(let f=0;f<60;f++){const _=f/60*Math.PI*2,y=.78+f%3*.04,[v,E]=d(Math.cos(_)*700*y,Math.sin(_)*700*y);o.beginPath(),o.arc(v,E,4+f%4*2,0,Math.PI*2),o.fill()}for(const f in Sn){const _=Sn[f];if(_.radius<30)continue;const[y,v]=d(_.x,_.z);o.fillStyle="#c8a06b",o.beginPath(),o.arc(y,v,3.4,0,Math.PI*2),o.fill(),o.strokeStyle="rgba(200,160,107,.35)",o.beginPath(),o.arc(y,v,7,0,Math.PI*2),o.stroke(),o.fillStyle="rgba(220,234,240,.7)",o.font='9px "Alegreya Sans", sans-serif',o.textAlign="center",o.fillText(_.name.toUpperCase(),y,v-10)}for(const f of t.quests.states.values()){if(f.complete)continue;const _=t.quests.markerPosition(f.id);if(!_)continue;const y=He[f.id],[v,E]=d(_.x,_.z);o.save(),o.translate(v,E),o.rotate(Math.PI/4),o.fillStyle=y.type==="main"?"#f6e2ac":"#7fb5c8",o.shadowColor=y.type==="main"?"#d8b16a":"#7fb5c8",o.shadowBlur=8,o.fillRect(-4,-4,8,8),o.restore()}const m=t.player;if(m){const[f,_]=d(m.position.x,m.position.z);o.save(),o.translate(f,_),o.rotate(-m.camYaw+Math.PI),o.fillStyle="#ffffff",o.beginPath(),o.moveTo(0,-7),o.lineTo(5,6),o.lineTo(0,3),o.lineTo(-5,6),o.closePath(),o.fill(),o.restore(),o.strokeStyle="rgba(255,255,255,.4)",o.beginPath(),o.arc(f,_,10,0,Math.PI*2),o.stroke()}o.fillStyle="rgba(216,177,106,.55)",o.font="700 11px Cinzel, serif",o.textAlign="center",o.fillText("N",r-28,24),o.strokeStyle="rgba(216,177,106,.35)",o.beginPath(),o.moveTo(r-28,30),o.lineTo(r-28,48),o.stroke()}showShop(t){this.shopNpc=t,this.openPanel("shop"),this.refreshShop()}refreshShop(){const t=this.game,e=this.shopNpc||t.shopNpc;if(!e||!e.merchant)return;const n=t.inventory;this.refs.shopName&&(this.refs.shopName.textContent=e.name),this.refs.shopEyebrow&&(this.refs.shopEyebrow.textContent=e.role||"Merchant"),this.refs.shopGold&&(this.refs.shopGold.textContent=n.gold),this.refs.shopLine&&(this.refs.shopLine.textContent=`“${e.merchant.line}”`);const i=this.refs.shopBuy;if(i){i.innerHTML="";for(const a of e.merchant.stock){const o=he[a];if(!o)continue;const l=Math.max(1,Math.round(o.value*1.35)),c=Ee("button","shop-row",`<span class="item-ico">${oi(o.icon)}</span><span class="sr-txt"><b>${o.name}</b><span>${o.desc.slice(0,58)}${o.desc.length>58?"…":""}</span></span><span class="price">${l}</span>`);c.addEventListener("click",()=>{if(n.gold<l){this.toast("Not enough gold. Try looking more pitiful.","bad"),t.audio.playFail();return}n.gold-=l,n.add(a,1,!0),t.audio.playPickup(),this.toast(`Bought <b>${o.name}</b>`,"good"),this.refreshShop(),this.refreshInventory(),this.updateHUD()}),i.appendChild(c)}}const r=this.refs.shopSell;if(r){r.innerHTML="";const a=[...n.slots.entries()].filter(([o])=>he[o]&&he[o].type!=="quest"&&he[o].rarity!=="quest");a.length||r.appendChild(Ee("div","empty-note","Nothing to sell. You are travelling light, and also broke."));for(const[o,l]of a){const c=he[o],h=Math.max(1,Math.round(c.value*.5)),u=Ee("button","shop-row",`<span class="item-ico">${oi(c.icon)}</span><span class="sr-txt"><b>${c.name}${l>1?` ×${l}`:""}</b><span>Sells for ${h} gold</span></span><span class="price">${h}</span>`);u.addEventListener("click",()=>{n.remove(o,1)&&(n.gold+=h,t.audio.playPickup(),this.toast(`Sold <b>${c.name}</b> for ${h} gold`,"good"),this.refreshShop(),this.refreshInventory(),this.updateHUD())}),r.appendChild(u)}}}update(t){const e=this.game;if(e.player&&(this.updateHUD(),e.mode==="play")){const n=e.player;n.interactTarget||n.nearNPC}}}const vu="catterfall.save.v1",yu="catterfall.settings.v1",be=s=>document.getElementById(s),Ys=()=>new Promise(s=>requestAnimationFrame(()=>s())),vo={music:.55,sfx:.8,quality:"medium",snow:"medium",reduceMotion:!1};function mv(){try{const s=localStorage.getItem(yu);return s?{...vo,...JSON.parse(s)}:{...vo}}catch{return{...vo}}}const _s=be("game"),ln=new ru({canvas:_s,antialias:!0,powerPreference:"high-performance"});ln.setPixelRatio(Math.min(2,window.devicePixelRatio||1));ln.setSize(window.innerWidth,window.innerHeight);ln.outputColorSpace=Ke;ln.toneMapping=yl;ln.toneMappingExposure=1.06;ln.shadowMap.enabled=!0;ln.shadowMap.type=Mh;ln.setClearColor(462098,1);const Jn=new Vh;Jn.background=new Mt("#0a141c");const Qn=new Je(58,window.innerWidth/window.innerHeight,.1,1800);Qn.position.set(210,42,360);Qn.lookAt(175,8,306);const A={scene:Jn,camera:Qn,renderer:ln,mode:"loading",creator:{breed:"tabby",fur:"ember",eye:"amber",cls:"wayfarer",name:"Moth"},settings:mv(),time:{hours:9.2,day:1},weather:{type:"snow",label:"Snow",intensity:1},companions:[],enemyTarget:null,compassTarget:null,currentArea:{name:"Catterfall",sub:"The kingdom beneath the snow"},shopNpc:null,respawnPoint:null,indoor:!1,fishT:0,weatherTimer:130,isTouch:"ontouchstart"in window||(navigator.maxTouchPoints||0)>0};window.CATTERFALL=A;const Re=new fv;A.audio=Re;const tt=new pv(A);A.ui=tt;tt.setLoading(7,"Reading the omens…");class gv{constructor(t){this.game=t,this.canvas=be("preview"),this.renderer=new ru({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),this.renderer.outputColorSpace=Ke,this.renderer.toneMapping=yl,this.renderer.toneMappingExposure=1.15,this.renderer.setClearColor(0,0),this.scene=new Vh,this.camera=new Je(31,1,.1,30),this.camera.position.set(0,1.5,4.5),this.camera.lookAt(0,1.05,0),this.scene.add(new Bl(13625589,2761760,1.5));const e=new va(16769972,2.6);e.position.set(3.4,5.5,4.2),this.scene.add(e);const n=new va(8377564,2.1);n.position.set(-4,2.6,-3),this.scene.add(n);const i=new ze(16758898,5,9,2);i.position.set(-1.4,1.2,2.2),this.scene.add(i);const r=new pt(new tn(1.18,1.32,.16,40),new Ot({color:1714736,roughness:.6,metalness:.25}));r.position.y=-.09,this.scene.add(r);const a=new pt(new ur(1.2,.018,6,64),new Me({color:14201194,transparent:!0,opacity:.55}));a.rotation.x=Math.PI/2,a.position.y=.012,this.scene.add(a),this.root=new Kt,this.scene.add(this.root),this.cat=null,this.t=0,this.lastW=0,this.lastH=0,this.refresh(t.creator)}resize(){const t=this.canvas.clientWidth||300,e=this.canvas.clientHeight||300;t===this.lastW&&e===this.lastH||(this.lastW=t,this.lastH=e,this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix())}refresh(t){this.cat&&this.root.remove(this.cat.root),this.cat=Ca({breed:t.breed,fur:t.fur,eye:t.eye,scale:1}),this.cat.root.position.y=.02,this.root.add(this.cat.root)}update(t){!this.canvas||this.canvas.clientWidth===0||(this.resize(),this.t+=t,this.cat&&(this.cat.update(t,{speed:0,sitting:!1}),this.root.rotation.y=Math.sin(this.t*.55)*.45,this.cat.root.position.y=.02+Math.sin(this.t*1.2)*.006),this.renderer.render(this.scene,this.camera))}}const Pe={keys:{},block:!1,jumpQueued:!1,clear(){if(this.keys={},this.block=!1,this.jumpQueued=!1,document.pointerLockElement)try{document.exitPointerLock()}catch{}}};A.input=Pe;const gl=["fireball","lightning","heal","ice"];let yo=0;function xv(){const s=document.activeElement;return!!s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"||s.tagName==="SELECT")}function oa(){A.mode==="play"?(A.mode="photo",tt.setPhoto(!0),Pe.clear()):A.mode==="photo"&&(A.mode="play",tt.setPhoto(!1))}window.addEventListener("keydown",s=>{if(xv())return;const t=s.key.toLowerCase();if([" ","tab","arrowup","arrowdown","arrowleft","arrowright"].includes(t)&&s.preventDefault(),t==="escape"){if(A.mode==="dialogue"){A.dialogue?.close();return}if(A.mode==="photo"){oa();return}if(tt.panel){tt.closePanel(tt.panel);return}if(A.mode==="play"||A.mode==="paused"){A.togglePause();return}return}if(A.mode==="photo"&&t==="p"){oa();return}A.mode==="play"&&(Pe.keys[t]=!0,!s.repeat&&(t==="e"?A.player?.interact():t===" "?Pe.jumpQueued=!0:t==="1"||t==="2"||t==="3"||t==="4"?A.player?.castSpell(gl[+t-1]):t==="b"?A.player?.toggleAim():t==="r"?A.usePotion():t==="i"||t==="tab"?tt.togglePanel("inventory"):t==="j"?tt.togglePanel("quests"):t==="m"?tt.togglePanel("map"):t==="k"?tt.togglePanel("skills"):t==="f"?A.petCat():t==="p"?oa():t==="h"?tt.toggleHUD():t==="v"&&tt.toast("You sheathe your weapon. The snow is unimpressed.")))});window.addEventListener("keyup",s=>{const t=s.key.toLowerCase();delete Pe.keys[t]});window.addEventListener("blur",()=>Pe.clear());_s.addEventListener("mousedown",s=>{if(A.mode==="play"){if(s.button===2){Pe.block=!0,s.preventDefault();return}if(s.button===0){if(!A.isTouch&&document.pointerLockElement!==_s){try{_s.requestPointerLock()}catch{}return}A.player?.aiming?A.player.shootBow():A.player?.meleeAttack()}}});window.addEventListener("mouseup",s=>{s.button===2&&(Pe.block=!1)});_s.addEventListener("contextmenu",s=>s.preventDefault());document.addEventListener("mousemove",s=>{if(A.mode!=="play"||document.pointerLockElement!==_s)return;const t=A.player;t&&(t.camYaw+=s.movementX*.0024,t.camPitch=Qe(t.camPitch-s.movementY*.0019,.02,1.08))});document.addEventListener("pointerlockchange",()=>{document.pointerLockElement||(Pe.block=!1)});if(A.isTouch){be("mobile-controls")?.classList.remove("hidden");const s=be("joystick"),t=be("stick");let e=null,n={x:0,y:0};const i=(h,u)=>{const d=Math.hypot(h,u),p=d>1?h/d:h,g=d>1?u/d:u;Pe.keys.w=g<-.28,Pe.keys.s=g>.28,Pe.keys.a=p<-.28,Pe.keys.d=p>.28,t&&(t.style.transform=`translate(${h}px,${u}px)`)},r=()=>{e=null,Pe.keys.w=Pe.keys.s=Pe.keys.a=Pe.keys.d=!1,t&&(t.style.transform="")};s?.addEventListener("pointerdown",h=>{h.preventDefault();const u=s.getBoundingClientRect();n={x:u.left+u.width/2,y:u.top+u.height/2},e=h.pointerId,s.setPointerCapture(h.pointerId)}),s?.addEventListener("pointermove",h=>{if(h.pointerId!==e)return;let u=h.clientX-n.x,d=h.clientY-n.y;const p=Math.hypot(u,d),g=42;p>g&&(u=u/p*g,d=d/p*g),i(u,d)}),s?.addEventListener("pointerup",r),s?.addEventListener("pointercancel",r);const a=be("touch-look");let o=null,l=0,c=0;a?.addEventListener("pointerdown",h=>{h.preventDefault(),o=h.pointerId,l=h.clientX,c=h.clientY,a.setPointerCapture(h.pointerId)}),a?.addEventListener("pointermove",h=>{if(h.pointerId!==o||A.mode!=="play")return;const u=A.player;u&&(u.camYaw+=(h.clientX-l)*.006,u.camPitch=Qe(u.camPitch-(h.clientY-c)*.004,.02,1.08),l=h.clientX,c=h.clientY)}),a?.addEventListener("pointerup",()=>{o=null}),a?.addEventListener("pointercancel",()=>{o=null}),document.querySelectorAll("[data-touch]").forEach(h=>{h.addEventListener("pointerdown",u=>{if(u.preventDefault(),A.mode!=="play")return;const d=h.dataset.touch;d==="attack"?A.player?.aiming?A.player.shootBow():A.player?.meleeAttack():d==="interact"?A.player?.interact():d==="jump"?Pe.jumpQueued=!0:d==="spell"?(yo=(yo+1)%gl.length,A.player?.castSpell(gl[yo])):d==="potion"?A.usePotion():d==="menu"&&A.togglePause()})})}let Lt,Tn,Hi,Mn,ya,lr;async function vv(){try{tt.setLoading(14,"Carving the mountains…"),await Ys(),Lt=new zx(Jn),A.world=Lt,tt.setLoading(52,"Waking the cats…"),await Ys(),A.quests=new gu(A),A.inventory=new xu(A),ya=new dv(A),A.dialogue=ya,A.inventory.equipment={weapon:null,armor:null,trinket:null,bow:null},A.player=new mu(A,{look:{breed:"tabby",fur:"ember",eye:"amber"},cls:"wayfarer",name:"Moth"}),A.player.group.visible=!1,A.inventory.initFromClass(Ui.wayfarer),A.player.refreshGear(),Vl(A.player.cat,be("hud-avatar")),tt.setLoading(68,"Hanging the banners…"),await Ys(),Mn=new uv(A),A.effects=Mn,Tn=new iv(A),A.npcs=Tn,Hi=new hv(A),A.enemies=Hi,lr=new gv(A),A.preview=lr,tt.syncCreator(),yv(),Mv(),A.setQuality(A.settings.quality),ql(A.weather.type,!0),tt.setLoading(88,"Teaching the fish to be smug…"),await Ys(),wv(),Av(),Cv();const s=bu();be("btn-continue")?.classList.toggle("hidden",!s),Mu(),tt.setLoading(100,"The kingdom is awake."),await Ys(),await new Promise(t=>setTimeout(t,420)),tt.hideLoading(),tt.showMenu(!0),tt.showHUD(!1),A.mode="menu",Lt.lastArea=null,A.currentArea=Lt.locationAt(A.player.position.x,A.player.position.z),requestAnimationFrame(la)}catch(s){console.error(s),tt.setLoading(100,"The snow has eaten an error. See the console."),tt.toast("Failed to start: "+(s?.message||s),"bad")}}const xl=3200;let di,gs,kn;function yv(){kn=new Kt,Jn.add(kn),gs=new Float32Array(xl*3);for(let e=0;e<xl;e++)gs[e*3]=(Math.random()-.5)*110,gs[e*3+1]=Math.random()*60,gs[e*3+2]=(Math.random()-.5)*110;const s=new ue;s.setAttribute("position",new we(gs,3));const t=new Ll({color:15398655,size:.24,map:Is(),transparent:!0,opacity:.85,depthWrite:!1,sizeAttenuation:!0,blending:pn});di=new Xh(s,t),di.frustumCulled=!1,kn.add(di),A.weatherGroup=kn}function _v(){const s={low:.35,medium:.65,high:1}[A.settings.snow]||.65,t={low:.55,medium:.8,high:1}[A.settings.quality]||.8;return s*t}function ql(s,t=!1){A.weather.type=s;const e={snow:"Snow",blizzard:"Blizzard",sleet:"Freezing rain",clear:"Clear"}[s]||"Snow";if(A.weather.label=e,!di)return;const n=di.material;if(s==="clear"){kn.visible=!1;return}kn.visible=!A.indoor,s==="sleet"?(n.color.setHex(11130854),n.size=.075,n.opacity=.8,A.weather.speed=27,A.weather.wind=2.4):s==="blizzard"?(n.color.setHex(16055295),n.size=.32,n.opacity=.95,A.weather.speed=11,A.weather.wind=7.5):(n.color.setHex(15398655),n.size=.24,n.opacity=.85,A.weather.speed=3.6,A.weather.wind=.9),n.needsUpdate=!0,!t&&A.mode==="play"&&tt.toast(`The weather turns: <b>${e}</b>.`,"magic")}function bv(s){if(!di)return;if((A.mode==="play"||A.mode==="menu"||A.mode==="dead")&&(A.weatherTimer-=s,A.weatherTimer<=0)){A.weatherTimer=100+Math.random()*100;const a=Math.random(),o=a<.44?"snow":a<.62?"clear":a<.82?"sleet":"blizzard";o!==A.weather.type&&ql(o)}if(A.indoor||A.weather.type==="clear"){kn.visible=!1;return}kn.visible=!0;const t=Qn.position,e=Math.max(220,Math.floor(xl*_v()*(A.weather.type==="blizzard"?1:.72))),n=A.weather.speed||4,i=A.weather.wind||1,r=gs;for(let a=0;a<e;a++){const o=a*3;r[o+1]-=n*s*(.75+a%7*.06),r[o]+=i*s,r[o+2]+=Math.sin((a+performance.now()*2e-4)*.7)*i*s*.3,r[o+1]<t.y-16&&(r[o]=t.x+(Math.random()-.5)*90,r[o+1]=t.y+20+Math.random()*24,r[o+2]=t.z+(Math.random()-.5)*90),r[o]>t.x+55?r[o]-=110:r[o]<t.x-55&&(r[o]+=110),r[o+2]>t.z+55?r[o+2]-=110:r[o+2]<t.z-55&&(r[o+2]+=110)}di.geometry.setDrawRange(0,e),di.geometry.attributes.position.needsUpdate=!0}let _a,ba,Es;function Mv(){_a=new Qh(16767408,0),ba=new Bl(16769208,2365970,0),Es=new ze(16763274,0,22,2),Jn.add(_a,ba,Es)}function wv(){A.setEnemyTarget=s=>{A.enemyTarget=s},A.setIndoor=(s,t)=>{A.indoor=s,_a&&(_a.intensity=s?.55:0),ba&&(ba.intensity=s?.7:0),Es&&(Es.intensity=s?7:0),kn&&(kn.visible=!s&&A.weather.type!=="clear")},A.openShop=s=>{A.shopNpc=s,tt.showShop(s),Re.playUIClick()},A.openChest=s=>{if(!s||s.opened)return;s.opened=!0;const t=[Lt.interactables,Lt.activeInterior?.interactables||[]];for(const i of t){const r=i.find(a=>a.chest===s);r&&(r.used=!0)}const e=[];for(const i of s.items||[])if(i==="gold"){const r=9+Math.floor(Math.random()*17);A.inventory.add("gold",r,!0),e.push(`${r} gold`)}else he[i]&&(A.inventory.add(i,1,!0),e.push(he[i].name));Re.playLoot(),Re.playPickup();const n=new T(s.x,(s.y||0)+1,s.z);Mn.burst(n,16765562,22,3.2,.9,.12),Mn.ring(n,16765562,2.4,.5),tt.toast(`<b>Chest opened</b><br>${e.join(" · ")||"It is empty. Rude."}`,"good"),tt.refreshInventory(),tt.updateHUD(),Pn(!0)},A.fish=()=>{if(A.fishT>0){tt.toast("The fish are still pretending to be stones.","bad");return}A.fishT=3.2,Re.playBow();const s=A.player.position;Math.random()<.78?(A.inventory.add("riverFish",1,!0),Math.random()<.35&&A.inventory.add("fish",1,!0),Re.playPickup(),Mn.burst(s.clone().add(new T(0,1.2,0)),9427455,18,2.4,.8,.1),tt.toast("<b>You catch a fish.</b> It looks personally betrayed.","good")):tt.toast("The fish escapes. It has seen things.","bad"),tt.refreshInventory(),tt.updateHUD()},A.takeRelic=(s,t,e,n)=>{if(A.inventory.has(s))return;A.inventory.add(s,1,!0),e&&(e.visible=!1,e.userData.relicHidden=!0),n&&(n.visible=!1,n.userData.relicHidden=!0);const i=s==="emberRelic"?"relic_ember":"relic_bell",r=Lt.interactables.find(o=>o.id===i);r&&(r.used=!0);const a=A.player.position;Mn.ring(a,s==="emberRelic"?16751429:12576511,5,.9),Mn.burst(a.clone().add(new T(0,1.5,0)),s==="emberRelic"?16751429:12576511,36,4.5,1.1,.16),Re.playQuestComplete(),tt.showArea(t,"Relic of the Nine","Recovered"),tt.toast(`<b>${t}</b> recovered. It hums against your ribs.`,"quest"),tt.refreshInventory(),tt.updateHUD(),Pn(!0)},A.restAtShrine=(s,t,e,n)=>{const i=A.player;i.health=i.maxHealth,i.stamina=i.maxStamina,i.mana=i.maxMana;const r=n??Lt.groundHeight(t,e);A.respawnPoint={x:t,z:e,y:r,name:s},A.time.hours=(A.time.hours+2)%24,Re.bell(),Mn.ring(i.position,9364379,3.6,.9),Mn.burst(i.position.clone().add(new T(0,1.2,0)),9364379,24,2.6,1,.12),tt.showArea(s,"You rest. The snow keeps watch.","Rested"),tt.toast("Health, stamina and mana restored. The shrine remembers you.","good"),tt.updateHUD(),Pn(!0)},A.recruit=s=>Tn.recruit(s),A.onBossDefeated=s=>{s.type==="marrowmaw"?tt.showArea("The Silver Bell","The mine falls quiet","Boss defeated"):s.type==="vaelmaw"&&(Mn.screenFlash("#d8b16a",.3),tt.showArea("Vaelmaw","The Empty Bowl is empty","Boss defeated")),Pn(!0)},A.victory=()=>{if(A.mode==="victory")return;A.mode="victory",Pe.clear();const s=[...A.quests.states.values()].filter(t=>t.complete).length;tt.showVictory({"Quests completed":s,"Level reached":A.player.level,"Gold carried":A.inventory.gold,Companions:A.companions.length}),Re.playQuestComplete(),Pn(!0)},A.victoryContinue=()=>{tt.hideVictory(),A.mode="play",tt.showHUD(!0)},A.onAreaChange=s=>{A.currentArea=s,tt.showArea(s.name,s.sub||"","Now entering"),!s.interior&&A.mode==="play"&&["whiskerhold","highpaw","pawsmouth","shrine","hearthwhisker","frostpelt"].includes(s.id)&&Pn(!0)},A.onPlayerDeath=()=>{if(A.mode==="dead"||A.mode==="menu")return;A.mode="dead",Pe.clear();const s=["A cat always lands on their feet. Eventually.","You have been unravelled. The snow is very sorry.","Nine lives were never enough for this weather.","Somewhere, a fish is laughing. It has earned this."];tt.showDeath(s[Math.floor(Math.random()*s.length)])},A.respawn=()=>{Lt.activeInteriorId&&Lt.exitInterior(A);const s=A.respawnPoint||{x:178,z:346},t=s.y??Lt.groundHeight(s.x,s.z);A.player.reviveAt(s.x,t+.1,s.z),A.player.lastSafe={x:s.x,y:t,z:s.z},Lt.lastArea=null,A.mode="play",tt.hideDeath(),tt.showHUD(!0),Re.unlock(),Pn(!0)},A.usePotion=()=>{A.mode==="play"&&(A.inventory.quickHeal(),tt.updateHUD())},A.togglePause=s=>{A.mode==="play"?tt.openPanel("pause"):A.mode==="paused"&&tt.closePanel("pause")},A.quitToMenu=()=>{Pn(!0),ya?.open&&ya.close(),tt.panel&&tt.closePanel(tt.panel),_u(),A.mode="menu",A.player.group.visible=!1,tt.hideDeath(),tt.hideVictory(),tt.setPhoto(!1),tt.setAiming(!1),tt.showHUD(!1),tt.showCreator(!1),tt.showMenu(!0),be("btn-continue")?.classList.remove("hidden"),Lt.lastArea=null},A.setQuality=s=>{["low","medium","high"].includes(s)||(s="medium"),A.settings.quality=s;const t=s==="low"?1:Math.min(s==="high"?2:1.5,window.devicePixelRatio||1);if(ln.setPixelRatio(t),ln.setSize(window.innerWidth,window.innerHeight),Lt?.sun){Lt.sun.castShadow=s!=="low";const n=s==="high"?2048:s==="low"?512:1024;Lt.sun.shadow.mapSize.x!==n&&(Lt.sun.shadow.map&&(Lt.sun.shadow.map.dispose(),Lt.sun.shadow.map=null),Lt.sun.shadow.mapSize.set(n,n))}Jn.fog&&(Jn.fog.density=s==="low"?.0034:s==="high"?.0022:.0027);const e=be("set-quality");e&&(e.value=s)},A.readNote=s=>{tt.subtitle(s,8),tt.toast(s,"quest")},A.petCat=()=>{const s=Tn.nearestTalkable(A.player.position,3.8);if(!s){tt.toast("There is no cat nearby. Only snow, and judgment.","bad");return}s.cat.playTalk(),Re.meow(1.15),Re.purr(),Mn.burst(s.group.position.clone().add(new T(0,1.8,0)),16752324,10,1.6,.8,.08),tt.toast(`You pet <b>${s.name}</b>. They allow it.`,"good")},A.togglePhoto=oa,A.syncQuestProgress=()=>{for(const s of A.quests.states.values()){if(s.complete)continue;const t=A.quests.currentStage(s);if(t){if(t.event==="recruit"){if(Tn.byId[t.target]?.recruited){A.quests.event("recruit",t.target,1);return}}else if(t.event==="collect"){const e=t.count||1;if(A.inventory.count(t.target)>=e&&s.progress<e){s.progress=e-1,A.quests.event("collect",t.target,1);return}}else if(t.event==="reach"){const e=Sn[t.target],n=e?Math.hypot(A.player.position.x-e.x,A.player.position.z-e.z)<(e.radius||30)*.82:!1;if(Lt.activeInteriorId===t.target||n){A.quests.event("reach",t.target,1);return}}else if(t.event==="kill"){const e=t.count||1,n=Hi.killCounts?.get(t.target)||0;if(n>s.progress){s.progress=Math.min(e,n),s.progress>=e?(s.progress=e-1,A.quests.event("kill",t.target,1)):(tt.updateHUD(),tt.refreshQuests());return}}}}}}function _u(){if(!Lt?.activeInterior)return;Lt.activeInterior.group.visible=!1,Lt.activeInterior=null,Lt.activeInteriorId=null,Lt.outdoorVisible(!0),A.setIndoor(!1,null),Lt.lastArea=null;const s=Lt.returnPosition;if(s&&A.player){const t=Lt.terrain.heightAt(s.x,s.z)+.1;A.player.teleport(s.x,t,s.z,s.yaw||Math.PI)}Lt.returnPosition=null}function yh(s){s&&(s.opened=!1,s.lidPivot&&(s.lidPivot.rotation.x=0),s.glow?.material&&(s.glow.material.opacity=.3))}function Sv(){Lt.chests.forEach(yh),(Lt.outdoorInteractables||[]).forEach(s=>{s.used=!1});for(const s of Lt.interiors.values())(s.chests||[]).forEach(yh),(s.interactables||[]).forEach(t=>{t.used=!1}),s.group.traverse(t=>{t.userData?.relicHidden&&(t.visible=!0,t.userData.relicHidden=!1)});Lt.lastArea=null,Lt.returnPosition=null}function Tv(s,t,e){return A.player&&Jn.remove(A.player.group),A.player=new mu(A,{look:s,cls:t,name:e}),A.player.group.visible=!1,A.player}function _h(s=null){_u(),Sv(),A.companions.length=0,Tn.reset(),Hi.reset(),A.enemyTarget=null,A.compassTarget=null,A.quests=new gu(A),A.inventory=new xu(A);const t=s?.player?.look||{breed:A.creator.breed,fur:A.creator.fur,eye:A.creator.eye},e=s?.player?.cls||A.creator.cls||"wayfarer",n=s?.player?.name||A.creator.name||"Moth";s&&A.inventory.load(s.inventory);const i=Tv(t,e,n);if(s)i.load(s.player),A.quests.load(s.quests),A.respawnPoint=s.respawn||{x:178,z:346,name:"Pawsmouth"},A.time.hours=s.time?.hours??9.2,A.weather={type:s.weather?.type||"snow",label:s.weather?.label||"Snow",intensity:1},ql(A.weather.type,!0),Array.isArray(s.kills)&&(Hi.killCounts=new Map(s.kills)),Tn.loadCompanions(s.companions||[]),Ev(s.chests||[]);else{A.inventory.initFromClass(Ui[e]||Ui.wayfarer),i.refreshGear();const r=Lt.terrain.heightAt(178,346)+.1;i.teleport(178,r,346,Math.PI),i.lastSafe={x:178,y:r,z:346},A.respawnPoint={x:178,y:r,z:346,name:"Pawsmouth"}}i.group.visible=!0,Vl(i.cat,be("hud-avatar")),Tn.setInterior(null),Lt.setTime(A.time.hours),Lt.lastArea=null,A.currentArea=Lt.locationAt(i.position.x,i.position.z),s?A.compassTarget=null:A.compassTarget={x:175,z:322,name:"Elder Whiskerby"},A.mode="play",tt.showCreator(!1),tt.showMenu(!1),tt.showHUD(!0),tt.hideDeath(),tt.hideVictory(),tt.setPhoto(!1),tt.setAiming(!1),tt.refreshInventory(),tt.refreshSkills(),tt.refreshQuests(),tt.updateHUD(),Re.unlock(),s?(tt.showArea(A.currentArea.name,A.currentArea.sub||""),tt.toast("Welcome back, little hunter. The snow kept your place.","good")):(tt.showArea("Pawsmouth","A fishing village with more cats than fish"),tt.subtitle("Elder Whiskerby: “You are late. The snow has been waiting three days for you, and it is not a patient snow.”",7),tt.toast("Speak with <b>Elder Whiskerby</b> by the well. <kbd>E</kbd> to talk.","quest"),Re.meow(.95)),Pn(!0)}function Ev(s){const t=new Set(s||[]);if(!t.size)return;const e=[...Lt.chests,...[...Lt.interiors.values()].flatMap(i=>i.chests||[])];for(const i of e)t.has(i.id)&&(i.opened=!0,i.lidPivot&&(i.lidPivot.rotation.x=1.9),i.glow?.material&&(i.glow.material.opacity=0));const n=[Lt.outdoorInteractables||[],...[...Lt.interiors.values()].map(i=>i.interactables||[])];for(const i of n)for(const r of i)r.chest&&t.has(r.chest.id)&&(r.used=!0)}function bu(){try{const s=localStorage.getItem(vu);if(!s)return null;const t=JSON.parse(s);return!t||!t.player?null:t}catch{return null}}function Pn(s=!1){if(!(!A.player||!A.inventory||!A.quests))try{const t=A.player.save();if(Lt?.activeInteriorId&&Lt.returnPosition){const r=Lt.returnPosition;t.position={x:r.x,y:Lt.terrain.heightAt(r.x,r.z)+.1,z:r.z},t.yaw=r.yaw||Math.PI}const e=[],n=[...Lt.chests,...[...Lt.interiors.values()].flatMap(r=>r.chests||[])];for(const r of n)r.opened&&r.id&&e.push(r.id);const i={version:1,savedAt:Date.now(),player:t,inventory:A.inventory.save(),quests:A.quests.save(),companions:Tn.save(),time:{hours:A.time.hours,day:A.time.day},weather:{type:A.weather.type,label:A.weather.label},respawn:A.respawnPoint,chests:e,kills:[...(Hi.killCounts||new Map).entries()],settings:A.settings};localStorage.setItem(vu,JSON.stringify(i)),localStorage.setItem(yu,JSON.stringify(A.settings)),be("btn-continue")?.classList.remove("hidden"),s||(tt.toast("Game saved. The snow remembers.","good"),tt.setSaveNote("Saved. The snow remembers."),Re.playQuestComplete())}catch(t){console.warn("Save failed",t),s||tt.toast("The save failed. The snow is embarrassed.","bad")}}function Av(){A.save=Pn,A.continueGame=()=>{const s=bu();if(!s){tt.toast("No saved life found. Start a new one.","bad");return}s.settings&&(A.settings={...A.settings,...s.settings}),_h(s),Mu(),A.setQuality(A.settings.quality)},A.beginGame=()=>{A.creator={...A.creator,...tt.readCreator()},_h(null)},A.showCreator=()=>{tt.showMenu(!1),tt.showCreator(!0),A.mode="creator",tt.syncCreator(),lr?.resize()},A.backToMenu=()=>{tt.showCreator(!1),tt.showMenu(!0),A.mode="menu"}}function Cv(){window.addEventListener("resize",()=>{Qn.aspect=window.innerWidth/window.innerHeight,Qn.updateProjectionMatrix(),ln.setSize(window.innerWidth,window.innerHeight),lr?.resize()})}function Mu(){const s=A.settings;be("set-music")&&(be("set-music").value=s.music),be("set-sfx")&&(be("set-sfx").value=s.sfx),be("set-quality")&&(be("set-quality").value=s.quality),be("set-snow")&&(be("set-snow").value=s.snow),be("set-motion")&&(be("set-motion").checked=!!s.reduceMotion),document.body.classList.toggle("reduce-motion",!!s.reduceMotion),Re.setMusicVolume(s.music),Re.setSfxVolume(s.sfx),A.setQuality(s.quality)}let _o=0;function Rv(s){_o+=s;const t=_o*.035+.35,e=175,n=306,i=76;Qn.position.set(e+Math.cos(t)*i,30+Math.sin(_o*.12)*5,n+Math.sin(t)*i),Qn.lookAt(e,7,n)}let bo=0;function Mo(s){A.time.hours=(A.time.hours+s*.018)%24,bo-=s,bo<=0&&(bo=.28,Lt.setTime(A.time.hours),Re.setNight(Lt.night)),Lt.update(s,A)}let wo=0;function la(s){const t=Math.min(.05,Math.max(0,(s-(la.last||s))/1e3));la.last=s,A.mode==="menu"||A.mode==="creator"?(Rv(t),Mo(t),Tn.update(t)):A.mode==="play"?(Mo(t),A.player.update(t),Tn.update(t),Hi.update(t),A.quests.update(t),A.effects.update(t),A.fishT=Math.max(0,A.fishT-t),wo-=t,wo<=0&&(wo=.4,A.syncQuestProgress()),A.enemyTarget&&(!A.enemyTarget.alive||A.enemyTarget.group.position.distanceTo(A.player.position)>46)&&A.setEnemyTarget(null),A.ui.update(t)):A.mode==="dead"?(Mo(t),A.player.update(t),A.effects.update(t),A.ui.update(t)):A.mode,A.indoor&&A.player&&Es&&Es.position.set(A.player.position.x,A.player.position.y+2.6,A.player.position.z),Re.gamePaused=A.mode!=="play",Re.update(t,A),bv(t),A.mode==="creator"&&lr?.update(t),ln.render(Jn,Qn),requestAnimationFrame(la)}vv();
