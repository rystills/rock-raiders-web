(()=>{"use strict";const t=[];for(let e=0;e<256;e++)t[e]=e;t[130]=228,t[142]=196,t[162]=246,t[167]=220,t[171]=252,t[195]=223;var e=function(){function e(){}return e.parse=function(i){for(var a={},s=[],r=a,n=!1,o=0,l="",h="",d=0;d<i.length;d++){var c=i[d];123===c&&"FullName"===l&&(c=142);var u=String.fromCharCode(t[c]);if(";"===u||"/"===u?n=!0:10!==c&&13!==c||(n=!1),!n)if(c>32)0===o?"}"===u?r=s.pop():(o++,l=u):1===o?l+=u:2===o?"{"===u?(s.push(r),r={},s[s.length-1][l]=r,o=0):(o++,h=u):3===o&&(h+=u);else if(1===o)o++;else if(3===o){o=0;var f=e.parseValue(h);r.hasOwnProperty(l)?r[l].push(f):r[l]=[f]}}for(var p=[a],g=function(){var t=p.pop();Object.keys(t).forEach((function(e){var i=t[e];Array.isArray(i)?1===i.length?t[e]=i[0]:i.forEach((function(t){return p.push(t)})):Object.keys(i).length>1&&p.push(i)}))};p.length>0;)g();return Object.values(a["Lego*"].Levels).forEach((function(t){t.CryoreMap&&(t.CryOreMap=t.CryoreMap,delete t.CryoreMap),t.CryOreMap&&(t.CryOreMap=t.CryOreMap.replace("Cryo_","Cror_")),t.PredugMap&&(t.PreDugMap=t.PredugMap,delete t.PredugMap)})),a["Lego*"]},e.parseValue=function(t){function i(i){0===(t=t.split(i).filter((function(t){return""!==t})).map((function(t){return e.parseValue(t)}))).length?t="":1===t.length&&(t=t[0])}var a=Number(t);if(isNaN(a)){var s=(t=t.toString().replace(/\\/g,"/")).toLowerCase();return"true"===s||"false"!==s&&("null"===s?"":(t.includes(":")?i.call(this,":"):t.includes(",")?i.call(this,","):t.includes("|")&&i.call(this,"|"),t))}return a},e}(),i=function(){function e(){this.buffer=null,this.entryIndexByName=new Map,this.fLength=[],this.fStart=[]}return e.prototype.parseWadFile=function(t,e){void 0===e&&(e=!1);var i=new DataView(t);this.buffer=new Int8Array(t);var a=0;if("WWAD"!==String.fromCharCode.apply(null,this.buffer.slice(a,4)))throw"Invalid WAD0 file provided";e&&console.log("WAD0 file seems legit"),a=4;var s=i.getInt32(a,!0);e&&console.log(s);for(var r=a=8,n=0;n<s;a++)0===this.buffer[a]&&(this.entryIndexByName.set(String.fromCharCode.apply(null,this.buffer.slice(r,a)).replace(/\\/g,"/").toLowerCase(),n),r=a+1,n++);for(e&&console.log(this.entryIndexByName),n=0;n<s;a++)0===this.buffer[a]&&(r=a+1,n++);for(e&&console.log("Offset after absolute original names is "+a),n=0;n<s;n++)this.fLength[n]=i.getInt32(a+8,!0),this.fStart[n]=i.getInt32(a+12,!0),a+=16;e&&(console.log(this.fLength),console.log(this.fStart))},e.prototype.getEntryData=function(t){return new Uint8Array(this.getEntryBuffer(t))},e.prototype.getEntryText=function(e){return(new TextDecoder).decode(this.getEntryBuffer(e).map((function(e){return t[e]})))},e.prototype.getEntryBuffer=function(t){var e=this.entryIndexByName.get(t.toLowerCase());if(null==e)throw"Entry '"+t+"' not found in WAD file";return this.buffer.slice(this.fStart[e],this.fStart[e]+this.fLength[e])},e.prototype.filterEntryNames=function(t){var e=new RegExp(t.toLowerCase()),i=[];return this.entryIndexByName.forEach((function(t,a){a.match(e)&&i.push(a)})),i},e}();function a(t){if(!t)return t;var e=t.toString().replace(/\\/g,"/");e.startsWith("/")&&(e=e.substring(1));var i=e.lastIndexOf("/");return(e=e.substring(0,i+1)).startsWith("/")&&(e=e.substring(1)),e}function s(t){if(!t)return t;var e=t.toString().replace(/\\/g,"/");e.startsWith("/")&&(e=e.substring(1));var i=e.lastIndexOf("/");return e.substring(i+1)}function r(t){for(var e=[],i=1;i<arguments.length;i++)e[i-1]=arguments[i];return e.forEach((function(e){t=(t=Object.keys(t).filter((function(t){return t.toLowerCase()===e.toLowerCase()})).map((function(e){return t[e]})))?t[0]:t})),t}var n,o=function(){function t(){}return t.parse=function(e){var i=e.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/\t/g," ").split("\n").map((function(t){var e=t.indexOf("//");e>-1&&(t=t.substring(0,e));var i=t.indexOf(";");return i>-1&&(t=t.substring(0,i)),t})).map((function(t){return t.trim()})).filter((function(t){return""!==t})).map((function(t){return t.split(" ").filter((function(t){return""!==t}))})),a={};return t.parseObj(a,i,0),a},t.parseObj=function(t,e,i){for(var a=this,s=i;s<e.length;s++){var r=e[s],n=r[0],o=r[1],l=n.toLowerCase();if("{"===o)t[l]={},s=this.parseObj(t[l],e,s+1);else{if("}"===l)return s;for(var h=o.split(":").filter((function(t){return""!==t})).map((function(t){return t.split(",").map((function(t){return t.split("|").map((function(t){return a.parseValue(t)}))}))}));1===h.length;)h=h[0];t[l]=h}}return e.length},t.parseValue=function(t){var e=Number(t),i=t.toLowerCase();return isNaN(e)?"false"!==i&&("true"===i||t):e},t}();!function(t){t[t.BITMAP_INFO_HEADER=40]="BITMAP_INFO_HEADER",t[t.BITMAP_V2_INFO_HEADER=52]="BITMAP_V2_INFO_HEADER",t[t.BITMAP_V3_INFO_HEADER=56]="BITMAP_V3_INFO_HEADER",t[t.BITMAP_V4_HEADER=108]="BITMAP_V4_HEADER",t[t.BITMAP_V5_HEADER=124]="BITMAP_V5_HEADER"}(n||(n={}));var l,h,d=function(){function t(t,e){var i=(void 0===e?{toRGBA:!1}:e).toRGBA;if(this.buffer=t,this.bufferView=new DataView(t.buffer,t.byteOffset,t.byteLength),this.toRGBA=!!i,this.bottomUp=!0,this.flag=String.fromCharCode(this.buffer[0])+String.fromCharCode(this.buffer[1]),this.pos=2,"BM"!==this.flag)throw new Error("Invalid BMP File");this.locRed=this.toRGBA?0:3,this.locGreen=this.toRGBA?1:2,this.locBlue=this.toRGBA?2:1,this.locAlpha=this.toRGBA?3:0,this.parseHeader(),this.parseRGBA()}return t.prototype.parseHeader=function(){if(this.fileSize=this.readUInt32LE(),this.reserved1=this.bufferView.getUint16(this.pos,!0),this.pos+=2,this.reserved2=this.bufferView.getUint16(this.pos,!0),this.pos+=2,this.offset=this.readUInt32LE(),this.headerSize=this.readUInt32LE(),!(this.headerSize in n))throw new Error("Unsupported BMP header size "+this.headerSize);if(this.width=this.readUInt32LE(),this.height=this.readUInt32LE(),this.planes=this.bufferView.getUint16(this.pos,!0),this.pos+=2,this.bitPP=this.bufferView.getUint16(this.pos,!0),this.pos+=2,this.compression=this.readUInt32LE(),this.rawSize=this.readUInt32LE(),this.hr=this.readUInt32LE(),this.vr=this.readUInt32LE(),this.colors=this.readUInt32LE(),this.importantColors=this.readUInt32LE(),32===this.bitPP?(this.maskAlpha=0,this.maskRed=16711680,this.maskGreen=65280,this.maskBlue=255):16===this.bitPP&&(this.maskAlpha=0,this.maskRed=31744,this.maskGreen=992,this.maskBlue=31),(this.headerSize>n.BITMAP_INFO_HEADER||3===this.compression||6===this.compression)&&(this.maskRed=this.readUInt32LE(),this.maskGreen=this.readUInt32LE(),this.maskBlue=this.readUInt32LE()),(this.headerSize>n.BITMAP_V2_INFO_HEADER||6===this.compression)&&(this.maskAlpha=this.readUInt32LE()),this.headerSize>n.BITMAP_V3_INFO_HEADER&&(this.pos+=n.BITMAP_V4_HEADER-n.BITMAP_V3_INFO_HEADER),this.headerSize>n.BITMAP_V4_HEADER&&(this.pos+=n.BITMAP_V5_HEADER-n.BITMAP_V4_HEADER),this.bitPP<=8||this.colors>0){var t=0===this.colors?1<<this.bitPP:this.colors;this.palette=new Array(t);for(var e=0;e<t;e++){var i=this.buffer[this.pos++],a=this.buffer[this.pos++],s=this.buffer[this.pos++],r=this.buffer[this.pos++];this.palette[e]={red:s,green:a,blue:i,quad:r}}}this.height<0&&(this.height*=-1,this.bottomUp=!1);var o,l,h,d,c,u,f,p,g,m,y,A,v=(o=this.maskRed,l=this.maskGreen,h=this.maskBlue,d=this.maskAlpha,g=o/(c=1+~o&o)+1,m=l/(u=1+~l&l)+1,y=h/(f=1+~h&h)+1,A=d/(p=1+~d&d)+1,{shiftRed:function(t){return(t&o)/c*256/g},shiftGreen:function(t){return(t&l)/u*256/m},shiftBlue:function(t){return(t&h)/f*256/y},shiftAlpha:0!==d?function(t){return(t&d)/p*256/A}:function(){return 255}});this.shiftRed=v.shiftRed,this.shiftGreen=v.shiftGreen,this.shiftBlue=v.shiftBlue,this.shiftAlpha=v.shiftAlpha},t.prototype.parseRGBA=function(){switch(this.data=new Uint8Array(this.width*this.height*4),this.bitPP){case 1:this.bit1();break;case 4:this.bit4();break;case 8:this.bit8();break;case 16:this.bit16();break;case 24:this.bit24();break;default:this.bit32()}},t.prototype.bit1=function(){var t,e=this,i=Math.ceil(this.width/8),a=i%4,s=0!==a?4-a:0;this.scanImage(s,i,(function(i,a){a!==t&&(t=a);for(var s=e.buffer[e.pos++],r=a*e.width*4+8*i*4,n=0;n<8&&8*i+n<e.width;n++){var o=e.palette[s>>7-n&1];e.data[r+4*n+e.locAlpha]=255,e.data[r+4*n+e.locBlue]=o.blue,e.data[r+4*n+e.locGreen]=o.green,e.data[r+4*n+e.locRed]=o.red}}))},t.prototype.bit4=function(){var t=this;if(2===this.compression){this.data.fill(0);for(var e=!1,i=this.bottomUp?this.height-1:0,a=0;a<this.data.length;){var s=this.buffer[this.pos++],r=this.buffer[this.pos++];if(0===s){if(0===r){a=(i+=this.bottomUp?-1:1)*this.width*4,e=!1;continue}if(1===r)break;if(2===r){var n=this.buffer[this.pos++],o=this.buffer[this.pos++];i+=this.bottomUp?-o:o,a+=o*this.width*4+4*n}else{for(var l=this.buffer[this.pos++],h=0;h<r;h++)a=this.setPixelData(a,e?15&l:(240&l)>>4),1&h&&h+1<r&&(l=this.buffer[this.pos++]),e=!e;1==(r+1>>1&1)&&this.pos++}}else for(h=0;h<s;h++)a=this.setPixelData(a,e?15&r:(240&r)>>4),e=!e}}else{var d=Math.ceil(this.width/2),c=d%4,u=0!==c?4-c:0;this.scanImage(u,d,(function(e,i){var a=t.buffer[t.pos++],s=i*t.width*4+2*e*4,r=a>>4,n=t.palette[r];if(t.data[s+t.locAlpha]=255,t.data[s+t.locBlue]=n.blue,t.data[s+t.locGreen]=n.green,t.data[s+t.locRed]=n.red,2*e+1>=t.width)return!1;var o=15&a;n=t.palette[o],t.data[s+4+t.locAlpha]=255,t.data[s+4+t.locBlue]=n.blue,t.data[s+4+t.locGreen]=n.green,t.data[s+4+t.locRed]=n.red}))}},t.prototype.bit8=function(){var t=this;if(1===this.compression){this.data.fill(0);for(var e=this.bottomUp?this.height-1:0,i=0;i<this.data.length;){var a=this.buffer[this.pos++],s=this.buffer[this.pos++];if(0===a){if(0===s){i=(e+=this.bottomUp?-1:1)*this.width*4;continue}if(1===s)break;if(2===s){var r=this.buffer[this.pos++],n=this.buffer[this.pos++];e+=this.bottomUp?-n:n,i+=n*this.width*4+4*r}else{for(var o=0;o<s;o++){var l=this.buffer[this.pos++];i=this.setPixelData(i,l)}!0&s&&this.pos++}}else for(o=0;o<a;o++)i=this.setPixelData(i,s)}}else{var h=this.width%4,d=0!==h?4-h:0;this.scanImage(d,this.width,(function(e,i){var a=t.buffer[t.pos++],s=i*t.width*4+4*e;if(a<t.palette.length){var r=t.palette[a];t.data[s+t.locAlpha]=255,t.data[s+t.locBlue]=r.blue,t.data[s+t.locGreen]=r.green,t.data[s+t.locRed]=r.red}}))}},t.prototype.bit16=function(){var t=this,e=this.width%2*2;this.scanImage(e,this.width,(function(e,i){var a=i*t.width*4+4*e,s=t.bufferView.getUint16(t.pos,!0);t.pos+=2,t.data[a+t.locRed]=t.shiftRed(s),t.data[a+t.locGreen]=t.shiftGreen(s),t.data[a+t.locBlue]=t.shiftBlue(s),t.data[a+t.locAlpha]=t.shiftAlpha(s)}))},t.prototype.bit24=function(){var t=this,e=this.width%4;this.scanImage(e,this.width,(function(e,i){var a=i*t.width*4+4*e,s=t.buffer[t.pos++],r=t.buffer[t.pos++],n=t.buffer[t.pos++];t.data[a+t.locAlpha]=255,t.data[a+t.locBlue]=s,t.data[a+t.locGreen]=r,t.data[a+t.locRed]=n}))},t.prototype.bit32=function(){var t=this;this.scanImage(0,this.width,(function(e,i){var a=i*t.width*4+4*e,s=t.readUInt32LE();t.data[a+t.locAlpha]=t.shiftAlpha(s),t.data[a+t.locBlue]=t.shiftBlue(s),t.data[a+t.locGreen]=t.shiftGreen(s),t.data[a+t.locRed]=t.shiftRed(s)}))},t.prototype.scanImage=function(t,e,i){void 0===t&&(t=0),void 0===e&&(e=this.width);for(var a=this.height-1;a>=0;a--){for(var s=this.bottomUp?a:this.height-1-a,r=0;r<e;r++)i.call(this,r,s);this.pos+=t}},t.prototype.readUInt32LE=function(){var t=this.bufferView.getUint32(this.pos,!0);return this.pos+=4,t},t.prototype.setPixelData=function(t,e){var i=this.palette[e],a=i.blue,s=i.green,r=i.red;return this.data[t+this.locAlpha]=255,this.data[t+this.locBlue]=a,this.data[t+this.locGreen]=s,this.data[t+this.locRed]=r,t+4},t}(),c=function(){function t(){}return t.parse=function(t){var e=new d(t,{toRGBA:!0}),i=new Uint8ClampedArray(e.data);return new ImageData(i,e.width,e.height)},t}(),u=function(){function t(){}return t.setFromCfg=function(t,e){return Object.keys(e).forEach((function(i){var a=(i.startsWith("!")?i.substring(1):i).toLowerCase().replace(/_/g,"").replace(/-/g,"");Object.keys(t).some((function(s){return t.assignValue(s,a,e[i])}))||console.warn("cfg key does not exist: "+i)})),t},t.prototype.assignValue=function(t,e,i){if(t.toLowerCase()===e){var a=this[t],s=Array.isArray(a),r=this.parseValue(e,i),n=Array.isArray(r);return a&&s!==n&&s&&(r=[r]),this[t]=r,!0}},t.prototype.parseValue=function(t,e){return e},t}(),f=function(t){5===t.length||6===t.length?(this.actionName=t[0],this.x=t[1],this.y=t[2],this.label=t[3],this.target=t[4],this.flag=t[5],this.label=Array.isArray(this.label)?this.label.join(","):this.label,this.label=this.label.replace(/_/g," ")):8===t.length?(this.actionName=t[0],this.x=t[1],this.y=t[2],this.imgNormal=t[3],this.imgHover=t[4],this.imgPressed=t[5],this.tooltip=t[6],this.target=t[7]):(console.warn("Unexpected cfg object length: "+t.length),console.log(t))},p=function(t){this.actionName=t[0],this.x=t[1],this.y=t[2],this.width=t[3],this.height=t[4],this.description=t[5],this.min=t[6],this.max=t[7],this.imgOff=t[8],this.imgOn=t[9],this.imgLeft=t[10],this.imgRight=t[11],this.btnRightNormal=t[12],this.btnLeftNormal=t[13],this.btnRightHover=t[14],this.btnLeftHover=t[15]},g=function(t){this.actionName=t[0],this.x=t[1],this.y=t[2],this.width=t[3],this.height=t[4],this.description=t[5],this.two=t[6],this.labelOff=t[7],this.labelOn=t[8],this.description=this.description.replace(/_/g," ")},m=(l=function(t,e){return(l=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])})(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}l(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),y=function(t){function e(e){var i=t.call(this)||this;return i.fullName="",i.title="",i.position=[0,0],i.menuFont="",i.loFont="",i.hiFont="",i.itemCount=0,i.menuImage="",i.autoCenter=!1,i.displayTitle=!1,i.overlays=[],i.playRandom=!1,i.itemsLabel=[],i.itemsSlider=[],i.itemsCycle=[],i.anchored=!1,i.canScroll=!1,u.setFromCfg(i,e),i}return m(e,t),e.prototype.assignValue=function(e,i,a){if(i.match(/item\d+/i)){var s=a[0].toLowerCase();if("next"===s||"trigger"===s)this.itemsLabel.push(new f(a));else if("slider"===s)this.itemsSlider.push(new p(a));else{if("cycle"!==s)return console.warn("Unexpected item action name: "+a[0]),!1;this.itemsCycle.push(new g(a))}return!0}return i.match(/overlay\d+/i)?(this.overlays.push(a),!0):t.prototype.assignValue.call(this,e,i,a)},e.prototype.parseValue=function(e,i){return e==="fullName".toLowerCase()||"title"===e?i.replace(/_/g," "):t.prototype.parseValue.call(this,e,i)},e}(u),A=function(){var t=function(e,i){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])})(e,i)};return function(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function a(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(a.prototype=i.prototype,new a)}}(),v=function(t){function e(e){var i=t.call(this)||this;return i.menuCount=0,i.menus=[],u.setFromCfg(i,e),i}return A(e,t),e.prototype.assignValue=function(e,i,a){return i.match(/menu\d+/i)?(this.menus.push(new y(a)),!0):t.prototype.assignValue.call(this,e,i,a)},e}(u),w=function(t){this.r=t[0],this.g=t[1],this.b=t[2]},b=function(t){this.filename=t[0],this.x=t[1],this.y=t[2]};!function(t){t[t.aiPriorityTrain=0]="aiPriorityTrain",t[t.aiPriorityGetIn=1]="aiPriorityGetIn",t[t.aiPriorityCrystal=2]="aiPriorityCrystal",t[t.aiPriorityOre=3]="aiPriorityOre",t[t.aiPriorityRepair=4]="aiPriorityRepair",t[t.aiPriorityClearing=5]="aiPriorityClearing",t[t.aiPriorityDestruction=6]="aiPriorityDestruction",t[t.aiPriorityConstruction=7]="aiPriorityConstruction",t[t.aiPriorityReinforce=8]="aiPriorityReinforce",t[t.aiPriorityRecharge=9]="aiPriorityRecharge"}(h||(h={})),Array.prototype.remove=function(t){var e=this.indexOf(t);-1!==e&&this.splice(e,1)},Map.prototype.getOrUpdate=function(t,e){var i=this.get(t);return void 0===i&&(i=e(),this.set(t,i)),i};var I,F=function(){var t=function(e,i){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])})(e,i)};return function(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function a(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(a.prototype=i.prototype,new a)}}(),E=function(t){var e=this;this.levelsByName=[],Object.keys(t).forEach((function(i){(i.startsWith("Tutorial")||i.startsWith("Level"))&&(e.levelsByName[i]=new L(t[i]))}))},L=function(t){function e(e){var i=t.call(this)||this;return i.fullName="",i.endGameAvi1="",i.endGameAvi2="",i.allowRename=!1,i.recallOLObjects=!1,i.generateSpiders=!1,i.video="",i.disableEndTeleport="",i.disableStartTeleport="",i.emergeTimeOut="",i.boulderAnimation="",i.noMultiSelect="",i.noAutoEat="",i.disableToolTipSound="",i.blockSize="",i.digDepth="",i.roughLevel="",i.roofHeight="",i.useRoof="",i.selBoxHeight="",i.fpRotLightRGB="",i.fogColourRGB="",i.highFogColourRGB="",i.fogRate=0,i.fallinMultiplier=0,i.numberOfLandSlidesTillCaveIn=0,i.noFallins=!1,i.oxygenRate=0,i.surfaceMap="",i.predugMap="",i.terrainMap="",i.emergeMap="",i.erodeMap="",i.fallinMap="",i.blockPointersMap="",i.cryOreMap="",i.pathMap="",i.noGather=!1,i.textureSet="",i.rockFallStyle="",i.emergeCreature="",i.safeCaverns="",i.seeThroughWalls="",i.oListFile="",i.ptlFile="",i.nerpFile="",i.nerpMessageFile="",i.objectiveText="",i.objectiveImage640x480=null,i.erodeTriggerTime=0,i.erodeErodeTime=0,i.erodeLockTime=0,i.nextLevel="",i.levelLinks="",i.frontEndX=0,i.frontEndY=0,i.frontEndOpen=!1,i.priorities=[],i.reward=null,i.menuBMP=[],u.setFromCfg(i,e),i}return F(e,t),e.prototype.parseValue=function(e,i){return e==="fullName".toLowerCase()?i.replace(/_/g," "):e.endsWith("rgb")?new w(i):"priorities"===e?Object.keys(i).filter((function(t){return t.toLowerCase()!=="AI_Priority_GetTool".toLowerCase()})).map((function(t){return new P(t,i[t])})):"reward"===e?new O(i):"objectiveimage640x480"===e?new b(i):t.prototype.parseValue.call(this,e,i)},e}(u),P=function(t,e){this.key=function(t){for(var e=[],i=1;i<arguments.length;i++)e[i-1]=arguments[i];return e.forEach((function(e){t=(t=Object.keys(t).filter((function(t){return t.toLowerCase()===e.toLowerCase()})).map((function(e){return t[e]})))?t[0]:t})),t}(h,t.replace(/_/g,"")),this.enabled=e},O=function(t){function e(e){var i=t.call(this)||this;return i.enable=!0,i.modifier=null,i.importance=null,i.quota=null,u.setFromCfg(i,e),i}return F(e,t),e.prototype.parseValue=function(e,i){return"importance"===e?new M(i):"quota"===e?new C(i):t.prototype.parseValue.call(this,e,i)},e}(u),M=function(t){function e(e){var i=t.call(this)||this;return i.crystals=0,i.timer=0,i.caverns=0,i.constructions=0,i.oxygen=0,i.figures=0,u.setFromCfg(i,e),i}return F(e,t),e}(u),C=function(t){function e(e){var i=t.call(this)||this;return i.crystals=null,i.timer=null,i.caverns=null,i.constructions=null,u.setFromCfg(i,e),i}return F(e,t),e}(u),x=function(){var t=function(e,i){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])})(e,i)};return function(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function a(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(a.prototype=i.prototype,new a)}}(),T=function(t){function e(e){var i=t.call(this)||this;return i.display=!0,i.wallpaper="",i.images=[],i.texts=[],i.boxImages=[],i.fonts=null,i.flics=null,i.scrollSpeed=0,i.centreText=!1,i.vertSpacing=0,i.backFont="",i.font="",i.titleFont="",i.timer=0,i.saveButton="",i.advanceButton="",i.completeText="",i.failedText="",i.quitText="",i.textPos=[0,0],u.setFromCfg(i,e),i}return x(e,t),e.prototype.assignValue=function(e,i,a){var s=this;return"images"===i?(Object.values(a).forEach((function(t){return s.images.push(new R(t))})),!0):"text"===i?(Object.values(a).forEach((function(t){return s.texts.push(new _(t))})),!0):"boximages"===i?(Object.values(a).forEach((function(t){return s.boxImages.push(new R(t))})),!0):"fonts"===i?(this.fonts=new B(a),!0):t.prototype.assignValue.call(this,e,i,a)},e}(u),R=function(t){this.filePath="",this.x=0,this.y=0,this.filePath=t[0],this.x=t[1],this.y=t[2]},_=function(t){this.text="",this.x=0,this.y=0,this.text=t[0],this.x=t[1],this.y=t[2]},B=function(t){function e(e){var i=t.call(this)||this;return i.crystals="",i.ore="",i.diggable="",i.constructions="",i.caverns="",i.figures="",i.rockMonsters="",i.oxygen="",i.timer="",i.score="",u.setFromCfg(i,e),i}return x(e,t),e}(u),S=function(){function e(){}return e.prototype.parseObjectiveTextFile=function(e){for(var i={},a=I.DROP,s=null,r="",n="",o=0;o<e.length;o++){var l=t[e[o]],h=String.fromCharCode(l);if(a===I.DROP)if("["===h)s&&(i[s.key]=s),s=new D,a=I.KEY;else if(s&&":"===h){var d=n.toLowerCase();for("objective"===d?(n="",a=I.OBJECTIVE):"failure"===d?(n="",a=I.FAILURE):"completion"===d?(n="",a=I.COMPLETION):"crystalfailure"===d&&(n="",a=I.CRYSTAL_FAILURE);o<e.length&&e[o+1]==="\t".charCodeAt(0);o++);}else"\n"===h||"\r"===h?n="":n+=h;else if(a===I.KEY)if("]"===h)s.key=r,r="",a=I.DROP;else{if("\n"===h||"\r"===h)throw"Malformed objective text file";r+=h}else a===I.OBJECTIVE?"\n"===h||"\r"===h?(s.objective=r,r="",a=I.DROP):r+=h:a===I.FAILURE?"\n"===h||"\r"===h?(s.failure=r,r="",a=I.DROP):r+=h:a===I.COMPLETION?"\n"===h||"\r"===h?(s.completion=r,r="",a=I.DROP):r+=h:a===I.CRYSTAL_FAILURE&&("\n"===h||"\r"===h?(s.crystalFailure=r,r="",a=I.DROP):r+=h)}return s&&(i[s.key]=s),s=null,i},e}();!function(t){t[t.DROP=0]="DROP",t[t.KEY=1]="KEY",t[t.OBJECTIVE=2]="OBJECTIVE",t[t.FAILURE=3]="FAILURE",t[t.COMPLETION=4]="COMPLETION",t[t.CRYSTAL_FAILURE=5]="CRYSTAL_FAILURE"}(I||(I={}));var W,D=function(){},N=function(){function t(){this.wad0File=null,this.wad1File=null,this.assetIndex=0,this.totalResources=0,this.assetsFromCfgByName=new Map,this.onMessage=function(t){console.log(t)},this.onInitialLoad=function(){console.log("Initial loading done.")},this.onAssetLoaded=function(){},this.onLoadDone=function(t,e){console.log("Loading of about "+t+" assets complete! Total load time: "+e+" seconds.")}}return t.prototype.loadWadImageAsset=function(t,e){var i=this.wad0File.getEntryData(t);e(c.parse(i))},t.prototype.loadWadTexture=function(t,e){var i=this.wad0File.getEntryData(t),a=c.parse(i),r=s(t);if(function(t){return!!(t.match(/\d\d\d\..+$/i)||t.match(/^trans/i)||t.match(/telepulse/i)||t.match(/^t_/i)||t.includes("crystalglow")||t.match(/^glin/i)||t.match(/glow.bmp/i)||t.match(/spankle/i)||t.startsWith("rd_"))}(r))for(var n=0;n<a.data.length;n+=4)255===a.data[n]&&255===a.data[n+1]&&255===a.data[n+2]?a.data[n+3]=0:a.data[n+3]=Math.max(a.data[n],a.data[n+1],a.data[n+2]);else if(function(t){return!!t.match(/^a.+/i)||!!t.match(/\d\.bmp/i)}(r)){var o={r:a.data[a.data.length-4],g:a.data[a.data.length-3],b:a.data[a.data.length-2]};for("a000_sides.bmp"===r.toLowerCase()&&(o={r:a.data[0],g:a.data[1],b:a.data[2]}),n=0;n<a.data.length;n+=4)a.data[n]===o.r&&a.data[n+1]===o.g&&a.data[n+2]===o.b&&(a.data[n+3]=0)}e(a)},t.prototype.loadAlphaImageAsset=function(t,e){for(var i=this.wad0File.getEntryData(t),a=c.parse(i),s=0;s<a.data.length;s+=4)a.data[s]<=2&&a.data[s+1]<=2&&a.data[s+2]<=2&&(a.data[s+3]=0);e(a)},t.prototype.loadFontImageAsset=function(t,e){var i=this.wad0File.getEntryData(t);e(c.parse(i))},t.prototype.loadNerpAsset=function(t,e){t=t.replace(/.npl$/,".nrn"),e(this.wad0File.getEntryText(t))},t.prototype.loadNerpMsg=function(t,e){for(var i=this.parseNerpMsgFile(this.wad0File,t),a=this.parseNerpMsgFile(this.wad1File,t),s=0;s<a.length;s++){var r=a[s];r&&(r.txt&&(i[s].txt=r.txt),r.snd&&(i[s].snd=r.snd))}e(i)},t.prototype.parseNerpMsgFile=function(t,e){for(var i=[],a=t.getEntryText(e).split("\n"),s=0;s<a.length;s++){var r=a[s].trim();if(!(r.length<1||"-"===r)){var n=r.match(/\\\[([^\\]+)\\](\s*#([^#]+)#)?/),o=r.match(/^([^$][^#]+)(\s*#([^#]+)#)?/),l=r.match(/\$([^\s]+)\s*([^\s]+)/);if(t===this.wad0File&&n)i[h=void 0!==n[3]?this.numericNameToNumber(n[3]):s]=i[h]||{},i[h].txt=n[1];else if(t===this.wad1File&&o)i[h=void 0!==o[3]?this.numericNameToNumber(o[3]):s]=i[h]||{},i[h].txt=o[1].replace(/_/g," ").trim();else{if(!l||3!==l.length)throw"Line in nerps message file did not match anything";var h;i[h=this.numericNameToNumber(l[1])]=i[h]||{},i[h].snd=l[2].replace(/\\/g,"/")}}}return i},t.prototype.numericNameToNumber=function(t){if(void 0===t)throw"Numeric name must not be undefined";var e={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9},i={twenty:20,thirty:30,forty:40},a={ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19}[t]||e[t];if(void 0===a&&Object.keys(i).forEach((function(s){if(t.startsWith(s)){var r=t.replace(s,"");a=i[s]+(r?e[r]:0)}})),void 0===a)throw"Found unexpected numeric name "+t;return a},t.prototype.loadObjectiveTexts=function(t,e){var i=this.wad1File.getEntryData(t);e((new S).parseObjectiveTextFile(i))},t.prototype.loadMapAsset=function(t,e){var i=this.wad0File.getEntryData(t);if(i.length<13||"MAP"!==String.fromCharCode.apply(String,i.slice(0,3)))console.log("Invalid map data provided");else{for(var a={width:i[8],height:i[12],level:[]},s=[],r=16;r<i.length;r+=2)s.push(i[r]),s.length>=a.width&&(a.level.push(s),s=[]);e(a)}},t.prototype.loadObjectListAsset=function(t,e){for(var i=this.wad0File.getEntryText(t).split("\n"),a=[],s=null,r=0;r<i.length;r++){var n=i[r].trim(),o=n.match(/(.+)\s+{/),l=n.match(/driving\s+(.+)/);if(n.length<1||n.startsWith(";")||n.startsWith("Lego*"));else if(o)s={},a[o[1]]=s;else if("}"===n)s=null;else if(l)s.driving=l[1];else{var h=n.split(/\s+/);if(2!==h.length||null===s)throw"Unexpected key value entry: "+n;var d=h[0],c=h[1];if("xPos"===d||"yPos"===d||"heading"===d)c=parseFloat(c);else if("type"!==d)throw"Unexpected key value entry: "+n;s[d]=c}}e(a)},t.prototype.loadWavAsset=function(t,e,i){console.error("wav asset loading not yet implemented")},t.prototype.loadLWOFile=function(t,e){var i;try{i=this.wad0File.getEntryBuffer(t)}catch(e){try{i=this.wad0File.getEntryBuffer("world/shared/"+s(t))}catch(e){return void console.error("Could not load LWO file "+t+"; Error: "+e)}}e(i.buffer)},t.prototype.registerAllAssets=function(t){var e=this;this.addAssetFolder(this.loadFontImageAsset,"Interface/Fonts/"),this.addAssetFolder(this.loadAlphaImageAsset,"Interface/Pointers/"),this.addMenuWithAssets(t,"MainMenuFull",!1),this.addMenuWithAssets(t,"PausedMenu"),this.addMenuWithAssets(t,"OptionsMenu"),this.addAsset(this.loadAlphaImageAsset,"Interface/BriefingPanel/BriefingPanel.bmp"),this.addAsset(this.loadObjectiveTexts,"Languages/ObjectiveText.txt"),this.addAlphaImageFolder("Interface/TopPanel/"),this.addAlphaImageFolder("Interface/RightPanel/"),this.addAlphaImageFolder("Interface/RadarPanel/"),this.addAlphaImageFolder("Interface/MessagePanel/"),this.addAsset(this.loadWadImageAsset,"Interface/Airmeter/msgpanel_air_juice.bmp"),this.addAlphaImageFolder("Interface/InfoPanel/"),this.addAlphaImageFolder("Interface/PriorityPanel/"),this.addAlphaImageFolder("Interface/Priorities"),this.addAlphaImageFolder("Interface/CameraControl/"),this.addAlphaImageFolder("Interface/MessageTabs/"),this.addAlphaImageFolder("Interface/IconPanel/"),this.addAlphaImageFolder("Interface/Icons/"),this.addAlphaImageFolder("Interface/Menus/"),this.addAlphaImageFolder("Interface/Buttons/"),this.addAlphaImageFolder("Interface/InfoImages/"),this.addAssetFolder(this.loadAlphaImageAsset,"Interface/FrontEnd/Vol_"),this.addAssetFolder(this.loadWadImageAsset,"Interface/FrontEnd/lp_"),this.addAsset(this.loadAlphaImageAsset,"Interface/FrontEnd/LowerPanel.bmp"),this.addAsset(this.loadNerpAsset,"Levels/nerpnrn.h");var i=new E(r(t,"Levels"));this.onAssetLoaded(0,"Levels",i),Object.values(i.levelsByName).forEach((function(t){t.menuBMP.forEach((function(t){e.addAsset(e.loadAlphaImageAsset,t)})),e.addAsset(e.loadMapAsset,t.surfaceMap),e.addAsset(e.loadMapAsset,t.predugMap),e.addAsset(e.loadMapAsset,t.terrainMap),e.addAsset(e.loadMapAsset,t.blockPointersMap,!0),e.addAsset(e.loadMapAsset,t.cryOreMap),e.addAsset(e.loadMapAsset,t.pathMap,!0),t.fallinMap&&e.addAsset(e.loadMapAsset,t.fallinMap),t.erodeMap&&e.addAsset(e.loadMapAsset,t.erodeMap),e.addAsset(e.loadObjectListAsset,t.oListFile),e.addAsset(e.loadNerpAsset,t.nerpFile),e.addAsset(e.loadNerpMsg,t.nerpMessageFile)})),this.addTextureFolder("World/Shared/");var a=t.BuildingTypes;Object.values(a).forEach((function(t){var i=t.split("/")[1],a=t+"/"+i+".ae";e.addAnimatedEntity(a)})),this.addAnimatedEntity("mini-figures/pilot/pilot.ae"),this.addAnimatedEntity("Creatures/SpiderSB/SpiderSB.ae"),this.addAnimatedEntity("Creatures/bat/bat.ae"),this.addAnimatedEntity(r(t,"MiscObjects","Dynamite")+"/Dynamite.ae"),this.addAnimatedEntity(r(t,"MiscObjects","Barrier")+"/Barrier.ae"),this.addAsset(this.loadLWOFile,"World/Shared/Crystal.lwo"),this.addAsset(this.loadLWOFile,r(t,"MiscObjects","Crystal")+".lwo"),this.addTextureFolder("MiscAnims/Crystal/"),this.addAsset(this.loadLWOFile,r(t,"MiscObjects","Ore")+".lwo"),this.addAsset(this.loadWadTexture,"MiscAnims/Ore/Ore.bmp"),this.addAsset(this.loadLWOFile,"World/Shared/Brick.lwo"),this.addAsset(this.loadLWOFile,r(t,"MiscObjects","ProcessedOre")+".lwo"),this.addAsset(this.loadLWOFile,r(t,"MiscObjects","ElectricFence")+".lwo"),this.addTextureFolder("Buildings/E-Fence/"),this.addAnimatedEntity(r(t,"MiscObjects","Barrier")+"/Barrier.ae"),this.addAnimatedEntity("MiscAnims/Dynamite/Dynamite.ae"),this.addLWSFile("MiscAnims/RockFall/Rock3Sides.lws"),this.addTextureFolder("MiscAnims/RockFall/"),this.addTextureFolder("World/WorldTextures/IceSplit/Ice"),this.addTextureFolder("World/WorldTextures/LavaSplit/Lava"),this.addTextureFolder("World/WorldTextures/RockSplit/Rock");var s=new T(r(t,"Reward"));this.onAssetLoaded(0,"Reward",s),this.addAsset(this.loadWadImageAsset,s.wallpaper),this.addAsset(this.loadFontImageAsset,s.backFont),Object.values(s.fonts).forEach((function(t){return e.addAsset(e.loadFontImageAsset,t)})),s.images.forEach((function(t){return e.addAsset(e.loadAlphaImageAsset,t.filePath)})),s.boxImages.forEach((function(t){return e.addAsset(e.loadWadImageAsset,t.filePath)})),s.saveButton.splice(0,4).forEach((function(t){return e.addAsset(e.loadWadImageAsset,t)})),s.advanceButton.splice(0,4).forEach((function(t){return e.addAsset(e.loadWadImageAsset,t)}))},t.prototype.addAnimatedEntity=function(t){var e=this,i=this.wad0File.getEntryText(t),s=r(o.parse(i),"Lego*");this.onAssetLoaded(0,t,s);var n=a(t);["HighPoly","MediumPoly","LowPoly"].forEach((function(t){var i=r(s,t);i&&Object.keys(i).forEach((function(t){e.addAsset(e.loadLWOFile,n+i[t]+".lwo")}))}));var l=r(s,"Activities");l&&Object.keys(l).forEach((function(t){try{var i=r(l,t),a=r(s,i),o=r(a,"FILE");!0===r(a,"LWSFILE")?e.addLWSFile(n+o+".lws"):console.error("Found activity which is not an LWS file")}catch(e){console.error(e),console.log(s),console.log(l),console.log(t)}})),this.addTextureFolder(a(t))},t.prototype.addLWSFile=function(t){var e=this,i=this.wad0File.getEntryText(t);this.onAssetLoaded(0,t,i),this.extractLwoFiles(a(t),i).forEach((function(t){return e.addAsset(e.loadLWOFile,t)}))},t.prototype.extractLwoFiles=function(t,e){var i=e.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/\t/g," ").split("\n").map((function(t){return t.trim()}));if("LWSC"!==i[0])throw"Invalid start of file! Expected 'LWSC' in first line";return i.filter((function(t){return t.toLowerCase().startsWith("LoadObject ".toLowerCase())})).map((function(e){return t+s(e.substring("LoadObject ".length)).toLowerCase()}))},t.prototype.addAlphaImageFolder=function(t){this.addAssetFolder(this.loadAlphaImageAsset,t)},t.prototype.addTextureFolder=function(t){this.addAssetFolder(this.loadWadTexture,t)},t.prototype.addAssetFolder=function(t,e){var i=this;this.wad0File.filterEntryNames(e+".+\\.bmp").forEach((function(e){i.addAsset(t,e)}))},t.prototype.addMenuWithAssets=function(t,e,i){var a=this;void 0===i&&(i=!0);var s=new v(r(t,"Menu",e));this.onAssetLoaded(0,e,s),s.menus.forEach((function(t){var e=i?a.loadAlphaImageAsset:a.loadWadImageAsset,s=Array.isArray(t.menuImage)?t.menuImage[0]:t.menuImage;a.addAsset(e,s),a.addAsset(a.loadFontImageAsset,t.menuFont),a.addAsset(a.loadFontImageAsset,t.loFont),a.addAsset(a.loadFontImageAsset,t.hiFont)}))},t.prototype.addAsset=function(t,e,i){void 0===i&&(i=!1),e&&!this.assetsFromCfgByName.hasOwnProperty(e)&&"NULL"!==e&&this.assetsFromCfgByName.set(e,{method:t.bind(this),assetPath:e,optional:i})},t.prototype.loadAssetsParallel=function(){var t=this,e=[],i=this;this.assetsFromCfgByName.forEach((function(a){e.push(new Promise((function(e){try{a.method(a.assetPath,(function(s){t.assetIndex++,i.onAssetLoaded(t.assetIndex,a.assetPath,s),e()}))}catch(s){if(!a.optional)throw s;t.assetIndex++,i.onAssetLoaded(t.assetIndex,a.assetPath,null),e()}})))})),Promise.all(e).then((function(){var e=(((new Date).getTime()-t.startTime.getTime())/1e3).toFixed(3).toString();t.onLoadDone(t.totalResources,e)}))},t.prototype.startWithCachedFiles=function(t){var e=this;this.startTime=new Date;var a=function(){e.onMessage("WAD files not found in cache"),t()};this.onMessage("Loading WAD files from cache...");var s=this;this.openLocalCache((function(t){var e=t.get("wad0");e.onerror=a,e.onsuccess=function(){if(void 0!==e.result){for(var r in s.wad0File=new i,e.result)e.result.hasOwnProperty(r)&&(s.wad0File[r]=e.result[r]);var n=t.get("wad1");n.onerror=a,n.onsuccess=function(){if(void 0!==n.result){for(var t in s.wad1File=new i,n.result)n.result.hasOwnProperty(t)&&(s.wad1File[t]=n.result[t]);console.log("WAD files loaded from cache after "+((new Date).getTime()-s.startTime.getTime())/1e3),s.startLoadingProcess()}else a()}}else a()}}))},t.prototype.loadWadFiles=function(t,e){var i=this,a=this;Promise.all([this.loadWadFile(t),this.loadWadFile(e)]).then((function(t){a.wad0File=t[0],a.wad1File=t[1],i.openLocalCache((function(t){t.put(a.wad0File,"wad0"),t.put(a.wad1File,"wad1")})),i.startLoadingProcess()}))},t.prototype.loadWadFile=function(t){return new Promise((function(e){console.log("Loading WAD file from "+t),fetch(t).then((function(t){t.ok&&t.arrayBuffer().then((function(t){var a=new i;a.parseWadFile(t),e(a)}))})).catch((function(t){return console.error(t)}))}))},t.prototype.openLocalCache=function(t){var e=indexedDB.open("RockRaidersWeb");e.onupgradeneeded=function(){var t=e.result;t.objectStoreNames.contains("wadfiles")&&t.deleteObjectStore("wadfiles"),t.createObjectStore("wadfiles")},e.onsuccess=function(){var i=e.result.transaction(["wadfiles"],"readwrite").objectStore("wadfiles");t(i)}},t.prototype.startLoadingProcess=function(){var t=this;this.startTime=new Date,this.assetsFromCfgByName=new Map,this.onMessage("Loading configuration...");var i=e.parse(this.wad1File.getEntryData("Lego.cfg"));this.registerAllAssets(i),this.onMessage("Loading initial assets..."),Promise.all([new Promise((function(e){var a=r(i,"Main","LoadScreen");t.loadWadImageAsset(a,(function(i){t.onAssetLoaded(0,a,i),e()}))})),new Promise((function(e){var a=r(i,"Main","ProgressBar");t.loadWadImageAsset(a,(function(i){t.onAssetLoaded(0,a,i),e()}))})),new Promise((function(e){var a=r(i,"Pointers","Pointer_Standard");t.loadAlphaImageAsset(a,(function(i){t.onAssetLoaded(0,a,i),e()}))})),new Promise((function(e){var i="Interface/Fonts/Font5_Hi.bmp";t.loadFontImageAsset(i,(function(a){t.onAssetLoaded(0,i,a),e()}))}))]).then((function(){t.onMessage("Start loading assets..."),t.totalResources=t.assetsFromCfgByName.size,t.onInitialLoad(t.totalResources,i),t.assetIndex=0,t.loadAssetsParallel()}))},t}(),j=function(){function t(t){this.type=null,this.type=t}return t.createTextMessage=function(t){return{type:W.MSG,text:t}},t.createCfgLoaded=function(t,e){return{type:W.CFG,cfg:t,totalResources:e}},t.createAssetLoaded=function(t,e,i){return{type:W.ASSET,assetName:e,assetObj:i}},t.createLoadDone=function(t,e){return{type:W.DONE,totalResources:t,loadingTimeSeconds:e}},t}();!function(t){t[t.MSG=0]="MSG",t[t.CFG=1]="CFG",t[t.CACHE_MISS=2]="CACHE_MISS",t[t.SFX=3]="SFX",t[t.ASSET=4]="ASSET",t[t.DONE=5]="DONE"}(W||(W={}));var k=self;function U(t){k.postMessage(t)}k.addEventListener("message",(function(t){var e=new N;e.onMessage=function(t){return U(j.createTextMessage(t))},e.onInitialLoad=function(t,e){return U(j.createCfgLoaded(e,t))},e.onAssetLoaded=function(t,e,i){U(j.createAssetLoaded(t,e,i))},e.onLoadDone=function(t,e){U(j.createLoadDone(t,e))};var i=t.data;i?e.loadWadFiles(i.wad0FileUrl,i.wad1FileUrl):e.startWithCachedFiles((function(){return U(new j(W.CACHE_MISS))}))}))})();
//# sourceMappingURL=index.worker.js.map