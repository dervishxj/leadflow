import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rename, rm, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const output = join(dist, 'assets/case-study/walkthrough.mp4');
const size = { width: 1280, height: 720 };
const length = 125;
const caption = {
  gap: 'Most teams already have a CRM. It records the new owner, but the context and the next step often travel over WeChat.',
  send: '林悦 (online sales) hands 陈女士 (Ms. Chen) to the store. The notes and the next step go with her.',
  pending: 'Until 周辰 (store advisor) accepts, 林悦 (online sales) is still responsible.',
  switchRole: 'Switch to 周辰 (store advisor). The handoff is waiting in his list.',
  accept: '周辰 (store advisor) accepts. He sees the full context, and the open task is now his.',
  clock: 'Move the demo clock forward.',
  timeout: "Later that day, handoffs nobody accepted surface on 沈知行 (supervisor)'s dashboard, with the exact leads.",
  excelLoad: 'Stores can bring in their existing spreadsheets.',
  excel: 'Existing spreadsheets come in safely: 2 invalid rows are blocked, and 陈女士 (Ms. Chen) is caught as a duplicate.',
};

const cards = {
  title: `<div class="brand-mark">⇄</div><p class="wordmark">LeadFlow</p>
    <h1>Closing the handoff gap between<br>online sales and stores</h1>
    <p class="detail">A workflow prototype · fictional data</p>`,
  close: `<div class="brand-mark">⇄</div><p class="wordmark">LeadFlow</p>
    <h1>Four rules for lead handoffs</h1><ol>
    <li>Handoffs must be accepted</li>
    <li>Tasks move with the owner</li>
    <li>Every active lead has a next step</li>
    <li>Timeouts escalate</li>
    </ol><p class="detail">Prototype with fictional data, not yet tested with real teams</p>
    <p class="url">dervishxj.github.io/leadflow</p>`,
};

function cardPage(key) {
  return `<!doctype html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>LeadFlow</title><link rel="stylesheet" href="/style.css">
    <style>
      body { margin: 0; background: #f4f7f3; color: #20342a; }
      .record-card { height: 100vh; display: grid; place-content: center;
        justify-items: center; padding: 36px; text-align: center; }
      .record-card .brand-mark { width: 52px; height: 52px; font-size: 26px; }
      .wordmark { font-size: 24px; font-weight: 700; margin: 12px 0 20px; }
      .record-card h1 { font-size: 50px; margin: 0 0 18px; letter-spacing: 0; }
      .detail { font-size: 20px; color: #4e6859; margin: 0; }
      .record-card ol { display: grid; grid-template-columns: repeat(2, 1fr);
        list-style: none; gap: 12px; padding: 0; margin: 0 0 22px; }
      .record-card li { padding: 14px 22px; background: white; border: 1px solid #dce7de;
        border-radius: 10px; font-size: 22px; font-weight: 650; }
      .url { margin: 13px 0 0; font-size: 20px; color: #265641; font-weight: 650; }
    </style><main class="record-card">${cards[key]}</main></html>`;
}

const mime = {
  '.css': 'text/css', '.gif': 'image/gif', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript', '.mjs': 'text/javascript', '.mp4': 'video/mp4',
  '.png': 'image/png', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

async function serve() {
  const root = resolve(dist);
  const server = createServer(async (request, response) => {
    try {
      const { pathname } = new URL(request.url, 'http://localhost');
      if (pathname === '/_record/setup') {
        response.writeHead(200, { 'Content-Type': mime['.html'] });
        response.end('<!doctype html><title>Recording setup</title>');
        return;
      }
      const card = /^\/_record\/(title|close)$/.exec(pathname);
      if (card) {
        response.writeHead(200, { 'Content-Type': mime['.html'] });
        response.end(cardPage(card[1]));
        return;
      }
      const path = resolve(root, '.' + decodeURIComponent(pathname));
      if (path !== root && !path.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      const file = pathname.endsWith('/') ? join(path, 'index.html') : path;
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', ready);
  });
  return server;
}

// The capture layer lives outside the app's render tree and never receives pointer events.
function installOverlay() {
  const style = document.createElement('style');
  style.textContent = `
    #lf-record-caption, #lf-record-cursor, #lf-record-ring, #lf-record-outline {
      position: fixed; z-index: 2147483647; pointer-events: none;
    }
    #lf-record-caption {
      inset: auto 0 0; height: 70px; box-sizing: border-box; padding: 8px 0;
      display: grid; place-items: center; background: #183d30; color: #fff;
      font: 500 20px/26px system-ui, "PingFang SC", "Noto Sans CJK SC", sans-serif;
      text-align: center;
    }
    #lf-record-caption > span { width: min(960px, 94vw); white-space: pre-line; }
    #lf-record-cursor, #lf-record-ring { box-sizing: border-box;
      left: -40px; top: -40px; transform: translate(-50%, -50%); border-radius: 50%; }
    #lf-record-cursor { width: 22px; height: 22px; background: #1f5a43;
      border: 2px solid white; box-shadow: 0 2px 7px #142d2480; }
    #lf-record-ring { width: 22px; height: 22px; border: 3px solid #2f9a62;
      box-shadow: 0 0 0 4px #a0d6ad66; opacity: 0; }
    #lf-record-outline { outline: 2px solid #2e8556; outline-offset: 3px;
      border-radius: 5px; visibility: hidden; }
    .lf-record-zoom { transition: scale 500ms ease, translate 500ms ease; }
    body.lf-recording .modal { max-height: 450px; top: 45%; }
    body.lf-recording #app { padding-bottom: 74px; }
    body.lf-recording .drawer-body { padding-bottom: 99px; }
    body.lf-recording .excel-modal { bottom: 76px; }
  `;
  document.head.append(style);
  document.body.classList.add('lf-recording');
  const bar = document.createElement('div');
  bar.id = 'lf-record-caption';
  bar.append(document.createElement('span'));
  const cursor = document.createElement('div');
  cursor.id = 'lf-record-cursor';
  const ring = document.createElement('div');
  ring.id = 'lf-record-ring';
  const outline = document.createElement('div');
  outline.id = 'lf-record-outline';
  document.body.append(bar, outline, ring, cursor);
  document.addEventListener('mousemove', event => {
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
  });
}

async function showCaption(page, text) {
  await page.locator('#lf-record-caption > span').evaluate((element, value) => {
    element.textContent = value;
    const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
    if (element.getBoundingClientRect().height > lineHeight * 2 + 1) {
      throw new Error('Caption exceeds two lines: ' + value);
    }
  }, text);
}

async function center(element) {
  await element.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await pause(680);
}

// Use viewport coordinates for the pointer and outline. The browser reports transformed
// bounds, so hit testing and the recording effects stay aligned with the real controls.
async function outline(target, duration) {
  await target.evaluate(async (node, milliseconds) => {
    const overlay = document.getElementById('lf-record-outline');
    const { x, y, width, height } = node.getBoundingClientRect();
    Object.assign(overlay.style, {
      left: x + 'px', top: y + 'px', width: width + 'px', height: height + 'px',
      visibility: 'visible',
    });
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    overlay.style.visibility = 'hidden';
  }, duration);
}

async function frame(surface, focus, scale, position = {}) {
  const area = await focus.boundingBox();
  if (!area) throw new Error('Unable to frame ' + focus);
  await surface.evaluate((node, { area, scale, position }) => {
    if (!node.classList.contains('lf-record-zoom')) node.classList.add('lf-record-zoom');
    const previous = Number.parseFloat(getComputedStyle(node).scale) || 1;
    const box = node.getBoundingClientRect();
    const originalWidth = box.width / previous;
    const originalHeight = box.height / previous;
    // Keep a stable origin at the surface center, and pan the area of interest into view.
    const left = (area.x - box.x) / previous;
    const top = (area.y - box.y) / previous;
    const offset = (area.width / previous) / 2;
    const height = (area.height / previous) / 2;
    const translate = getComputedStyle(node).translate.split(' ').map(Number.parseFloat);
    const baseX = box.x + (box.width - originalWidth) / 2 - (translate[0] || 0);
    const baseY = box.y + (box.height - originalHeight) / 2 - (translate[1] || 0);
    const x = (position.x ?? 640) - baseX - originalWidth / 2 - (left + offset - originalWidth / 2) * scale;
    const y = (position.y ?? 325) - baseY - originalHeight / 2 - (top + height - originalHeight / 2) * scale;
    node.style.scale = String(scale);
    node.style.translate = x + 'px ' + y + 'px';
  }, { area, scale, position });
  await pause(540);
}

async function zoomOut(surface) {
  await surface.evaluate(node => {
    node.style.scale = '';
    node.style.translate = '';
  });
  await pause(540);
}

async function pointAt(page, target) {
  await target.waitFor({ state: 'visible' });
  const initial = await target.boundingBox();
  if (initial.y < 10 || initial.y + initial.height > 645) await center(target);
  const destination = await target.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const left = Math.max(12, rect.left);
    const right = Math.min(1268, rect.right);
    const top = Math.max(12, rect.top);
    const bottom = Math.min(638, rect.bottom);
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    if (left >= right || top >= bottom || !node.contains(document.elementFromPoint(x, y))) {
      throw new Error('Control is outside the visible recording area: ' + node.textContent.trim());
    }
    return { x, y };
  });
  const from = await page.locator('#lf-record-cursor').evaluate(element => ({
    x: Number.parseFloat(element.style.left) || 1,
    y: Number.parseFloat(element.style.top) || 1,
  }));
  const started = performance.now();
  for (let step = 1; step <= 24; step++) {
    const progress = (1 - Math.cos(Math.PI * step / 24)) / 2;
    await page.mouse.move(from.x + (destination.x - from.x) * progress,
      from.y + (destination.y - from.y) * progress);
    await pause(Math.max(0, started + step * 25 - performance.now()));
  }
  return destination;
}

async function clickEffect(page, position) {
  await page.locator('#lf-record-ring').evaluate(async (ring, { x, y }) => {
    Object.assign(ring.style, { left: x + 'px', top: y + 'px' });
    const animation = ring.animate([
      { width: '22px', height: '22px', opacity: 1 },
      { width: '60px', height: '60px', opacity: 0 },
    ], { duration: 500, easing: 'linear' });
    await animation.finished;
  }, position);
}

async function record(page, origin) {
  const button = (name, scope = page) => scope.getByRole('button', { name, exact: true });
  const role = page.getByRole('combobox', { name: '切换演示角色' });
  const lead = page.getByRole('row', { name: '查看陈女士', exact: true });
  const detail = page.getByRole('dialog', { name: '线索详情' });
  const excel = page.getByRole('dialog', { name: 'Excel 导入线索' });

  const app = page.locator('#app');
  const modal = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: '转交线索' }) });
  const elapsed = () => ((performance.now() - start) / 1000).toFixed(3);
  const mark = (type, name) => console.log(`${elapsed()}  ${type}  ${name}`);

  async function open(path, text) {
    await page.goto(origin + path, { waitUntil: 'load' });
    if (text) {
      await page.evaluate(installOverlay);
      await setCaption(text);
    }
  }

  async function setCaption(text) {
    await showCaption(page, text);
    mark('caption', text);
  }

  async function act(target, name, perform) {
    const position = await pointAt(page, target);
    await outline(target, 600);
    mark('click', name);
    await clickEffect(page, position);
    await perform(position);
  }

  const click = (target, name) => act(target, name, ({ x, y }) => page.mouse.click(x, y));
  const choose = (target, label) => act(target, label, () => target.selectOption({ label }));

  await open('/_record/title');
  const start = performance.now();
  async function at(seconds) {
    const wait = start + seconds * 1000 - performance.now();
    if (wait < -1250) throw new Error(`Scene overran its ${seconds}s cue by ${Math.round(-wait)} ms`);
    await pause(Math.max(0, wait));
  }
  async function scene(seconds, name) {
    await at(seconds);
    mark('scene', name);
  }

  mark('scene', 'Title');
  await scene(7, 'The gap');
  await open('/case-study/', caption.gap);
  const diagram = page.getByRole('figure', { name: 'Handoff workflow comparison' });
  await center(diagram);
  await diagram.getByRole('heading', { name: 'With LeadFlow' }).waitFor();

  await scene(20, 'Send a handoff');
  await open('/', caption.send);
  await click(lead, 'open-chen');
  const summary = detail.getByText('沟通摘要', { exact: true }).locator('..');
  await frame(detail, summary, 1.4, { x: 841, y: 365 });
  await pause(2000);
  await click(button('转交线索', detail), 'handoff-form');
  await frame(modal, modal, 1.4);
  await choose(page.getByLabel('接收销售'), '周辰 · 杭州湖滨店');
  const reason = page.getByRole('textbox', { name: '交接原因' });
  await click(reason, 'handoff-reason');
  for (const character of '客户希望周六到湖滨店试驾，请提前确认儿童座椅。') {
    await page.keyboard.insertText(character);
    await pause(40);
  }
  const send = button('发起交接');
  await center(send);
  await click(send, 'send-handoff');
  const pending = detail.getByText('待 周辰 接收', { exact: true });
  await pending.waitFor();
  await setCaption(caption.pending);
  await frame(detail, pending.locator('..'), 1.4, { x: 841, y: 401 });
  await pause(2200);
  await at(45);
  await zoomOut(detail);
  await click(button('关闭详情', detail), 'close-sender-detail');

  await scene(50, 'Accept the handoff');
  await setCaption(caption.switchRole);
  await choose(role, '周辰 · 门店销售');
  await click(button('待接收'), 'pending-list');
  await click(lead, 'open-incoming-chen');
  const accept = button('接收线索', detail);
  await accept.waitFor();
  await frame(detail, accept.locator('../..'), 1.4, { x: 841, y: 365 });
  await click(accept, 'accept-handoff');
  await setCaption(caption.accept);
  const owner = detail.getByText('周辰 · 杭州湖滨店', { exact: true });
  await owner.waitFor();
  await frame(detail, owner.locator('..'), 1.4, { x: 635, y: 290 });
  mark('hold', 'owner');
  await outline(owner.locator('..'), 2000);
  const task = detail.getByText('接手联系 · 周辰', { exact: true });
  const history = detail.getByText('完整流转与跟进记录', { exact: true });
  await center(history);
  await frame(detail, history, 1.4, { x: 536, y: 342 });
  await task.waitFor();
  await detail.getByText('已接收', { exact: true }).first().waitFor();
  mark('hold', 'task-history');
  await pause(2000);
  await zoomOut(detail);
  await click(button('关闭详情', detail), 'close-recipient-detail');

  await scene(70, 'Timeouts escalate');
  await setCaption(caption.clock);
  for (let advance = 1; advance <= 3; advance++) {
    await click(button('+ 30 分钟'), 'advance-clock-' + advance);
  }
  await choose(role, '沈知行 · 主管');
  await page.getByRole('heading', { name: '团队数据看板' }).waitFor();
  const timeout = page.getByRole('button', { name: /^交接超时/ });
  const count = Number(await timeout.locator('.stat-num').innerText());
  if (count < 1) throw new Error('No timed-out handoffs after advancing the demo clock');
  const overdue = await page.getByRole('button', { name: /^逾期任务/ }).locator('.stat-num').innerText();
  mark('dashboard', `timeouts=${count} overdue=${overdue}`);
  await setCaption(caption.timeout);
  await frame(app, timeout.locator('..'), 1.27, { x: 637, y: 350 });
  await pause(2300);
  await click(timeout, 'timeout-drill-down');
  await page.getByRole('heading', { name: '流转中心', exact: true }).waitFor();
  const rows = page.locator('.transfer-card');
  await rows.first().waitFor();
  await frame(app, rows.first().locator('..'), 1.27, { x: 640, y: 340 });
  await pause(2000);
  await zoomOut(app);

  await scene(92, 'Excel import');
  await setCaption(caption.excelLoad);
  await click(button('团队线索'), 'team-leads');
  await click(button('从 Excel 导入'), 'open-excel');
  await click(button('载入演示示例', excel), 'load-workbook');
  await pause(1600);
  await click(button('校验并预览', excel), 'validate-workbook');
  for (const count of ['6 行', '2 行错误', '1 行重复', '3 行可新增']) {
    await excel.getByText(count, { exact: true }).waitFor();
  }
  await setCaption(caption.excel);
  await frame(excel, excel.locator('.excel-summary'), 1.35, { x: 795, y: 245 });
  mark('hold', 'excel-summary');
  await pause(2200);
  const duplicate = excel.getByText(/^重复：.*陈女士/);
  await center(duplicate);
  await frame(excel, duplicate, 1.35, { x: 980, y: 465 });
  mark('hold', 'excel-errors-and-duplicate');
  await pause(2600);
  await zoomOut(excel);

  await scene(114, 'Closing card');
  await open('/_record/close');
  await at(length + 0.45);
}

async function main() {
  await run(ffmpeg, ['-version']);
  const temporary = await mkdtemp(join(tmpdir(), 'leadflow-walkthrough-'));
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const staged = join(dirname(output), `.walkthrough-${process.pid}.mp4`);
  try {
    const args = process.env.LEADFLOW_CHROMIUM_ARGS?.split(/\s+/).filter(Boolean) || [];
    browser = await chromium.launch({ args });
    const context = await browser.newContext({
      viewport: size, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: temporary, size },
    });
    context.setDefaultTimeout(6000);
    const setup = await context.newPage();
    await setup.goto(origin + '/_record/setup');
    await setup.evaluate(() => localStorage.clear());
    await setup.goto(origin + '/');
    await setup.getByRole('button', { name: '开始体验', exact: true }).click();
    await setup.close();

    const page = await context.newPage();
    const video = page.video();
    await record(page, origin);
    await context.close();
    const raw = await video.path();
    await mkdir(dirname(output), { recursive: true });
    await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '0.25', '-i', raw,
      '-t', String(length), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', staged]);
    const { size: bytes } = await stat(staged);
    if (bytes >= 10_000_000) throw new Error(`Encoded file exceeds 10 MB (${bytes} bytes)`);
    await rename(staged, output);
    console.log(`Saved ${output} (${bytes.toLocaleString('en-US')} bytes)`);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true, force: true });
    await rm(staged, { force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
