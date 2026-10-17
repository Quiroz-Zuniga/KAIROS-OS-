// Implemenmte clase Nodo y Clase ArbolBinario
class Nodo {
    constructor(tarea) {
        this.tarea = tarea;
        this.izquierda = null;
        this.derecha = null;
    };
};

class ArbolBinario {
    constructor() {
        this.raiz = null;
    };
// Creación de las respectivas funciones para insertar y busquedas 


insertar(tarea) {
    const nuevoNodo = new Nodo(tarea);
    if(this.raiz === null) {
        this.raiz = nuevoNodo;
    } else  {
        this.insertarNodo(this.raiz, nuevoNodo)
    };
  };

//  ordenamos por nivel de importancias los nodos
  insertarNodo(nodo, nuevoNodo){
    if(nuevoNodo.tarea.importancia < nodo.tarea.importancia) {
        if (nodo.izquierda === null) {
            nodo.izquierda = nuevoNodo;
        } else {
            this.insertarNodo(nodo.izquierda, nuevoNodo);
        }; 
        }else {
             if (nodo.derecha === null ) {
                nodo.derecha = nuevoNodo;
        } else {
            this.insertarNodo(nodo.derecha, nuevoNodo);
        };
    };
  };
    inOrden(nodo, callback) {
        if(nodo != null) {
            this.inOrden(nodo.izquierda, callback);
            callback(nodo.tarea);
            this.inOrden(nodo.derecha, callback);
        }
    }
// Eliminar 
    eliminar(titulo, nodo = this.raiz) { 
        if (nodo === null) return null;
        if (titulo < nodo.tarea.titulo) {
            nodo.izquierda  = this.eliminar(titulo,  nodo.izquierda);
            return nodo;
        } else if (titulo > nodo.tarea.titulo){ 
            nodo.derecha = this.eliminar(titulo, nodo.derecha);
            return nodo;
        } else {
            if (nodo.izquierda === null) return nodo.derecha;
            if (nodo.derecha == null) return nodo.izquierda;

            let sucesor = this.minValor(nodo.derecha);
            nodo.tarea = sucesor.tarea;
            nodo.derecha = this.eliminar(sucesor.tarea.titulo, nodo.derecha);
            return nodo;
        }
    }
// fuunción axiliar para encontrar al sucesor de la raiz
    minValor(nodo) {
        let actual = nodo;
        while (actual.izquierda !== null) {
            actual = actual.izquierda;
        }
        return actual;
    }
};

// creacion de estancias para el arbolbinario

// const arbolTareas = new ArbolBinario();

// function mostrarTarea(tarea) {
//     console.log(`Título: ${tarea.titulo}, Descripción: ${tarea.descripcion}, Importancia: ${tarea.importancia}`);
// };

// // insertar tareas

// arbolTareas.insertar({ titulo: 'Tarea 1', descripcion: 'Descripción 1', importancia: 2 });
// arbolTareas.insertar({ titulo: 'Tarea 2', descripcion: 'Descripción 2', importancia: 1 }); 
// arbolTareas.insertar({ titulo: 'Tarea 3', descripcion: 'Descripción 3', importancia: 
// 3 });
// arbolTareas.insertar({ titulo: 'Tarea 4', descripcion: 'Descripción 4', importancia: 
//     1 });
// // recorrer el orden del arbol
// console.log("------------------------");
// arbolTareas.inOrden(arbolTareas.raiz, mostrarTarea);