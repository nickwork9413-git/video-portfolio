const app=document.querySelector('#app');
const site=window.SITE_DATA;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=value=>new URL(value,document.baseURI).href;
const media=(v,kind)=>{const url=asset(`./media/${kind==='cover'?'covers':'videos'}/${kind==='cover'?v.coverFile:v.videoFile}`);return kind==='cover'?url:`${url}?quality=900p-crf27-v1`;};
let activeCategory='all',query='';

document.addEventListener('contextmenu',e=>{if(e.target.closest('video,.thumb img'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.closest('video,.thumb img'))e.preventDefault()});

function applySettings(s){
  document.documentElement.style.setProperty('--blue',s.primaryColor);
  document.documentElement.style.setProperty('--navy',s.accentColor);
  document.title=s.browserTitle||s.siteName;
  document.querySelector('meta[name="description"]').content=s.seoDescription||'';
}
const brand=s=>`<a class="brand" href="./"><span class="mark">${esc(s.logoText)}</span><span>${esc(s.siteName)}</span></a>`;
const cover=v=>`<div class="thumb">${v.hasCover?`<img loading="lazy" src="${media(v,'cover')}" alt="${esc(v.title)}封面">`:`<div class="placeholder"><small>VISUAL / VIDEO WORKS</small>${esc(v.category_name)}<br>CREATIVE</div>`}<span class="play">▶</span></div>`;
const heroShowcase=videos=>{const picks=videos.filter(v=>v.hasCover).slice(0,3);return `<div class="hero-showcase" aria-label="精选作品预览"><div class="showcase-glow"></div><div class="hero-showcase-label"><span>CURATED REEL</span><b>2026 / SELECTED</b></div><div class="hero-posters">${picks.map((v,i)=>`<div class="hero-poster hero-poster-${i+1}"><img src="${media(v,'cover')}" alt="${esc(v.title)}"><span>${esc(v.number||String(i+1).padStart(2,'0'))}</span></div>`).join('')}</div><div class="hero-showcase-foot"><span>PERFORMANCE CREATIVE</span><span>MOTION · AI · UGC</span></div></div>`};
function initHomeMotion(){const showcase=document.querySelector('.hero-showcase');if(showcase&&matchMedia('(pointer:fine)').matches){const reset=()=>['--tilt-x','--tilt-y','--p1x','--p1y','--p2x','--p2y','--p3x','--p3y'].forEach(name=>showcase.style.removeProperty(name));showcase.onpointermove=event=>{const rect=showcase.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;showcase.style.setProperty('--tilt-x',`${((x-.5)*5).toFixed(2)}deg`);showcase.style.setProperty('--tilt-y',`${((.5-y)*4).toFixed(2)}deg`);showcase.style.setProperty('--glow-x',`${(x*100).toFixed(1)}%`);showcase.style.setProperty('--glow-y',`${(y*100).toFixed(1)}%`);showcase.style.setProperty('--p1x',`${((x-.5)*12).toFixed(1)}px`);showcase.style.setProperty('--p1y',`${((y-.5)*10).toFixed(1)}px`);showcase.style.setProperty('--p2x',`${((x-.5)*-18).toFixed(1)}px`);showcase.style.setProperty('--p2y',`${((y-.5)*-12).toFixed(1)}px`);showcase.style.setProperty('--p3x',`${((x-.5)*20).toFixed(1)}px`);showcase.style.setProperty('--p3y',`${((y-.5)*14).toFixed(1)}px`)};showcase.onpointerleave=reset}document.querySelectorAll('.grid .card').forEach((card,index)=>card.style.setProperty('--card-index',index%12))}

function renderHome(){
  const {settings:s,categories,videos}=site;applySettings(s);document.body.className='';
  app.innerHTML=`<header class="shell site-header">${brand(s)}<div class="header-right"><span>●</span>${esc(s.eyebrow)}</div></header><main><section class="hero ${esc(s.theme)}"><div class="shell hero-inner"><div class="hero-copy"><div class="eyebrow">${esc(s.eyebrow)}</div><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroDescription)}</p><div class="hero-actions"><a class="btn" href="#works">浏览精选作品 <span>↘</span></a></div>${s.showStats?`<div class="stats"><div><b>${String(videos.length).padStart(2,'0')}</b><span>精选项目</span></div><div><b>${String(categories.length).padStart(2,'0')}</b><span>创意方向</span></div><div class="stats-note">海外投放视觉<br>与动态内容设计</div></div>`:''}</div>${heroShowcase(videos)}</div></section><section class="shell work-section" id="works"><div class="section-head"><div><div class="section-kicker">SELECTED WORKS / 作品索引</div><h2>视频作品</h2></div><p>点击作品，观看完整视频</p></div><div class="toolbar">${s.showCategories?`<div class="filters"><button class="filter active" data-category="all">全部作品</button>${categories.map(c=>`<button class="filter" data-category="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>`:'<div></div>'}${s.showSearch?'<input id="search" class="search" type="search" placeholder="搜索作品标题" aria-label="搜索作品标题">':''}</div><div class="grid" id="grid" style="--columns:${Number(s.columns)||3}"></div></section></main><footer class="footer"><div class="shell footer-inner"><div><b>${esc(s.siteName)}</b><p>${esc(s.footer)}</p></div><small>© ${new Date().getFullYear()} · VISUAL / VIDEO WORKS</small></div></footer>`;
  renderGrid();
  initHomeMotion();
  app.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{activeCategory=button.dataset.category;app.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('active',x===button));renderGrid()});
  app.querySelector('#search')?.addEventListener('input',event=>{query=event.target.value;renderGrid()});
}

function renderGrid(){
  const list=site.videos.filter(v=>(activeCategory==='all'||v.category_id===activeCategory)&&`${v.title} ${v.tags} ${v.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const grid=app.querySelector('#grid');
  grid.innerHTML=list.length?list.map(v=>`<a class="card" href="?v=${encodeURIComponent(v.id)}" data-id="${esc(v.id)}">${cover(v)}<div class="card-body"><div class="card-meta"><span>${esc(v.number||'WORK')}</span><span>${esc(v.category_name)}</span></div><h3>${esc(v.title)}</h3><p>${esc(v.tags||v.description).slice(0,85)}</p></div></a>`).join(''):'<div class="empty"><div class="empty-icon">✦</div><h3>没有找到匹配的作品</h3><p>试试其他分类或搜索词。</p></div>';
  grid.querySelectorAll('[data-id]').forEach(card=>card.onclick=event=>{event.preventDefault();openVideo(site.videos.find(v=>v.id===card.dataset.id),true)});
  initHomeMotion();
}

function openVideo(v,updateUrl=false){
  if(!v)return;
  if(updateUrl)history.pushState({video:v.id},'',`?v=${encodeURIComponent(v.id)}`);
  const modal=document.createElement('div');modal.className='modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
  modal.innerHTML=`<div class="modal-panel"><div class="modal-top"><h2>${esc(v.title)}</h2><button class="icon-btn" aria-label="关闭">✕</button></div>${v.hasVideo?`<video controls controlsList="nodownload noremoteplayback" disablepictureinpicture disableremoteplayback playsinline preload="metadata" poster="${v.hasCover?media(v,'cover'):''}" src="${media(v,'video')}"></video>`:'<div class="notice">这条作品暂时没有可播放视频。</div>'}<p>${esc(v.description)}</p><button class="back" type="button">← 返回作品列表</button></div>`;
  document.body.append(modal);const player=modal.querySelector('video');player?.play().catch(()=>{});
  const close=()=>{player?.pause();modal.remove();if(new URL(location.href).searchParams.has('v'))history.pushState({},'',location.pathname+location.hash)};
  modal.querySelector('.icon-btn').onclick=close;modal.querySelector('.back').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
}

window.onpopstate=()=>{document.querySelector('.modal')?.remove();const id=new URL(location.href).searchParams.get('v');if(id)openVideo(site.videos.find(v=>v.id===id),false)};
renderHome();
const initialId=new URL(location.href).searchParams.get('v');if(initialId)openVideo(site.videos.find(v=>v.id===initialId),false);
