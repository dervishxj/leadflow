import {VEHICLE_MODELS,getModel,modelRange} from './catalog.mjs';
export const users=[{id:'u1',name:'林悦',team:'线上直营',role:'线上销售'},{id:'u2',name:'周辰',team:'杭州湖滨店',role:'门店销售'},{id:'u3',name:'许宁',team:'杭州湖滨店',role:'门店销售'},{id:'u4',name:'陆远',team:'杭州滨江店',role:'门店销售'},{id:'mgr',name:'沈知行',team:'华东直营',role:'主管'}];
export const person=id=>users.find(x=>x.id===id);
const H=3600000; export const rules={receive:30*60000,contact:2*H,cold:30*24*H,early:15*60000,escalate:2*H};
const open=t=>['待办','进行中'].includes(t.status);
export function seed(){
 const now=Date.parse('2026-10-12T09:30:00+08:00');
 const s={version:1,now,user:'u1',leads:[],tasks:[],transfers:[],events:[],reminders:[],appointments:[],seq:500};
 const names=['陈女士','王先生','李女士','张先生','赵女士','刘先生','孙女士','黄先生','吴女士','郑先生','冯女士','蒋先生','许女士','何先生','吕女士','施先生','沈女士','韩先生','杨女士','朱先生','秦女士','尤先生','彭女士','徐先生','陆女士','程先生','宋女士','唐先生','苏女士','潘先生'];
 names.forEach((name,i)=>{
  const owner=i===0?'u1':i===1?'u1':i===2?'u1':i===3?'u2':i===4?'u1':i===5?'u1':i===6?'u1':i===7?'u1':i%9===0?null:users[i%4].id;
  const life=i===1||i===5||i===6||i===13||i===21?'已流失':i===4||i===10||i===18?'培育中':i===11||i===19?'已成交':'活跃';
  const l={id:'L'+String(i+1).padStart(3,'0'),name,owner,team:owner?person(owner).team:'线上直营',source:['品牌小程序','品牌官网','自然到店','品牌活动'][i%4],model:VEHICLE_MODELS[i%VEHICLE_MODELS.length].name,city:'杭州',budget:modelRange(VEHICLE_MODELS[i%VEHICLE_MODELS.length].name),phone:'演示号码 · '+String(6800+i),life,stage:!owner?(life==='培育中'?'培育中':'新咨询'):i===0?'已联系':['新咨询','已联系','已预约','已到店','已试驾'][i%5],intent:i%3===0?'高意向':'一般意向',created:now-(i%24+1)*24*H,cycle:'C'+i,allowed:i!==5,valid:i!==6,summary:i===0?'计划本月购车，关注长续航版本。希望周六到湖滨店试驾，需提前确认儿童座椅。':i===1?'此前因预算不符暂缓购车，近期主动咨询新的购车方案。':'已了解车型与预算，请结合客户时间安排下一次沟通。',lostAt:life==='已流失'?now-(i===1?35:i===13?5:i===21?12:40)*24*H:null,reason:life==='已流失'?(i===5?'明确拒绝联系':i===6?'无效联系方式':'预算不符'):'',reviewAt:life==='培育中'?now+(i===4?0:48)*H:null};
  if(l.lostAt)l.created=l.lostAt-3*24*H;
  s.leads.push(l); s.events.push({id:'seed'+i,lead:l.id,cycle:l.cycle,at:l.created,action:'线索创建',actor:owner||'mgr',team:l.team,text:'来自'+l.source,stage:'新咨询'});
  if(l.stage!=='新咨询')s.events.push({id:'stage'+i,lead:l.id,cycle:l.cycle,at:l.created+H,action:'阶段推进',actor:owner||'mgr',team:l.team,text:'需求沟通与进展记录',stage:l.stage});
  if(life==='已流失')s.events.push({id:'lost'+i,lead:l.id,cycle:l.cycle,at:l.lostAt,action:'标记流失',actor:owner||'mgr',team:l.team,text:l.reason});
  if(life==='已成交')s.events.push({id:'won'+i,lead:l.id,cycle:l.cycle,at:now-i*H,action:'成交',actor:owner,team:l.team,text:'完成模拟购车确认',stage:'已成交'});
  if(life==='活跃'||life==='培育中')addTask(s,l,owner?'客户跟进':'分配线索',owner||'mgr',now+(i%5-1)*H);
  if(life==='培育中'&&owner)s.tasks.at(-1).type='培育复访';
 });
 // Seed two pending handoffs; seeded transitions use the same business operations as real actions.
 transfer(s,'L003','u2','客户希望在湖滨店试驾','已确认车型，需电话确认到店时间','联系并确认试驾');
 s.transfers.at(-1).at=now-3*H; s.transfers.at(-1).due=now-2.5*H;
 s.tasks.find(t=>t.transfer===s.transfers.at(-1).id).due=now-2.5*H;
 s.user='u2';transfer(s,'L004','u1','客户希望远程沟通','客户已离店，近期无法再次到店','远程确认配置');
 // Completed transfers provide explainable historic samples for the manager view.
 for(const [id,to,hours] of [['L009','u2',20],['L013','u4',44],['L017','u2',66]]){const l=s.leads.find(l=>l.id===id);const current=s.now;s.now=current-hours*H;s.user=l.owner;const x=transfer(s,id,to,'服务地点调整',l.summary,'确认下一次沟通');s.now+=20*60000;s.user=to;resolve(s,id,'已接收');s.now=current;}
 s.user='u1'; scan(s);return s;
}
export function event(s,l,action,text,extra={}){s.events.push({id:'E'+(++s.seq),lead:l.id,cycle:l.cycle,at:s.now,action,actor:s.user,team:person(s.user).team,text,...extra});}
export function addTask(s,l,type,owner,due,extra={}){const task={id:'T'+(++s.seq),lead:l.id,cycle:l.cycle,type,owner,due,originalDue:due,status:'待办',delays:[],...extra};s.tasks.push(task);return task;}
export const pending=(s,id)=>s.transfers.find(t=>t.lead===id&&t.status==='待接收');
export const tasksFor=(s,id)=>s.tasks.filter(t=>t.lead===id&&open(t));
export const eligible=(s,l)=>l.life==='已流失'&&l.allowed&&l.valid&&!['已购竞品','购车计划取消'].includes(l.reason)&&s.now-l.lostAt>=rules.cold;
export const visible=(s,l)=>s.user==='mgr'||l.owner===s.user||pending(s,l.id)?.to===s.user;
function get(s,id){const l=s.leads.find(l=>l.id===id);if(!l)throw Error('线索不存在');return l;}
function manage(s,l){if(s.user!=='mgr'&&l.owner!==s.user)throw Error('请切换至当前负责人处理');}
function required(v,label){if(!v?.trim())throw Error('请填写'+label);return v.trim();}
function closeTasks(s,l,why){s.tasks.filter(t=>t.lead===l.id&&t.domain!=='service'&&open(t)).forEach(t=>{t.status='已取消';t.result=why;});}
function closeTransfer(s,l,why){const x=pending(s,l.id);if(x){x.status='已撤回';x.end=s.now;event(s,l,'交接撤回',why);}}
export function transfer(s,id,to,reason,summary,next){const l=get(s,id);manage(s,l);if(!['活跃','培育中'].includes(l.life))throw Error('请先激活线索再转交');if(pending(s,id))throw Error('已有待接收交接');if(to===l.owner||!person(to)||to==='mgr')throw Error('请选择其他销售');required(reason,'转交原因');required(summary,'沟通摘要');required(next,'下一步建议');const x={id:'X'+(++s.seq),lead:id,from:l.owner,fromTeam:l.team,to,reason,summary,next,status:'待接收',at:s.now,due:s.now+rules.receive};s.transfers.push(x);addTask(s,l,'接收线索',to,x.due,{transfer:x.id});event(s,l,'发起交接',`${l.owner?person(l.owner).name:'团队池'} → ${person(to).name} · ${reason}`,{transfer:x.id});return x;}
export function resolve(s,id,action,reason=''){const l=get(s,id),x=pending(s,id);if(!x)throw Error('该交接已处理');if(action==='已撤回'){manage(s,l);}else if(s.user!==x.to&&s.user!=='mgr')throw Error('请切换至接收人处理');if(action==='已退回')required(reason,'退回原因');x.status=action;x.end=s.now;x.result=reason;s.tasks.filter(t=>t.transfer===x.id&&open(t)).forEach(t=>{t.status=action==='已接收'?'已完成':'已取消';t.completed=s.now;});
 if(action==='已接收'){l.owner=x.to;l.team=person(x.to).team;l.summary=x.summary;tasksFor(s,id).forEach(t=>{if(t.type==='分配线索'){t.status='已完成';t.completed=s.now;}else t.owner=x.to;});if(!tasksFor(s,id).some(t=>/联系|跟进|复访/.test(t.type)))addTask(s,l,'接手联系',x.to,s.now+rules.contact);else if(l.life==='活跃'){const t=tasksFor(s,id).find(t=>/联系|跟进|复访/.test(t.type));t.type='接手联系';t.note=x.next;}
 const a=s.appointments.find(a=>a.lead===id&&a.status==='已预约');if(a&&a.team!==l.team&&!tasksFor(s,id).some(t=>t.type==='确认/重排预约'))addTask(s,l,'确认/重排预约',x.to,s.now+rules.contact);
 } else if(action==='已退回'&&!tasksFor(s,id).some(t=>t.type==='处理退回'))addTask(s,l,'处理退回',l.owner||'mgr',s.now+rules.contact);
 event(s,l,action,reason||`${person(x.to).name}接收，跟进任务同步迁移`,{transfer:x.id});}
export function reclaim(s,id,reason){if(s.user!=='mgr')throw Error('仅主管可回收');const l=get(s,id);if(!['活跃','培育中'].includes(l.life))throw Error('仅回收活跃或培育线索');required(reason,'回收原因');closeTransfer(s,l,reason);s.tasks.filter(t=>t.lead===id&&t.type==='接收线索'&&open(t)).forEach(t=>t.status='已取消');const previousStage=l.stage;l.owner=null;l.stage=l.life==='培育中'?'培育中':'新咨询';tasksFor(s,id).forEach(t=>t.owner='mgr');if(!tasksFor(s,id).some(t=>t.type==='分配线索'))addTask(s,l,'分配线索','mgr',s.now+15*60000);event(s,l,'主管回收',reason+' · 已进入'+l.team+'待分配池',{previousStage,stage:l.stage});}
export function lifecycle(s,id,state,reason,date,allowed=true){const l=get(s,id);manage(s,l);if(!['活跃','培育中'].includes(l.life))throw Error('当前状态不能再次结束');required(reason,'原因');if(state==='已成交'&&!l.owner)throw Error('请先分配销售，再确认成交');if(state==='培育中'&&!(date>s.now))throw Error('复访时间需要晚于当前演示时间');closeTransfer(s,l,'生命周期变更');closeTasks(s,l,'转为'+state);l.life=state;l.reason=reason;if(state==='已流失'){l.lostAt=s.now;l.allowed=allowed&&reason!=='明确拒绝联系';if(reason==='无效联系方式')l.valid=false;}if(state==='培育中'){if(!l.owner)l.stage='培育中';l.reviewAt=date;addTask(s,l,'培育复访',l.owner||'mgr',date);}s.appointments.filter(a=>a.lead===id&&a.status==='已预约').forEach(a=>a.status='已取消');event(s,l,state==='已流失'?'标记流失':state==='已成交'?'成交':'进入培育',reason,state==='已成交'?{stage:'已成交'}:{});}
export function activate(s,id,reason,{consent=false,corrected=false}={}){const l=get(s,id);manage(s,l);if(!['已流失','培育中'].includes(l.life))throw Error('该线索无需重复激活');required(reason,'新意向依据');if(!l.allowed&&!consent)throw Error('需要记录客户主动联系并明确同意恢复联系');if(!l.valid&&!corrected)throw Error('请先确认联系方式已修正');if(consent){l.allowed=true;event(s,l,'恢复联系许可','客户主动联系并明确同意恢复联系');}if(corrected){l.valid=true;event(s,l,'修正联系信息','已确认新的模拟联系方式');}closeTasks(s,l,'新周期开始');l.cycle='C'+(++s.seq);l.life='活跃';l.stage='待重新确认';if(!person(l.owner)){l.owner=null;l.stage='新咨询';}addTask(s,l,l.owner?'重新确认需求':'分配线索',l.owner||'mgr',s.now+rules.contact);event(s,l,'重新激活',reason,{stage:'待重新确认'});}
export function revisit(s,id){const l=get(s,id);manage(s,l);if(!eligible(s,l))throw Error('该线索尚不符合复访条件');if(tasksFor(s,id).some(t=>t.type==='流失复访'))throw Error('已有复访任务');addTask(s,l,'流失复访',l.owner||'mgr',s.now+rules.contact);event(s,l,'创建复访任务','仅安排复访，尚未确认重新激活');}
export function finish(s,tid,result,next,due,stage){const t=s.tasks.find(t=>t.id===tid);if(!t||!open(t))throw Error('任务已结束');if(t.owner!==s.user&&s.user!=='mgr')throw Error('仅任务负责人可完成');if(['接收线索','分配线索'].includes(t.type))throw Error('请通过交接或分配操作完成');const l=get(s,t.lead);if(!l.owner&&stage&&!['新咨询','培育中'].includes(stage)&&result!=='未接通')throw Error('请先分配销售，再推进购车阶段');required(result,'跟进结果');if(['活跃','培育中'].includes(l.life)){required(next,'下一步');if(!(due>s.now))throw Error('请选择未来的下一步时间');}t.status='已完成';t.completed=s.now;t.result=result;if(next&&due>s.now&&['活跃','培育中'].includes(l.life))addTask(s,l,next,l.owner||'mgr',due);if(stage&&result!=='未接通'&&l.life==='活跃')l.stage=stage;event(s,l,'完成任务',`${t.type}：${result}`,{stage:result==='未接通'?undefined:stage,effective:result!=='未接通'});}
export function postpone(s,id,due,reason){const t=s.tasks.find(t=>t.id===id);if(!t||!open(t))throw Error('任务已结束');if(s.user!==t.owner&&s.user!=='mgr')throw Error('无权延期');required(reason,'延期原因');if(due<=Math.max(s.now,t.due))throw Error('新时间须晚于当前时间与原截止时间');t.delays.push({from:t.due,to:due,reason,at:s.now});t.due=due;event(s,get(s,t.lead),'任务延期',t.type+' · '+reason);}
export function appointment(s,id,date){const l=get(s,id);manage(s,l);if(l.life!=='活跃'||!l.owner)throw Error('请先激活并分配销售');if(!(date>s.now))throw Error('预约时间须晚于当前时间');s.appointments.filter(a=>a.lead===id&&a.status==='已预约').forEach(a=>a.status='已重排');s.tasks.filter(t=>t.lead===id&&t.type==='确认试驾'&&open(t)).forEach(t=>t.status='已取消');s.appointments.push({id:'A'+(++s.seq),lead:id,team:l.team,date,status:'已预约'});l.stage='已预约';addTask(s,l,'确认试驾',l.owner,Math.max(s.now,date-2*H));event(s,l,'预约试驾','已保存模拟试驾安排',{stage:'已预约'});}
export function scan(s){for(const t of s.tasks.filter(open)){let level=s.now>=t.due+rules.escalate?'逾期升级':s.now>=t.due?'任务到期':s.now>=t.due-rules.early?'即将到期':null;if(level){for(const recipient of [...new Set([t.owner,...(t.transfer&&s.now>=t.due?[s.transfers.find(x=>x.id===t.transfer)?.from||'mgr']:[]),...(level==='逾期升级'?['mgr']:[])])]){const key=[t.id,t.due,level,recipient].join(':');if(!s.reminders.some(r=>r.key===key))s.reminders.push({id:'R'+(++s.seq),key,task:t.id,recipient,level,at:s.now,read:false});}}}}
export function newLead(s,name,source,model){required(name,'客户称呼');if(!getModel(model))throw Error('车型不在车型库');const owner=s.user==='mgr'?null:s.user;const l={id:'L'+(++s.seq),name,owner,team:owner?person(owner).team:'线上直营',source,model,city:'杭州',budget:'待确认',phone:'演示号码',life:'活跃',stage:'新咨询',intent:'待确认',created:s.now,cycle:'C'+(++s.seq),allowed:true,valid:true,summary:'新咨询，待确认需求'};s.leads.unshift(l);addTask(s,l,owner?'首次联系':'分配线索',owner||'mgr',s.now+(owner?rules.contact:15*60000));event(s,l,'线索创建','来自'+source,{stage:'新咨询'});return l;}
export const isOpen=open;

export function upgradeCatalog(s){
 if(s.catalogVersion===1)return s;
 for(const l of s.leads){
  if(l.model==='E5 标准版'&&l.budget==='30–35 万'&&!l.imports?.length)l.budget=modelRange(l.model);
  if(['L010','L028'].includes(l.id)&&!l.owner){
   const untouched=!s.events.some(e=>e.lead===l.id&&!/^(seed|stage|won|lost)\d+$/.test(e.id));
   if(untouched){l.life='活跃';l.stage='新咨询';s.events=s.events.filter(e=>e.lead!==l.id||!/^stage|^won/.test(e.id));
    if(!tasksFor(s,l.id).length)addTask(s,l,'分配线索','mgr',s.now+15*60000);}
  }
  if(!l.owner&&l.life==='培育中'){l.stage='培育中';for(const t of tasksFor(s,l.id))if(t.type==='培育复访')t.type='分配线索';}
 }
 s.catalogVersion=1;return s;
}
