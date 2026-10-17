const fulImgBox = document.getElementById("fulImgBox"),
fulImg = document.getElementById("fulImg");

function openFulImg(reference){
    fulImgBox.style.display = "flex";
    fulImg.src = reference
}
function closeImg(){
    fulImgBox.style.display = "none";
}

// Mostrar la imagen anterior
    function showPrevImage() {
      if (!images.length) return;
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      showImage();
    }

    // Mostrar la siguiente imagen
    function showNextImage() {
      if (!images.length) return;
      currentImageIndex = (currentImageIndex + 1) % images.length;
      showImage();
    }

    // Mostrar la imagen actual
    function showImage() {
      imagesContainer.innerHTML = "";
      images.forEach((image, index) => {
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.alt = `Imagen ${index + 1}`;
        imgElement.style.display = index === currentImageIndex ? "block" : "none";
        imagesContainer.appendChild(imgElement);
      });
      UPHOSPreferences.write("imagenesGuardadas", images);
    }

    // Mostrar modal de confirmación
    function confirmDelete() {
      if (images.length === 0) return;
      modal.style.display = "flex";
    }

    // Cerrar el modal
    function closeModal() {
      modal.style.display = "none";
    }

    // Eliminar imagen actual
    function deleteCurrentImage() {
      images.splice(currentImageIndex, 1);
      currentImageIndex = Math.max(0, currentImageIndex - 1);
      closeModal();
      showImage();
    }

    // Cambia el fondo del contenedor de la galería
function setAsWallpaper() {
  const currentImgSrc = images[currentImageIndex];
  if (!currentImgSrc || !UPHOSPreferences.setWallpaper(currentImgSrc)) return;
  if (window.parent !== window) window.parent.document.dispatchEvent(new Event('uphos:wallpaper'));
  window.dispatchEvent(new CustomEvent('uphos:notice',{ detail:'Fondo de escritorio actualizado.' }));
}

    // Subir imagen desde el dispositivo
    const uploadInput = document.getElementById("upload-image");
if (uploadInput) {
  uploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        images.push(e.target.result);
        currentImageIndex = images.length - 1;
        showImage();
      };
      reader.readAsDataURL(file);
    }
  });
}

    // Navegación con flechas del teclado
    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") showNextImage();
      else if (event.key === "ArrowLeft") showPrevImage();
    });

    // Mostrar imagen al cargar la página
    showImage();
    