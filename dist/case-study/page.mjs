import {caseStudyContent,caseStudyLinks} from '../caseStudyContent.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const todo=(text,extra='')=>`<div class="cs-todo ${extra}">${esc(text)}</div>`;
const copy=value=>String(value).includes('[TODO')?todo(value,'cs-inline-todo'):esc(value);
const arrow='<span class="cs-arrow" aria-hidden="true">→</span>';
const supervisorIcon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4h4v9h-4M17 17h4"/></svg>';
function media(slot,cls=''){
 const key=slot.path.replace(/[^a-z0-9]/gi,'-');
 if(!slot.src)return `<div class="cs-media cs-todo ${cls}" id="${key}"><p>${esc(slot.todo)}</p><code>${esc(slot.path)}</code></div>`;
 return `<figure class="cs-media ${cls}"><img src="${esc(slot.src)}" alt="${esc(slot.alt)}" data-fallback="${key}"></figure>`;
}
const heading=(n,s)=>`<div class="cs-section-head"><span class="cs-number">${String(n).padStart(2,'0')}</span><h2 id="${s.id}-heading">${esc(s.heading)}</h2></div>`;
function diagram(c){const d=c.gap.diagram;return `<figure class="cs-diagram cs-wide" aria-label="${esc(d.label)}"><div class="cs-diagram-row"><h3>${esc(d.today)}</h3><div class="cs-node-row cs-today-nodes">${d.todayNodes.map((node,i)=>`${i?arrow:''}<div class="cs-node">${esc(node)}${i===1?`<small>${esc(d.crmNote)}</small>`:''}</div>`).join('')}</div><div class="cs-chat-path"><span>${esc(d.sidePath)}</span></div><div class="cs-supervisor">${supervisorIcon}<span>${esc(d.supervisor)}</span>${arrow}<span class="cs-node cs-small-node">${esc(d.exportNote)}</span></div></div><div class="cs-diagram-row cs-proposed"><h3>${esc(d.withLeadFlow)}</h3><div class="cs-node-row">${d.leadFlowNodes.map((node,i)=>`${i?arrow:''}<div class="cs-node">${esc(node)}${i===1?`<small>${esc(d.handoffNote)}</small>`:''}</div>`).join('')}</div><div class="cs-supervisor">${supervisorIcon}<span>${esc(d.supervisor)}</span>${arrow}<span class="cs-node cs-small-node">${esc(d.timeoutNote)}</span></div></div></figure>`;}
export function renderCaseStudy(locale='en'){
const c=Object.hasOwn(caseStudyContent,locale)?caseStudyContent[locale]:caseStudyContent.en;
const sections=[c.gap,c.evidence,c.rules,c.decisions,c.rollout,c.limits,c.build,c.tryIt];
const meta=c.hero.meta;
const html=`
 <header class="cs-header"><a class="cs-brand" href="${caseStudyLinks.demo}"><span class="cs-brand-mark" aria-hidden="true">⇄</span>${esc(c.brand)}</a><div class="cs-header-right"><span>${esc(c.navLabel)}</span><a href="${caseStudyLinks.demo}">${esc(c.backLabel)} <span aria-hidden="true">↗</span></a></div></header>
 <main class="cs-article">
  <section class="cs-hero" aria-labelledby="hero-title"><div class="eyebrow">${esc(c.brand)} / ${esc(c.navLabel)}</div><h1 id="hero-title">${esc(c.hero.title)}</h1><p class="cs-subtitle">${esc(c.hero.subtitle)}</p><div class="cs-meta"><div><span>${esc(meta.roleLabel)}:</span> ${copy(meta.role)}</div><span class="cs-meta-dot" aria-hidden="true">·</span><div><span>${esc(meta.timelineLabel)}:</span> ${copy(meta.timeline)}</div><span class="cs-meta-dot" aria-hidden="true">·</span><div><span>${esc(meta.toolsLabel)}:</span> ${copy(meta.tools)}</div></div><div class="cs-actions"><a class="cs-button cs-primary" href="${caseStudyLinks.demo}">${esc(c.hero.demoButton)} <span aria-hidden="true">↗</span></a><a class="cs-button" href="${esc(c.hero.walkthrough.url||'#walkthrough-todo')}">${esc(c.hero.walkthrough.label)} <span aria-hidden="true">▷</span></a></div>${!c.hero.walkthrough.url?todo(c.hero.walkthrough.todo,'cs-video-todo'):''}${media(c.hero.media,'cs-hero-media')}</section>
  <nav class="cs-contents" aria-label="${esc(c.sectionLabel)}">${sections.map(s=>`<a href="#${s.id}">${esc(s.nav)}</a>`).join('')}</nav>
  <section class="cs-section" id="${c.gap.id}" aria-labelledby="${c.gap.id}-heading">${heading(2,c.gap)}<p>${esc(c.gap.body)}</p><ul class="cs-points">${c.gap.points.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${diagram(c)}<p class="cs-clarification">${esc(c.gap.clarification)}</p></section>
  <section class="cs-section" id="${c.evidence.id}" aria-labelledby="${c.evidence.id}-heading">${heading(3,c.evidence)}<p>${esc(c.evidence.intro)}</p><ol class="cs-decisions">${c.evidence.items.map(item=>`<li><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><a href="${esc(item.url)}">${esc(item.source)}</a></li>`).join('')}</ol></section>
  <section class="cs-section" id="${c.rules.id}" aria-labelledby="${c.rules.id}-heading">${heading(4,c.rules)}<div class="cs-rule-grid">${c.rules.items.map((r,i)=>`<article class="cs-rule panel"><div class="cs-rule-copy"><span class="cs-rule-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></div>${media(r.media)}</article>`).join('')}</div></section>
  <section class="cs-section" id="${c.decisions.id}" aria-labelledby="${c.decisions.id}-heading">${heading(5,c.decisions)}<ol class="cs-decisions">${c.decisions.items.map(d=>`<li><h3>${esc(d.decision)}</h3><dl><dt>${esc(c.decisions.alternativeLabel)}</dt><dd>${esc(d.alternative)}</dd><dt>${esc(c.decisions.whyLabel)}</dt><dd>${esc(d.why)}</dd></dl></li>`).join('')}</ol></section>
  <section class="cs-section" id="${c.rollout.id}" aria-labelledby="${c.rollout.id}-heading">${heading(6,c.rollout)}<p>${esc(c.rollout.body)}</p><p class="cs-demo-fact">${esc(c.rollout.sample)}</p>${media(c.rollout.media)}</section>
  <section class="cs-section" id="${c.limits.id}" aria-labelledby="${c.limits.id}-heading">${heading(7,c.limits)}<ul class="cs-points">${c.limits.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p>${esc(c.limits.next)}</p></section>
  <section class="cs-section" id="${c.build.id}" aria-labelledby="${c.build.id}-heading">${heading(8,c.build)}<p>${esc(c.build.body)}</p><p>${esc(c.build.process)}</p></section>
  <section class="cs-section cs-try" id="${c.tryIt.id}" aria-labelledby="${c.tryIt.id}-heading">${heading(9,c.tryIt)}<ol class="cs-route">${c.tryIt.steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><a class="cs-button cs-primary" href="${caseStudyLinks.demo}">${esc(c.tryIt.button)} <span aria-hidden="true">↗</span></a></section>
 </main><footer class="cs-footer"><span>${esc(c.brand)} / ${esc(c.navLabel)}</span><a href="${caseStudyLinks.demo}">${esc(c.backLabel)} <span aria-hidden="true">↗</span></a></footer>`;
return {content:c,html};
}

function enhanceCaseStudy(){
 const mount=document.querySelector('#case-study');
 if(!mount)return;
 const locale=new URLSearchParams(location.search).get('lang')||'en';
 const c=Object.hasOwn(caseStudyContent,locale)?caseStudyContent[locale]:caseStudyContent.en;
 if(!mount.innerHTML.trim()||document.documentElement.lang!==c.language){
  mount.innerHTML=renderCaseStudy(locale).html;
  document.title=c.pageTitle;
  document.documentElement.lang=c.language;
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content=c.hero.subtitle;
 }
const walkthroughTodo=document.querySelector('.cs-video-todo');if(walkthroughTodo)walkthroughTodo.id='walkthrough-todo';
// If a configured asset fails to load, keep the missing work visible instead of a broken image.
for(const img of document.querySelectorAll('[data-fallback]'))img.addEventListener('error',()=>{
 const slots=[c.hero.media,...c.rules.items.map(r=>r.media),c.rollout.media];const slot=slots.find(s=>s.path.replace(/[^a-z0-9]/gi,'-')===img.dataset.fallback);
 if(slot){const fallback=document.createElement('div');fallback.className='cs-media cs-todo';fallback.innerHTML=`<p>${esc(slot.todo)}</p><code>${esc(slot.path)}</code>`;img.closest('figure').replaceWith(fallback);}
});
}

if(typeof document!=='undefined')enhanceCaseStudy();
