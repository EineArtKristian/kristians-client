const modules={
  "Combat":["Kill Aura","Hover Totem","Mace Helper","Silent Aim","TargetAura","HitFX","KillFX"],
  "Movement":["JumpFX","Trails"],
  "Render":["View Model","Effect Bloom","Stretched Resolution","Item Chams","CustomSky"],
  "Player":["Freecam","Player ESP","Invisible Players","Emote Wheel","Stop Emote"],
  "World":["Atmosphere"],
  "HUD":["Themed Hotbar","Spotify Player","Active Modules","Target HUD","Performance HUD","Coordinates","Speed"],
  "Cosmetics":["Wings","Halo","Ender Dragon Wings","Skeleton Model","Star Wand","Horns","Zombie Arms","Headless","Other Cosmetics"],
  "Fun":["Tung Tung Tung Sahur"],
  "Friends":["Manage Friends"],
  "Misc":["Fake Lag","Totem Pop Sound","Lock Escape","UI Sounds","Client Theme","Background Blur"],
  "Hugo SMP":["Inventory Watch","Message Repeat"]
};
const descriptions={
  "Kill Aura":"Configurable local combat assistance and target movement.","Mace Helper":"Mace timing and shield-break controls.","Silent Aim":"Near-miss correction without moving the local camera.","TargetAura":"Glowing rings, spirals and orbiting target effects.","HitFX":"Sparks, crystal shards and ripple impacts.","KillFX":"Cinematic energy bursts on defeated targets.","JumpFX":"Shockwaves, emblem pulses and echo rings.","Trails":"Smooth luminous ribbons from the player body.","CustomSky":"Eight animated procedural sky presets.","Atmosphere":"Fireflies, rain, stars, snow, embers and petals.","View Model":"Position, rotate and animate either first-person hand.","Player ESP":"Boxes, silhouettes, fill and optional tracers.","Invisible Players":"Transparent reveal, aura and proximity notifications.","Themed Hotbar":"HUD styling matched to the selected client theme.","Spotify Player":"Track art and playback controls inside the HUD.","Active Modules":"A configurable array list for enabled utilities.","Skeleton Model":"A complete custom body with first-person bone hands.","Star Wand":"Custom textured sword replacement in first and third person.","Horns":"Theme-colored horns with a custom animated flame.","Wings":"Animated luminous or Ender Dragon wing cosmetics.","Inventory Watch":"Shows selected inventory items beside tracked players.","Client Theme":"Classic, Liquid Glass, Vape, Sober and Catppuccin styles."
};
const defaults=new Set(["CustomSky","Player ESP","Themed Hotbar","Skeleton Model","Star Wand","Horns","UI Sounds"]);
const canvas=document.getElementById("panelCanvas");
const search=document.getElementById("moduleSearch");
const total=Object.values(modules).flat().length;
document.getElementById("moduleCount").textContent=`${total} MODULES`;

function makePanels(){
  canvas.innerHTML="";
  Object.entries(modules).forEach(([category,list],index)=>{
    const panel=document.createElement("section"); panel.className="client-panel"; panel.dataset.index=index;
    const head=document.createElement("div"); head.className="panel-head"; head.innerHTML=`<b>${category}</b><span aria-label="Collapse ${category}">−</span>`;
    const body=document.createElement("div"); body.className="panel-body";
    list.forEach(name=>{const row=document.createElement("div");row.className=`module-row${defaults.has(name)?" on":""}`;row.dataset.name=name.toLowerCase();row.innerHTML=`<span>${name}</span><i class="mini-toggle"></i>`;row.addEventListener("click",()=>row.classList.toggle("on"));body.appendChild(row)});
    head.querySelector("span").addEventListener("click",event=>{event.stopPropagation();panel.classList.toggle("closed");head.querySelector("span").textContent=panel.classList.contains("closed")?"+":"−"});
    panel.append(head,body);canvas.appendChild(panel);enableDrag(panel,head);
  });
  layoutPanels();
}
function layoutPanels(){
  const width=canvas.clientWidth;
  const cols=width<480?1:width<740?2:width<1080?4:5;
  const gap=14,panelW=Math.min(214,(width-gap*(cols+1))/cols),rowH=width<480?208:196;
  canvas.querySelectorAll(".client-panel").forEach((panel,i)=>{if(panel.dataset.dragged)return;panel.style.width=`${panelW}px`;panel.style.left=`${gap+(i%cols)*(panelW+gap)}px`;panel.style.top=`${14+Math.floor(i/cols)*rowH}px`});
}
function enableDrag(panel,handle){
  let startX=0,startY=0,left=0,top=0,moved=false;
  handle.addEventListener("pointerdown",event=>{if(event.target.closest("span"))return;moved=false;startX=event.clientX;startY=event.clientY;left=panel.offsetLeft;top=panel.offsetTop;handle.setPointerCapture(event.pointerId);panel.style.zIndex=String(Date.now()%100000)});
  handle.addEventListener("pointermove",event=>{if(!handle.hasPointerCapture(event.pointerId))return;const dx=event.clientX-startX,dy=event.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(!moved)return;panel.dataset.dragged="1";panel.style.left=`${Math.max(0,Math.min(canvas.clientWidth-panel.offsetWidth,left+dx))}px`;panel.style.top=`${Math.max(0,Math.min(canvas.clientHeight-40,top+dy))}px`});
  handle.addEventListener("pointerup",event=>{if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId)});
}
search.addEventListener("input",()=>{const query=search.value.trim().toLowerCase();let shown=0;canvas.querySelectorAll(".client-panel").forEach(panel=>{let matches=0;panel.querySelectorAll(".module-row").forEach(row=>{const visible=!query||row.dataset.name.includes(query);row.classList.toggle("filtered",!visible);if(visible){matches++;shown++}});panel.style.opacity=query&&!matches?".22":"1";if(query&&matches){panel.classList.remove("closed");panel.querySelector(".panel-head span").textContent="−"}});document.getElementById("moduleCount").textContent=`${query?shown:total} MODULES`});

const tabs=document.getElementById("categoryTabs"),list=document.getElementById("moduleList");
function showCategory(category){
  tabs.querySelectorAll("button").forEach(button=>button.classList.toggle("active",button.dataset.category===category));
  const entries=category==="All"?Object.entries(modules):[[category,modules[category]]];
  list.innerHTML=entries.flatMap(([cat,names])=>names.map(name=>`<article class="module-card"><span>${cat.toUpperCase()}</span><h3>${name}</h3><p>${descriptions[name]||"Configurable client module with integrated theme and keybind support."}</p></article>`)).join("");
}
["All",...Object.keys(modules)].forEach(category=>{const button=document.createElement("button");button.textContent=category;button.dataset.category=category;button.addEventListener("click",()=>showCategory(category));tabs.appendChild(button)});showCategory("All");makePanels();window.addEventListener("resize",layoutPanels);

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle("visible",entry.isIntersecting)),{threshold:.08});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
const lightbox=document.getElementById("lightbox"),lightboxImage=lightbox.querySelector("img");document.querySelectorAll("[data-image]").forEach(button=>button.addEventListener("click",()=>{lightboxImage.src=button.dataset.image;lightboxImage.alt=button.querySelector("img").alt;lightbox.showModal()}));lightbox.querySelector("button").addEventListener("click",()=>lightbox.close());lightbox.addEventListener("click",event=>{if(event.target===lightbox)lightbox.close()});
