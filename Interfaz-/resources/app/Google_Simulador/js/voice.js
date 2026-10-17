//Busqueda por voz

let reconocimiento;

//Verificamos que se pueda usar la api

if (!("webkitSpeechRecognition" in window)) {
    Swal.fire({
        icon: 'error',
        title: 'No puedes usar la API'
      });
    window.location.href="index.html";
}else{
    //Creamos el objeto
    reconocimiento = new webkitSpeechRecognition();
    reconocimiento.lang = "es-CO";
    reconocimiento.continuous = true;
    reconocimiento.interim = true;
    reconocimiento.addEventListener("result", iniciar);
}

//Funcion Iniciar

function iniciar(event){

    //Lo que sucede es que cada vez que se dice algo se va a escribir en el input, de esta manera creamos una variable i con el indice del resultado que se va a ir mostrando hasta que complete y escriba todas las palabras (results.length)
    for(let i = event.resultIndex; i < event.results.length; i++){
        //Transcript para transcribirlo y mostrarlo en palabras
        document.querySelector(".search__text").innerHTML = event.results[i][0].transcript;
    }
}

//Iniciamos el reconocimiento

reconocimiento.start();

//Hacemos la busqueda despues de 4 segundos, esto lo hacemos con setTimeout

setTimeout(() => {
    
    //Paramos el reconocimiento
    reconocimiento.stop();

    //Obtenemos lo escrito en el span
    const consulta = document.querySelector(".search__text").innerText;

    //Ejecutamos busqueda

    const url = "https://www.google.com/search?q=" + consulta;

    window.open(url, '_blank');
}, 10000);