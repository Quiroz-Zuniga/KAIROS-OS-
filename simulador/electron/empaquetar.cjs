const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { constants } = require('node:fs');
const { build, Platform } = require('electron-builder');

// Production staging avoids OneDrive locks and excludes development dependencies.
async function empaquetar() {
  const proyecto = path.resolve(__dirname, '..');
  const paquete = JSON.parse(await fs.readFile(path.join(proyecto, 'package.json'), 'utf8'));
  const temporal = await fs.mkdtemp(path.join(os.tmpdir(), 'uphos-empaquetado-'));
  const aplicacion = path.join(temporal, 'aplicacion');
  await fs.mkdir(aplicacion);
  for (const nombre of ['index.html', 'css', 'js', 'apps', 'assets', 'electron']) await fs.cp(path.join(proyecto, nombre), path.join(aplicacion, nombre), { recursive: true });
  const produccion = { ...paquete, packageManager: 'traversal' };
  delete produccion.devDependencies; delete produccion.build; delete produccion.scripts;
  await fs.writeFile(path.join(aplicacion, 'package.json'), JSON.stringify(produccion));
  const config = { ...paquete.build, electronVersion: paquete.devDependencies.electron, npmRebuild: false,
    directories: { app: aplicacion, output: path.join(temporal, 'salida'), buildResources: path.join(aplicacion, 'assets') } };
  console.log('Carpeta de compilacion: ' + temporal);
  const artefactos = await build({ projectDir: aplicacion, config, targets: Platform.WINDOWS.createTarget(['portable']) });
  const entregables = path.resolve(proyecto, '../entregables');
  await fs.mkdir(entregables, { recursive: true });
  for (const artefacto of artefactos.filter(a => a.endsWith('.exe'))) {
    const destino = path.join(entregables, path.basename(artefacto));
    await fs.copyFile(artefacto, destino, constants.COPYFILE_EXCL);
    console.log('Ejecutable: ' + destino);
  }
}
empaquetar().catch(error => { console.error(error.message); process.exitCode = 1; });
