const inputSearch = document.querySelector(".main__search-input");

//Evento Keyup, es decir cuando se escribe en el input verifico si se presiono el enter
inputSearch.addEventListener("keyup", function(e){
    //Obtenemos de los datos del evento el codigo de la tecla y decimos que si es igual a 13 (Enter) ejecute la busqueda
    if (e.keyCode == 13) {

        if (inputSearch.value === "") {
            Swal.fire({
                icon: 'error',
                title: 'Ingrese la Busqueda'
              });
        }else{
            const consulta = inputSearch.value;

            //Redirigimos la busqueda
            window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(consulta);
        }
    }
});