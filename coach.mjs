import {guideFor} from './frontier-ux.mjs';

// The guide points at real controls. It never drives combat or spends resources.
export class Coach {
 constructor({state,screen,navigate,render,save,dialog}){
  Object.assign(this,{state,screen,navigate,render,save,dialog});
  this.root=document.createElement('aside');this.root.id='context-coach';this.root.hidden=true;this.root.setAttribute('role','region');this.root.setAttribute('aria-label','Aide contextuelle');document.body.append(this.root);
  this.root.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;
   if(button.dataset.action==='guide-skip'){this.state().guide.enabled=false;this.state().tutorialPaused=false;this.render();this.save();}
   if(button.dataset.action==='guide-ack'&&this.current){const hint=this.current;this.mark(hint.id);if(hint.go)this.navigate(hint.go);else this.render();this.save();}
  });
  window.addEventListener('resize',()=>this.position());window.addEventListener('scroll',()=>this.position(),{passive:true});
 }
 mark(id){const s=this.state();s.guide??={enabled:true,seen:[]};if(!s.guide.seen.includes(id))s.guide.seen.push(id);s.tutorialPaused=false;}
 observe(type,value){if(type==='navigate'&&value==='kingdom')this.mark('kingdom');if(type==='navigate'&&value==='army')this.mark('army');if(type==='job'&&value==='recruit')this.mark('recruit');if(type==='job'&&value==='spell')this.mark('spell');if(type==='unit')this.mark('equip');if(type==='spell')this.mark('equip-spell');if(type==='assign')this.mark('site');}
 clearAnchor(){if(this.anchor){this.anchor.classList.remove('guide-highlight');this.anchor.removeAttribute('aria-describedby');}this.anchor=null;}
 sync(){const s=this.state();s.guide??={enabled:true,seen:[]};const hint=guideFor(s,this.screen());const modal=this.dialog();this.clearAnchor();this.root.hidden=true;
  const anchor=!modal&&hint?document.querySelector(hint.target):null;this.current=anchor?hint:null;const wasPaused=s.tutorialPaused;s.tutorialPaused=!!(modal||anchor);if(wasPaused!==s.tutorialPaused)this.save();document.body.classList.toggle('learning-paused',s.tutorialPaused);
  if(s.tutorialPaused){const mode=document.querySelector('#mode-label');if(mode)mode.textContent='Lecture des explications · tout le jeu est en pause';}
  if(!anchor){this.previous=null;return;}
  this.anchor=anchor;anchor.classList.add('guide-highlight');anchor.setAttribute('aria-describedby','coach-body');
  this.root.innerHTML=`<span class="eyebrow">AIDE CONTEXTUELLE · TEMPS ARRÊTÉ</span><h3>${hint.title}</h3><p id="coach-body">${hint.text}</p><div class="actions"><button class="primary small" data-action="guide-ack">${hint.cta}</button><button class="small" data-action="guide-skip">Quitter le guide</button></div>`;
  this.root.hidden=false;
  const rect=anchor.getBoundingClientRect();if(this.previous!==hint.id&&(rect.top<65||rect.bottom>innerHeight-100))anchor.scrollIntoView({block:'center',behavior:'instant'});
  this.previous=hint.id;this.position();
 }
 position(){if(this.root.hidden||!this.anchor?.isConnected)return;const a=this.anchor.getBoundingClientRect(),box=this.root.getBoundingClientRect(),margin=12;
  let left=innerWidth>900&&a.right<260?a.right+18:Math.max(margin,Math.min(a.left,innerWidth-box.width-margin));
  let top=a.bottom+12;if(top+box.height>innerHeight-margin)top=Math.max(margin,a.top-box.height-12);
  this.root.style.left=`${Math.min(left,innerWidth-box.width-margin)}px`;this.root.style.top=`${Math.max(margin,top)}px`;
 }
}
