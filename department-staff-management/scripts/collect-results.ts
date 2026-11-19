import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {catalog} from "../src/lib/test-catalog";
type Evidence={id:string,status:"PASSED"|"FAILED"|"SKIPPED",actual:string,steps:string,expected:string};
// One row per test ID in the app. A failure in any actual browser/device run
// takes precedence over a pass; execution takes precedence over skipped cases.
const records=new Map<string,Evidence>();
function merge(r:Evidence){const old=records.get(r.id);
 if(!old||r.status==="FAILED"||old.status!=="FAILED"&&(r.status==="PASSED"||old.status==="SKIPPED"))records.set(r.id,r);
}
let smokeEvidence=false,runnerEvidence=false;
if(existsSync("test-results/offline-smoke.json")){try{const x=JSON.parse(readFileSync("test-results/offline-smoke.json","utf8"));for(const r of x.results??[])merge(r);smokeEvidence=true;}catch{console.error("Could not parse offline smoke report")}}
function append(title:string,status:string,error?:string){const id=title.match(/\[([A-Z]\d{2})\]/)?.[1];if(!id)return;const value=status==="passed"||status==="expected"?"PASSED":status==="failed"||status==="unexpected"?"FAILED":"SKIPPED";merge({id,status:value,actual:value==="FAILED"?(error??"Assertion failed").slice(0,250):value,steps:"Run automated test: "+title,expected:"All assertions pass"});}
for(const file of ["test-results/vitest-unit.json","test-results/vitest.json"]){if(existsSync(file)){try{const x=JSON.parse(readFileSync(file,"utf8"));for(const f of x.testResults??[])for(const a of f.assertionResults??[])append(a.fullName??a.title,a.status,a.failureMessages?.[0]);runnerEvidence=true;}catch{console.error("Could not parse test results from",file)}}}
if(existsSync("test-results/playwright.json")){try{const x=JSON.parse(readFileSync("test-results/playwright.json","utf8"));type PlaywrightSuite={specs?:{title:string,tests?:{results?:{status?:string,errors?:{message?:string}[]}[]}[]}[];suites?:PlaywrightSuite[]};
const visit=(s:PlaywrightSuite)=>{for(const spec of s.specs??[])for(const t of spec.tests??[]){const result=t.results?.at(-1);append(spec.title,result?.status??"skipped",result?.errors?.[0]?.message)}for(const nested of s.suites??[])visit(nested)};for(const s of x.suites??[])visit(s);runnerEvidence=true;}catch{console.error("Could not parse Playwright output")}}
const results=[...records.values()].sort((a,b)=>a.id.localeCompare(b.id));const ids=new Set(records.keys());const expected=new Set(catalog.map(r=>r[0]));
const summary={passed:results.filter(x=>x.status==="PASSED").length,failed:results.filter(x=>x.status==="FAILED").length,skipped:results.filter(x=>x.status==="SKIPPED").length,notRun:results.length===0};
const source=runnerEvidence?(smokeEvidence?"Node offline smoke, executed Vitest and/or Playwright reporters":"Executed Vitest and/or Playwright reporters"):(smokeEvidence?"Node offline smoke: executed transpiled production TypeScript helpers; NOT Vitest/DB/E2E":"No supported test reports found");
writeFileSync("test-results/latest.json",JSON.stringify({generatedAt:results.length?new Date().toISOString():null,source,summary,results},null,2));
console.log(`Recorded ${results.length} unique test IDs; ${expected.size-ids.size} catalog IDs without evidence. No pass/fail results were inferred.`);
