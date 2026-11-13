// All case-study copy lives here. Add `zh` alongside `en`, then use /case-study/?lang=zh.
// Update the portfolio copy, citations and media paths here.
// Paths are relative so the site works on any static host, including sub-paths.
// demo is used from /case-study/; caseStudy is used from the demo root. demoUrl is printed for PDF/print readers.
export const caseStudyLinks={demo:'../',caseStudy:'case-study/',demoFooterLabel:'Case study →',demoUrl:'https://leadflow-dtc-demo.azure-larch-2626.chatgpt.site/'};
export const caseStudyContent={en:{
 language:'en',pageTitle:'LeadFlow — Product case study',brand:'LeadFlow',navLabel:'Case study',backLabel:'Back to the demo',
 sectionLabel:'Case study sections',
 hero:{
  title:'Closing the handoff gap between online sales and stores',
  subtitle:'A workflow prototype for the online-to-store lead handoff in automotive retail: who owns a lead, whether they accepted it, and what happens next.',
  // Optional: 1–2 sentences on why you chose this problem. Leave empty to hide.
  why:'',
  meta:{roleLabel:'Role',role:'Product design & prototyping',timelineLabel:'Timeline',timeline:'October–November 2026',toolsLabel:'Tools',tools:'ChatGPT, Codex'},
  demoButton:'Try the live demo',
  walkthrough:{label:'Watch 2-min walkthrough',url:'../assets/case-study/walkthrough.mp4',todo:'The walkthrough video is unavailable.'},
  media:{src:'../assets/case-study/hero.gif',path:'assets/case-study/hero.gif',alt:'A handoff being sent and accepted in LeadFlow',todo:'This demo image is unavailable.'}
 },
 gap:{
  id:'the-gap',nav:'The gap',heading:'The CRM has the lead. Who owns the next step?',
  body:'Online appointment staff can qualify leads, invite customers to stores, and pass them to sales advisors. LeadFlow explores what happens when the CRM records the reassignment, but the context and follow-up still have to be passed separately.',
  pointsIntro:'My hypothesis: when the CRM only records an owner change, four things tend to happen.',
  points:[
   'Reassigning a lead is a field change, so nothing confirms the receiver accepted it.',
   'Customer context — a promised Saturday test drive, a child seat — stays in chat history instead of the record.',
   "Open follow-ups don't move with the lead, so after a handoff the next step has no clear owner.",
   'Supervisors export to Excel to find stuck handoffs and uneven workloads.'
  ],
  pointsOutro:'These are hypotheses, not measured facts. The pilot plan below is designed to test them.',
  diagram:{label:'Handoff workflow comparison',today:'Today',withLeadFlow:'With LeadFlow',
   todayNodes:['Online sales','CRM','Store advisor'],crmNote:'owner field changed',
   sidePath:'The real handoff: context, reminders and chasing over WeChat or phone',supervisor:'Supervisor',exportNote:'exports to Excel',
   leadFlowNodes:['Online sales','Handoff','Store advisor accepts','Next task'],handoffNote:'context + tasks',timeoutNote:'timeouts surface automatically'
  },
  clarification:'LeadFlow is a prototype of this handoff layer. It is not a CRM replacement; in production it would ship as a module inside the existing CRM.'
 },
 evidence:{id:'evidence',nav:'Evidence',heading:'Evidence',intro:'Public job descriptions provide two signals about the work. They describe expected responsibilities; they do not establish how often handoffs fail.',items:[
  {title:'Online qualification and store assignment',body:'Leapmotor’s DCC specialist posting lists qualifying online leads, arranging store visits, assigning qualified leads to sales advisors, and maintaining follow-up records.',source:'Employer job posting · Leapmotor',url:'https://leapmotor.zhiye.com/social/detail?jobAdId=bfbbec35-c459-47d7-9693-8b42fe7c62a7'},
  {title:'Handoff notes and continued follow-up',body:'Huajue Group’s DCC posting describes inviting prospects for a test drive, following up with people who do not arrive, and passing high-intent leads to sales advisors with handoff notes.',source:'Employer job posting · Huajue Group',url:'https://huajuegroup.com/job.html?id=11'}
 ]},
 rules:{id:'four-rules',nav:'Four rules',heading:'Four rules the workflow enforces',items:[
  {title:'Handoffs must be accepted',body:"A lead changes owner only when the receiver accepts it, so a handoff can't silently go nowhere.",media:{src:'../assets/case-study/rule-1-crop.png',path:'assets/case-study/rule-1-crop.png',caption:"Ms. Chen's lead after 林悦 (online sales) sends the handoff. The owner is still 林悦; the amber box reads “waiting for 周辰 to accept” and carries the notes and next step.",alt:'LeadFlow handoff awaiting receiver acceptance',todo:'This demo image is unavailable.'}},
  {title:'Tasks move with the owner',body:"Open follow-ups migrate to the new owner together with the customer's context.",media:{src:'../assets/case-study/rule-2-crop.png',path:'assets/case-study/rule-2-crop.png',caption:'The same lead after 周辰 (store advisor) accepts. He is now the owner, the notes are intact, the open task is his, and the history records “accepted, follow-up tasks moved”.',alt:'Open tasks migrating to the new owner',todo:'This demo image is unavailable.'}},
  {title:'Every active lead has a next step',body:'An active lead without a next task is flagged; the supervisor dashboard tracks this at zero.',media:{src:'../assets/case-study/rule-3-crop.png',path:'assets/case-study/rule-3-crop.png',caption:'Supervisor dashboard. The last card counts active leads with no next step: 0.',alt:'Supervisor dashboard tracking leads without a next task',todo:'This demo image is unavailable.'}},
  {title:'Timeouts escalate',body:'Handoffs not accepted in time, and overdue tasks, surface on the supervisor dashboard with drill-down to the exact leads.',media:{src:'../assets/case-study/rule-4-crop.png',path:'assets/case-study/rule-4-crop.png',caption:"Supervisor's handoff centre, filtered to timed-out handoffs. Two are still waiting for acceptance, 26.5 and 23.5 hours overdue.",alt:'Supervisor drill-down for overdue handoffs',todo:'This demo image is unavailable.'}}
 ]},
 decisions:{id:'decisions',nav:'Decisions',heading:'Decisions and trade-offs',alternativeLabel:'Alternative considered',whyLabel:'Why',costLabel:'Cost accepted',items:[
  {decision:'Accept-to-own instead of direct reassignment',alternative:'Let senders change the owner directly',why:'Direct reassignment is faster but makes it impossible to tell a received lead from a dropped one.',cost:'Handoffs are slower, and a receiver can sit on a lead. That is why rule 4 exists: unaccepted handoffs time out and escalate to the supervisor.'},
  {decision:'On duplicate merge, keep the original owner and status',alternative:'Let imported data overwrite',why:"Imports shouldn't silently take a customer away from the salesperson already working with them; imported fields are kept in the batch record.",cost:'Newer information in the spreadsheet does not replace the record automatically. It stays in the import batch and is appended to the notes for the owner to review.'},
  {decision:"Reactivated leads don't count as new acquisition",alternative:'Count them as new leads',why:'Counting them would inflate acquisition numbers and hide churn.',cost:'The acquisition number looks smaller, and the team has to report a second metric for win-backs.'},
  {decision:'Unassigned leads can only be at early stages',alternative:'Allow any stage in the pool',why:'A customer who has test-driven or bought must always have a responsible person.',cost:'The supervisor has to assign a lead before it can move past the early stages, which adds a step.'}
 ]},
 rollout:{id:'getting-data-in',nav:'Excel import',heading:'Getting existing data in',body:"Stores keep historical leads in Excel. The import flow maps columns automatically, validates each row, catches duplicates against existing leads, and sends unowned leads to the supervisor's pool.",sample:'Demo sample: 6 rows → 2 invalid, 1 duplicate, 3 new',media:{src:'../assets/case-study/import-crop.png',path:'assets/case-study/import-crop.png',caption:'Validation step for the demo sample. Top row: 6 rows, 2 errors, 1 duplicate, 3 new. Row 5 is rejected for an invalid phone number.',alt:'Excel import validation and duplicate detection',todo:'This demo image is unavailable.'}},
 limits:{id:'limits',nav:'Limits',heading:"What this is — and isn't",items:[
  'Prototype with fictional data; actions are stored only in the browser.',
  'Not connected to a real CRM, DMS, or service records.',
  'The workflow rules are untested with real sales teams. The evidence so far is public job postings, not interviews.'
 ]},
 pilot:{id:'pilot',nav:'Pilot',heading:"How I'd test it",metricsIntro:'Three metrics I would track:',metrics:[
  'Median time from handoff sent to handoff accepted',
  'Share of active leads with no next step',
  'Overdue tasks per salesperson'
 ],plan:'For a first pilot, I would ask an online coordinator, a store advisor, and a supervisor to walk through the same appointment handoff using their current tools and the prototype. Check whether the receiver can identify the owner, promised appointment, and next action without asking the sender. Use their current handoffs as a baseline before testing acceptance time and overdue follow-ups.'},
 build:{id:'how-i-built-it',nav:'Build process',heading:'How I built it',body:'I defined the ownership rules and the edge cases. ChatGPT built the first clickable prototype, and Codex implemented the fixes and the Excel import. The goal was to test workflow rules with something clickable, not to ship production code.',process:'I started with the ownership question: who is responsible before and after acceptance? I then built the demo around one Saturday test drive, and added the supervisor’s exception view and the spreadsheet import. Reviewing the demo data role by role exposed leads marked as test-driven or closed that had no owner. That became a rule: the unassigned pool only holds early-stage leads.'},
 tryIt:{id:'try-it',nav:'Try it',heading:'Try it in 5 minutes',steps:[
  'Click 重置演示 (reset demo) at the bottom right to start from a clean state.',
  'As 林悦 (online sales), open 陈女士 (Ms. Chen) and hand her over to 周辰 (store advisor).',
  'Switch to 周辰 and accept — the context and task arrive with her.',
  'Click + 1 天 (+1 day), then switch to 沈知行 (supervisor) to see timeouts on the dashboard.',
  'Open 从 Excel 导入 (import from Excel) → 载入演示示例 (load sample) to see validation and duplicate detection.'
 ],note:'The demo interface is in Chinese; role and button names are translated above.',button:'Open the live demo'}
}};
