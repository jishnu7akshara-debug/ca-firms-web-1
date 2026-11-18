(function(){
  const body=document.body;
  body.classList.remove('no-js');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) body.classList.add('reduce');

  /* ---------- image fallback: never show a broken icon ---------- */
  document.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{img.style.opacity=0;if(img.parentElement)img.parentElement.style.background='linear-gradient(135deg,#1C3340,#0F1E26)';},{once:true});
  });

  /* ---------- mobile menu ---------- */
  const burger=document.getElementById('burger');
  burger.addEventListener('click',()=>{const o=body.classList.toggle('menu-open');burger.setAttribute('aria-expanded',o);});
  document.querySelectorAll('#mmenu a').forEach(a=>a.addEventListener('click',()=>{body.classList.remove('menu-open');burger.setAttribute('aria-expanded',false);}));

  /* ---------- forms (front-end only; wire to your backend) ---------- */
  const fileIn=document.getElementById('cvFile'),drop=document.getElementById('drop'),dropTxt=document.getElementById('dropTxt');
  fileIn.addEventListener('change',()=>{if(fileIn.files[0])dropTxt.textContent=fileIn.files[0].name;});
  ['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('over');}));
  ['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('over');}));
  drop.addEventListener('drop',ev=>{const f=ev.dataTransfer.files[0];if(f){try{const dt=new DataTransfer();dt.items.add(f);fileIn.files=dt.files;}catch(e){}dropTxt.textContent=f.name;}});
  function handle(formId,okId,fields,msg){
    const f=document.getElementById(formId),ok=document.getElementById(okId);
    f.addEventListener('submit',e=>{
      e.preventDefault();
      const missing=fields.filter(id=>{const el=document.getElementById(id);const bad=!el.value.trim()||(el.type==='email'&&!/^\S+@\S+\.\S+$/.test(el.value));el.style.borderColor=bad?'#FF5B1F':'';return bad;});
      ok.classList.add('show');
      ok.textContent=missing.length?'Please fill in the highlighted fields.':msg(document.getElementById(fields[0]).value.trim().split(' ')[0]);
      if(!missing.length) f.querySelectorAll('input:not([type=radio]),textarea').forEach(i=>{if(i.type!=='file')i.value='';});
    });
  }
  handle('hireForm','hireOk',['hn','hf','he'],n=>`Thanks ${n} — your brief is in. A specialist recruiter will call you within one working day.`);
  handle('cvForm','cvOk',['cn','cp'],n=>`Thanks ${n}. We'll review your profile and reach out only when a role matches.`);

  /* ---------- nav: scrolled + hide on scroll down ---------- */
  const nav=document.getElementById('nav');let lastY=0;
  function onScrollNav(y){nav.classList.toggle('scrolled',y>30);nav.classList.toggle('hide',y>lastY&&y>400&&!body.classList.contains('menu-open'));lastY=y;}

  if(typeof gsap==='undefined'||reduce){
    document.querySelectorAll('.rv').forEach(el=>{el.style.opacity=1;el.style.transform='none'});
    document.querySelectorAll('[data-count]').forEach(el=>el.textContent=el.dataset.count+(el.dataset.count==='48'?'h':''));
    window.addEventListener('scroll',()=>onScrollNav(scrollY),{passive:true});
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis=null;
  if(window.Lenis){
    lenis=new Lenis({duration:1.15,smoothWheel:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){const t=document.querySelector(id);if(t){e.preventDefault();lenis.scrollTo(t,{offset:-70});}}}));
  }
  ScrollTrigger.addEventListener('refresh',()=>{});
  const progress=document.getElementById('progress');
  ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{gsap.set(progress,{scaleX:s.progress});onScrollNav(s.scroll());}});

  /* ---------- HERO intro ---------- */
  const tl=gsap.timeline({defaults:{ease:'expo.out'}});
  tl.from('.hero h1 .line > span',{yPercent:110,duration:1.2,stagger:.09})
    .from('.hero-in',{y:30,opacity:0,duration:1,stagger:.08},'-=.8')
    .from('.card-img',{clipPath:'inset(100% 0 0 0)',duration:1.4,stagger:.12,ease:'expo.inOut'},0.2)
    .from('.card-img img',{scale:1.35,duration:1.8,stagger:.12},0.2);

  /* counters */
  document.querySelectorAll('[data-count]').forEach(el=>{
    const n=+el.dataset.count,o={v:0};
    gsap.to(o,{v:n,duration:1.8,delay:.9,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(o.v)+(n===48?'h':'')});
  });

  /* ---------- HERO 3D parallax: pointer tilt + scroll depth ---------- */
  const stage=document.getElementById('stage'),inner=document.getElementById('stageInner');
  const layers=[...inner.querySelectorAll('[data-depth]')];
  if(window.matchMedia('(pointer:fine)').matches){
    const rx=gsap.quickTo(inner,'rotationX',{duration:.9,ease:'power3'}),ry=gsap.quickTo(inner,'rotationY',{duration:.9,ease:'power3'});
    const movers=layers.map(l=>({x:gsap.quickTo(l,'x',{duration:1,ease:'power3'}),y:gsap.quickTo(l,'y',{duration:1,ease:'power3'}),d:+l.dataset.depth}));
    window.addEventListener('pointermove',e=>{
      const px=e.clientX/innerWidth-.5,py=e.clientY/innerHeight-.5;
      rx(-py*9);ry(px*12);
      movers.forEach(m=>{m.x(px*28*m.d);m.y(py*22*m.d);});
    });
  }
  layers.forEach(l=>{
    gsap.to(l,{yPercent:-22*(+l.dataset.depth),ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  });
  gsap.utils.toArray('.card-img img').forEach(img=>gsap.to(img,{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}}));
  gsap.to('.hero__grid > div:first-child',{y:-80,opacity:.3,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

  /* ---------- MARQUEE REELS: infinite + velocity-reactive ---------- */
  function reel(el,dir){
    let x=0,speed=dir*0.6,boost=0;const w=()=>el.scrollWidth/2;
    gsap.ticker.add(()=>{
      x+= (speed + boost*dir);
      boost*=0.92;
      const W=w(); if(dir<0&&x<=-W)x+=W; if(dir>0&&x>=0)x-=W;
      el.style.transform=`translate3d(${x}px,0,0)`;
    });
    if(dir>0)x=-w();
    ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{boost=Math.min(Math.abs(s.getVelocity())/120,18);}});
  }
  reel(document.getElementById('reelA'),-1);
  reel(document.getElementById('reelB'),1);

  /* ---------- generic reveals ---------- */
  gsap.utils.toArray('.rv').forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}});
  });

  /* ---------- data-speed parallax (bento bg) ---------- */
  gsap.utils.toArray('[data-speed]').forEach(el=>{
    const s=+el.dataset.speed;
    gsap.fromTo(el,{yPercent:-s*50},{yPercent:s*50,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });

  const mm=gsap.matchMedia();

  mm.add('(min-width: 901px)',()=>{
    /* ---------- HORIZONTAL ROLE REEL (pinned side-scroll) ---------- */
    const track=document.getElementById('hzTrack'),bar=document.getElementById('hzBar'),num=document.getElementById('hzNum');
    const dist=()=>track.scrollWidth-innerWidth+parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad'))*0+40;
    const hz=gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#hzPin',start:'top top',end:()=>'+='+dist(),pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1,
      onUpdate:s=>{gsap.set(bar,{scaleX:s.progress});num.textContent=String(Math.min(9,1+Math.floor(s.progress*9))).padStart(2,'0');}}});
    /* inner image parallax inside each card while sliding */
    gsap.utils.toArray('.role__img img').forEach(img=>{
      gsap.fromTo(img,{xPercent:-8},{xPercent:4,ease:'none',scrollTrigger:{trigger:img.closest('.role'),containerAnimation:hz,start:'left right',end:'right left',scrub:true}});
    });
    gsap.utils.toArray('.role').forEach(card=>{
      gsap.from(card,{rotateY:-14,opacity:.35,transformPerspective:900,transformOrigin:'left center',ease:'none',scrollTrigger:{trigger:card,containerAnimation:hz,start:'left 100%',end:'left 65%',scrub:true}});
    });

    /* ---------- CALENDAR side-scroll (scrubbed, no pin) ---------- */
    const ct=document.getElementById('calTrack');
    gsap.fromTo(ct,{x:60},{x:()=>-(ct.scrollWidth-innerWidth+60),ease:'none',scrollTrigger:{trigger:'#calRail',start:'top 85%',end:'bottom 10%',scrub:1,invalidateOnRefresh:true}});

    /* ---------- process: drawn line + active step + image swap ---------- */
    const imgs=[...document.querySelectorAll('#procMedia img')];
    gsap.to('#stepsLine',{scaleY:1,ease:'none',scrollTrigger:{trigger:'#steps',start:'top 60%',end:'bottom 60%',scrub:true}});
    document.querySelectorAll('.step').forEach((st,i)=>{
      ScrollTrigger.create({trigger:st,start:'top 60%',end:'bottom 60%',onToggle:s=>{if(s.isActive){document.querySelectorAll('.step').forEach(x=>x.classList.toggle('active',+x.dataset.i<=i));imgs.forEach((im,j)=>im.classList.toggle('on',j===i));}}});
    });

    /* ---------- band: deep background parallax + title drift ---------- */
    gsap.fromTo('#bandBg',{yPercent:-12},{yPercent:12,ease:'none',scrollTrigger:{trigger:'#band',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('#bandTitle',{x:-60},{x:40,ease:'none',scrollTrigger:{trigger:'#band',start:'top bottom',end:'bottom top',scrub:true}});

    /* candidate image parallax */
    gsap.fromTo('#candImg',{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:'#candidates',start:'top bottom',end:'bottom top',scrub:true}});
  });

  /* bento cells stagger */
  gsap.from('.bento .cell',{y:60,opacity:0,duration:1,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.bento',start:'top 80%'}});

  /* models stagger already via .rv; footer wordmark side drift */
  gsap.fromTo('#footBig',{xPercent:8},{xPercent:-6,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:true}});

  window.addEventListener('load',()=>ScrollTrigger.refresh());
})();
