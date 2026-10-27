const app=document.querySelector('#app');
const site=window.SITE_DATA;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=value=>new URL(value,document.baseURI).href;
const media=(v,kind)=>asset(`./media/${kind==='cover'?'covers':'videos'}/${kind==='cover'?v.coverFile:v.videoFile}`);
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

function renderHome(){
  const {settings:s,categories,videos}=site;applySettings(s);document.body.className='';
  app.innerHTML=`<header class="shell site-header">${brand(s)}<div class="header-right"><span>●</span>${esc(s.eyebrow)}</div></header><main><section class="hero ${esc(s.theme)}"><div class="shell hero-inner"><div><div class="eyebrow">${esc(s.eyebrow)}</div><h1>${esc(s.heroTitle)}</h1><p>${esc(s.heroDescription)}</p><div class="hero-actions"><a class="btn" href="#works">浏览视频作品 ↓</a></div>${s.showStats?`<div class="stats"><div><b>${String(videos.length).padStart(2,'0')}</b><span>公开作品</span></div><div><b>${String(categories.length).padStart(2,'0')}</b><span>创意分类</span></div></div>`:''}</div><div class="hero-art" aria-hidden="true"><div class="grid-lines"></div><div class="orb"></div><div class="art-small">VISUAL DESIGN / MOTION PORTFOLIO</div><div class="art-type">VIDEO<br>WORKS.</div><div class="art-play">▶</div></div></div></section><section class="shell work-section" id="works"><div class="section-head"><div><div class="section-kicker">SELECTED WORKS / 作品索引</div><h2>视频作品</h2></div><p>点击作品，观看完整视频</p></div><div class="toolbar">${s.showCategories?`<div class="filters"><button class="filter active" data-category="all">全部作品</button>${categories.map(c=>`<button class="filter" data-category="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>`:'<div></div>'}${s.showSearch?'<input id="search" class="search" type="search" placeholder="搜索作品标题" aria-label="搜索作品标题">':''}</div><div class="grid" id="grid" style="--columns:${Number(s.columns)||3}"></div></section></main><footer class="footer"><div class="shell footer-inner"><div><b>${esc(s.siteName)}</b><p>${esc(s.footer)}</p></div><small>© ${new Date().getFullYear()} · VISUAL / VIDEO WORKS</small></div></footer>`;
  renderGrid();
  app.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{activeCategory=button.dataset.category;app.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('active',x===button));renderGrid()});
  app.querySelector('#search')?.addEventListener('input',event=>{query=event.target.value;renderGrid()});
}

function renderGrid(){
  const list=site.videos.filter(v=>(activeCategory==='all'||v.category_id===activeCategory)&&`${v.title} ${v.tags} ${v.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const grid=app.querySelector('#grid');
  grid.innerHTML=list.length?list.map(v=>`<a class="card" href="?v=${encodeURIComponent(v.id)}" data-id="${esc(v.id)}">${cover(v)}<div class="card-body"><div class="card-meta"><span>${esc(v.number||'WORK')}</span><span>${esc(v.category_name)}</span></div><h3>${esc(v.title)}</h3><p>${esc(v.tags||v.description).slice(0,85)}</p></div></a>`).join(''):'<div class="empty"><div class="empty-icon">✦</div><h3>没有找到匹配的作品</h3><p>试试其他分类或搜索词。</p></div>';
  grid.querySelectorAll('[data-id]').forEach(card=>card.onclick=event=>{event.preventDefault();openVideo(site.videos.find(v=>v.id===card.dataset.id),true)});
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
