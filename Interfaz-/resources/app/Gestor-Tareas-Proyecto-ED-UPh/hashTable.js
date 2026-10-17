//  Implementación tablas hash
class TablaHash {
    constructor(size= 50) {
        this.tabla = new Array(size);

    };
    _hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash += key.charCodeAt(i);
        }
        return hash % this.tabla.length;
    };

    set(key, value) {
        const index = this._hash(key);
        if (!this.tabla[index]) {
            this.tabla[index] = [];
        };
        this.tabla[index].push([key, value]);
    }
    get(key) {
        const index = this._hash(key);
        if(this.tabla[index]) {
            for (let pair of this.tabla[index]) {
                if (pair[0] === key) {
                    return pair[1];
                };
            };
        };

        return undefined;
    };

    eliminar(key) {
        const index = this._hash(key);
        if(this.tabla[index]) {
            this.tabla[index] = this.tabla[index].filter(pair  => pair[0] != key );

        };
    };
//    // Función para mostrar todas las tareas en la tabla hash 
//    mostrar() { for (let i = 0; i < this.tabla.length; i++) { if (this.tabla[i]) { this.tabla[i].forEach(pair => { console.log(`Título: ${pair[0]}, Descripción: ${pair[1].descripcion}, Importancia: ${pair[1].importancia}`); });
// }
//    }
// }
};

// Creación instancia tablas hash

// const tablaHashTareas = new TablaHash();
// // insertar tablas
// tablaHashTareas.set('Tarea 1', { descripcion: 'Descripción 1', importancia: 2});
// tablaHashTareas.set('Tarea 2', { descripcion: 'Descripción 2', importancia: 1});
// tablaHashTareas.set('Tarea 3', { descripcion: 'Descripción 3', importancia: 3});

// // buscar y mostrar tareas

// console.log("------Buscar--Tarea--2-------");

// const tarea2 = tablaHashTareas.get('Tarea 2');
// console.log(tarea2);

// // eliminar tarea 

// console.log("------Eliminar--Tarea--1------");
// tablaHashTareas.eliminar('Tarea 1');
// const tarea1 = tablaHashTareas.get('Tarea 1');
// console.log(tarea1);

// // tablaHashTareas.mostrar();


