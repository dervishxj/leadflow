import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {VEHICLE_MODELS,modelRange,catalogRules} from '../dist/catalog.mjs';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=path.resolve(project,'../..');
const out=base+'/outputs/import';
await fs.mkdir(out,{recursive:true});
const standard=['客户姓名','手机号','来源','意向车型','预算区间','负责人','备注'];
const [longRange,performance,standardTrim]=VEHICLE_MODELS.map(m=>m.name);
const samples=[
 ['演示客户甲','13900001001','品牌官网',longRange,modelRange(longRange),'林悦','新增，归属线上销售'],
 ['演示客户乙','13900001002','品牌活动',performance,modelRange(performance),'','负责人留空，进入主管待分配池'],
 ['演示客户丙','13900001003','自然到店',standardTrim,modelRange(standardTrim),'周辰','新增，归属湖滨店'],
 ['错误手机号客户','12345','品牌官网',longRange,modelRange(longRange),'林悦','故意错误：手机号格式不正确'],
 ['错误车型及负责人','13900001005','品牌活动','不存在的车型','25–30 万','不存在的销售','故意错误：车型和负责人不存在'],
 ['陈女士','13800006800','品牌官网',longRange,modelRange(longRange),'林悦','重复演示：追加新的购车咨询备注']
];
for(const [file,headers,data] of [['leadflow-template.xlsx',standard,[]],['leadflow-sample.xlsx',['姓名','联系方式','渠道','车型','预算','销售','说明'],samples]]){
 const wb=Workbook.create(),sheet=wb.worksheets.add('线索');sheet.showGridLines=false;
 sheet.getRange('A1:G'+Math.max(2,data.length+1)).values=[headers,...(data.length?data:[Array(7).fill('')])];
 sheet.getRange('A1:G'+Math.max(2,data.length+1)).format.font={name:'Arial',size:11};
 sheet.getRange('A1:G1').format={fill:'#245D46',font:{name:'Arial',bold:true,color:'#FFFFFF'},rowHeight:28};
 sheet.getRange('A1:G1').format.horizontalAlignment='center';
 sheet.getRange('A:G').format.columnWidth=19;
 sheet.getRange('G:G').format.columnWidth=55;
 sheet.getRange('B2:B'+Math.max(2,data.length+1)).setNumberFormat('@');
 sheet.getRange('A2:G'+Math.max(2,data.length+1)).format.rowHeight=28;
 sheet.freezePanes.freezeRows(1);
 if(data.length){sheet.getRange('A5:G6').format.fill='#FFF1EF';sheet.getRange('A7:G7').format.fill='#FFF6DF';}
 const notes=wb.worksheets.add('填写说明');notes.showGridLines=false;
 const instructions=[['项目','填写规则'],['必填','客户姓名、手机号、来源、意向车型'],['手机号','中国大陆11位手机号码；作为文本填写。支持+86、空格和横线归一化。'],['车型库',catalogRules()],['负责人','林悦/u1、周辰/u2、许宁/u3、陆远/u4；留空进入线上直营主管待分配池。'],['来源','填写实际渠道名称；原型支持自定义来源。'],['合并','按手机号查重；合并保留原负责人、状态及原始来源，追加备注与批次记录。'],['隐私与存储','仅使用虚构演示数据。浏览器解析并本地保存，重置演示清除导入。'],['示例预期',file.includes('sample')?'重置演示后导入第一张表：3行新增、2行错误、1行命中陈女士。跳过错误并合并重复后：成功3、合并1、跳过2。':'第一张表为待填写模板，第二行为空，可直接开始填写。'],['数据来源','为LeadFlow功能验证人工构造；示例手机号为模拟标识，不用于联系客户。']];
 notes.getRange('A1:B'+instructions.length).values=instructions;notes.getRange('A:B').format.font={name:'Arial',size:11};notes.getRange('A:A').format.columnWidth=18;notes.getRange('B:B').format.columnWidth=100;notes.getRange('A1:B1').format={fill:'#245D46',font:{name:'Arial',bold:true,color:'#FFFFFF'},rowHeight:28};notes.getRange('A2:B'+instructions.length).format.rowHeight=38;notes.getRange('B2:B'+instructions.length).format.wrapText=true;
 wb.recalculate();
 console.log((await wb.inspect({kind:'table',range:'线索!A1:G8',include:'values',maxChars:1800,tableMaxRows:8,tableMaxCols:7})).ndjson);
 for(const name of ['线索','填写说明']){const blob=await wb.render({sheetName:name,range:name==='线索'?'A1:G8':'A1:B10',scale:1,format:'png'});await fs.writeFile(base+'/work/excel/'+file+'-'+name+'.png',new Uint8Array(await blob.arrayBuffer()));}
 const book=await SpreadsheetFile.exportXlsx(wb);await book.save(out+'/'+file);
}
const dest=project+'/dist/files';await fs.mkdir(dest,{recursive:true});
for(const f of ['leadflow-template.xlsx','leadflow-sample.xlsx'])await fs.copyFile(out+'/'+f,dest+'/'+f);
