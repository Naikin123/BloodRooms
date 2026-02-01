// script.js — BloodRooms: interacción mínima + comprobación CSS

(function(){
  const cssFlag = getComputedStyle(document.documentElement).getPropertyValue('--css-loaded').trim();
  if(!cssFlag){
    console.warn('⚠️ AVISO: El CSS no parece estar cargado. Verifica que style.css esté en la misma carpeta que index.html y que el link href sea "style.css".');
    // Mostrar aviso visible para pruebas (temporal)
    const warn = document.createElement('div');
    warn.textContent = 'AVISO: CSS no cargado (ver consola)';
    Object.assign(warn.style, {position:'fixed',left:10,bottom:10,background:'#b30000',color:'#fff',padding:'8px 10px',borderRadius:6,zIndex:9999});
    document.body.appendChild(warn);
    setTimeout(()=> warn.remove(), 6000);
  } else {
    console.log('✅ CSS cargado correctamente.');
  }

  const nextBtn = document.getElementById('nextBtn');
  const glitchBtn = document.getElementById('btn-glitch');
  const scanBtn = document.getElementById('btn-scan');
  const evidenceBtn = document.getElementById('evidenceBtn');
  const img = document.getElementById('mainImg');
  const logText = document.getElementById('logText');
  const overlay = document.getElementById('glitchOverlay');

  // lista de imagenes (pon tus nombres en assets/images/)
  const images = [
    'assets/images/room1.jpg',
    'assets/images/room2.jpg',
    'assets/images/hallway.jpg'
  ];

  // función de cambio aleatorio de imagen (si no existe archivo, no rompe)
  function swapImageRandom(){
    const available = images.slice();
    // filtra por existencia tentativa (no leemos FS aquí) — dejamos al usuario subir
    const pick = available[Math.floor(Math.random()*available.length)];
    img.src = pick;
  }

  // glitch visual breve
  function doGlitch(short = true){
    overlay.classList.add('active');
    img.style.filter = 'contrast(1.6) hue-rotate(15deg) saturate(1.5) blur(0.6px)';
    setTimeout(()=>{
      overlay.classList.remove('active');
      img.style.filter = '';
    }, short ? 600 : 1800);
  }

  // scramble text
  function scrambleText(node, finalText){
    const original = node.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=[]{}";
    const duration = 700;
    const frameRate = 30;
    const frames = Math.round(duration / (1000/frameRate));
    let frame = 0;
    const interval = setInterval(()=>{
      const pct = frame / frames;
      if(frame >= frames){
        node.textContent = finalText;
        node.classList.remove('glitch-scramble');
        clearInterval(interval);
        return;
      }
      // build scrambled
      let out = '';
      for(let i=0;i<finalText.length;i++){
        if(Math.random() < (pct*1.15)) out += finalText[i];
        else out += chars[Math.floor(Math.random()*chars.length)];
      }
      node.textContent = out;
      node.classList.add('glitch-scramble');
      frame++;
    }, 1000/frameRate);
  }

  // botones
  nextBtn && nextBtn.addEventListener('click', ()=>{
    doGlitch(false);
    // cambiar imagen y actualizar log
    swapImageRandom();
    scrambleText(logText, '01:24 — Detectado movimiento. No permanecer. Proceda a salida alternativa.');
    // premio/penalidad demo (puedes meter GUA después)
  });

  glitchBtn && glitchBtn.addEventListener('click', ()=>{
    doGlitch(true);
    scrambleText(logText, 'ERROR: fragmento corrupto...');
  });

  scanBtn && scanBtn.addEventListener('click', ()=>{
    // efecto tipo "escaneo"
    const prev = logText.textContent;
    scrambleText(logText, 'SCAN: mapeando geom. anómala...');
    setTimeout(()=> scrambleText(logText, prev), 1200);
  });

  evidenceBtn && evidenceBtn.addEventListener('click', ()=> {
    // abrir "evidencia" -> cambiar imagen y texto
    swapImageRandom();
    scrambleText(logText, 'EVIDENCIA #A-12: marcas en el piso — toma 3');
    doGlitch(true);
  });

  // on load ensure a default image exists fallback
  img.addEventListener('error', ()=>{
    img.alt = "Imagen no encontrada. Coloca archivos en assets/images/ y nombres: room1.jpg, room2.jpg, hallway.jpg";
    img.style.filter = 'grayscale(1) contrast(.8)';
  });

})();
