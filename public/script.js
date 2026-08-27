const burger=document.getElementById('burger');
const menu=document.getElementById('mobileMenu');
const closeMenu=document.getElementById('closeMenu');
burger.addEventListener('click',()=>menu.classList.add('open'));
closeMenu.addEventListener('click',()=>menu.classList.remove('open'));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

const modal=document.getElementById('modal');
document.querySelectorAll('.js-open').forEach(b=>b.addEventListener('click',()=>{
  modal.classList.add('open');
  loadTurnstile();
}));
document.querySelectorAll('.js-close').forEach(b=>b.addEventListener('click',()=>modal.classList.remove('open')));


const toast=document.getElementById('toast');
const leadForm=document.getElementById('form');
const formStatus=document.getElementById('formStatus');
let turnstileWidgetId=null;
let turnstileLoading=false;
let turnstileLoaded=false;

function renderTurnstile(){
  const key=window.VOREXWAY_CONFIG && window.VOREXWAY_CONFIG.turnstileSiteKey;
  const mount=document.getElementById('turnstile-container');
  if(!mount || !key || key==='PASTE_TURNSTILE_SITE_KEY_HERE') return;

  if(window.turnstile && turnstileWidgetId===null){
    mount.textContent='';
    turnstileWidgetId=window.turnstile.render(mount,{
      sitekey:key,
      theme:'light',
      size:'flexible',
      'error-callback':()=>{
        formStatus.textContent='Не удалось загрузить проверку безопасности. Проверьте соединение и попробуйте ещё раз.';
      }
    });
  }
}

function loadTurnstile(){
  if(turnstileLoaded){
    renderTurnstile();
    return;
  }
  if(turnstileLoading) return;

  const mount=document.getElementById('turnstile-container');
  if(mount) mount.textContent='Загружаем проверку безопасности…';

  turnstileLoading=true;
  const s=document.createElement('script');
  s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async=true;
  s.defer=true;
  s.onload=()=>{
    turnstileLoading=false;
    turnstileLoaded=true;
    renderTurnstile();
  };
  s.onerror=()=>{
    turnstileLoading=false;
    if(mount) mount.textContent='';
    formStatus.textContent='Проверка безопасности временно недоступна. Попробуйте ещё раз позднее.';
  };
  document.head.appendChild(s);
}

leadForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const submit=leadForm.querySelector('button[type="submit"]');
  formStatus.textContent='';

  const turnstileToken =
    window.turnstile && turnstileWidgetId!==null
      ? window.turnstile.getResponse(turnstileWidgetId)
      : '';

  if(!turnstileToken){
    formStatus.textContent='Подтвердите, что вы не робот.';
    return;
  }

  const fd=new FormData(leadForm);
  const payload={
    name:String(fd.get('name')||'').trim(),
    phone:String(fd.get('phone')||'').trim(),
    area:String(fd.get('area')||'').trim(),
    objectType:String(fd.get('objectType')||'').trim(),
    comment:String(fd.get('comment')||'').trim(),
    company:String(fd.get('company')||'').trim(),
    consent:fd.get('consent')==='on',
    turnstileToken,
    utm_source:new URLSearchParams(location.search).get('utm_source')||'',
    utm_medium:new URLSearchParams(location.search).get('utm_medium')||'',
    utm_campaign:new URLSearchParams(location.search).get('utm_campaign')||''
  };

  submit.disabled=true;
  submit.textContent='Отправляем…';

  try{
    const response=await fetch('/api/lead',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      credentials:'same-origin'
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||'Не удалось отправить заявку');

    modal.classList.remove('open');
    toast.textContent='Спасибо! Заявка отправлена. Свяжемся с вами в ближайшее время.';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),3500);
    leadForm.reset();
    if(window.turnstile && turnstileWidgetId!==null) window.turnstile.reset(turnstileWidgetId);
  }catch(err){
    formStatus.textContent=err.message||'Ошибка отправки. Попробуйте ещё раз.';
    if(window.turnstile && turnstileWidgetId!==null) window.turnstile.reset(turnstileWidgetId);
  }finally{
    submit.disabled=false;
    submit.textContent='Отправить заявку';
  }
});

const projectData = {
  preobrazhenskaya: {
    title: 'ЖК Преображенская площадь',
    area: '121,6 м²',
    images: [
      'assets/projects/preobrazhenskaya/01.webp',
      'assets/projects/preobrazhenskaya/02.webp',
      'assets/projects/preobrazhenskaya/03.webp',
      'assets/projects/preobrazhenskaya/04.webp',
      'assets/projects/preobrazhenskaya/05.webp',
      'assets/projects/preobrazhenskaya/06.webp'
    ]
  },
  skolkovo: {
    title: 'ЖК Сколково',
    area: '42,7 м²',
    images: [
      'assets/projects/skolkovo/01.webp',
      'assets/projects/skolkovo/02.webp',
      'assets/projects/skolkovo/03.webp',
      'assets/projects/skolkovo/04.webp',
      'assets/projects/skolkovo/05.webp',
      'assets/projects/skolkovo/06.webp'
    ]
  }
};

const projectViewer = document.getElementById('projectViewer');
const projectViewerImg = document.getElementById('projectViewerImg');
const projectViewerTitle = document.getElementById('projectViewerTitle');
const projectViewerArea = document.getElementById('projectViewerArea');
const projectViewerThumbs = document.getElementById('projectViewerThumbs');
let activeProject = null;
let activeProjectIndex = 0;

function renderProjectViewer(){
  const p = projectData[activeProject];
  if(!p) return;
  projectViewerTitle.textContent = p.title;
  projectViewerArea.textContent = p.area;
  projectViewerImg.src = p.images[activeProjectIndex];
  projectViewerImg.alt = `${p.title} — фото ${activeProjectIndex + 1}`;
  projectViewerThumbs.innerHTML = '';
  p.images.forEach((src, index)=>{
    const b = document.createElement('button');
    if(index === activeProjectIndex) b.classList.add('active');
    b.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async">`;
    b.addEventListener('click',()=>{
      activeProjectIndex = index;
      renderProjectViewer();
    });
    projectViewerThumbs.appendChild(b);
  });
}

function openProject(key){
  activeProject = key;
  activeProjectIndex = 0;
  renderProjectViewer();
  projectViewer.classList.add('open');
  projectViewer.setAttribute('aria-hidden','false');
  document.body.classList.add('project-viewer-open');
}

function closeProject(){
  projectViewer.classList.remove('open');
  projectViewer.setAttribute('aria-hidden','true');
  document.body.classList.remove('project-viewer-open');
}

document.querySelectorAll('.js-project').forEach(card=>{
  card.addEventListener('click',()=>openProject(card.dataset.project));
});
document.querySelectorAll('.js-project-close').forEach(el=>el.addEventListener('click',closeProject));

document.getElementById('projectPrev').addEventListener('click',()=>{
  const p = projectData[activeProject];
  activeProjectIndex = (activeProjectIndex - 1 + p.images.length) % p.images.length;
  renderProjectViewer();
});
document.getElementById('projectNext').addEventListener('click',()=>{
  const p = projectData[activeProject];
  activeProjectIndex = (activeProjectIndex + 1) % p.images.length;
  renderProjectViewer();
});
document.addEventListener('keydown',e=>{
  if(!projectViewer.classList.contains('open')) return;
  if(e.key === 'Escape') closeProject();
  if(e.key === 'ArrowLeft') document.getElementById('projectPrev').click();
  if(e.key === 'ArrowRight') document.getElementById('projectNext').click();
});
