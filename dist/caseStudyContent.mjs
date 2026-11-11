// All case-study copy lives here. Add `zh` alongside `en`, then use /case-study/?lang=zh.
// Replace a TODO string with final copy. Set media.src / walkthrough.url once available.
export const caseStudyLinks={demo:'/',caseStudy:'/case-study/',demoFooterLabel:'Case study →'};
export const caseStudyContent={en:{
 language:'en',pageTitle:'LeadFlow — Product case study',brand:'LeadFlow',navLabel:'Case study',backLabel:'Back to the demo',
 sectionLabel:'Case study sections',
 hero:{
  title:'Closing the handoff gap between online sales and stores',
  subtitle:'A workflow prototype for automotive DTC lead management: who owns a lead, whether they accepted it, and what happens next.',
  meta:{roleLabel:'Role',role:'[TODO: e.g. Product design & prototyping (solo)]',timelineLabel:'Timeline',timeline:'[TODO]',toolsLabel:'Tools',tools:'ChatGPT, Codex'},
  demoButton:'Try the live demo',
  walkthrough:{label:'Watch 2-min walkthrough',url:null,todo:'[TODO: video URL]'},
  media:{src:null,path:'assets/case-study/hero.gif',alt:'A handoff being sent and accepted in LeadFlow',todo:'[TODO: 15s GIF of a handoff being sent and accepted]'}
 },
 gap:{
  id:'the-gap',nav:'The gap',heading:'The CRM has the lead. The handoff happens in WeChat.',
  body:'Most automotive DTC teams already run a CRM. It stores leads and stages well, but the handoff between online sales and stores mostly happens outside it.',
  points:[
   'Reassigning a lead is a field change. Nothing confirms the receiver accepted it.',
   'Customer context — a promised Saturday test drive, a child seat — sits in chat history, not in the record.',
   "Open follow-ups don't move with the lead, so after a handoff nobody owns the next step.",
   'Supervisors export to Excel to find stuck handoffs and uneven workloads.'
  ],
  diagram:{label:'Handoff workflow comparison',today:'Today',withLeadFlow:'With LeadFlow',
   todayNodes:['线上销售','CRM','门店销售'],crmNote:'owner field changed',
   sidePath:'WeChat / phone: context, reminders, chasing',supervisor:'Supervisor',exportNote:'exports to Excel',
   leadFlowNodes:['线上销售','handoff','门店销售 accepts','next task'],handoffNote:'context + tasks',timeoutNote:'timeouts surface automatically'
  },
  clarification:'LeadFlow is a prototype of this handoff layer. It is not a CRM replacement; in production it would ship as a module inside the existing CRM.'
 },
 evidence:{id:'evidence',nav:'Evidence',heading:'Evidence',todo:'[TODO: 1–3 real quotes or observations from conversations with car salespeople, or public signals such as job descriptions for online appointment (DCC) roles. Note the source type for each.]'},
 rules:{id:'four-rules',nav:'Four rules',heading:'Four rules the workflow enforces',items:[
  {title:'Handoffs must be accepted',body:"A lead changes owner only when the receiver accepts it, so a handoff can't silently go nowhere.",media:{src:null,path:'assets/case-study/rule-1.png',alt:'LeadFlow handoff awaiting receiver acceptance',todo:'[TODO: screenshot showing handoff acceptance]'}},
  {title:'Tasks move with the owner',body:"Open follow-ups migrate to the new owner together with the customer's context.",media:{src:null,path:'assets/case-study/rule-2.png',alt:'Open tasks migrating to the new owner',todo:'[TODO: screenshot showing migrated context and tasks]'}},
  {title:'Every active lead has a next step',body:'An active lead without a next task is flagged; the supervisor dashboard tracks this at zero.',media:{src:null,path:'assets/case-study/rule-3.png',alt:'Supervisor dashboard tracking leads without a next task',todo:'[TODO: screenshot showing the no-next-step check]'}},
  {title:'Timeouts escalate',body:'Handoffs not accepted in time, and overdue tasks, surface on the supervisor dashboard with drill-down to the exact leads.',media:{src:null,path:'assets/case-study/rule-4.png',alt:'Supervisor drill-down for overdue handoffs',todo:'[TODO: screenshot showing timeout escalation and drill-down]'}}
 ]},
 decisions:{id:'decisions',nav:'Decisions',heading:'Decisions and trade-offs',alternativeLabel:'Alternative considered',whyLabel:'Why',items:[
  {decision:'Accept-to-own instead of direct reassignment',alternative:'Let senders change the owner directly',why:'Direct reassignment is faster but makes it impossible to tell a received lead from a dropped one.'},
  {decision:'On duplicate merge, keep the original owner and status',alternative:'Let imported data overwrite',why:"Imports shouldn't silently take a customer away from the salesperson already working with them; imported fields are kept in the batch record."},
  {decision:"Reactivated leads don't count as new acquisition",alternative:'Count them as new leads',why:'Counting them would inflate acquisition numbers and hide churn.'},
  {decision:'Unassigned leads can only be at early stages',alternative:'Allow any stage in the pool',why:'A customer who has test-driven or bought must always have a responsible person.'}
 ]},
 rollout:{id:'getting-data-in',nav:'Excel import',heading:'Getting existing data in',body:"Stores keep historical leads in Excel. The import flow maps columns automatically, validates each row, catches duplicates against existing leads, and sends unowned leads to the supervisor's pool.",sample:'Demo sample: 6 rows → 2 invalid, 1 duplicate, 3 new',media:{src:null,path:'assets/case-study/import.png',alt:'Excel import validation and duplicate detection',todo:'[TODO: screenshot of Excel validation and duplicate detection]'}},
 limits:{id:'limits',nav:'Limits',heading:"What this is — and isn't",items:[
  'Prototype with fictional data; actions are stored only in the browser.',
  'Not connected to a real CRM, DMS, or service records.',
  "Metrics I'd track in a pilot: median handoff acceptance time, share of active leads with no next step, overdue tasks per salesperson."
 ],todo:"[TODO: what you'd validate first with a real team]"},
 build:{id:'how-i-built-it',nav:'Build process',heading:'How I built it',body:'I prototyped the workflow with ChatGPT to validate the flow quickly, then used Codex to fix data consistency and add the Excel import. The goal was to test workflow rules with something clickable, not to ship production code.',todo:'[TODO: adjust to describe your actual process and time spent]'},
 tryIt:{id:'try-it',nav:'Try it',heading:'Try it in 5 minutes',steps:[
  'As 林悦, open 陈女士 and hand her over to 周辰.',
  'Switch to 周辰 and accept — the context and task arrive with her.',
  'Click + 1 天, then switch to 沈知行 to see timeouts on the dashboard.',
  'Open 从 Excel 导入 → 载入演示示例 to see validation and duplicate detection.'
 ],button:'Open the live demo'}
}};
