//Mostrar Options y Profile

//Variables donde se remplazaran valores cuando se elija la cuenta
const accountImgDefault = document.querySelector(".header__top__img");
const accountNameDefault = document.querySelector(".header__top__name");
const accountEmailDefault = document.querySelector(".header__top__email");
const imageProfile = document.querySelector(".header__profile__img");
const imageProfileSections = document.querySelector(".icon");

//Options

const options = document.getElementById('options');
const sections = document.querySelector('.header-sections__content');

options.addEventListener('click', function(e){
    e.preventDefault();

    //Verificamos que el otro contenedor no este abierto
    validarContenedor(profile__section, "show__profile");
    
    //Ponemos clase show
    sections.classList.toggle("show__sections");
});

//Profile

const profile = document.getElementById('profile');
const profile__section = document.querySelector('.header__profile');

profile.addEventListener('click', function(e){
    e.preventDefault();

    //Verificamos que el otro contenedor no este abierto
    validarContenedor(sections, "show__sections");
    
    //Ponemos clase show
    profile__section.classList.toggle("show__profile");

    //Cada vez que se abra el profile se ejecutara la funcion de seleccionar cuenta para tenerla siempre activa.
    seleccionarCuenta();
});

//Abertura de Contenedores si alguno esta abierto

function validarContenedor(nombre, clase) {
    if (nombre.classList.contains(clase) === true) {
        //Si esta abierto, le quita la clase
        nombre.classList.remove(clase);
    }
}

//Funcion para cerrar cuenta si se presiona main
const main = document.querySelector(".main");

main.addEventListener("click", function(){
    //Cerramos todos los contenedores (Secciones o Profiles)
    validarContenedor(sections, "show__sections");
    validarContenedor(profile__section, "show__profile");
})

//Añadir Cuenta

//Mostramos el Div

const btn__añadir = document.getElementById('añadir__cuenta');
const div__añadir = document.querySelector(".container__form");

btn__añadir.addEventListener('click', function(e){
    e.preventDefault();

    //Cerramos el contenedor de perfiles
    validarContenedor(profile__section, "show__profile");

    div__añadir.classList.add("show__form");
})

//Cerrar Div

const close = document.querySelector(".cancel");

close.addEventListener("click", function(){
    div__añadir.classList.remove("show__form");
});

//Codigo para previsualizar las imagenes

const radio_1 = document.getElementById('avatar__1');
const radio_2 = document.getElementById('avatar__2');
const radio_3 = document.getElementById('avatar__3');

const img = document.querySelector(".form__img");

const url = "assets/img/Users/user-";

radio_1.addEventListener("change", function(){
    img.src = url + "1.png";
});

radio_2.addEventListener("change", function(){
    img.src = url + "2.png";
});

radio_3.addEventListener("change", function(){
    img.src = url + "3.png";
});

//Contamos la cantidad de cuentas por default (2)
let divsAccounts = document.getElementsByClassName("account");

//Validamos formulario y mostramos mensaje

const divAdittionalAcounts = document.querySelector(".header__profile__adittional__acounts");

const btn__submit = document.getElementById('submit');
const form = document.querySelector('.form');

btn__submit.addEventListener("click", function(e){
    e.preventDefault();

    //Obtenemos valores de los formularios
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const img__source = document.querySelector(".form__img").src;

    //Expresion Regular para validar el email
    const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (nombre !== "" && regEx.test(email) === true) {
        //Usamos Sweetalert
        Swal.fire({
            icon: 'success',
            title: 'Usuario Agregado'
          });
          div__añadir.classList.remove("show__form");
          limpiarFormulario();

          //Definimos los elementos

          const divAccount = document.createElement("div");
          const divTexts = document.createElement("div");
          const title = document.createElement("h4");
          const textEmail = document.createElement("p");

          //Creacion de div
          createDiv(divAccount, "account", divAdittionalAcounts);

          //Creamos imagen y añadimos clase y src

          const img__acount = document.createElement("img");
          img__acount.src = img__source;
          img__acount.classList.add("account__img");
          divAccount.appendChild(img__acount);


          //Creacion de div de textos
          createDiv(divTexts, "account__texts", divAccount);

          //Creamos Textos

          //H4
          createtext(title, "account__name", divTexts, nombre);

          //p
          createtext(textEmail, "account__email", divTexts, email);

          //Actualizamos variable divAccount, para saber cuantas cuentas hay

          divsAccounts = document.getElementsByClassName("account");

    }else{
        Swal.fire({
            icon: 'error',
            title: 'Ingrese los Datos'
          });
          limpiarFormulario();
    }
});

//Funcion para limpiar el formulario

function limpiarFormulario(){
    document.getElementById("nombre").value = "";
    document.getElementById("email").value = "";
    radio_1.setAttribute("checked", "true");
}

//Funciones para crear elementos

function createDiv(div__name, clase, padre){
    //Colocamos clase
    div__name.classList.add(clase);
    //Mostramos el elemento
    padre.appendChild(div__name);
}

function createtext(text__name, clase, padre, texto){
    //Colocamos Textos
    text__name.innerHTML = texto;
    //Añadimos clase
    text__name.classList.add(clase);
    //Mostramos el elemento
    padre.appendChild(text__name);
}



//Funcionalidad de Cerrar Sesion en las cuentas adicionales

const closeAcountButton = document.querySelector(".close__sessions");

closeAcountButton.addEventListener("click", function(e){
    e.preventDefault();

    //Mientras que haya un ultimo elemento en el container lo elimina
while (divAdittionalAcounts.lastElementChild) {
    //Remueve o elemina ese hijo (siempre el ultimo hasta llegar al primero)
    divAdittionalAcounts.removeChild(divAdittionalAcounts.lastElementChild);
  }

  //Restauramos la cuenta
  resetAccount();
});




function seleccionarCuenta(){
//Creamos un for que recorra todos los divs obtenidos

//La longitud de divs por default es 2, pero recordemos que los nodos inician en 0
for (let i = 0; i < divsAccounts.length; i++) {
    //Añadimos un evento click cada vez que se presione un div, esto lo hacemos seleccionandolo con la posicion i
    divsAccounts[i].addEventListener("click", function(){
        //Para interactuar con el elemento seleccionado usamos this
        
        //Obtenemos src de la imagen
        //Obtenemos el primer elemento hijo (imagen)
        const srcAccountImg = this.firstElementChild.src;

        //Entramos en el contenedor de los textos (lastElementChild)
        const divAccountTexts = this.lastElementChild;

        //Obtenemos los elemento de divAccountTexts (Nombre y Email)
        //Nombre = firstElementChild | Email = lastElementChild

        //Nombre
        const nameAccount = divAccountTexts.firstElementChild.innerHTML;

        //Email
        const emailAccount = divAccountTexts.lastElementChild.innerHTML;

        //Remplazamos datos en la web

        accountImgDefault.src = srcAccountImg;
        accountNameDefault.innerHTML = nameAccount;
        accountEmailDefault.innerHTML = emailAccount;
        imageProfile.src = srcAccountImg;
        imageProfileSections.src = srcAccountImg;
    });
}
}

function resetAccount(){
        accountImgDefault.src = "assets/img/profile.png";
        accountNameDefault.innerHTML = "Eddie Santiago Delgado";
        accountEmailDefault.innerHTML = "eddiesantiago122007@gmail.com";
        imageProfile.src = "assets/img/profile.png";
        imageProfileSections.src = "assets/img/profile.png";
}

//Boton Restaurar Cuenta
const buttonRestart = document.querySelector(".restart__session");

buttonRestart.addEventListener("click", resetAccount);