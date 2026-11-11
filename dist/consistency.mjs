import * as M from './model.mjs';
import {getModel,parseBudget} from './catalog.mjs';

export const isDevelopment=hostname=>['localhost','127.0.0.1','[::1]','::1'].includes(hostname);
const day=t=>new Date(t+8*3600000).toISOString().slice(0,10);
export function roleScope(s,scopeIds=null){
 const inScope=id=>!scopeIds||scopeIds.has(id);
 return {
  leads:s.leads.filter(l=>inScope(l.id)&&(s.user==='mgr'||l.owner===s.user)),
  tasks:s.tasks.filter(t=>inScope(t.lead)&&(s.user==='mgr'||t.owner===s.user)&&M.isOpen(t)),
  incoming:s.transfers.filter(x=>inScope(x.lead)&&x.status==='待接收'&&(s.user==='mgr'||x.to===s.user))
 };
}
export function checkConsistency(s,{page='leads',scopeIds=null,team='全部团队',source='全部来源',cards={}}={},warn=console.warn){
 const issues=[],flag=(code,message)=>{issues.push({code,message});warn('[LeadFlow consistency] '+code+': '+message);};
 for(const l of s.leads){
  const model=getModel(l.model),budget=parseBudget(l.budget);
  if(!model)flag('MODEL',l.id+' 未知车型 '+l.model);
  else if(budget&&(budget.invalid||budget.min>budget.max||budget.min<model.min||budget.max>model.max))flag('BUDGET',l.id+' '+l.model+' 预算 '+l.budget+' 超出车型范围');
  if(!l.owner&&(!['新咨询','培育中'].includes(l.stage)||l.life==='已成交'))flag('POOL_STAGE',l.id+' 待分配但处于 '+l.life+'/'+l.stage);
  if(l.life==='活跃'&&!s.tasks.some(t=>t.lead===l.id&&M.isOpen(t)))flag('NEXT_TASK',l.id+' 活跃线索没有下一步任务');
 }
 const inScope=id=>!scopeIds||scopeIds.has(id);
 const leads=s.leads.filter(l=>inScope(l.id)&&(s.user==='mgr'||l.owner===s.user));
 const tasks=s.tasks.filter(t=>inScope(t.lead)&&(s.user==='mgr'||t.owner===s.user)&&M.isOpen(t));
 let expected={};
 if(page==='leads')expected={
  'filter-active':leads.filter(l=>l.life==='活跃').length,
  'filter-incoming':s.transfers.filter(x=>inScope(x.lead)&&x.status==='待接收'&&(s.user==='mgr'||x.to===s.user)).length,
  today:tasks.filter(t=>day(t.due)===day(s.now)).length,
  overdue:tasks.filter(t=>t.due<s.now).length
 };
 if(page==='dashboard'){
  const list=s.leads.filter(l=>(team==='全部团队'||l.team===team)&&(source==='全部来源'||l.source===source)),ids=new Set(list.map(l=>l.id));
  expected={unassigned:list.filter(l=>!l.owner&&['活跃','培育中'].includes(l.life)).length,
   'transfer-overdue':s.transfers.filter(x=>ids.has(x.lead)&&x.status==='待接收'&&x.due<s.now).length,
   overdue:s.tasks.filter(t=>ids.has(t.lead)&&M.isOpen(t)&&t.due<s.now).length,
   'no-next':list.filter(l=>l.life==='活跃'&&!M.tasksFor(s,l.id).length).length};
 }
 for(const [key,count] of Object.entries(expected))if(Object.hasOwn(cards,key)&&cards[key]!==count)flag('KPI',s.user+' / '+page+' / '+key+' 卡片 '+cards[key]+'，对应筛选列表 '+count);
 return issues;
}
