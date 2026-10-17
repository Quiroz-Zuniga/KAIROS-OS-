// El borrado conserva el cursor de IP y se limita a la instalación de KAIROS.
export async function prepararRestauracion(repositorio) {
  const instalacion = await repositorio.cargar();
  if (!instalacion) throw new Error('restauracion.noInstalacion');
  let realizada = false;
  return async confirmacion => {
    if (confirmacion.trim() !== 'confirmar') throw new Error('restauracion.errorConfirmacion');
    if (realizada) throw new Error('terminal.errorConflicto');
    await repositorio.borrarInstalacion(instalacion.revision ?? 0, instalacion.fecha);
    realizada = true;
  };
}
