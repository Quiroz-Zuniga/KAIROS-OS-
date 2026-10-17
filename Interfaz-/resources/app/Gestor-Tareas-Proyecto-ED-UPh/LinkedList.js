// implementación clase tarea y listaEnlazada

class Tarea {
    constructor(titulo, descripcion, importancia, fecha ) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.importancia = importancia;
        this.fecha = fecha;
        this.siguiente = null;  // siguiente es el nodo alcual estara enlazado la cabeza
    }
}

class listaEnlazada {
    constructor() {

        this.cabeza = null; //el primer nodo al cual le asignaremos la cabeza 
    };
    // Crear funciones para agregar, buscar y eliminar tareas
    agregar(titulo, descripcion, importancia, fecha) {
        const nuevaTarea = new Tarea(titulo, descripcion, importancia, fecha);
        if (this.cabeza === null) {
            this.cabeza = nuevaTarea;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente !== null) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevaTarea;
        };

    };

    eliminar(titulo) {
        let actual = this.cabeza;
        let previo = null;
        while (actual !== null && actual.titulo !== titulo) {
            previo = actual;
            actual = actual.siguiente;
        };
        if (actual === null) {
            console.log("Tarea no encontrada");
            return;
        };
        if (previo === null){
            this.cabeza = actual.siguiente;
        }else {
            previo.siguiente = actual.siguiente;
        };
        console.log(`Tarea "${titulo}" eliminada.`);
    };
    mostrar() {
        let actual = this.cabeza;
        while (actual !== null) {
            console.log(`Titulo: ${actual.titulo}, Descripción: ${actual.descripcion}, Imporatancia: ${actual.importancia}, Fecha: ${actual.fecha}`);
            actual = actual.siguiente;
        };
    };
};




// Crear instancia de lista enlazada

// const listaTareas = new listaEnlazada();

// listaTareas.agregar('Tarea calculo II', 'Realizar una guía par el día martes', 1);
// listaTareas.agregar('Tarea Final Estructura de datos', 'Crear un programa que implemente las estructuras de datos visto en clases', 2);

// listaTareas.agregar('Tarea Dibujo Técnico', 'Realizar proyecto final, dibujar la universidad', 3);

// // listaTareas.mostrar();
// console.log("-----------------------------");
// listaTareas.eliminar('Tarea Final Estructura de datos');
// console.log("-----------------------------");
// listaTareas.mostrar();
