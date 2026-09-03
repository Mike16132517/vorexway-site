const burger=document.getElementById('burger');
const menu=document.getElementById('mobileMenu');
const closeMenu=document.getElementById('closeMenu');
burger.addEventListener('click',()=>menu.classList.add('open'));
closeMenu.addEventListener('click',()=>menu.classList.remove('open'));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

const modal=document.getElementById('modal');
document.querySelectorAll('.js-open').forEach(b=>b.addEventListener('click',()=>{
  modal.classList.add('open');
  loadSmartCaptcha();
}));
document.querySelectorAll('.js-close').forEach(b=>b.addEventListener('click',()=>modal.classList.remove('open')));

const toast=document.getElementById('toast');
const leadForm=document.getElementById('form');
const formStatus=document.getElementById('formStatus');

let smartCaptchaLoading=false;
let smartCaptchaLoaded=false;
let smartCaptchaToken='';

window.vorexwayCaptchaCallback=(token)=>{
  smartCaptchaToken=token || '';
  if(smartCaptchaToken) formStatus.textContent='';
};

function loadSmartCaptcha(){
  const mount=document.getElementById('smartcaptcha-container');
  const key=window.VOREXWAY_CONFIG && window.VOREXWAY_CONFIG.smartCaptchaSiteKey;

  if(!mount || !key){
    formStatus.textContent='Проверка безопасности временно недоступна.';
    return;
  }

  mount.dataset.sitekey=key;
  mount.dataset.callback='vorexwayCaptchaCallback';
  mount.dataset.hl='ru';
  mount.style.minHeight='100px';

  if(smartCaptchaLoaded || document.querySelector('script[data-vorexway-smartcaptcha]')) return;
  if(smartCaptchaLoading) return;

  smartCaptchaLoading=true;
  mount.textContent='Загружаем проверку безопасности…';

  const script=document.createElement('script');
  script.src='https://smartcaptcha.cloud.yandex.ru/captcha.js';
  script.async=true;
  script.defer=true;
  script.dataset.vorexwaySmartcaptcha='1';

  script.onload=()=>{
    smartCaptchaLoading=false;
    smartCaptchaLoaded=true;
  };

  script.onerror=()=>{
    smartCaptchaLoading=false;
    mount.textContent='';
    formStatus.textContent='Проверка безопасности временно недоступна. Попробуйте ещё раз позднее.';
  };

  document.head.appendChild(script);
}

leadForm.addEventListener('submit',async e=>{
  e.preventDefault();

  const submit=leadForm.querySelector('button[type="submit"]');
  formStatus.textContent='';

  const tokenInput=leadForm.querySelector('input[name="smart-token"]');
  const captchaToken=(tokenInput && tokenInput.value) || smartCaptchaToken || '';

  if(!captchaToken){
    formStatus.textContent='Подтвердите, что вы не робот.';
    loadSmartCaptcha();
    return;
  }

  const fd=new FormData(leadForm);
  const params=new URLSearchParams(location.search);

  const payload={
    name:String(fd.get('name')||'').trim(),
    phone:String(fd.get('phone')||'').trim(),
    area:String(fd.get('area')||'').trim(),
    objectType:String(fd.get('objectType')||'').trim(),
    comment:String(fd.get('comment')||'').trim(),
    company:String(fd.get('company')||'').trim(),
    consent:fd.get('consent')==='on',
    smartCaptchaToken:captchaToken,
    utm_source:params.get('utm_source')||'',
    utm_medium:params.get('utm_medium')||'',
    utm_campaign:params.get('utm_campaign')||''
  };

  submit.disabled=true;
  submit.textContent='Отправляем…';

  try{
    const apiUrl=window.VOREXWAY_CONFIG && window.VOREXWAY_CONFIG.apiUrl;

    if(!apiUrl) throw new Error('Сервис формы временно недоступен.');

    const response=await fetch(apiUrl,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });

    const data=await response.json().catch(()=>({}));

    if(!response.ok){
      throw new Error(data.error||'Не удалось отправить заявку');
    }

    modal.classList.remove('open');
    toast.textContent='Спасибо! Заявка отправлена. Свяжемся с вами в ближайшее время.';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),3500);

    leadForm.reset();
    smartCaptchaToken='';

    if(window.smartCaptcha && typeof window.smartCaptcha.reset==='function'){
      window.smartCaptcha.reset();
    }
  }catch(err){
    formStatus.textContent=err.message||'Ошибка отправки. Попробуйте ещё раз.';
    smartCaptchaToken='';

    if(window.smartCaptcha && typeof window.smartCaptcha.reset==='function'){
      window.smartCaptcha.reset();
    }
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
  },
  uno: {
    title: 'ЖК UNO',
    area: '76,6 м²',
    images: [
      'assets/projects/uno/01.jpg',
      'assets/projects/uno/02.jpg',
      'assets/projects/uno/03.jpg',
      'assets/projects/uno/04.jpg',
      'assets/projects/uno/05.jpg',
      'assets/projects/uno/06.jpg',
      'assets/projects/uno/07.jpg',
      'assets/projects/uno/08.jpg',
      'assets/projects/uno/09.jpg',
      'assets/projects/uno/10.jpg'
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
