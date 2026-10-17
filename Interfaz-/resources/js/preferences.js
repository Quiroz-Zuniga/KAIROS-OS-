// Preferencias visuales; nunca credenciales, procesos ni snapshots del Core.
const kairosImagesRoot = new URL('../assets/images/', document.currentScript.src);
function imageURL(value) {
    if (typeof value !== 'string') return null;
    if (/^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value;
    try {
        let url = new URL(value, document.baseURI);
        if (url.origin !== location.origin) return null;
        // Reubicar preferencias guardadas antes de cambiar el directorio de publicación.
        const marker = '/resources/assets/images/';
        const index = url.pathname.indexOf(marker);
        if (index >= 0) url = new URL(url.pathname.slice(index + marker.length), kairosImagesRoot);
        return url.href.startsWith(kairosImagesRoot.href) ? url.href : null;
    } catch { return null; }
}
window.KAIROSPreferences = Object.freeze({
    read(key, fallback, validate = () => true) {
        try { const value = JSON.parse(localStorage.getItem(key)); return value !== null && validate(value) ? value : fallback; }
        catch { return fallback; }
    },
    write(key,value) {
        try { localStorage.setItem(key,JSON.stringify(value)); return true; }
        catch { window.dispatchEvent(new CustomEvent('kairos:notice',{detail:'No se pudo guardar la preferencia en este navegador.'})); return false; }
    },
    wallpaper() {
        try { const value = localStorage.getItem('wallpaper'); return this.validImage(value) && !/\/(?:fondo[1-6]|fondologin|fondoregistro)\.png$/i.test(value) ? imageURL(value) : null; } catch { return null; }
    },
    validImage(value) {
        return imageURL(value) !== null;
    },
    imageURL,
    setWallpaper(value) {
        if (!this.validImage(value)) return false;
        try { localStorage.setItem('wallpaper',imageURL(value)); return true; }
        catch { window.dispatchEvent(new CustomEvent('kairos:notice',{detail:'No se pudo guardar el fondo. El almacenamiento puede estar lleno.'})); return false; }
    }
});
window.addEventListener('kairos:notice',event => {
    let node = document.querySelector('#kairos-notice');
    if (!node) { node = document.createElement('p'); node.id = 'kairos-notice'; node.setAttribute('role','status'); document.body.append(node); }
    node.textContent = event.detail; node.hidden = false;
});
