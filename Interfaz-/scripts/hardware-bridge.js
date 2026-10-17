import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const run=promisify(execFile), script=fileURLToPath(new URL('./system_status.py',import.meta.url));
let cached,pending,updated=0;
export async function readHardware() {
    if(cached && Date.now()-updated<5000)return cached;
    if(pending)return pending;
    pending=(async()=>{
        const {stdout}=await run(process.env.UPHOS_PYTHON||'python3',['-I',script],{timeout:10000,maxBuffer:128*1024,encoding:'utf8'});
        const result=JSON.parse(stdout);if(result.source!=='local-python'||!result.battery||!result.audio||!result.network)throw Error('Respuesta local inválida');
        cached=result;updated=Date.now();return result;
    })();
    try{return await pending;}finally{pending=null;}
}
