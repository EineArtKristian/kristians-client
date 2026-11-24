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
  "Kill Aura":"Configurable local combat assistance and target movement.","Mace Helper":"Mace timing and shield-break controls.","Silent Aim":"Near-miss correction without moving the local camera.","TargetAura":"Glowing rings, spirals and orbiting target effects.","HitFX":"Sparks, crystal shards and ripple impacts.","KillFX":"Cinematic energy bursts on defeated targets.","JumpFX":"Shockwaves, emblem pulses and echo rings.","Trails":"Smooth luminous ribbons from the player body.","CustomSky":"Animated procedural skies with theme-aware lighting.","Atmosphere":"Fireflies, rain, stars, snow, embers and petals.","View Model":"Position, rotate and animate either first-person hand.","Player ESP":"Boxes, silhouettes, fill and optional tracers.","Invisible Players":"Transparent reveal, aura and proximity notifications.","Themed Hotbar":"HUD styling matched to the selected client theme.","Spotify Player":"Track art and playback controls inside the HUD.","Active Modules":"A configurable array list for enabled utilities.","Skeleton Model":"A complete custom body with first-person bone hands.","Star Wand":"Custom textured sword replacement in first and third person.","Horns":"Theme-colored horns with a custom animated flame.","Wings":"Animated luminous or Ender Dragon wing cosmetics.","Inventory Watch":"Shows selected inventory items beside tracked players.","Client Theme":"Classic, Liquid Glass, Vape, Sober and Catppuccin styles."
};
const defaults=new Set(["CustomSky","Player ESP","Themed Hotbar","Skeleton Model","Star Wand","Horns","UI Sounds"]);
const canvas=document.getElementById("panelCanvas");
const search=document.getElementById("moduleSearch");
const total=Object.values(modules).flat().length;

function makePanels(){
  canvas.innerHTML="";
  Object.entries(modules).forEach(([category,list],index)=>{
    const panel=document.createElement("section"); panel.className="client-panel"; panel.dataset.index=index;
    const head=document.createElement("div"); head.className="panel-head"; head.innerHTML=`<b>${category}</b><span aria-label="Collapse ${category}">−</span>`;
    const body=document.createElement("div"); body.className="panel-body";
    list.forEach(name=>{const row=document.createElement("div");row.className=`module-row${defaults.has(name)?" on":""}`;row.dataset.name=name.toLowerCase();row.innerHTML=`<span>${name}</span><i class="mini-toggle"></i>`;row.addEventListener("click",()=>row.classList.toggle("on"));body.appendChild(row)});
    head.querySelector("span").addEventListener("click",event=>{event.stopPropagation();panel.classList.toggle("closed");head.querySelector("span").textContent=panel.classList.contains("closed")?"+":"−";requestAnimationFrame(layoutPanels)});
    panel.append(head,body);canvas.appendChild(panel);enableDrag(panel,head);
  });
  layoutPanels();
}
function layoutPanels(){
  const width=canvas.clientWidth;
  const cols=width<480?1:width<740?2:width<1080?4:5;
  const gap=14,panelW=Math.min(214,(width-gap*(cols+1))/cols),heights=Array(cols).fill(gap);
  canvas.querySelectorAll(".client-panel").forEach(panel=>{
    if(panel.dataset.dragged)return;
    const col=heights.indexOf(Math.min(...heights));
    panel.style.width=`${panelW}px`;panel.style.left=`${gap+col*(panelW+gap)}px`;panel.style.top=`${heights[col]}px`;
    heights[col]+=panel.offsetHeight+gap;
  });
  const dragged=[...canvas.querySelectorAll('.client-panel[data-dragged]')].map(panel=>panel.offsetTop+panel.offsetHeight+gap);
  canvas.style.height=`${Math.max(320,...heights,...dragged)}px`;
}
function enableDrag(panel,handle){
  let startX=0,startY=0,left=0,top=0,moved=false;
  handle.addEventListener("pointerdown",event=>{if(event.target.closest("span"))return;moved=false;startX=event.clientX;startY=event.clientY;left=panel.offsetLeft;top=panel.offsetTop;handle.setPointerCapture(event.pointerId);panel.style.zIndex=String(Date.now()%100000)});
  handle.addEventListener("pointermove",event=>{if(!handle.hasPointerCapture(event.pointerId))return;const dx=event.clientX-startX,dy=event.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(!moved)return;panel.dataset.dragged="1";panel.style.left=`${Math.max(0,Math.min(canvas.clientWidth-panel.offsetWidth,left+dx))}px`;panel.style.top=`${Math.max(0,Math.min(canvas.clientHeight-40,top+dy))}px`});
  handle.addEventListener("pointerup",event=>{if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId)});
}
search.addEventListener("input",()=>{const query=search.value.trim().toLowerCase();canvas.querySelectorAll(".client-panel").forEach(panel=>{let matches=0;panel.querySelectorAll(".module-row").forEach(row=>{const visible=!query||row.dataset.name.includes(query);row.classList.toggle("filtered",!visible);if(visible)matches++});panel.style.opacity=query&&!matches?".22":"1";if(query&&matches){panel.classList.remove("closed");panel.querySelector(".panel-head span").textContent="−"}});requestAnimationFrame(layoutPanels)});

const tabs=document.getElementById("categoryTabs"),list=document.getElementById("moduleList");
function showCategory(category){
  tabs.querySelectorAll("button").forEach(button=>button.classList.toggle("active",button.dataset.category===category));
  const entries=category==="All"?Object.entries(modules):[[category,modules[category]]];
  list.innerHTML=entries.flatMap(([cat,names])=>names.map(name=>`<article class="module-card"><span>${cat.toUpperCase()}</span><h3>${name}</h3><p>${descriptions[name]||"Configurable client module with integrated theme and keybind support."}</p></article>`)).join("");
}
["All",...Object.keys(modules)].forEach(category=>{const button=document.createElement("button");button.textContent=category;button.dataset.category=category;button.addEventListener("click",()=>showCategory(category));tabs.appendChild(button)});showCategory("All");makePanels();window.addEventListener("resize",layoutPanels);

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle("visible",entry.isIntersecting)),{threshold:.08});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
const lightbox=document.getElementById("lightbox"),lightboxImage=lightbox.querySelector("img");document.querySelectorAll("[data-image]").forEach(button=>button.addEventListener("click",()=>{lightboxImage.src=button.dataset.image;lightboxImage.alt=button.querySelector("img").alt;lightbox.showModal()}));lightbox.querySelector("button").addEventListener("click",()=>lightbox.close());lightbox.addEventListener("click",event=>{if(event.target===lightbox)lightbox.close()});

const product=document.querySelector('.product-window');
const productGlow=document.querySelector('.product-glow');
if(product&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const target={x:0,y:0},current={x:0,y:0};let frame=0;
  const animateProduct=()=>{current.x+=(target.x-current.x)*.11;current.y+=(target.y-current.y)*.11;product.style.setProperty('--ry',`${-5+current.x*7}deg`);product.style.setProperty('--rx',`${2-current.y*5}deg`);product.style.setProperty('--tx',`${current.x*7}px`);product.style.setProperty('--ty',`${current.y*6}px`);if(productGlow)productGlow.style.transform=`translate3d(${current.x*-18}px,${current.y*-12}px,0)`;if(Math.abs(target.x-current.x)>.001||Math.abs(target.y-current.y)>.001)frame=requestAnimationFrame(animateProduct);else frame=0};
  const moveProduct=event=>{const box=product.getBoundingClientRect();target.x=Math.max(-1,Math.min(1,(event.clientX-(box.left+box.width/2))/(box.width/2)));target.y=Math.max(-1,Math.min(1,(event.clientY-(box.top+box.height/2))/(box.height/2)));if(!frame)frame=requestAnimationFrame(animateProduct)};
  product.addEventListener('pointermove',moveProduct);product.addEventListener('pointerleave',()=>{target.x=0;target.y=0;if(!frame)frame=requestAnimationFrame(animateProduct)});
}

const reviewForm=document.getElementById('reviewForm'),reviewList=document.getElementById('reviewList'),reviewSummary=document.getElementById('reviewSummary');
let selectedRating=5;
const ratingButtons=[...document.querySelectorAll('.star-picker button')];
function paintStars(){ratingButtons.forEach(button=>button.classList.toggle('selected',Number(button.dataset.rating)<=selectedRating))}
ratingButtons.forEach(button=>button.addEventListener('click',()=>{selectedRating=Number(button.dataset.rating);paintStars()}));paintStars();
reviewForm?.addEventListener('submit',event=>{event.preventDefault();const name=document.getElementById('reviewName').value.trim()||'Minecraft player';const review=document.getElementById('reviewText').value.trim();if(!review)return;const title=`[${selectedRating}★] Review by ${name}`;const body=`Rating: ${selectedRating}/5\n\n${review}\n\n— Submitted from the Kristians Client website`;const url=`https://github.com/EineArtKristian/kristians-client/issues/new?labels=review&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;window.open(url,'_blank','noopener')});
fetch('https://api.github.com/repos/EineArtKristian/kristians-client/issues?labels=review&state=open&per_page=12',{headers:{Accept:'application/vnd.github+json'}}).then(response=>{if(!response.ok)throw new Error('Reviews unavailable');return response.json()}).then(items=>{const reviews=items.filter(item=>!item.pull_request).map(item=>{const match=item.title.match(/^\[(\d)★\]\s*Review by\s*(.+)$/i);return match?{rating:Number(match[1]),name:match[2],text:(item.body||'').replace(/^Rating:.*\n+/,'').replace(/\n+— Submitted[\s\S]*$/,'').trim(),url:item.html_url}:null}).filter(Boolean);if(!reviews.length){reviewSummary.textContent='Be the first person to review Kristians Client.';reviewList.innerHTML='<p class="review-empty">No community reviews yet.</p>';return}const average=reviews.reduce((sum,item)=>sum+item.rating,0)/reviews.length;reviewSummary.innerHTML=`<b>${average.toFixed(1)} ★</b><span>${reviews.length} public review${reviews.length===1?'':'s'}</span>`;reviewList.innerHTML=reviews.slice(0,6).map(item=>`<a class="review-card" href="${item.url}" target="_blank" rel="noopener"><span>${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</span><p>${escapeHtml(item.text)}</p><b>${escapeHtml(item.name)}</b></a>`).join('')}).catch(()=>{reviewSummary.textContent='Community reviews load from GitHub.';reviewList.innerHTML='<p class="review-empty">Reviews are temporarily unavailable.</p>'});
function escapeHtml(value){const node=document.createElement('span');node.textContent=value;return node.innerHTML}
