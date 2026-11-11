import * as M from './model.mjs';

import {MODEL_NAMES} from './catalog.mjs';
export const models=MODEL_NAMES;
export const fields=[
 {key:'name',label:'客户姓名',required:true,aliases:['姓名','客户','客户称呼','客户名称']},
 {key:'phone',label:'手机号',required:true,aliases:['电话','手机','联系方式','联系电话','手机号码']},
 {key:'source',label:'来源',required:true,aliases:['渠道','线索来源','获客渠道']},
 {key:'model',label:'意向车型',required:true,aliases:['车型','车辆型号','意向车系']},
 {key:'budget',label:'预算区间',aliases:['预算','购车预算']},
 {key:'owner',label:'负责人',aliases:['销售','销售顾问','所属销售','负责人姓名']},
 {key:'note',label:'备注',aliases:['说明','沟通摘要','客户备注']}
];
const text=v=>String(v??'').trim();
const header=v=>text(v).replace(/[\s*＊：:]/g,'').toLowerCase();
export function normalizePhone(v){return text(v).replace(/[\s()（）-]/g,'').replace(/^(?:\+86|0086)/,'');}
export function upgrade(s){
 // Replace only original seed placeholders, never user-provided phone numbers.
 for(const l of s.leads){const m=/^演示号码 · (68\d{2})$/.exec(l.phone);if(m)l.phone='1380000'+m[1];}
 s.importBatches??=[];
 return s;
}
export function autoMap(headers){return Object.fromEntries(fields.map(f=>[f.key,headers.findIndex(h=>[f.label,...f.aliases].some(a=>header(a)===header(h)))]));}
export function mappingErrors(mapping){const used=new Set(),errors=[];for(const f of fields){const col=Number(mapping[f.key]);if(!Number.isInteger(col)||col< -1)errors.push('字段映射无效：'+f.label);if(f.required&&col<0)errors.push('请映射'+f.label);if(col>=0){if(used.has(col))errors.push('同一列不能映射到多个字段');used.add(col);}}return [...new Set(errors)];}
export function preview(s,rows,mapping){
 const previous=new Map();
 return rows.filter(r=>r.cells.some(c=>text(c)!=='')).map(r=>{
  const data=Object.fromEntries(fields.map(f=>[f.key,text(r.cells[Number(mapping[f.key])]) ]));
  data.phone=normalizePhone(data.phone);
  const errors=[];
  for(const f of fields)if(f.required&&!data[f.key])errors.push(f.label+'必填');
  if(data.phone&&!/^1[3-9]\d{9}$/.test(data.phone))errors.push('手机号须为有效的中国大陆11位手机号码');
  if(data.model&&!models.includes(data.model))errors.push('车型不在车型库：'+data.model);
  const owner=data.owner?M.users.find(u=>u.id!=='mgr'&&(u.name===data.owner||u.id===data.owner)):null;
  if(data.owner&&!owner)errors.push('负责人不存在或不是销售：'+data.owner);
  const matches=data.phone?s.leads.filter(l=>normalizePhone(l.phone)===data.phone):[];
  const existing=matches[0],prev=previous.get(data.phone);
  if(matches.length>1)errors.push('系统中已有多条相同手机号，请先处理存量重复');
  const canMerge=existing?(s.user==='mgr'||existing.owner===s.user):true;
  const duplicate=existing?{kind:'existing',id:existing.id,label:canMerge?existing.name+' / '+existing.id:'其他负责人已有线索',canMerge}:prev?{kind:'file',row:prev,label:'本文件第 '+prev+' 行',canMerge:true}:null;
  if(!errors.length&&!existing&&!prev)previous.set(data.phone,r.row);
  return {row:r.row,data,ownerId:owner?.id??null,errors,duplicate};
 });
}
export function importRows(s,rows,mapping,choices,{skipErrors=false,filename='Excel'}={}){
 const mapErrors=mappingErrors(mapping);if(mapErrors.length)throw Error(mapErrors.join('；'));
 const checked=preview(s,rows,mapping);
 if(!checked.length)throw Error('没有可导入的数据');
 if(checked.some(r=>r.errors.length)&&!skipErrors)throw Error('请返回修改文件，或勾选跳过错误行');
 const draft=structuredClone(s);upgrade(draft);
 const batch='IMP-'+String((draft.importBatches.at(-1)?.number??0)+1).padStart(4,'0');
 const result={id:batch,number:(draft.importBatches.at(-1)?.number??0)+1,at:s.now,filename,actor:s.user,success:0,merged:0,skipped:0,rows:[]};
 for(const row of checked){
  const {data,errors}=row;let choice=choices[row.row];
  const skip=reason=>{result.skipped++;result.rows.push({row:row.row,status:'跳过',reason});};
  if(errors.length){skip(errors.join('；'));continue;}
  if(choice==='skip'){skip('用户选择跳过');continue;}
  const existing=draft.leads.find(l=>normalizePhone(l.phone)===data.phone);
  if(row.duplicate&&!['merge','skip'].includes(choice))throw Error('请处理第 '+row.row+' 行的重复手机号');
  if(existing){
   if(choice!=='merge')throw Error('第 '+row.row+' 行出现重复，请重新预览后选择合并或跳过');
   if(s.user!=='mgr'&&existing.owner!==s.user)throw Error('无权合并其他负责人的线索，请跳过或由主管导入');
   existing.imports??=[];existing.imports.push({batch,at:s.now,...data});
   if(data.note)existing.summary+='\n[Excel '+batch+'] '+data.note;
   if(!existing.budget||existing.budget==='待确认')existing.budget=data.budget||existing.budget;
   M.event(draft,existing,'Excel 导入 · 批次 #'+batch,'合并导入；保留原姓名、来源、车型、负责人、状态与联系许可。本次资料：'+fields.map(f=>f.label+'：'+(data[f.key]||'未填写')).join('；'),{batch,importRow:row.row});
   result.merged++;result.rows.push({row:row.row,status:'合并',lead:existing.id});
  }else{
   // A prior file row can be skipped; its remaining duplicate becomes the single new lead.
   const l=M.newLead(draft,data.name,data.source,data.model);
   l.phone=data.phone;l.owner=row.ownerId;l.team=row.ownerId?M.person(row.ownerId).team:'线上直营';
   l.budget=data.budget||'待确认';l.stage='新咨询';l.summary=data.note||'Excel 导入，待确认需求';
   l.imports=[{batch,at:s.now,...data}];
   for(const t of M.tasksFor(draft,l.id)){t.owner=l.owner||'mgr';t.type=l.owner?'首次联系':'分配线索';t.due=s.now+(l.owner?M.rules.contact:15*60000);t.originalDue=t.due;}
   M.event(draft,l,'Excel 导入 · 批次 #'+batch,'新增线索；'+(l.owner?'分配给 '+M.person(l.owner).name:'进入线上直营主管待分配池'),{batch,importRow:row.row});
   result.success++;result.rows.push({row:row.row,status:'成功',lead:l.id});
  }
 }
 draft.importBatches.push(result);M.scan(draft);
 return {state:draft,result};
}
export function dashboardScope(s,team='全部团队',source='全部来源'){return s.leads.filter(l=>(team==='全部团队'||l.team===team)&&(source==='全部来源'||l.source===source));}
export function unassigned(ls){return ls.filter(l=>!l.owner&&['活跃','培育中'].includes(l.life));}
export function exportRows(ls){return [fields.map(f=>f.label).concat(['线索编号','生命周期','购车阶段','团队']),...ls.map(l=>[l.name,l.phone,l.source,l.model,l.budget,l.owner?M.person(l.owner)?.name??'':'',l.summary,l.id,l.life,l.stage,l.team])];}
