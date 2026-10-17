import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
execFileSync('npm',['run','build:css'],{stdio:'inherit'});
await rm('dist',{recursive:true,force:true}); await mkdir('dist');
await cp('index.html','dist/index.html'); await cp('resources','dist/resources',{recursive:true});
console.log('Distribución estática generada en dist/');
