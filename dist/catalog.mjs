// Prices are demo reference ranges in 万元, not customer-specific quotations.
export const VEHICLE_MODELS=Object.freeze([
 Object.freeze({name:'E5 长续航',min:20,max:25}),
 Object.freeze({name:'E7 四驱版',min:25,max:30}),
 Object.freeze({name:'E5 标准版',min:15,max:20})
]);
export const MODEL_NAMES=Object.freeze(VEHICLE_MODELS.map(m=>m.name));
export const getModel=name=>VEHICLE_MODELS.find(m=>m.name===name);
export const modelRange=name=>{const m=getModel(name);return m?`${m.min}–${m.max} 万`:'待确认';};
export const modelLabel=name=>getModel(name)?.name??name;
export const catalogRules=()=>VEHICLE_MODELS.map(m=>`${m.name}：${modelRange(m.name)}`).join('；');
export function parseBudget(value){
 const text=String(value??'').trim();
 if(!text||text==='待确认')return null;
 const match=/^(\d+(?:\.\d+)?)\s*(?:[–—\-~～至]\s*(\d+(?:\.\d+)?))?\s*万(?:元)?$/.exec(text);
 return match?{min:Number(match[1]),max:Number(match[2]??match[1])}:{invalid:true};
}
