import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
const base = 'resources/vendor'; await mkdir(base,{recursive:true});
const entries = [
 ['alpinejs/dist/alpine.js','alpine.js'],['alpinejs/LICENSE.md','licenses/alpine.md'],
 ['@fortawesome/fontawesome-free/css/all.min.css','fontawesome/css/all.min.css'],['@fortawesome/fontawesome-free/webfonts','fontawesome/webfonts'],['@fortawesome/fontawesome-free/LICENSE.txt','licenses/fontawesome.txt'],
 ['bootstrap-icons/font','bootstrap-icons'],['bootstrap-icons/LICENSE','licenses/bootstrap-icons.md'],
 ['@picocss/pico/css/pico.min.css','pico.css'],['@picocss/pico/LICENSE.md','licenses/pico.md'],
 ['sweetalert2/dist/sweetalert2.all.min.js','sweetalert2.js'],['sweetalert2/LICENSE','licenses/sweetalert2.txt'],
 ['@fontsource/inter/files','inter/files'],['@fontsource/inter/LICENSE','licenses/inter.txt']
];
for (const [source,target] of entries) { await mkdir(base+'/'+target.split('/').slice(0,-1).join('/'),{recursive:true}); await cp('node_modules/'+source,base+'/'+target,{recursive:true}); }
let fonts = '';
for (const weight of [200,300,400,500,600,700,900]) fonts += await readFile(`node_modules/@fontsource/inter/latin-${weight}.css`,'utf8');
await writeFile(base+'/inter/inter.css',fonts);
