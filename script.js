// script.js — BloodRooms: theme "sangriento" + uploader (localStorage)
// Keys
const KEY_FEED = 'bloodrooms_feed_v1';
const KEY_NOTES = 'bloodrooms_notes_v1';

// State
let FEED = JSON.parse(localStorage.getItem(KEY_FEED) || '[]');

// Helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = (p='id') => p + Math.floor(Math.random()*999999);

// Check CSS loaded
(function(){
  const flag = getComputedStyle(document.documentElement).getPropertyValue('--css-loaded').trim();
  if(!flag){
    console.warn('⚠️ CSS no cargado. Verifica style.css en la raíz y link en index.html');
    const w = document.createElement('div'); w.textContent = 'AVISO: CSS no cargado'; Object.assign(w.style,{position:'fixed',right:12,bottom:12,background:'#bf0f10',color:'#fff',padding:'8px 10px',borderRadius:6,zIndex:9999}); document.body.appendChild(w); setTimeout(()=>w.remove(),6000);
  }
})();

// Render feed
function renderFeed(){
  const list = $('#feedList');
  list.innerHTML = '';
  if(!FEED.length){
    list.innerHTML = `<div class="small-muted">No hay evidencias subidas aún.</div>`;
    return;
  }
  FEED.forEach(item=>{
    const el = document.createElement('div'); el.className='feed-item';
    el.innerHTML = `
      <div class="feed-thumb"><img src="${item.image}" alt="${escapeHtml(item.title)}"></div>
      <div class="feed-body">
        <div class="feed-title">${escapeHtml(item.title)}</div>
        <div class="feed-meta">${escapeHtml(item.author)} • ${new Date(item.created).toLocaleString()}</div>
        <div class="feed-desc">${escapeHtml(item.description)}</div>
      </div>
    `;
    list.appendChild(el);
  });
}

// Escape simple HTML
function escapeHtml(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Save feed
function saveFeed(){ localStorage.setItem(KEY_FEED, JSON.stringify(FEED)); }

// Resize image using canvas to limit size (maxWidth)
function resizeImage(file, maxWidth = 1200, quality = 0.8){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject('Error leyendo archivo');
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = (img.width > maxWidth) ? (maxWidth / img.width) : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // export as JPEG to reduce size
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject('Formato de imagen no válido');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload handler: validate, resize, push to feed
async function handlePublish(){
  const fileInput = $('#uploadFile');
  const title = $('#uploadTitle').value.trim() || 'Sin título';
  const author = $('#uploadAuthor').value.trim() || 'Anónimo';
  const desc = $('#uploadDesc').value.trim() || '';

  if(!fileInput.files || !fileInput.files[0]){
    alert('Selecciona una imagen para subir.');
    return;
  }
  const file = fileInput.files[0];
  // validate type
  if(!file.type.startsWith('image/')){
    alert('Solo se permiten imágenes.');
    return;
  }
  // optional size hint
  if(file.size > 5 * 1024 * 1024){ // >5MB
    if(!confirm('La imagen es grande (>5MB). ¿Quieres intentar subirla comprimida?')) return;
  }

  $('#uploadPublishBtn').disabled = true;
  $('#uploadPublishBtn').textContent = 'Subiendo...';

  try {
    // resize/compress
    const dataUrl = await resizeImage(file, 1200, 0.8);
    // create item
    const item = { id: uid('v'), title, author, description: desc, image: dataUrl, created: Date.now() };
    // add to feed (front)
    FEED.unshift(item);
    saveFeed();
    renderFeed();
    // clear inputs and preview
    fileInput.value = '';
    $('#uploadTitle').value = '';
    $('#uploadAuthor').value = '';
    $('#uploadDesc').value = '';
    $('#uploadPreview').innerHTML = 'Publicado correctamente.';
    setTimeout(()=> $('#uploadPreview').innerHTML = 'Sin previsualización', 2000);
  } catch(err){
    alert('Error subiendo imagen: ' + err);
  } finally {
    $('#uploadPublishBtn').disabled = false;
    $('#uploadPublishBtn').textContent = 'Publicar';
  }
}

// Preview selected file
function previewSelected(){
  const fileInput = $('#uploadFile');
  if(!fileInput.files || !fileInput.files[0]) { $('#uploadPreview').textContent = 'Sin previsualización'; return; }
  const file = fileInput.files[0];
  if(!file.type.startsWith('image/')) { $('#uploadPreview').textContent = 'Archivo no es imagen'; return; }
  // show quick preview using FileReader (no resize)
  const reader = new FileReader();
  reader.onload = e => {
    $('#uploadPreview').innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:160px;border-radius:6px;border:1px solid rgba(255,255,255,0.03)"/>`;
  };
  reader.readAsDataURL(file);
}

// Small helper: initialize events
function init(){
  // render existing feed
  renderFeed();

  // preview button
  $('#uploadPreviewBtn').addEventListener('click', previewSelected);

  // publish
  $('#uploadPublishBtn').addEventListener('click', handlePublish);

  // quick glitch / effects for UI
  $('#btn-glitch').addEventListener('click', ()=> {
    const overlay = document.getElementById('glitchOverlay');
    overlay.classList.add('active');
    setTimeout(()=> overlay.classList.remove('active'), 900);
  });

  // evidence button: just swap top image with last uploaded (if any)
  $('#evidenceBtn').addEventListener('click', ()=>{
    if(!FEED.length){ alert('No hay evidencias aún'); return; }
    const last = FEED[0];
    const mainImg = document.getElementById('mainImg');
    mainImg.src = last.image;
    $('#logText').textContent = `EVIDENCIA: ${last.title} — ${last.author}`;
  });

  // notes
  $('#saveNote').addEventListener('click', ()=> {
    const text = $('#noteBlock').value || '';
    localStorage.setItem(KEY_NOTES, text);
    alert('Nota guardada localmente');
  });
  $('#clearNote').addEventListener('click', ()=> {
    if(confirm('Borrar nota?')){ $('#noteBlock').value=''; localStorage.removeItem(KEY_NOTES); }
  });

  // load notes
  $('#noteBlock').value = localStorage.getItem(KEY_NOTES) || '';

  // load initial main image fallback error handler
  const mainImg = document.getElementById('mainImg');
  mainImg.addEventListener('error', ()=> {
    mainImg.alt = 'Imagen principal no encontrada. Coloca archivos en assets/images/room1.jpg o sube nuevas evidencias.';
    mainImg.style.filter = 'grayscale(1) contrast(.8)';
  });
}

// On ready
document.addEventListener('DOMContentLoaded', init);
