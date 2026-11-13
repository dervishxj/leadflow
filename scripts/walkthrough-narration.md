# LeadFlow walkthrough narration

The MP4 is silent. Record the Mandarin voiceover against these cues. The English text is already on screen.

| Time | Scene | Mandarin voiceover | English on-screen text |
| --- | --- | --- | --- |
| 0:00–0:07 | Title card | 这是 LeadFlow，一个使用虚构数据的流程原型，帮助线上销售和门店做好线索交接。 | **Card** · LeadFlow / Closing the handoff gap between online sales and stores / A workflow prototype · fictional data |
| 0:07–0:20 | The gap | 很多销售团队已经有 CRM。系统里能看到负责人变了，但客户聊过什么、下一步谁来做，往往还要在微信里再交代一遍。 | Most teams already have a CRM. It records the new owner, but the context and the next step often travel over WeChat. |
| 0:20–0:34 | Send a handoff | 林悦打开陈女士的线索。陈女士希望周六到湖滨店试驾，还需要提前确认儿童座椅。林悦把线索转给门店顾问周辰，沟通摘要和建议的下一步也一并交过去。 | 林悦 (online sales) hands 陈女士 (Ms. Chen) to the store. The notes and the next step go with her. |
| 0:34–0:50 | Pending acceptance | 黄色提示表示交接还在等待接收。周辰接收之前，林悦仍然是负责人。 | Until 周辰 (store advisor) accepts, 林悦 (online sales) is still responsible. |
| 0:50–0:58 | Switch to the recipient | 切换到门店顾问周辰。他在待接收列表里打开陈女士的线索。 | Switch to 周辰 (store advisor). The handoff is waiting in his list. |
| 0:58–1:10 | Accept | 周辰接收后，负责人变成周辰。他可以看到沟通摘要、迁移过来的跟进任务，以及流转记录里的接收时间。 | 周辰 (store advisor) accepts. He sees the full context, and the open task is now his. |
| 1:10–1:19 | Advance the clock | 每次推进三十分钟，一共推进一个半小时。 | Move the demo clock forward. |
| 1:19–1:32 | Timeouts escalate | 切到主管沈知行。还没接收的超时交接会出现在团队数据看板上。点开交接超时，就能看到具体是哪几条线索。 | Later that day, handoffs nobody accepted surface on 沈知行 (supervisor)'s dashboard, with the exact leads. |
| 1:32–1:41 | Load the Excel sample | 门店可以导入原有的 Excel 线索。先载入演示示例，再核对字段映射。 | Stores can bring in their existing spreadsheets. |
| 1:41–1:54 | Validate and check duplicates | 六行里有两行校验不通过。陈女士因为手机号已存在被标记为重复，另外三行可以新增。 | Existing spreadsheets come in safely: 2 invalid rows are blocked, and 陈女士 (Ms. Chen) is caught as a duplicate. |
| 1:54–2:05 | Closing card | 四条规则贯穿整个流程。交接要接收，任务随负责人迁移，每条活跃线索都有下一步，交接超时会提示主管。原型使用虚构数据，尚未与真实销售团队测试。 | **Card** · Four rules for lead handoffs / Handoffs must be accepted / Tasks move with the owner / Every active lead has a next step / Timeouts escalate / Prototype with fictional data, not yet tested with real teams / dervishxj.github.io/leadflow |

## Record again

From the LeadFlow project folder, install Playwright and Chromium and make sure FFmpeg with libx264 is on your PATH.

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium --only-shell
node scripts/record-walkthrough.mjs
```

Set `FFMPEG` to use a specific FFmpeg executable or `PLAYWRIGHT_MODULE` to use an existing Playwright installation. For an environment that requires extra Chromium launch flags, set `LEADFLOW_CHROMIUM_ARGS` to a space-separated list. The recorder serves `dist/` on an available loopback port and replaces the walkthrough only after encoding succeeds.
