'use strict';
// ===== Blockcraft: original voxel sandbox. All art drawn in code. =====
const CS=16, H=160, NSEC=H/CS, SEA=100, HELL_TOP=40, DEEP_TOP=72;
function rng32(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// ---- texture atlas ----
const TS=16, ATW=16; // 16x16 tiles of 16px -> 256px
const atlas=document.createElement('canvas');atlas.width=atlas.height=TS*ATW;
const actx=atlas.getContext('2d');
const TEX={};let texN=0;
function cl(v){return v<0?0:v>255?255:v|0;}
function tile(name,fn){const i=texN++;TEX[name]=i;const img=actx.createImageData(TS,TS);const r=rng32(i*7919+13);
  const P=(x,y,c,a)=>{if(x<0||y<0||x>=TS||y>=TS)return;const o=(y*TS+x)*4;img.data[o]=cl(c[0]);img.data[o+1]=cl(c[1]);img.data[o+2]=cl(c[2]);img.data[o+3]=a===undefined?255:a;};
  const G=(x,y)=>{const o=(y*TS+x)*4;return [img.data[o],img.data[o+1],img.data[o+2],img.data[o+3]];};
  fn(P,r,G);actx.putImageData(img,(i%ATW)*TS,((i/ATW)|0)*TS);}
const noiseFill=(P,r,c,v)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*v;P(x,y,[c[0]+k,c[1]+k,c[2]+k]);}};
const specks=(P,r,c,n,sz)=>{for(let i=0;i<n;i++){const x=r()*16|0,y=r()*16|0;const k=(r()-.5)*30;for(let j=0;j<(sz||3);j++)P(x+(j%2),y+((j/2)|0),[c[0]+k,c[1]+k,c[2]+k]);}};
const STONE=[124,124,128];
function stoneP(P,r,c){noiseFill(P,r,c||STONE,26);for(let i=0;i<10;i++){const x=r()*16|0,y=r()*16|0,k=-22;P(x,y,[(c||STONE)[0]+k,(c||STONE)[1]+k,(c||STONE)[2]+k]);P(x+1,y,[(c||STONE)[0]+k,(c||STONE)[1]+k,(c||STONE)[2]+k]);}}
function oreP(col,base){return (P,r)=>{stoneP(P,r,base);for(let i=0;i<6;i++){const x=1+r()*13|0,y=1+r()*13|0;for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,1],[2,1]]){const k=(r()-.5)*40;P(x+dx,y+dy,[col[0]+k,col[1]+k,col[2]+k]);}}};}
tile('grass_top',(P,r)=>{noiseFill(P,r,[86,160,58],40);specks(P,r,[60,130,40],10,1);});
tile('dirt',(P,r)=>{noiseFill(P,r,[134,94,62],30);specks(P,r,[100,70,45],12,1);specks(P,r,[160,130,100],5,1);});
tile('grass_side',(P,r)=>{noiseFill(P,r,[134,94,62],30);specks(P,r,[100,70,45],10,1);for(let x=0;x<16;x++){const d=3+(r()*3|0);for(let y=0;y<d;y++){const k=(r()-.5)*40;P(x,y,[86+k,160+k,58+k]);}}});
tile('stone',(P,r)=>stoneP(P,r));
tile('cobble',(P,r)=>{noiseFill(P,r,[110,110,112],20);for(let i=0;i<9;i++){const cx=r()*16|0,cy=r()*16|0,rad=2+r()*2;const k=(r()-.5)*50;for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(x*x+y*y<rad*rad)P((cx+x)&15,(cy+y)&15,[132+k,132+k,134+k]);}for(let i=0;i<20;i++)P(r()*16|0,r()*16|0,[70,70,72]);});
tile('sand',(P,r)=>{noiseFill(P,r,[222,206,150],22);specks(P,r,[200,180,120],8,1);});
tile('gravel',(P,r)=>{noiseFill(P,r,[130,124,120],50);specks(P,r,[90,86,84],14,2);});
tile('water',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const w=Math.sin((x+y*0.5)*0.8)*10+(r()-.5)*10;P(x,y,[40+w,90+w,200+w]);}});
tile('log_side',(P,r)=>{for(let x=0;x<16;x++){const b=(r()-.5)*30+(x%4===0?-25:0);for(let y=0;y<16;y++){const k=b+(r()-.5)*14;P(x,y,[104+k,78+k,48+k]);}}});
tile('log_top',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-7.5,y-7.5);const ring=(d|0)%2?-14:0;const k=ring+(r()-.5)*10;if(d>7)P(x,y,[104+k,78+k,48+k]);else P(x,y,[186+k,150+k,98+k]);}});
tile('leaves',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(r()<.18){P(x,y,[0,0,0],0);continue;}const k=(r()-.5)*50;P(x,y,[50+k,128+k,40+k]);}});
const plankP=(c)=>(P,r)=>{for(let y=0;y<16;y++){const board=(y/4)|0;const off=board%2?5:11;const bk=(r()-.5)*16;for(let x=0;x<16;x++){let k=bk+(r()-.5)*12;if(y%4===3)k-=40;if(x===off&&y%4!==3)k-=30;P(x,y,[c[0]+k,c[1]+k,c[2]+k]);}}};
tile('planks',plankP([176,136,84]));tile('dplanks',plankP([96,66,40]));tile('bplanks',plankP([214,196,146]));
tile('glass',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const e=x===0||y===0||x===15||y===15;if(e)P(x,y,[210,236,245]);else if((x-y===4||x-y===5)&&x>3&&x<12)P(x,y,[255,255,255],210);else P(x,y,[0,0,0],0);}});
tile('brick',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=(y/4)|0,off=row%2?4:0;const mort=y%4===3||((x+off)%8===7);const k=(r()-.5)*24;if(mort)P(x,y,[190+k/2,186+k/2,176+k/2]);else P(x,y,[158+k,64+k,48+k]);}});
tile('stonebrick',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=(y/8)|0,off=row%2?8:0;const mort=y%8===7||((x+off)%16===15);const k=(r()-.5)*20;if(mort)P(x,y,[80,80,84]);else P(x,y,[128+k,128+k,132+k]);}});
tile('coal_ore',oreP([30,30,32]));tile('iron_ore',oreP([216,170,130]));tile('gold_ore',oreP([250,214,60]));tile('diamond_ore',oreP([90,230,230],[70,72,90]));
tile('bedrock',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const v=r();const c=v<.4?30:v<.7?60:v<.9?90:120;P(x,y,[c,c,c+4]);}});
tile('darkstone',(P,r)=>{noiseFill(P,r,[58,60,72],18);for(let y=0;y<16;y+=4)for(let x=0;x<16;x++)if(r()<.5)P(x,y,[44,46,56]);});
tile('brimrock',(P,r)=>{noiseFill(P,r,[118,36,34],34);specks(P,r,[80,20,22],14,2);specks(P,r,[150,60,50],6,1);});
tile('hellstone',(P,r)=>{noiseFill(P,r,[70,22,20],24);let x=r()*16,y=0;for(let i=0;i<40;i++){P(x|0,y|0,[255,170+r()*60,40]);P((x|0)+1,y|0,[240,110,20]);x+=(r()-.5)*3;y+=.5;if(y>15){y=0;x=r()*16;}x=(x+16)%16;}});
tile('emberite',oreP([255,120,30],[90,26,24]));
tile('lava',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const w=Math.sin(x*.7+Math.sin(y*.6)*2)*0.5+Math.sin(y*.5+x*.2)*.5;const t=w*.5+.5+(r()-.5)*.15;P(x,y,[230+t*25,90+t*120,10+t*40]);}});
tile('torch',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)P(x,y,[0,0,0],0);for(let y=6;y<16;y++){P(7,y,[120,86,50]);P(8,y,[100,70,40]);}for(const [x,y,c] of [[7,3,[255,240,140]],[8,3,[255,240,140]],[7,4,[255,200,60]],[8,4,[255,200,60]],[7,5,[255,140,30]],[8,5,[255,140,30]],[7,2,[255,255,200]]])P(x,y,c);for(let y=0;y<16;y++)for(let x=0;x<16;x++){}});
tile('torch_full',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*14;P(x,y,[120+k,86+k,50+k]);}for(let y=6;y<10;y++)for(let x=0;x<16;x++)P(x,y,[255,250-(y-6)*40,90+(9-y)*30]);for(let y=0;y<6;y++)for(let x=0;x<16;x++)P(x,y,[255,240,150]);});
tile('lamp',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const e=x<2||y<2||x>13||y>13;const k=(r()-.5)*20;if(e)P(x,y,[90+k,70+k,40+k]);else{const d=Math.hypot(x-7.5,y-7.5);P(x,y,[255,236-d*6+k,150-d*10+k]);}}});
tile('door',(P,r)=>{plankP([160,112,64])(P,r);for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(x<2||x>13||y<1||y>14){const k=(r()-.5)*10;P(x,y,[100+k,66+k,36+k]);}}for(let y=3;y<8;y++)for(let x=4;x<12;x++)P(x,y,[170,210,230]);P(12,10,[230,200,80]);P(12,11,[200,170,60]);});
tile('bed_top',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*14;if(y<5)P(x,y,[240+k/2,240+k/2,236+k/2]);else P(x,y,[196+k,40+k,48+k]);}});
tile('bed_side',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*14;if(y<6)P(x,y,[196+k,40+k,48+k]);else if(y<10)P(x,y,[236,236,230]);else P(x,y,[120+k,84+k,50+k]);}});
const WOOL=[['White',[236,236,236]],['Light Gray',[160,160,166]],['Gray',[76,80,86]],['Black',[26,26,30]],['Red',[176,40,36]],['Orange',[236,124,24]],['Yellow',[248,206,40]],['Lime',[120,196,30]],['Green',[76,104,30]],['Cyan',[22,144,150]],['Light Blue',[70,170,220]],['Blue',[50,56,160]],['Purple',[124,44,176]],['Magenta',[190,70,180]],['Pink',[240,140,170]],['Brown',[116,72,42]]];
WOOL.forEach(([n,c],i)=>tile('wool'+i,(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*16+(((x+y)%4===0)?-10:0);P(x,y,[c[0]+k,c[1]+k,c[2]+k]);}}));
const metalP=(c)=>(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){let k=(r()-.5)*10;if(x===0||y===0)k+=40;if(x===15||y===15)k-=40;if((x===3||x===12)&&(y===3||y===12))k-=30;P(x,y,[c[0]+k,c[1]+k,c[2]+k]);}};
tile('iron_block',metalP([214,214,220]));tile('gold_block',metalP([246,206,60]));tile('diamond_block',metalP([110,226,226]));
tile('bookshelf',(P,r)=>{plankP([150,110,66])(P,r);const cols=[[160,40,40],[40,80,160],[40,130,60],[200,170,60],[110,50,140]];for(const y0 of [1,9])for(let x=1;x<15;x++){const c=cols[(r()*5)|0];const h=5+(r()*2|0);for(let y=y0+6-h;y<y0+6;y++)P(x,y,c);}});
tile('snow',(P,r)=>noiseFill(P,r,[240,244,250],12));
tile('snow_side',(P,r)=>{noiseFill(P,r,[134,94,62],30);for(let x=0;x<16;x++){const d=3+(r()*3|0);for(let y=0;y<d;y++)P(x,y,[240,244,250]);}});
tile('sandstone',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*14+(y%5===4?-18:0);P(x,y,[214+k,196+k,140+k]);}});
tile('clay',(P,r)=>noiseFill(P,r,[160,166,180],14));
tile('marble',(P,r)=>{noiseFill(P,r,[234,232,226],8);let x=r()*16;for(let y=0;y<16;y++){P(x|0,y,[180,180,184]);x+=(r()-.5)*2;}});
tile('roof',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=(y/4)|0,off=row%2?2:0;const k=(r()-.5)*16-(y%4)*6+(((x+off)%4===0)?-30:0);P(x,y,[60+k,70+k,110+k]);}});
tile('tiles',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const g=x%8===0||y%8===0;const k=(r()-.5)*8;P(x,y,g?[150,150,150]:[236+k,236+k,232+k]);}});
tile('gloom',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.abs(x-7.5)+Math.abs(y-7.5);const k=(r()-.5)*30;P(x,y,d<6?[80+k,240,255]:[30,60+k,90]);}});
tile('voidstone',(P,r)=>{noiseFill(P,r,[26,16,40],16);specks(P,r,[80,40,120],6,1);});
tile('ice',(P,r)=>{noiseFill(P,r,[150,190,240],16);for(let i=0;i<4;i++){let x=r()*16,y=r()*16;for(let j=0;j<6;j++){P(x|0,y|0,[220,240,255]);x++;y+=r()-.3;}}});
tile('chest',(P,r)=>{plankP([150,100,50])(P,r);for(let x=0;x<16;x++){P(x,6,[60,40,20]);P(x,7,[60,40,20]);}P(7,7,[220,220,220]);P(8,7,[220,220,220]);P(7,8,[200,200,200]);P(8,8,[200,200,200]);});
tile('cactus',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*20+(x%4===0?-25:0);P(x,y,[50+k,130+k,50+k]);}for(let i=0;i<8;i++)P(r()*16|0,r()*16|0,[230,230,200]);});
tile('pumpkin',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*16+(x%5===0?-30:0);P(x,y,[226+k,130+k,20+k]);}});
tile('melon',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*16+((x+y*0)%3===0?-30:0);P(x,y,[90+k,160+k,40+k]);}});
tile('mossy',(P,r)=>{stoneP(P,r,[110,110,114]);for(let i=0;i<60;i++){const k=(r()-.5)*30;P(r()*16|0,r()*16|0,[70+k,120+k,50+k]);}});
tile('obsidian',(P,r)=>{noiseFill(P,r,[20,14,30],12);specks(P,r,[60,40,90],8,2);});
tile('flower',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*40;P(x,y,[86+k,160+k,58+k]);}for(let i=0;i<5;i++){const x=1+r()*13|0,y=1+r()*13|0;const c=[[230,40,40],[250,220,40],[200,90,230],[255,255,255]][i%4];P(x,y,c);P(x+1,y,c);P(x,y+1,c);P(x+1,y+1,c);}});
// ---- v1.2 city tiles ----
tile('path',(P,r)=>{noiseFill(P,r,[164,132,86],24);specks(P,r,[122,98,66],14,2);specks(P,r,[196,176,136],8,1);});
tile('hay_top',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*44;P(x,y,[216+k,182+k,64+k/2]);}for(let i=0;i<16;i++){P(i,0,[150,110,40]);P(i,15,[150,110,40]);P(0,i,[150,110,40]);P(15,i,[150,110,40]);}});
tile('hay_side',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*40+(y%3===0?-16:0);P(x,y,[216+k,182+k,64+k/2]);}for(const y of [3,12])for(let x=0;x<16;x++)P(x,y,[126,84,30]);});
tile('crops',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)P(x,y,[0,0,0],0);for(let x=0;x<16;x+=2){const h=9+(r()*6|0);for(let y=16-h;y<16;y++)P(x,y,y<16-h+4?[226,196,76]:[96+r()*30,156,48]);P(x+1,16-h+1,[236,206,90]);P(x+1,16-h+2,[220,186,70]);}});
tile('banner',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*14;P(x,y,[172+k,30+k,38+k]);}for(let x=0;x<16;x++){P(x,0,[240,200,60]);P(x,15,[240,200,60]);}
  for(const x of [5,8,11])for(let d=0;d<3;d++)P(x,5+d+(x===8?-1:0),[252,212,72]);for(let x=5;x<12;x++){P(x,8,[252,212,72]);P(x,9,[252,212,72]);}P(8,8,[60,140,230]);});
tile('fence',plankP([168,124,74]));
tile('demonbrick',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const row=(y/4)|0,off=row%2?4:0;const mort=y%4===3||((x+off)%8===7);const k=(r()-.5)*22;if(mort)P(x,y,[26,10,12]);else P(x,y,[94+k,22+k/2,26+k/2]);}});
tile('soulfire',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const e=x<2||y<2||x>13||y>13;const k=(r()-.5)*20;if(e)P(x,y,[34+k,18,30+k]);else{const d=Math.hypot(x-7.5,y-7.5);P(x,y,[255,190-d*16+k,60-d*6+k]);}}});
tile('crown',(P,r)=>{metalP([246,206,60])(P,r);for(let x=2;x<14;x+=3){P(x,7,[220,30,40]);P(x+1,7,[220,30,40]);P(x,8,[200,20,30]);P(x+1,8,[200,20,30]);}for(let x=0;x<16;x++){P(x,3,[255,236,140]);P(x,12,[180,140,30]);}});
tile('flamecrown',(P,r)=>{noiseFill(P,r,[30,18,34],12);for(let x=1;x<15;x+=3){for(let y=4;y<12;y++){const t=(y-4)/8;P(x,y,[255,120+t*120,30]);P(x+1,y,[255,90+t*100,20]);}}for(let x=0;x<16;x++){P(x,13,[90,20,20]);P(x,14,[90,20,20]);}});
// ---- v1.3 tiles: snow biome, cooking, item sprites ----
tile('snowpure',(P,r)=>{noiseFill(P,r,[244,247,252],10);specks(P,r,[220,228,240],6,1);});
tile('pine',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(r()<.12){P(x,y,[0,0,0],0);continue;}const k=(r()-.5)*36;P(x,y,(r()<.12)?[236,242,250]:[34+k,84+k,62+k]);}});
tile('spruce_side',(P,r)=>{for(let x=0;x<16;x++){const b=(r()-.5)*24+(x%3===0?-20:0);for(let y=0;y<16;y++){const k=b+(r()-.5)*12;P(x,y,[74+k,52+k,34+k]);}}});
tile('spruce_top',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-7.5,y-7.5);const k=((d|0)%2?-12:0)+(r()-.5)*10;P(x,y,d>7?[74+k,52+k,34+k]:[150+k,116+k,76+k]);}});
tile('campfire',(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)P(x,y,[0,0,0],0);for(let y=10;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*16;P(x,y,(y===12||y===15)?[70+k,48,28]:[110+k,78+k,46+k]);}
  for(let y=0;y<10;y++)for(let x=3;x<13;x++){const w=Math.abs(x-7.5)/5+ (10-y)/12;if(r()>w)P(x,y,[255,120+(y*12)+r()*40,20+r()*30]);}});
tile('campfire_top',(P,r)=>{noiseFill(P,r,[60,44,30],20);for(let i=0;i<40;i++){const a=r()*6.28,d=r()*5;P(8+Math.cos(a)*d|0,8+Math.sin(a)*d|0,[255,140+r()*100,30]);}});
tile('furnace_front',(P,r)=>{stoneP(P,r,[120,120,124]);for(let y=8;y<14;y++)for(let x=4;x<12;x++)P(x,y,y>10?[255,140+r()*80,30]:[30,26,24]);for(let x=3;x<13;x++){P(x,7,[70,70,74]);P(x,14,[70,70,74]);}});
tile('furnace_top',(P,r)=>{stoneP(P,r,[110,110,114]);for(let x=0;x<16;x++){P(x,0,[80,80,84]);P(x,15,[80,80,84]);P(0,x,[80,80,84]);P(15,x,[80,80,84]);}});
const clr=P=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)P(x,y,[0,0,0],0);};
const LN=(P,x0,y0,x1,y1,c,w)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);P(x,y,c);if(w>1){P(x+1,y,c);}if(w>2)P(x,y+1,c);}};
const shade=(c,k)=>[c[0]+k,c[1]+k,c[2]+k];
function itemTile(name,fn){tile(name,(P,r,G)=>{clr(P);fn(P,r);
  // dark outline around the sprite
  const a=[];for(let y=0;y<16;y++)for(let x=0;x<16;x++)a.push(G(x,y)[3]);for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(a[y*16+x])continue;if((x>0&&a[y*16+x-1])||(x<15&&a[y*16+x+1])||(y>0&&a[y*16+x-16])||(y<15&&a[y*16+x+16]))P(x,y,[30,22,18],200);}});}
const meatT=(c,m,bone)=>((P,r)=>{for(let y=3;y<14;y++)for(let x=2;x<14;x++){const dx=(x-7.5)/5.6,dy=(y-8.5)/4.8;if(dx*dx+dy*dy<1){const k=(r()-.5)*20;P(x,y,(r()<.18)?shade(m,k):shade(c,k));}}if(bone){for(let i=0;i<4;i++){P(12+i%2,4+(i>>1),[240,236,224]);}P(14,3,[250,248,240]);P(13,3,[250,248,240]);}});
[['beef_r',[196,52,58],[236,150,150],1],['beef_c',[124,70,40],[160,100,60],1],['pork_r',[236,140,150],[250,200,200],0],['pork_c',[196,120,70],[230,170,110],0],['chicken_r',[244,196,170],[255,230,214],1],['chicken_c',[206,140,70],[236,184,110],1],['mutton_r',[200,64,70],[250,220,220],1],['mutton_c',[150,80,50],[190,120,70],1]].forEach(([n,c,m,b])=>itemTile(n,meatT(c,m,b)));
const fishT=(c,c2)=>(P,r)=>{for(let y=5;y<12;y++)for(let x=2;x<12;x++){const dx=(x-7)/5,dy=(y-8.5)/3.5;if(dx*dx+dy*dy<1)P(x,y,y<8?shade(c,10):(y>9?c2:c));}for(let i=0;i<4;i++){for(let y=8-i;y<=9+i;y++)P(11+i,y,c2);}P(4,7,[20,20,20]);P(6,8,shade(c,-30));};
itemTile('fish_r',fishT([110,160,200],[200,220,236]));itemTile('fish_c',fishT([196,140,80],[226,180,120]));
itemTile('bone',(P,r)=>{LN(P,4,11,11,4,[236,232,220],2);for(const [x,y] of [[2,11],[3,12],[4,13],[2,12],[11,2],[12,3],[13,4],[12,2]])P(x,y,[250,248,240]);});
itemTile('wheat',(P,r)=>{for(let i=0;i<4;i++){const x=4+i*2;LN(P,x,14,x+1,4,[200,170,60],1);for(let y=3;y<8;y++)P(x+(y%2),y,[236,206,90]);}LN(P,3,10,12,10,[150,110,40],1);});
const bucketT=(fill)=>(P,r)=>{for(let y=5;y<15;y++){const w=4+((15-y)/3|0);for(let x=8-w;x<8+w;x++){const k=(r()-.5)*14+(x<8-w+2?24:x>8+w-3?-30:0);P(x,y,[150+k,152+k,160+k]);}}for(let x=3;x<13;x++)P(x,4,[90,92,100]);for(let x=4;x<12;x++)P(x,1+Math.round(Math.abs(x-7.5)/2),[90,92,100]);
  if(fill)for(let x=4;x<12;x++){P(x,5,fill);P(x,6,shade(fill,-25));}};
itemTile('bucket',bucketT(null));itemTile('bucket_w',bucketT([50,110,230]));itemTile('bucket_l',bucketT([255,130,20]));
const swordT=(bl)=>(P,r)=>{LN(P,5,10,13,2,bl,2);LN(P,6,9,13,2,shade(bl,40),1);LN(P,3,8,7,12,[90,70,40],2);LN(P,2,13,5,10,[110,74,40],2);P(1,14,[60,40,20]);};
[['sword_wood',[170,130,80]],['sword_stone',[136,136,140]],['sword_iron',[214,216,224]],['sword_diamond',[100,230,230]],['sword_ember',[255,120,30]]].forEach(([n,c])=>itemTile(n,swordT(c)));
itemTile('axe',(P,r)=>{LN(P,3,14,11,3,[120,84,46],2);for(let y=2;y<8;y++)for(let x=8;x<14;x++)if(x+y>11&&x-y<10)P(x,y,shade([210,212,220],(x-8)*6));});
itemTile('spear',(P,r)=>{LN(P,1,15,11,5,[130,94,52],2);for(const [x,y] of [[11,4],[12,4],[12,3],[13,3],[13,2],[14,1],[12,5],[11,5],[13,4]])P(x,y,[220,222,230]);});
itemTile('bow',(P,r)=>{for(let i=0;i<=20;i++){const a=-0.9+i*0.09;const x=Math.round(4+Math.cos(a)*9),y=Math.round(8+Math.sin(a)*7);P(x-3,y,[140,90,40]);P(x-2,y,[110,70,30]);}LN(P,5,1,5,15,[230,230,230],1);});
itemTile('arrow',(P,r)=>{LN(P,3,13,12,4,[150,110,60],1);for(const [x,y] of [[12,3],[13,3],[13,4],[12,4],[14,2]])P(x,y,[200,200,210]);for(const [x,y] of [[2,12],[3,14],[2,14],[4,14],[2,13]])P(x,y,[240,240,240]);});
itemTile('rod',(P,r)=>{LN(P,2,14,12,2,[130,90,50],1);LN(P,12,2,14,12,[240,240,240],1);P(14,13,[230,40,40]);P(14,12,[230,40,40]);});
itemTile('net',(P,r)=>{LN(P,1,15,6,10,[130,90,50],2);for(let y=2;y<10;y++)for(let x=6;x<14;x++)if((x+y)%3===0||(x-y+30)%3===0)P(x,y,[230,230,220]);for(let x=6;x<14;x++){P(x,1,[120,90,60]);P(x,10,[120,90,60]);}});
const ARMC={leather:[150,96,56],iron:[206,208,216],diamond:[100,226,226],ember:[240,110,30]};
for(const [m,c] of Object.entries(ARMC)){
  itemTile('helm_'+m,(P,r)=>{for(let y=3;y<11;y++)for(let x=3;x<13;x++){if(y>6&&x>5&&x<10)continue;P(x,y,shade(c,(y<5?30:0)+(r()-.5)*12));}});
  itemTile('chest_'+m,(P,r)=>{for(let y=2;y<14;y++)for(let x=1;x<15;x++){const arm=x<4||x>11;if(arm&&y>8)continue;if(y<4&&x>5&&x<10)continue;P(x,y,shade(c,(arm?-20:0)+(r()-.5)*12));}});
  itemTile('legs_'+m,(P,r)=>{for(let y=2;y<15;y++)for(let x=3;x<13;x++){if(y>5&&x>6&&x<9)continue;P(x,y,shade(c,(y<4?20:-10)+(r()-.5)*12));}});
  itemTile('boots_'+m,(P,r)=>{for(let y=7;y<14;y++)for(let x=1;x<15;x++){if(x>6&&x<9)continue;if(y<10&&(x<3||(x>9&&x<12)))continue;P(x,y,shade(c,(y>12?-30:0)+(r()-.5)*12));}});}
// ---- blocks ----
const B=[],BN={};
function blk(key,name,o){const id=B.length;o=Object.assign({solid:true,opaque:true,cut:false,liquid:0,emit:0,hard:1,cat:'Build',price:0,coin:0,shape:null,place:true},o);o.id=id;o.key=key;o.name=name;
  const t=o.t||key;o.tx=[TEX[o.side||t],TEX[o.side||t],TEX[o.top||t],TEX[o.bot||o.top||t],TEX[o.side||t],TEX[o.side||t]];
  if(o.tx.some(v=>v===undefined))throw new Error('tex '+key);B.push(o);BN[key]=id;return id;}
B.push({id:0,key:'air',name:'Air',solid:false,opaque:false,place:false});BN.air=0;
blk('grass','Grass Block',{top:'grass_top',side:'grass_side',bot:'dirt',hard:.7,cat:'Nature',price:2,drop:'dirt'});
blk('dirt','Dirt',{hard:.6,cat:'Nature',price:1});
blk('stone','Stone',{hard:1.8,cat:'Nature',price:2,drop:'cobble'});
blk('sand','Sand',{hard:.5,cat:'Nature',price:1});
blk('water','Water',{solid:false,opaque:false,liquid:1,hard:0,cat:'Nature',price:5,place:true,nobreak:true});
blk('log','Wood Log',{side:'log_side',top:'log_top',hard:1.4,cat:'Wood',price:3});
blk('leaves','Leaves',{opaque:false,cut:true,hard:.25,cat:'Nature',price:1});
blk('planks','Oak Planks',{hard:1.2,cat:'Wood',price:2});
blk('glass','Glass',{opaque:false,cut:true,hard:.35,cat:'Build',price:3});
blk('brick','Brick',{hard:1.8,cat:'Build',price:4});
blk('stonebrick','Stone Brick',{hard:1.8,cat:'Build',price:3});
blk('cobble','Cobblestone',{hard:1.8,cat:'Build',price:1});
blk('coal_ore','Coal Ore',{hard:2.4,cat:'Ores',coin:5,price:20});
blk('iron_ore','Iron Ore',{hard:2.8,cat:'Ores',coin:15,price:50});
blk('gold_ore','Gold Ore',{hard:3,cat:'Ores',coin:40,price:120});
blk('diamond_ore','Diamond Ore',{hard:3.5,cat:'Ores',coin:150,price:400});
blk('bedrock','Bedrock',{hard:Infinity,cat:'Hell',unbreak:true,price:0});
blk('darkstone','Darkstone',{hard:2.6,cat:'Nature',price:2});
blk('brimrock','Brimrock',{hard:1.0,cat:'Hell',price:2});
blk('hellstone','Hellstone',{hard:2,emit:1,cat:'Hell',coin:8,price:15});
blk('emberite','Emberite Ore',{hard:3.5,cat:'Ores',coin:300,price:800,emit:1});
blk('lava','Lava',{solid:false,opaque:false,liquid:2,emit:1,hard:0,cat:'Hell',price:10,nobreak:true});
blk('torch','Torch',{solid:false,opaque:false,cut:true,shape:[7/16,0,7/16,9/16,10/16,9/16],t:'torch_full',top:'torch_full',emit:1,light:1,hard:.05,cat:'Light',price:1});
blk('lamp','Glow Lamp',{emit:1,light:1,hard:.5,cat:'Light',price:6});
blk('doorx','Door',{opaque:false,cut:true,shape:[0,0,13/32,1,1,19/32],t:'door',top:'planks',hard:1,cat:'Furniture',price:8,door:1});
blk('doorz','Door (turned)',{opaque:false,cut:true,shape:[13/32,0,0,19/32,1,1],t:'door',top:'planks',hard:1,cat:'Furniture',price:8,door:1,hide:true});
blk('doorxo','Door (open)',{solid:false,opaque:false,cut:true,shape:[0,0,0,3/16,1,1],t:'door',top:'planks',hard:1,door:1,hide:true});
blk('doorzo','Door (open)',{solid:false,opaque:false,cut:true,shape:[0,0,0,1,1,3/16],t:'door',top:'planks',hard:1,door:1,hide:true});
blk('bed','Bed',{opaque:false,shape:[0,0,0,1,9/16,1],top:'bed_top',side:'bed_side',bot:'planks',hard:.6,cat:'Furniture',price:20,bed:1});
blk('gravel','Gravel',{hard:.6,cat:'Nature',price:1});
blk('snow','Snow',{top:'snow',side:'snow_side',bot:'dirt',hard:.4,cat:'Nature',price:1});
blk('iron_block','Iron Block',{hard:3,cat:'Fancy',price:120});
blk('gold_block','Gold Block',{hard:3,cat:'Fancy',price:300});
blk('diamond_block','Diamond Block',{hard:3.5,cat:'Fancy',price:1000});
blk('bookshelf','Bookshelf',{side:'bookshelf',top:'planks',hard:1,cat:'Furniture',price:10});
blk('dplanks','Dark Planks',{hard:1.2,cat:'Wood',price:2});
blk('bplanks','Birch Planks',{hard:1.2,cat:'Wood',price:2});
blk('sandstone','Sandstone',{hard:1.2,cat:'Build',price:2});
blk('clay','Clay',{hard:.8,cat:'Build',price:2});
blk('marble','Marble',{hard:1.8,cat:'Fancy',price:6});
blk('roof','Roof Tiles',{hard:1.4,cat:'Build',price:3});
blk('tiles','White Tiles',{hard:1.4,cat:'Build',price:3});
blk('gloom','Gloomcrystal',{emit:1,light:1,hard:1.5,cat:'Light',coin:25,price:30});
blk('voidstone','Voidstone',{hard:4,cat:'Fancy',price:20});
blk('ice','Ice',{hard:.5,cat:'Nature',price:2});
blk('chest','Chest',{side:'chest',top:'planks',hard:1,cat:'Furniture',price:12});
blk('cactus','Cactus',{hard:.4,cat:'Nature',price:2});
blk('pumpkin','Pumpkin',{side:'pumpkin',top:'pumpkin',hard:.8,cat:'Nature',price:4});
blk('melon','Melon',{hard:.8,cat:'Nature',price:4});
blk('mossy','Mossy Stone',{hard:1.8,cat:'Build',price:3});
blk('obsidian','Obsidian',{hard:5,cat:'Fancy',price:30});
blk('flowers','Flower Bed',{top:'flower',side:'grass_side',bot:'dirt',hard:.7,cat:'Nature',price:3});
WOOL.forEach(([n],i)=>blk('wool'+i,n+' Wool',{t:'wool'+i,hard:.6,cat:'Wool',price:2}));
// ---- v1.2 city blocks (appended so 1.0/1.1 block ids stay the same) ----
blk('path','Town Path',{top:'path',side:'dirt',bot:'dirt',hard:.6,cat:'City',price:1,drop:'dirt'});
blk('hay','Hay Bale',{top:'hay_top',side:'hay_side',hard:.5,cat:'City',price:3});
blk('crops','Wheat Crops',{extra:'wheat',solid:false,opaque:false,cut:true,shape:[0,0,0,1,13/16,1],t:'crops',top:'crops',hard:.05,cat:'City',price:2});
blk('banner','Royal Banner',{hard:.6,cat:'City',price:25});
blk('fence','Fence Post',{opaque:false,shape:[6/16,0,6/16,10/16,1,10/16],t:'fence',top:'fence',hard:1,cat:'City',price:2});
blk('demonbrick','Demon Brick',{hard:2,cat:'Hell',price:5});
blk('soulfire','Soulfire Lamp',{emit:1,light:1,hard:.5,cat:'Light',price:12});
blk('crown','Crown Block',{top:'crown',side:'crown',hard:2,cat:'City',price:500});
blk('flamecrown','Flame Crown Block',{emit:1,hard:2,cat:'Hell',price:800});
// ---- v1.3 blocks (appended) ----
blk('snowlayer','Snow Layer',{solid:false,opaque:false,cut:true,shape:[0,0,0,1,2/16,1],t:'snowpure',top:'snowpure',hard:.1,cat:'Nature',price:1});
blk('snowblock','Snow Block',{t:'snowpure',hard:.4,cat:'Nature',price:1});
blk('spruce','Spruce Log',{side:'spruce_side',top:'spruce_top',hard:1.4,cat:'Wood',price:3});
blk('pineleaves','Pine Needles',{t:'pine',opaque:false,cut:true,hard:.25,cat:'Nature',price:1});
blk('campfire','Campfire',{opaque:false,shape:[0,0,0,1,7/16,1],t:'campfire',top:'campfire_top',bot:'campfire_top',emit:1,light:1,hard:.6,cat:'Furniture',price:3,cook:1});
blk('furnace','Furnace',{side:'furnace_front',top:'furnace_top',hard:2,cat:'Furniture',price:5,cook:1});
// ---- v1.3 items (never placed in the world; ids appended so saves stay compatible) ----
function itm(key,name,o){return blk(key,name,Object.assign({item:true,place:false,solid:false,opaque:false,t:key,cat:'Items'},o));}
const FOODS=[['beef','Beef',3,8],['pork','Porkchop',3,8],['chicken','Chicken',2,6],['mutton','Mutton',2,6],['fish','Fish',2,6]];
for(const [k,n,hr,hc] of FOODS){itm(k+'_r','Raw '+n,{cat:'Food',food:hr,cooksTo:k+'_c',price:4});itm(k+'_c','Cooked '+n,{cat:'Food',food:hc,price:10});}
itm('bone','Bone',{cat:'Food',price:3});itm('wheat','Wheat',{cat:'Food',price:2});
itm('bucket','Bucket',{cat:'Tools',price:40});itm('bucket_w','Water Bucket',{cat:'Tools',price:50});itm('bucket_l','Lava Bucket',{cat:'Tools',price:80});
itm('rod','Fishing Rod',{cat:'Tools',price:60});itm('net','Fishing Net',{cat:'Tools',price:100});
const WEAPONS={sword_wood:['Wooden Sword',4,.45,6,30],sword_stone:['Stone Sword',5,.45,6.5,120],sword_iron:['Iron Sword',7,.45,7,500],sword_diamond:['Diamond Sword',9,.42,7.5,2000],sword_ember:['Emberite Sword',12,.4,8,6000],
  axe:['Battle Axe',8,.75,9,450],spear:['Spear',6,.55,7,400],bow:['Bow',6,.6,6,600]};
for(const k in WEAPONS){const [n,dmg,cd,kb,pr]=WEAPONS[k];itm(k,n,{cat:'Gear',weapon:{dmg,cd,kb,reach:k==='spear'?5.5:3.5,kind:k.split('_')[0]},price:pr});}
itm('arrow','Arrow',{cat:'Gear',price:3});
const ARMOR_SLOTS=[['helm','Helmet'],['chest','Chestplate'],['legs','Leggings'],['boots','Boots']];
const ARMOR_MATS=[['leather','Leather',[1,2,1,1],[40,70,55,35],0x96603a],['iron','Iron',[2,5,4,1],[250,500,400,220],0xced0d8],['diamond','Diamond',[3,7,5,3],[1200,2500,1900,1000],0x64e2e2],['ember','Emberite',[4,8,6,3],[3500,7000,5200,3000],0xf06e1e]];
for(const [m,mn,def,pr] of ARMOR_MATS)ARMOR_SLOTS.forEach(([s,sn],i)=>itm(s+'_'+m,mn+' '+sn,{cat:'Gear',armor:{slot:s,def:def[i],mat:m},price:pr[i]}));
// ---- v1.7: TNT, fire, flint (appended ids, so older saves keep their block ids) ----
const tntSide=(base,band,ink)=>(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*18;const bd=y>=5&&y<=10;P(x,y,bd?shade(band,k/2):shade(base,k-(x%4===0?40:0)));}
  const T=[[0,0],[1,0],[2,0],[1,1],[1,2],[1,3]],N=[[0,0],[0,1],[0,2],[0,3],[1,1],[2,2],[3,0],[3,1],[3,2],[3,3]];
  for(const [dx,dy] of T){P(2+dx,6+dy,ink);P(11+dx,6+dy,ink);}for(const [dx,dy] of N)P(6+dx,6+dy,ink);};
tile('tnt_side',tntSide([200,40,30],[236,232,224],[24,20,20]));tile('mtnt_side',tntSide([70,24,100],[250,206,40],[200,20,20]));
const tntTop=(c)=>(P,r)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=(r()-.5)*20;const d=Math.hypot(x-7.5,y-7.5);P(x,y,d<2.2?[40,34,30]:d<3.2?[230,226,210]:shade(c,k));}};
tile('tnt_top',tntTop([186,44,34]));tile('mtnt_top',tntTop([74,28,104]));tile('tnt_bot',(P,r)=>noiseFill(P,r,[120,40,34],16));
tile('fire',(P,r)=>{clr(P);for(let x=0;x<16;x++){const h=7+Math.round(Math.sin(x*1.3)*3+r()*5);for(let y=16-h;y<16;y++){const t=(y-(16-h))/h;if(t<.12&&r()<.5)continue;P(x,y,t<.35?[255,90+t*200,20]:t<.7?[255,170+t*60,40]:[255,236,120]);}}});
tile('clear',(P)=>clr(P));
itemTile('flint',(P,r)=>{for(let y=3;y<14;y++)for(let x=3;x<13;x++){if(x+y<9||x-y>6||y-x>6||x+y>23)continue;P(x,y,shade([60,62,70],(r()-.5)*24+(x<y?18:0)));}});
itemTile('flint_steel',(P,r)=>{for(let a=0;a<=20;a++){const t=Math.PI*.15+a/20*Math.PI*1.2;const x=Math.round(9+Math.cos(t)*4.5),y=Math.round(6+Math.sin(t)*4.5);P(x,y,[214,216,224]);P(x+1,y,[160,162,170]);}
  for(let y=8;y<14;y++)for(let x=2;x<8;x++)if(x+y>11&&x+y<19)P(x,y,shade([60,62,70],(r()-.5)*24));P(9,12,[255,200,60]);P(10,11,[255,240,140]);});
itemTile('gunpowder',(P,r)=>{for(let y=6;y<14;y++)for(let x=2;x<14;x++){const dx=(x-7.5)/6,dy=(y-13)/7;if(dx*dx+dy*dy<1)P(x,y,r()<.15?[30,30,30]:shade([92,92,96],(r()-.5)*40));}});
blk('tnt','TNT',{side:'tnt_side',top:'tnt_top',bot:'tnt_bot',hard:.05,cat:'TNT',price:25,tnt:1});
blk('megatnt','Mega TNT',{side:'mtnt_side',top:'mtnt_top',bot:'tnt_bot',hard:.05,cat:'TNT',price:120,tnt:2});
blk('fire','Fire',{solid:false,opaque:false,cut:true,shape:[.02,0,.02,.98,.94,.98],t:'fire',top:'clear',bot:'clear',emit:1,hard:0,cat:'TNT',place:false,hide:true,nodrop:true});
itm('flint','Flint',{cat:'TNT',price:3});itm('flint_steel','Flint & Steel',{cat:'TNT',price:30});itm('gunpowder','Gunpowder',{cat:'TNT',price:8});
const NB=B.length;if(NB>255)throw new Error('too many block ids');
const SOLID=new Uint8Array(256),OPQ=new Uint8Array(256),LIQ=new Uint8Array(256),EMIT=new Uint8Array(256),LIGHT=new Uint8Array(256);
B.forEach(b=>{SOLID[b.id]=b.solid?1:0;OPQ[b.id]=b.opaque?1:0;LIQ[b.id]=b.liquid||0;EMIT[b.id]=b.emit?1:0;LIGHT[b.id]=b.light?1:0;});
const PLACEABLE=B.filter(b=>b.id&&b.place&&!b.hide).map(b=>b.id);
const ITEM_IDS=B.filter(b=>b.item).map(b=>b.id);const INVLIST=PLACEABLE.concat(ITEM_IDS);
const CATS=['Build','Wood','Wool','Furniture','Light','Fancy','Nature','Ores','Hell','City','Food','Tools','Gear','TNT'];
const TOOLS=[{key:'hand',name:'Hand',speed:1,price:0},{key:'wood',name:'Wooden Pickaxe',speed:2,price:50},{key:'stone',name:'Stone Pickaxe',speed:3.2,price:250},{key:'iron',name:'Iron Pickaxe',speed:5,price:900},{key:'diamond',name:'Diamond Pickaxe',speed:8,price:3500}];
// ---- block icons (isometric, for UI) ----
const ICON={};
function blockIcon(id){if(ICON[id])return ICON[id];const b=B[id];const S=48,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const tsrc=t=>[(t%ATW)*TS,((t/ATW)|0)*TS];
  const face=(t,a,bb,cc,d,e,f,shade)=>{const [sx,sy]=tsrc(t);g.setTransform(a/16,bb/16,cc/16,d/16,e,f);g.drawImage(atlas,sx,sy,16,16,0,0,16,16);if(shade){g.fillStyle='rgba(0,0,0,'+shade+')';g.fillRect(0,0,16,16);}};
  if(b.item){const [sx,sy]=tsrc(b.tx[0]);g.drawImage(atlas,sx,sy,16,16,4,4,40,40);}
  else if(b.shape&&!b.bed){const [sx,sy]=tsrc(b.key==='torch'?TEX.torch:b.tx[0]);g.drawImage(atlas,sx,sy,16,16,6,2,36,44);}
  else{const h=b.bed?0.56:1;const top=S/2-(S/2)*h;
    face(b.tx[2],S/2,-S/4,S/2,S/4,0,S/4+(1-h)*S/2,0);
    face(b.tx[1],S/2,S/4,0,S/2*h,0,S/4+(1-h)*S/2,.22);
    face(b.tx[0],S/2,-S/4,0,S/2*h,S/2,S/2+(1-h)*S/2,.4);}
  g.setTransform(1,0,0,1,0,0);ICON[id]=c.toDataURL();return ICON[id];}
// ===== noise & world generation =====
function hash3(x,y,z,s){let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(z|0,1274126177)+Math.imul(s|0,1911520717)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
const sm=t=>t*t*(3-2*t);
function vnoise2(x,z,s){const xi=Math.floor(x),zi=Math.floor(z),xf=sm(x-xi),zf=sm(z-zi);
  const a=hash3(xi,0,zi,s),b=hash3(xi+1,0,zi,s),c=hash3(xi,0,zi+1,s),d=hash3(xi+1,0,zi+1,s);return (a+(b-a)*xf+(c-a)*zf+(a-b-c+d)*xf*zf)*2-1;}
function vnoise3(x,y,z,s){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=sm(x-xi),yf=sm(y-yi),zf=sm(z-zi);
  const L=(a,b,t)=>a+(b-a)*t;
  const c00=L(hash3(xi,yi,zi,s),hash3(xi+1,yi,zi,s),xf),c10=L(hash3(xi,yi+1,zi,s),hash3(xi+1,yi+1,zi,s),xf),c01=L(hash3(xi,yi,zi+1,s),hash3(xi+1,yi,zi+1,s),xf),c11=L(hash3(xi,yi+1,zi+1,s),hash3(xi+1,yi+1,zi+1,s),xf);
  return L(L(c00,c10,yf),L(c01,c11,yf),zf)*2-1;}
function fbm2(x,z,s,o){let v=0,a=1,f=1,n=0;for(let i=0;i<o;i++){v+=vnoise2(x*f,z*f,s+i*31)*a;n+=a;a*=.5;f*=2;}return v/n;}
function fbm3(x,y,z,s){return vnoise3(x,y,z,s)*.67+vnoise3(x*2.1,y*2.1,z*2.1,s+7)*.33;}
let SEED=1;
function surfH(x,z){const c=fbm2(x/220,z/220,SEED+5,2);const hills=fbm2(x/70,z/70,SEED,4);const m=Math.max(0,fbm2(x/160,z/160,SEED+9,3));
  return Math.round(SEA+2+c*10+hills*9+m*m*90);}
// v1.3 snow biome. SNOW_OFF: chunks a pre-1.3 save already explored (kept snow-free so old land does not change)
const SNOW_OFF=new Set();
function coldAt(x,z){return fbm2(x/260,z/260,SEED+77,2)>.26;}
function snowyChunk(cx,cz){return !SNOW_OFF.has(cx+','+cz);}
function nearestSnow(x,z,maxR){maxR=maxR||3000;for(let r=0;r<=maxR;r+=24){const n=Math.max(1,Math.round(r*6.28/24));for(let i=0;i<n;i++){const a=i/n*6.283;const px=Math.round(x+Math.cos(a)*r),pz=Math.round(z+Math.sin(a)*r);
  if(coldAt(px,pz)&&coldAt(px+12,pz)&&coldAt(px-12,pz)&&coldAt(px,pz+12)&&coldAt(px,pz-12)&&snowyChunk(px>>4,pz>>4)&&surfH(px,pz)>SEA+1&&!cityAt(px,pz,'s'))return {x:px,z:pz};}}return null;}
function genChunk(cx,cz){const coldOK=snowyChunk(cx,cz);
  const d=new Uint8Array(CS*CS*H);const x0=cx*CS,z0=cz*CS;
  // coarse 3D grids (step 4) for caves and hell caverns
  const GX=5,GY=H/4+1,cave=new Float32Array(GX*GX*GY),hell=new Float32Array(GX*GX*12);
  for(let gy=0;gy<GY;gy++)for(let gz=0;gz<GX;gz++)for(let gx=0;gx<GX;gx++){const wx=x0+gx*4,wy=gy*4,wz=z0+gz*4;
    if(wy>=HELL_TOP-4)cave[(gy*GX+gz)*GX+gx]=fbm3(wx/28,wy/18,wz/28,SEED+101);
    if(gy<12)hell[(gy*GX+gz)*GX+gx]=fbm3(wx/34,wy/16,wz/34,SEED+202);}
  const tri=(g,x,y,z)=>{const gx=x>>2,gy=y>>2,gz=z>>2,fx=(x&3)/4,fy=(y&3)/4,fz=(z&3)/4;const I=(a,b,c)=>g[((gy+b)*GX+gz+c)*GX+gx+a];
    const L=(a,b,t)=>a+(b-a)*t;return L(L(L(I(0,0,0),I(1,0,0),fx),L(I(0,1,0),I(1,1,0),fx),fy),L(L(I(0,0,1),I(1,0,1),fx),L(I(0,1,1),I(1,1,1),fx),fy),fz);};
  const hm=new Int16Array(256);
  for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){const wx=x0+x,wz=z0+z;const h=Math.min(H-12,surfH(wx,wz));hm[z*CS+x]=h;
    const cold=coldOK&&coldAt(wx,wz);const beach=h<=SEA+1&&!cold,snowy=h>SEA+44||cold,desert=fbm2(wx/300,wz/300,SEED+44,2)>.35&&!snowy;
    const gpatch=h<SEA-3&&!cold&&fbm2(wx/18,wz/18,SEED+66,2)>.12; // v1.7: gravel patches on lake and sea floors
    for(let y=0;y<H;y++){let id=0;const i=(y*CS+z)*CS+x;
      if(y===0||(y===1&&hash3(wx,1,wz,SEED)<.5)){d[i]=BN.bedrock;continue;}
      if(y<=HELL_TOP){
        const sh=(y-21)/19;const n=tri(hell,x,y,z);const tr=y>HELL_TOP-4?(HELL_TOP-y)/4:1;
        if(n>-0.22+1.25*sh*sh&&y>1&&tr>0.3){id=y<=9?BN.lava:0;}
        else{id=BN.brimrock;const r=hash3(wx,y,wz,SEED+3);if(r<.006)id=BN.emberite;else if(fbm3(wx/6,y/6,wz/6,SEED+55)>.42)id=BN.hellstone;
          if(y>HELL_TOP-3&&r>.5)id=BN.darkstone;}
        d[i]=id;continue;}
      if(y<=h){
        if(gpatch&&y>h-2)id=BN.gravel;else if(y===h)id=snowy?BN.snow:(beach||desert)?BN.sand:BN.grass;
        else if(y>h-4)id=(beach||desert)?(y>h-3?BN.sand:BN.sandstone):BN.dirt;
        else{id=(y<DEEP_TOP+(hash3(wx,y,wz,SEED+8)*4|0))?BN.darkstone:BN.stone;
          const r=hash3(wx>>1,y>>1,wz>>1,SEED+11),r2=hash3(wx,y,wz,SEED+12);
          if(r2<.6){if(r<.02&&y>50)id=BN.coal_ore;else if(r>.985&&y<110)id=BN.iron_ore;else if(r>.4&&r<.406&&y<75)id=BN.gold_ore;else if(r>.7&&r<.704&&y<64&&y>HELL_TOP+2)id=BN.diamond_ore;}
          if(y<HELL_TOP+8&&hash3(wx,y,wz,SEED+13)<.03)id=BN.brimrock;
          // v1.7: gravel pockets in the stone (exposed in caves)
          if((id===BN.stone||id===BN.darkstone)&&hash3(wx>>2,y>>2,wz>>2,SEED+66)<.022&&hash3(wx,y,wz,SEED+67)<.8)id=BN.gravel;}
        // caves
        if(y>HELL_TOP+1&&y<h-1+(h>SEA+3?2:-6)){const n=tri(cave,x,y,z);const thr=y<DEEP_TOP?0.22:0.30;if(n>thr)id=0;}
      } else if(y<=SEA)id=(y===SEA&&cold)?BN.ice:BN.water;
      d[i]=id;}}
  // deep-dark glow crystals on cave floors
  for(let k=0;k<6;k++){const x=hash3(cx,k,cz,SEED+20)*CS|0,z=hash3(cx,k,cz,SEED+21)*CS|0;for(let y=HELL_TOP+3;y<DEEP_TOP;y++){const i=(y*CS+z)*CS+x;if(d[i]===0&&OPQ[d[i-CS*CS]]){d[i]=BN.gloom;break;}}}
  // trees & cacti
  for(let z=2;z<CS-2;z++)for(let x=2;x<CS-2;x++){const wx=x0+x,wz=z0+z,h=hm[z*CS+x];const top=d[(h*CS+z)*CS+x];
    const r=hash3(wx,7,wz,SEED+30);
    if(top===BN.grass&&r<.014&&h+8<H){const th=4+(hash3(wx,8,wz,SEED)*3|0);
      for(let ly=h+th-2;ly<=h+th+1;ly++){const rad=ly>=h+th?1:2;for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if(rad===2&&Math.abs(dx)===2&&Math.abs(dz)===2&&hash3(wx+dx,ly,wz+dz,SEED)<.6)continue;const i=(ly*CS+z+dz)*CS+x+dx;if(!d[i])d[i]=BN.leaves;}}
      for(let y=h+1;y<=h+th;y++)d[(y*CS+z)*CS+x]=BN.log;d[(h*CS+z)*CS+x]=BN.dirt;}
    else if(top===BN.snow&&coldOK&&coldAt(wx,wz)&&r<.018&&h+11<H){const th=5+(hash3(wx,8,wz,SEED)*4|0);
      for(let y=h+1;y<=h+th;y++)d[(y*CS+z)*CS+x]=BN.spruce;
      for(let ly=h+2;ly<=h+th+1;ly++){const rad=Math.max(0,Math.round((h+th+1-ly)*2/th+(ly%2?0:.4)));for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if(Math.abs(dx)+Math.abs(dz)>rad+ (rad>1?0:1))continue;const i=(ly*CS+z+dz)*CS+x+dx;if(!d[i])d[i]=BN.pineleaves;}}
      d[((h+th+2)*CS+z)*CS+x]=BN.pineleaves;}
    else if(top===BN.sand&&h>SEA+1&&r<.006){for(let y=h+1;y<=h+3;y++)d[(y*CS+z)*CS+x]=BN.cactus;}
    else if(top===BN.grass&&r>.995)d[(h*CS+z)*CS+x]=BN.flowers;
    else if(top===BN.grass&&r>.9935&&r<.9945&&!d[((h+1)*CS+z)*CS+x])d[((h+1)*CS+z)*CS+x]=BN.pumpkin;}
  // v1.3: snow layers on cold ground (and tree tops)
  if(coldOK)for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){const wx=x0+x,wz=z0+z;const h=hm[z*CS+x];if(!(h>SEA+44||coldAt(wx,wz)))continue;
    for(let y=Math.min(H-2,h+14);y>=h;y--){const b=d[(y*CS+z)*CS+x];if(!b)continue;if((b===BN.snow||b===BN.pineleaves||b===BN.stone)&&hash3(wx,y,wz,SEED+61)<.85)d[((y+1)*CS+z)*CS+x]=BN.snowlayer;break;}}
  // v1.2: towns and demon cities
  for(const c of citiesTouchingChunk(cx,cz))stampCity(d,hm,cx,cz,c);
  return d;}
// ===== chunk store =====
const world={chunks:new Map(),edits:new Map()};
const ck=(cx,cz)=>cx+','+cz;
function computeTop(ch){for(let z=0;z<CS;z++)for(let x=0;x<CS;x++)colTop(ch,x,z);}
function colTop(ch,x,z){let y=H-1;while(y>0&&!OPQ[ch.d[(y*CS+z)*CS+x]]&&!LIQ[ch.d[(y*CS+z)*CS+x]])y--;ch.top[z*CS+x]=y;}
const isLight=(id,i)=>LIGHT[id]===1||(id===BN.lava&&i>=(HELL_TOP+1)*256);
function loadChunk(cx,cz){const k=ck(cx,cz);const d=genChunk(cx,cz);const ed=world.edits.get(k);if(ed)for(const [i,id] of ed)d[i]=id;
  const ch={cx,cz,k,d,top:new Uint8Array(256),secs:new Array(NSEC).fill(null),wsecs:new Array(NSEC).fill(null),dirty:new Uint8Array(NSEC).fill(1),lights:new Set()};
  for(let i=0;i<d.length;i++)if(isLight(d[i],i))ch.lights.add(i);
  computeTop(ch);world.chunks.set(k,ch);return ch;}
function getChunk(cx,cz){return world.chunks.get(ck(cx,cz));}
function getB(x,y,z){if(y<0)return BN.bedrock;if(y>=H)return 0;const ch=world.chunks.get(ck(x>>4,z>>4));if(!ch)return -1;return ch.d[(y*CS+(z&15))*CS+(x&15)];}
function setB(x,y,z,id){if(y<0||y>=H)return false;const ch=world.chunks.get(ck(x>>4,z>>4));if(!ch)return false;const lx=x&15,lz=z&15,i=(y*CS+lz)*CS+lx;
  const old=ch.d[i];ch.d[i]=id;let ed=world.edits.get(ch.k);if(!ed){ed=new Map();world.edits.set(ch.k,ed);}ed.set(i,id);
  const lo=isLight(old,i),ln=isLight(id,i);if(lo)ch.lights.delete(i);if(ln)ch.lights.add(i);
  colTop(ch,lx,lz);const sy=y>>4;
  // remesh this section and any neighbor touching the edit (light radius for light blocks)
  const rad=(lo||ln)?8:1;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=world.chunks.get(ck((x>>4)+dx,(z>>4)+dz));if(!n)continue;
    if(dx&&!(dx<0?lx<rad:lx>15-rad))continue;if(dz&&!(dz<0?lz<rad:lz>15-rad))continue;
    for(let s=Math.max(0,(y-rad)>>4);s<=Math.min(NSEC-1,(y+rad)>>4);s++)n.dirty[s]=2;
    // column top change can affect skylight below: mark lower sections of same column too
    for(let s=0;s<sy;s++)if(n===ch&&n.secs[s])n.dirty[s]=Math.max(n.dirty[s],1);}
  return true;}
// ===== meshing (face culling + AO + sky/torch light) =====
const FACES=[
 {n:[1,0,0],c:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],s:.8},{n:[-1,0,0],c:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],s:.8},
 {n:[0,1,0],c:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],s:1},{n:[0,-1,0],c:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],s:.55},
 {n:[0,0,1],c:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],s:.9},{n:[0,0,-1],c:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],s:.9}];
const UVS=[[0,0],[0,1],[1,1],[1,0]];
const AOV=[.45,.62,.8,1];
const PW=18,PAD=new Uint8Array(PW*PW*PW),PTOP=new Int16Array(PW*PW);
function meshSection(ch,sy){
  const y0=sy*CS;
  // fill padded block volume
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=world.chunks.get(ck(ch.cx+dx,ch.cz+dz));
    const xa=dx<0?15:0,xb=dx>0?0:15,za=dz<0?15:0,zb=dz>0?0:15;
    for(let z=za;z<=zb;z++)for(let x=xa;x<=xb;x++){const px=x+1+dx*16,pz=z+1+dz*16;
      PTOP[pz*PW+px]=n?n.top[z*CS+x]:H;
      for(let py=0;py<PW;py++){const y=y0+py-1;let v;if(y<0)v=BN.bedrock;else if(y>=H)v=0;else v=n?n.d[(y*CS+z)*CS+x]:BN.stone;PAD[(py*PW+pz)*PW+px]=v;}}}
  // nearby lights
  const L=[];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const n=world.chunks.get(ck(ch.cx+dx,ch.cz+dz));if(!n)continue;
    for(const i of n.lights){const ly=(i/256)|0;if(ly<y0-9||ly>y0+25)continue;L.push((n.cx*16+(i&15))+.5,ly+.5,(n.cz*16+((i>>4)&15))+.5);}}
  const ox=ch.cx*16,oz=ch.cz*16;
  const out=[{p:[],u:[],l:[],i:[]},{p:[],u:[],l:[],i:[]}];
  const P=(x,y,z)=>PAD[(y*PW+z)*PW+x];
  const sky=(x,y,z)=>{const t=PTOP[z*PW+x];const wy=y0+y-1;return wy>t?1:Math.max(0,1-(t-wy)*0.22);};
  const blight=(wx,wy,wz)=>{let m=0;for(let k=0;k<L.length;k+=3){const dx=wx-L[k],dy=wy-L[k+1],dz=wz-L[k+2];const d2=dx*dx+dy*dy+dz*dz;if(d2<81){const v=1-Math.sqrt(d2)/9;if(v>m)m=v;}}return m;};
  for(let y=1;y<=16;y++)for(let z=1;z<=16;z++)for(let x=1;x<=16;x++){const b=P(x,y,z);if(!b)continue;const bd=B[b];
    const liq=LIQ[b],o=out[b===BN.water?1:0];const em=EMIT[b];
    if(bd.shape){ // small box, always all faces
      const s=bd.shape;const sl=Math.max(sky(x,y,z),0);const bl=em?2:blight(ox+x-.5,y0+y-.5,oz+z-.5);
      for(let f=0;f<6;f++){const F=FACES[f];if(f===3&&OPQ[P(x,y-1,z)]&&s[1]===0)continue;const base=o.p.length/3;
        for(let c=0;c<4;c++){const C=F.c[c];o.p.push(ox+x-1+(C[0]?s[3]:s[0]),y0+y-1+(C[1]?s[4]:s[1]),oz+z-1+(C[2]?s[5]:s[2]));
          const t=bd.tx[f];let uu=UVS[c][0],vv=UVS[c][1];if(f<2){uu=C[2]?s[5]:s[2];if(f===1)uu=1-uu;vv=C[1]?s[4]:s[1];}else if(f>=4){uu=C[0]?s[3]:s[0];vv=C[1]?s[4]:s[1];}
          if(b===BN.torch&&f!==2&&f!==3){uu=(f<2?(C[2]?9:7):(C[0]?9:7))/16;}
          o.u.push(((t%ATW)+.02+uu*.96)/ATW,1-(((t/ATW)|0)+.02+(1-vv)*.96)/ATW);o.l.push(sl,bl,F.s);}
        o.i.push(base,base+1,base+2,base,base+2,base+3);}
      continue;}
    for(let f=0;f<6;f++){const F=FACES[f],n=F.n;const nb=P(x+n[0],y+n[1],z+n[2]);
      if(OPQ[nb])continue;if(nb===b&&(liq||b===BN.glass))continue;if(liq&&nb&&LIQ[nb])continue;
      if(liq===1&&nb&&!B[nb].shape&&f!==2&&SOLID[nb])continue;
      const ax=x+n[0],ay=y+n[1],az=z+n[2];const base=o.p.length/3;const ao=[0,0,0,0];
      const t=bd.tx[f];const tu=(t%ATW),tv=((t/ATW)|0);
      const lowTop=liq&&P(x,y+1,z)!==b;
      for(let c=0;c<4;c++){const C=F.c[c];
        // AO
        let s1,s2,cc,sk;
        if(n[0]){const ty=C[1]?1:-1,tz=C[2]?1:-1;s1=OPQ[P(ax,ay+ty,az)];s2=OPQ[P(ax,ay,az+tz)];cc=OPQ[P(ax,ay+ty,az+tz)];sk=(sky(ax,ay,az)+sky(ax,ay,az+tz))*.5;}
        else if(n[1]){const tx=C[0]?1:-1,tz=C[2]?1:-1;s1=OPQ[P(ax+tx,ay,az)];s2=OPQ[P(ax,ay,az+tz)];cc=OPQ[P(ax+tx,ay,az+tz)];sk=(sky(ax,ay,az)+sky(ax+tx,ay,az)+sky(ax,ay,az+tz)+sky(ax+tx,ay,az+tz))*.25;}
        else{const tx=C[0]?1:-1,ty=C[1]?1:-1;s1=OPQ[P(ax+tx,ay,az)];s2=OPQ[P(ax,ay+ty,az)];cc=OPQ[P(ax+tx,ay+ty,az)];sk=(sky(ax,ay,az)+sky(ax+tx,ay,az))*.5;}
        const a=em||liq?3:(s1&&s2?0:3-s1-s2-cc);ao[c]=a;
        const vx=ox+x-1+C[0],vy=y0+y-1+(C[1]&&lowTop?.875:C[1]),vz=oz+z-1+C[2];
        o.p.push(vx,vy,vz);
        o.u.push((tu+.02+UVS[c][0]*.96)/ATW,1-(tv+.02+(1-UVS[c][1])*.96)/ATW);
        o.l.push(sk,em?2:blight(vx+n[0]*.5,vy+n[1]*.5,vz+n[2]*.5),F.s*AOV[a]);}
      if(ao[0]+ao[2]<ao[1]+ao[3])o.i.push(base+1,base+2,base+3,base+1,base+3,base);else o.i.push(base,base+1,base+2,base,base+2,base+3);}}
  return out;}
// ===== v1.2: cities (surface towns & demon cities), deterministic from the seed =====
const CITY_R=30,CITY_E=38,HC_R=30,HC_E=44,HC_F=16,CITY_CELL=160,HC_CELL=128;
const CITY={off:new Set(),cells:new Map(),plans:new Map(),spawn:null};
function cityReset(off){CITY.off=new Set(off||[]);CITY.cells.clear();CITY.plans.clear();CITY.spawn=null;}
function hashStr(s){let h=7;for(const c of s)h=Math.imul(h,31)+c.charCodeAt(0)|0;return h;}
// same search the game has always used to pick a new world's spawn
function spawnXZ(){for(let r=0;r<200;r+=8)for(let a=0;a<8;a++){const x=Math.round(Math.cos(a)*r),z=Math.round(Math.sin(a)*r);const h=surfH(x,z);if(h>SEA+1&&h<SEA+30)return {x:x+.5,z:z+.5,y:h+1};}return {x:.5,z:.5,y:H-20};}
const NM1=['Oak','Stone','River','Elm','Amber','Maple','Bright','Willow','Copper','Silver','Green','Fox','Honey','Brook','Lark','Mill'],NM2=['vale','ford','haven','field','brook','stead','wick','bury','ton','mere','gate','hollow'];
const HN1=['Ash','Cinder','Brim','Dread','Ember','Gloom','Scorch','Sulfur','Obsid','Pyre','Hex','Molten'],HN2=['hold','spire','gate','maw','reach','keep','pit','crag','forge','throne'];
function mkName(id,a,b){const i=(hash3(hashStr(id),3,9,SEED+5)*a.length*b.length)|0;return a[i%a.length]+b[((i/a.length)|0)%b.length];}
function mkCity(kind,id,x,z){if(kind==='s'){const g=Math.max(SEA+3,Math.min(SEA+16,surfH(x,z)));return {id,kind,x,z,g,R:CITY_R,E:CITY_E,name:mkName(id,NM1,NM2)};}
  return {id,kind,x,z,g:HC_F,R:HC_R,E:HC_E,name:mkName(id,HN1,HN2)};}
// the guaranteed town: 52 blocks north of spawn (straight ahead: a new player faces -z)
function spawnCity(){if(!CITY.spawn){const s=spawnXZ();CITY.spawn=mkCity('s','s0',Math.floor(s.x),Math.floor(s.z)-52);}return CITY.spawn;}
function cityInCell(kind,cx,cz){const k=kind+cx+','+cz;if(CITY.cells.has(k))return CITY.cells.get(k);let c=null;
  if(kind==='s'){const S=CITY_CELL;if(hash3(cx,77,cz,SEED+900)<.75){const x=cx*S+80+Math.round((hash3(cx,78,cz,SEED+901)-.5)*60),z=cz*S+80+Math.round((hash3(cx,79,cz,SEED+902)-.5)*60);
      const sc=spawnCity(),h=surfH(x,z);if(Math.hypot(x-sc.x,z-sc.z)>=130&&h<SEA+34&&h>SEA-8)c=mkCity('s','s'+cx+','+cz,x,z);}}
  else{const S=HC_CELL;const x=cx*S+64+Math.round((hash3(cx,81,cz,SEED+903)-.5)*40),z=cz*S+64+Math.round((hash3(cx,82,cz,SEED+904)-.5)*40);c=mkCity('h','h'+cx+','+cz,x,z);}
  CITY.cells.set(k,c);return c;}
function citiesNear(kind,x,z,rad,all){const S=kind==='s'?CITY_CELL:HC_CELL;const out=[];
  const add=c=>{if(c&&(all||!CITY.off.has(c.id))&&Math.max(Math.abs(c.x-x),Math.abs(c.z-z))<=rad&&!out.includes(c))out.push(c);};
  for(let cz=Math.floor((z-rad)/S)-1;cz<=Math.floor((z+rad)/S)+1;cz++)for(let cx=Math.floor((x-rad)/S)-1;cx<=Math.floor((x+rad)/S)+1;cx++)add(cityInCell(kind,cx,cz));
  if(kind==='s')add(spawnCity());return out;}
function nearestCity(kind,x,z,maxR){let best=null,bd=1e9;for(const c of citiesNear(kind,x,z,maxR||640)){const d=Math.hypot(c.x-x,c.z-z);if(d<bd){bd=d;best=c;}}return best;}
function citiesTouchingChunk(cx,cz,all){const x0=cx*16,z0=cz*16,out=[];
  for(const kind of ['s','h'])for(const c of citiesNear(kind,x0+8,z0+8,(kind==='s'?CITY_E:HC_E)+9,all))if(c.x-c.E<=x0+15&&c.x+c.E>=x0&&c.z-c.E<=z0+15&&c.z+c.E>=z0)out.push(c);return out;}
function cityAt(x,z,kind){for(const c of citiesNear(kind,x,z,CITY_E+8))if(Math.abs(x-c.x)<=c.R&&Math.abs(z-c.z)<=c.R)return c;return null;}
// ---- plans: a voxel stamp per city (0 = leave terrain, n = block id n-1) ----
function newPlan(c,y0,Y){const E=c.E,W=2*E+1;return {c,E,W,y0,Y,d:new Uint8Array(W*W*Y),spots:[],guards:[],leader:null,merchant:null};}
function pset(p,dx,y,dz,id){const yy=y-p.y0;if(yy<0||yy>=p.Y||dx<-p.E||dx>p.E||dz<-p.E||dz>p.E)return;p.d[(yy*p.W+dz+p.E)*p.W+dx+p.E]=id+1;}
function pget(p,dx,y,dz){const yy=y-p.y0;if(yy<0||yy>=p.Y||dx<-p.E||dx>p.E||dz<-p.E||dz>p.E)return -1;return p.d[(yy*p.W+dz+p.E)*p.W+dx+p.E]-1;}
function pbox(p,x0,y0,z0,x1,y1,z1,id){if(x0>x1)[x0,x1]=[x1,x0];if(y0>y1)[y0,y1]=[y1,y0];if(z0>z1)[z0,z1]=[z1,z0];for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)pset(p,x,y,z,id);}
function cityPlan(c){let p=CITY.plans.get(c.id);if(p)return p;p=c.kind==='s'?buildTown(c):buildHellCity(c);CITY.plans.set(c.id,p);if(CITY.plans.size>12)CITY.plans.delete(CITY.plans.keys().next().value);return p;}
function buildTown(c){const g=c.g,R=c.R,p=newPlan(c,g-6,36),A=BN;const r=rng32(hashStr(c.id)+SEED);
  const S=(x,y,z,id)=>pset(p,x,y,z,id),Bx=(a,b,cc,d,e,f,id)=>pbox(p,a,b,cc,d,e,f,id),gnd=(x,z,id)=>S(x,g,z,id);
  const lampPost=(x,z)=>{S(x,g+1,z,A.fence);S(x,g+2,z,A.fence);S(x,g+3,z,A.lamp);};
  // roads (E-W across town, south gate to the plaza, plaza to the town hall)
  for(let x=-R;x<=R;x++)for(let z=-1;z<=1;z++)gnd(x,z,A.path);
  for(let z=-9;z<=R;z++)for(let x=-1;x<=1;x++)gnd(x,z,A.path);
  // plaza + fountain
  for(let x=-6;x<=6;x++)for(let z=-6;z<=6;z++){const e=Math.max(Math.abs(x),Math.abs(z));gnd(x,z,e%2?A.cobble:A.stonebrick);}
  for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const e=Math.max(Math.abs(x),Math.abs(z));if(e===2)S(x,g+1,z,A.stonebrick);else{S(x,g,z,A.water);S(x,g-1,z,A.stonebrick);}}
  Bx(0,g,0,0,g+3,0,A.marble);S(0,g+4,0,A.lamp);
  for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]])lampPost(x,z);
  for(const d of [9,15,21,27]){lampPost(d,d%12===9?2:-2);lampPost(-d,d%12===9?-2:2);lampPost(d%12===9?2:-2,d);}
  lampPost(2,-8);lampPost(-2,-8);
  // town wall with crenellations, gates west/east/south, corner and gate towers
  for(let i=-R;i<=R;i++)for(const [x,z] of [[i,-R],[i,R],[-R,i],[R,i]]){Bx(x,g,z,x,g+4,z,A.stonebrick);if(((i%2)+2)%2===0)S(x,g+5,z,A.stonebrick);}
  for(const [gx,gz,ax] of [[-R,0,'z'],[R,0,'z'],[0,R,'x']]){for(let k=-1;k<=1;k++){const x=ax==='x'?gx+k:gx,z=ax==='z'?gz+k:gz;Bx(x,g+1,z,x,g+3,z,0);gnd(x,z,A.path);}
    for(const k of [-3,-2,2,3]){const x=ax==='x'?gx+k:gx,z=ax==='z'?gz+k:gz;for(let o=-1;o<=1;o++){const xx=ax==='x'?x:x+o,zz=ax==='z'?z:z+o;Bx(xx,g,zz,xx,g+7,zz,A.stonebrick);}}
    for(const k of [-2,2]){const x=ax==='x'?gx+k:gx,z=ax==='z'?gz+k:gz;S(x,g+8,z,A.lamp);}
    const bx=ax==='x'?gx:gx,bz=ax==='z'?gz:gz;S(bx,g+5,bz,A.banner);S(bx,g+6,bz,A.banner);}
  for(const sx of [-1,1])for(const sz of [-1,1]){const cx=sx*R,cz=sz*R;Bx(cx-2,g,cz-2,cx+2,g+7,cz+2,A.stonebrick);
    for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if((Math.abs(a)===2||Math.abs(b)===2)&&((a+b)&1)===0)S(cx+a,g+8,cz+b,A.stonebrick);S(cx,g+8,cz,A.lamp);}
  // ---- town hall (castle) ----
  const hx0=-8,hx1=8,hz0=-24,hz1=-10;Bx(hx0,g,hz0,hx1,g,hz1,A.stonebrick);
  for(let y=g+1;y<=g+7;y++)for(let x=hx0;x<=hx1;x++)for(let z=hz0;z<=hz1;z++)if(x===hx0||x===hx1||z===hz0||z===hz1)S(x,y,z,A.stonebrick);
  Bx(hx0,g+8,hz0,hx1,g+8,hz1,A.stonebrick);for(let x=hx0;x<=hx1;x++)for(let z=hz0;z<=hz1;z++)if((x===hx0||x===hx1||z===hz0||z===hz1)&&((x+z)&1)===0)S(x,g+9,z,A.stonebrick);
  for(const tx of [hx0,hx1])for(const tz of [hz0,hz1]){Bx(tx-1,g,tz-1,tx+1,g+11,tz+1,A.stonebrick);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(a||b)if(((a+b)&1)===0)S(tx+a,g+12,tz+b,A.stonebrick);S(tx,g+12,tz,A.lamp);S(tx,g+5,tz+(tz===hz1?2:-2),A.glass);}
  Bx(-4,g+9,-22,4,g+14,-15,A.stonebrick);Bx(-3,g+9,-21,3,g+13,-16,0);Bx(-3,g+14,-21,3,g+14,-16,A.stonebrick);for(let x=-4;x<=4;x++)for(let z=-22;z<=-15;z++)if((x===-4||x===4||z===-22||z===-15)&&((x+z)&1)===0)S(x,g+15,z,A.stonebrick);
  for(const x of [-2,0,2])S(x,g+11,-15,A.glass);Bx(0,g+15,-18,0,g+19,-18,A.fence);S(1,g+19,-18,A.banner);S(1,g+18,-18,A.banner);S(2,g+19,-18,A.banner);S(2,g+18,-18,A.banner);
  Bx(hx0+1,g+1,hz0+1,hx1-1,g+7,hz1-1,0);Bx(hx0+1,g,hz0+1,hx1-1,g,hz1-1,A.tiles);Bx(-1,g,hz0+1,1,g,hz1,A.wool4);
  Bx(-1,g+1,hz1,1,g+3,hz1,0);S(-2,g+2,hz1,A.banner);S(-2,g+3,hz1,A.banner);S(2,g+2,hz1,A.banner);S(2,g+3,hz1,A.banner);
  for(const z of [-21,-18,-15,-12]){S(hx0,g+3,z,A.glass);S(hx0,g+4,z,A.glass);S(hx1,g+3,z,A.glass);S(hx1,g+4,z,A.glass);}
  for(const x of [-5,5]){S(x,g+3,hz1,A.glass);S(x,g+4,hz1,A.glass);for(const z of [-21,-17,-13])Bx(x,g+1,z,x,g+7,z,A.marble);}
  for(const z of [-20,-16,-12]){S(hx0,g+6,z,A.lamp);S(hx1,g+6,z,A.lamp);}S(-4,g+6,hz0,A.lamp);S(4,g+6,hz0,A.lamp);
  Bx(-7,g+1,hz0+1,-3,g+2,hz0+1,A.bookshelf);Bx(3,g+1,hz0+1,7,g+2,hz0+1,A.bookshelf);
  Bx(0,g+1,-23,0,g+3,-23,A.gold_block);S(0,g+1,-22,A.wool4);S(-1,g+1,-22,A.gold_block);S(1,g+1,-22,A.gold_block);S(0,g+4,-23,A.crown);
  for(const x of [-2,2])Bx(x,g+3,hz0,x,g+5,hz0,A.banner);
  p.leader=[0,g+1,-20];
  // ---- houses ----
  const house=(x0,z0,w,d,ds,st,mat,roof)=>{const x1=x0+w-1,z1=z0+d-1,top=g+4*st;
    Bx(x0,g,z0,x1,g,z1,A.cobble);Bx(x0+1,g,z0+1,x1-1,g,z1-1,A.planks);
    for(let y=g+1;y<=top;y++)for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){if(!(x===x0||x===x1||z===z0||z===z1))continue;const corner=(x===x0||x===x1)&&(z===z0||z===z1);S(x,y,z,corner?A.log:mat);}
    Bx(x0+1,g+1,z0+1,x1-1,top,z1-1,0);if(st===2)Bx(x0+1,g+5,z0+1,x1-1,g+5,z1-1,A.planks);
    const dX=x0+(w>>1),dZ=ds==='S'?z1:z0;
    for(let s=0;s<st;s++){const wy=g+2+s*4;for(const x of [x0+1,x1-1,w>=8?dX+2:null])if(x!==null&&x!==dX){S(x,wy,z0,A.glass);S(x,wy,z1,A.glass);}for(let z=z0+1;z<z1;z++)if((z-z0)%2===1&&z<z1){S(x0,wy,z,A.glass);S(x1,wy,z,A.glass);}}
    S(dX,g+1,dZ,A.doorx);S(dX,g+2,dZ,A.doorx);
    const dir=ds==='S'?1:-1;for(let k=1;k<=12;k++){const z=dZ+dir*k;if(pget(p,dX,g,z)!==-1)break;gnd(dX,z,A.path);}
    for(let k=0;;k++){const za=z0-1+k,zb=z1+1-k;if(za>zb)break;const y=top+1+k;for(let x=x0-1;x<=x1+1;x++){S(x,y,za,roof);S(x,y,zb,roof);}
      for(let z=za+1;z<zb;z++){S(x0,y,z,mat);S(x1,y,z,mat);}}
    S(x0+1,g+1,z0+1,A.torch);S(x1-1,g+1,ds==='S'?z0+1:z1-1,A.bed);S(x0+1,g+1,ds==='S'?z0+2:z1-2,A.chest);if(w>=6)S(x1-1,g+1,ds==='S'?z0+2:z1-2,A.bookshelf);
    S(dX-1,g+1,dZ+dir,A.fence);};
  const garden=(x0,z0,x1,z1)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const e=x===x0||x===x1||z===z0||z===z1;if(e){if(!(z===z1&&x===((x0+x1)>>1)))S(x,g+1,z,A.fence);gnd(x,z,A.grass);}else gnd(x,z,((x+z)%3===0)?A.grass:A.flowers);}
    const tx=(x0+x1)>>1,tz=(z0+z1)>>1;gnd(tx,tz,A.dirt);Bx(tx,g+1,tz,tx,g+3,tz,A.log);for(let y=g+3;y<=g+5;y++){const rr=y===g+5?1:2;for(let a=-rr;a<=rr;a++)for(let b=-rr;b<=rr;b++){if(rr===2&&Math.abs(a)===2&&Math.abs(b)===2)continue;if(!(a===0&&b===0&&y<g+4))S(tx+a,y,tz+b,A.leaves);}}
    S(x0+1,g+1,z0+1,A.pumpkin);};
  const farm=(x0,z0,x1,z1)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const e=x===x0||x===x1||z===z0||z===z1;if(e){if(!(x===x0&&Math.abs(z-((z0+z1)>>1))<1))S(x,g+1,z,A.fence);gnd(x,z,A.grass);}else if((z-z0)%4===2){gnd(x,z,A.water);S(x,g-1,z,A.dirt);}else{gnd(x,z,A.dirt);S(x,g+1,z,A.crops);}}};
  const stall=(x0,z0,ca,cb,goods)=>{for(const [a,b] of [[0,0],[3,0],[0,3],[3,3]])Bx(x0+a,g+1,z0+b,x0+a,g+3,z0+b,A.fence);
    for(let a=0;a<=3;a++)for(let b=0;b<=3;b++)S(x0+a,g+4,z0+b,a%2?ca:cb);Bx(x0+1,g+1,z0+3,x0+2,g+1,z0+3,A.planks);S(x0+1,g+2,z0+3,goods[0]);S(x0+2,g+2,z0+3,goods[1]);S(x0+1,g+1,z0+1,A.chest);};
  // market (south-east), with the merchant in the middle
  for(let x=4;x<=18;x++)for(let z=4;z<=16;z++)gnd(x,z,(x+z)%5===0?A.stonebrick:A.cobble);
  stall(5,5,A.wool4,A.wool0,[A.pumpkin,A.melon]);stall(10,5,A.wool11,A.wool6,[A.hay,A.flowers]);stall(15,5,A.wool9,A.wool0,[A.bookshelf,A.chest]);stall(5,11,A.wool13,A.wool6,[A.melon,A.hay]);stall(15,11,A.wool5,A.wool0,[A.lamp,A.glass]);
  lampPost(4,16);lampPost(18,16);Bx(16,g+1,15,17,g+1,15,A.hay);S(17,g+2,15,A.hay);S(11,g+1,4,A.banner);S(11,g+2,4,A.banner);
  p.merchant=[11,g+1,12];
  farm(21,4,28,27);
  // church (south-west) with steeple and bell
  {const x0=-16,x1=-6,z0=8,z1=22;Bx(x0,g,z0,x1,g,z1,A.stonebrick);
    for(let y=g+1;y<=g+6;y++)for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)if(x===x0||x===x1||z===z0||z===z1)S(x,y,z,((x===x0||x===x1)&&(z===z0||z===z1))?A.stonebrick:A.marble);
    Bx(x0+1,g+1,z0+1,x1-1,g+6,z1-1,0);Bx(x0+1,g,z0+1,x1-1,g,z1-1,A.tiles);Bx(-11,g,z0+1,-11,g,z1-1,A.wool4);
    const sg=[A.wool11,A.wool4,A.wool6,A.wool12];let i=0;for(const z of [z0+3,z0+6,z0+9,z0+12]){const w=sg[i++%4];for(const x of [x0,x1]){S(x,g+2,z,w);S(x,g+3,z,A.glass);S(x,g+4,z,w);}}
    for(let k=0;;k++){const xa=x0-1+k,xb=x1+1-k;if(xa>xb)break;const y=g+7+k;for(let z=z0-1;z<=z1+1;z++){S(xa,y,z,A.roof);S(xb,y,z,A.roof);}for(let x=xa+1;x<xb;x++){S(x,y,z0,A.marble);S(x,y,z1,A.marble);}}
    for(const z of [11,13,15,17]){Bx(-14,g+1,z,-12,g+1,z,A.dplanks);Bx(-10,g+1,z,-8,g+1,z,A.dplanks);}
    S(-11,g+1,21,A.gold_block);S(-12,g+1,21,A.marble);S(-10,g+1,21,A.marble);S(-12,g+2,21,A.torch);S(-10,g+2,21,A.torch);S(-11,g+4,z1,A.wool6);S(-11,g+5,z1,A.wool6);S(-12,g+4,z1,A.wool6);S(-10,g+4,z1,A.wool6);
    Bx(-13,g,3,-9,g+14,7,A.stonebrick);Bx(-12,g+1,4,-10,g+13,6,0);Bx(-11,g+1,3,-11,g+2,3,0);Bx(-11,g+1,7,-11,g+2,8,0);
    for(const [x,z] of [[-11,3],[-11,7],[-13,5],[-9,5]])Bx(x,g+10,z,x,g+12,z,0);S(-11,g+13,5,A.gold_block);S(-11,g+12,5,A.fence);
    for(let k=0;k<=2;k++)Bx(-13+k,g+15+k,3+k,-9-k,g+15+k,7-k,A.roof);S(-11,g+18,5,A.fence);S(-11,g+19,5,A.gold_block);S(-12,g+19,5,A.gold_block);S(-10,g+19,5,A.gold_block);S(-11,g+20,5,A.gold_block);
    for(const x of [-12,-11,-10])gnd(x,2,A.path);S(x0,g+5,z0+8,A.lamp);S(x1,g+5,z0+8,A.lamp);}
  // houses of different sizes (1 and 2 storeys)
  house(-28,4,8,6,'N',2,A.stonebrick,A.roof);house(-28,13,6,5,'N',1,A.bplanks,A.roof);garden(-27,20,-19,27);
  house(-16,-9,6,6,'S',1,A.planks,A.roof);house(-24,-9,6,6,'S',1,A.brick,A.dplanks);house(-18,-24,8,7,'S',2,A.bplanks,A.roof);house(-28,-25,7,8,'S',1,A.sandstone,A.brick);garden(-28,-15,-20,-11);
  house(11,-9,6,6,'S',1,A.bplanks,A.roof);house(19,-9,6,6,'S',1,A.sandstone,A.roof);house(11,-24,8,7,'S',2,A.planks,A.dplanks);house(21,-25,7,8,'S',1,A.brick,A.roof);garden(20,-15,28,-11);
  house(5,19,6,6,'N',1,A.brick,A.roof);house(12,19,6,7,'N',2,A.planks,A.dplanks);
  // wander spots for townspeople (roads & plaza)
  for(let x=-26;x<=26;x+=2)if(Math.abs(x)>3)p.spots.push([x,0]);for(let z=8;z<=26;z+=2)p.spots.push([0,z]);for(let a=-5;a<=5;a+=2)for(const b of [-4,4]){p.spots.push([a,b]);p.spots.push([b,a]);}for(let z=6;z<=15;z+=3)p.spots.push([11,z]);
  void r;return p;}
function buildHellCity(c){const g=c.g,R=c.R,p=newPlan(c,g-4,28),A=BN;
  const S=(x,y,z,id)=>pset(p,x,y,z,id),Bx=(a,b,cc,d,e,f,id)=>pbox(p,a,b,cc,d,e,f,id),gnd=(x,z,id)=>S(x,g,z,id);
  const post=(x,z)=>{S(x,g+1,z,A.obsidian);S(x,g+2,z,A.obsidian);S(x,g+3,z,A.soulfire);};
  // lava moat, bridges with rails and soulfire posts
  for(let x=-35;x<=35;x++)for(let z=-35;z<=35;z++){const t=Math.max(Math.abs(x),Math.abs(z));if(t>=32&&t<=35){Bx(x,g-2,z,x,g,z,A.lava);S(x,g-3,z,A.obsidian);}}
  const dirs=[[0,1],[0,-1],[1,0],[-1,0]];
  for(const [ux,uz] of dirs){for(let t=29;t<=38;t++)for(let k=-1;k<=1;k++){const x=ux?ux*t:k,z=uz?uz*t:k;gnd(x,z,A.obsidian);S(x,g-1,z,A.obsidian);}
    for(let t=32;t<=35;t++)for(const k of [-2,2]){const x=ux?ux*t:k,z=uz?uz*t:k;S(x,g+1,z,A.obsidian);}
    for(const t of [31,36])for(const k of [-2,2])post(ux?ux*t:k,uz?uz*t:k);}
  // roads with a glowing hellstone centre line, lamp posts
  for(const [ux,uz] of dirs)for(let t=0;t<=R;t++)for(let k=-1;k<=1;k++){const x=ux?ux*t:k,z=uz?uz*t:k;gnd(x,z,k===0?A.hellstone:A.darkstone);}
  for(const d of [9,15,21,27]){post(d,2);post(-d,-2);post(2,d);post(-2,-d+(d>8?0:0));}
  // walls and gates
  for(let i=-R;i<=R;i++)for(const [x,z] of [[i,-R],[i,R],[-R,i],[R,i]]){Bx(x,g,z,x,g+6,z,A.obsidian);S(x,g+3,z,A.demonbrick);if(((i%2)+2)%2===0)S(x,g+7,z,A.obsidian);}
  for(const [ux,uz] of dirs){for(let k=-1;k<=1;k++){const x=ux?ux*R:k,z=uz?uz*R:k;Bx(x,g+1,z,x,g+4,z,0);gnd(x,z,A.obsidian);}S(ux?ux*R:0,g+5,uz?uz*R:0,A.soulfire);}
  // dark towers at the wall corners (up to the cavern roof)
  const tower=(cx,cz,r,top)=>{Bx(cx-r,g,cz-r,cx+r,top,cz+r,A.obsidian);for(let y=g+3;y<top;y+=4){S(cx,y,cz-r,A.hellstone);S(cx,y,cz+r,A.hellstone);S(cx-r,y,cz,A.hellstone);S(cx+r,y,cz,A.hellstone);}
    for(const [a,b] of [[-r,-r],[r,-r],[-r,r],[r,r]])S(cx+a+Math.sign(a),g+9,cz+b+Math.sign(b),A.soulfire);};
  for(const sx of [-1,1])for(const sz of [-1,1])tower(sx*R,sz*R,2,36);
  tower(-20,20,2,33);tower(20,20,2,33);
  // plaza with a lava fountain
  for(let x=-6;x<=6;x++)for(let z=-6;z<=6;z++){const e=Math.max(Math.abs(x),Math.abs(z));gnd(x,z,e%2?A.demonbrick:A.obsidian);}
  for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const e=Math.max(Math.abs(x),Math.abs(z));if(e===2)S(x,g+1,z,A.demonbrick);else{S(x,g,z,A.lava);S(x,g-1,z,A.obsidian);}}
  Bx(0,g,0,0,g+5,0,A.obsidian);S(0,g+6,0,A.soulfire);for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]])post(x,z);
  // demon fortress / throne hall
  const fx0=-11,fx1=11,fz0=-28,fz1=-10;Bx(fx0,g,fz0,fx1,g,fz1,A.obsidian);
  for(let y=g+1;y<=g+12;y++)for(let x=fx0;x<=fx1;x++)for(let z=fz0;z<=fz1;z++)if(x===fx0||x===fx1||z===fz0||z===fz1)S(x,y,z,(x%4===0||z%4===0)?A.obsidian:A.demonbrick);
  Bx(fx0,g+12,fz0,fx1,g+12,fz1,A.obsidian);for(let x=fx0;x<=fx1;x++)for(let z=fz0;z<=fz1;z++)if((x===fx0||x===fx1||z===fz0||z===fz1)&&((x+z)&1)===0)S(x,g+13,z,A.demonbrick);
  Bx(fx0+1,g+1,fz0+1,fx1-1,g+11,fz1-1,0);Bx(-1,g+1,fz1,1,g+4,fz1,0);for(const x of [-3,3]){S(x,g+3,fz1,A.soulfire);S(x,g+5,fz1+0,A.hellstone);}
  for(const x of [-7,7])Bx(x,g,fz0+2,x,g,fz1-2,A.lava);Bx(-1,g,fz0+1,1,g,fz1-1,A.wool4);
  for(const x of [-4,4])for(const z of [-25,-21,-17,-13]){Bx(x,g+1,z,x,g+11,z,A.demonbrick);S(x,g+6,z,A.hellstone);}
  for(const z of [-24,-19,-14]){S(fx0,g+6,z,A.soulfire);S(fx1,g+6,z,A.soulfire);}
  Bx(0,g+1,-27,0,g+4,-27,A.obsidian);S(0,g+1,-26,A.demonbrick);Bx(-1,g+1,-26,-1,g+2,-26,A.obsidian);Bx(1,g+1,-26,1,g+2,-26,A.obsidian);S(0,g+5,-27,A.flamecrown);S(-1,g+3,-27,A.gold_block);S(1,g+3,-27,A.gold_block);
  for(const x of [-3,3])Bx(x,g+4,fz0+0,x,g+8,fz0,A.wool4);
  for(const tx of [fx0,fx1])for(const tz of [fz0,fz1])tower(tx,tz,1,36);
  p.leader=[0,g+1,-23];p.guards=[[-4,g+1,-7],[4,g+1,-7],[14,g+1,-19]];
  // demon houses: brimrock & demon brick with glowing windows
  const hut=(x0,z0,w,d,ds)=>{const x1=x0+w-1,z1=z0+d-1;Bx(x0,g,z0,x1,g,z1,A.obsidian);
    for(let y=g+1;y<=g+4;y++)for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)if(x===x0||x===x1||z===z0||z===z1)S(x,y,z,((x===x0||x===x1)&&(z===z0||z===z1))?A.demonbrick:A.brimrock);
    Bx(x0+1,g+1,z0+1,x1-1,g+4,z1-1,0);Bx(x0-1,g+5,z0-1,x1+1,g+5,z1+1,A.obsidian);Bx(x0+1,g+6,z0+1,x1-1,g+6,z1-1,A.demonbrick);S((x0+x1)>>1,g+7,(z0+z1)>>1,A.soulfire);
    const dX=x0+(w>>1),dZ=ds==='S'?z1:z0;Bx(dX,g+1,dZ,dX,g+2,dZ,0);S(x0+1,g+2,ds==='S'?z1:z0,A.hellstone);S(x1-1,g+2,ds==='S'?z1:z0,A.hellstone);S(x0,g+2,(z0+z1)>>1,A.hellstone);S(x1,g+2,(z0+z1)>>1,A.hellstone);
    S(x0+1,g+1,ds==='S'?z0+1:z1-1,A.chest);};
  hut(-26,-9,6,6,'S');hut(-19,-8,5,5,'S');hut(14,-8,5,5,'S');hut(21,-9,6,6,'S');hut(-27,-25,7,8,'S');hut(18,-26,7,8,'S');
  hut(5,4,6,6,'N');hut(13,5,6,6,'N');hut(-10,4,6,6,'N');hut(-18,5,6,6,'N');hut(5,13,6,6,'S');hut(-10,13,6,6,'S');hut(-27,4,6,6,'N');hut(22,4,6,6,'N');
  for(const [x,z] of [[-24,24],[24,-16],[-24,-16]]){for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const e=Math.max(Math.abs(a),Math.abs(b));if(e===2)S(x+a,g+1,z+b,A.demonbrick);else{S(x+a,g,z+b,A.lava);S(x+a,g-1,z+b,A.obsidian);}}}
  for(let x=-26;x<=26;x+=2)if(Math.abs(x)>3)p.spots.push([x,0]);for(let z=8;z<=26;z+=2)p.spots.push([0,z]);for(let a=-5;a<=5;a+=2)for(const b of [-4,4]){p.spots.push([a,b]);p.spots.push([b,a]);}
  return p;}
// stamp the cities touching a chunk into freshly generated chunk data
function stampCity(d,hm,cx,cz,c){const p=cityPlan(c),x0=cx*16,z0=cz*16,E=p.E,W=p.W;
  for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){const dx=x0+x-c.x,dz=z0+z-c.z,t=Math.max(Math.abs(dx),Math.abs(dz));if(t>c.E)continue;const I=y=>(y*CS+z)*CS+x;
    if(c.kind==='s'){const nat=hm[z*CS+x];let hh=c.g;if(t>c.R+1){const f=sm((t-c.R-1)/(c.E-c.R-1));hh=Math.round(c.g+(nat-c.g)*f);}
      for(let y=HELL_TOP+3;y<H;y++){const i=I(y);
        if(y>hh)d[i]=y<=SEA?BN.water:0;else if(y===hh)d[i]=hh>=SEA?(hh>SEA+44?BN.snow:BN.grass):BN.sand;else if(y>hh-4)d[i]=BN.dirt;else if(y>=hh-12&&(d[i]===0||LIQ[d[i]]||d[i]===BN.log||d[i]===BN.leaves))d[i]=BN.stone;}}
    else{for(let y=2;y<=HELL_TOP-1;y++){const i=I(y);if(y<=c.g){if(d[i]===0||d[i]===BN.lava)d[i]=BN.brimrock;}else if(y<=36)d[i]=0;else if(d[i]===0||d[i]===BN.lava)d[i]=BN.brimrock;}}
    for(let yy=0;yy<p.Y;yy++){const v=p.d[(yy*W+dz+E)*W+dx+E];if(v)d[I(p.y0+yy)]=v-1;}}}
// ===== renderer =====
const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:false});
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(72,1,0.08,400);camera.rotation.order='YXZ';
const atlasTex=new THREE.CanvasTexture(atlas);atlasTex.magFilter=THREE.NearestFilter;atlasTex.minFilter=THREE.NearestFilter;atlasTex.generateMipmaps=false;
const U={map:{value:atlasTex},uSky:{value:new THREE.Color(1,1,1)},uAmb:{value:new THREE.Color(.1,.1,.1)},uFog:{value:new THREE.Color(.6,.8,1)},uFogR:{value:new THREE.Vector2(40,64)},uCam:{value:new THREE.Vector3()},uLamp:{value:12},uAlpha:{value:1},uTime:{value:0}};
const VS=`attribute vec3 aL;varying vec2 vUv;varying vec3 vL;varying vec3 vW;void main(){vUv=uv;vL=aL;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS=`uniform sampler2D map;uniform vec3 uSky,uAmb,uFog,uCam;uniform vec2 uFogR;uniform float uLamp,uAlpha;varying vec2 vUv;varying vec3 vL;varying vec3 vW;
void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;float d=distance(vW,uCam);
 vec3 li=max(uAmb,vL.x*uSky);li=max(li,min(vL.y,1.)*vec3(1.,.82,.55));li=max(li,vec3(clamp(1.-d/uLamp,0.,1.)*.6));
 vec3 c=vL.y>1.5?t.rgb*mix(.75,1.,vL.z):t.rgb*li*vL.z;
 c=mix(c,uFog,smoothstep(uFogR.x,uFogR.y,d));gl_FragColor=vec4(c,uAlpha);}`;
const matO=new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS});
const UW=Object.assign({},U,{uAlpha:{value:.72}});
const matW=new THREE.ShaderMaterial({uniforms:UW,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
function buildMesh(o,mat){if(!o.i.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(o.u,2));g.setAttribute('aL',new THREE.Float32BufferAttribute(o.l,3));
  g.setIndex(o.p.length/3>65535?new THREE.Uint32BufferAttribute(o.i,1):new THREE.Uint16BufferAttribute(o.i,1));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.matrixAutoUpdate=false;if(mat===matW)m.renderOrder=2;scene.add(m);return m;}
function freeMesh(m){if(m){scene.remove(m);m.geometry.dispose();}}
// selection box
const selBox=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)),new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.7}));selBox.visible=false;scene.add(selBox);
const crackMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false});const crackBox=new THREE.Mesh(new THREE.BoxGeometry(1.01,1.01,1.01),crackMat);crackBox.visible=false;scene.add(crackBox);
// sun & moon
const sun=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshBasicMaterial({color:0xfff2a0,fog:false,depthWrite:false}));const moon=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshBasicMaterial({color:0xdde4f0,fog:false,depthWrite:false}));scene.add(sun,moon);sun.renderOrder=moon.renderOrder=-1;
// embers
const EMB=220,embPos=new Float32Array(EMB*3),embVel=new Float32Array(EMB*3);const embGeo=new THREE.BufferGeometry();embGeo.setAttribute('position',new THREE.BufferAttribute(embPos,3));
const embers=new THREE.Points(embGeo,new THREE.PointsMaterial({color:0xff8a2a,size:.14,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));embers.frustumCulled=false;embers.visible=false;scene.add(embers);
// break particles
const brk=[];const brkGeo=new THREE.BoxGeometry(.12,.12,.12);
// ===== game state =====
const G={mode:'title',slot:-1,meta:null,p:{x:.5,y:120,z:.5,vx:0,vy:0,vz:0,yaw:0,pitch:-.2,ground:false,fallY:0},hp:20,coins:0,inv:{},hot:[],sel:0,time:.05,tools:{hand:1},tool:'hand',
  spawn:null,dead:false,zone:'Overworld',fps:0,mine:{t:0,key:'',on:false},lavaT:0,dmgFlash:0,autosaveT:0,mobs:[],playT:0};
const ST={rd:4,sens:1,quality:1,autojump:true,showfps:false,vol:1};
const CH={god:false,supplies:false,money:false,fly:false,noclip:false,instant:false,bedrock:false,day:false};
try{Object.assign(ST,JSON.parse(localStorage.getItem('bc_settings')||'{}'));}catch(e){}
try{Object.assign(CH,JSON.parse(localStorage.getItem('bc_cheats')||'{}'));}catch(e){}
const saveSettings=()=>{localStorage.setItem('bc_settings',JSON.stringify(ST));localStorage.setItem('bc_cheats',JSON.stringify(CH));};
const creative=()=>G.meta&&G.meta.mode==='creative';
const infSupplies=()=>CH.supplies||creative();
// v1.1: No-clip only works while flying; flying itself always collides with blocks.
const canFly=()=>CH.fly||(creative()&&G.flyOn);
const noclipOn=()=>CH.noclip&&canFly();
// ===== chunk manager =====
let meshQ=0;
function updateChunks(budgetMs){const t0=performance.now();const pcx=Math.floor(G.p.x/16),pcz=Math.floor(G.p.z/16),R=ST.rd;
  // generate nearest missing chunks
  let gen=0;
  for(let r=0;r<=R+1&&performance.now()-t0<budgetMs;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
    if(!world.chunks.has(ck(pcx+dx,pcz+dz))){if(performance.now()-t0>budgetMs&&gen)break;loadChunk(pcx+dx,pcz+dz);gen++;}}
  // unload far
  for(const [k,ch] of world.chunks){if(Math.max(Math.abs(ch.cx-pcx),Math.abs(ch.cz-pcz))>R+3){for(let s=0;s<NSEC;s++){freeMesh(ch.secs[s]);freeMesh(ch.wsecs[s]);}world.chunks.delete(k);}}
  // mesh: collect candidates
  const psy=Math.floor(G.p.y/16);const above=G.p.y>SEA-14;const cand=[];
  for(let dz=-R;dz<=R;dz++)for(let dx=-R;dx<=R;dx++){const ch=world.chunks.get(ck(pcx+dx,pcz+dz));if(!ch)continue;
    let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1;b++)if(!world.chunks.has(ck(ch.cx+a,ch.cz+b))){ok=false;break;}
    for(let s=0;s<NSEC;s++){const vis=Math.abs(s-psy)<=2||(above&&s>=5);
      if(ch.secs[s])ch.secs[s].visible=vis;if(ch.wsecs[s])ch.wsecs[s].visible=vis;
      if(vis&&ok&&ch.dirty[s])cand.push([ch,s,ch.dirty[s]===2?-1:ch.dirty[s]===3?-.5+(dx*dx+dz*dz)*.001:dx*dx+dz*dz+(s-psy)*(s-psy)*.5]);}}
  cand.sort((a,b)=>a[2]-b[2]);meshQ=cand.length;
  for(const [ch,s] of cand){if(performance.now()-t0>budgetMs&&ch.dirty[s]!==2)break;const o=meshSection(ch,s);freeMesh(ch.secs[s]);freeMesh(ch.wsecs[s]);ch.secs[s]=buildMesh(o[0],matO);ch.wsecs[s]=buildMesh(o[1],matW);ch.dirty[s]=0;meshQ--;}}
// ===== physics =====
const isSolidAt=(x,y,z)=>{const b=getB(x,y,z);return b<0?true:SOLID[b]===1;};
function hitsWorld(x,y,z,w,h){for(let by=Math.floor(y);by<=Math.floor(y+h-1e-4);by++)for(let bz=Math.floor(z-w);bz<=Math.floor(z+w-1e-4);bz++)for(let bx=Math.floor(x-w);bx<=Math.floor(x+w-1e-4);bx++)if(isSolidAt(bx,by,bz))return true;return false;}
function moveEnt(e,dt,w,h,noclip){
  const res={hitX:false,hitZ:false};
  if(noclip){e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;e.ground=false;return res;}
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(e.vx),Math.abs(e.vy),Math.abs(e.vz))*dt/0.2));const sdt=dt/steps;e.ground=false;
  for(let i=0;i<steps;i++){
    let ny=e.y+e.vy*sdt;if(hitsWorld(e.x,ny,e.z,w,h)){if(e.vy<0){e.ground=true;ny=Math.floor(ny)+1;if(hitsWorld(e.x,ny,e.z,w,h))ny=e.y;}else{ny=Math.ceil(ny+h)-h-1e-3;if(hitsWorld(e.x,ny,e.z,w,h))ny=e.y;}e.vy=0;}e.y=ny;
    let nx=e.x+e.vx*sdt;if(hitsWorld(nx,e.y,e.z,w,h)){res.hitX=true;nx=e.vx>0?Math.floor(nx+w)-w-1e-3:Math.floor(nx-w)+1+w+1e-3;if(hitsWorld(nx,e.y,e.z,w,h))nx=e.x;e.vx=0;}e.x=nx;
    let nz=e.z+e.vz*sdt;if(hitsWorld(e.x,e.y,nz,w,h)){res.hitZ=true;nz=e.vz>0?Math.floor(nz+w)-w-1e-3:Math.floor(nz-w)+1+w+1e-3;if(hitsWorld(e.x,e.y,nz,w,h))nz=e.z;e.vz=0;}e.z=nz;}
  return res;}
// v1.7: does an entity box (center x/z, feet y, half-width w, height h) overlap a liquid of this kind (1 water, 2 lava)?
function touchLiq(e,w,h,kind){for(let by=Math.floor(e.y-.12);by<=Math.floor(e.y+h-.05);by++)for(let bz=Math.floor(e.z-w-.05);bz<=Math.floor(e.z+w+.05);bz++)for(let bx=Math.floor(e.x-w-.05);bx<=Math.floor(e.x+w+.05);bx++){const b=getB(bx,by,bz);if(b>0&&LIQ[b]===kind)return true;}return false;}
function touchBlock(e,w,h,id){for(let by=Math.floor(e.y+.05);by<=Math.floor(e.y+h-.05);by++)for(let bz=Math.floor(e.z-w-.05);bz<=Math.floor(e.z+w+.05);bz++)for(let bx=Math.floor(e.x-w-.05);bx<=Math.floor(e.x+w+.05);bx++)if(getB(bx,by,bz)===id)return true;return false;}
function inLiquid(x,y,z){const b=getB(Math.floor(x),Math.floor(y),Math.floor(z));return b>0?LIQ[b]:0;}
// ===== raycast (DDA) =====
function raycast(maxD){const p=G.p;const ox=p.x,oy=p.y+1.62,oz=p.z;const cp=Math.cos(p.pitch);const dx=-Math.sin(p.yaw)*cp,dy=Math.sin(p.pitch),dz=-Math.cos(p.yaw)*cp;
  let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);const sx=dx>0?1:-1,sy=dy>0?1:-1,sz=dz>0?1:-1;
  const tdx=Math.abs(1/dx),tdy=Math.abs(1/dy),tdz=Math.abs(1/dz);
  let tx=(dx>0?x+1-ox:ox-x)*tdx,ty=(dy>0?y+1-oy:oy-y)*tdy,tz=(dz>0?z+1-oz:oz-z)*tdz;let n=[0,0,0],t=0;
  while(t<=maxD){const b=getB(x,y,z);if(b>0&&!LIQ[b])return {x,y,z,n,b,t};
    if(tx<ty&&tx<tz){x+=sx;t=tx;tx+=tdx;n=[-sx,0,0];}else if(ty<tz){y+=sy;t=ty;ty+=tdy;n=[0,-sy,0];}else{z+=sz;t=tz;tz+=tdz;n=[0,0,-sz];}}
  return null;}
function lookDir(){const p=G.p,cp=Math.cos(p.pitch);return [-Math.sin(p.yaw)*cp,Math.sin(p.pitch),-Math.cos(p.yaw)*cp];}
// ===== input state =====
const IN={mx:0,mz:0,jump:false,up:false,down:false,breakHeld:false,keys:{}};
// ===== helpers =====
let toastT=0;function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');toastT=2.2;}
function invCount(id){return infSupplies()?Infinity:(G.inv[id]||0);}
function addInv(id,n){G.inv[id]=(G.inv[id]||0)+n;}
function addCoins(n){if(n>0){G.coins+=n;}}
function spend(n){if(CH.money)return true;if(G.coins<n)return false;G.coins-=n;return true;}
function toolSpeed(){let s=1;for(const t of TOOLS)if(G.tools[t.key])s=Math.max(s,t.speed);return s;}
function bestTool(){let b=TOOLS[0];for(const t of TOOLS)if(G.tools[t.key])b=t;return b;}
function hurt(n,why,kind){if(CH.god||G.dead||G.mode!=='play')return;let red=typeof armorReduction==='function'?armorReduction():0;if(kind==='fire')red=Math.min(red,.4);/* v1.7.1: armor only blocks up to 40% of lava/fire */n=Math.round(n*(1-red)*100)/100;G.lastHurt=n;G.hurtN=(G.hurtN||0)+1;G.hp=Math.max(0,G.hp-n);G.dmgFlash=.5;sfx('hurt');if(typeof hurtFx==='function')hurtFx(n,kind);if(G.hp<=0)die(why);}
function die(why){G.dead=true;document.getElementById('deathMsg').textContent=why||'You died';openScreen('death');}
function respawn(){G.dead=false;G.hp=20;const s=G.spawn||findSurface(0,0);G.p.x=s.x;G.p.y=s.y;G.p.z=s.z;G.p.vx=G.p.vy=G.p.vz=0;G.p.fallY=G.p.y;closeAll();}
function findSurface(x,z){x=Math.floor(x);z=Math.floor(z);let h=surfH(x,z);const ch=getChunk(x>>4,z>>4);if(ch){h=ch.top[(z&15)*16+(x&15)];}
  if(h<=SEA)h=SEA;return {x:x+.5,y:Math.min(H-2,h+1),z:z+.5};}
// ===== mining & placing =====
let target=null;
function canBreak(b){const bd=B[b];if(!bd||bd.nobreak)return false;if(bd.unbreak&&!CH.bedrock)return false;return true;}
function breakAt(t){const b=getB(t.x,t.y,t.z);if(b<=0||!canBreak(b))return false;
  if(B[b].door){const above=getB(t.x,t.y+1,t.z),below=getB(t.x,t.y-1,t.z);if(above>0&&B[above].door)setB(t.x,t.y+1,t.z,0);if(below>0&&B[below].door)setB(t.x,t.y-1,t.z,0);}
  // keep water: if a water block is adjacent (sideways/up), fill
  let fill=0;for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]]){const n=getB(t.x+dx,t.y+dy,t.z+dz);if(n===BN.water&&t.y<=SEA){fill=BN.water;}if(n===BN.lava&&t.y<=9)fill=BN.lava;}
  setB(t.x,t.y,t.z,fill);
  const bd=B[b];const drop=B[b].door?BN.doorx:(bd.drop?BN[bd.drop]:b);if(!infSupplies()&&!bd.nodrop)addInv(drop,1);if(bd.extra)addInv(BN[bd.extra],1);
  if(bd.coin){addCoins(bd.coin);floatCoin('+$'+bd.coin);}
  G.stats.mined++;spawnBreak(t.x,t.y,t.z,b);sfx('break');return true;}
function playerBox(){return {x0:G.p.x-.3,x1:G.p.x+.3,y0:G.p.y,y1:G.p.y+1.8,z0:G.p.z-.3,z1:G.p.z+.3};}
function cellFree(x,y,z){const b=getB(x,y,z);return b===0||(b>0&&(LIQ[b]||b===BN.fire));}
function intersectsPlayer(x,y,z){const p=playerBox();return x<p.x1&&x+1>p.x0&&y<p.y1&&y+1>p.y0&&z<p.z1&&z+1>p.z0;}
function placeAt(t,id){if(id===undefined)id=G.hot[G.sel];if(!id)return false;if(B[id].item)return false;
  const b=getB(t.x,t.y,t.z);
  if(b>0&&B[b].door){toggleDoor(t.x,t.y,t.z);return 'door';}
  if(b===BN.bed){useBed();return 'bed';}
  if(invCount(id)<1){toast('Out of '+B[id].name+' - buy more in the Shop');return false;}
  const x=t.x+t.n[0],y=t.y+t.n[1],z=t.z+t.n[2];if(y<0||y>=H)return false;
  if(!cellFree(x,y,z))return false;
  let pid=id;
  if(B[id].door){const d=lookDir();pid=Math.abs(d[0])>Math.abs(d[2])?BN.doorz:BN.doorx;if(y+1>=H||!cellFree(x,y+1,z))return false;}
  if(SOLID[pid]&&!CH.noclip&&intersectsPlayer(x,y,z))return false;
  if(B[id].door&&!CH.noclip&&intersectsPlayer(x,y+1,z)&&SOLID[pid])return false;
  for(const m of G.mobs.concat(G.npcs||[],G.animals||[]))if(SOLID[pid]&&x<m.x+.35&&x+1>m.x-.35&&y<m.y+m.h&&y+1>m.y&&z<m.z+.35&&z+1>m.z-.35)return false;
  setB(x,y,z,pid);if(B[id].door)setB(x,y+1,z,pid);
  if(!infSupplies()){G.inv[id]--;}
  G.stats.placed++;sfx('place');updHotbar();return true;}
function toggleDoor(x,y,z){const b=getB(x,y,z);const M={[BN.doorx]:BN.doorxo,[BN.doorxo]:BN.doorx,[BN.doorz]:BN.doorzo,[BN.doorzo]:BN.doorz};
  for(const yy of [y-1,y,y+1]){const v=getB(x,yy,z);if(v>0&&B[v].door&&M[v]!==undefined)setB(x,yy,z,M[v]);}sfx('door');}
function useBed(){G.spawn={x:G.p.x,y:G.p.y,z:G.p.z};const night=dayFactor()<.5;if(night&&!CH.day){G.time=.02;toast('Slept through the night. Spawn set!');}else toast('Spawn point set at this bed');}
function eyeDist(e){return Math.hypot(e.x-G.p.x,(e.y+(e.h||1)/2)-(G.p.y+1.62),e.z-G.p.z);}
function tapAction(){if(G.mode!=='play')return;const n=npcUnderCrosshair(),m=mobUnderCrosshair(),a=animalUnderCrosshair(isFeedItem(heldId())?Math.max(4.5,attackInfo().reach):undefined);
  const c=[n,m,a].filter(Boolean).sort((p,q)=>eyeDist(p)-eyeDist(q))[0];
  if(c){if(c===n){if(n.hostile)hitNPC(n);else talkTo(n);}else if(c===m){if(heldB()&&heldB().key==='bow')shootArrow();else hitMob(m);}else{if(heldB()&&heldB().key==='bow'&&!a.pet)shootArrow();else interactAnimal(a);}return;}
  const id=heldId();const t=raycast(6);
  if(t&&B[t.b].cook&&!(B[id]&&B[id].item&&!B[id].cooksTo)){openCook(t);return;}
  if(useItem(id))return;const f=fishUnderCrosshair();if(f){catchFishHand(f);return;}
  if(t)placeAt(t);}
function updateMining(dt){if(T.look&&!T.look.moved&&performance.now()-T.look.t>280)touchMine=true;const holding=IN.breakHeld||touchMine;target=raycast(6);
  if(target){selBox.visible=true;const b=B[target.b];if(b.shape&&!b.door){const s=b.shape;selBox.scale.set(s[3]-s[0]+.004,s[4]-s[1]+.004,s[5]-s[2]+.004);selBox.position.set(target.x+(s[0]+s[3])/2,target.y+(s[1]+s[4])/2,target.z+(s[2]+s[5])/2);}else{selBox.scale.set(1,1,1);selBox.position.set(target.x+.5,target.y+.5,target.z+.5);}}else selBox.visible=false;
  const ring=document.getElementById('ring');
  if(!holding||G.mode!=='play'){G.eatT=0;G.mine.t=0;G.mine.key='';crackBox.visible=false;ring.style.opacity=0;G.mine.cool=0;return;}
  G.mine.cool=Math.max(0,(G.mine.cool||0)-dt);
  const cd=attackInfo().cd;
  const nn=npcUnderCrosshair();if(nn){if(G.mine.cool<=0){hitNPC(nn);G.mine.cool=cd;}return;}
  const m=mobUnderCrosshair();if(m){if(G.mine.cool<=0){hitMob(m);G.mine.cool=cd;}return;}
  const an=animalUnderCrosshair(isFeedItem(heldId())?4.5:undefined);if(an){if(G.mine.cool<=0){if(isFeedItem(heldId())){feedAnimal(an);G.mine.cool=.6;}else if(!an.pet&&canAttackAnimal()){hitAnimal(an);G.mine.cool=cd;}}return;}
  const hb=heldB();if(hb&&hb.food&&invCount(hb.id)>0&&hungry()){G.eatT=(G.eatT||0)+dt;G.swingT=.2;crackBox.visible=false;ring.style.opacity=1;ring.style.setProperty('--p',Math.min(100,G.eatT/.9*100)+'%');if(G.eatT>=.9){G.eatT=0;eatFood(hb.id);}return;}
  if(!target){G.mine.t=0;crackBox.visible=false;ring.style.opacity=0;return;}
  const key=target.x+','+target.y+','+target.z;if(key!==G.mine.key){G.mine.key=key;G.mine.t=0;}
  if(!canBreak(target.b)){ring.style.opacity=0;crackBox.visible=false;if(!G.mine.warned){toast(B[target.b].unbreak?'Bedrock is unbreakable (turn on Break Bedrock cheat)':"Can't break that");G.mine.warned=1;}return;}
  G.mine.warned=0;
  const hk=(heldB()||{}).key;const woody=B[target.b].cat==='Wood'||target.b===BN.leaves||target.b===BN.pineleaves;const need=CH.instant?0:B[target.b].hard/toolSpeed()/((hk==='axe'&&woody)?3:1);
  if(G.mine.cool>0)return;
  G.mine.t+=dt;const f=need<=0?1:G.mine.t/need;
  crackBox.visible=need>0;crackBox.position.copy(selBox.position);crackMat.opacity=Math.min(.6,f*.6);
  ring.style.opacity=need>0?1:0;ring.style.setProperty('--p',Math.min(100,f*100)+'%');
  if(f>=1){G.swingT=.25;breakAt(target);G.mine.t=0;G.mine.key='';G.mine.cool=CH.instant?.12:.08;crackBox.visible=false;}}
// ===== break particles & floating text =====
function spawnBreak(x,y,z,b){const t=B[b].tx[0];const c=new THREE.Color().setHSL(0,0,.5);const mat=new THREE.MeshBasicMaterial({color:avgColor(t)});
  for(let i=0;i<6;i++){const m=new THREE.Mesh(brkGeo,mat);m.position.set(x+.2+Math.random()*.6,y+.2+Math.random()*.6,z+.2+Math.random()*.6);m.userData={vx:(Math.random()-.5)*3,vy:Math.random()*3,vz:(Math.random()-.5)*3,t:.6};scene.add(m);brk.push(m);}}
const avgC={};function avgColor(t){if(avgC[t]!==undefined)return avgC[t];const d=actx.getImageData((t%ATW)*TS,((t/ATW)|0)*TS,TS,TS).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>100){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}n=n||1;return avgC[t]=(Math.round(r/n)<<16)|(Math.round(g/n)<<8)|Math.round(b/n);}
function updBreak(dt){for(let i=brk.length-1;i>=0;i--){const m=brk[i],u=m.userData;u.t-=dt;u.vy-=12*dt;m.position.x+=u.vx*dt;m.position.y+=u.vy*dt;m.position.z+=u.vz*dt;if(u.t<=0){scene.remove(m);brk.splice(i,1);}}}
function floatCoin(txt){const e=document.createElement('div');e.className='floatc';e.textContent=txt;document.getElementById('hud').appendChild(e);setTimeout(()=>e.remove(),1100);}
// ===== day/night & zones =====
function dayFactor(){const s=Math.sin(G.time*Math.PI*2);return Math.min(1,Math.max(0,(s+.15)/.45));}
const C3=(r,g,b)=>new THREE.Color(r,g,b);
const tmpC=new THREE.Color(),tmpC2=new THREE.Color();
function updateEnv(dt){if(CH.day)G.time=.25;else G.time=(G.time+dt/600)%1;
  const df=dayFactor();const p=G.p,ey=p.y+1.62;
  const skyCol=tmpC.setRGB(.05,.07,.16).lerp(C3(.52,.75,1),df);
  if(G.time>0.46&&G.time<0.56||G.time>0.96||G.time<0.04)skyCol.lerp(C3(1,.55,.3),.25*df);
  U.uSky.value.setRGB(.16,.18,.3).lerp(C3(1,1,1),df);
  // underground factor
  const ch=getChunk(Math.floor(p.x)>>4,Math.floor(p.z)>>4);const top=ch?ch.top[(Math.floor(p.z)&15)*16+(Math.floor(p.x)&15)]:0;
  const ug=Math.min(1,Math.max(0,(top-ey-2)/8));
  const R=ST.rd*16;let fog=tmpC2.copy(skyCol),near=R*.55,far=R*.95,amb=C3(.07,.07,.09);
  const cave=C3(.03,.03,.04);fog.lerp(cave,ug);near=near*(1-ug)+14*ug;far=far*(1-ug)+R*.8*ug;amb.lerp(C3(.15,.15,.17),ug);
  const deep=Math.min(1,Math.max(0,(DEEP_TOP+4-ey)/10));if(deep>0){fog.lerp(C3(.01,.015,.04),deep);near=near*(1-deep)+10*deep;far=far*(1-deep)+Math.min(48,R*.8)*deep;amb.lerp(C3(.1,.11,.16),deep);}
  const hell=Math.min(1,Math.max(0,(HELL_TOP+6-ey)/8));if(hell>0){fog.lerp(C3(.28,.04,.02),hell);near=near*(1-hell)+6*hell;far=far*(1-hell)+Math.min(52,R*.85)*hell;amb.lerp(C3(.62,.3,.22),hell);}
  U.uFog.value.copy(fog);U.uFogR.value.set(near,far);U.uAmb.value.copy(amb);U.uCam.value.set(p.x,ey,p.z);
  renderer.setClearColor(fog);
  G.zone=ey<HELL_TOP+2?'Hell':ey<DEEP_TOP?'Deep Dark':ug>.5?'Caves':'Overworld';
  // sun/moon
  const a=G.time*Math.PI*2;const sx=Math.cos(a)*150,sy=Math.sin(a)*150;
  sun.position.set(p.x+sx,ey+sy,p.z+30);sun.lookAt(p.x,ey,p.z);moon.position.set(p.x-sx,ey-sy,p.z-30);moon.lookAt(p.x,ey,p.z);
  sun.visible=ug<.5&&hell<=0;moon.visible=sun.visible;
  // embers
  embers.visible=hell>0.2;if(embers.visible){for(let i=0;i<EMB;i++){const j=i*3;if(embVel[j+1]===0||embPos[j+1]>ey+8||Math.abs(embPos[j]-p.x)>14||Math.abs(embPos[j+2]-p.z)>14){embPos[j]=p.x+(Math.random()-.5)*26;embPos[j+1]=ey-6+Math.random()*8;embPos[j+2]=p.z+(Math.random()-.5)*26;embVel[j]=(Math.random()-.5)*.6;embVel[j+1]=.6+Math.random()*1.4;embVel[j+2]=(Math.random()-.5)*.6;}
    embPos[j]+=embVel[j]*dt+Math.sin(performance.now()/500+i)*dt*.3;embPos[j+1]+=embVel[j+1]*dt;embPos[j+2]+=embVel[j+2]*dt;}embGeo.attributes.position.needsUpdate=true;}}
// ===== player update =====
// ===== v1.1: safe spots, LAND, rescue =====
const PW_=.3,PH_=1.8;
const fits=(x,y,z)=>!hitsWorld(x,y,z,PW_,PH_);
// nearest open space at or above y (player-sized)
function openAbove(x,y,z){let yy=Math.max(1,Math.floor(y));while(yy<H-2&&!fits(x,yy,z))yy++;return yy;}
// first solid ground below (air/water/lava are passed through); stand on top of liquid if ground is submerged
function landSpot(x,y,z){
  if(!fits(x,y,z))return openAbove(x,y,z);
  let yy=Math.min(H-2,Math.floor(y));
  while(yy>1&&!hitsWorld(x,yy-1,z,PW_,.99))yy--;   // bedrock is at y=0, so this always stops
  if(!fits(x,yy,z))yy=openAbove(x,yy,z);
  // ground under liquid: rise to the liquid surface
  while(yy<H-2&&inLiquid(x,yy+.1,z)&&fits(x,yy+1,z))yy++;
  return yy;}
function landNow(){const p=G.p;CH.fly=false;CH.noclip=false;G.flyOn=false;saveSettings();
  const ty=landSpot(p.x,p.y,p.z);p.vx=p.vz=0;p.vy=0;
  if(ty<p.y&&p.y-ty<=64)G.land={ty};else{p.y=ty;p.fallY=ty;G.land=null;}
  if(typeof updHotbar==='function')updHotbar();if(typeof toast==='function')toast('Landed');return ty;}
function rescue(why){const p=G.p;const y=openAbove(p.x,Math.max(1,p.y),p.z);p.y=y;p.vy=0;p.fallY=y;G.rescues=(G.rescues||0)+1;return y;}
function updatePlayer(dt){if(G.dead)return;
  // v1.1: clamp large frame steps and substep physics (slow phones)
  dt=Math.min(dt,.1);const n=Math.max(1,Math.ceil(dt/.02));for(let i=0;i<n;i++)updatePlayerStep(dt/n);}
function updatePlayerStep(dt){const p=G.p;if(G.dead)return;
  if(G.land){const L=G.land;p.vx=p.vz=0;p.vy=0;p.y=Math.max(L.ty,p.y-60*dt);p.fallY=p.y;if(p.y<=L.ty){p.y=L.ty;G.land=null;p.ground=true;}return;}
  if(!canFly()&&CH.noclip){CH.noclip=false;saveSettings();}
  const fly=canFly(),nc=noclipOn();
  let mx=IN.mx,mz=IN.mz;const K=IN.keys;if(K.KeyW)mz-=1;if(K.KeyS)mz+=1;if(K.KeyA)mx-=1;if(K.KeyD)mx+=1;
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}
  const liq=inLiquid(p.x,p.y+.4,p.z);const sp=fly?9:liq?2.6:4.4;
  const s=Math.sin(p.yaw),c=Math.cos(p.yaw);
  const wx=(mx*c+mz*s)*sp,wz=(-mx*s+mz*c)*sp;
  p.vx=wx;p.vz=wz;
  const jump=IN.jump||K.Space;
  if(fly){const up=(IN.up||K.Space||IN.jump)?1:0,dn=(IN.down||K.ShiftLeft)?1:0;p.vy=(up-dn)*8;p.fallY=p.y;}
  else if(liq){p.vy=Math.max(p.vy-9*dt,-2.5);if(jump||G.jumpQ>0)p.vy=3.2;p.fallY=p.y;}
  else{p.vy=Math.max(p.vy-28*dt,-50);if((jump||G.jumpQ>0)&&p.ground){p.vy=8.6;G.jumpQ=0;}}
  G.jumpQ=Math.max(0,(G.jumpQ||0)-dt);
  if(!nc&&(p.y<1||hitsWorld(p.x,p.y,p.z,.3,1.8)))rescue();
  const wasG=p.ground;const r=moveEnt(p,dt,.3,1.8,nc);
  // auto-jump over 1-block steps
  if(!fly&&ST.autojump&&p.ground&&(r.hitX||r.hitZ)&&ml>.3){const fx=p.x+Math.sign(wx)*.5*(r.hitX?1:0),fz=p.z+Math.sign(wz)*.5*(r.hitZ?1:0);
    if(!hitsWorld(p.x,p.y+1.05,p.z,.3,1.8)&&hitsWorld(fx,p.y,fz,.3,.95)&&!hitsWorld(fx,p.y+1.05,fz,.3,1.8))p.vy=8.6;}
  if(p.ground&&!wasG&&!fly){const fall=p.fallY-p.y;if(fall>3.6&&!liq)hurt(Math.floor(fall-3),'You fell too far');}
  if(p.ground||liq||fly)p.fallY=p.y;else if(p.vy>0)p.fallY=Math.max(p.fallY,p.y);else p.fallY=Math.max(p.fallY,p.y);
  // lava
  // v1.7: standing in OR touching lava (box overlap) burns, and sets you on fire for a while
  const inLava=touchLiq(p,.3,1.8,2);
  if(inLava&&!CH.god){G.lavaT-=dt;if(G.lavaT<=0){G.envDmg=1;hurt(4,'You burned in lava','fire');G.envDmg=0;G.lavaT=.5;}G.fireT=Math.max(G.fireT||0,5);}else G.lavaT=0;
  if(inLava&&CH.god&&!G.godLavaTold){G.godLavaTold=1;toast('God Mode is ON, so lava can\'t hurt you. Turn it off in $ CHEATS');}
  document.getElementById('lavaFx').style.opacity=inLava?.55:0;
  if(nc&&p.y<-8){p.y=-8;p.vy=Math.max(0,p.vy);}
  if(!nc&&p.y<1)rescue();
  if(p.y>H+40)p.y=H+40;
  // regen
  if(!CH.god&&G.hp<20&&G.hp>0&&!(hungerOn()&&G.food<6)){G.regen=(G.regen||0)+dt;if(G.regen>4){G.hp=Math.min(20,G.hp+1);G.regen=0;}}
  if(CH.god)G.hp=20;
  camera.position.set(p.x,p.y+1.62,p.z);camera.rotation.set(p.pitch,p.yaw,0);}
// ===== mobs =====
const mobMats={};function mobMat(c){return mobMats[c]||(mobMats[c]=new THREE.MeshLambertMaterial({color:c}));}
scene.add(new THREE.AmbientLight(0xffffff,.8));const dl=new THREE.DirectionalLight(0xffffff,.6);dl.position.set(.4,1,.3);scene.add(dl);
function makeMob(type){const g=new THREE.Group();const box=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mobMat(c));m.position.set(x,y,z);g.add(m);return m;};
  if(type==='zombie'){box(.5,.7,.3,0x3a5fa8,0,1.05,0);box(.5,.5,.5,0x5f9a4c,0,1.65,0);box(.2,.7,.25,0x3b3b6e,-.13,.35,0);box(.2,.7,.25,0x3b3b6e,.13,.35,0);box(.18,.18,.6,0x5f9a4c,-.34,1.25,-.25);box(.18,.18,.6,0x5f9a4c,.34,1.25,-.25);box(.1,.08,.02,0x111111,-.12,1.7,-.26);box(.1,.08,.02,0x111111,.12,1.7,-.26);}
  else{box(.45,.5,.3,0xb02818,0,.7,0);box(.42,.4,.4,0xd8401c,0,1.15,0);box(.08,.2,.08,0x2a1a10,-.15,1.42,0);box(.08,.2,.08,0x2a1a10,.15,1.42,0);box(.12,.45,.15,0x701810,-.1,.22,0);box(.12,.45,.15,0x701810,.1,.22,0);box(.1,.06,.02,0xffe040,-.1,1.2,-.21);box(.1,.06,.02,0xffe040,.1,1.2,-.21);box(.6,.05,.25,0x501010,0,.95,.2);}
  scene.add(g);return g;}
function spawnMob(type,x,y,z){const m={type,x,y,z,vx:0,vy:0,vz:0,ground:false,hp:type==='zombie'?20:16,h:type==='zombie'?1.9:1.4,atk:0,hurtT:0,g:makeMob(type)};G.mobs.push(m);return m;}
function killMob(m,reward){scene.remove(m.g);const i=G.mobs.indexOf(m);if(i>=0)G.mobs.splice(i,1);if(reward){const c=m.type==='zombie'?10:25;addCoins(c);floatCoin('+$'+c);G.stats.kills++;if(m.type==='zombie'&&Math.random()<.5)addInv(BN.bone,1);}}
function mobUnderCrosshair(){const d=lookDir(),p=G.p,o=[p.x,p.y+1.62,p.z];let best=null,bt=attackInfo().reach;const blk=raycast(6);if(blk)bt=Math.min(bt,blk.t);
  for(const m of G.mobs){const mn=[m.x-.4,m.y,m.z-.4],mx=[m.x+.4,m.y+m.h,m.z+.4];let t0=0,t1=bt;let ok=true;for(let a=0;a<3;a++){if(Math.abs(d[a])<1e-6){if(o[a]<mn[a]||o[a]>mx[a]){ok=false;break;}continue;}let ta=(mn[a]-o[a])/d[a],tb=(mx[a]-o[a])/d[a];if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){ok=false;break;}}if(ok&&t0<bt){bt=t0;best=m;}}return best;}
function hitMob(m){const a=attackInfo();G.swingT=.25;G.hits=(G.hits||0)+1;dmgMob(m,a.dmg,a.kb,lookDir());}
function updateMobs(dt){const p=G.p;const night=dayFactor()<.35;const inHell=p.y<HELL_TOP;
  G.mobSpawnT=(G.mobSpawnT||0)-dt;
  if(ST.mobs!==false&&G.mobSpawnT<=0&&G.mobs.length<5){G.mobSpawnT=6;const type=inHell?'imp':(night&&p.y>SEA-10)?'zombie':null;
    if(type){const a=Math.random()*Math.PI*2,r=14+Math.random()*8;const x=Math.floor(p.x+Math.cos(a)*r),z=Math.floor(p.z+Math.sin(a)*r);
      if(type==='zombie'){const s=findSurface(x,z);if(getChunk(x>>4,z>>4)&&getB(x,s.y-1,z)!==BN.water)spawnMob(type,s.x,s.y,s.z);}
      else{for(let y=Math.min(HELL_TOP-2,Math.floor(p.y)+6);y>3;y--){if(getB(x,y,z)===0&&getB(x,y+1,z)===0&&SOLID[getB(x,y-1,z)]){spawnMob(type,x+.5,y,z+.5);break;}}}}}
  for(const m of G.mobs.slice()){const dx=p.x-m.x,dz=p.z-m.z,dist=Math.hypot(dx,dz);
    if(dist>48||(m.type==='zombie'&&!night&&dist>10)||(m.type==='imp'&&!inHell&&dist>20)||!getChunk(Math.floor(m.x)>>4,Math.floor(m.z)>>4)){killMob(m,false);continue;}
    const sp=m.type==='zombie'?2.6:3.2;const tx=dist>1.0?dx/dist*sp:0,tz=dist>1.0?dz/dist*sp:0;
    m.vx+=(tx-m.vx)*Math.min(1,dt*4);m.vz+=(tz-m.vz)*Math.min(1,dt*4);m.vy=Math.max(m.vy-28*dt,-40);
    const r=moveEnt(m,dt,.3,m.h,false);if((r.hitX||r.hitZ)&&m.ground)m.vy=8.2;
    if(inLiquid(m.x,m.y+.2,m.z)===2&&m.type==='zombie')m.hp-=dt*4;if(m.hp<=0){killMob(m,false);continue;}
    m.atk-=dt;if(dist<1.3&&Math.abs(p.y-m.y)<1.6&&m.atk<=0&&!G.dead){m.atk=1;hurt(m.type==='zombie'?4:3,m.type==='zombie'?'A zombie got you':'An imp got you');}
    m.g.position.set(m.x,m.y,m.z);m.g.rotation.y=Math.atan2(-dx,-dz);m.hurtT-=dt;m.g.scale.setScalar(m.hurtT>0?1.08:1);}}
// ===== sound (tiny synth, offline) =====
let AC=null;function sfx(k){if(!ST.vol)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);const t=AC.currentTime;
  const S={break:[180,60,'square',.08],place:[320,200,'triangle',.06],door:[140,90,'sawtooth',.05],hit:[120,50,'square',.1],hurt:[220,70,'sawtooth',.18],buy:[600,900,'sine',.08],click:[700,700,'sine',.03]}[k]||[400,400,'sine',.05];
  o.type=S[2];o.frequency.setValueAtTime(S[0],t);o.frequency.exponentialRampToValueAtTime(S[1],t+S[3]);g.gain.setValueAtTime((k==='hurt'?.2:.08)*ST.vol,t);g.gain.exponentialRampToValueAtTime(.001,t+S[3]+.02);o.start(t);o.stop(t+S[3]+.03);}catch(e){}}
// ===== teleports =====
function tpSurface(){const s=findSurface(G.p.x,G.p.z);G.p.x=s.x;G.p.y=s.y+.01;G.p.z=s.z;G.p.vy=0;G.p.fallY=G.p.y;}
function tpHell(){const bx=Math.floor(G.p.x),bz=Math.floor(G.p.z);
  // v1.2: land on the approach to the nearest demon city (just outside its lava moat, facing the south gate)
  const hc=nearestCity('h',bx,bz,400);if(hc){const x=hc.x+.5,z=hc.z+hc.R+8+.5;ensureArea(x,z);const y=openAbove(x,hc.g+1,z);G.p.x=x;G.p.z=z;G.p.y=y;G.p.vy=0;G.p.fallY=y;G.p.yaw=0;G.p.pitch=-.05;G.lastHellCity=hc;return true;}
  for(let r=0;r<24;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=bx+dx,z=bz+dz;if(!getChunk(x>>4,z>>4))continue;
    for(let y=HELL_TOP-4;y>=10;y--){const f=getB(x,y-1,z);if(SOLID[f]&&f!==BN.bedrock&&getB(x,y,z)===0&&getB(x,y+1,z)===0&&getB(x,y+2,z)===0){G.p.x=x+.5;G.p.y=y;G.p.z=z+.5;G.p.vy=0;G.p.fallY=y;return true;}}}
  // carve a small room
  const y=20;for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){setB(bx+dx,y-1,bz+dz,BN.brimrock);for(let k=0;k<4;k++)setB(bx+dx,y+k,bz+dz,0);}
  G.p.x=bx+.5;G.p.y=y;G.p.z=bz+.5;G.p.vy=0;G.p.fallY=y;return true;}
function ensureArea(x,z){const cx=Math.floor(x)>>4,cz=Math.floor(z)>>4;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(!getChunk(cx+dx,cz+dz))loadChunk(cx+dx,cz+dz);}
// chunks a 1.0/1.1 world has (or may have) generated: edited chunks plus the area around the player, spawn and the world origin
function legacyCities(s){const old=new Set(Object.keys(s.edits||{}));const pts=[s.p,s.spawn,spawnXZ()].filter(Boolean);
  for(const q of pts){const cx=Math.floor(q.x)>>4,cz=Math.floor(q.z)>>4;for(let dz=-11;dz<=11;dz++)for(let dx=-11;dx<=11;dx++)old.add((cx+dx)+','+(cz+dz));}
  for(const k of old){const [cx,cz]=k.split(',').map(Number);for(const c of citiesTouchingChunk(cx,cz,true))CITY.off.add(c.id);}
  CITY.cells.clear();return CITY.off.size;}
// ===== save / load =====
const SLOTS=3;const slotKey=n=>'bc_slot_'+n;
function slotMeta(n){try{const s=JSON.parse(localStorage.getItem(slotKey(n))||'null');return s;}catch(e){return null;}}
function serialize(){const ed={};for(const [k,m] of world.edits){const a=[];for(const [i,id] of m)a.push(i,id);ed[k]=a;}
  return Object.assign({v:3,cityOff:[...CITY.off],cityState:G.cityState,name:G.meta.name,mode:G.meta.mode,seed:SEED,created:G.meta.created,saved:Date.now(),playT:G.playT,p:{x:G.p.x,y:G.p.y,z:G.p.z,yaw:G.p.yaw,pitch:G.p.pitch},spawn:G.spawn,hp:G.hp,coins:G.coins,inv:G.inv,hot:G.hot,sel:G.sel,time:G.time,tools:G.tools,stats:G.stats,flyOn:G.flyOn,edits:ed},lifeSave());}
function saveWorld(){if(G.slot<0||!G.meta)return false;try{localStorage.setItem(slotKey(G.slot),JSON.stringify(serialize()));G.lastSave=Date.now();return true;}catch(e){toast('Save failed: storage full');return false;}}
function clearWorld(){for(const [,ch] of world.chunks)for(let s=0;s<NSEC;s++){freeMesh(ch.secs[s]);freeMesh(ch.wsecs[s]);}world.chunks.clear();world.edits.clear();for(const m of G.mobs.slice())killMob(m,false);if(typeof npcClear==='function')npcClear();if(typeof lifeClear==='function')lifeClear();}
const STARTER={campfire:1,bucket:1,sword_wood:1,wheat:12,bone:4,rod:1,planks:64,glass:32,brick:48,stonebrick:48,torch:24,doorx:4,bed:1,log:16,wool0:16,wool4:16,lamp:8,roof:32,dirt:16};
function startWorld(slot,newMeta){clearWorld();let s=newMeta?null:slotMeta(slot);
  if(!s){s={name:newMeta.name,mode:newMeta.mode,seed:newMeta.seed,created:Date.now(),inv:{},coins:50,hp:20,time:.05,tools:{hand:1},hot:null,sel:0,edits:{},stats:null};for(const k in STARTER)s.inv[BN[k]]=STARTER[k];}
  G.slot=slot;G.meta={name:s.name,mode:s.mode,created:s.created};SEED=s.seed;
  // v1.2 cities: saves from 1.0/1.1 (v:1) get cities only where the land was never generated before
  cityReset(s.cityOff);SNOW_OFF.clear();for(const k of (s.snowOff||[]))SNOW_OFF.add(k);G.legacySnow=0;if(!newMeta&&!(s.v>=3))G.legacySnow=legacySnow(s);G.cityState=s.cityState||{};G.legacyCities=0;if(!newMeta&&!(s.v>=2))G.legacyCities=legacyCities(s);G.inv=s.inv||{};G.coins=s.coins||0;G.hp=s.hp||20;G.time=s.time||.05;G.tools=s.tools||{hand:1};G.playT=s.playT||0;G.flyOn=!!s.flyOn;
  G.hot=s.hot||[BN.planks,BN.glass,BN.brick,BN.stonebrick,BN.torch,BN.doorx,BN.bed,BN.roof,BN.lamp];G.sel=s.sel||0;G.stats=s.stats||{mined:0,placed:0,kills:0};
  for(const k in (s.edits||{})){const a=s.edits[k],m=new Map();for(let i=0;i<a.length;i+=2)m.set(a[i],a[i+1]);world.edits.set(k,m);}
  G.spawn=s.spawn||null;
  if(s.p){Object.assign(G.p,s.p,{vx:0,vy:0,vz:0});}
  else{const best=spawnXZ();Object.assign(G.p,best,{yaw:0,pitch:-.25,vx:0,vy:0,vz:0});G.spawn={x:best.x,y:best.y,z:best.z};}
  G.p.fallY=G.p.y;G.dead=false;
  // generate the area around the player synchronously so we don't fall
  const pcx=Math.floor(G.p.x/16),pcz=Math.floor(G.p.z/16);for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)if(!getChunk(pcx+dx,pcz+dz))loadChunk(pcx+dx,pcz+dz);
  if(!s.p){const t=findSurface(G.p.x,G.p.z);G.p.y=t.y;G.spawn={x:t.x,y:t.y,z:t.z};}
  else if(hitsWorld(G.p.x,G.p.y,G.p.z,.3,1.8)&&!CH.noclip){/* stuck: lift up */let y=Math.floor(G.p.y);while(y<H-2&&hitsWorld(G.p.x,y,G.p.z,.3,1.8))y++;G.p.y=y;}
  lifeLoad(s);if(G.legacySnow){for(const k of ['campfire','bucket','sword_wood','rod'])addInv(BN[k],1);addInv(BN.wheat,12);addInv(BN.bone,4);}
  G.mode='play';closeAll();showHUD(true);updHotbar();saveWorld();if(G.legacySnow)toast('Updated to 1.3: animals, pets, fish, food, gear and snowlands! A starter kit is in your Blocks');else if(G.legacyCities)toast('Updated to 1.2: new cities appear in land you have not explored yet');}
// ===== layout =====
function layout(){const w=innerWidth,h=innerHeight;const u=Math.min(h/412,w/915*1.15);document.documentElement.style.setProperty('--u',(Math.max(.6,Math.min(2.2,u))).toFixed(3)+'px');
  const pr=Math.min(window.devicePixelRatio||1,1)*ST.quality;renderer.setPixelRatio(pr);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',layout);
const $=id=>document.getElementById(id);
// ===== screens & back handling =====
const stack=[];
function openScreen(n){const e=$('s-'+n);if(!e)return;if(stack[stack.length-1]!==n){stack.push(n);}document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('show',s.id==='s-'+stack[stack.length-1]));
  if(n==='cheats')renderCheats();if(n==='inv')renderInv();if(n==='shop')renderShop();if(n==='settings')renderSettings();if(n==='worlds')renderWorlds();if(n==='pause')renderPause();if(n==='trade')renderTrade();if(n==='cook')renderCook();if(n==='equip')renderEquip();if(n==='pets')renderPets();if(n==='petpick')renderPetPick();if(n==='char')renderChar();
  resetTouches();}
function closeTop(){const n=stack.pop();if(n==='death'){respawn();return;}
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('show',s.id==='s-'+stack[stack.length-1]));
  if(G.mode==='play'&&!stack.length)updHotbar();resetTouches();}
function closeAll(){stack.length=0;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('show'));if(G.mode==='title')openScreen('title');resetTouches();}
function goTitle(){if(G.mode==='play')saveWorld();clearWorld();G.mode='title';G.slot=-1;G.meta=null;showHUD(false);stack.length=0;openScreen('title');}
function pauseGame(){if(G.mode!=='play'||stack.length)return;saveWorld();openScreen('pause');}
window.bcBack=function(){ // returns true if handled
  if(stack.length){const top=stack[stack.length-1];if(top==='title')return false;closeTop();return true;}
  if(G.mode==='play'){pauseGame();return true;}return false;};
window.dhBack=window.bcBack;
window.dhPause=function(){if(G.mode==='play'){saveWorld();if(!stack.length)openScreen('pause');}};
window.dhResume=function(){lastT=performance.now();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)window.dhPause();});
addEventListener('keydown',e=>{IN.keys[e.code]=true;if(e.code==='Escape'){window.bcBack();}if(G.mode==='play'&&!stack.length){if(/^Digit[1-9]$/.test(e.code)){G.sel=+e.code.slice(5)-1;updHotbar();}if(e.code==='KeyE')openScreen('inv');if(e.code==='KeyG')openScreen('equip');if(e.code==='KeyF'){const id=heldId();if(B[id]&&B[id].food)eatFood(id);}}});
addEventListener('keyup',e=>{IN.keys[e.code]=false;});
function showHUD(v){$('hud').classList.toggle('hidden',!v);}
function bindTap(el,fn){el.addEventListener('click',e=>{e.stopPropagation();sfx('click');fn(e);});}
document.querySelectorAll('[data-back]').forEach(b=>bindTap(b,()=>closeTop()));
// ===== title art =====
(function(){const c=$('titleArt'),g=c.getContext('2d');g.imageSmoothingEnabled=false;const ids=[BN.grass,BN.dirt,BN.stone,BN.coal_ore,BN.darkstone,BN.diamond_ore,BN.brimrock,BN.hellstone,BN.lava,BN.bedrock];
  const tiles=[[0,BN.grass],[1,BN.grass],[2,BN.grass],[3,BN.grass],[4,BN.grass]];let x=0;const imgs=[];let loaded=0;
  const order=[BN.grass,BN.dirt,BN.stone,BN.gold_ore,BN.darkstone,BN.diamond_ore,BN.brimrock,BN.hellstone,BN.lava];
  order.forEach((id,i)=>{const im=new Image();im.onload=()=>{g.drawImage(im,i*35,20+Math.sin(i)*14,48,48);};im.src=blockIcon(id);});})();
// ===== world list =====
function fmtT(s){s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s/60)%60;return h?h+'h '+m+'m':m+'m';}
function renderWorlds(){const L=$('worldList');L.innerHTML='';for(let n=0;n<SLOTS;n++){const s=slotMeta(n);const r=document.createElement('div');r.className='wrow';
  r.innerHTML=s?`<div class="wi">Slot ${n+1}: <b>${esc(s.name)}</b><small>${s.mode} &middot; seed ${s.seed} &middot; played ${fmtT(s.playT)} &middot; $${(s.coins|0).toLocaleString()}</small></div><button class="btn green sm" data-a="play">Play</button><button class="btn red sm" data-a="del">Delete</button>`
   :`<div class="wi">Slot ${n+1}: <i>empty</i></div><button class="btn sm" data-a="new">+ New World</button>`;
  r.querySelectorAll('button').forEach(b=>bindTap(b,()=>{const a=b.dataset.a;if(a==='play')startWorld(n);else if(a==='new'){newSlot=n;$('newName').value='World '+(n+1);$('newSeed').value='';openScreen('new');}
    else if(a==='del'){confirmBox('Delete world?','Delete "'+s.name+'" forever?',()=>{localStorage.removeItem(slotKey(n));renderWorlds();});}}));L.appendChild(r);}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
let confirmFn=null;function confirmBox(t,m,fn){$('confT').textContent=t;$('confMsg').textContent=m;confirmFn=fn;openScreen('confirm');}
bindTap($('confYes'),()=>{closeTop();if(confirmFn)confirmFn();});
let newSlot=0,newMode='survival';
document.querySelectorAll('[data-mode]').forEach(b=>bindTap(b,()=>{newMode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('sel',x===b));}));
bindTap($('createBtn'),()=>{let sd=$('newSeed').value.trim();let seed=sd?(/^-?\d+$/.test(sd)?(+sd|0):[...sd].reduce((a,c)=>Math.imul(a,31)+c.charCodeAt(0)|0,7)):(Math.random()*1e9|0);
  startWorld(newSlot,{name:$('newName').value.trim()||'My World',mode:newMode,seed});});
bindTap($('playBtn'),()=>openScreen('worlds'));
bindTap($('helpBtn'),()=>openScreen('help'));
bindTap($('settingsBtnT'),()=>openScreen('settings'));bindTap($('settingsBtnP'),()=>openScreen('settings'));
bindTap($('cheatBtnTitle'),()=>openScreen('cheats'));bindTap($('cheatBtnPause'),()=>openScreen('cheats'));
bindTap($('resumeBtn'),()=>closeAll());bindTap($('pauseBtn'),()=>pauseGame());
bindTap($('invBtn'),()=>{if(!stack.length)openScreen('inv');});bindTap($('invBtnP'),()=>openScreen('inv'));bindTap($('shopBtn'),()=>openScreen('shop'));
bindTap($('saveBtn'),()=>{if(saveWorld())toast('World saved');});bindTap($('quitBtn'),()=>goTitle());
bindTap($('respawnBtn'),()=>respawn());
function renderPause(){$('pstats').innerHTML=G.meta?`${esc(G.meta.name)} (${G.meta.mode}) &middot; ${G.zone} y=${Math.floor(G.p.y)} &middot; mined ${G.stats.mined} &middot; placed ${G.stats.placed}`:'';}
// ===== cheats =====
const CHEATS=[['god','Infinite Health / God Mode','No damage from lava, falls or mobs'],['supplies','Infinite Supplies','Every block and item unlimited (buckets, food, arrows, gear)'],['money','Infinite Money','Everything in the shop is free'],
  ['fly','Fly Mode','UP / DOWN buttons to fly'],['noclip','No-clip','Fly through blocks (only while flying; turns Fly on)'],['instant','Instant Mine','Break any block instantly'],['bedrock','Break Bedrock','Lets Instant Mine/digging break bedrock'],['day','Always Day','Sun stays at noon']];
function renderCheats(){const L=$('cheatList');L.innerHTML='';
  for(const [k,n,d] of CHEATS){const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">${n}<small>${d}</small></div><button class="tog ${CH[k]?'on':''}" data-c="${k}">${CH[k]?'ON':'OFF'}</button>`;
    bindTap(r.querySelector('button'),()=>{CH[k]=!CH[k];if(k==='noclip'&&CH[k])CH.fly=true;if(k==='fly'&&!CH[k])CH.noclip=false;saveSettings();renderCheats();updHotbar();toast(n+(CH[k]?' ON':' OFF'));});L.appendChild(r);}
  const ingame=G.mode==='play';
  const acts=[['cash','+ $1,000,000','Adds one million coins',()=>{G.coins+=1e6;toast('+$1,000,000!');}],['hell','Teleport to Hell','Drop into a Hell cavern',()=>{tpHell();toast('Welcome to Hell');closeAll();}],
    ['surface','Teleport to Surface','Back up to the sky',()=>{tpSurface();toast('Back on the surface');closeAll();}],
    ['city','Teleport to nearest City','Jump to the closest town (market, town hall, Chief Stevo)',()=>{tpCity('s');closeAll();}],['demoncity','Teleport to Demon City','Into the gates of the nearest demon city in Hell',()=>{tpCity('h');closeAll();}],['bottom','Teleport to Bedrock','The lowest point of Hell',()=>{tpBottom();closeAll();}],['heal','Full Heal','Restore all hearts',()=>{G.hp=20;toast('Healed');}],
    ['pet','Spawn Pet','Pick an animal: it appears next to you, already tamed',()=>{openScreen('petpick');}],['gear','All Gear','Every sword, axe, spear, bow (+64 arrows) and armor piece; Emberite armor equipped',()=>{allGear();}],
    ['food','Full Food','Health and hunger full, plus 16 of every cooked food',()=>{fullFood();}],['snow','Teleport to Snow Biome','Snowy pines, ice and snowfall',()=>{tpSnow();closeAll();}],['tame1','Tame nearest animal','The closest wild animal (within 24 blocks) becomes your pet',()=>{tameNearest();}],['tameall','Tame all nearby','Every wild animal within 24 blocks becomes your pet',()=>{tameAllNearby();}],['char','Change Character','Pick your player: Chief Stevo, Queen Lexi, Queen Isla or Princess Rosie',()=>{openScreen('char');}]];
  for(const [k,n,d,fn] of acts){const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">${n}<small>${ingame?d:'Start a world to use this'}</small></div><button class="btn gold sm" data-c="${k}" ${ingame?'':'disabled'}>GO</button>`;
    bindTap(r.querySelector('button'),()=>{if(G.mode==='play'){fn();if(stack[stack.length-1]==='cheats')renderCheats();}});L.appendChild(r);}}
function tpBottom(){const bx=Math.floor(G.p.x),bz=Math.floor(G.p.z);let y=1;while(getB(bx,y,bz)===BN.bedrock&&y<5)y++;
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)for(let k=0;k<3;k++){const yy=y+k;const b=getB(bx+dx,yy,bz+dz);if(b!==BN.bedrock)setB(bx+dx,yy,bz+dz,0);}
  setB(bx,y-1,bz,BN.bedrock);G.p.x=bx+.5;G.p.z=bz+.5;G.p.y=y;G.p.vy=0;G.p.fallY=y;toast('The lowest point of Hell (y='+y+')');}
// ===== settings =====
function renderSettings(){const L=$('setList');L.innerHTML='';
  const row=(name,val,fn,lbl)=>{const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">${name}</div><button class="btn sm" data-d="-1">&#9664;</button><b style="min-width:4em;text-align:center">${lbl||val}</b><button class="btn sm" data-d="1">&#9654;</button>`;
    r.querySelectorAll('button').forEach(b=>bindTap(b,()=>{fn(+b.dataset.d);saveSettings();layout();renderSettings();}));L.appendChild(r);};
  row('Render distance',ST.rd,d=>{ST.rd=Math.max(2,Math.min(8,ST.rd+d));},ST.rd+' chunks');
  row('Look speed',ST.sens,d=>{ST.sens=Math.round(Math.max(.3,Math.min(3,ST.sens+d*.1))*10)/10;},ST.sens.toFixed(1));
  const Q=[.5,.65,.8,1];row('Resolution',ST.quality,d=>{let i=Q.indexOf(ST.quality);if(i<0)i=3;ST.quality=Q[Math.max(0,Math.min(3,i+d))];},Math.round(ST.quality*100)+'%');
  const tg=(name,k)=>{const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">${name}</div><button class="tog ${ST[k]!==false&&ST[k]?'on':''}">${ST[k]?'ON':'OFF'}</button>`;bindTap(r.querySelector('button'),()=>{ST[k]=!ST[k];saveSettings();renderSettings();});L.appendChild(r);};
  if(ST.mobs===undefined)ST.mobs=true;if(ST.animals===undefined)ST.animals=true;tg('Auto-jump','autojump');tg('Monsters','mobs');tg('Animals & fish','animals');tg('Hunger bar (off in God Mode)','hunger');tg('Show FPS','showfps');{const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">Character<small>${esc(CHARS[curChar()].name)}</small></div><button class="btn sm gold" id="setCharBtn">Change</button>`;bindTap(r.querySelector('button'),()=>openScreen('char'));L.appendChild(r);}
  const r=document.createElement('div');r.className='chrow';r.innerHTML=`<div class="cn">Sound</div><button class="tog ${ST.vol?'on':''}">${ST.vol?'ON':'OFF'}</button>`;bindTap(r.querySelector('button'),()=>{ST.vol=ST.vol?0:1;saveSettings();renderSettings();});L.appendChild(r);}
// ===== hotbar & inventory =====
function updHotbar(){const hb=$('hotbar');if(hb.children.length!==9){hb.innerHTML='';for(let i=0;i<9;i++){const s=document.createElement('div');s.className='slot';s.dataset.i=i;s.innerHTML='<span></span>';
    s.addEventListener('pointerdown',e=>{e.stopPropagation();G.sel=i;updHotbar();});hb.appendChild(s);}}
  for(let i=0;i<9;i++){const s=hb.children[i],id=G.hot[i];s.classList.toggle('sel',i===G.sel);s.style.backgroundImage=id?`url(${blockIcon(id)})`:'none';const c=id?invCount(id):0;s.querySelector('span').textContent=!id?'':c===Infinity?'\u221e':c;s.classList.toggle('empty',!!id&&c<1);}
  const hb3=B[G.hot[G.sel]];$('eatBtn').style.display=hb3&&hb3.food&&invCount(hb3.id)>0?'flex':'none';vmKey='';
  const f=canFly();$('upBtn').style.display=f?'flex':'none';$('downBtn').style.display=f?'flex':'none';$('landBtn').style.display=f?'flex':'none';$('ncBadge').style.display=noclipOn()?'block':'none';}
let invCat='All';
function renderInv(){const hot=$('invHot');hot.innerHTML='';for(let i=0;i<9;i++){const s=document.createElement('div');s.className='slot'+(i===G.sel?' sel':'');const id=G.hot[i];s.style.backgroundImage=id?`url(${blockIcon(id)})`:'none';const c=id?invCount(id):0;s.innerHTML=`<span>${id?(c===Infinity?'\u221e':c):''}</span>`;bindTap(s,()=>{G.sel=i;renderInv();});hot.appendChild(s);}
  $('invInfo').textContent=infSupplies()?'Infinite supplies: tap any block or item':'Tap a block or item to put it in the selected slot';
  const tabs=$('invTabs');tabs.innerHTML='';for(const c of ['All','Mine'].concat(CATS)){const b=document.createElement('button');b.textContent=c;b.className=c===invCat?'on':'';bindTap(b,()=>{invCat=c;renderInv();});tabs.appendChild(b);}
  const gr=$('invGrid');gr.innerHTML='';for(const id of INVLIST){const bd=B[id];if(invCat==='Mine'){if(!(invCount(id)>0))continue;}else if(invCat!=='All'&&bd.cat!==invCat)continue;
    const c=invCount(id);const e=document.createElement('button');e.className='ib'+(c<1?' zero':'');e.style.backgroundImage=`url(${blockIcon(id)})`;e.innerHTML=`${esc(bd.name)}<b>${c===Infinity?'\u221e':c}</b>`;e.dataset.id=id;
    bindTap(e,()=>{const j=G.hot.indexOf(id);if(j>=0&&j!==G.sel)G.hot[j]=G.hot[G.sel];G.hot[G.sel]=id;renderInv();updHotbar();});gr.appendChild(e);}}
// ===== shop =====
function renderShop(){$('shopCoins').textContent=CH.money?'$ \u221e (Infinite Money)':'$'+G.coins.toLocaleString();const L=$('shopList');L.innerHTML='';
  const sec=t=>{const d=document.createElement('div');d.className='sec';d.textContent=t;L.appendChild(d);};
  sec('Pickaxes (mine faster)');const tg=document.createElement('div');tg.className='shgrid';L.appendChild(tg);
  for(const t of TOOLS.slice(1)){const r=document.createElement('div');r.className='shrow';const own=G.tools[t.key];r.innerHTML=`<div class="cn">${t.name} <small>(x${t.speed} speed)</small></div><button class="btn sm ${own?'':'gold'}" ${own?'disabled':''}>${own?'Owned':'$'+t.price.toLocaleString()}</button>`;
    bindTap(r.querySelector('button'),()=>{if(G.tools[t.key])return;if(!spend(t.price)){toast('Not enough coins');return;}G.tools[t.key]=1;sfx('buy');toast('Bought '+t.name);renderShop();});tg.appendChild(r);}
  const ish=(title,ids,qty)=>{sec(title);const gg=document.createElement('div');gg.className='shgrid';L.appendChild(gg);
    for(const id of ids){const bd=B[id];const q=qty(bd);const pr=bd.price*q;const r=document.createElement('div');r.className='shrow';const c=invCount(id);
      const st=bd.weapon?bd.weapon.dmg+' dmg':bd.armor?'+'+bd.armor.def+' armor':bd.food?'+'+bd.food+' health':'';
      r.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(bd.name)}${q>1?' x'+q:''} <small>${st?st+' &middot; ':''}have ${c===Infinity?'\u221e':c}</small></div><button class="btn sm gold" data-id="${id}">$${pr.toLocaleString()}</button>`;
      bindTap(r.querySelector('button'),()=>{if(!spend(pr)){toast('Not enough coins');return;}addInv(id,q);sfx('buy');toast('Bought '+(q>1?q+' ':'')+bd.name);renderShop();updHotbar();});gg.appendChild(r);}};
  ish('Weapons',ITEM_IDS.filter(id=>B[id].weapon||B[id].key==='arrow'),b=>b.key==='arrow'?16:1);
  ish('Armor (equip it in the Gear screen)',ITEM_IDS.filter(id=>B[id].armor),()=>1);
  ish('Tools & food',ITEM_IDS.filter(id=>B[id].cat==='Tools'&&B[id].key==='bucket'||['rod','net','wheat','bone','beef_r','pork_r','chicken_r','fish_r','beef_c','fish_c'].includes(B[id].key)),b=>b.cat==='Food'?8:1);
  sec('Blocks (stack of 16)');const g=document.createElement('div');g.className='shgrid';L.appendChild(g);
  for(const id of PLACEABLE){const bd=B[id];if(!bd.price)continue;const pr=bd.price*16;const r=document.createElement('div');r.className='shrow';r.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(bd.name)} <small>(have ${invCount(id)===Infinity?'\u221e':invCount(id)})</small></div><button class="btn sm gold" data-id="${id}">$${pr.toLocaleString()}</button>`;
    bindTap(r.querySelector('button'),()=>{if(!spend(pr)){toast('Not enough coins');return;}addInv(id,16);sfx('buy');toast('Bought 16 '+bd.name);renderShop();});g.appendChild(r);}}
// ===== touch controls =====
const T={joy:null,look:null};let touchMine=false;
function resetTouches(){T.joy=null;T.look=null;touchMine=false;IN.mx=IN.mz=0;IN.jump=IN.up=IN.down=IN.breakHeld=false;$('joyKnob').style.transform='';document.querySelectorAll('.cbtn').forEach(b=>b.classList.remove('on'));}
const tz=$('touch');
tz.addEventListener('pointerdown',e=>{if(G.mode!=='play'||stack.length)return;e.preventDefault();const u=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u'))||1;
  if(e.clientX<innerWidth*.4){if(T.joy)return;T.joy={id:e.pointerId,x:e.clientX,y:e.clientY,u};const jb=$('joyBase');jb.style.left=(e.clientX-60*u)+'px';jb.style.top=(e.clientY-60*u)+'px';jb.style.bottom='auto';}
  else{if(T.look)return;T.look={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),moved:false,u};}
  try{tz.setPointerCapture(e.pointerId);}catch(_){}});
tz.addEventListener('pointermove',e=>{if(T.joy&&e.pointerId===T.joy.id){const R=50*T.joy.u;let dx=e.clientX-T.joy.x,dy=e.clientY-T.joy.y;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l;}IN.mx=dx/R;IN.mz=dy/R;if(Math.hypot(IN.mx,IN.mz)<.15)IN.mx=IN.mz=0;$('joyKnob').style.transform=`translate(${dx}px,${dy}px)`;}
  if(T.look&&e.pointerId===T.look.id){const L=T.look;const dx=e.clientX-L.x,dy=e.clientY-L.y;L.x=e.clientX;L.y=e.clientY;
    if(!L.moved&&Math.hypot(e.clientX-L.sx,e.clientY-L.sy)>12*L.u)L.moved=true;
    if(L.moved||touchMine){const k=.0055*ST.sens/Math.max(.6,L.u);G.p.yaw-=dx*k;G.p.pitch=Math.max(-1.55,Math.min(1.55,G.p.pitch-dy*k));}}});
function endPtr(e){if(T.joy&&e.pointerId===T.joy.id){T.joy=null;IN.mx=IN.mz=0;$('joyKnob').style.transform='';const jb=$('joyBase');jb.style.left='';jb.style.top='';jb.style.bottom='';}
  if(T.look&&e.pointerId===T.look.id){const L=T.look;if(!L.moved&&!touchMine&&performance.now()-L.t<300&&e.type==='pointerup')tapAction();T.look=null;touchMine=false;}}
tz.addEventListener('pointerup',endPtr);tz.addEventListener('pointercancel',endPtr);
function holdBtn(id,on,off){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}on();});
  const up=e=>{b.classList.remove('on');off();};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('click',e=>e.stopPropagation());}
bindTap($('landBtn'),()=>{if(G.mode==='play')landNow();});
holdBtn('jumpBtn',()=>{IN.jump=true;G.jumpQ=.3;},()=>IN.jump=false);holdBtn('upBtn',()=>IN.up=true,()=>IN.up=false);holdBtn('downBtn',()=>IN.down=true,()=>IN.down=false);
holdBtn('breakBtn',()=>IN.breakHeld=true,()=>IN.breakHeld=false);holdBtn('placeBtn',()=>tapAction(),()=>{});
// desktop mouse support
canvas.addEventListener('contextmenu',e=>e.preventDefault());
// ===== HUD =====
function updHUD(){let h='';for(let i=0;i<10;i++){const v=Math.ceil(G.hp)-i*2;h+=v>=2?'\u2665':v===1?'<span style="opacity:.6">\u2665</span>':'<span class="e">\u2665</span>';}
  if(CH.god)h='<span style="color:#ffd84a">\u2665 GOD</span>';const he=$('hearts');if(he._h!==h){he.innerHTML=h;he._h=h;}
  $('coins').textContent=CH.money?'$\u221e':'$'+G.coins.toLocaleString();$('zone').textContent=G.zone+' \u00b7 y'+Math.floor(G.p.y)+(noclipOn()?' \u00b7 NO-CLIP':canFly()?' \u00b7 FLY':'');{const nb=$('ncBadge'),v=noclipOn()?'block':'none';if(nb.style.display!==v)nb.style.display=v;}
  {const ap=armorPoints();const ah=ap?`<span class="armico"></span>${Math.round(armorReduction()*100)}%`:'';const ae=$('armorHud');if(ae._h!==ah){ae.innerHTML=ah;ae._h=ah;ae.style.display=ap?'':'none';}
   const fh=hungerOn()?'\u{1F357}'.repeat(0)+'<span class="food">'+'\u25CF'.repeat(Math.ceil(G.food/2))+'<span class="e">'+'\u25CF'.repeat(10-Math.ceil(G.food/2))+'</span></span>':'';const fe=$('foodHud');if(fe._h!==fh){fe.innerHTML=fh;fe._h=fh;fe.style.display=fh?'':'none';}}
  updCityHint();$('fps').textContent=ST.showfps?G.fps+' fps':'';$('dmgFx').style.opacity=Math.max(0,G.dmgFlash);}
// ===== main loop =====
let lastT=performance.now(),fpsN=0,fpsT=0,hudT=0;
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.1,(now-lastT)/1000);lastT=now;fpsN++;fpsT+=dt;if(fpsT>=1){G.fps=fpsN;fpsN=0;fpsT=0;}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('show');}
  if(G.mode==='play'){const paused=stack.length>0;
    updateChunks(paused?4:7);
    if(!paused){const ch=getChunk(Math.floor(G.p.x)>>4,Math.floor(G.p.z)>>4);if(ch){updatePlayer(dt);updateMining(dt);updateMobs(dt);updateNPCs(dt);updateLife(dt);G.playT+=dt;}updBreak(dt);G.dmgFlash=Math.max(0,G.dmgFlash-dt);}
    updateEnv(paused?0:dt);G.autosaveT+=dt;if(G.autosaveT>30){G.autosaveT=0;saveWorld();}
    hudT-=dt;if(hudT<=0){updHUD();hudT=.15;}
    updBubble(dt);updViewModel(paused?0:dt);renderer.render(scene,camera);}
  else{renderer.setClearColor(0x000000);renderer.clear();}}
// ===== debug/test hooks =====
window.__bc={G,CH,ST,B,BN,world,getB,setB,raycast,breakAt,placeAt,tapAction,startWorld,saveWorld,slotMeta,tpHell,tpSurface,tpBottom,stack,IN,spawnMob,updHotbar,meshQ:()=>meshQ,openScreen,closeTop,goTitle,findSurface,landNow,landSpot,rescue,updatePlayer,canFly,noclipOn,hitsWorld,canBreak,invCount,renderer,HELL_TOP,DEEP_TOP,SEA,H};
layout();openScreen('title');requestAnimationFrame(frame);
// ===== v1.2: townspeople, demons, Chief Stevo, market trade, city compass =====
const NPC_MAX=28,NPC_FAR=24;
G.npcs=[];G.cityState=G.cityState||{};
const cityAct=new Map();let cityMgrT=0;
const npcGeo={};function bgeo(w,h,d){const k=w+'_'+h+'_'+d;return npcGeo[k]||(npcGeo[k]=new THREE.BoxGeometry(w,h,d));}
const glowMats={};function glowMat(c){return glowMats[c]||(glowMats[c]=new THREE.MeshBasicMaterial({color:c}));}
const PAL={shirt:[0xc0392b,0x2e86c1,0x27ae60,0xf39c12,0x8e44ad,0xe67e22,0x16a085,0xd35400,0x95a5a6,0xf1c40f,0xe84393,0x6c5ce7],pants:[0x4a3b2a,0x34495e,0x5d4037,0x2c3e50,0x6d4c41,0x556b2f],
  skin:[0xf1c27d,0xe0ac69,0xc68642,0x8d5524,0xffdbac],hair:[0x2b1b0e,0x5a3a1e,0xc9a24a,0x8b2f1a,0x151515,0xd8d8d8],hat:[null,null,0xd8b85a,0x3b5998,0x8b4513,null]};
const TOWN_NAMES=['Bramble','Pip','Tilly','Gus','Marla','Otto','Wren','Fenn','Hazel','Bo','Juniper','Rufus','Clem','Ivy','Nell','Barnaby'];
const DEMON_NAMES=['Skorch','Vexa','Grimbel','Ashka','Moloq','Zarra','Brimbo','Cindrel','Hoof','Nyx'];
const LINES={town:['Lovely day for laying bricks!','Have you tried the fountain water? Tastes like... water.','Chief Stevo says his crown keeps his ideas warm.','I lost a pumpkin. If you see one, it\'s probably mine.','Watch out for zombies after dark!','The market has the best prices this side of the river.','I once dug down to Hell. Do not recommend.','My cat thinks she\'s a block.','Nice pickaxe! Is it new?','Mind the flower beds, I just planted those.','They say there\'s a whole city of demons down below...','I\'m not lost. I\'m exploring. Professionally.','The church bell is solid gold. Please don\'t mine it.','Welcome! Stay as long as you like.'],
  merchant:['Step right up! Fine blocks, fair prices!','Buying and selling, best deals in town!'],
  demon:['Mortal... you smell like grass.','Lava\'s lovely this time of century.','Don\'t mind me, just brooding.','The Infernal Chief is in the throne hall. Mind your manners.','Hot enough for you?','I collect obsidian. It\'s a phase.','Touch my horns and you\'ll regret it.','Welcome to the hottest city around!','Careful on the bridges. The moat bites.'],
  angry:['GRAAAH! You\'ll pay for that!','Now you\'ve done it, mortal!','You dare strike me?!'],
  guard:['Halt! None approach the throne hall!','Turn back, surface-dweller!','The Chief is not taking visitors. Leave!'],guardCalm:['Keep moving, mortal.','Eyes forward. No funny business.'],
  hurtTown:['Hey! Ouch! What was that for?','Ow! I\'m telling the Chief!','Rude!'],leaderHit:['Ha! That tickles.','A chief does not fall so easily.']};
function pick(a){return a[(Math.random()*a.length)|0];}
// ---- blocky original characters ----
function makeNPC(o){const g=new THREE.Group();const add=(par,w,h,d,c,x,y,z,glow)=>{const m=new THREE.Mesh(bgeo(w,h,d),glow?glowMat(c):mobMat(c));m.position.set(x,y,z);par.add(m);return m;};
  const piv=(x,y)=>{const q=new THREE.Group();q.position.set(x,y,0);g.add(q);return q;};
  const legL=piv(-.13,.75),legR=piv(.13,.75),armL=piv(-.37,1.45),armR=piv(.37,1.45);
  for(const L of [legL,legR]){add(L,.24,.75,.26,o.pants,0,-.375,0);add(L,.25,.12,.29,o.shoes||0x3a2a1a,0,-.7,-.01);}
  add(g,.5,.72,.28,o.shirt,0,1.11,0);if(o.belt)add(g,.52,.08,.3,o.belt,0,.8,0);if(o.apron)add(g,.4,.55,.04,o.apron,0,.98,-.16);
  for(const A of [armL,armR]){add(A,.2,.48,.22,o.sleeve||o.shirt,0,-.2,0);add(A,.19,.22,.21,o.skin,0,-.55,0);}
  add(g,.5,.5,.5,o.skin,0,1.72,0);
  const eyes=[add(g,.1,.07,.02,o.eye||0x1a1a1a,-.11,1.76,-.26,!!o.glow),add(g,.1,.07,.02,o.eye||0x1a1a1a,.11,1.76,-.26,!!o.glow)];
  if(!o.glow){add(g,.1,.03,.02,0xffffff,-.11,1.81,-.26);add(g,.1,.03,.02,0xffffff,.11,1.81,-.26);}
  add(g,.16,.03,.02,o.mouth||0x6a3020,0,1.6,-.26);
  if(o.hair!==null){add(g,.53,.12,.53,o.hair,0,1.99,0);add(g,.53,.34,.09,o.hair,0,1.8,.23);add(g,.08,.2,.4,o.hair,-.25,1.85,.04);add(g,.08,.2,.4,o.hair,.25,1.85,.04);}
  if(o.beard){add(g,.5,.18,.06,o.beard,0,1.55,-.26);add(g,.3,.05,.04,o.beard,0,1.65,-.28);add(g,.08,.18,.06,o.beard,-.21,1.66,-.26);add(g,.08,.18,.06,o.beard,.21,1.66,-.26);}
  if(o.hat){add(g,.7,.05,.7,o.hat,0,2.04,0);add(g,.46,.16,.46,o.hat,0,2.13,0);}
  if(o.crown){const cc=o.crown;add(g,.56,.1,.56,cc,0,2.07,0);for(const [x,z] of [[-.23,-.23],[.23,-.23],[-.23,.23],[.23,.23],[0,-.23],[0,.23],[-.23,0],[.23,0]])add(g,.1,.14,.1,o.crownTip||cc,x,2.18,z,!!o.crownGlow);add(g,.08,.08,.02,o.gem||0xd02030,0,2.07,-.29,true);}
  if(o.ponytail){add(g,.2,.2,.14,o.hair,0,1.86,.32);add(g,.16,.5,.12,o.hair,0,1.55,.36);add(g,.18,.06,.14,o.ponyTie||0x2a7a3a,0,1.88,.32);}
  if(o.skirt){add(g,.56,.36,.34,o.skirt,0,.62,0);}
  if(o.cape){add(g,.56,1.1,.05,o.cape,0,1.0,.18);add(g,.6,.08,.32,o.cape,0,1.47,.02);}
  if(o.horns){for(const s of [-1,1]){const h=add(g,.09,.24,.09,o.horns,s*.2,2.1,-.02);h.rotation.z=-s*.35;add(g,.07,.12,.07,o.hornTip||0xeeeeee,s*.27,2.26,-.02).rotation.z=-s*.6;}}
  if(o.tail){const t=add(g,.07,.07,.5,o.tail,0,.72,.36);t.rotation.x=-.5;add(g,.13,.13,.1,o.tail,0,.62,.6);}
  if(o.spear){add(armR,.06,1.6,.06,0x4a3020,0,-.4,-.12);add(armR,.12,.24,.06,0xb8b8c8,0,.48,-.12);}
  if(o.helmet){add(g,.56,.2,.56,o.helmet,0,1.98,0);add(g,.56,.06,.08,o.helmet,0,1.84,-.26);}
  if(o.tag){const c=document.createElement('canvas');c.width=256;c.height=48;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,256,48);x.font='bold 28px sans-serif';x.textAlign='center';x.fillStyle=o.tagColor||'#ffd84a';x.fillText(o.tag,128,34);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false}));sp.scale.set(1.6,.3,1);sp.position.set(0,2.6,0);g.add(sp);}
  if(o.scale)g.scale.setScalar(o.scale);
  g.userData={legL,legR,armL,armR,eyes};scene.add(g);return g;}
function npcLook(role,rr){const P=a=>a[(rr()*a.length)|0];
  if(role==='leader')return {shirt:0x18a7a0,sleeve:0x18a7a0,pants:0x2b4fa0,shoes:0x3b2614,skin:0xdba27a,hair:0x5a3a1e,beard:0x5a3a1e,belt:0x5b3a1a,crown:0xf2c230,crownTip:0xffe070,gem:0xd02030,scale:1.06,tag:'Chief Stevo'};
  if(role==='hleader')return {shirt:0x24090b,sleeve:0x3a0e10,pants:0x150708,shoes:0x0c0c0c,skin:0x9a2a22,hair:0x120808,beard:0x120808,belt:0xc89a20,crown:0x1c121e,crownTip:0xff7a1a,crownGlow:true,gem:0xff3010,cape:0xb01818,horns:0x1a1010,hornTip:0x2a1a1a,eye:0xffd040,glow:true,mouth:0x200606,scale:1.1,tag:'Infernal Chief Stevo',tagColor:'#ff8a3a'};
  if(role==='queen')return {shirt:0x3d9a4a,sleeve:0x3d9a4a,pants:0x6b4428,shoes:0x3b2614,skin:0xf0c49a,hair:0xe0702a,ponytail:true,ponyTie:0x2a6a2a,belt:0x8a5a2a,crown:0xf2c230,crownTip:0xffe070,gem:0x30a0e0,mouth:0xb04040,tag:'Queen Lexi',tagColor:'#ffb0d0'};
  if(role==='hqueen')return {shirt:0x2a0a0c,sleeve:0x8a1414,pants:0x2a0a0c,skirt:0x9a1010,shoes:0x0a0a0a,skin:0xc0574a,hair:0xe0501a,ponytail:true,ponyTie:0x111111,belt:0x111111,crown:0x1c121e,crownTip:0xff7a1a,crownGlow:true,gem:0xffa020,eye:0xffb030,glow:true,horns:0x1a1010,hornTip:0x2a1a1a,mouth:0x500a0a,tag:'Queen Lexi',tagColor:'#ff8a3a'};
  if(role==='merchant')return {shirt:0x7b4f9d,pants:0x3a2a4a,skin:P(PAL.skin),hair:P(PAL.hair),apron:0xf2efe6,belt:0x6b4a2a,hat:0x2a6a3a,tag:'Merchant',tagColor:'#9fe870'};
  if(role==='demon'){const sk=P([0xa8221c,0x7a1612,0x3a1414,0xb83a20]);return {shirt:P([0x1a0a0a,0x5a0f12,0x2a1a1a,0x701818]),pants:P([0x120808,0x2a0c0c,0x1a1a1a]),shoes:0x0a0a0a,skin:sk,hair:P([null,0x101010,0x3a0808]),horns:P([0x1a1010,0x3a2a20,0xd8d0c0]),eye:P([0xffd040,0xff5a1a,0xffee70]),glow:true,mouth:0x200606,tail:sk,belt:rr()<.5?0x8a6a20:null};}
  if(role==='guard')return {shirt:0x241a2a,sleeve:0x3a2030,pants:0x18121c,shoes:0x0a0a0a,skin:0x8a1a16,hair:null,helmet:0x2e2434,horns:0x0e0a0e,hornTip:0x2a1a2a,eye:0xff2a10,glow:true,belt:0xa01818,spear:true,scale:1.12,mouth:0x200606};
  return {shirt:P(PAL.shirt),pants:P(PAL.pants),skin:P(PAL.skin),hair:P(PAL.hair),hat:P(PAL.hat),apron:rr()<.2?0xeeeeee:null,belt:rr()<.5?0x5b3a1a:null,shoes:P([0x3a2a1a,0x222222,0x5a3a20])};}
// ---- city activation (spawn near, despawn far, respawn after a while) ----
function groundY(x,z,y0){let y=Math.floor(y0)+3;for(let i=0;i<12;i++,y--){const b=getB(Math.floor(x),y-1,Math.floor(z));if(b<0)return null;if(SOLID[b]&&!hitsWorld(x,y,z,.3,1.8))return y;}return Math.floor(y0);}
function spawnNPC(a,slot){const c=a.c,[lx,ly,lz]=slot.home;const x=c.x+lx+.5,z=c.z+lz+.5;if(!getChunk(Math.floor(x)>>4,Math.floor(z)>>4))return null;const y=groundY(x,z,ly);if(y===null)return null;
  const rr=rng32(hashStr(c.id+slot.i)+(slot.gen||0));const role=slot.role;const look=npcLook(role,rr);
  const n={role,city:c,slot,x,y,z,vx:0,vy:0,vz:0,ground:false,h:1.9,hp:role==='guard'?40:role==='demon'?18:999,hostile:false,hostileT:0,atk:0,idle:rr()*2,tgt:null,stuck:0,ph:0,acc:0,hurtT:0,
    name:(role==='queen'||role==='hqueen')?'Queen Lexi':role==='leader'?'Chief Stevo':role==='hleader'?'Infernal Chief Stevo':role==='merchant'?'Merchant '+TOWN_NAMES[(rr()*16)|0]:role==='guard'?'Demon Guard':role==='demon'?DEMON_NAMES[(rr()*DEMON_NAMES.length)|0]:TOWN_NAMES[(rr()*16)|0],g:makeNPC(look)};
  n.g.position.set(x,y,z);G.npcs.push(n);slot.npc=n;return n;}
function activateCity(c){const p=cityPlan(c);const rr=rng32(hashStr(c.id)+11);const slots=[];let i=0;
  const sp=()=>{const s=p.spots[(rr()*p.spots.length)|0];return [s[0],c.g+1,s[1]];};
  const qh=[p.leader[0]+2,p.leader[1],p.leader[2]+1];if(c.kind==='s'){slots.push({role:'leader',home:p.leader});slots.push({role:'queen',home:qh});slots.push({role:'merchant',home:p.merchant});for(let k=0;k<6;k++)slots.push({role:'town',home:sp()});}
  else{slots.push({role:'hleader',home:p.leader});slots.push({role:'hqueen',home:qh});for(const gp of p.guards)slots.push({role:'guard',home:gp});for(let k=0;k<5;k++)slots.push({role:'demon',home:sp()});}
  for(const s of slots){s.i=i++;s.npc=null;s.dead=0;s.gen=0;}
  const a={c,slots};cityAct.set(c.id,a);return a;}
function removeNPC(n){scene.remove(n.g);const i=G.npcs.indexOf(n);if(i>=0)G.npcs.splice(i,1);if(n.slot&&n.slot.npc===n)n.slot.npc=null;if(G.bubble&&G.bubble.n===n)hideBubble();}
function deactivateCity(id){const a=cityAct.get(id);if(!a)return;for(const s of a.slots)if(s.npc)removeNPC(s.npc);cityAct.delete(id);}
function npcClear(){for(const id of [...cityAct.keys()])deactivateCity(id);for(const n of G.npcs.slice())removeNPC(n);hideBubble();}
function manageCities(){const p=G.p,now=performance.now()/1000;
  const near=[];for(const kind of ['s','h'])for(const c of citiesNear(kind,p.x,p.z,96))near.push([Math.hypot(c.x-p.x,c.z-p.z),c]);near.sort((a,b)=>a[0]-b[0]);
  for(const [id,a] of cityAct){const c=a.c;if(Math.hypot(c.x-p.x,c.z-p.z)>120||Math.abs(p.y-c.g)>70||CITY.off.has(id))deactivateCity(id);}
  for(const [d,c] of near){if(d>96||Math.abs(p.y-c.g)>56)continue;let a=cityAct.get(c.id);if(!a){if(G.npcs.length+10>NPC_MAX)continue;a=activateCity(c);}
    for(const s of a.slots){if(s.npc)continue;if(G.npcs.length>=NPC_MAX)break;
      if(s.dead){const hx=c.x+s.home[0],hz=c.z+s.home[2];if(now-s.dead<120||Math.hypot(hx-p.x,hz-p.z)<20)continue;s.dead=0;s.gen++;}
      spawnNPC(a,s);}}}
// ---- AI ----
function npcAggro(n){if(n.role==='guard'){if(ST.mobs===false||G.dead)return false;const d=Math.hypot(G.p.x-n.x,G.p.z-n.z);return n.hostile||(d<10&&Math.abs(G.p.y-n.y)<4);}return n.hostile&&!G.dead;}
function tickNPC(n,dt){const p=G.p,c=n.city;const dx=p.x-n.x,dz=p.z-n.z,dist=Math.hypot(dx,dz);let tx=0,tz=0,sp=0,face=null;
  n.atk-=dt;n.hurtT-=dt;
  if(n.hostile&&n.role!=='guard'){n.hostileT-=dt;if(n.hostileT<=0&&dist>16){n.hostile=false;setEyes(n,false);}}
  const fixed=n.role==='leader'||n.role==='hleader'||n.role==='queen'||n.role==='hqueen'||n.role==='merchant';
  if(npcAggro(n)){sp=n.role==='guard'?3.2:2.8;if(dist>1.1){tx=dx/dist;tz=dz/dist;}face=Math.atan2(-dx,-dz);
    if(dist<1.4&&Math.abs(p.y-n.y)<1.6&&n.atk<=0){n.atk=1;hurt(n.role==='guard'?5:4,n.role==='guard'?'A demon guard got you':'An angry demon got you');}
    if(n.role==='guard'){const hx=c.x+n.slot.home[0]+.5,hz=c.z+n.slot.home[2]+.5;if(Math.hypot(n.x-hx,n.z-hz)>22){n.hostile=false;}}}
  else if(fixed){const hx=c.x+n.slot.home[0]+.5,hz=c.z+n.slot.home[2]+.5,hd=Math.hypot(hx-n.x,hz-n.z);if(hd>.6){sp=1.4;tx=(hx-n.x)/hd;tz=(hz-n.z)/hd;}else if(dist<10)face=Math.atan2(-dx,-dz);else face=n.role==='merchant'?Math.PI:0;}
  else{ // wander between road spots, never leaving town
    if(n.talkT>0){n.talkT-=dt;face=Math.atan2(-dx,-dz);}
    else if(n.idle>0){n.idle-=dt;}
    else{if(!n.tgt){const pl=cityPlan(c);const s=pl.spots[(Math.random()*pl.spots.length)|0];n.tgt=[c.x+s[0]+.5,c.z+s[1]+.5];n.stuck=0;n.tT=0;}
      const ex=n.tgt[0]-n.x,ez=n.tgt[1]-n.z,ed=Math.hypot(ex,ez);n.tT=(n.tT||0)+dt;
      if(ed<.7||n.tT>25){n.tgt=null;n.idle=1+Math.random()*3;}else{sp=n.role==='guard'?1.2:1.3;tx=ex/ed;tz=ez/ed;}
      if(n.role==='guard'){const hx=c.x+n.slot.home[0]+.5,hz=c.z+n.slot.home[2]+.5;if(n.tgt&&Math.hypot(n.tgt[0]-hx,n.tgt[1]-hz)>4)n.tgt=[hx+(Math.random()-.5)*6,hz+(Math.random()-.5)*6];}}
    if(Math.abs(n.x-c.x)>c.R-2||Math.abs(n.z-c.z)>c.R-2){const d2=Math.hypot(c.x-n.x,c.z-n.z);tx=(c.x-n.x)/d2;tz=(c.z-n.z)/d2;sp=1.3;n.tgt=null;}}
  n.vx+=(tx*sp-n.vx)*Math.min(1,dt*6);n.vz+=(tz*sp-n.vz)*Math.min(1,dt*6);n.vy=Math.max(n.vy-28*dt,-40);
  const r=moveEnt(n,dt,.3,1.8,false);if((r.hitX||r.hitZ)&&n.ground&&sp>0){n.vy=8.2;n.stuck+=dt;if(n.stuck>2){n.tgt=null;n.idle=.5;n.stuck=0;}}
  if(n.y<2||Math.abs(n.x-c.x)>c.E+6||Math.abs(n.z-c.z)>c.E+6){const [hx,hy,hz]=n.slot.home;n.x=c.x+hx+.5;n.z=c.z+hz+.5;n.y=hy+.5;n.vy=0;}
  const v=Math.hypot(n.vx,n.vz);n.ph+=dt*v*5;const sw=Math.sin(n.ph)*Math.min(1,v/1.3)*.7,U=n.g.userData;U.legL.rotation.x=sw;U.legR.rotation.x=-sw;U.armL.rotation.x=-sw*.8;U.armR.rotation.x=sw*.8;
  if(face!==null)n.g.rotation.y=face;else if(v>.3)n.g.rotation.y=Math.atan2(-n.vx,-n.vz);
  n.g.position.set(n.x,n.y,n.z);n.g.scale.setScalar((n.role==='guard'?1.12:n.role==='leader'?1.06:n.role==='hleader'?1.1:1)*(n.hurtT>0?1.08:1));}
function updateNPCs(dt){cityMgrT-=dt;if(cityMgrT<=0){cityMgrT=1;manageCities();}
  const p=G.p,cull=Math.min(64,ST.rd*16*.95);G.npcVis=0;
  for(const n of G.npcs.slice()){const d=Math.hypot(p.x-n.x,p.z-n.z)+Math.abs(p.y-n.y)*.5;
    if(!getChunk(Math.floor(n.x)>>4,Math.floor(n.z)>>4)){n.g.visible=false;continue;}
    n.g.visible=d<cull;if(n.g.visible)G.npcVis++;if(d>cull+16)continue;          // far: frozen
    if(d>NPC_FAR&&!n.hostile){n.acc+=dt;if(n.acc<.25)continue;tickNPC(n,Math.min(n.acc,.25));n.acc=0;}  // mid: 4 ticks/s
    else tickNPC(n,dt);}}
function setEyes(n,angry){const e=n.g.userData.eyes;for(const m of e)m.material=angry?glowMat(0xff1a0a):(n.role==='demon'?glowMat(0xffd040):m.material);}
// ---- interaction ----
function npcUnderCrosshair(){const d=lookDir(),p=G.p,o=[p.x,p.y+1.62,p.z];let best=null,bt=5;const blk=raycast(6);if(blk)bt=Math.min(bt,blk.t);
  for(const m of G.npcs){if(!m.g.visible)continue;const mn=[m.x-.4,m.y,m.z-.4],mx=[m.x+.4,m.y+m.h,m.z+.4];let t0=0,t1=bt,ok=true;for(let a=0;a<3;a++){if(Math.abs(d[a])<1e-6){if(o[a]<mn[a]||o[a]>mx[a]){ok=false;break;}continue;}let ta=(mn[a]-o[a])/d[a],tb=(mx[a]-o[a])/d[a];if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){ok=false;break;}}if(ok&&t0<bt){bt=t0;best=m;}}return best;}
function say(n,text){G.bubble={n,text,t:4.5};const e=$('bubble');e.innerHTML='<b>'+esc(n.name)+'</b>'+esc(text);e.style.display='block';sfx('click');}
function hideBubble(){G.bubble=null;const e=document.getElementById('bubble');if(e)e.style.display='none';}
const _bv=new THREE.Vector3();
function updBubble(dt){const b=G.bubble,e=$('bubble');if(!b)return;b.t-=dt;if(b.t<=0||!G.npcs.includes(b.n)||stack.length){hideBubble();return;}
  _bv.set(b.n.x,b.n.y+2.45*(b.n.g.scale.x||1),b.n.z).project(camera);if(_bv.z>1||Math.abs(_bv.x)>1.2){e.style.display='none';return;}e.style.display='block';
  e.style.left=((_bv.x*.5+.5)*innerWidth)+'px';e.style.top=((-_bv.y*.5+.5)*innerHeight)+'px';}
function talkTo(n){n.talkT=3;n.vx=n.vz=0;
  if(n.role==='leader'||n.role==='hleader'){say(n,n.role==='leader'?'Welcome, friend!':'Kneel... or at least nod.');openLeader(n);return;}
  if(n.role==='queen'||n.role==='hqueen'){const st=cstate(n.city),hell=n.role==='hqueen';let t=hell?pick(["Welcome, mortal! My husband Chief Stevo growls a lot, but he's a softie really.","Stevo forged my crown himself. Don't tell him it's a bit tight.","Tip: stay away from the guards by the fortress. My Stevo trained them to be grumpy."]):pick(["Hello, dear! Has my husband Chief Stevo given you his speech yet? He practises it every morning.","Stevo is very proud of that crown. He polishes it more than his boots!","Tip from your queen: the Merchant pays good coins for ores. Stevo's idea, of course."]);
    if(!st.lexi){st.lexi=1;const c=hell?60:50;addCoins(c);floatCoin('+$'+c);t+=' Here, a little something: $'+c+'!';}say(n,t);G.lexiTalks=(G.lexiTalks||0)+1;return;}
  if(n.role==='merchant'){say(n,pick(LINES.merchant));G.tradeNpc=n;openScreen('trade');return;}
  if(n.role==='guard'){say(n,ST.mobs===false?pick(LINES.guardCalm):pick(LINES.guard));return;}
  if(n.role==='demon'){say(n,pick(LINES.demon));return;}
  say(n,pick(LINES.town));}
function hitNPC(n,pdmg,pdir){const dmg=pdmg||attackInfo().dmg;const kb=pdmg?4:attackInfo().kb;sfx('hit');n.hurtT=.25;if(!pdmg)G.swingT=.25;
  if(n.role==='town'||n.role==='merchant'){say(n,pick(LINES.hurtTown));n.talkT=1.5;return;}
  if(n.role==='leader'||n.role==='hleader'){say(n,pick(LINES.leaderHit));return;}
  if(n.role==='queen'||n.role==='hqueen'){say(n,'How rude! Stevo, did you see that?');return;}
  const d=pdir||lookDir();n.vx+=d[0]*kb;n.vz+=d[2]*kb;n.vy=5;n.hp-=dmg;popText(n.x,n.y+n.h+.2,n.z,'-'+dmg);hitSpark(n.x,n.y+1.2,n.z);
  if(!n.hostile){n.hostile=true;setEyes(n,true);if(n.role==='demon')say(n,pick(LINES.angry));
    if(n.role==='demon')for(const o of G.npcs)if(o!==n&&o.role==='demon'&&o.city===n.city&&Math.hypot(o.x-n.x,o.z-n.z)<6&&!o.hostile){o.hostile=true;o.hostileT=30;setEyes(o,true);}}
  n.hostileT=30;
  if(n.hp<=0){const c=n.role==='guard'?40:20;addCoins(c);floatCoin('+$'+c);G.stats.kills++;n.slot.dead=performance.now()/1000;removeNPC(n);}}
// ---- Chief Stevo: welcome speech, gift and a small quest ----
function cstate(c){return G.cityState[c.id]||(G.cityState[c.id]={met:0,quest:0});}
function openLeader(n){G.leaderNpc=n;renderLeader();openScreen('npc');}
function renderLeader(msg){const n=G.leaderNpc;if(!n)return;const c=n.city,st=cstate(c),hell=c.kind==='h';
  const Q=hell?{item:'hellstone',n:16,pay:500,name:'Hellstone'}:{item:'cobble',n:16,pay:300,name:'Cobblestone'};let text='',gift='';
  if(!st.met){st.met=1;const coins=hell?150:100,blk=hell?'flamecrown':'crown';addCoins(coins);addInv(BN[blk],1);updHotbar();gift=`<div class="gift">Gift received: $${coins} and a ${B[BN[blk]].name}!</div>`;
    text=hell?`So... a surface-dweller in <b>${esc(c.name)}</b>. I am <b>Infernal Chief Stevo</b>, keeper of the flame crown. Keep your pickaxe away from my citizens and you may leave with your eyebrows. Take this, so the guards know you've been granted an audience.`
      :`Welcome to <b>${esc(c.name)}</b>, traveller! I'm <b>Chief Stevo</b>. We've got a market, a church, farms and the comfiest beds in the land. Make yourself at home, just please don't dig up the plaza! Here's a little something to get you started.`;}
  else text=st.quest===2?(hell?'The forges burn bright thanks to you. You are always welcome in '+esc(c.name)+'.':'Thanks to you, '+esc(c.name)+' has its new walls. You\'re a hero here!'):(hell?'Back again, mortal? The flames remember you.':'Good to see you again, friend!');
  $('npcName').textContent=(hell?'Infernal Chief Stevo':'Chief Stevo')+' of '+c.name;
  $('npcText').innerHTML=(msg?'<div class="gift">'+msg+'</div>':'')+gift+'<p>'+text+'</p>';
  const bt=$('npcBtns');bt.innerHTML='';const btn=(label,cls,fn)=>{const b=document.createElement('button');b.className='btn sm '+cls;b.textContent=label;bindTap(b,fn);bt.appendChild(b);return b;};
  if(st.quest===0){$('npcText').innerHTML+=`<p class="small">Quest: ${hell?'our forges need':'our town wall needs repairs. Bring me'} <b>${Q.n} ${Q.name}</b>${hell?'. Bring them to me':''} and I'll pay you <b>$${Q.pay}</b>.</p>`;btn('Accept quest','gold',()=>{st.quest=1;renderLeader('Quest accepted: bring '+Q.n+' '+Q.name);});}
  else if(st.quest===1){const have=invCount(BN[Q.item]);$('npcText').innerHTML+=`<p class="small">Quest: bring <b>${Q.n} ${Q.name}</b> (you have ${have===Infinity?'\u221e':have}). Reward <b>$${Q.pay}</b>.</p>`;
    const b=btn('Deliver '+Q.n+' '+Q.name,'green',()=>{if(invCount(BN[Q.item])<Q.n){toast('You need '+Q.n+' '+Q.name);return;}if(!infSupplies())G.inv[BN[Q.item]]-=Q.n;addCoins(Q.pay);floatCoin('+$'+Q.pay);st.quest=2;sfx('buy');updHotbar();renderLeader('Quest complete! +$'+Q.pay);});if(have<Q.n)b.disabled=true;}
  btn('Goodbye','',()=>closeTop());}
// ---- market trading ----
const MARKET=['path','hay','fence','crops','lamp','banner','planks','glass','brick','roof','stonebrick','flowers','pumpkin','melon','bookshelf','bed','chest','torch'];
function sellPrice(id){return Math.max(1,Math.ceil((B[id].price||0)/2));}
function renderTrade(){const n=G.tradeNpc;$('tradeCoins').textContent=CH.money?'$ \u221e':'$'+G.coins.toLocaleString();const L=$('tradeList');L.innerHTML='';
  const sec=t=>{const d=document.createElement('div');d.className='sec';d.textContent=t;L.appendChild(d);};
  sec((n?n.name+': ':'')+'Buy (8 blocks)');const g1=document.createElement('div');g1.className='shgrid';L.appendChild(g1);
  for(const k of MARKET){const id=BN[k],bd=B[id],pr=bd.price*8;const r=document.createElement('div');r.className='shrow';r.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(bd.name)}</div><button class="btn sm gold" data-buy="${id}">$${pr}</button>`;
    bindTap(r.querySelector('button'),()=>{if(!spend(pr)){toast('Not enough coins');return;}addInv(id,8);sfx('buy');toast('Bought 8 '+bd.name);updHotbar();renderTrade();});g1.appendChild(r);}
  sec('Sell (from your blocks)');const g2=document.createElement('div');g2.className='shgrid';L.appendChild(g2);let any=0;
  for(const k in G.inv){const id=+k,c=G.inv[k];if(!(c>0)||!B[id]||!B[id].price)continue;any++;const pr=sellPrice(id);const r=document.createElement('div');r.className='shrow';
    r.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(B[id].name)} <small>(have ${c})</small></div><button class="btn sm green" data-sell="${id}">Sell 1 $${pr}</button><button class="btn sm green" data-sellall="${id}">All $${pr*c}</button>`;
    const sell=q=>{q=Math.min(q,G.inv[id]||0);if(q<1)return;G.inv[id]-=q;addCoins(pr*q);sfx('buy');toast('Sold '+q+' '+B[id].name+' for $'+pr*q);updHotbar();renderTrade();};
    bindTap(r.querySelector('[data-sell]'),()=>sell(1));bindTap(r.querySelector('[data-sellall]'),()=>sell(G.inv[id]));g2.appendChild(r);}
  if(!any){const d=document.createElement('div');d.className='small';d.textContent='Nothing to sell yet: mine or collect some blocks first.';g2.appendChild(d);}}
// ---- teleports & compass ----
function tpCity(kind){const p=G.p;const c=nearestCity(kind,p.x,p.z,2000);if(!c){toast('No city found nearby');return null;}
  const x=c.x+.5,z=c.z+c.R-4+.5;ensureArea(x,z);CH.noclip=false;const y=openAbove(x,c.g+1,z);p.x=x;p.z=z;p.y=y;p.vx=p.vy=p.vz=0;p.fallY=y;p.yaw=0;p.pitch=-.08;G.land=null;
  toast((kind==='s'?'Welcome to ':'You stand inside the gates of ')+c.name+(kind==='s'?'! Chief Stevo is in the town hall.':'. The Infernal Chief awaits in the throne hall.'));cityMgrT=0;return c;}
let hintKey='';
function updCityHint(){const e=$('cityHint');if(!e)return;const p=G.p,kind=p.y<HELL_TOP+4?'h':'s';const c=nearestCity(kind,p.x,p.z,900);let h='';
  if(c){const dx=c.x+.5-p.x,dz=c.z+.5-p.z,d=Math.hypot(dx,dz);const icon=kind==='s'?'\u{1F3F0}':'\u{1F525}';
    if(Math.abs(dx)<=c.R&&Math.abs(dz)<=c.R)h=icon+' '+esc(c.name);
    else{const rel=Math.atan2(-dx,-dz)-p.yaw;h=icon+' '+esc(c.name)+' '+Math.round(d)+'m <span class="arr" style="transform:rotate('+(-rel).toFixed(2)+'rad)">\u2191</span>';}}
  if(h!==hintKey){e.innerHTML=h;hintKey=h;}e.style.display=h?'':'none';}
Object.assign(window.__bc,{CITY,cityPlan,citiesNear,nearestCity,spawnCity,cityAt,tpCity,npcUnderCrosshair,talkTo,hitNPC,cstate,renderTrade,manageCities,cityAct,serialize,ensureArea,NPC_MAX,lookDir});
// ===== v1.3: animals, fish, food & cooking, pets, buckets & liquid flow, weapons & armor, snowfall =====
const ANIMAL_MAX=20,FISH_MAX=36,SCHOOL_MAX=7;
const heldId=()=>G.hot[G.sel]||0;
const heldB=()=>B[heldId()]||null;
function heldWeapon(){const id=heldId(),b=B[id];return b&&b.weapon&&invCount(id)>0?b.weapon:null;}
function attackInfo(){const w=heldWeapon();if(w&&w.kind!=='bow')return w;const t=bestTool();return {dmg:({hand:1,wood:2,stone:2,iron:3,diamond:3})[t.key]||1,cd:.4,kb:5,reach:3.5,kind:'hand'};}
const BID=k=>BN[k];
// ---------- armor ----------
function armorPoints(){let s=0;for(const k in (G.armor||{})){const id=G.armor[k];if(id&&B[id]&&B[id].armor)s+=B[id].armor.def;}return s;}
function armorReduction(){return Math.min(.8,armorPoints()*.04);}
function equipArmor(id){const b=B[id];if(!b||!b.armor)return false;if(invCount(id)<1){toast('You have no '+b.name);return false;}const s=b.armor.slot;G.armor=G.armor||{};
  const old=G.armor[s];if(old===id)return true;if(!infSupplies()){if(old)addInv(old,1);G.inv[id]--;}G.armor[s]=id;sfx('buy');toast('Equipped '+b.name);vmKey='';return true;}
function unequipArmor(s){const old=(G.armor||{})[s];if(!old)return false;if(!infSupplies())addInv(old,1);G.armor[s]=0;vmKey='';toast('Took off '+B[old].name);return true;}
function bestArmorFor(slot){let best=0,bd=-1;for(const id of ITEM_IDS){const b=B[id];if(b.armor&&b.armor.slot===slot&&invCount(id)>0&&b.armor.def>bd){bd=b.armor.def;best=id;}}return best;}
// ---------- shared sprites ----------
const texCache={};
function textTex(txt,fg,bg,w,h,font){const k=txt+fg+bg+w+h;if(texCache[k])return texCache[k];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  if(bg){g.fillStyle=bg;const r=h*.3;g.beginPath();g.moveTo(r,0);g.lineTo(w-r,0);g.quadraticCurveTo(w,0,w,r);g.lineTo(w,h-r);g.quadraticCurveTo(w,h,w-r,h);g.lineTo(r,h);g.quadraticCurveTo(0,h,0,h-r);g.lineTo(0,r);g.quadraticCurveTo(0,0,r,0);g.fill();}
  g.font=font||('bold '+(h*.62|0)+'px sans-serif');g.textAlign='center';g.textBaseline='middle';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(txt,w/2,h/2+1);g.fillStyle=fg;g.fillText(txt,w/2,h/2+1);
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return texCache[k]=t;}
function heartCanvas(fill){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.fillStyle=fill;g.beginPath();g.moveTo(16,28);g.bezierCurveTo(2,18,2,6,10,6);g.bezierCurveTo(14,6,16,9,16,11);g.bezierCurveTo(16,9,18,6,22,6);g.bezierCurveTo(30,6,30,18,16,28);g.fill();g.lineWidth=2;g.strokeStyle='rgba(80,0,10,.8)';g.stroke();return c;}
const heartTex=new THREE.CanvasTexture(heartCanvas('#ff3b5c'));
const heartMat=new THREE.SpriteMaterial({map:heartTex,transparent:true,depthWrite:false});
const parts=[];// floating sprites: hearts, damage numbers, smoke
function popSprite(mat,x,y,z,s,life,vy){const sp=new THREE.Sprite(mat.clone());sp.position.set(x,y,z);sp.scale.set(s,s,s);sp.userData={t:life,life,vy:vy||.9,vx:(Math.random()-.5)*.4,vz:(Math.random()-.5)*.4};scene.add(sp);parts.push(sp);return sp;}
function heartBurst(x,y,z,n){for(let i=0;i<(n||5);i++)popSprite(heartMat,x+(Math.random()-.5)*.7,y+Math.random()*.4,z+(Math.random()-.5)*.7,.32+Math.random()*.15,1.3+Math.random()*.5,.8+Math.random()*.5);G.heartsShown=(G.heartsShown||0)+(n||5);}
function popText(x,y,z,txt,col){const m=new THREE.SpriteMaterial({map:textTex(txt,col||'#ff4040',null,96,48),transparent:true,depthWrite:false,depthTest:false});const sp=popSprite(m,x,y,z,.6,.9,1.4);sp.scale.set(.8,.4,1);sp.renderOrder=20;}
const smokeMat=new THREE.SpriteMaterial({color:0xbbbbbb,transparent:true,opacity:.6,depthWrite:false});
function puff(x,y,z,n){for(let i=0;i<(n||6);i++)popSprite(smokeMat,x+(Math.random()-.5)*.6,y+Math.random()*.3,z+(Math.random()-.5)*.6,.25+Math.random()*.2,1.2,1.1);}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const s=parts[i],u=s.userData;u.t-=dt;s.position.y+=u.vy*dt;s.position.x+=u.vx*dt;s.position.z+=u.vz*dt;s.material.opacity=Math.max(0,Math.min(1,u.t/u.life*1.6));if(u.t<=0){scene.remove(s);s.material.dispose();parts.splice(i,1);}}}
function hitSpark(x,y,z){const mat=mobMat(0xd02020);for(let i=0;i<5;i++){const m=new THREE.Mesh(brkGeo,mat);m.position.set(x+(Math.random()-.5)*.4,y+Math.random()*.4,z+(Math.random()-.5)*.4);m.userData={vx:(Math.random()-.5)*3,vy:Math.random()*3,vz:(Math.random()-.5)*3,t:.45};scene.add(m);brk.push(m);}}
// ---------- animal models ----------
const ADEF={
  cow:{name:'Cow',h:1.3,w:.42,hp:10,sp:1.2,fav:['wheat'],need:3,drop:[['beef_r',1,3]],biome:'grass',w8:3,
    body:[.9,.7,1.3,0x5a3c26],head:[.55,.5,.45,0x5a3c26,1.15,-.78],leg:[.24,.6,0x4a3020],
    extra:[[.92,.3,.4,0xf2f0ea,0,1.0,.1],[.4,.25,.5,0xf2f0ea,-.26,.8,-.3],[.3,.18,.08,0xe8a8a8,0,1.03,-1.02],[.08,.14,.08,0xe8e4d8,-.24,1.45,-.72],[.08,.14,.08,0xe8e4d8,.24,1.45,-.72]]},
  pig:{name:'Pig',h:.9,w:.36,hp:10,sp:1.1,fav:['wheat','melon','pumpkin'],need:3,drop:[['pork_r',1,3]],biome:'grass',w8:3,
    body:[.7,.55,1.0,0xf0a0a8],head:[.5,.45,.42,0xf0a0a8,.72,-.62],leg:[.2,.32,0xe08890],extra:[[.26,.18,.06,0xd87080,0,.66,-.86]]},
  sheep:{name:'Sheep',h:1.2,w:.4,hp:8,sp:1.1,fav:['wheat'],need:3,drop:[['mutton_r',1,2],['wool0',1,1]],biome:'grass',w8:3,
    body:[.82,.72,1.1,0xeeeeee],head:[.4,.42,.42,0xd8c8b0,1.08,-.66],leg:[.2,.5,0xd8c8b0],extra:[[.48,.2,.3,0xf6f6f6,0,1.3,-.6]]},
  chicken:{name:'Chicken',h:.7,w:.22,hp:4,sp:1.0,fav:['wheat'],need:3,drop:[['chicken_r',1,1]],biome:'grass',w8:3,
    body:[.4,.4,.5,0xf8f8f8],head:[.26,.32,.24,0xf8f8f8,.78,-.26],leg:[.07,.26,0xf0b020],extra:[[.12,.08,.12,0xf09020,0,.78,-.44],[.08,.12,.1,0xd02020,0,.98,-.26],[.06,.24,.36,0xe8e8e8,-.23,.48,0],[.06,.24,.36,0xe8e8e8,.23,.48,0]]},
  wolf:{name:'Wolf',h:.85,w:.3,hp:12,sp:1.5,fav:['beef_r','beef_c','pork_r','pork_c','chicken_r','chicken_c','mutton_r','mutton_c','bone'],need:3,drop:[['bone',1,2]],biome:'both',w8:1,dog:1,
    body:[.46,.46,.95,0xb8b8bc],head:[.42,.4,.4,0xc8c8cc,.78,-.62],leg:[.15,.46,0xa8a8ac],extra:[[.2,.16,.24,0xd8d8dc,0,.7,-.9],[.1,.14,.06,0x909094,-.13,1.03,-.58],[.1,.14,.06,0x909094,.13,1.03,-.58],[.12,.12,.5,0xa8a8ac,0,.75,.65],[.07,.06,.02,0x101010,-.1,.84,-.83],[.07,.06,.02,0x101010,.1,.84,-.83]]},
  cat:{name:'Cat',h:.6,w:.2,hp:8,sp:1.4,fav:['fish_r','fish_c'],need:3,drop:[],biome:'grass',w8:1,
    body:[.3,.3,.7,0xe09a3a],head:[.32,.3,.3,0xe8a446,.52,-.44],leg:[.1,.26,0xc8862c],extra:[[.08,.1,.06,0xc8862c,-.09,.71,-.44],[.08,.1,.06,0xc8862c,.09,.71,-.44],[.07,.07,.5,0xc8862c,0,.5,.55],[.06,.06,.02,0x30c040,-.07,.55,-.6],[.06,.06,.02,0x30c040,.07,.55,-.6]]},
  horse:{name:'Horse',h:1.8,w:.42,hp:15,sp:1.6,fav:['wheat'],need:4,drop:[],biome:'grass',w8:1.5,
    body:[.7,.8,1.5,0x8b5a2b],head:[.36,.4,.7,0x8b5a2b,1.85,-1.0],leg:[.2,.9,0x6e4520],extra:[[.34,.75,.4,0x8b5a2b,0,1.45,-.72],[.1,.7,.5,0x2a1a10,0,1.6,-.64],[.12,.6,.15,0x2a1a10,0,1.0,.8]]},
  polarbear:{name:'Polar Bear',h:1.4,w:.5,hp:20,sp:1.2,fav:['fish_r','fish_c'],need:4,drop:[['fish_r',1,2]],biome:'snow',w8:1.5,neutral:1,
    body:[1.0,.9,1.5,0xf2f2ec],head:[.6,.55,.55,0xf2f2ec,1.1,-.92],leg:[.3,.62,0xe6e6e0],extra:[[.24,.2,.2,0xe0e0da,0,1.0,-1.25],[.12,.08,.04,0x101010,0,1.06,-1.36],[.12,.12,.06,0xe0e0da,-.2,1.42,-.85],[.12,.12,.06,0xe0e0da,.2,1.42,-.85]]},
  fox:{name:'Arctic Fox',h:.65,w:.22,hp:8,sp:1.6,fav:['chicken_r','chicken_c','fish_r','fish_c'],need:3,drop:[],biome:'snow',w8:2,
    body:[.4,.36,.75,0xf4f4f6],head:[.36,.32,.32,0xf8f8fa,.58,-.5],leg:[.1,.3,0xd8d8dc],extra:[[.16,.12,.2,0xf0f0f2,0,.52,-.72],[.08,.06,.02,0x101010,0,.55,-.82],[.09,.14,.05,0xe0e0e4,-.11,.8,-.48],[.09,.14,.05,0xe0e0e4,.11,.8,-.48],[.2,.2,.55,0xffffff,0,.5,.6]]}};
const ATYPES=Object.keys(ADEF);
const PET_NAMES={wolf:['Rex','Buddy','Max','Luna','Scout','Rocky','Bella'],cat:['Whiskers','Mittens','Tiger','Cleo','Pumpkin'],horse:['Spirit','Thunder','Maple'],cow:['Daisy','Bessie'],pig:['Hamlet','Pinky'],sheep:['Fluffy','Cloud'],chicken:['Nugget','Peep'],polarbear:['Snowball','Iceberg'],fox:['Frost','Sly']};
function makeAnimalModel(type){const D=ADEF[type],g=new THREE.Group();const add=(par,w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(bgeo(w,h,d),mobMat(c));m.position.set(x,y,z);par.add(m);return m;};
  const [bw,bh,bd,bc]=D.body,[lw,lh,lc]=D.leg;const by=lh+bh/2-.02;add(g,bw,bh,bd,bc,0,by,0);
  const legs=[];for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const lg=new THREE.Group();lg.position.set(sx*(bw/2-lw/2),lh,sz*(bd/2-lw/2-.02));add(lg,lw,lh,lw,lc,0,-lh/2,0);g.add(lg);legs.push(lg);}
  const [hw,hh,hd,hc,hy,hz]=D.head;const head=new THREE.Group();head.position.set(0,hy,hz);add(head,hw,hh,hd,hc,0,0,0);g.add(head);
  for(const [w,h,d,c,x,y,z] of (D.extra||[])){if(Math.abs(z-hz)<hd/2+.25&&y>hy-hh/2-.05&&Math.abs(z)>bd/2-.1&&z<0)add(head,w,h,d,c,x,y-hy,z-hz);else add(g,w,h,d,c,x,y,z);}
  g.userData={legs,head,hw,hh,hd};scene.add(g);return g;}
function spawnAnimal(type,x,y,z){const D=ADEF[type];if(!D)return null;const a={type,D,x,y,z,vx:0,vy:0,vz:0,ground:false,h:D.h,w:D.w,hp:D.hp,g:makeAnimalModel(type),ph:Math.random()*6,t:Math.random()*3,tgt:null,love:0,loveT:0,pet:null,panicT:0,atk:0,hurtT:0,acc:0,yaw:Math.random()*6.28};
  a.g.position.set(x,y,z);G.animals.push(a);return a;}
function removeAnimal(a){scene.remove(a.g);if(a.tag)a.tag.material.dispose();if(a.meter)a.meter.material.dispose();const i=G.animals.indexOf(a);if(i>=0)G.animals.splice(i,1);}
function setTag(a){if(a.tag){a.g.remove(a.tag);a.tag.material.dispose();}const txt=a.pet.name+(a.pet.sit?' (sit)':'');const m=new THREE.SpriteMaterial({map:textTex(txt,'#ffffff','rgba(0,0,0,.55)',256,56),transparent:true,depthWrite:false});
  a.tag=new THREE.Sprite(m);a.tag.scale.set(1.5,.33,1);a.tag.position.set(0,a.h+.45,0);a.g.add(a.tag);}
function addCollar(a){const U=a.g.userData;if(U.collar)return;const c=new THREE.Mesh(bgeo(U.hw+.06,.1,.14),mobMat(a.pet.collar||0xe02828));c.position.set(0,-U.hh/2+.07,U.hd/2+.02);U.head.add(c);U.collar=c;
  const tagM=new THREE.Mesh(bgeo(.08,.08,.03),mobMat(0xffd040));tagM.position.set(0,-U.hh/2-.02,-U.hd/2+0.02);c.add(tagM);tagM.position.set(0,-.07,-.06);}
const meterTex={};function meterMat(n,need){const k=n+'/'+need;if(!meterTex[k]){const c=document.createElement('canvas');c.width=need*36;c.height=36;const g=c.getContext('2d');const f=heartCanvas('#ff3b5c'),e=heartCanvas('rgba(60,60,60,.7)');for(let i=0;i<need;i++)g.drawImage(i<n?f:e,i*36+2,2);meterTex[k]=new THREE.CanvasTexture(c);}
  return new THREE.SpriteMaterial({map:meterTex[k],transparent:true,depthWrite:false});}
function showMeter(a){if(a.meter){a.g.remove(a.meter);a.meter.material.dispose();}a.meter=new THREE.Sprite(meterMat(a.love,a.D.need));a.meter.scale.set(.32*a.D.need,.32,1);a.meter.position.set(0,a.h+.4,0);a.g.add(a.meter);a.loveT=6;}
function tameAnimal(a,name,silent){const names=PET_NAMES[a.type]||['Buddy'];a.pet={name:name||names[(Math.random()*names.length)|0],sit:false,collar:[0xe02828,0x2860e0,0x28b040,0xe0a020,0xb030d0][G.animals.filter(o=>o.pet).length%5],id:Date.now()%1e7+'_'+(Math.random()*1e4|0)};
  a.love=a.D.need;a.hp=a.D.hp;a.panicT=0;a.hostile=false;if(a.meter){a.g.remove(a.meter);a.meter=null;}addCollar(a);setTag(a);if(!silent){heartBurst(a.x,a.y+a.h,a.z,10);sfx('buy');toast(a.D.name+' likes you! '+a.pet.name+' is now your pet');}G.petsTamed=(G.petsTamed||0)+1;return a;}
function spawnPet(type){const d=lookDir();let x=G.p.x+d[0]*2,z=G.p.z+d[2]*2;let y=G.p.y;if(hitsWorld(x,y,z,.3,ADEF[type].h)){x=G.p.x;z=G.p.z;}const a=spawnAnimal(type,x,y+.05,z);tameAnimal(a,null,true);heartBurst(a.x,a.y+a.h,a.z,8);toast(a.pet.name+' the '+a.D.name+' is your pet!');return a;}
function renamePet(a,name){name=String(name||'').trim().slice(0,16);if(!name||!a.pet)return;a.pet.name=name;setTag(a);}
function petSit(a,v){a.pet.sit=v===undefined?!a.pet.sit:!!v;a.vx=a.vz=0;a.target=null;setTag(a);return a.pet.sit;}
// ---------- spawning ----------
function surfAt(x,z){const ch=getChunk(x>>4,z>>4);if(!ch)return null;const t=ch.top[(z&15)*16+(x&15)];const b=ch.d[(t*CS+(z&15))*CS+(x&15)];return {y:t+1,b};}
function pickType(list){let s=0;for(const t of list)s+=ADEF[t].w8;let r=Math.random()*s;for(const t of list){r-=ADEF[t].w8;if(r<=0)return t;}return list[0];}
const FARM=ATYPES.filter(t=>ADEF[t].biome!=='snow'),SNOWY=ATYPES.filter(t=>ADEF[t].biome!=='grass');
function trySpawnHerd(near){const p=G.p;if(p.y<SEA-25||G.zone==='Hell')return 0;const a=Math.random()*6.283,r=near?10+Math.random()*14:20+Math.random()*22;const x=Math.floor(p.x+Math.cos(a)*r),z=Math.floor(p.z+Math.sin(a)*r);
  const s=surfAt(x,z);if(!s||s.y<=SEA)return 0;let list=null;if(s.b===BN.grass||s.b===BN.flowers)list=FARM;else if(s.b===BN.snow||s.b===BN.snowblock||s.b===BN.ice)list=SNOWY;if(!list)return 0;
  if(cityAt(x,z,'s'))return 0;const type=pickType(list);const n=type==='horse'||type==='polarbear'||type==='cat'?1+(Math.random()*2|0):2+(Math.random()*3|0);let k=0;
  for(let i=0;i<n&&wildCount()<ANIMAL_MAX;i++){const xx=x+(Math.random()*4|0)-2,zz=z+(Math.random()*4|0)-2;const s2=surfAt(xx,zz);if(!s2||s2.y<=SEA||!s2.b||LIQ[s2.b])continue;if(hitsWorld(xx+.5,s2.y,zz+.5,ADEF[type].w,ADEF[type].h))continue;spawnAnimal(type,xx+.5,s2.y,zz+.5);k++;}return k;}
const wildCount=()=>{let n=0;for(const a of G.animals)if(!a.pet)n++;return n;};
// ---------- animal AI ----------
function nearestThreat(a,R){let best=null,bd=R;for(const m of G.mobs){const d=Math.hypot(m.x-a.x,m.z-a.z);if(d<bd&&Math.abs(m.y-a.y)<4&&Math.hypot(m.x-G.p.x,m.z-G.p.z)<18){bd=d;best=m;}}
  for(const n of (G.npcs||[]))if(n.hostile||(n.role==='guard'&&npcAggro(n))){const d=Math.hypot(n.x-a.x,n.z-a.z);if(d<bd&&Math.abs(n.y-a.y)<4){bd=d;best=n;}}return best;}
function tickAnimal(a,dt){const p=G.p,dx=p.x-a.x,dz=p.z-a.z,dist=Math.hypot(dx,dz);let tx=0,tz=0,sp=0;a.atk-=dt;a.hurtT-=dt;a.panicT-=dt;
  if(a.pet){const P=a.pet;
    if(!P.sit&&(dist>20||Math.abs(p.y-a.y)>8)&&!G.dead){petTeleport(a);return;}
    if(!P.sit&&a.D.dog){if(!a.target||a.target.hp<=0||!(G.mobs.includes(a.target)||(G.npcs||[]).includes(a.target)))a.target=nearestThreat(a,12);}else a.target=null;
    if(a.target){const t=a.target,ex=t.x-a.x,ez=t.z-a.z,ed=Math.hypot(ex,ez);sp=a.D.sp*3.2;if(ed>1.1){tx=ex/ed;tz=ez/ed;}a.yaw=Math.atan2(-ex,-ez);
      if(ed<1.6&&Math.abs(t.y-a.y)<2&&a.atk<=0){a.atk=.8;const dir=[ex/(ed||1),0,ez/(ed||1)];if(G.mobs.includes(t))dmgMob(t,5,5,dir,'pet');else hitNPC(t,5,dir);G.petBites=(G.petBites||0)+1;a.g.userData.head.position.z-=.15;}}
    else if(!P.sit&&dist>3){sp=Math.min(a.D.sp*3.4,dist>8?6:4.5);tx=dx/dist;tz=dz/dist;}
    else if(dist<6)a.yaw=Math.atan2(-dx,-dz);}
  else{const tempt=!a.hostile&&a.panicT<=0&&dist<8&&(a.D.fav.indexOf((heldB()||{}).key)>=0)&&invCount(heldId())>0;
    if(a.hostile&&!G.dead&&ST.mobs!==false){if(dist>20){a.hostile=false;}else{sp=a.D.sp*2.4;if(dist>1.2){tx=dx/dist;tz=dz/dist;}if(dist<1.6&&Math.abs(p.y-a.y)<1.6&&a.atk<=0){a.atk=1.1;hurt(4,'A polar bear got you');}}}
    else if(a.panicT>0){sp=a.D.sp*2.6;tx=-dx/(dist||1);tz=-dz/(dist||1);}
    else if(tempt){if(dist>2){sp=a.D.sp*1.2;tx=dx/dist;tz=dz/dist;}else a.yaw=Math.atan2(-dx,-dz);}
    else{a.t-=dt;if(a.t<=0){if(Math.random()<.45){a.tgt=null;a.t=2+Math.random()*4;}else{const an=Math.random()*6.283,r=2+Math.random()*6;a.tgt=[a.x+Math.cos(an)*r,a.z+Math.sin(an)*r];a.t=6+Math.random()*3;}}
      if(a.tgt){const ex=a.tgt[0]-a.x,ez=a.tgt[1]-a.z,ed=Math.hypot(ex,ez);if(ed<.5)a.tgt=null;else{sp=a.D.sp;tx=ex/ed;tz=ez/ed;}}}}
  if(a.pet&&a.pet.sit){tx=tz=0;sp=0;}
  a.vx+=(tx*sp-a.vx)*Math.min(1,dt*6);a.vz+=(tz*sp-a.vz)*Math.min(1,dt*6);
  const liq=inLiquid(a.x,a.y+.3,a.z);if(liq){a.vy=Math.min(2,a.vy+20*dt);if(liq===2&&!a.pet){a.hp-=dt*4;if(a.hp<=0){removeAnimal(a);return;}}}else a.vy=Math.max(a.vy-28*dt,-40);
  const r=moveEnt(a,dt,Math.min(.45,a.w),a.h*.95,false);if((r.hitX||r.hitZ)&&a.ground&&sp>0){a.vy=8;if(!a.pet)a.tgt=null;}
  if(a.y<2){if(a.pet)petTeleport(a);else{removeAnimal(a);return;}}
  if(liq===2&&a.pet)petTeleport(a);
  const v=Math.hypot(a.vx,a.vz);if(v>.3&&!(a.target&&Math.hypot(a.target.x-a.x,a.target.z-a.z)<1.6))a.yaw=Math.atan2(-a.vx,-a.vz);a.ph+=dt*v*6;
  const U=a.g.userData,sw=Math.sin(a.ph)*Math.min(1,v/1.2)*.6;U.legs[0].rotation.x=sw;U.legs[3].rotation.x=sw;U.legs[1].rotation.x=-sw;U.legs[2].rotation.x=-sw;
  const sit=a.pet&&a.pet.sit;if(sit){U.legs[2].rotation.x=U.legs[3].rotation.x=-1.3;U.legs[0].rotation.x=U.legs[1].rotation.x=0;}
  U.head.position.z+=((ADEF[a.type].head[5])-U.head.position.z)*Math.min(1,dt*8);
  a.g.position.set(a.x,a.y-(sit?a.D.leg[1]*.45:0),a.z);a.g.rotation.set(sit?-.25:0,a.yaw,0);a.g.scale.setScalar(a.hurtT>0?1.1:1);
  if(a.meter){a.loveT-=dt;if(a.loveT<=0){a.g.remove(a.meter);a.meter.material.dispose();a.meter=null;}}}
function petTeleport(a){const p=G.p,d=lookDir();for(const [ox,oz] of [[-d[0]*1.6,-d[2]*1.6],[1.5,0],[-1.5,0],[0,1.5],[0,-1.5],[0,0]]){const x=p.x+ox,z=p.z+oz;if(!hitsWorld(x,p.y,z,Math.min(.45,a.w),a.h*.95)){a.x=x;a.z=z;a.y=p.y;a.vx=a.vz=a.vy=0;a.g.position.set(a.x,a.y,a.z);G.petTeleports=(G.petTeleports||0)+1;return;}}a.x=p.x;a.y=p.y;a.z=p.z;}
function updateAnimals(dt){const p=G.p;const on=ST.animals!==false;G.animalSpawnT=(G.animalSpawnT||0)-dt;
  if(on&&G.animalSpawnT<=0){const w=wildCount();G.animalSpawnT=w<6?.4:2.5;if(w<ANIMAL_MAX)trySpawnHerd(w<4);}
  const far=ST.rd*16*.92;let vis=0;
  for(const a of G.animals.slice()){const d=Math.hypot(a.x-p.x,a.z-p.z);
    if(!a.pet&&(d>96||!on)){removeAnimal(a);continue;}
    const loaded=!!getChunk(Math.floor(a.x)>>4,Math.floor(a.z)>>4);
    if(!loaded){if(a.pet&&!a.pet.sit)petTeleport(a);a.g.visible=false;continue;}
    a.g.visible=d<far;if(a.g.visible)vis++;
    if(!a.pet&&d>36){a.acc+=dt;if(a.acc<.25)continue;tickAnimal(a,Math.min(.25,a.acc));a.acc=0;}else tickAnimal(a,dt);}
  G.animalVis=vis;}
function animalUnderCrosshair(reach){const d=lookDir(),p=G.p,o=[p.x,p.y+1.62,p.z];let best=null,bt=reach||attackInfo().reach;const blk=raycast(6);if(blk)bt=Math.min(bt,blk.t);
  for(const a of G.animals){if(!a.g.visible)continue;const w=Math.max(.3,a.w+.08);const mn=[a.x-w,a.y,a.z-w],mx=[a.x+w,a.y+a.h,a.z+w];let t0=0,t1=bt,ok=true;
    for(let k=0;k<3;k++){if(Math.abs(d[k])<1e-6){if(o[k]<mn[k]||o[k]>mx[k]){ok=false;break;}continue;}let ta=(mn[k]-o[k])/d[k],tb=(mx[k]-o[k])/d[k];if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){ok=false;break;}}
    if(ok&&t0<bt){bt=t0;best=a;}}if(best)best._t=bt;return best;}
function hitAnimal(a,dmg,kb,dir){if(!a||a.pet){G.petHitBlocked=(G.petHitBlocked||0)+1;return;}const info=attackInfo();dmg=dmg||info.dmg;kb=kb||info.kb;dir=dir||lookDir();a.hp-=dmg;a.hurtT=.3;a.vx+=dir[0]*kb;a.vz+=dir[2]*kb;a.vy=4.5;a.panicT=4;G.swingT=.25;
  if(a.D.neutral)a.hostile=true;popText(a.x,a.y+a.h+.3,a.z,'-'+dmg);hitSpark(a.x,a.y+a.h*.6,a.z);sfx('hit');if(a.hp<=0)killAnimal(a);}
function killAnimal(a){const got=[];for(const [k,mn,mx] of a.D.drop){const n=mn+(Math.random()*(mx-mn+1)|0);if(n>0){addInv(BN[k],n);got.push('+'+n+' '+B[BN[k]].name);}}
  spawnBreak(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z),BN.dirt);if(got.length)floatCoin(got.join(', '));G.stats.animals=(G.stats.animals||0)+1;removeAnimal(a);updHotbar();}
const ANY_TREAT=['wheat','melon','pumpkin','bone','apple'];
function animalLikes(a,id){const b=B[id];if(!b||!(invCount(id)>0))return 0;if(a.D.fav.indexOf(b.key)>=0)return 2;return (b.food||ANY_TREAT.indexOf(b.key)>=0)?1:0;}
function isFeedItem(id){const b=B[id];return !!(b&&(b.food||ANY_TREAT.indexOf(b.key)>=0)&&invCount(id)>0);}
function canAttackAnimal(){const id=heldId(),b=B[id];if(!id||!b||!(invCount(id)>0))return true;return !!b.weapon;}
function feedAnimal(a){const id=heldId(),b=B[id];const lk=animalLikes(a,id);if(!lk)return false;if(!infSupplies())G.inv[id]--;
  a.hp=Math.min(a.D.hp,a.hp+2);a.panicT=0;a.hostile=false;a.hurtT=0;sfx('place');G.feeds=(G.feeds||0)+1;G.swingT=.25;
  if(a.pet){heartBurst(a.x,a.y+a.h,a.z,4);toast(a.pet.name+' loved the '+b.name+'!');updHotbar();return true;}
  a.love=Math.min(a.D.need,a.love+lk);heartBurst(a.x,a.y+a.h,a.z,5);if(a.love>=a.D.need){tameAnimal(a);updHotbar();setTimeout(()=>{if(G.mode==='play'&&!stack.length)openPetName(a);},700);}else{showMeter(a);toast(a.D.name+(lk>1?' LOVES ':' likes ')+b.name+' \u2665 '+a.love+'/'+a.D.need);}updHotbar();return true;}
function interactAnimal(a){if(isFeedItem(heldId())){if(feedAnimal(a))return;}
  if(a.pet){const s=petSit(a);toast(a.pet.name+(s?' sits and waits':' follows you'));sfx('click');return;}
  if(canAttackAnimal())hitAnimal(a);else{G.noHit=(G.noHit||0)+1;toast('Hold food to FEED, or a weapon / empty hand to attack');}}
// ---------- monsters: shared damage ----------
function dmgMob(m,dmg,kb,dir,src){m.hp-=dmg;m.hurtT=.25;m.vx+=dir[0]*kb;m.vz+=dir[2]*kb;m.vy=4.5;popText(m.x,m.y+m.h+.2,m.z,'-'+dmg);hitSpark(m.x,m.y+m.h*.6,m.z);sfx('hit');
  if(m.hp<=0){if(src==='pet')G.petKills=(G.petKills||0)+1;killMob(m,true);}}
// ---------- fish ----------
const fishBodyGeo=new THREE.BoxGeometry(.12,.16,.32),fishTailGeo=new THREE.BoxGeometry(.03,.14,.12);
const fishMat=new THREE.MeshLambertMaterial({color:0xffffff});
const fishBody=new THREE.InstancedMesh(fishBodyGeo,fishMat,FISH_MAX),fishTail=new THREE.InstancedMesh(fishTailGeo,fishMat,FISH_MAX);
fishBody.count=fishTail.count=0;fishBody.frustumCulled=fishTail.frustumCulled=false;scene.add(fishBody,fishTail);
const FISHC=[0xff8a20,0xffd030,0x30a0ff,0xff4060,0x40e0a0,0xb070ff,0xf0f0f0];
function spawnSchool(){if(G.schools.length>=SCHOOL_MAX)return null;const p=G.p;const a=Math.random()*6.283,r=6+Math.random()*22;const x=Math.floor(p.x+Math.cos(a)*r),z=Math.floor(p.z+Math.sin(a)*r);
  if(!getChunk(x>>4,z>>4))return null;if(getB(x,SEA,z)!==BN.water||getB(x,SEA-2,z)!==BN.water)return null;let n=0;for(const s of G.schools)n+=s.fish.length;const k=Math.min(3+(Math.random()*4|0),FISH_MAX-n);if(k<2)return null;
  const col=FISHC[(Math.random()*FISHC.length)|0],col2=FISHC[(Math.random()*FISHC.length)|0];const s={x:x+.5,y:SEA-1.1,z:z+.5,tx:x+.5,tz:z+.5,t:0,fish:[]};
  for(let i=0;i<k;i++)s.fish.push({ph:Math.random()*6.283,r:.4+Math.random()*.9,sp:(.8+Math.random()*.6)*(Math.random()<.5?1:-1),yo:(Math.random()-.5)*.5,c:new THREE.Color(i%3===2?col2:col).offsetHSL((Math.random()-.5)*.05,0,(Math.random()-.5)*.1),pos:new THREE.Vector3()});
  G.schools.push(s);return s;}
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_off=new THREE.Vector3();
function updateFish(dt){const p=G.p;G.fishSpawnT=(G.fishSpawnT||0)-dt;const on=ST.animals!==false;
  if(on&&G.fishSpawnT<=0&&G.schools.length<SCHOOL_MAX&&p.y>SEA-30){G.fishSpawnT=G.schools.length<3?.3:2;spawnSchool();}
  let n=0;const now=performance.now()/1000,far=Math.min(40,ST.rd*16*.8);
  for(let i=G.schools.length-1;i>=0;i--){const s=G.schools[i];const d=Math.hypot(s.x-p.x,s.z-p.z);if(d>56||!on||!s.fish.length||!getChunk(Math.floor(s.x)>>4,Math.floor(s.z)>>4)){G.schools.splice(i,1);continue;}
    s.t-=dt;if(s.t<=0){s.t=3+Math.random()*4;const nx=s.x+(Math.random()-.5)*8,nz=s.z+(Math.random()-.5)*8;if(getB(Math.floor(nx),SEA-1,Math.floor(nz))===BN.water&&getB(Math.floor(nx),SEA-2,Math.floor(nz))===BN.water){s.tx=nx;s.tz=nz;}}
    s.x+=(s.tx-s.x)*Math.min(1,dt*.4);s.z+=(s.tz-s.z)*Math.min(1,dt*.4);
    if(d>far)continue;
    for(const f of s.fish){const an=f.ph+now*f.sp;f.pos.set(s.x+Math.cos(an)*f.r,s.y+f.yo+Math.sin(now*1.3+f.ph)*.15,s.z+Math.sin(an)*f.r);
      const head=Math.atan2(-Math.sin(an)*f.sp,Math.cos(an)*f.sp);_e.set(0,-head+Math.PI,0);_q.setFromEuler(_e);_m4.compose(f.pos,_q,_s);fishBody.setMatrixAt(n,_m4);fishBody.setColorAt(n,f.c);
      _off.set(Math.sin(now*12+f.ph)*.04,0,.2).applyQuaternion(_q);_v.copy(f.pos).add(_off);_e.set(0,-head+Math.PI+Math.sin(now*12+f.ph)*.5,0);_q.setFromEuler(_e);_m4.compose(_v,_q,_s);fishTail.setMatrixAt(n,_m4);fishTail.setColorAt(n,f.c);n++;}}
  fishBody.count=fishTail.count=n;fishBody.instanceMatrix.needsUpdate=fishTail.instanceMatrix.needsUpdate=true;if(n){fishBody.instanceColor.needsUpdate=fishTail.instanceColor.needsUpdate=true;}G.fishVis=n;}
function fishCount(){let n=0;for(const s of G.schools)n+=s.fish.length;return n;}
function fishUnderCrosshair(maxD){const d=lookDir(),p=G.p,o=new THREE.Vector3(p.x,p.y+1.62,p.z),dv=new THREE.Vector3(d[0],d[1],d[2]);const blk=raycast(6);const lim=Math.min(maxD||4.5,blk?blk.t:99);let best=null,bt=lim;
  for(const s of G.schools)for(const f of s.fish){_v.copy(f.pos).sub(o);const t=_v.dot(dv);if(t<0||t>bt)continue;const perp=_v.addScaledVector(dv,-t).length();if(perp<.4){bt=t;best={s,f};}}return best;}
function takeFish(s,f){const i=s.fish.indexOf(f);if(i>=0)s.fish.splice(i,1);addInv(BN.fish_r,1);G.stats.fish=(G.stats.fish||0)+1;}
function catchFishHand(hit){takeFish(hit.s,hit.f);sfx('place');floatCoin('+1 Raw Fish');toast('You caught a fish!');updHotbar();return true;}
function raycastLiq(maxD){const p=G.p;const ox=p.x,oy=p.y+1.62,oz=p.z;const d=lookDir();let x=Math.floor(ox),y=Math.floor(oy),z=Math.floor(oz);const sx=d[0]>0?1:-1,sy=d[1]>0?1:-1,sz=d[2]>0?1:-1;
  const tdx=Math.abs(1/d[0]),tdy=Math.abs(1/d[1]),tdz=Math.abs(1/d[2]);let tx=(d[0]>0?x+1-ox:ox-x)*tdx,ty=(d[1]>0?y+1-oy:oy-y)*tdy,tz=(d[2]>0?z+1-oz:oz-z)*tdz;let n=[0,0,0],t=0;
  while(t<=maxD){const b=getB(x,y,z);if(b>0&&(LIQ[b]||SOLID[b]||OPQ[b]))return {x,y,z,n,b,t};if(tx<ty&&tx<tz){x+=sx;t=tx;tx+=tdx;n=[-sx,0,0];}else if(ty<tz){y+=sy;t=ty;ty+=tdy;n=[0,-sy,0];}else{z+=sz;t=tz;tz+=tdz;n=[0,0,-sz];}}return null;}
function useNet(){const t=raycastLiq(6);if(!t||t.b!==BN.water){toast('Aim the net at water');return true;}let k=0;const c=new THREE.Vector3(t.x+.5,t.y+.5,t.z+.5);
  for(const s of G.schools)for(const f of s.fish.slice())if(f.pos.distanceTo(c)<3.2){takeFish(s,f);k++;}
  if(k){floatCoin('+'+k+' Raw Fish');toast('Your net caught '+k+' fish!');sfx('buy');}else toast('No fish here. Look for fish schools');G.swingT=.3;updHotbar();return true;}
const bobber=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.16),new THREE.MeshLambertMaterial({color:0xff2020}));bobber.visible=false;scene.add(bobber);
function useRod(){const R=G.rod;if(R){if(R.bite>0){addInv(BN.fish_r,1);G.stats.fish=(G.stats.fish||0)+1;floatCoin('+1 Raw Fish');toast('Reeled in a fish!');sfx('buy');}else toast('Reeled in. Nothing yet');G.rod=null;bobber.visible=false;updHotbar();return true;}
  const t=raycastLiq(14);if(!t||t.b!==BN.water){toast('Cast the rod into water');return true;}G.rod={x:t.x+.5,y:t.y+.92,z:t.z+.5,wait:1.2+Math.random()*2,bite:0};bobber.position.set(G.rod.x,G.rod.y,G.rod.z);bobber.visible=true;G.swingT=.3;sfx('click');toast('Cast! Wait for a bite, then tap');return true;}
function updRod(dt){const R=G.rod;if(!R)return;if(Math.hypot(R.x-G.p.x,R.z-G.p.z)>20){G.rod=null;bobber.visible=false;return;}
  if(R.bite>0){R.bite-=dt;bobber.position.y=R.y-.25;if(R.bite<=0){R.wait=1.5+Math.random()*2.5;toast('It got away...');}}else{R.wait-=dt;bobber.position.y=R.y+Math.sin(performance.now()/300)*.04;if(R.wait<=0){R.bite=2.2;sfx('hit');toast('Bite! Tap to reel in');}}}
// ---------- food ----------
function hungry(){return G.hp<20||(hungerOn()&&G.food<20);}
const hungerOn=()=>ST.hunger===true&&!CH.god&&!creative();
function eatFood(id){const b=B[id];if(!b||!b.food)return false;if(invCount(id)<1){toast('Out of '+b.name);return false;}if(!hungry()){toast("You're full");return false;}
  if(!infSupplies())G.inv[id]--;const h0=G.hp;G.hp=Math.min(20,G.hp+b.food);G.food=Math.min(20,(G.food===undefined?20:G.food)+b.food*1.5);G.eaten=(G.eaten||0)+1;
  sfx('place');setTimeout(()=>sfx('click'),120);G.swingT=.3;const d=lookDir();const cm=mobMat(avgColor(b.tx[0]));for(let i=0;i<7;i++){const m=new THREE.Mesh(brkGeo,cm);m.scale.setScalar(.35);m.position.set(G.p.x+d[0]*.9+(Math.random()-.5)*.2,G.p.y+1.3,G.p.z+d[2]*.9+(Math.random()-.5)*.2);m.userData={vx:(Math.random()-.5)*1.5,vy:Math.random()*1.5,vz:(Math.random()-.5)*1.5,t:.5};scene.add(m);brk.push(m);}toast('Ate '+b.name+' (+'+(Math.round((G.hp-h0)*10)/10)+' health)');updHotbar();return true;}
function updHunger(dt){if(G.food===undefined)G.food=20;if(!hungerOn()){return;}G.food=Math.max(0,G.food-dt/30);if(G.food<=0&&G.hp>2){G.starveT=(G.starveT||0)+dt;if(G.starveT>4){G.starveT=0;hurt(1,'You starved');}}}
function rawFoods(){return ITEM_IDS.filter(id=>B[id].cooksTo&&invCount(id)>0);}
function cookFood(id,n){const b=B[id];if(!b||!b.cooksTo)return 0;const have=invCount(id);n=Math.min(n||1,have===Infinity?(n||1):have);if(n<1)return 0;const to=BN[b.cooksTo];if(!infSupplies())G.inv[id]-=n;addInv(to,n);G.cooked=(G.cooked||0)+n;sfx('buy');
  if(G.cookAt)puff(G.cookAt.x+.5,G.cookAt.y+.8,G.cookAt.z+.5,8);toast('Cooked '+n+' '+B[to].name);return n;}
function openCook(t){G.cookAt={x:t.x,y:t.y,z:t.z,b:t.b};openScreen('cook');}
function renderCook(){const L=$('cookList');L.innerHTML='';$('cookTitle').textContent=G.cookAt?B[G.cookAt.b].name:'Cook';const raws=ITEM_IDS.filter(id=>B[id].cooksTo);let any=false;
  for(const id of raws){const c=invCount(id);if(!(c>0))continue;any=true;const to=BN[B[id].cooksTo];const r=document.createElement('div');r.className='shrow';
    r.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(B[id].name)} <small>x${c===Infinity?'\u221e':c} &rarr; ${esc(B[to].name)} (+${B[to].food} health)</small></div><button class="btn sm gold" data-n="1">Cook 1</button><button class="btn sm green" data-n="all">Cook all</button>`;
    r.querySelectorAll('button').forEach(bt=>bindTap(bt,()=>{cookFood(id,bt.dataset.n==='all'?(c===Infinity?16:c):1);renderCook();updHotbar();}));L.appendChild(r);}
  if(!any)L.innerHTML='<p class="small">No raw food. Hunt cows, pigs, sheep and chickens, or catch fish, then cook the meat here. Cooked food heals much more.</p>';
  const cooked=ITEM_IDS.filter(id=>B[id].food&&!B[id].cooksTo&&invCount(id)>0);if(cooked.length){const p=document.createElement('p');p.className='small';p.innerHTML='Ready to eat: '+cooked.map(id=>esc(B[id].name)+' x'+(invCount(id)===Infinity?'\u221e':invCount(id))).join(', ')+'. Select it in the hotbar and press EAT.';L.appendChild(p);}}
// ---------- buckets & limited liquid flow ----------
const flowable=b=>b===0||b===BN.snowlayer||b===BN.crops;
const SPREAD={},LKEY=(x,y,z)=>x+','+y+','+z;
function useBucket(id){const b=B[id];if(b.key==='bucket'){const t=raycastLiq(5);if(!t||!LIQ[t.b]){toast('Aim the bucket at water or lava');return true;}
    const full=t.b===BN.water?BN.bucket_w:BN.bucket_l;setB(t.x,t.y,t.z,0);G.lavaFlow.delete(LKEY(t.x,t.y,t.z));if(!infSupplies()){G.inv[id]--;addInv(full,1);}const j=G.hot.indexOf(id);if(j>=0&&!infSupplies()&&!(G.inv[id]>0))G.hot[j]=full;
    sfx('place');toast('Filled: '+B[full].name);G.swingT=.3;updHotbar();return true;}
  const liq=b.key==='bucket_w'?BN.water:BN.lava;const t=raycast(6);if(!t){toast('Aim at a block to pour');return true;}const x=t.x+t.n[0],y=t.y+t.n[1],z=t.z+t.n[2];const c=getB(x,y,z);
  if(!(flowable(c)||LIQ[c])){return true;}placeLiquid(x,y,z,liq);if(!infSupplies()){G.inv[id]--;addInv(BN.bucket,1);const j=G.hot.indexOf(id);if(j>=0&&!(G.inv[id]>0))G.hot[j]=BN.bucket;}
  sfx('place');toast(liq===BN.lava?'Poured lava':'Poured water');G.swingT=.3;updHotbar();return true;}
function setLiq(x,y,z,id,lvl,src){if(y<1||y>=H)return;
  const nb=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]];
  if(id===BN.lava){for(const [dx,dy,dz] of nb)if(getB(x+dx,y+dy,z+dz)===BN.water){setB(x,y,z,lvl===0?BN.obsidian:BN.cobble);G.reacts=(G.reacts||0)+1;return;}}
  else{for(const [dx,dy,dz] of nb){const xx=x+dx,yy=y+dy,zz=z+dz;if(getB(xx,yy,zz)===BN.lava){const k=LKEY(xx,yy,zz);setB(xx,yy,zz,G.lavaFlow.has(k)?BN.cobble:BN.obsidian);G.lavaFlow.delete(k);G.reacts=(G.reacts||0)+1;}}}
  setB(x,y,z,id);if(id===BN.lava&&lvl>0)G.lavaFlow.add(LKEY(x,y,z));src.n++;G.flowQ.push({x,y,z,id,lvl,src});}
function placeLiquid(x,y,z,id){const src={n:0,max:id===BN.lava?64:80,id};setLiq(x,y,z,id,0,src);return src;}
function updFlow(dt){if(!G.flowQ.length)return;G.flowT=(G.flowT||0)-dt;if(G.flowT>0)return;G.flowT=.22;const q=G.flowQ;G.flowQ=[];
  for(const e of q){if(getB(e.x,e.y,e.z)!==e.id)continue;if(e.src.n>=e.src.max)continue;const below=getB(e.x,e.y-1,e.z);
    if(flowable(below)){setLiq(e.x,e.y-1,e.z,e.id,Math.max(1,e.lvl),e.src);continue;}
    if(LIQ[below]===LIQ[e.id]&&e.lvl>0)continue;
    const lim=e.id===BN.lava?4:5;if(e.lvl>=lim)continue;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){if(e.src.n>=e.src.max)break;const x=e.x+dx,z=e.z+dz;if(flowable(getB(x,e.y,z)))setLiq(x,e.y,z,e.id,e.lvl+1,e.src);}}}
// ---------- bow & arrows ----------
const arrowGeo=new THREE.BoxGeometry(.05,.05,.6),arrowMat=new THREE.MeshLambertMaterial({color:0x9a7040});
function shootArrow(){const ai=BN.arrow;if(invCount(ai)<1){toast('No arrows! Buy them in the Shop');return true;}if((G.bowCool||0)>0)return true;G.bowCool=.6;if(!infSupplies())G.inv[ai]--;
  const d=lookDir();const m=new THREE.Mesh(arrowGeo,arrowMat);const a={x:G.p.x+d[0]*.5,y:G.p.y+1.5+d[1]*.5,z:G.p.z+d[2]*.5,vx:d[0]*30,vy:d[1]*30+1,vz:d[2]*30,t:5,stuck:false,m};m.position.set(a.x,a.y,a.z);scene.add(m);G.arrows.push(a);G.shots=(G.shots||0)+1;G.swingT=.3;sfx('door');updHotbar();return true;}
function updArrows(dt){for(let i=G.arrows.length-1;i>=0;i--){const a=G.arrows[i];a.t-=dt;if(a.t<=0){scene.remove(a.m);G.arrows.splice(i,1);continue;}if(a.stuck)continue;
    const steps=4;let done=false;for(let s=0;s<steps&&!done;s++){const h=dt/steps;a.vy-=12*h;a.x+=a.vx*h;a.y+=a.vy*h;a.z+=a.vz*h;const sp=Math.hypot(a.vx,a.vy,a.vz)||1,dir=[a.vx/sp,0,a.vz/sp];
      if(isSolidAt(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z))){a.stuck=true;a.t=Math.min(a.t,3);break;}
      for(const m of G.mobs)if(Math.abs(m.x-a.x)<.5&&Math.abs(m.z-a.z)<.5&&a.y>m.y&&a.y<m.y+m.h){dmgMob(m,6,4,dir);done=true;break;}
      if(!done)for(const an of G.animals)if(!an.pet&&Math.abs(an.x-a.x)<an.w+.15&&Math.abs(an.z-a.z)<an.w+.15&&a.y>an.y&&a.y<an.y+an.h){hitAnimal(an,6,4,dir);done=true;break;}
      if(!done)for(const n of (G.npcs||[]))if((n.role==='guard'||n.role==='demon')&&Math.abs(n.x-a.x)<.45&&Math.abs(n.z-a.z)<.45&&a.y>n.y&&a.y<n.y+n.h){hitNPC(n,6,dir);done=true;break;}}
    if(done){G.arrowHits=(G.arrowHits||0)+1;scene.remove(a.m);G.arrows.splice(i,1);continue;}
    a.m.position.set(a.x,a.y,a.z);if(!a.stuck)a.m.lookAt(a.x+a.vx,a.y+a.vy,a.z+a.vz);}
  G.bowCool=Math.max(0,(G.bowCool||0)-dt);}
// ---------- item use (tap) ----------
function useItem(id){const b=B[id];if(!b||!b.item)return false;if(invCount(id)<1){toast('Out of '+b.name+' - buy more in the Shop');return true;}
  if(b.key==='bow')return shootArrow();
  if(b.food){const t=raycast(6);if(t&&B[t.b].cook&&b.cooksTo){openCook(t);return true;}eatFood(id);return true;}
  if(b.key==='bucket'||b.key==='bucket_w'||b.key==='bucket_l')return useBucket(id);
  if(b.key==='rod')return useRod();if(b.key==='net')return useNet();
  if(b.armor){equipArmor(id);updHotbar();return true;}
  return false;}
// ---------- snowfall ----------
const SNOWN=700,snowPos=new Float32Array(SNOWN*3),snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const snowPts=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xffffff,size:.13,transparent:true,opacity:.92,depthWrite:false}));snowPts.frustumCulled=false;snowPts.visible=false;scene.add(snowPts);
function updSnow(dt){const p=G.p;G.snowChk=(G.snowChk||0)-dt;if(G.snowChk<=0){G.snowChk=.5;const x=Math.floor(p.x),z=Math.floor(p.z);G.snowing=G.zone==='Overworld'&&p.y>SEA-8&&snowyChunk(x>>4,z>>4)&&(coldAt(x,z)||surfH(x,z)>SEA+44);}
  snowPts.visible=!!G.snowing;if(!G.snowing)return;const ey=p.y+1.6,t=performance.now()/1000;
  for(let i=0;i<SNOWN;i++){const j=i*3;if(snowPos[j+1]===0||snowPos[j+1]<ey-6||Math.abs(snowPos[j]-p.x)>16||Math.abs(snowPos[j+2]-p.z)>16){snowPos[j]=p.x+(Math.random()-.5)*32;snowPos[j+1]=snowPos[j+1]===0?ey-6+Math.random()*16:ey+9+Math.random()*2;snowPos[j+2]=p.z+(Math.random()-.5)*32;}
    snowPos[j]+=Math.sin(t*.8+i)*dt*.4;snowPos[j+1]-=(1.6+(i%5)*.25)*dt;snowPos[j+2]+=Math.cos(t*.7+i*1.3)*dt*.4;}snowGeo.attributes.position.needsUpdate=true;}
// ---------- first-person arm & held item ----------
scene.add(camera);
const vm=new THREE.Group();vm.position.set(.36,-.34,-.6);vm.scale.setScalar(.7);camera.add(vm);
const vmArmMat=new THREE.MeshLambertMaterial({color:0xe0b090,depthTest:false});const vmArm=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.5),vmArmMat);vmArm.position.set(0,0,.12);vmArm.renderOrder=30;vm.add(vmArm);
const vmCuffMat=new THREE.MeshLambertMaterial({color:0x888888,depthTest:false});const vmCuff=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.12),vmCuffMat);vmCuff.position.set(0,0,-.06);vmCuff.renderOrder=31;vm.add(vmCuff);
const vmItemMat=new THREE.MeshBasicMaterial({transparent:false,alphaTest:.5,depthTest:false,side:THREE.DoubleSide});const vmItem=new THREE.Mesh(new THREE.PlaneGeometry(.36,.36),vmItemMat);vmItem.position.set(-.06,.2,-.2);vmItem.rotation.set(0,.45,.15);vmItem.renderOrder=32;vm.add(vmItem);
let vmKey='';const itemTex={};
function itemTexture(id){if(itemTex[id])return itemTex[id];const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const b=B[id];
  if(b.item){const t=b.tx[0];g.drawImage(atlas,(t%ATW)*TS,((t/ATW)|0)*TS,16,16,0,0,48,48);}else{const im=new Image();im.onload=()=>{g.drawImage(im,0,0);tx.needsUpdate=true;};im.src=blockIcon(id);}
  const tx=new THREE.CanvasTexture(c);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;return itemTex[id]=tx;}
function updViewModel(dt){const id=heldId();const ch=(G.armor||{}).chest;const key=id+'|'+ch;vm.visible=G.mode==='play'&&!G.dead;
  if(key!==vmKey){vmKey=key;const am=ch&&B[ch]?ARMOR_MATS.find(m=>m[0]===B[ch].armor.mat):null;vmArmMat.color.setHex(am?am[4]:0xe0b090);vmCuffMat.color.setHex(am?new THREE.Color(am[4]).multiplyScalar(.7).getHex():0x4a6fb0);
    if(id&&invCount(id)>0){vmItemMat.map=itemTexture(id);vmItemMat.needsUpdate=true;vmItem.visible=true;}else vmItem.visible=false;}
  if(id&&!vmItem.visible&&invCount(id)>0)vmKey='';
  G.swingT=Math.max(0,(G.swingT||0)-dt);const s=G.swingT>0?Math.sin(G.swingT/.25*Math.PI):0;vm.rotation.set(.15-s*.9,.1+s*.3,0);vm.position.set(.36,-.34-s*.05,-.6+s*.1);}
// ---------- main tick ----------
function updateLife(dt){updateAnimals(dt);updateFish(dt);updFlow(dt);updArrows(dt);updRod(dt);updParts(dt);updSnow(dt);updHunger(dt);}
function lifeClear(){for(const a of (G.animals||[]).slice())removeAnimal(a);G.animals=[];G.schools=[];fishBody.count=fishTail.count=0;for(const a of (G.arrows||[]))scene.remove(a.m);G.arrows=[];G.flowQ=[];G.lavaFlow=new Set();G.rod=null;bobber.visible=false;for(const s of parts)scene.remove(s);parts.length=0;}
G.animals=[];G.schools=[];G.arrows=[];G.flowQ=[];G.lavaFlow=new Set();G.armor={};G.food=20;
function lifeSave(){return {pets:G.animals.filter(a=>a.pet).map(a=>({t:a.type,n:a.pet.name,sit:a.pet.sit,c:a.pet.collar,x:+a.x.toFixed(2),y:+a.y.toFixed(2),z:+a.z.toFixed(2)})),armor:G.armor,food:G.food,snowOff:[...SNOW_OFF]};}
function lifeLoad(s){G.armor=Object.assign({helm:0,chest:0,legs:0,boots:0},s.armor||{});G.food=typeof s.food==='number'?s.food:20;
  for(const q of (s.pets||[])){if(!ADEF[q.t])continue;const a=spawnAnimal(q.t,q.x,q.y,q.z);tameAnimal(a,q.n,true);a.pet.sit=!!q.sit;if(q.c)a.pet.collar=q.c;a.g.userData.head.remove(a.g.userData.collar);a.g.userData.collar=null;addCollar(a);setTag(a);}}
// legacy (pre-1.3) worlds: keep already-explored land free of the new snow biome
function legacySnow(s){SNOW_OFF.clear();const old=new Set(Object.keys(s.edits||{}));const pts=[s.p,s.spawn,spawnXZ()].filter(Boolean);
  for(const q of pts){const cx=Math.floor(q.x)>>4,cz=Math.floor(q.z)>>4;for(let dz=-11;dz<=11;dz++)for(let dx=-11;dx<=11;dx++)old.add((cx+dx)+','+(cz+dz));}for(const k of old)SNOW_OFF.add(k);return SNOW_OFF.size;}
// ---------- UI: equipment, pets, pet picker, name ----------
function figureCanvas(){const c=document.createElement('canvas');c.width=120;c.height=200;const g=c.getContext('2d');const col=s=>{const id=(G.armor||{})[s];if(!id)return null;const m=ARMOR_MATS.find(m=>m[0]===B[id].armor.mat);return '#'+m[4].toString(16).padStart(6,'0');};
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.35)';g.strokeRect(x+.5,y+.5,w-1,h-1);};
  R(40,6,40,40,'#e0b090');R(48,22,8,6,'#2a3a6a');R(64,22,8,6,'#2a3a6a');R(52,36,16,4,'#a06048');if(col('helm')){R(36,2,48,18,col('helm'));R(36,2,8,34,col('helm'));R(76,2,8,34,col('helm'));}
  R(36,48,48,60,col('chest')||'#4a6fb0');R(16,48,18,56,col('chest')||'#4a6fb0');R(86,48,18,56,col('chest')||'#4a6fb0');R(16,104,18,14,'#e0b090');R(86,104,18,14,'#e0b090');
  R(38,108,21,60,col('legs')||'#3b3b6e');R(61,108,21,60,col('legs')||'#3b3b6e');R(36,168,23,26,col('boots')||'#5a4030');R(61,168,23,26,col('boots')||'#5a4030');
  const w=heldWeapon();const id=heldId();if(id&&invCount(id)>0){const t=B[id].tx[0];g.imageSmoothingEnabled=false;g.drawImage(atlas,(t%ATW)*TS,((t/ATW)|0)*TS,16,16,92,84,34,34);}return c;}
function renderEquip(){const L=$('equipSlots');L.innerHTML='';const fig=figureCanvas();fig.className='fig';L.appendChild(fig);const col=document.createElement('div');col.className='eqcol';L.appendChild(col);
  for(const [s,sn] of ARMOR_SLOTS){const id=(G.armor||{})[s];const r=document.createElement('div');r.className='eqslot'+(id?' full':'');r.dataset.slot=s;r.innerHTML=`<div class="ic" style="background-image:${id?`url(${blockIcon(id)})`:'none'}"></div><div class="cn">${sn}<small>${id?esc(B[id].name)+' (+'+B[id].armor.def+')':'empty'}</small></div>`;
    bindTap(r,()=>{if(id){unequipArmor(s);renderEquip();}});col.appendChild(r);}
  const hid=heldId(),hb=B[hid];const r=document.createElement('div');r.className='eqslot full';r.dataset.slot='hand';const w=hb&&hb.weapon;r.innerHTML=`<div class="ic" style="background-image:${hid?`url(${blockIcon(hid)})`:'none'}"></div><div class="cn">Main hand<small>${hid?esc(hb.name)+(w?' ('+w.dmg+' damage)':''):'empty'}</small></div>`;col.appendChild(r);
  const pts=armorPoints();$('equipInfo').innerHTML=`Armor <b>${pts}</b> &middot; blocks <b>${Math.round(armorReduction()*100)}%</b> of damage &middot; attack <b>${attackInfo().dmg}</b>`;
  const own=$('equipOwn');own.innerHTML='';const list=ITEM_IDS.filter(id=>(B[id].armor||B[id].weapon)&&invCount(id)>0);
  if(!list.length)own.innerHTML='<p class="small">No gear yet. Buy swords, bows and armor in the Shop.</p>';
  for(const id of list){const b=B[id],c=invCount(id);const e=document.createElement('button');e.className='ib';e.dataset.id=id;e.style.backgroundImage=`url(${blockIcon(id)})`;e.innerHTML=`${esc(b.name)}<b>${b.armor?'+'+b.armor.def:b.weapon.dmg+' dmg'}${c===Infinity?'':' x'+c}</b>`;
    bindTap(e,()=>{if(b.armor)equipArmor(id);else{const j=G.hot.indexOf(id);if(j>=0)G.sel=j;else G.hot[G.sel]=id;toast(b.name+' in hand');}updHotbar();renderEquip();});own.appendChild(e);}}
function renderPets(){const L=$('petList');L.innerHTML='';const pets=G.animals.filter(a=>a.pet);if(!pets.length){L.innerHTML='<p class="small">No pets yet. Feed an animal its favorite food a few times: dogs and wolves love meat or bones, cats love fish, cows, sheep, horses and chickens love wheat, pigs love wheat or melons, polar bears love fish, foxes love chicken or fish. Hearts fill up and it becomes your pet.</p>';return;}
  for(const a of pets){const r=document.createElement('div');r.className='chrow';const d=Math.round(Math.hypot(a.x-G.p.x,a.z-G.p.z));r.innerHTML=`<div class="cn"><input class="petname" maxlength="16" value="${esc(a.pet.name)}"><small>${a.D.name} &middot; ${d}m away &middot; ${a.pet.sit?'sitting':'following'}</small></div><button class="btn sm" data-a="sit">${a.pet.sit?'Follow':'Sit'}</button><button class="btn sm gold" data-a="call">Call</button>`;
    const inp=r.querySelector('input');inp.addEventListener('change',()=>{renamePet(a,inp.value);});inp.addEventListener('pointerdown',e=>e.stopPropagation());
    r.querySelectorAll('button').forEach(bt=>bindTap(bt,()=>{if(bt.dataset.a==='sit')petSit(a);else{petSit(a,false);petTeleport(a);toast(a.pet.name+' is here');}renderPets();}));L.appendChild(r);}}
function renderPetPick(){const L=$('petPick');L.innerHTML='';for(const t of ATYPES){const b=document.createElement('button');b.className='btn';b.dataset.t=t;b.textContent=ADEF[t].name;bindTap(b,()=>{closeAll();if(G.mode==='play')spawnPet(t);});L.appendChild(b);}}
let nameTarget=null;function openPetName(a){nameTarget=a;openScreen('petname');$('petNameIn').value=a.pet.name;$('petNameMsg').textContent='Your new '+a.D.name+' follows you now. Tap it to make it sit or follow. Give it a name:';}
bindTap($('petNameOk'),()=>{if(nameTarget)renamePet(nameTarget,$('petNameIn').value);closeTop();});
bindTap($('gearBtn'),()=>{if(!stack.length&&G.mode==='play')openScreen('equip');});bindTap($('gearBtnP'),()=>openScreen('equip'));bindTap($('petsBtnP'),()=>openScreen('pets'));
holdBtn('eatBtn',()=>{const id=heldId();if(B[id]&&B[id].food)eatFood(id);},()=>{});
// cheats
function allGear(){for(const id of ITEM_IDS){const b=B[id];if(b.weapon||b.armor)addInv(id,1);}addInv(BN.arrow,64);for(const k of ['bucket','bucket_w','bucket_l','rod','net'])addInv(BN[k],1);
  for(const [s] of ARMOR_SLOTS){const id=BN[s+'_ember'];if(!infSupplies())G.inv[id]--;const old=G.armor[s];if(old&&old!==id&&!infSupplies())addInv(old,1);G.armor[s]=id;}
  const j=G.hot.indexOf(BN.sword_ember);if(j<0)G.hot[G.sel]=BN.sword_ember;else G.sel=j;vmKey='';updHotbar();toast('All Gear: every weapon and armor, Emberite equipped');}
function fullFood(){G.hp=20;G.food=20;for(const [k] of FOODS)addInv(BN[k+'_c'],16);addInv(BN.wheat,16);addInv(BN.bone,8);updHotbar();toast('Full Food: health and hunger full, +16 of each cooked food');}
function tpSnow(){const s=nearestSnow(G.p.x,G.p.z);if(!s){toast('No snow biome found');return null;}ensureArea(s.x,s.z);const t=findSurface(s.x,s.z);G.p.x=t.x;G.p.z=t.z;G.p.y=openAbove(t.x,t.y,t.z);G.p.vy=0;G.p.fallY=G.p.y;CH.fly=false;toast('Welcome to the snowlands');return s;}
Object.assign(window.__bc,{ADEF,ATYPES,spawnAnimal,spawnPet,tameAnimal,feedAnimal,interactAnimal,animalLikes,isFeedItem,canAttackAnimal,hitAnimal,killAnimal,petSit,petTeleport,renamePet,animalUnderCrosshair,wildCount,trySpawnHerd,fishCount,spawnSchool,fishUnderCrosshair,catchFishHand,useNet,useRod,
  eatFood,cookFood,openCook,useBucket,placeLiquid,useItem,shootArrow,dmgMob,attackInfo,heldWeapon,armorPoints,armorReduction,equipArmor,unequipArmor,allGear,fullFood,tpSnow,nearestSnow,coldAt,SNOW_OFF,lifeSave,hurt,surfH,raycastLiq,killMob,ensureArea,cityAt,openAbove,hitNPC,mobUnderCrosshair,ITEM_IDS,WEAPONS,ARMOR_MATS,ARMOR_SLOTS,renderShop,openPetName});
// ===== v1.4: feeding fixes, FEED button, tame cheats, character select, Isla's ice bolts =====
const CHARS={
  stevo:{name:'Chief Stevo',desc:'The town chief. Classic teal shirt and gold crown.',skin:'#dba27a',hair:'#5a3a1e',shirt:'#18a7a0',pants:'#2b4fa0',shoes:'#3b2614',crown:'#f2c230',beard:1},
  lexi:{name:'Queen Lexi',desc:'Orange ponytail, green tunic, gold crown.',skin:'#f0c49a',hair:'#e0702a',shirt:'#3d9a4a',pants:'#6b4428',shoes:'#3b2614',crown:'#f2c230',pony:1},
  isla:{name:'Queen Isla',desc:'Snow queen: teal bob, gold star tiara, ice-blue gown and cape. Empty hand throws ice bolts!',skin:'#f2d2b8',hair:'#2fb5b0',shirt:'#8fd8f4',pants:'#8fd8f4',shoes:'#cfefff',star:'#ffd23a',cape:'#4aa8e0',gown:1,bob:1},
  rosie:{name:'Princess Rosie',desc:'Brown curly puffs, pompom beanie and a buttoned coat.',skin:'#e8b48e',hair:'#6a3c1c',shirt:'#d8433a',pants:'#3a3550',shoes:'#4a2a18',beanie:'#f4f0e8',pom:'#e05a8a',buttons:'#ffd84a',puffs:1},
  hank:{name:'Thunder Hank',desc:'Blond horseshoe mustache, yellow & red tank and bandana. Wrestler: body-slam punch!',skin:'#f0b890',hair:'#f2d04a',shirt:'#f6d21a',pants:'#d82020',shoes:'#f6d21a',bandana:'#d82020',stache:'#f2d04a',tank:1,wr:1},
  tex:{name:'Tex Ironhide',desc:'Cowboy brawler: brown hat, vest and boots. Wrestler: body-slam punch!',skin:'#d8a07a',hair:'#3a2414',shirt:'#e8e0d0',pants:'#2a3a6a',shoes:'#5a3418',hat:'#7a5028',vest:'#4a2c14',stubble:'#3a2414',wr:1},
  rel:{name:'El Rel\u00e1mpago',desc:'Masked luchador: green & gold lightning mask and cape. Wrestler: body-slam punch!',skin:'#c88a5e',hair:'#1a9a4a',shirt:'#c88a5e',pants:'#1a9a4a',shoes:'#f2c230',mask:'#1a9a4a',maskTrim:'#f2c230',cape:'#f2c230',wr:1},
  viper:{name:'Viper Kane',desc:'Bald bruiser with snake tattoos and black trunks. Wrestler: body-slam punch!',skin:'#c8946a',shirt:'#c8946a',pants:'#151515',shoes:'#151515',bald:1,tattoo:'#1f6a2a',goatee:'#2a1a10',wr:1},
  macho:{name:'Macho Max',desc:'Shades, flashy fringe jacket and cowboy hat. Wrestler: body-slam punch!',skin:'#d8a07a',hair:'#2a1a10',shirt:'#c040d0',pants:'#f2c230',shoes:'#ffffff',shades:'#101010',fringe:'#ffe060',hat:'#ffffff',stubble:'#2a1a10',wr:1}};
const curChar=()=>CHARS[ST.skin]?ST.skin:'stevo';
function charCanvas(k){const C=CHARS[k],c=document.createElement('canvas');c.width=48;c.height=80;const g=c.getContext('2d');const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  if(C.cape)R(10,22,28,40,C.cape);
  R(16,58,7,18,C.pants);R(25,58,7,18,C.pants);R(15,74,8,5,C.shoes);R(25,74,8,5,C.shoes);
  R(14,30,20,28,C.shirt);R(8,30,6,22,C.shirt);R(34,30,6,22,C.shirt);R(8,52,6,4,C.skin);R(34,52,6,4,C.skin);
  if(C.gown){R(12,46,24,26,C.shirt);R(14,48,20,2,'#ffffff');R(12,68,24,2,'#e8fbff');}
  if(C.buttons){R(23,32,2,24,'#8a2520');for(const y of [35,42,49])R(22,y,4,3,C.buttons);}
  R(14,8,20,20,C.skin);R(18,16,3,3,'#202030');R(27,16,3,3,'#202030');R(21,23,6,2,'#b04040');
  R(14,6,20,5,C.hair);
  if(C.bob){R(11,6,4,20,C.hair);R(33,6,4,20,C.hair);R(14,6,20,7,C.hair);}
  if(C.pony){R(33,10,5,16,C.hair);}
  if(C.beard){R(14,21,20,7,C.hair);R(21,23,6,2,'#b04040');}
  if(C.puffs){for(const [x,y] of [[8,10],[36,10],[8,18],[36,18]]){g.fillStyle=C.hair;g.beginPath();g.arc(x+2,y+2,5,0,7);g.fill();}}
  if(C.beanie){R(13,3,22,7,C.beanie);R(13,8,22,2,C.pom);g.fillStyle=C.pom;g.beginPath();g.arc(24,2,4,0,7);g.fill();}
  if(C.crown){R(14,2,20,5,C.crown);R(14,0,3,3,C.crown);R(22,0,4,3,C.crown);R(31,0,3,3,C.crown);R(23,3,2,2,'#d02030');}
  if(C.star){R(16,4,16,2,C.star);g.fillStyle=C.star;g.beginPath();for(let i=0;i<10;i++){const r=i%2?2:5,a=-Math.PI/2+i*Math.PI/5;g.lineTo(24+Math.cos(a)*r,3+Math.sin(a)*r);}g.fill();}
  if(C.tank){R(14,30,20,4,C.skin);R(8,30,6,22,C.skin);R(34,30,6,22,C.skin);R(18,30,12,4,C.shirt);}
  if(C.vest){R(14,30,6,28,C.vest);R(28,30,6,28,C.vest);}
  if(C.fringe){for(let y=34;y<56;y+=3){R(6,y,2,2,C.fringe);R(40,y,2,2,C.fringe);}R(14,56,20,2,C.fringe);}
  if(C.tattoo){g.strokeStyle=C.tattoo;g.lineWidth=2;g.beginPath();g.moveTo(10,32);for(let y=32;y<52;y+=4)g.lineTo(y%8?13:9,y);g.stroke();g.beginPath();g.moveTo(37,32);for(let y=32;y<52;y+=4)g.lineTo(y%8?35:39,y);g.stroke();}
  if(C.bald){R(14,8,20,3,C.skin);R(14,6,20,3,C.skin);}
  if(C.goatee)R(21,24,6,4,C.goatee);
  if(C.stubble)R(15,22,18,3,C.stubble);
  if(C.stache){R(19,21,10,2,C.stache);R(18,21,2,7,C.stache);R(28,21,2,7,C.stache);}
  if(C.bandana){R(14,6,20,5,C.bandana);R(33,8,4,3,C.bandana);}
  if(C.mask){R(14,8,20,14,C.mask);R(14,8,20,2,C.maskTrim);R(17,15,5,5,'#fff');R(26,15,5,5,'#fff');R(18,16,3,3,'#202030');R(27,16,3,3,'#202030');g.fillStyle=C.maskTrim;g.beginPath();g.moveTo(24,9);g.lineTo(21,14);g.lineTo(25,13);g.lineTo(22,19);g.lineTo(28,12);g.lineTo(24,13);g.fill();}
  if(C.shades){R(16,15,16,4,C.shades);}
  if(C.hat){R(10,6,28,3,C.hat);R(15,0,18,7,C.hat);}
  return c;}
function setChar(k){if(!CHARS[k])return;ST.skin=k;saveSettings();vmKey='';document.querySelectorAll('.charNm').forEach(e=>e.textContent=CHARS[k].name);toast('You are now '+CHARS[k].name);}
function renderChar(){const L=$('charList');L.innerHTML='';const cur=curChar();
  for(const k in CHARS){const d=document.createElement('div');d.className='charCard'+(k===cur?' sel':'');d.dataset.k=k;d.appendChild(charCanvas(k));d.insertAdjacentHTML('beforeend',`${esc(CHARS[k].name)}<small>${esc(CHARS[k].desc)}</small>`);
    bindTap(d,()=>{setChar(k);renderChar();});L.appendChild(d);}
  $('charInfo').textContent='Your choice is saved on this device and used in every world.';}
bindTap($('charBtnNew'),()=>openScreen('char'));bindTap($('charBtnPause'),()=>openScreen('char'));
document.querySelectorAll('.charNm').forEach(e=>e.textContent=CHARS[curChar()].name);
// first-person arm uses the character's colours (armor still overrides)
const _updVM=updViewModel;updViewModel=function(dt){const k=curChar()+'|'+heldId()+'|'+(G.armor||{}).chest;const changed=k!==G._vmCk;_updVM(dt);
  if(changed||vmKey===''){G._vmCk=k;const C=CHARS[curChar()],ch=(G.armor||{}).chest;if(!(ch&&B[ch])){vmArmMat.color.set(C.skin);vmCuffMat.color.set(C.cape||C.shirt);}}};
// ---- hotbar: make food obvious ----
const _updHot=updHotbar;updHotbar=function(){_updHot();const hb=$('hotbar');for(let i=0;i<hb.children.length;i++){const id=G.hot[i];hb.children[i].classList.toggle('food',isFeedItem(id));}
  const id=heldId(),b=B[id],l=$('heldLbl');if(!l)return;const t=!b||!(invCount(id)>0)?'Empty hand':b.name+(isFeedItem(id)?' \u2014 tap an animal to FEED':b.weapon?' \u2014 weapon':'');if(l._t!==t){l._t=t;l.textContent=t;l.className=isFeedItem(id)?'food':'';}};
// ---- FEED context button ----
function feedTarget(){const id=heldId();if(!isFeedItem(id))return null;const a=animalUnderCrosshair(4.5);if(a&&animalLikes(a,id))return a;
  const d=lookDir();let best=null,bd=3.5;for(const an of G.animals){const dx=an.x-G.p.x,dz=an.z-G.p.z,dist=Math.hypot(dx,dz);if(dist>=bd||Math.abs(an.y-G.p.y)>2.5||!animalLikes(an,id))continue;if(dist>1.2&&(dx*d[0]+dz*d[2])/dist<.3)continue;bd=dist;best=an;}return best;}
let feedT=0;function updFeedBtn(dt){feedT-=dt;if(feedT>0)return;feedT=.15;const t=G.mode==='play'&&!G.dead?feedTarget():null;G.feedTgt=t;const v=t?'flex':'none';const e=$('feedBtn');if(e.style.display!==v)e.style.display=v;}
holdBtn('feedBtn',()=>{const a=G.feedTgt||feedTarget();if(a){a.yaw=Math.atan2(G.p.x-a.x,G.p.z-a.z)+Math.PI;feedAnimal(a);feedT=0;}},()=>{});
// ---- wrestlers: empty-hand body-slam punch (mobs/hostiles only; animals still need a weapon or empty hand as before) ----
const _atkInfo=attackInfo;attackInfo=function(){const a=_atkInfo();if(a.kind==='hand'&&CHARS[curChar()].wr)return Object.assign({},a,{dmg:Math.max(a.dmg,4),kb:14,slam:1});return a;};
const _dmgMob=dmgMob;dmgMob=function(m,dmg,kb,dir,src){_dmgMob(m,dmg,kb,dir,src);if(!src&&CHARS[curChar()].wr&&!heldWeapon()&&G.mobs.includes(m)){m.vy=8;G.slams=(G.slams||0)+1;}};
// ---- cheats ----
function wildNear(R){return G.animals.filter(a=>!a.pet&&Math.hypot(a.x-G.p.x,a.z-G.p.z)<=R).sort((a,b)=>Math.hypot(a.x-G.p.x,a.z-G.p.z)-Math.hypot(b.x-G.p.x,b.z-G.p.z));}
function tameNearest(){const a=wildNear(24)[0];if(!a){toast('No wild animals nearby');return null;}return tameAnimal(a);}
function tameAllNearby(){const l=wildNear(24);for(const a of l)tameAnimal(a,null,true);if(l.length)heartBurst(G.p.x,G.p.y+1.6,G.p.z,8);toast(l.length?'Tamed '+l.length+' animal'+(l.length>1?'s':'')+'!':'No wild animals nearby');return l.length;}
// ---- Queen Isla: ice bolts from an empty hand ----
const boltMat=new THREE.MeshBasicMaterial({color:0x9ff0ff});const boltGeo=new THREE.BoxGeometry(.18,.18,.5);const bolts=[];
function iceBoltReady(){const id=heldId();return curChar()==='isla'&&(!id||!(invCount(id)>0));}
function throwIceBolt(){if((G.boltCool||0)>0)return true;G.boltCool=.45;const d=lookDir();const m=new THREE.Mesh(boltGeo,boltMat);const b={x:G.p.x+d[0]*.6,y:G.p.y+1.5+d[1]*.6,z:G.p.z+d[2]*.6,vx:d[0]*24,vy:d[1]*24,vz:d[2]*24,t:2,m};m.position.set(b.x,b.y,b.z);scene.add(m);bolts.push(b);G.bolts=(G.bolts||0)+1;G.swingT=.3;sfx('door');return true;}
function updBolts(dt){G.boltCool=Math.max(0,(G.boltCool||0)-dt);for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t-=dt;let done=b.t<=0;
  for(let s=0;s<3&&!done;s++){const h=dt/3;b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h;const dir=[b.vx/24,0,b.vz/24];if(isSolidAt(Math.floor(b.x),Math.floor(b.y),Math.floor(b.z))){done=true;break;}
    for(const m of G.mobs)if(Math.abs(m.x-b.x)<.55&&Math.abs(m.z-b.z)<.55&&b.y>m.y&&b.y<m.y+m.h){dmgMob(m,7,4,dir);G.boltHits=(G.boltHits||0)+1;done=true;break;}
    if(!done)for(const n of (G.npcs||[]))if((n.hostile||n.role==='guard'||n.role==='demon')&&Math.abs(n.x-b.x)<.5&&Math.abs(n.z-b.z)<.5&&b.y>n.y&&b.y<n.y+n.h){hitNPC(n,7,dir);done=true;break;}}
  if(done){if(b.t>0)puff(b.x,b.y,b.z,4);scene.remove(b.m);bolts.splice(i,1);continue;}b.m.position.set(b.x,b.y,b.z);b.m.lookAt(b.x+b.vx,b.y+b.vy,b.z+b.vz);}}
const _tap=tapAction;tapAction=function(){if(G.mode==='play'&&iceBoltReady()){const m=mobUnderCrosshair();const a=animalUnderCrosshair();const n=npcUnderCrosshair();
    if(!a&&!(n&&!n.hostile)&&(m||!raycast(4))){throwIceBolt();return;}}_tap();};
const _updLife=updateLife;updateLife=function(dt){_updLife(dt);updFeedBtn(dt);updBolts(dt);};
Object.assign(window.__bc,{CHARS,curChar,setChar,feedTarget,tameNearest,tameAllNearby,throwIceBolt,iceBoltReady,bolts,interactAnimal,tapAction:()=>tapAction(),updateMining:dt=>updateMining(dt),T,animalLikes,isFeedItem,canAttackAnimal});
// ===== v1.6: Sims-style BUILD MODE (free building, overhead camera) =====
const BM={on:false,tool:'pan',mat:BN.planks,rmat:BN.roof,h:3,roof:'gable',win:1,tx:0,ty:0,tz:0,yaw:0,pitch:.95,dist:22,undo:[],redo:[],ptrs:new Map(),g:null,drag:null,tw:null,cells:[],last:null};
const BM_MATS=['planks','dplanks','bplanks','log','spruce','cobble','stone','stonebrick','brick','sandstone','marble','clay','tiles','roof','glass','mossy','snowblock','ice','obsidian','demonbrick','iron_block','gold_block','hay','bookshelf','wool0','wool4'].filter(k=>BN[k]!==undefined).map(k=>BN[k]);
const BM_TOOLS=[['pan','\u270B','PAN'],['wall','\u2590','WALL'],['floor','\u25A6','FLOOR'],['room','\u2302','ROOM'],['roof','\u25B2','ROOF'],['door','\u25AF','DOOR'],['window','\u25A3','WINDOW'],['stairs','\u25E2','STAIRS'],['erase','\u2716','ERASE']];
const NATCAT={Nature:1,Ores:1,Hell:1};
// ---- ghost preview ----
const GHOSTN=6000;const ghostMat=new THREE.MeshBasicMaterial({color:0x66ff66,transparent:true,opacity:.55,depthWrite:false});
const ghost=new THREE.InstancedMesh(new THREE.BoxGeometry(1.03,1.03,1.03),ghostMat,GHOSTN);ghost.count=0;ghost.frustumCulled=false;ghost.renderOrder=5;scene.add(ghost);
const ghostEdge=new THREE.InstancedMesh(new THREE.BoxGeometry(1.06,1.06,1.06),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.25}),GHOSTN);ghostEdge.count=0;ghostEdge.frustumCulled=false;scene.add(ghostEdge);
const _gm=new THREE.Matrix4();
function showGhost(cells,erase){const n=Math.min(GHOSTN,cells.length);for(let i=0;i<n;i++){const c=cells[i];_gm.makeTranslation(c[0]+.5,c[1]+.5,c[2]+.5);ghost.setMatrixAt(i,_gm);ghostEdge.setMatrixAt(i,_gm);}
  ghost.count=ghostEdge.count=n;ghost.instanceMatrix.needsUpdate=ghostEdge.instanceMatrix.needsUpdate=true;
  const id=cells.length?cells[0][3]:BM.mat;ghostMat.color.setHex(erase?0xff4040:(id>0&&B[id]&&B[id].tx)?avgColor(B[id].tx[0]):0x66ff66);ghostMat.color.lerp(new THREE.Color(erase?0xff2020:0x60ff60),.2);}
function hideGhost(){ghost.count=ghostEdge.count=0;BM.cells=[];setCount('');}
// ---- avatar (your character standing still while you build) ----
function makeAvatar(){if(BM.g){scene.remove(BM.g);BM.g=null;}const C=CHARS[curChar()];
  const g=makeNPC({skin:C.skin,hair:C.bald?null:(C.hair||C.skin),shirt:C.shirt,pants:C.pants,shoes:C.shoes,crown:C.crown||C.star,beard:C.beard?C.hair:null,ponytail:C.pony,cape:C.cape,hat:C.hat||C.beanie,skirt:C.gown?C.shirt:null});
  BM.g=g;g.visible=false;return g;}
// ---- rays & picking ----
function scrRay(cx,cy){const o=camera.position.clone();const v=new THREE.Vector3(cx/innerWidth*2-1,-(cy/innerHeight)*2+1,.5).unproject(camera);return {o,d:v.sub(o).normalize()};}
function ddaHit(o,d,maxD){let x=Math.floor(o.x),y=Math.floor(o.y),z=Math.floor(o.z);const sx=d.x>0?1:-1,sy=d.y>0?1:-1,sz=d.z>0?1:-1;const tdx=Math.abs(1/d.x),tdy=Math.abs(1/d.y),tdz=Math.abs(1/d.z);
  let tx=(d.x>0?x+1-o.x:o.x-x)*tdx,ty=(d.y>0?y+1-o.y:o.y-y)*tdy,tz=(d.z>0?z+1-o.z:o.z-z)*tdz,n=[0,1,0],t=0;
  while(t<=maxD){if(y>=0&&y<H){const b=getB(x,y,z);if(b>0&&!LIQ[b]&&(SOLID[b]||B[b].door))return {x,y,z,n,b,t};}else if(y<0)return null;
    if(tx<ty&&tx<tz){x+=sx;t=tx;tx+=tdx;n=[-sx,0,0];}else if(ty<tz){y+=sy;t=ty;ty+=tdy;n=[0,-sy,0];}else{z+=sz;t=tz;tz+=tdz;n=[0,0,-sz];}}return null;}
function pickHit(cx,cy){const r=scrRay(cx,cy);return ddaHit(r.o,r.d,320);}
// start cell: empty cell on top of what you touched, dropped down to its support (ground height under the drag start)
function pickStart(cx,cy){const h=pickHit(cx,cy);if(!h)return null;let x=h.x+h.n[0],y=h.y+h.n[1],z=h.z+h.n[2];let k=0;while(k<40&&y>1&&!isSolidAt(x,y-1,z)){y--;k++;}return {x,y,z,hit:h,cx,cy};}
function planeCell(cx,cy,Y){const r=scrRay(cx,cy);if(r.d.y>-1e-4)return null;const t=(Y-r.o.y)/r.d.y;return {x:Math.floor(r.o.x+r.d.x*t),z:Math.floor(r.o.z+r.d.z*t)};}
// ---- shapes: each returns [[x,y,z,id],...] ----
function snapLine(s,e,diag){let dx=e.x-s.x,dz=e.z-s.z;const ax=Math.abs(dx),az=Math.abs(dz);
  if(ax>=2*az||!diag&&ax>=az)dz=0;else if(az>=2*ax||!diag)dx=0;else{const m=Math.max(ax,az);dx=Math.sign(dx)*m;dz=Math.sign(dz)*m;}return {dx,dz};}
function lineXZ(s,e,diag){const {dx,dz}=snapLine(s,e,diag);const n=Math.max(Math.abs(dx),Math.abs(dz));const out=[];for(let i=0;i<=n;i++)out.push([s.x+(n?Math.round(dx*i/n):0),s.z+(n?Math.round(dz*i/n):0)]);return out;}
function rectOf(s,e){return [Math.min(s.x,e.x),Math.min(s.z,e.z),Math.max(s.x,e.x),Math.max(s.z,e.z)];}
function wallCells(s,e,h,id){const c=[];for(const [x,z] of lineXZ(s,e,true))for(let k=0;k<h;k++)c.push([x,s.y+k,z,id]);return c;}
function floorCells(r,y,id){const c=[];for(let z=r[1];z<=r[3];z++)for(let x=r[0];x<=r[2];x++)c.push([x,y,z,id]);return c;}
function roomCells(r,y,h,id){const c=floorCells(r,y-1,id);for(let z=r[1];z<=r[3];z++)for(let x=r[0];x<=r[2];x++){const edge=x===r[0]||x===r[2]||z===r[1]||z===r[3];
  for(let k=0;k<h;k++){if(edge)c.push([x,y+k,z,id]);else if(getB(x,y+k,z)>0)c.push([x,y+k,z,0]);}}return c;}
function stairCells(s,e,id){const c=[];const L=lineXZ(s,e,false);L.forEach(([x,z],i)=>{for(let k=0;k<=i;k++)c.push([x,s.y+k,z,id]);for(let k=i+1;k<=i+2;k++)if(getB(x,s.y+k,z)>0)c.push([x,s.y+k,z,0]);});return c;}
function builtB(b){return b>0&&!LIQ[b]&&B[b]&&!NATCAT[B[b].cat]&&!B[b].unbreak&&B[b].key!=='leaves'&&B[b].key!=='pineleaves';}
const genCache=new Map();function genAt(x,y,z){const k=ck(x>>4,z>>4);let d=genCache.get(k);if(!d){d=genChunk(x>>4,z>>4);genCache.set(k,d);if(genCache.size>24)genCache.delete(genCache.keys().next().value);}return d[(y*CS+(z&15))*CS+(x&15)];}
function eraseCells(r,yc){const c=[];for(let z=r[1];z<=r[3];z++)for(let x=r[0];x<=r[2];x++)for(let y=Math.max(1,yc-8);y<=Math.min(H-1,yc+12);y++){const b=getB(x,y,z);if(!builtB(b))continue;
  const g=genAt(x,y,z);c.push([x,y,z,g>0&&B[g]&&NATCAT[B[g].cat]&&!B[g].unbreak?g:0]);}return c;}
function topBuilt(x,z,y0){for(let y=Math.min(H-1,y0+14);y>=Math.max(1,y0-8);y--){const b=getB(x,y,z);if(b>0&&SOLID[b]&&!NATCAT[B[b].cat])return y;}return -1;}
function roofCells(r,yHint,style,id){let top=-1,gm=0;for(let x=r[0];x<=r[2];x++)for(const z of [r[1],r[3]]){const t=topBuilt(x,z,yHint);if(t>top){top=t;gm=getB(x,t,z);}}
  for(let z=r[1];z<=r[3];z++)for(const x of [r[0],r[2]]){const t=topBuilt(x,z,yHint);if(t>top){top=t;gm=getB(x,t,z);}}
  if(top<0){top=yHint-1;gm=BM.mat;}if(B[gm]&&(B[gm].door||B[gm].key==='glass'))gm=BM.mat;const c=[];
  if(style==='flat'){for(let z=r[1]-1;z<=r[3]+1;z++)for(let x=r[0]-1;x<=r[2]+1;x++)c.push([x,top+1,z,id]);return {c,top};}
  const alongX=(r[2]-r[0])>=(r[3]-r[1]);// ridge runs along the longer side
  const [a0,a1,b0,b1]=alongX?[r[0],r[2],r[1],r[3]]:[r[1],r[3],r[0],r[2]];const P=(a,y,b,v)=>c.push(alongX?[a,y,b,v]:[b,y,a,v]);
  for(let b=b0-1;b<=b1+1;b++){const k=Math.max(0,Math.min(b-b0,b1-b));for(let a=a0-1;a<=a1+1;a++)P(a,top+1+k,b,id);
    if(k>0)for(const a of [a0,a1])for(let j=1;j<=k;j++)P(a,top+j,b,gm);}
  return {c,top};}
function findRoom(h){if(!h)return null;const offs=[[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1],[2,0],[-2,0],[0,2],[0,-2]];
  for(const [ox,oz] of offs)for(let y=h.y+1;y>=h.y-6;y--){const x=h.x+ox,z=h.z+oz;if(isSolidAt(x,y,z))continue;
    const scan=(dx,dz)=>{for(let i=1;i<=32;i++){const b=getB(x+dx*i,y,z+dz*i);if(b<0)return 0;if(SOLID[b]||(b>0&&B[b].door))return builtB(b)?i:0;}return 0;};const a=scan(-1,0),b=scan(1,0),c=scan(0,-1),d=scan(0,1);
    if(a&&b&&c&&d&&isSolidAt(x,y-1,z))return {r:[x-a,z-c,x+b,z+d],y};}return null;}
function wallDir(x,y,z){const sx=(isSolidAt(x-1,y,z)?1:0)+(isSolidAt(x+1,y,z)?1:0),sz=(isSolidAt(x,y,z-1)?1:0)+(isSolidAt(x,y,z+1)?1:0);
  if(sx===sz){const f=Math.abs(Math.sin(BM.yaw))>Math.abs(Math.cos(BM.yaw));return f?'z':'x';}return sx>sz?'x':'z';}
function doorCells(h){if(!h)return [];let {x,y,z}=h;const b=getB(x,y,z);if(!builtB(b)||!SOLID[b]||B[b].door)return [];const dir=wallDir(x,y,z);
  const free=yy=>dir==='x'?(!isSolidAt(x,yy,z-1)||!isSolidAt(x,yy,z+1)):(!isSolidAt(x-1,yy,z)||!isSolidAt(x+1,yy,z));
  while(y>1&&getB(x,y-1,z)===b&&free(y-1))y--;const id=dir==='x'?BN.doorx:BN.doorz;return [[x,y,z,id],[x,y+1,z,id]];}
function windowCells(h){if(!h)return [];const {x,y,z}=h;const b=getB(x,y,z);if(!builtB(b)||!SOLID[b]||B[b].door||b===BN.glass)return [];const c=[[x,y,z,BN.glass]];
  if(BM.win===2){const dir=wallDir(x,y,z);const [ax,az]=dir==='x'?[1,0]:[0,1];if(getB(x+ax,y,z+az)===b)c.push([x+ax,y,z+az,BN.glass]);else if(getB(x-ax,y,z-az)===b)c.push([x-ax,y,z-az,BN.glass]);}return c;}
// cells the current gesture would change (ghost + commit)
function toolCells(s,cx,cy){const t=BM.tool;if(t==='door'||t==='window'){const h=pickHit(cx,cy);return t==='door'?doorCells(h):windowCells(h);}
  if(!s)return [];let p=planeCell(cx,cy,s.y)||{x:s.x,z:s.z};if(t==='erase'){const h=pickHit(cx,cy);if(h)p={x:h.x,z:h.z};s={x:s.hit.x,y:s.y,z:s.hit.z,hit:s.hit};}const e={x:p.x,z:p.z,y:s.y};
  if(t==='wall'){BM.dims=Math.max(Math.abs(e.x-s.x),Math.abs(e.z-s.z))+1+' long x '+BM.h+' high';return wallCells(s,e,BM.h,BM.mat);}
  const r=rectOf(s,e);BM.dims=(r[2]-r[0]+1)+' x '+(r[3]-r[1]+1);
  if(t==='floor')return floorCells(r,s.y-1,BM.mat);
  if(t==='room')return roomCells(r,s.y,BM.h,BM.mat);
  if(t==='stairs'){BM.dims=lineXZ(s,e,false).length+' steps';return stairCells(s,e,BM.mat);}
  if(t==='erase')return eraseCells(r,s.hit.y);
  if(t==='roof'){let rr=r,yh=s.y;if(r[0]===r[2]&&r[1]===r[3]){const f=findRoom(s.hit);if(!f)return [];rr=f.r;yh=f.y;}BM.dims=(rr[2]-rr[0]+1)+' x '+(rr[3]-rr[1]+1)+' '+BM.roof;return roofCells(rr,yh,BM.roof,BM.rmat).c;}
  return [];}
function effective(cells){const out=[],seen=new Set();for(const c of cells){const k=c[0]+','+c[1]+','+c[2];if(seen.has(k))continue;seen.add(k);const o=getB(c[0],c[1],c[2]);
  if(o<0||o===c[3]||(o>0&&B[o].unbreak)||c[1]<1||c[1]>=H)continue;if(c[3]&&SOLID[c[3]]&&intersectsPlayer(c[0],c[1],c[2]))continue;out.push(c);}return out;}
// ---- apply / undo / redo (free: no inventory cost) ----
function applyCells(cells,label){const list=[];for(const c of effective(cells)){const o=getB(c[0],c[1],c[2]);if(setB(c[0],c[1],c[2],c[3])!==false)list.push([c[0],c[1],c[2],o,c[3]]);}
  if(!list.length){toast('Nothing to change here');return 0;}BM.undo.push({label,list});if(BM.undo.length>60)BM.undo.shift();BM.redo.length=0;
  G.stats.placed+=list.filter(c=>c[4]).length;sfx(list.every(c=>!c[4])?'break':'place');toast(label+': '+list.length+' block'+(list.length>1?'s':''));updBMBtns();return list.length;}
function bmUndo(){const e=BM.undo.pop();if(!e){toast('Nothing to undo');return false;}for(let i=e.list.length-1;i>=0;i--){const c=e.list[i];setB(c[0],c[1],c[2],c[3]);}BM.redo.push(e);sfx('break');toast('Undo '+e.label);updBMBtns();return true;}
function bmRedo(){const e=BM.redo.pop();if(!e){toast('Nothing to redo');return false;}for(const c of e.list)setB(c[0],c[1],c[2],c[4]);BM.undo.push(e);sfx('place');toast('Redo '+e.label);updBMBtns();return true;}
// ---- camera ----
const _bmObj=new THREE.PerspectiveCamera();
function bmPose(){const cp=Math.cos(BM.pitch);_bmObj.position.set(BM.tx+Math.sin(BM.yaw)*cp*BM.dist,BM.ty+Math.sin(BM.pitch)*BM.dist,BM.tz+Math.cos(BM.yaw)*cp*BM.dist);_bmObj.lookAt(BM.tx,BM.ty,BM.tz);return {pos:_bmObj.position.clone(),q:_bmObj.quaternion.clone()};}
function eyePose(){const p=G.p;return {pos:new THREE.Vector3(p.x,p.y+1.62,p.z),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(p.pitch,p.yaw,0,'YXZ'))};}
function clampTarget(){const R=(ST.rd+1)*16,dx=BM.tx-G.p.x,dz=BM.tz-G.p.z,l=Math.hypot(dx,dz);if(l>R){BM.tx=G.p.x+dx/l*R;BM.tz=G.p.z+dz/l*R;}BM.dist=Math.max(6,Math.min(80,BM.dist));}
function panBy(dx,dy){const s=BM.dist/Math.max(300,innerHeight)*1.5;const c=Math.cos(BM.yaw),n=Math.sin(BM.yaw);BM.tx+=-dx*s*c-dy*s*n;BM.tz+=dx*s*n-dy*s*c;clampTarget();}
function groundAt(x,z){const ch=getChunk(Math.floor(x)>>4,Math.floor(z)>>4);return ch?ch.top[(Math.floor(z)&15)*16+(Math.floor(x)&15)]+1:BM.ty;}
function updBuildCam(dt){if(BM.on){const gy=groundAt(BM.tx,BM.tz);BM.ty+=(Math.max(gy,SEA)-BM.ty)*Math.min(1,dt*4);}
  const tw=BM.tw;let to=BM.on?bmPose():eyePose();
  if(tw){tw.t+=dt;const f=Math.min(1,tw.t/tw.dur),e=f*f*(3-2*f);camera.position.copy(tw.pos).lerp(to.pos,e);camera.quaternion.copy(tw.q).slerp(to.q,e);if(f>=1)BM.tw=null;}
  else{camera.position.copy(to.pos);camera.quaternion.copy(to.q);}
  if(BM.g){BM.g.visible=BM.on||!!BM.tw;if(BM.g.visible){BM.g.position.set(G.p.x,G.p.y,G.p.z);BM.g.rotation.y=G.p.yaw;}}}
function startTween(dur){BM.tw={t:0,dur,pos:camera.position.clone(),q:camera.quaternion.clone()};}
// ---- enter / exit ----
function enterBuild(){if(G.mode!=='play'||G.dead||BM.on)return false;resetTouches();BM.on=true;BM.tx=G.p.x;BM.tz=G.p.z;BM.ty=Math.max(G.p.y,groundAt(G.p.x,G.p.z)-1);BM.yaw=G.p.yaw;BM.dist=22;BM.pitch=.95;
  G.p.vx=G.p.vy=G.p.vz=0;makeAvatar();startTween(.6);$('hud').classList.add('building');$('bmLayer').style.display='block';$('buildBtn').innerHTML='&#10004; Done';
  selBox.visible=crackBox.visible=false;updBMBtns();toast('Build Mode: free building. Pick a tool below');return true;}
function exitBuild(instant){if(!BM.on&&!BM.tw)return false;const was=BM.on;BM.on=false;BM.ptrs.clear();BM.drag=null;hideGhost();$('hud').classList.remove('building');$('bmLayer').style.display='none';$('bmMats').style.display='none';$('buildBtn').innerHTML='&#9874; Build';
  if(instant){BM.tw=null;if(BM.g)BM.g.visible=false;}else if(was)startTween(.7);G.p.fallY=G.p.y;lastT=performance.now();resetTouches();return true;}
function toggleBuild(){if(BM.on)exitBuild();else enterBuild();}
// ---- UI ----
function setCount(t){const e=$('bmCount');e.textContent=t;e.style.display=t?'block':'none';}
function updBMBtns(){document.querySelectorAll('#bmBar [data-t]').forEach(b=>b.classList.toggle('sel',b.dataset.t===BM.tool));
  const t=BM.tool,m=t==='roof'?BM.rmat:BM.mat;$('bmMatBtn').style.backgroundImage=`url(${blockIcon(m)})`;$('bmMatNm').textContent=B[m].name;
  const show=(id,v)=>{$(id).style.display=v?'':'none';};show('bmMatW',!['pan','erase','door','window'].includes(t));show('bmHW',t==='wall'||t==='room');show('bmRoofW',t==='roof');show('bmWinW',t==='window');
  $('bmH').textContent=BM.h;$('bmRoofS').textContent=BM.roof==='gable'?'Gabled':'Flat';$('bmWinS').textContent=BM.win===2?'2x1':'1x1';
  $('bmUndo').disabled=!BM.undo.length;$('bmRedo').disabled=!BM.redo.length;
  const hint={pan:'Drag to move the camera \u00b7 pinch to zoom \u00b7 two fingers to rotate',wall:'Drag from start to end to lay a wall',floor:'Drag a rectangle to fill a floor',room:'Drag a rectangle: 4 walls + floor',roof:'Tap inside a room or drag over it',door:'Tap a wall to put in a door',window:'Tap a wall to put in a window',stairs:'Drag in the direction the stairs go up',erase:'Drag over what you built to remove it'}[t];$('bmHint').textContent=hint;}
function setTool(t){BM.tool=t;hideGhost();$('bmMats').style.display='none';updBMBtns();}
function renderMats(){const L=$('bmMats');L.innerHTML='';const cur=BM.tool==='roof'?BM.rmat:BM.mat;for(const id of BM_MATS){const b=document.createElement('button');b.className='bmm'+(id===cur?' sel':'');b.style.backgroundImage=`url(${blockIcon(id)})`;b.title=B[id].name;b.innerHTML=`<span>${esc(B[id].name)}</span>`;b.dataset.id=id;
  bindTap(b,()=>{if(BM.tool==='roof')BM.rmat=id;else BM.mat=id;L.style.display='none';updBMBtns();});L.appendChild(b);}}
(function buildUI(){const hud=$('hud');
  const bb=document.createElement('button');bb.className='hbtn';bb.id='buildBtn';bb.innerHTML='&#9874; Build';$('gearBtn').before(bb);bindTap(bb,()=>{if(!stack.length)toggleBuild();});
  const lay=document.createElement('div');lay.id='bmLayer';$('touch').after(lay);
  const bar=document.createElement('div');bar.id='bmBar';bar.innerHTML=BM_TOOLS.map(([k,i,n])=>`<button data-t="${k}">${i}<small>${n}</small></button>`).join('')+`<button id="bmUndo">&#8630;<small>UNDO</small></button><button id="bmRedo">&#8631;<small>REDO</small></button>`;hud.appendChild(bar);
  const opt=document.createElement('div');opt.id='bmOpt';opt.innerHTML=`<span id="bmMatW"><button id="bmMatBtn"></button><b id="bmMatNm"></b></span><span id="bmHW">Height <button id="bmHm">&minus;</button><b id="bmH">3</b><button id="bmHp">+</button></span><span id="bmRoofW">Style <button id="bmRoofS">Gabled</button></span><span id="bmWinW">Size <button id="bmWinS">1x1</button></span><span id="bmHint"></span>`;hud.appendChild(opt);
  const side=document.createElement('div');side.id='bmSide';side.innerHTML=`<button id="bmRotL">&#10226;</button><button id="bmRotR">&#10227;</button><button id="bmZin">+</button><button id="bmZout">&minus;</button><button id="bmMe">&#9678;</button>`;hud.appendChild(side);
  const cnt=document.createElement('div');cnt.id='bmCount';hud.appendChild(cnt);const mats=document.createElement('div');mats.id='bmMats';hud.appendChild(mats);
  bar.querySelectorAll('[data-t]').forEach(b=>bindTap(b,()=>setTool(b.dataset.t)));bindTap($('bmUndo'),()=>bmUndo());bindTap($('bmRedo'),()=>bmRedo());
  bindTap($('bmMatBtn'),()=>{const v=mats.style.display==='grid';if(!v)renderMats();mats.style.display=v?'none':'grid';});
  bindTap($('bmHm'),()=>{BM.h=Math.max(1,BM.h-1);updBMBtns();});bindTap($('bmHp'),()=>{BM.h=Math.min(6,BM.h+1);updBMBtns();});
  bindTap($('bmRoofS'),()=>{BM.roof=BM.roof==='gable'?'flat':'gable';updBMBtns();});bindTap($('bmWinS'),()=>{BM.win=BM.win===2?1:2;updBMBtns();});
  bindTap($('bmRotL'),()=>{BM.yaw+=Math.PI/4;});bindTap($('bmRotR'),()=>{BM.yaw-=Math.PI/4;});bindTap($('bmZin'),()=>{BM.dist/=1.25;clampTarget();});bindTap($('bmZout'),()=>{BM.dist*=1.25;clampTarget();});
  bindTap($('bmMe'),()=>{BM.tx=G.p.x;BM.tz=G.p.z;});
  // gestures
  const P=BM.ptrs;let gest=null,mode=null;
  const two=()=>{const [a,b]=[...P.values()];return {d:Math.hypot(a.x-b.x,a.y-b.y),ang:Math.atan2(b.y-a.y,b.x-a.x),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};};
  lay.addEventListener('pointerdown',e=>{if(!BM.on||stack.length)return;e.preventDefault();mats.style.display='none';P.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});try{lay.setPointerCapture(e.pointerId);}catch(_){}
    if(P.size===1){if(BM.tool==='pan')mode='pan';else if(BM.tool==='furn'){mode='furn';furnDown(e.clientX,e.clientY);}else{mode='draw';BM.drag={id:e.pointerId,s:BM.tool==='door'||BM.tool==='window'?null:pickStart(e.clientX,e.clientY)};bmPreview(e.clientX,e.clientY);}}
    else if(P.size===2){if(mode==='furn')furnUp(0,0,false);if(mode==='draw'){BM.drag=null;hideGhost();}mode='gest';gest=two();}});
  lay.addEventListener('pointermove',e=>{const q=P.get(e.pointerId);if(!q||!BM.on)return;const dx=e.clientX-q.x,dy=e.clientY-q.y;q.x=e.clientX;q.y=e.clientY;
    if(mode==='pan')panBy(dx,dy);else if(mode==='furn')furnMove(e.clientX,e.clientY);else if(mode==='draw'&&BM.drag&&BM.drag.id===e.pointerId)bmPreview(e.clientX,e.clientY);
    else if(mode==='gest'&&P.size>=2){const g=two();if(gest.d>10&&g.d>10){BM.dist*=gest.d/g.d;}BM.yaw-=(g.ang-gest.ang);panBy(g.mx-gest.mx,g.my-gest.my);clampTarget();gest=g;}});
  const up=e=>{if(!P.has(e.pointerId))return;P.delete(e.pointerId);if(mode==='furn'){furnUp(e.clientX,e.clientY,e.type==='pointerup');}if(mode==='draw'&&BM.drag&&BM.drag.id===e.pointerId){if(e.type==='pointerup')bmCommit(e.clientX,e.clientY);BM.drag=null;hideGhost();}
    if(!P.size)mode=null;else if(mode==='gest'&&P.size===1)mode='idle';};
  lay.addEventListener('pointerup',up);lay.addEventListener('pointercancel',up);
  lay.addEventListener('wheel',e=>{if(!BM.on)return;e.preventDefault();BM.dist*=e.deltaY>0?1.12:1/1.12;clampTarget();},{passive:false});})();
function bmPreview(cx,cy){const d=BM.drag;if(!d)return;const cells=effective(toolCells(d.s,cx,cy));BM.cells=cells;showGhost(cells,BM.tool==='erase');
  const nm={wall:'Wall',floor:'Floor',room:'Room',roof:'Roof',door:'Door',window:'Window',stairs:'Stairs',erase:'Erase'}[BM.tool];
  setCount(cells.length?`${nm}${BM.tool==='door'||BM.tool==='window'?'':' '+BM.dims} \u00b7 ${cells.length} block${cells.length>1?'s':''}`:(BM.tool==='roof'?'Drag over the room (or tap inside it)':nm+': nothing here'));}
function bmCommit(cx,cy){const d=BM.drag;if(!d)return 0;const cells=toolCells(d.s,cx,cy);const nm={wall:'Wall',floor:'Floor',room:'Room',roof:'Roof',door:'Door',window:'Window',stairs:'Stairs',erase:'Erase'}[BM.tool];
  if(!cells.length){if(BM.tool==='door'||BM.tool==='window')toast('Tap a wall');else if(BM.tool==='roof')toast('Drag over the room or tap inside it');return 0;}return applyCells(cells,nm);}
// scripted gesture for tests: screen points
function bmDo(tool,a,b){setTool(tool);BM.drag={id:-1,s:tool==='door'||tool==='window'?null:pickStart(a[0],a[1])};const n=bmCommit((b||a)[0],(b||a)[1]);BM.drag=null;return n;}
function worldToScreen(x,y,z){const v=new THREE.Vector3(x,y,z).project(camera);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight];}
// ---- hooks into the game loop ----
const _bUpdP=updatePlayer;updatePlayer=function(dt){if(BM.on||BM.tw){G.p.vx=G.p.vy=G.p.vz=0;G.p.fallY=G.p.y;updBuildCam(Math.min(dt,.1));return;}_bUpdP(dt);};
const _bUpdM=updateMining;updateMining=function(dt){if(BM.on||BM.tw){selBox.visible=crackBox.visible=false;$('ring').style.opacity=0;return;}_bUpdM(dt);};
const _bUpdC=updateChunks;updateChunks=function(ms){if(!BM.on)return _bUpdC(ms);const p=G.p,x=p.x,y=p.y,z=p.z;p.x=BM.tx;p.z=BM.tz;p.y=BM.ty;try{_bUpdC(ms);}finally{p.x=x;p.y=y;p.z=z;}};
const _bEnv=updateEnv;updateEnv=function(dt){if(!BM.on)return _bEnv(dt);const p=G.p,x=p.x,y=p.y,z=p.z;p.x=BM.tx;p.z=BM.tz;p.y=BM.ty;try{_bEnv(dt);}finally{p.x=x;p.y=y;p.z=z;}};
const _bHurt=hurt;hurt=function(n,why,kind){if(BM.on&&!G.envDmg)return;_bHurt(n,why,kind);};  // v1.7.1: lava/fire still hurt in Build Mode
const _bVM=updViewModel;updViewModel=function(dt){_bVM(dt);if(BM.on||BM.tw)vm.visible=false;};
const _bGoT=goTitle;goTitle=function(){exitBuild(true);_bGoT();};
const _bStart=startWorld;startWorld=function(a,b){exitBuild(true);BM.undo.length=BM.redo.length=0;genCache.clear();return _bStart(a,b);};
const _bBack=window.bcBack;window.bcBack=function(){if(BM.on&&!stack.length){if($('bmMats').style.display==='grid'){$('bmMats').style.display='none';return true;}exitBuild();return true;}return _bBack();};window.dhBack=window.bcBack;
// doors: tap one in play mode to open/close it (any held item, even an empty hand)
const _bTap=tapAction;tapAction=function(){if(G.mode==='play'&&!BM.on){const t=raycast(5);if(t&&B[t.b].door){const n=npcUnderCrosshair(),m=mobUnderCrosshair(),a=animalUnderCrosshair();const c=[n,m,a].filter(Boolean).find(e=>eyeDist(e)<t.t+.3);if(!c){toggleDoor(t.x,t.y,t.z);G.doorToggles=(G.doorToggles||0)+1;return;}}}_bTap();};
addEventListener('keydown',e=>{if(G.mode!=='play'||stack.length)return;if(e.code==='KeyB')toggleBuild();if(BM.on&&(e.ctrlKey||e.metaKey)&&e.code==='KeyZ')bmUndo();if(BM.on&&(e.ctrlKey||e.metaKey)&&e.code==='KeyY')bmRedo();});
Object.assign(window.__bc,{BM,enterBuild,exitBuild,toggleBuild,setTool,bmDo,bmUndo,bmRedo,worldToScreen,pickStart,pickHit,toolCells,applyCells,roofCells,findRoom,doorCells,windowCells,camera,toggleDoor,tapAction:()=>tapAction()});
// ===== v1.6: Sims-style FURNITURE (catalog, place/rotate/move/erase, saved with the world, usable in play mode) =====
// models: boxes in 1/16 block units [x0,y0,z0,x1,y1,z1,color,tag]; front faces local +z, back at z=0
const WD=0x9a6a3c,WDD=0x6a4424,WH=0xf2f2ee,MT=0xb8bcc4,BK=0x1c1c22;
const FURN={
 bed:{n:'Bed',c:'Bedroom',use:'bed',b:[[0,0,0,16,6,32,WD],[0,0,0,16,16,2,WDD],[1,6,2,15,9,31,WH],[1,6,11,15,10,31,0x3a6ac8],[3,9,3,13,11,9,0xffffff]]},
 nightstand:{n:'Nightstand',c:'Bedroom',b:[[2,0,2,14,10,14,WD],[3,4,14,13,8,14.6,WDD],[7.5,5.5,14.6,8.5,6.5,15.2,0xd8c060],[6,10,6,10,11,10,0xe0d0a0],[7.5,11,7.5,8.5,14,8.5,MT],[5.5,14,5.5,10.5,17,10.5,0xfff0b0,'glow']]},
 dresser:{n:'Dresser',c:'Bedroom',b:[[0,0,2,32,16,15,WD],[1,1,15,31,5,15.5,WDD],[1,6,15,31,10,15.5,WDD],[1,11,15,31,15,15.5,WDD],[14,2.5,15.5,18,3.5,16,0xd8c060],[14,7.5,15.5,18,8.5,16,0xd8c060],[14,12.5,15.5,18,13.5,16,0xd8c060]]},
 couch:{n:'Couch',c:'Living',use:'sit',sy:7,b:[[0,0,2,32,6,15,0x6a3a8a],[2,6,4,30,8,15,0x8a5aaa],[0,6,1,32,16,5,0x6a3a8a],[0,6,2,3,11,15,0x5a2a7a],[29,6,2,32,11,15,0x5a2a7a]]},
 armchair:{n:'Armchair',c:'Living',use:'sit',sy:7,b:[[0,0,2,16,6,15,0x3a7a5a],[2,6,4,14,8,15,0x5a9a7a],[0,6,1,16,16,5,0x3a7a5a],[0,6,2,3,11,15,0x2a6a4a],[13,6,2,16,11,15,0x2a6a4a]]},
 coffee:{n:'Coffee Table',c:'Living',b:[[1,6,3,31,7.5,13,WD],[2,0,4,4,6,6,WDD],[28,0,4,30,6,6,WDD],[2,0,10,4,6,12,WDD],[28,0,10,30,6,12,WDD],[12,7.5,6,16,9,10,0xd04040]]},
 tv:{n:'TV',c:'Living',use:'tv',b:[[1,0,3,31,7,13,BK],[3,7,7,29,23,9,0x222228],[4,8,9,28,22,9.4,0x30343c,'screen']]},
 shelf:{n:'Bookshelf',c:'Living',b:[[0,0,2,16,30,16,WD],[1,1,8,15,9,15,WDD],[1,11,8,15,19,15,WDD],[1,21,8,15,29,15,WDD],[2,1,9,5,8,15.2,0xc03030],[5,1,9,8,7,15.2,0x3050c0],[9,1,9,12,8,15.2,0x30a050],[2,11,9,6,18,15.2,0xe0a020],[7,11,9,10,17,15.2,0x7040a0],[11,11,9,14,18,15.2,0xc03030],[3,21,9,7,28,15.2,0x2a8ac0],[9,21,9,13,27,15.2,0xa05020]]},
 rug:{n:'Rug',c:'Living',flat:1,b:[[0,0,0,32,.6,32,0xa8302a],[3,0,3,29,.8,29,0xd8a040],[6,0,6,26,1,26,0xa8302a]]},
 lamp:{n:'Floor Lamp',c:'Living',use:'lamp',b:[[5,0,5,11,1.5,11,BK],[7.5,1.5,7.5,8.5,22,8.5,MT],[4,20,4,12,27,12,0xfff0b0,'glow']]},
 plant:{n:'Plant',c:'Living',b:[[5,0,5,11,6,11,0xb0603a],[4,6,4,12,12,12,0x3a9a3a],[6,10,2,10,16,8,0x2e8a2e],[3,9,8,9,14,13,0x4aaa4a],[8,12,7,13,18,12,0x3a9a3a]]},
 fridge:{n:'Fridge',c:'Kitchen',use:'fridge',b:[[1,0,2,15,30,15,WH],[1,19,15,15,19.6,15.3,0xc8c8c8],[12,20,15,13,27,16,MT],[12,8,15,13,17,16,MT]]},
 stove:{n:'Stove',c:'Kitchen',use:'stove',b:[[1,0,1,15,14,15,0xd8d8d8],[1,14,1,15,14.5,15,0x303030],[3,14.5,3,7,15,7,BK],[9,14.5,3,13,15,7,BK],[3,14.5,9,7,15,13,BK],[9,14.5,9,13,15,13,BK],[3,3,15,13,10,15.3,0x202028],[1,14,1,15,18,2,0xc8c8c8]]},
 counter:{n:'Counter',c:'Kitchen',b:[[0,0,1,16,14,15,WD],[0,14,0,16,15.5,16,0xd8d4cc],[2,2,15,14,12,15.4,WDD],[7,8,15.4,9,9,16,0xd8c060]]},
 ksink:{n:'Kitchen Sink',c:'Kitchen',use:'sink',b:[[0,0,1,16,14,15,WD],[0,14,0,16,15.5,16,0xd8d4cc],[3,14.6,4,13,15.6,13,0x8a9aa8],[7,15.5,1,9,20,3,MT],[7,18,3,9,19,7,MT]]},
 table:{n:'Dining Table',c:'Kitchen',b:[[0,11,0,32,12.5,16,WD],[1,0,1,3,11,3,WDD],[29,0,1,31,11,3,WDD],[1,0,13,3,11,15,WDD],[29,0,13,31,11,15,WDD]]},
 chair:{n:'Chair',c:'Kitchen',use:'sit',sy:8,b:[[3,7,3,13,8.5,13,WD],[3,0,3,5,7,5,WDD],[11,0,3,13,7,5,WDD],[3,0,11,5,7,13,WDD],[11,0,11,13,7,13,WDD],[3,8.5,3,13,19,4.5,WD]]},
 toilet:{n:'Toilet',c:'Bath',use:'toilet',sy:8,b:[[5,0,5,11,6,12,WH],[4,6,4,12,8,14,WH],[5,7.6,6,11,8.2,13,0x8ac8e8],[4,6,1,12,15,4,WH],[6,15,1.5,10,15.6,3.5,0xd0d0d0]]},
 tub:{n:'Bath / Shower',c:'Bath',use:'tub',b:[[0,0,1,32,9,15,WH],[2,6,3,30,8.6,13,0x5ab0e8],[1,0,1,2,30,2,MT],[1,28,1,8,29,2,MT],[6,25,1,9,28,4,MT]]},
 bsink:{n:'Bathroom Sink',c:'Bath',use:'sink',b:[[6.5,0,4,9.5,10,7,WH],[3,10,1,13,13,12,WH],[5,12.4,3,11,13.2,10,0x8ac8e8],[7.5,13,1.5,8.5,16,3,MT]]},
 mirror:{n:'Mirror',c:'Bath',wall:1,b:[[3,4,0,13,15,.8,WD],[4,5,.8,12,14,1.1,0xd8f0ff]]},
 painting:{n:'Painting',c:'Decor',wall:1,b:[[1,4,0,15,13,.8,0x8a5a2a],[2,5,.8,14,12,1.1,0x7ab8e8],[2,5,.8,14,7.5,1.15,0x4a9a3a],[9,8,.8,12,11,1.2,0xffe060]]},
 painting2:{n:'Portrait',c:'Decor',wall:1,b:[[3,3,0,13,15,.8,0xc8a040],[4,4,.8,12,14,1.1,0x2a2a4a],[6,7,.8,10,12,1.2,0xe8b890],[5,4,.8,11,7,1.2,0xa03030]]},
 clock:{n:'Clock',c:'Decor',wall:1,use:'clock',b:[[4,6,0,12,14,1,0x8a5a2a],[5,7,1,11,13,1.3,0xf8f4e0],[7.6,10,1.3,8.4,12.5,1.5,BK],[8,9.6,1.3,10.5,10.4,1.5,BK]]},
 curtains:{n:'Curtains',c:'Decor',wall:1,b:[[0,15,0,16,15.6,2,MT],[0,2,1,5,15,2,0xc03048],[11,2,1,16,15,2,0xc03048]]}};
const FCATS=['Bedroom','Living','Kitchen','Bath','Decor'];
const FM={items:new Map(),nid:1,sel:'couch',cat:'Living',r:0,ghost:null,ghostK:'',down:null,last:null};
const fMats={};const fMat=(c,tag)=>{const k=c+(tag||'');return fMats[k]||(fMats[k]=tag==='glow'?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}));};
const fGeo=new THREE.BoxGeometry(1,1,1);
const ghostFMat=new THREE.MeshBasicMaterial({color:0x60ff60,transparent:true,opacity:.5,depthWrite:false});
function furnModel(k,ghostM){const d=FURN[k],g=new THREE.Group(),inner=new THREE.Group();inner.position.set(-.5,0,-.5);g.add(inner);
  for(const q of d.b){const m=new THREE.Mesh(fGeo,ghostM||(q[7]==='screen'?new THREE.MeshBasicMaterial({color:q[6]}):fMat(q[6],q[7])));m.scale.set((q[3]-q[0])/16,Math.max(.02,(q[4]-q[1])/16),Math.max(.02,(q[5]-q[2])/16));m.position.set((q[0]+q[3])/32,(q[1]+q[4])/32,(q[2]+q[5])/32);if(q[7]==='screen')g.userData.screen=m;inner.add(m);}
  if(ghostM)g.renderOrder=6;return g;}
function placeGroup(g,f){g.position.set(f.x+.5,f.y+(FURN[f.k].flat?.01:0),f.z+.5);g.rotation.y=f.r*Math.PI/2;}
function furnSet(id,st){const old=FM.items.get(id);if(old){scene.remove(old.g);FM.items.delete(id);}
  if(st){const f={id,k:st.k,x:st.x,y:st.y,z:st.z,r:st.r&3,on:false,g:furnModel(st.k)};f.g.userData.fid=id;f.g.traverse(o=>o.userData.fid=id);placeGroup(f.g,f);scene.add(f.g);FM.items.set(id,f);FM.nid=Math.max(FM.nid,id+1);return f;}return null;}
const fState=f=>f?{k:f.k,x:f.x,y:f.y,z:f.z,r:f.r}:null;
function furnClear(){for(const f of FM.items.values())scene.remove(f.g);FM.items.clear();FM.nid=1;FM.last=null;G.sit=null;}
function furnOp(label,changes){if(!changes.length)return 0;for(const c of changes)furnSet(c.id,c.a);BM.undo.push({label,list:[],f:changes});if(BM.undo.length>60)BM.undo.shift();BM.redo.length=0;sfx('place');updBMBtns();return changes.length;}
function furnAdd(k,x,y,z,r){const id=FM.nid++;furnOp('Place '+FURN[k].n,[{id,b:null,a:{k,x,y,z,r}}]);toast(FURN[k].n+' placed');FM.last=id;return FM.items.get(id);}
function furnMoveTo(f,x,y,z,r){const b=fState(f);furnOp('Move '+FURN[f.k].n,[{id:f.id,b,a:{k:f.k,x,y,z,r}}]);FM.last=f.id;}
function furnRotate(f){if(!f)return false;const b=fState(f);furnOp('Rotate',[{id:f.id,b,a:Object.assign({},b,{r:(f.r+1)&3})}]);FM.last=f.id;toast('Rotated '+FURN[f.k].n);return true;}
function furnRemove(list){const ch=list.map(f=>({id:f.id,b:fState(f),a:null}));const n=furnOp('Erase furniture',ch);if(n)toast('Removed '+n+' furniture');return n;}
// picking
const _fr=new THREE.Raycaster();
function furnAtRay(o,d,maxD){_fr.set(o,d);_fr.far=maxD||300;const objs=[];for(const f of FM.items.values())objs.push(f.g);const h=_fr.intersectObjects(objs,true)[0];return h?{f:FM.items.get(h.object.userData.fid),t:h.distance}:null;}
function furnAtScreen(cx,cy){const r=scrRay(cx,cy);return furnAtRay(r.o,r.d);}
// where would a new piece go
function furnSpot(cx,cy,k){const d=FURN[k];const h=pickHit(cx,cy);if(!h)return null;
  if(d.wall){if(h.n[1]!==0||!SOLID[h.b])return null;const x=h.x+h.n[0],z=h.z+h.n[2];const r=Math.round(Math.atan2(h.n[0],h.n[2])/(Math.PI/2))&3;return {x,y:h.y,z,r};}
  const s=pickStart(cx,cy);if(!s)return null;return {x:s.x,y:s.y,z:s.z,r:FM.r};}
function showFGhost(sp,k,ok){if(FM.ghostK!==k){if(FM.ghost)scene.remove(FM.ghost);FM.ghost=furnModel(k,ghostFMat);FM.ghostK=k;scene.add(FM.ghost);}
  FM.ghost.visible=!!sp;if(sp){placeGroup(FM.ghost,{k,x:sp.x,y:sp.y,z:sp.z,r:sp.r});ghostFMat.color.setHex(ok===false?0xff5050:0x60ff60);}}
function hideFGhost(){if(FM.ghost)FM.ghost.visible=false;}
// gesture handlers (called from the build layer)
function furnDown(cx,cy){$('bmFurnCat').style.display='none';const hit=furnAtScreen(cx,cy);FM.down={cx,cy,f:hit&&hit.f,moved:false,sp:null};
  if(hit){FM.last=hit.f.id;setCount(FURN[hit.f.k].n+' \u00b7 tap to rotate, drag to move');}else furnMove(cx,cy);}
function furnMove(cx,cy){const D=FM.down;if(!D)return;if(Math.hypot(cx-D.cx,cy-D.cy)>10)D.moved=true;
  if(D.f){if(!D.moved)return;D.f.g.visible=false;const sp=furnSpot(cx,cy,D.f.k);if(sp&&!FURN[D.f.k].wall)sp.r=D.f.r;D.sp=sp;showFGhost(sp,D.f.k);setCount(sp?'Move '+FURN[D.f.k].n:'');}
  else{const sp=furnSpot(cx,cy,FM.sel);D.sp=sp;showFGhost(sp,FM.sel,!!sp);setCount(sp?FURN[FM.sel].n+' \u00b7 1 piece \u00b7 release to place':(FURN[FM.sel].wall?'Point at a wall':'Nothing here'));}}
function furnUp(cx,cy,commit){const D=FM.down;FM.down=null;hideFGhost();setCount('');if(!D)return;if(D.f)D.f.g.visible=true;if(!commit)return;
  if(D.f){if(!D.moved)furnRotate(D.f);else if(D.sp)furnMoveTo(D.f,D.sp.x,D.sp.y,D.sp.z,D.sp.r);return;}
  if(D.sp)furnAdd(FM.sel,D.sp.x,D.sp.y,D.sp.z,D.sp.r);else toast(FURN[FM.sel].wall?'Tap a wall to hang it':'Tap the ground or a floor');}
// erase tool also removes furniture under the drag rectangle (or the tapped piece)
const _fCommit=bmCommit;bmCommit=function(cx,cy){const d=BM.drag;if(BM.tool==='erase'&&d){const tap=furnAtScreen(cx,cy);let list=[];
  if(d.s){const p=planeCell(cx,cy,d.s.y)||{x:d.s.hit.x,z:d.s.hit.z};const r=rectOf({x:d.s.hit.x,z:d.s.hit.z},p);for(const f of FM.items.values())if(f.x>=r[0]&&f.x<=r[2]&&f.z>=r[1]&&f.z<=r[3]&&Math.abs(f.y-d.s.y)<=8)list.push(f);}
  if(tap&&!list.includes(tap.f))list.push(tap.f);if(list.length){furnRemove(list);return list.length;}}return _fCommit(cx,cy);};
const _fUndo=bmUndo;bmUndo=function(){const e=BM.undo[BM.undo.length-1];if(e&&e.f){BM.undo.pop();for(let i=e.f.length-1;i>=0;i--)furnSet(e.f[i].id,e.f[i].b);BM.redo.push(e);sfx('break');toast('Undo '+e.label);updBMBtns();return true;}return _fUndo();};
const _fRedo=bmRedo;bmRedo=function(){const e=BM.redo[BM.redo.length-1];if(e&&e.f){BM.redo.pop();for(const c of e.f)furnSet(c.id,c.a);BM.undo.push(e);sfx('place');toast('Redo '+e.label);updBMBtns();return true;}return _fRedo();};
// ---- UI: FURNITURE tab + catalog ----
function renderFurnCat(){const L=$('bmFurnCat');L.innerHTML='';const tabs=document.createElement('div');tabs.className='fctabs';
  for(const c of FCATS){const b=document.createElement('button');b.textContent=c;b.className=c===FM.cat?'on':'';bindTap(b,()=>{FM.cat=c;renderFurnCat();});tabs.appendChild(b);}L.appendChild(tabs);
  const gr=document.createElement('div');gr.className='fcgrid';for(const k in FURN){if(FURN[k].c!==FM.cat)continue;const b=document.createElement('button');b.className='fci'+(k===FM.sel?' sel':'');b.innerHTML=`<img src="${furnIcon(k)}"><span>${esc(FURN[k].n)}</span>`;
    bindTap(b,()=>{FM.sel=k;L.style.display='none';updBMBtns();toast(FURN[k].n+': tap '+(FURN[k].wall?'a wall':'the floor')+' to place');});gr.appendChild(b);}L.appendChild(gr);}
const fIcons={};function furnIcon(k){if(fIcons[k])return fIcons[k];const c=document.createElement('canvas');c.width=c.height=56;const g=c.getContext('2d');const d=FURN[k];
  let mx=16,mz=16,my=16;for(const q of d.b){mx=Math.max(mx,q[3]);my=Math.max(my,q[4]);mz=Math.max(mz,q[5]);}const s=40/Math.max(mx+mz*.5,my+mz*.5);
  const hex=v=>'#'+v.toString(16).padStart(6,'0');const sh=(v,f)=>{const r=Math.min(255,((v>>16)&255)*f),gg=Math.min(255,((v>>8)&255)*f),b=Math.min(255,(v&255)*f);return `rgb(${r|0},${gg|0},${b|0})`;};
  const bs=d.b.slice().sort((a,b)=>(a[2]+a[5])-(b[2]+b[5])||(a[1]-b[1]));
  for(const q of bs){const [x0,y0,z0,x1,y1,z1,col]=q;const X=x=>6+x*s,Y=y=>50-y*s;const ox=(16-z1)*.5*s,oy=-(16-z1)*.5*s*0; // simple cabinet projection
    const px=X(x0)+z0*.4*s*0,dz=(z1-z0)*.45*s;g.fillStyle=sh(col,.75);g.fillRect(X(x0)+(16-z1)*.0,Y(y1)-dz*0,(x1-x0)*s,(y1-y0)*s);
    g.fillStyle=sh(col,1.05);g.beginPath();g.moveTo(X(x0),Y(y1));g.lineTo(X(x0)+dz,Y(y1)-dz);g.lineTo(X(x1)+dz,Y(y1)-dz);g.lineTo(X(x1),Y(y1));g.fill();
    g.fillStyle=sh(col,.55);g.beginPath();g.moveTo(X(x1),Y(y1));g.lineTo(X(x1)+dz,Y(y1)-dz);g.lineTo(X(x1)+dz,Y(y0)-dz);g.lineTo(X(x1),Y(y0));g.fill();}
  return fIcons[k]=c.toDataURL();}
(function(){const bar=$('bmBar');const fb=document.createElement('button');fb.dataset.t='furn';fb.innerHTML='&#128715;<small>FURNITURE</small>';bar.insertBefore(fb,$('bmUndo'));bindTap(fb,()=>setTool('furn'));
  const opt=$('bmOpt');const w=document.createElement('span');w.id='bmFurnW';w.innerHTML=`<button id="bmFurnBtn"></button><b id="bmFurnNm"></b><button id="bmFRot">&#10227; Rotate</button>`;opt.insertBefore(w,$('bmHint'));
  const cat=document.createElement('div');cat.id='bmFurnCat';$('hud').appendChild(cat);
  bindTap($('bmFurnBtn'),()=>{const v=cat.style.display==='block';if(!v)renderFurnCat();cat.style.display=v?'none':'block';});
  bindTap($('bmFRot'),()=>{const f=FM.last&&FM.items.get(FM.last);if(f)furnRotate(f);else{FM.r=(FM.r+1)&3;toast('New pieces face '+['south','east','north','west'][FM.r]);}});})();
const _fBtns=updBMBtns;updBMBtns=function(){_fBtns();const f=BM.tool==='furn';if(f)$('bmMatW').style.display='none';$('bmFurnW').style.display=f?'':'none';if(f){$('bmFurnBtn').style.backgroundImage=`url(${furnIcon(FM.sel)})`;$('bmFurnNm').textContent=FURN[FM.sel].n;$('bmHint').textContent='Tap to place \u00b7 tap a piece to rotate \u00b7 drag it to move';}else $('bmFurnCat').style.display='none';};
const _fSetTool=setTool;setTool=function(t){_fSetTool(t);if(t==='furn'){FM.last=null;$('bmFurnCat').style.display='block';renderFurnCat();}};
const _fExit=exitBuild;exitBuild=function(i){$('bmFurnCat').style.display='none';hideFGhost();FM.down=null;return _fExit(i);};
// ---- play mode: use furniture ----
function furnUse(f){const d=FURN[f.k];G.furnUses=(G.furnUses||0)+1;switch(d.use){
  case 'bed':useBed();break;
  case 'sit':G.sit={id:f.id,yaw:G.p.yaw};toast('Sitting on the '+d.n.toLowerCase()+' \u00b7 move to stand up');sfx('click');break;
  case 'tv':f.on=!f.on;toast(f.on?'TV on: Blockcraft News':'TV off');sfx('click');break;
  case 'lamp':f.on=!f.on;f.g.traverse(o=>{if(o.material&&o.material.isMeshBasicMaterial&&o.material!==ghostFMat){}});toast(f.on?'Lamp on':'Lamp off');break;
  case 'fridge':{if((G.fridgeT||0)>performance.now()){toast('The fridge is empty for a moment');break;}G.fridgeT=performance.now()+20000;G.hp=Math.min(20,G.hp+6);if(typeof G.food==='number')G.food=20;const fd=['beef_c','fish_c','chicken_c','pork_c'][Math.random()*4|0];addInv(BN[fd],1);updHotbar();toast('Snack! +3 hearts and 1 '+B[BN[fd]].name);sfx('buy');break;}
  case 'stove':openCook({x:f.x,y:f.y,z:f.z,b:BN.furnace});break;
  case 'toilet':G.sit={id:f.id,yaw:G.p.yaw};toast('*flush*');sfx('door');break;
  case 'sink':toast('You wash your hands. Squeaky clean!');sfx('click');break;
  case 'tub':G.hp=Math.min(20,G.hp+2);toast('A nice relaxing bath (+1 heart)');break;
  case 'clock':{const h=Math.floor(((G.time+.25)%1)*24),m=Math.floor((((G.time+.25)%1)*24-h)*60);toast('It is '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));break;}
  default:toast(d.n);}return true;}
const _fTap=tapAction;tapAction=function(){if(G.mode==='play'&&!BM.on&&!G.sit){const o=new THREE.Vector3(G.p.x,G.p.y+1.62,G.p.z),dd=lookDir();const h=furnAtRay(o,new THREE.Vector3(dd[0],dd[1],dd[2]),4.5);
    if(h){const t=raycast(4.5);if(!t||h.t<=t.t+.5){furnUse(h.f);return;}}}if(G.sit){standUp();return;}_fTap();};
function standUp(){const s=G.sit;G.sit=null;if(!s)return;const f=FM.items.get(s.id);if(f){G.p.x=f.x+.5;G.p.z=f.z+.5;G.p.y=openAbove(G.p.x,f.y,G.p.z);G.p.vy=0;G.p.fallY=G.p.y;}}
const _fUpdP=updatePlayer;updatePlayer=function(dt){if(G.sit&&!BM.on&&!BM.tw){const f=FM.items.get(G.sit.id);const K=IN.keys;if(!f||Math.hypot(IN.mx,IN.mz)>.3||IN.jump||K.KeyW||K.KeyA||K.KeyS||K.KeyD||K.Space){standUp();return _fUpdP(dt);}
    const sy=(FURN[f.k].sy||7)/16;G.p.x=f.x+.5;G.p.z=f.z+.5;G.p.y=f.y;G.p.vx=G.p.vy=G.p.vz=0;G.p.fallY=f.y;camera.position.set(f.x+.5,f.y+sy+1.05,f.z+.5);camera.rotation.set(G.p.pitch,G.p.yaw,0);return;}_fUpdP(dt);};
// TV screen + lamp animation
const tvCols=[0x3a7ad8,0x48c060,0xe0b030,0xd04848,0x9a50d0];
const _fLife=updateLife;updateLife=function(dt){_fLife(dt);const t=performance.now()/1000;for(const f of FM.items.values()){const s=f.g.userData.screen;if(s)s.material.color.setHex(f.on?tvCols[Math.floor(t*1.5+f.id)%tvCols.length]:0x30343c);}};
// ---- saves: furniture rides along as an extra field (older versions ignore it) ----
const _fSer=serialize;serialize=function(){const s=_fSer();s.furn=[...FM.items.values()].map(f=>[f.k,f.x,f.y,f.z,f.r]);return s;};
const _fStart=startWorld;startWorld=function(a,b){const s=b?null:slotMeta(a);furnClear();const r=_fStart(a,b);if(s&&Array.isArray(s.furn)){for(const q of s.furn)if(FURN[q[0]])furnSet(FM.nid++,{k:q[0],x:q[1],y:q[2],z:q[3],r:q[4]|0});saveWorld();}return r;};
const _fGoT=goTitle;goTitle=function(){_fGoT();furnClear();};
Object.assign(window.__bc,{startWorld:(a,b)=>startWorld(a,b),goTitle:()=>goTitle(),saveWorld:()=>saveWorld(),FURN,FM,furnAdd,furnRotate,furnRemove,furnUse,furnAtScreen,furnSpot,standUp,serialize:()=>serialize(),bmUndo:()=>bmUndo(),bmRedo:()=>bmRedo(),setTool:t=>setTool(t)});
// ===== v1.6.1: easy AUTO-ROOF (tap a room -> footprint + height detected, ghost preview, Confirm/Cancel, styles, overhang, ridge rotate) =====
const BC_VERSION='1.7.1';window.BC_VERSION=BC_VERSION;
BM.roof='gable';BM.over=true;BM.rflip=false;BM.pend=null;
const RSTYLES=['gable','hip','flat'],RSN={gable:'Gabled',hip:'Hip',flat:'Flat'};
const isWallB=b=>b>0&&(SOLID[b]||B[b].door)&&builtB(b);
// flood-fill the open floor of a room at level y; returns {mask:Set "x,z", ring:[[x,z]], box} or null if it leaks
function roomFootprint(x,y,z){const seen=new Set(),q=[[x,z]],inside=[];seen.add(x+','+z);
  while(q.length){const [a,c]=q.pop();inside.push([a,c]);if(inside.length>1200||Math.abs(a-x)>40||Math.abs(c-z)>40)return null;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=a+dx,nz=c+dz,k=nx+','+nz;if(seen.has(k))continue;const b=getB(nx,y,nz);if(b<0)return null;
      if(isWallB(b)){continue;}if(b>0&&SOLID[b])return null;seen.add(k);q.push([nx,nz]);}}
  const mask=new Set(inside.map(p=>p[0]+','+p[1])),ring=[];
  for(const [a,c] of inside)for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const k=(a+dx)+','+(c+dz);if(mask.has(k))continue;if(isWallB(getB(a+dx,y,c+dz))){mask.add(k);ring.push([a+dx,c+dz]);}}
  if(!ring.length)return null;let box=[1e9,1e9,-1e9,-1e9];for(const k of mask){const [a,c]=k.split(',').map(Number);box=[Math.min(box[0],a),Math.min(box[1],c),Math.max(box[2],a),Math.max(box[3],c)];}
  return {mask,ring,box,y};}
function rectFoot(r,y){const mask=new Set(),ring=[];for(let z=r[1];z<=r[3];z++)for(let x=r[0];x<=r[2];x++){mask.add(x+','+z);if(x===r[0]||x===r[2]||z===r[1]||z===r[3])ring.push([x,z]);}return {mask,ring,box:r.slice(),y,rect:true};}
// find the room under a tap: flood fill first, else the old 4-way scan (bounding box)
function autoRoom(h){if(!h)return null;const offs=[[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1],[2,0],[-2,0],[0,2],[0,-2]];
  for(const [ox,oz] of offs)for(let y=h.y+1;y>=h.y-6;y--){const x=h.x+ox,z=h.z+oz;if(isSolidAt(x,y,z)||!isSolidAt(x,y-1,z))continue;const f=roomFootprint(x,y,z);if(f){f.auto=true;return f;}}
  const f=findRoom(h);return f?Object.assign(rectFoot(f.r,f.y),{auto:true,fallback:true}):null;}
// build roof cells for any footprint
function roofPlan(F,style,id,over,flip){const {mask,box}=F;const has=(x,z)=>mask.has(x+','+z);let top=-1,gm=0;
  const ring=F.ring.length?F.ring:[...mask].map(k=>k.split(',').map(Number));
  for(const [x,z] of ring){const t=topBuilt(x,z,F.y);if(t>top){top=t;gm=getB(x,t,z);}}
  if(top<0){top=F.y-1;gm=BM.mat;}if(!gm||!B[gm]||B[gm].door||B[gm].key==='glass'||!SOLID[gm])gm=BM.mat;
  let alongX=(box[2]-box[0])>=(box[3]-box[1]);if(flip)alongX=!alongX;
  const run=(x,z,dx,dz)=>{let n=0;while(n<40&&has(x+dx*(n+1),z+dz*(n+1)))n++;return n;};
  const K=new Map();for(const k of mask){const [x,z]=k.split(',').map(Number);let v=0;
    if(style==='gable')v=alongX?Math.min(run(x,z,0,1),run(x,z,0,-1)):Math.min(run(x,z,1,0),run(x,z,-1,0));
    else if(style==='hip')v=Math.min(run(x,z,0,1),run(x,z,0,-1),run(x,z,1,0),run(x,z,-1,0));
    K.set(k,Math.min(v,14));}
  const c=[];const put=(x,z,k)=>c.push([x,top+1+k,z,id]);
  for(const [k,v] of K){const [x,z]=k.split(',').map(Number);put(x,z,v);
    if(style==='gable'&&v>0){const [ax,az]=alongX?[1,0]:[0,1];if(!has(x+ax,z+az)||!has(x-ax,z-az))for(let j=1;j<=v;j++)c.push([x,top+j,z,gm]);}}
  if(over){const done=new Set();for(const k of mask){const [x,z]=k.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const nx=x+dx,nz=z+dz,nk=nx+','+nz;if(has(nx,nz)||done.has(nk))continue;done.add(nk);
      let v=0;if(style==='gable'){const [ax,az]=alongX?[1,0]:[0,1];for(const s of [1,-1]){const mk=(nx+ax*s)+','+(nz+az*s);if(K.has(mk))v=Math.max(v,K.get(mk));}}put(nx,nz,v);}}}
  let maxK=0;for(const v of K.values())maxK=Math.max(maxK,v);
  return {c,top,maxK,alongX};}
function roofLabel(F){const w=F.box[2]-F.box[0]+1,d=F.box[3]-F.box[1]+1;const shape=F.rect?'':(F.mask.size<w*d?' L/odd shape':'');return `${w} x ${d}${shape}${F.fallback?' (box)':''}`;}
function planPend(){const P=BM.pend;if(!P)return;const R=roofPlan(P.F,BM.roof,BM.rmat,BM.over,BM.rflip);P.cells=effective(R.c);P.R=R;}
function showPend(){const P=BM.pend;if(!P)return;planPend();showGhost(P.cells,false);ghostMat.opacity=.6;
  setCount(`Roof ${roofLabel(P.F)} \u00b7 ${RSN[BM.roof]} \u00b7 on top of wall y${P.R.top} \u00b7 ${P.cells.length} blocks`);$('bmRConf').style.display='flex';updBMBtns();}
function clearPend(){BM.pend=null;const e=$('bmRConf');if(e)e.style.display='none';if($('bmRoofS'))updBMBtns();}
function roofConfirm(){const P=BM.pend;if(!P)return 0;planPend();const cells=P.cells;clearPend();_rHide();if(!cells.length){toast('Roof is already there');return 0;}const n=applyCells(cells,'Roof');toast('Roof placed');return n;}
function roofCancel(){if(!BM.pend)return;clearPend();_rHide();toast('Roof cancelled');}
// footprint for a gesture: tap -> auto room; drag -> rectangle (old behaviour)
function roofFootFor(s,cx,cy){if(!s)return null;const p=planeCell(cx,cy,s.y)||{x:s.x,z:s.z};const r=rectOf(s,{x:p.x,z:p.z});
  if(r[0]===r[2]&&r[1]===r[3])return autoRoom(s.hit);return rectFoot(r,s.y);}
const _rTC=toolCells;toolCells=function(s,cx,cy){if(BM.tool!=='roof')return _rTC(s,cx,cy);const F=roofFootFor(s,cx,cy);if(!F)return [];BM.dims=roofLabel(F)+' '+RSN[BM.roof];return roofPlan(F,BM.roof,BM.rmat,BM.over,BM.rflip).c;};
const _rHide=hideGhost;hideGhost=function(){if(BM.pend&&BM.on&&BM.tool==='roof'){showPend();return;}ghostMat.opacity=.55;_rHide();};
const _rCommit=bmCommit;bmCommit=function(cx,cy){const d=BM.drag;if(BM.tool!=='roof'||!d)return _rCommit(cx,cy);const F=roofFootFor(d.s,cx,cy);
  if(!F){toast(BM.pend?'No room there - still showing the last roof':'Tap inside a room (or drag over it)');return 0;}
  BM.pend={F};planPend();if(!BM.pend.cells.length){clearPend();toast('Roof is already there');return 0;}if(F.fallback)toast('Room has a gap - using its bounding box');return 0;};
const _rSet=setTool;setTool=function(t){clearPend();_rSet(t);};
const _rExit=exitBuild;exitBuild=function(i){clearPend();return _rExit(i);};
const _rUndo=bmUndo;bmUndo=function(){if(BM.pend){roofCancel();return true;}return _rUndo();};
const _rRedo=bmRedo;bmRedo=function(){clearPend();_rHide();return _rRedo();};
function roofSet(k,v){BM[k]=v;updBMBtns();if(BM.pend)showPend();}
(function(){const w=$('bmRoofW');w.innerHTML=`Style <button id="bmRoofS">Gabled</button><button id="bmRoofO">Overhang</button><button id="bmRoofR" title="Turn the ridge">&#10227; Ridge</button>`;
  const cf=document.createElement('div');cf.id='bmRConf';cf.innerHTML=`<button id="bmRYes">&#10004; Place roof</button><button id="bmRNo">&#10006; Cancel</button>`;$('hud').appendChild(cf);
  bindTap($('bmRoofS'),()=>roofSet('roof',RSTYLES[(RSTYLES.indexOf(BM.roof)+1)%3]));bindTap($('bmRoofO'),()=>roofSet('over',!BM.over));bindTap($('bmRoofR'),()=>roofSet('rflip',!BM.rflip));
  bindTap($('bmRYes'),()=>roofConfirm());bindTap($('bmRNo'),()=>roofCancel());
  const st=document.createElement('style');st.textContent=`#bmRConf{display:none;position:absolute;right:calc(66*var(--u));bottom:calc(120*var(--u));gap:calc(10*var(--u))}
#bmRConf button{font-family:inherit;font-weight:bold;font-size:calc(17*var(--u));padding:calc(8*var(--u)) calc(16*var(--u));border-radius:calc(10*var(--u));color:#fff;border:calc(2*var(--u)) solid rgba(255,255,255,.6)}
#bmRYes{background:#2e8a3a}#bmRNo{background:#8a2e2e}#bmRoofO.on{background:#2e8a3a!important}`;document.head.appendChild(st);})();
const _rBtns=updBMBtns;updBMBtns=function(){_rBtns();const s=$('bmRoofS');if(!s)return;s.textContent=RSN[BM.roof];const o=$('bmRoofO');o.textContent=BM.over?'Overhang: On':'Overhang: Off';o.classList.toggle('on',BM.over);
  $('bmRoofR').style.display=BM.roof==='gable'?'':'none';if(BM.tool==='roof')$('bmHint').textContent=BM.pend?'Tap \u2714 Place or \u2716 Cancel \u00b7 change style first':'Tap inside a room \u00b7 or drag over it';};
const _rBack=window.bcBack;window.bcBack=function(){if(BM.on&&BM.pend&&!stack.length){roofCancel();return true;}return _rBack();};window.dhBack=window.bcBack;
Object.assign(window.__bc,{roomFootprint,autoRoom,roofPlan,roofConfirm,roofCancel,BC_VERSION,toolCells:(a,b,c)=>toolCells(a,b,c),bmCommit:(a,b)=>bmCommit(a,b),setTool:t=>setTool(t),bmUndo:()=>bmUndo(),bmRedo:()=>bmRedo()});
updBMBtns();
// ===== v1.7: TNT & Mega TNT, flint & steel, fire, burning, lava damage, dropped items, craft, blast cheats =====
const FLAM=new Uint8Array(256),FLAMFAST=new Uint8Array(256);
for(const k of ['log','planks','dplanks','bplanks','leaves','pineleaves','spruce','bookshelf','hay','crops','banner','fence','doorx','doorz','doorxo','doorzo','bed','chest'])FLAM[BN[k]]=1;
for(let i=0;i<16;i++)FLAM[BN['wool'+i]]=1;
for(const k of ['leaves','pineleaves','hay','crops']){FLAMFAST[BN[k]]=1;}for(let i=0;i<16;i++)FLAMFAST[BN['wool'+i]]=1;
const TNTK=new Uint8Array(256);TNTK[BN.tnt]=1;TNTK[BN.megatnt]=2;
const TX={primed:[],expQ:[],fires:new Map(),hot:new Set(),drops:[],burning:new Set(),shake:0,kb:{x:0,z:0},fireTick:0,hotTick:0,boomT:0,stats:{booms:0,primed:0,destroyed:0,maxPerFrame:0,chain:0,burned:0,dropsBurned:0,ignitions:0}};
G.tx=TX;
const FUSE=4,EXP_PER_FRAME=2,FIRE_MAX=160,DROP_MAX=80,PRIMED_MAX=400;
if(CH.tntR===undefined)CH.tntR=4;
const tntR=kind=>{const r=Math.max(2,Math.min(12,CH.tntR||4));return kind===2?Math.min(16,r*2):r;};
const K3=(x,y,z)=>x+','+y+','+z;
const N6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
// ---------- bulk block edits: one pass, deferred column tops, "soon" (budgeted) remesh of only the touched sections ----------
function bulkSet(cells,urgent){const cols=new Map();let n=0;const mark=urgent?2:3;
  for(const c of cells){const x=c[0],y=c[1],z=c[2],id=c[3];if(y<1||y>=H)continue;const ch=world.chunks.get(ck(x>>4,z>>4));if(!ch)continue;const lx=x&15,lz=z&15,i=(y*CS+lz)*CS+lx;const old=ch.d[i];if(old===id)continue;
    ch.d[i]=id;let ed=world.edits.get(ch.k);if(!ed){ed=new Map();world.edits.set(ch.k,ed);}ed.set(i,id);n++;
    const lo=isLight(old,i),ln=isLight(id,i);if(lo)ch.lights.delete(i);if(ln)ch.lights.add(i);
    let s=cols.get(ch);if(!s){s=new Set();cols.set(ch,s);}s.add(lz*16+lx);
    const rad=(lo||ln)?8:1;
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const nb=dx||dz?world.chunks.get(ck((x>>4)+dx,(z>>4)+dz)):ch;if(!nb)continue;
      if(dx&&!(dx<0?lx<rad:lx>15-rad))continue;if(dz&&!(dz<0?lz<rad:lz>15-rad))continue;
      for(let q=Math.max(0,(y-rad)>>4);q<=Math.min(NSEC-1,(y+rad)>>4);q++)if(nb.dirty[q]!==2)nb.dirty[q]=mark;}}
  // column tops: skylight changes a few blocks below the old/new top, so refresh those sections (low priority)
  for(const [ch,s] of cols)for(const c of s){const t0=ch.top[c];colTop(ch,c&15,c>>4);const t1=ch.top[c];if(t0===t1)continue;
    for(let q=Math.max(0,(Math.min(t0,t1)-7)>>4);q<=Math.min(NSEC-1,Math.max(t0,t1)>>4);q++)if(!ch.dirty[q])ch.dirty[q]=1;}
  return n;}
// ---------- sound: synthesized boom / fuse hiss / sizzle ----------
let noiseBuf=null;
function boomSfx(vol,big){if(!ST.vol)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const t=AC.currentTime;
  if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const len=big?2.2:1.4;const src=AC.createBufferSource();src.buffer=noiseBuf;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(big?900:1400,t);lp.frequency.exponentialRampToValueAtTime(80,t+len);
  const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55*vol*ST.vol,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+len);src.connect(lp);lp.connect(g);g.connect(AC.destination);src.start(t);src.stop(t+len+.05);
  const o=AC.createOscillator(),og=AC.createGain();o.type='sine';o.frequency.setValueAtTime(big?70:95,t);o.frequency.exponentialRampToValueAtTime(28,t+.6);og.gain.setValueAtTime(.6*vol*ST.vol,t);og.gain.exponentialRampToValueAtTime(.001,t+.8);o.connect(og);og.connect(AC.destination);o.start(t);o.stop(t+.85);}catch(e){}}
function hissSfx(){if(!ST.vol)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;if(!noiseBuf)boomSfx(0);if(!noiseBuf)return;const s=AC.createBufferSource();s.buffer=noiseBuf;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=3000;const g=AC.createGain();g.gain.setValueAtTime(.06*ST.vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);s.connect(hp);hp.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+.75);}catch(e){}}
// ---------- primed TNT entities ----------
function tileCanvas(t){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.drawImage(atlas,(t%ATW)*TS,((t/ATW)|0)*TS,16,16,0,0,16,16);const tx=new THREE.CanvasTexture(c);tx.magFilter=tx.minFilter=THREE.NearestFilter;return tx;}
const tntMats={};function tntMat(kind,flash){const k=kind+'_'+flash;if(tntMats[k])return tntMats[k];const b=B[kind===2?BN.megatnt:BN.tnt];
  const m=b.tx.map(t=>new THREE.MeshLambertMaterial({map:tileCanvas(t),emissive:flash?0xffffff:0x000000,emissiveIntensity:flash?.85:0}));return tntMats[k]=m;}
const tntGeo=new THREE.BoxGeometry(.98,.98,.98);
function primeTNT(x,y,z,fuse,kind,silent){const b=getB(x,y,z);kind=kind||TNTK[b]||1;if(TNTK[b]){if(silent)bulkSet([[x,y,z,0]],false);else setB(x,y,z,0);}
  if(TX.primed.length>=PRIMED_MAX){TX.expQ.push({x:x+.5,y:y+.5,z:z+.5,kind});return null;}
  const m=new THREE.Mesh(tntGeo,tntMat(kind,0));m.position.set(x+.5,y+.49,z+.5);scene.add(m);
  const e={x:x+.5,y:y,z:z+.5,vx:(Math.random()-.5)*.6,vy:silent?0:2.2,vz:(Math.random()-.5)*.6,ground:false,fuse:fuse===undefined?FUSE:fuse,fuse0:fuse===undefined?FUSE:fuse,kind,m,flash:0};TX.primed.push(e);TX.stats.primed++;
  if(!silent)hissSfx();return e;}
function updPrimed(dt){for(let i=TX.primed.length-1;i>=0;i--){const e=TX.primed[i];e.fuse-=dt;
    e.vy=Math.max(e.vy-24*dt,-30);moveEnt(e,dt,.49,.98,false);if(e.ground){e.vx*=.8;e.vz*=.8;}
    if(touchLiq(e,.45,.9,1)){e.vy=Math.min(e.vy+30*dt,2);}
    // flash: slow at first, faster near the end
    const per=e.fuse>1.2?.5:e.fuse>.5?.22:.1;const fl=Math.floor(e.fuse/per)%2===0?1:0;if(fl!==e.flash){e.flash=fl;e.m.material=tntMat(e.kind,fl);}
    const sw=e.fuse<.6?1+(.6-e.fuse)*.35:1;e.m.scale.setScalar(sw);e.m.position.set(e.x,e.y+.49,e.z);
    if(e.fuse<=0){scene.remove(e.m);TX.primed.splice(i,1);TX.expQ.push({x:e.x,y:e.y+.49,z:e.z,kind:e.kind});}}}
// ---------- particles ----------
const flashTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(.35,'rgba(255,190,60,.9)');gr.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const flashMat=new THREE.SpriteMaterial({map:flashTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');for(let i=0;i<7;i++){const x=20+Math.random()*24,y=20+Math.random()*24,r=12+Math.random()*10;const gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);}return new THREE.CanvasTexture(c);})();
const darkSmokeMat=new THREE.SpriteMaterial({map:smokeTex,color:0x6a6a6a,transparent:true,opacity:.85,depthWrite:false});
const emberMat=new THREE.MeshBasicMaterial({color:0xffa030});const emberMat2=new THREE.MeshBasicMaterial({color:0xff5010});
const flashes=[];
function boomFx(x,y,z,R){const sp=new THREE.Sprite(flashMat);sp.position.set(x,y,z);sp.scale.setScalar(R*1.2);sp.userData={t:.35,R};sp.renderOrder=25;scene.add(sp);flashes.push(sp);
  if(parts.length<260){const n=Math.min(14,4+R*2);for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.random()*R*.7;const s=popSprite(darkSmokeMat,x+Math.cos(a)*r,y+(Math.random()-.3)*R*.6,z+Math.sin(a)*r,.9+Math.random()*R*.35,1.4+Math.random(),1.2+Math.random()*1.5);s.userData.vx=Math.cos(a)*1.5;s.userData.vz=Math.sin(a)*1.5;}}
  if(brk.length<220){const n=Math.min(18,6+R*2);for(let i=0;i<n;i++){const m=new THREE.Mesh(brkGeo,Math.random()<.5?emberMat:emberMat2);m.position.set(x,y,z);const a=Math.random()*6.283,v=4+Math.random()*R*2;m.userData={vx:Math.cos(a)*v,vy:3+Math.random()*7,vz:Math.sin(a)*v,t:.5+Math.random()*.5};scene.add(m);brk.push(m);}}}
function updFlashes(dt){for(let i=flashes.length-1;i>=0;i--){const s=flashes[i],u=s.userData;u.t-=dt;const k=1-u.t/.35;s.scale.setScalar(u.R*(1.2+k*1.6));s.material.opacity=Math.max(0,u.t/.35);if(u.t<=0){scene.remove(s);flashes.splice(i,1);}}}
// ---------- dropped items ----------
const dropMats={};function dropMat(id){return dropMats[id]||(dropMats[id]=new THREE.SpriteMaterial({map:itemTexture(id),transparent:true,alphaTest:.4,depthWrite:true}));}
function spawnDrop(id,x,y,z,vx,vy,vz){if(!id||!B[id])return null;if(TX.drops.length>=DROP_MAX)removeDrop(0);/* oldest goes first */const sp=new THREE.Sprite(dropMat(id));sp.scale.setScalar(.38);sp.position.set(x,y,z);scene.add(sp);
  const d={id,x,y,z,vx:vx||0,vy:vy||0,vz:vz||0,ground:false,t:0,sp,ph:Math.random()*6};TX.drops.push(d);return d;}
function removeDrop(i){const d=TX.drops[i];scene.remove(d.sp);TX.drops.splice(i,1);}
function updDrops(dt){const p=G.p;for(let i=TX.drops.length-1;i>=0;i--){const d=TX.drops[i];d.t+=dt;
    d.vy=Math.max(d.vy-20*dt,-25);moveEnt(d,dt,.12,.25,false);if(d.ground){d.vx*=Math.exp(-6*dt);d.vz*=Math.exp(-6*dt);}
    if(touchLiq(d,.12,.25,2)||getB(Math.floor(d.x),Math.floor(d.y+.1),Math.floor(d.z))===BN.fire){puff(d.x,d.y+.2,d.z,3);TX.stats.dropsBurned++;removeDrop(i);continue;}  // lava and fire destroy dropped items
    if(d.t>240||d.y<1){removeDrop(i);continue;}
    if(d.t>.6&&!G.dead&&Math.hypot(d.x-p.x,d.z-p.z)<1.5&&d.y>p.y-1.2&&d.y<p.y+2){if(!infSupplies())addInv(d.id,1);floatCoin('+1 '+B[d.id].name);sfx('click');removeDrop(i);updHotbar();continue;}
    d.sp.position.set(d.x,d.y+.2+Math.sin(d.t*3+d.ph)*.05,d.z);}}
function dropFor(b){const bd=B[b];if(!bd||bd.nodrop)return 0;if(bd.door)return BN.doorx;if(b===BN.gravel&&Math.random()<.1)return BN.flint;return bd.drop?BN[bd.drop]:b;}
// ---------- explosions ----------
function explode(x,y,z,kind){const R=tntR(kind);TX.stats.booms++;const cx=Math.floor(x),cy=Math.floor(y),cz=Math.floor(z),RT=R+2,Ri=Math.ceil(RT);   // TNT reacts a bit further out than blocks break
  const cells=[];let chained=0;
  for(let dy=-Ri;dy<=Ri;dy++)for(let dz=-Ri;dz<=Ri;dz++)for(let dx=-Ri;dx<=Ri;dx++){const d=Math.hypot(dx,dy,dz);if(d>RT)continue;
    // falloff: the core always goes, the rim is ragged
    const bx=cx+dx,by=cy+dy,bz=cz+dz;if(by<1||by>=H)continue;const b=getB(bx,by,bz);if(b<=0)continue;const bd=B[b];
    if(!TNTK[b]&&d>R)continue;if(!TNTK[b]&&d>R*.6&&Math.random()>1-(d-R*.6)/(R*.4)*.85)continue;   // TNT anywhere in the radius always chains
    if(LIQ[b])continue;if(bd.unbreak&&!CH.bedrock)continue;if(bd.hard>=4&&!bd.unbreak)continue;   // obsidian & voidstone survive
    if(TNTK[b]){const e=primeTNT(bx,by,bz,.35+Math.random()*.9,TNTK[b],true);if(e)e.fresh=1;chained++;continue;}
    cells.push([bx,by,bz,0]);
    if(b!==BN.fire&&Math.random()<.22){const id=dropFor(b);if(id){const a=Math.random()*6.283,v=2+Math.random()*4;spawnDrop(id,bx+.5,by+.3,bz+.5,Math.cos(a)*v,3+Math.random()*4,Math.sin(a)*v);}}}
  TX.stats.chain+=chained;TX.stats.destroyed+=bulkSet(cells,false);
  // break particles for a few of the blocks (cheap)
  // entities: damage + knockback (God Mode / Build Mode still block damage through hurt())
  const hitR=R*2;const p=G.p;
  {const ex=p.x-x,ey=p.y+.9-y,ez=p.z-z,d=Math.hypot(ex,ey,ez);if(d<hitR&&!G.dead){const f=1-d/hitR;const n=d||1;const dmg=Math.max(1,Math.round(f*R*4));hurt(dmg,'You were blown up by TNT');
    const kb=f*(10+R*1.5);TX.kb.x+=ex/n*kb;TX.kb.z+=ez/n*kb;p.vy=Math.max(p.vy,f*10+2);G.p.fallY=Math.max(G.p.fallY,G.p.y);G.lastBlast={dmg,f};}}
  for(const m of G.mobs.slice()){const ex=m.x-x,ey=m.y+m.h/2-y,ez=m.z-z,d=Math.hypot(ex,ey,ez);if(d>=hitR)continue;const f=1-d/hitR,n=Math.hypot(ex,ez)||1;dmgMob(m,Math.max(1,Math.round(f*R*5)),f*14,[ex/n,0,ez/n]);if(G.mobs.includes(m))m.vy=f*10+3;}
  for(const a of G.animals.slice()){if(a.pet)continue;const ex=a.x-x,ey=a.y+a.h/2-y,ez=a.z-z,d=Math.hypot(ex,ey,ez);if(d>=hitR)continue;const f=1-d/hitR,n=Math.hypot(ex,ez)||1;hitAnimal(a,Math.max(1,Math.round(f*R*5)),f*14,[ex/n,0,ez/n]);if(G.animals.includes(a))a.vy=f*10+3;}
  for(const nn of (G.npcs||[]).slice()){const ex=nn.x-x,ey=nn.y+1-y,ez=nn.z-z,d=Math.hypot(ex,ey,ez);if(d>=hitR)continue;const f=1-d/hitR,n=Math.hypot(ex,ez)||1;hitNPC(nn,Math.max(1,Math.round(f*R*5)),[ex/n,0,ez/n]);}
  // TNT that this blast just lit stays put (so chains keep going); older lit TNT gets a small shove
  for(const e of TX.primed){if(e.fresh){e.fresh=0;continue;}const ex=e.x-x,ey=e.y-y,ez=e.z-z,d=Math.hypot(ex,ey,ez);if(d>=hitR||d<.01)continue;const f=1-d/hitR;e.vx+=ex/d*f*2.5;e.vz+=ez/d*f*2.5;e.vy+=f*3;}
  for(const dr of TX.drops){const ex=dr.x-x,ez=dr.z-z,d=Math.hypot(ex,dr.y-y,ez);if(d>=hitR||d<.01)continue;const f=1-d/hitR;dr.vx+=ex/d*f*6;dr.vz+=ez/d*f*6;dr.vy+=f*5;}
  // feedback
  const pd=Math.hypot(p.x-x,p.y+1.6-y,p.z-z);const near=Math.max(0,1-pd/(R*10+20));
  TX.shake=Math.min(1.6,TX.shake+near*(.5+R*.12));TX.flash=Math.min(1,(TX.flash||0)+near*.8);
  boomFx(x,y,z,R);if(TX.boomT<=0){boomSfx(Math.min(1,.25+near),kind===2);TX.boomT=.06;}
  return cells.length;}
function updExplosions(){let n=0;const t0=performance.now();while(TX.expQ.length&&n<EXP_PER_FRAME&&(n===0||performance.now()-t0<6)){const e=TX.expQ.shift();explode(e.x,e.y,e.z,e.kind);n++;}if(n)TX.stats.maxExpMs=Math.max(TX.stats.maxExpMs||0,Math.round(performance.now()-t0));TX.stats.maxPerFrame=Math.max(TX.stats.maxPerFrame,n);}
// ---------- fire ----------
function canHoldFire(x,y,z){if(getB(x,y,z)!==0)return false;if(SOLID[getB(x,y-1,z)]===1)return true;for(const [dx,dy,dz] of N6)if(FLAM[getB(x+dx,y+dy,z+dz)])return true;return false;}
function setFire(x,y,z,force){if(TX.fires.size>=FIRE_MAX)return false;if(!force&&!canHoldFire(x,y,z))return false;if(getB(x,y,z)!==0)return false;if(y<1||y>=H)return false;
  bulkSet([[x,y,z,BN.fire]],true);TX.fires.set(K3(x,y,z),{x,y,z,age:0,life:5+Math.random()*7});TX.stats.ignitions++;return true;}
function igniteNear(x,y,z){ // put fire in an air cell touching block (x,y,z), top first
  for(const [dx,dy,dz] of [[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,-1,0]])if(getB(x+dx,y+dy,z+dz)===0&&setFire(x+dx,y+dy,z+dz))return true;return false;}
function updFire(dt){TX.fireTick-=dt;if(TX.fireTick>0)return;TX.fireTick=.4;if(!TX.fires.size)return;const ch=[],nf=[];const spread=!CH.nofire;const room=()=>TX.fires.size+nf.length<FIRE_MAX;
  for(const [k,f] of TX.fires){if(getB(f.x,f.y,f.z)!==BN.fire){TX.fires.delete(k);continue;}f.age+=.4;
    let wet=false,fuel=0;for(const [dx,dy,dz] of N6){const nb=getB(f.x+dx,f.y+dy,f.z+dz);if(nb===BN.water)wet=true;if(FLAM[nb])fuel++;
      if(TNTK[nb]){primeTNT(f.x+dx,f.y+dy,f.z+dz,FUSE,TNTK[nb]);}
      else if(FLAM[nb]&&spread&&Math.random()<(FLAMFAST[nb]?.22:.09)){const bx=f.x+dx,by=f.y+dy,bz=f.z+dz;TX.stats.burned++;
        if(B[nb].door){for(const yy of [by-1,by+1]){const v=getB(bx,yy,bz);if(v>0&&B[v].door)ch.push([bx,yy,bz,0]);}}
        if(Math.random()<.55&&room()){ch.push([bx,by,bz,BN.fire]);nf.push({x:bx,y:by,z:bz,age:0,life:4+Math.random()*6});}else ch.push([bx,by,bz,0]);}}
    if(wet||f.age>f.life||(!fuel&&f.age>2.5&&SOLID[getB(f.x,f.y-1,f.z)]!==1)){ch.push([f.x,f.y,f.z,0]);TX.fires.delete(k);continue;}
    if(fuel)f.life=Math.max(f.life,f.age+1.5);   // keeps burning while there is fuel next to it
    if(spread&&Math.random()<.18){const x=f.x+((Math.random()*3)|0)-1,y=f.y+((Math.random()*4)|0)-1,z=f.z+((Math.random()*3)|0)-1;
      if(getB(x,y,z)===0&&room()&&!nf.some(q=>q.x===x&&q.y===y&&q.z===z)){let ok=false;for(const [dx,dy,dz] of N6)if(FLAM[getB(x+dx,y+dy,z+dz)]){ok=true;break;}if(ok){ch.push([x,y,z,BN.fire]);nf.push({x,y,z,age:0,life:4+Math.random()*6});}}}}
  if(ch.length)bulkSet(ch,false);for(const f of nf)if(getB(f.x,f.y,f.z)===BN.fire)TX.fires.set(K3(f.x,f.y,f.z),f);}
// lava next to flammable blocks or TNT: "hot" lava cells are checked twice a second
function lavaCheckAround(x,y,z){for(const [dx,dy,dz] of N6){const xx=x+dx,yy=y+dy,zz=z+dz;if(getB(xx,yy,zz)===BN.lava)TX.hot.add(K3(xx,yy,zz));}}
function updHot(dt){TX.hotTick-=dt;if(TX.hotTick>0)return;TX.hotTick=.5;let n=0;
  for(const k of TX.hot){if(++n>400)break;const [x,y,z]=k.split(',').map(Number);if(getB(x,y,z)!==BN.lava){TX.hot.delete(k);continue;}let any=false;
    for(let dy=0;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy&&!dz)continue;const b=getB(x+dx,y+dy,z+dz);
      if(TNTK[b]){primeTNT(x+dx,y+dy,z+dz,FUSE,TNTK[b]);any=true;}
      else if(FLAM[b]){any=true;if(!CH.nofire&&Math.random()<.3)igniteNear(x+dx,y+dy,z+dz);}}
    if(!any)TX.hot.delete(k);}}
const _setB17=setB;setB=function(x,y,z,id){const r=_setB17(x,y,z,id);if(r){
    if(id===BN.lava)TX.hot.add(K3(x,y,z));else if(FLAM[id]||TNTK[id])lavaCheckAround(x,y,z);
    if(TNTK[id]){for(const [dx,dy,dz] of N6)if(getB(x+dx,y+dy,z+dz)===BN.fire){primeTNT(x,y,z,FUSE,TNTK[id]);break;}}}
  return r;};
const _loadChunk17=loadChunk;loadChunk=function(cx,cz){const ch=_loadChunk17(cx,cz);const ed=world.edits.get(ch.k);if(ed)for(const [i,id] of ed){if(id!==BN.lava&&id!==BN.fire)continue;const x=cx*16+(i&15),z=cz*16+((i>>4)&15),y=(i/256)|0;
    if(id===BN.lava)TX.hot.add(K3(x,y,z));else TX.fires.set(K3(x,y,z),{x,y,z,age:0,life:3+Math.random()*4});}return ch;};
// ---------- burning: player, mobs, animals ----------
const fireSpriteMat=new THREE.SpriteMaterial({map:tileCanvas(TEX.fire),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
function setFlame(e,on){if(on&&!e.flame){e.flame=new THREE.Sprite(fireSpriteMat);scene.add(e.flame);TX.burning.add(e);}else if(!on&&e.flame){scene.remove(e.flame);e.flame=null;TX.burning.delete(e);}}
function envHurt(n,why){G.envDmg=1;try{hurt(n,why,'fire');}finally{G.envDmg=0;}}
function burnEnt(e,dt,kind,fireproof){const w=kind==='mob'?.3:Math.min(.45,e.w||.3);const lava=touchLiq(e,w,e.h,2),fire=touchBlock(e,w,e.h,BN.fire),wet=touchLiq(e,w,Math.min(1,e.h),1);
  if((lava||fire)&&!fireproof)e.fireT=Math.max(e.fireT||0,lava?6:4);if(wet&&!lava)e.fireT=0;
  let dmg=0;if(lava){e.lavaT=(e.lavaT||0)-dt;if(e.lavaT<=0){e.lavaT=.5;dmg+=fireproof?2:4;}}else e.lavaT=0;
  if(e.fireT>0){e.fireT-=dt;e.burnT=(e.burnT||0)-dt;if(e.burnT<=0){e.burnT=1;dmg+=1;}}
  setFlame(e,e.fireT>0);if(e.flame){e.flame.position.set(e.x,e.y+e.h*.5,e.z);e.flame.scale.set(Math.max(.7,w*2.6),e.h*1.1,1);}
  if(!dmg)return;e.hp-=dmg;e.hurtT=.25;popText(e.x,e.y+e.h+.2,e.z,'-'+dmg,'#ff9030');
  if(kind==='animal'){e.panicT=4;if(e.hp<=0){TX.stats.animalsBurned=(TX.stats.animalsBurned||0)+1;
      // cooked drops (they burn up again if they land in lava)
      for(const [k,mn,mx] of e.D.drop){let id=BN[k];if(B[id].cooksTo)id=BN[B[id].cooksTo];const c=mn+(Math.random()*(mx-mn+1)|0);for(let i=0;i<c;i++)spawnDrop(id,e.x,e.y+.5,e.z,(Math.random()-.5)*2,3,(Math.random()-.5)*2);}
      ashFx(e,{kind:'animal'});setFlame(e,false);removeAnimal(e);}}
  else if(e.hp<=0){TX.stats.mobsBurned=(TX.stats.mobsBurned||0)+1;ashFx(e,{kind:'mob'});setFlame(e,false);killMob(e,false);}}
function updBurning(dt){for(const m of G.mobs.slice()){if(m.type==='imp')continue;burnEnt(m,dt,'mob');}   // imps are from Hell: fireproof
  for(const n of (G.npcs||[]).slice())burnNPC(n,dt);
  for(const a of G.animals.slice()){if(a.pet){a.fireT=0;setFlame(a,false);continue;}burnEnt(a,dt,'animal');}
  for(const e of [...TX.burning])if(!(G.mobs.includes(e)||G.animals.includes(e)))setFlame(e,false);
  // player
  const p=G.p;const safe=CH.god||G.dead;
  if(!safe&&touchBlock(p,.3,1.8,BN.fire)){G.fireT=Math.max(G.fireT||0,4);G.inFireT=(G.inFireT||0)-dt;if(G.inFireT<=0){G.inFireT=.5;envHurt(1,'You burned to death');}}
  if(safe)G.fireT=0;
  if(G.fireT>0){if(touchLiq(p,.3,1.4,1)){G.fireT=0;toast('Phew! The water put the fire out');puff(p.x,p.y+1,p.z,6);}
    else{G.fireT-=dt;G.burnT=(G.burnT||0)-dt;if(G.burnT<=0){G.burnT=1;envHurt(1,'You burned to death');}if(!G.fireWarned){G.fireWarned=1;toast("You're on fire! Jump in water to put it out");}}}
  else G.fireWarned=0;
  const fx=$('fireFx');if(fx){const v=G.fireT>0?Math.min(1,.55+G.fireT*.1):0;if(fx._v!==v){fx._v=v;fx.style.opacity=v;}}}
// ---------- player knockback + camera shake ----------
const _ups17=updatePlayerStep;updatePlayerStep=function(dt){_ups17(dt);const k=TX.kb,p=G.p;if(G.dead){k.x=k.z=0;return;}
  if(Math.abs(k.x)>.05||Math.abs(k.z)>.05){const e={x:p.x,y:p.y+.01,z:p.z,vx:k.x,vy:0,vz:k.z};moveEnt(e,dt,.3,1.78,noclipOn());p.x=e.x;p.z=e.z;const f=Math.exp(-(p.ground?7:2.2)*dt);k.x*=f;k.z*=f;camera.position.set(p.x,p.y+1.62,p.z);}else k.x=k.z=0;};
const _up17=updatePlayer;updatePlayer=function(dt){_up17(dt);if(TX.shake>0.002&&!(typeof BM!=='undefined'&&BM.on)){const s=TX.shake;camera.position.x+=(Math.random()-.5)*s*.35;camera.position.y+=(Math.random()-.5)*s*.35;camera.position.z+=(Math.random()-.5)*s*.35;camera.rotation.z=(Math.random()-.5)*s*.06;}else camera.rotation.z=0;};
// ---------- flint & steel, crafting, kill drops ----------
const _useItem17=useItem;useItem=function(id){const b=B[id];if(b&&b.key==='flint_steel'&&invCount(id)>0){const t=raycast(6);G.swingT=.3;
    if(!t){toast('Aim at TNT or a block to light it');return true;}
    if(TNTK[t.b]){primeTNT(t.x,t.y,t.z,FUSE,TNTK[t.b]);G.lit=(G.lit||0)+1;toast(t.b===BN.megatnt?'MEGA TNT lit! RUN!':'TNT lit! Run!');return true;}
    const x=t.x+t.n[0],y=t.y+t.n[1],z=t.z+t.n[2];if(getB(x,y,z)===0&&setFire(x,y,z,true)){sfx('door');G.lit=(G.lit||0)+1;}else toast("Can't light a fire there");return true;}
  if(b&&b.key==='flint'&&invCount(id)>0){toast('Flint: craft Flint & Steel (Iron Ore + Flint) in the Shop');return true;}
  if(b&&b.key==='gunpowder'&&invCount(id)>0){toast('Gunpowder: craft TNT (5 Gunpowder + 4 Sand) in the Shop');return true;}
  return _useItem17(id);};
const _breakAt17=breakAt;breakAt=function(t){const b=getB(t.x,t.y,t.z);const r=_breakAt17(t);
  if(r&&b===BN.gravel&&Math.random()<.1&&!infSupplies()){G.inv[BN.gravel]=Math.max(0,(G.inv[BN.gravel]||0)-1);addInv(BN.flint,1);floatCoin('+1 Flint');G.flintFound=(G.flintFound||0)+1;updHotbar();}
  if(r&&b===BN.fire)TX.fires.delete(K3(t.x,t.y,t.z));return r;};
const _killMob17=killMob;killMob=function(m,reward){_killMob17(m,reward);if(reward&&Math.random()<.35){addInv(BN.gunpowder,1);floatCoin('+1 Gunpowder');}};
const RECIPES=[{out:'flint_steel',n:1,need:[['iron_ore',1],['flint',1]]},{out:'tnt',n:1,need:[['gunpowder',5],['sand',4]]},{out:'megatnt',n:1,need:[['tnt',4],['gunpowder',1]]}];
function canCraft(r){return r.need.every(([k,c])=>invCount(BN[k])>=c);}
function craft(r){if(!canCraft(r)){toast('Missing: '+r.need.filter(([k,c])=>invCount(BN[k])<c).map(([k,c])=>c+' '+B[BN[k]].name).join(', '));return false;}
  if(!infSupplies())for(const [k,c] of r.need)G.inv[BN[k]]-=c;addInv(BN[r.out],r.n);sfx('buy');toast('Crafted '+B[BN[r.out]].name);updHotbar();return true;}
const _renderShop17=renderShop;renderShop=function(){_renderShop17();const L=$('shopList');const first=L.firstChild;
  const box=document.createElement('div');const sec=t=>{const d=document.createElement('div');d.className='sec';d.textContent=t;box.appendChild(d);};
  sec('Craft (TNT & fire)');let g=document.createElement('div');g.className='shgrid';box.appendChild(g);
  for(const r of RECIPES){const id=BN[r.out];const row=document.createElement('div');row.className='shrow';const ok=canCraft(r);
    row.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(B[id].name)} <small>${r.need.map(([k,c])=>c+' '+esc(B[BN[k]].name)).join(' + ')}</small></div><button class="btn sm ${ok?'green':''}" data-craft="${r.out}">Craft</button>`;
    bindTap(row.querySelector('button'),()=>{craft(r);renderShop();});g.appendChild(row);}
  sec('TNT & fire');g=document.createElement('div');g.className='shgrid';box.appendChild(g);
  for(const [k,q] of [['tnt',4],['megatnt',1],['flint_steel',1],['flint',8],['gunpowder',8]]){const id=BN[k],bd=B[id],pr=bd.price*q;const row=document.createElement('div');row.className='shrow';const c=invCount(id);
    row.innerHTML=`<div class="ic" style="background-image:url(${blockIcon(id)})"></div><div class="cn">${esc(bd.name)}${q>1?' x'+q:''} <small>have ${c===Infinity?'\u221e':c}</small></div><button class="btn sm gold">$${pr.toLocaleString()}</button>`;
    bindTap(row.querySelector('button'),()=>{if(!spend(pr)){toast('Not enough coins');return;}addInv(id,q);sfx('buy');toast('Bought '+(q>1?q+' ':'')+bd.name);renderShop();updHotbar();});g.appendChild(row);}
  L.insertBefore(box,first);};
// ---------- $ CHEATS: blast size slider, TNT kit, fire spread ----------
function tntKit(){for(const [k,n] of [['tnt',64],['megatnt',8],['flint_steel',1],['flint',16],['gunpowder',16],['bucket_l',1]])addInv(BN[k],n);
  const want=[BN.tnt,BN.flint_steel,BN.megatnt,BN.bucket_l];for(let i=0;i<want.length;i++){if(G.hot.indexOf(want[i])<0)G.hot[(G.sel+i)%9]=want[i];}G.sel=G.hot.indexOf(BN.tnt);updHotbar();toast('TNT kit: 64 TNT, 8 Mega TNT, Flint & Steel, Lava Bucket');}
const _renderCheats17=renderCheats;renderCheats=function(){_renderCheats17();const L=$('cheatList');const ingame=G.mode==='play';
  const r=document.createElement('div');r.className='chrow';r.id='tntSlider';
  r.innerHTML=`<div class="cn">TNT blast size<small>Normal 4, Mega x2 (${tntR(2)})</small></div><button class="btn sm" data-d="-1">&#9664;</button><input type="range" min="2" max="12" step="1" value="${CH.tntR}" style="width:5.5em"><button class="btn sm" data-d="1">&#9654;</button><b style="min-width:2em;text-align:center">${CH.tntR}</b>`;
  const setR=v=>{CH.tntR=Math.max(2,Math.min(12,v|0));saveSettings();renderCheats();};
  r.querySelectorAll('button').forEach(b=>bindTap(b,()=>setR(CH.tntR+(+b.dataset.d))));const inp=r.querySelector('input');inp.addEventListener('pointerdown',e=>e.stopPropagation());inp.addEventListener('change',()=>setR(+inp.value));
  L.insertBefore(r,L.firstChild);
  const f=document.createElement('div');f.className='chrow';f.innerHTML=`<div class="cn">No Fire Spread<small>Fire still burns you, but never spreads to wood, leaves or wool</small></div><button class="tog ${CH.nofire?'on':''}">${CH.nofire?'ON':'OFF'}</button>`;
  bindTap(f.querySelector('button'),()=>{CH.nofire=!CH.nofire;saveSettings();renderCheats();toast('No Fire Spread '+(CH.nofire?'ON':'OFF'));});L.insertBefore(f,r.nextSibling);
  const k=document.createElement('div');k.className='chrow';k.innerHTML=`<div class="cn">TNT Kit<small>${ingame?'64 TNT, 8 Mega TNT, Flint & Steel, flint, gunpowder and a Lava Bucket, put in your hotbar':'Start a world to use this'}</small></div><button class="btn gold sm" data-c="tntkit" ${ingame?'':'disabled'}>GO</button>`;
  bindTap(k.querySelector('button'),()=>{if(G.mode==='play')tntKit();});L.insertBefore(k,f.nextSibling);};

// ---------- v1.7.1: townspeople, demons and guards burn in lava/fire too (peaceful ones respawn later, like killed guards) ----------
function burnNPC(n,dt){if(!n.g.visible&&Math.hypot(n.x-G.p.x,n.z-G.p.z)>40)return;const lava=touchLiq(n,.3,n.h,2),fire=touchBlock(n,.3,n.h,BN.fire);const hell=n.role==='demon'||n.role==='hleader'||n.role==='hqueen';
  if((lava||fire)&&!hell)n.fireT=Math.max(n.fireT||0,lava?6:4);if(touchLiq(n,.3,1,1))n.fireT=0;let dmg=0;
  if(lava){n.lavaT=(n.lavaT||0)-dt;if(n.lavaT<=0){n.lavaT=.5;dmg+=hell?2:4;}}else n.lavaT=0;
  if(n.fireT>0){n.fireT-=dt;n.burnT=(n.burnT||0)-dt;if(n.burnT<=0){n.burnT=1;dmg+=1;}}
  setFlame(n,n.fireT>0);if(n.flame){n.flame.position.set(n.x,n.y+n.h*.5,n.z);n.flame.scale.set(.9,n.h*1.1,1);}
  if(!dmg)return;if(n.burnHp===undefined)n.burnHp=Math.min(n.hp,n.role==='guard'||hell?20:12);n.burnHp-=dmg;n.hurtT=.25;popText(n.x,n.y+n.h+.2,n.z,'-'+dmg,'#ff9030');
  if(n.burnHp<=0){TX.stats.npcsBurned=(TX.stats.npcsBurned||0)+1;ashFx(n,{kind:'npc'});setFlame(n,false);if(n.slot)n.slot.dead=performance.now()/1000;removeNPC(n);}}
// health bar feedback: hearts shake, red/orange flash, floating damage number (hurt sound is in hurt())
function hurtFx(n,kind){const h=$('hearts');if(h){h.classList.remove('hit');void h.offsetWidth;h.classList.add('hit');}if(kind==='fire'){const f=$('lavaFx');if(f){f.style.opacity=.7;}}
  const e=document.createElement('div');e.className='floatc dmgn';e.textContent='-'+(Math.round(n*10)/10);document.getElementById('hud').appendChild(e);setTimeout(()=>e.remove(),900);}
// natural lava (Hell lakes, demon moats, saves from before 1.7) next to wood/TNT near the player: sample a few cells a second
let lavaScanT=0;function scanLavaNear(dt){lavaScanT-=dt;if(lavaScanT>0)return;lavaScanT=.5;const p=G.p,px=Math.floor(p.x),py=Math.floor(p.y),pz=Math.floor(p.z);
  for(let i=0;i<400;i++){const x=px+((Math.random()*25)|0)-12,y=py+((Math.random()*13)|0)-6,z=pz+((Math.random()*25)|0)-12;if(getB(x,y,z)===BN.lava){for(const [dx,dy,dz] of N6){const b=getB(x+dx,y+dy,z+dz);if(FLAM[b]||TNTK[b]){TX.hot.add(K3(x,y,z));break;}}}}}
const _upd17b=upd17;upd17=function(dt){_upd17b(dt);scanLavaNear(dt);};
Object.assign(window.__bc,{burnNPC,hurtFx,envHurt,hurt:(n,w,k)=>hurt(n,w,k)});
// ---------- v1.7.1: burn to ash (cartoony, no gore) ----------
// Anyone killed by lava/fire glows orange and flickers (~1.2 s), darkens to charcoal, then crumbles into drifting ash + a small ash pile.
// Hard caps for phones: 6 bodies crumbling at once, 160 ash specks (ring buffer, one draw call), 8 ash piles.
const ASH={list:[],piles:[],MAX:6,PMAX:160,PILES:8,dirty:false};
const ashGeo=new THREE.BufferGeometry(),ashPos=new Float32Array(ASH.PMAX*3),ashCol=new Float32Array(ASH.PMAX*3),ashV=[];
for(let i=0;i<ASH.PMAX;i++){ashV.push({t:0,life:1,vx:0,vy:0,vz:0});ashPos[i*3+1]=-999;}
ashGeo.setAttribute('position',new THREE.BufferAttribute(ashPos,3));ashGeo.setAttribute('color',new THREE.BufferAttribute(ashCol,3));
const ashPts=new THREE.Points(ashGeo,new THREE.PointsMaterial({size:.24,map:smokeTex,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,alphaTest:.05}));ashPts.frustumCulled=false;scene.add(ashPts);
let ashNext=0;
function ashSpeck(x,y,z,up){const i=ashNext;ashNext=(ashNext+1)%ASH.PMAX;const v=ashV[i];v.t=v.life=1.3+Math.random()*1.3;v.vx=(Math.random()-.5)*.9;v.vy=(up||.6)+Math.random()*1.1;v.vz=(Math.random()-.5)*.9;
  ashPos[i*3]=x;ashPos[i*3+1]=y;ashPos[i*3+2]=z;const g=Math.random()<.55?.1+Math.random()*.12:.38+Math.random()*.25;ashCol[i*3]=g;ashCol[i*3+1]=g*.96;ashCol[i*3+2]=g*.93;ASH.dirty=true;TX.stats.ashSpecks=(TX.stats.ashSpecks||0)+1;}
function updAshSpecks(dt){let live=0;for(let i=0;i<ASH.PMAX;i++){const v=ashV[i];if(v.t<=0)continue;v.t-=dt;if(v.t<=0){ashPos[i*3+1]=-999;continue;}live++;
    v.vx+=(Math.random()-.5)*dt*2;v.vz+=(Math.random()-.5)*dt*2;v.vy*=1-dt*.6;ashPos[i*3]+=v.vx*dt;ashPos[i*3+1]+=v.vy*dt;ashPos[i*3+2]+=v.vz*dt;}
  if(live||ASH.dirty){ashGeo.attributes.position.needsUpdate=true;ashGeo.attributes.color.needsUpdate=true;ASH.dirty=live>0;}ASH.live=live;}
const pileGeo=new THREE.CylinderGeometry(.18,.42,.16,7);
function ashPile(x,y,z){if(ASH.piles.length>=ASH.PILES){const o=ASH.piles.shift();scene.remove(o);o.material.dispose();}
  const m=new THREE.Mesh(pileGeo,new THREE.MeshLambertMaterial({color:0x3b3734,transparent:true,opacity:1}));m.position.set(x,y+.07,z);m.rotation.y=Math.random()*3;m.userData.t=7;scene.add(m);ASH.piles.push(m);}
function sizzleSfx(){if(!ST.vol)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!noiseBuf)boomSfx(0);if(!noiseBuf)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=4200;bp.Q.value=.8;const g=AC.createGain();g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.14*ST.vol,t+.08);
  for(let k=1;k<10;k++)g.gain.setValueAtTime((.05+Math.random()*.1)*ST.vol,t+k*.12);g.gain.exponentialRampToValueAtTime(.001,t+1.4);s.connect(bp);bp.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+1.45);TX.stats.sizzles=(TX.stats.sizzles||0)+1;}catch(e){}}
function whooshSfx(){if(!ST.vol)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!noiseBuf)boomSfx(0);if(!noiseBuf)return;const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(2200,t+.35);lp.frequency.exponentialRampToValueAtTime(500,t+.7);
  const g=AC.createGain();g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.22*ST.vol,t+.2);g.gain.exponentialRampToValueAtTime(.001,t+.75);s.connect(lp);lp.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+.8);TX.stats.whooshes=(TX.stats.whooshes||0)+1;}catch(e){}}
const ORANGE=new THREE.Color(0xff7a1a),CHAR=new THREE.Color(0x2a2522),_c=new THREE.Color();
function ashFx(e,opt){if(!e||e._ash||!e.g)return null;e._ash=1;if(Math.hypot(e.x-G.p.x,e.z-G.p.z)>70)return null;TX.stats.ashed=(TX.stats.ashed||0)+1;
  while(ASH.list.length>=ASH.MAX)ashDone(ASH.list[0]);
  const g=e.g.clone(true),mats=[];g.traverse(o=>{if(o.isSprite){o.visible=false;return;}if(!o.isMesh)return;const one=m=>{const c=m.clone();c.userData={c0:c.color?c.color.clone():null,e0:c.emissive?c.emissive.clone():null};c.transparent=true;mats.push(c);return c;};
    o.material=Array.isArray(o.material)?o.material.map(one):one(o.material);});
  g.visible=true;scene.add(g);const h=e.h||1.6;
  const a={g,mats,x:e.x,y:e.y,z:e.z,h,t:0,lava:touchLiq(e,.35,h,2),y0:g.position.y,s0:g.scale.clone(),player:!!(opt&&opt.player),whoosh:false,kind:opt&&opt.kind||''};
  ASH.list.push(a);sizzleSfx();return a;}
function ashDone(a){const i=ASH.list.indexOf(a);if(i>=0)ASH.list.splice(i,1);scene.remove(a.g);for(const m of a.mats)m.dispose();setFlame(a,false);}
function updAsh(dt){for(const a of ASH.list.slice()){a.t+=dt;const t=a.t;
    if(a.lava)a.g.position.y=a.y0-Math.min(.45,t*.18);   // slowly sinking into the lava
    if(t<1.25){const k=Math.min(1,t/.35)*(.55+.45*Math.abs(Math.sin(t*23+Math.sin(t*7)*3)));   // glow + flicker
      for(const m of a.mats){if(m.userData.c0&&m.color)m.color.copy(m.userData.c0).lerp(ORANGE,k*.75);if(m.emissive)m.emissive.copy(ORANGE).multiplyScalar(k*.6);}
      setFlame(a,true);if(a.flame){a.flame.position.set(a.x,a.g.position.y+a.h*.55,a.z);const f=1+.15*Math.sin(t*30);a.flame.scale.set(.9*f,a.h*1.15*f,1);}
      if(Math.random()<dt*6)ashSpeck(a.x+(Math.random()-.5)*.5,a.g.position.y+a.h*(.5+Math.random()*.5),a.z+(Math.random()-.5)*.5,1.2);}
    else if(t<1.75){const k=(t-1.25)/.5;if(t>1.4)setFlame(a,false);else if(a.flame)a.flame.material.opacity=1-(t-1.25)/.15;   // char to charcoal
      for(const m of a.mats){if(m.userData.c0&&m.color)_c.copy(m.userData.c0).lerp(ORANGE,.75),m.color.copy(_c).lerp(CHAR,k);if(m.emissive)m.emissive.copy(ORANGE).multiplyScalar(.6*(1-k));}
      if(Math.random()<dt*10)ashSpeck(a.x+(Math.random()-.5)*.5,a.g.position.y+a.h*Math.random(),a.z+(Math.random()-.5)*.5,.8);}
    else{const u=Math.min(1,(t-1.75)/.75);if(!a.whoosh){a.whoosh=true;whooshSfx();for(const m of a.mats){if(m.color)m.color.copy(CHAR);if(m.emissive)m.emissive.setRGB(0,0,0);}}   // crumble
      a.g.scale.set(a.s0.x*(1+u*.35),a.s0.y*Math.max(.02,1-u),a.s0.z*(1+u*.35));for(const m of a.mats)m.opacity=1-u*u;
      const n=Math.min(8,Math.round(dt*110+Math.random()));for(let i=0;i<n;i++)ashSpeck(a.x+(Math.random()-.5)*.7,a.g.position.y+a.h*(1-u)*Math.random()+.05,a.z+(Math.random()-.5)*.7,.5);
      if(u>=1){for(let i=0;i<14;i++)ashSpeck(a.x+(Math.random()-.5)*.8,a.y+.15,a.z+(Math.random()-.5)*.8,.4);ashPile(a.x,a.lava?Math.floor(a.y)+.82:a.y,a.z);ashDone(a);}}}
  for(let i=ASH.piles.length-1;i>=0;i--){const o=ASH.piles[i];o.userData.t-=dt;if(o.userData.t<1.5)o.material.opacity=Math.max(0,o.userData.t/1.5);if(o.userData.t<=0){scene.remove(o);o.material.dispose();ASH.piles.splice(i,1);}}
  updAshSpecks(dt);updAshDeath(dt);}
// anything that dies while burning or touching lava/fire crumbles to ash (covers every death path: burn ticks, old 1.6 lava code, hits while burning)
function burningNow(e){return (e.fireT>0)||touchLiq(e,.35,e.h||1.6,2)||touchBlock(e,.35,e.h||1.6,BN.fire);}
const _rmAnimal171=removeAnimal;removeAnimal=function(a){if(a&&!a.pet&&!a._ash&&a.hp<=0&&burningNow(a))ashFx(a,{kind:'animal'});_rmAnimal171(a);};
const _killMob171=killMob;killMob=function(m,r){if(m&&!m._ash&&m.hp<=0&&burningNow(m))ashFx(m,{kind:'mob'});return _killMob171(m,r);};
// ---- the player: same burn, then crumble (third-person death cam) before the death screen ----
let ashFxDiv=null;function ashOverlay(v){if(!ashFxDiv){ashFxDiv=document.createElement('div');ashFxDiv.id='ashFx';document.body.appendChild(ashFxDiv);}ashFxDiv.style.opacity=v;}
const _die171=die;die=function(why){const P=G.p;const burn=/burn|lava|fire/i.test(why||'')||G.fireT>0||touchLiq(P,.3,1.8,2);
  if(G.ashDie)return;   // already crumbling; the death screen opens when it's done
  if(!burn||CH.god){_die171(why);return;}
  G.dead=true;G.ashDie={t:0,why};TX.stats.playerAshed=(TX.stats.playerAshed||0)+1;
  try{if(typeof BM!=='undefined'&&BM.on&&typeof exitBuild==='function')exitBuild();}catch(e){}
  let body=null;try{const g=makeAvatar();g.position.set(P.x,P.y,P.z);g.rotation.y=P.yaw+Math.PI;g.updateMatrixWorld(true);body=ashFx({g,x:P.x,y:P.y,z:P.z,h:1.8,fireT:1},{player:true});g.visible=false;}catch(e){console.warn('ash avatar',e);}
  G.ashDie.body=body;G.fireT=Math.max(G.fireT||0,2);};
function updAshDeath(dt){const d=G.ashDie;if(!d)return;d.t+=dt;const P=G.p;
  // camera pulls back so you watch your character burn up
  const k=Math.min(1,d.t/.6),back=3.6*k,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);camera.position.set(P.x-fx*back,P.y+1.62+1.1*k,P.z-fz*back);camera.lookAt(P.x,P.y+.9,P.z);
  if(d.t<1.3)G.fireT=Math.max(G.fireT||0,1.2);ashOverlay(d.t<1.25?0:Math.min(.55,(d.t-1.25)*.6));
  if(d.t>=2.7){G.ashDie=null;ashOverlay(0);G.dead=false;_die171(d.why);}}
const _respawn171=respawn;respawn=function(){G.ashDie=null;ashOverlay(0);_respawn171();};
function ashClear(){for(const a of ASH.list.slice())ashDone(a);for(const o of ASH.piles){scene.remove(o);o.material.dispose();}ASH.piles.length=0;for(const v of ashV)v.t=0;for(let i=0;i<ASH.PMAX;i++)ashPos[i*3+1]=-999;ASH.dirty=true;G.ashDie=null;ashOverlay(0);}
const _lifeClear171=lifeClear;lifeClear=function(){_lifeClear171();ashClear();};
const _upd17c=upd17;upd17=function(dt){_upd17c(dt);updAsh(dt);};
Object.assign(window.__bc,{ASH,ashFx,ashClear,burningNow});
// ---------- loop, saves, cleanup ----------
function upd17(dt){TX.boomT-=dt;updPrimed(dt);updExplosions();updFlashes(dt);updDrops(dt);updFire(dt);updHot(dt);updBurning(dt);
  TX.shake=Math.max(0,TX.shake-dt*2.2);TX.flash=Math.max(0,(TX.flash||0)-dt*3);const bf=$('boomFx');if(bf){const v=+(TX.flash||0).toFixed(2);if(bf._v!==v){bf._v=v;bf.style.opacity=v;}}}
const _updLife17=updateLife;updateLife=function(dt){_updLife17(dt);upd17(dt);};
function txClear(){for(const e of TX.primed)scene.remove(e.m);TX.primed.length=0;TX.expQ.length=0;for(const d of TX.drops)scene.remove(d.sp);TX.drops.length=0;for(const s of flashes)scene.remove(s);flashes.length=0;
  for(const e of [...TX.burning])setFlame(e,false);TX.fires.clear();TX.hot.clear();TX.shake=0;TX.kb.x=TX.kb.z=0;G.fireT=0;}
const _lifeClear17=lifeClear;lifeClear=function(){_lifeClear17();txClear();};
const _respawn17=respawn;respawn=function(){G.fireT=0;TX.kb.x=TX.kb.z=0;_respawn17();};
// lit TNT is saved as unlit TNT so nothing is lost on reload (save format unchanged: plain block edits)
const _ser17=serialize;serialize=function(){const s=_ser17();for(const e of TX.primed){const x=Math.floor(e.x),y=Math.floor(e.y+.3),z=Math.floor(e.z);if(y<1||y>=H)continue;const k=ck(x>>4,z>>4);const i=(y*CS+(z&15))*CS+(x&15);
    const ch=world.chunks.get(k);if(!ch||ch.d[i]!==0)continue;(s.edits[k]=s.edits[k]||[]).push(i,TNTK[BN.tnt]===e.kind?BN.tnt:BN.megatnt);}return s;};
Object.assign(window.__bc,{TX,primeTNT,explode,setFire,spawnDrop,bulkSet,tntR,tntKit,craft,RECIPES,FLAM,touchLiq,touchBlock,useItem:id=>useItem(id),breakAt:t=>breakAt(t),setB:(x,y,z,id)=>setB(x,y,z,id),serialize:()=>serialize(),killMob:(m,r)=>killMob(m,r),renderCheats:()=>renderCheats(),renderShop:()=>renderShop(),updateLife:dt=>updateLife(dt),camera});
