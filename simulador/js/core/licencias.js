// Claves de demostracion academica; no constituyen DRM ni licencias comerciales.
export const LICENCIAS_PRO = Object.freeze([
  'KAIROS-PRO-H7K2-M9Q4-T6XA', 'KAIROS-PRO-B3W8-N5R2-L9VC',
  'KAIROS-PRO-D8F4-P2J7-Z6ME', 'KAIROS-PRO-Q5S9-A3U6-K2NB',
  'KAIROS-PRO-V4C7-E8Y3-R5HD'
]);
export const licenciaValida = clave => typeof clave === 'string' && LICENCIAS_PRO.includes(clave.trim().toUpperCase());
