import {writeFile} from 'node:fs/promises';
import {renderCaseStudy} from '../dist/case-study/page.mjs';

const {content,html}=renderCaseStudy();
const escape=value=>String(value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
await writeFile(new URL('../dist/case-study/index.html',import.meta.url),`<!doctype html>
<!-- Generated from caseStudyContent.mjs. Run: node scripts/build-case-study.mjs -->
<html lang="${escape(content.language)}">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <meta name="description" content="${escape(content.hero.subtitle)}">
 <title>${escape(content.pageTitle)}</title>
 <link rel="stylesheet" href="../style.css">
 <link rel="stylesheet" href="./page.css">
</head>
<body class="case-study"><div id="case-study">${html}</div><script type="module" src="./page.mjs"></script></body>
</html>
`);
