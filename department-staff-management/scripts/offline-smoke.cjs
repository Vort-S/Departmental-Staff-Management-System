/* Limited Node.js execution of production TypeScript helper source without npm packages.
 * This is NOT Vitest, integration, browser, typecheck, or a production build.
 * It is intentionally narrow and records which assertions really executed.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')}
function loadSource(relative,overrides={}){
 const filename=path.resolve(__dirname,'..',relative),source=fs.readFileSync(filename,'utf8');
 const compiled=ts.transpileModule(source,{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));const original=mod.require.bind(mod);mod.require=(name)=>Object.prototype.hasOwnProperty.call(overrides,name)?overrides[name]:original(name);mod._compile(compiled,filename);return mod.exports;
}
const r=loadSource('src/lib/rules.ts');
const key=require('node:crypto').randomBytes(32),s=loadSource('src/lib/security.ts',{'@node-rs/argon2':{Algorithm:{Argon2id:2}},'./env':{env:()=>({FIELD_ENCRYPTION_KEY:key.toString('base64'),SESSION_SECRET:'0123456789'.repeat(6)})}});
const results=[],started=new Date().toISOString();
function run(id,title,fn){try{fn();results.push({id,status:'PASSED',steps:title,expected:'Assertions pass on executed production helper source',actual:'Passed in Node offline smoke execution'});console.log('PASS',id,title)}catch(error){results.push({id,status:'FAILED',steps:title,expected:'Assertions pass',actual:String(error?.message??error).slice(0,250)});console.error('FAIL',id,error.message)}}
const alice={id:'alice',departmentId:'d',role:'STAFF'},hod={id:'hod',departmentId:'d',role:'HOD'},row={id:'p',userId:'bob',departmentId:'d'};
run('U03','AES-256-GCM encrypt/decrypt + changed-key and authentication tag rejection',()=>{const c=s.crypt('fictional-example',key);assert.equal(s.decrypt(c,key),'fictional-example');assert.throws(()=>s.decrypt(c,require('node:crypto').randomBytes(32)));const parts=c.split('.');parts[2]='AAAAAAAAAAAAAAAA';assert.throws(()=>s.decrypt(parts.join('.'),key));assert.equal(s.tokenDigest('token','secret').length,64)});
run('U04','Role + field permissions and self-approval restrictions',()=>{assert.equal(r.canReadSensitive(alice,row,'nationalId'),false);assert.equal(r.canReadSensitive({...alice,id:'bob'},row,'nationalId'),true);assert.equal(r.canReadSensitive(hod,row,'nationalId'),false);assert.equal(r.canReadSensitive(hod,row,'phone'),true);assert.equal(r.canReadStaff({...alice,departmentId:'other'},row),false);assert.equal(r.canDecideLeave(hod,'hod','d'),false);assert.equal(r.canDecideLeave(hod,'bob','d'),true);assert.equal(r.canAppraise(hod,{...row,userId:'hod'}),false)});
run('U05','Inclusive annual leave days, overlap and backdate cutoff',()=>{assert.equal(r.leaveDays('2026-11-18','2026-11-20'),3);assert.throws(()=>r.leaveDays('2026-11-20','2026-11-18'));assert.equal(r.overlaps('2026-11-18','2026-11-20','2026-11-20','2026-11-22'),true);assert.equal(r.validateLeavePolicy('2026-11-01','2026-11-02',new Date('2026-11-16')),false)});
run('U06','Teaching load warning threshold',()=>{assert.equal(r.teachingUnits([3,4,5]),12);assert.equal(r.overloaded([3,4,6]),true);assert.equal(r.overloaded([3,4,5]),false)});
run('U07','CSV injection mitigation and embedded quote escaping',()=>{for(const prefix of ['=','+','-','@','\t='])assert.match(r.csvCell(prefix+'SUM(1)'),/^"'/);assert.equal(r.csvCell('he said "hello"'),'"he said ""hello"""');assert.equal(r.csvLine(['hello']).endsWith('\r\n'),true)});
run('U08','Session idle and absolute timeout arithmetic',()=>{assert.equal(r.isExpired(new Date('2026-01-01T00:00:00Z'),new Date('2026-01-01T00:20:00Z'),new Date('2026-01-01T00:49:00Z')),false);assert.equal(r.isExpired(new Date('2026-01-01T00:00:00Z'),new Date('2026-01-01T00:20:00Z'),new Date('2026-01-01T00:50:00Z')),true);assert.equal(r.isExpired(new Date('2026-01-01T00:00:00Z'),new Date('2026-01-01T11:59:00Z'),new Date('2026-01-01T12:00:00Z')),true)});
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/offline-smoke.json',JSON.stringify({generatedAt:started,source:'Node offline smoke: executed transpiled production TypeScript helpers; NOT Vitest/DB/E2E',results},null,2));
if(results.some(x=>x.status==='FAILED'))process.exitCode=1;
