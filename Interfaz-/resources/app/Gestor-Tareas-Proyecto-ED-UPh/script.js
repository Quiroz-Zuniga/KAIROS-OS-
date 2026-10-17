const escapeTask = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.addEventListener('DOMContentLoaded', (event) => {
    // Crear instancias de las estructuras de datos
    const listaTareas = new listaEnlazada();
    const arbolTareas = new ArbolBinario();
    const tablaHashTareas = new TablaHash();

// Cargar tareas desde localStorage
    CargarTareas();

    // Agregar tareas mediante el formulario
    document.getElementById('task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const titulo = document.getElementById('task-title').value;
        const descripcion = document.getElementById('task-desc').value;
        const importancia = parseInt(document.getElementById('task-importance').value, 10);
        const fecha = document.getElementById('task-date').value;

        // Agregar tarea a las estructuras de datos
        listaTareas.agregar(titulo, descripcion, importancia, fecha);
        arbolTareas.insertar({ titulo, descripcion, importancia, fecha });
        tablaHashTareas.set(titulo, { descripcion, importancia, fecha });

//  Guardar tareas en localStorage
        GuardarTareas();

        // Actualizar la visualización de las tareas
        displayTasks();
    });

    function convertirImportancia(importancia) {
        switch (importancia) {
            case 1:
                return "Alta";
            case 2:
                return "Media";
            case 3:
                return "Baja";
            default:
                return "Desconocida";
        }
    }
    

    // Función para mostrar todas las tareas en la UI
    function displayTasks() {
        const taskContainer = document.getElementById('task-list');
        taskContainer.innerHTML = '';

        // recopilar tareas en la lista 
        let tareas = [];
        let actual = listaTareas.cabeza;
        while (actual !== null) {
            tareas.push(actual);
            actual = actual.siguiente;
        }

        // ajustamos para mostrar el nivel de importancia
        tareas.sort((a, b) => a.importancia - b.importancia);

    // mostrar tareas por nivel de importacia

        tareas.forEach(actual => {
            const importaciaTexto = convertirImportancia(actual.importancia);
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <p><strong>Título:</strong> ${escapeTask(actual.titulo)}</p>
                <p><strong>Descripción:</strong> ${escapeTask(actual.descripcion)}</p>
                <p><strong>Importancia:</strong> ${importaciaTexto}</p>
                <p><strong>Fecha:</strong> ${escapeTask(actual.fecha)}</p>
                <button class="delete-task" data-title="${escapeTask(actual.titulo)}">Eliminar</button>
            `;
            taskContainer.appendChild(taskItem);
            // Añadir evento de eliminación
            taskItem.querySelector('.delete-task').addEventListener('click', function() {
                eliminarTarea(actual.titulo);
            });


        });
        
    }

    // Función para eliminar una tarea
    function eliminarTarea(titulo) {
        listaTareas.eliminar(titulo);
        arbolTareas.eliminar(titulo);  // Implementa una función de eliminación en el árbol binario
        tablaHashTareas.eliminar(titulo);
        displayTasks();
        GuardarTareas();
    }
// Función para guardar tareas en localStorage

    function GuardarTareas() {
        const tareas = [];
        let actual = listaTareas.cabeza;
        while (actual !== null){
           tareas.push({
            titulo: actual.titulo,
            descripcion: actual.descripcion,
            importancia: actual.importancia,
            fecha: actual.fecha
           });
           actual = actual.siguiente;
        };
        KAIROSPreferences.write('tareas', tareas);
    }

    // function para carafgar tareas desde localstorage
    function CargarTareas() {
        const tareas = KAIROSPreferences.read('tareas', [], value => Array.isArray(value) && value.every(t => t && typeof t.titulo === 'string' && typeof t.descripcion === 'string' && [1,2,3].includes(t.importancia) && typeof t.fecha === 'string'));
        if (tareas) {
            tareas.forEach(tarea => {
                listaTareas.agregar(tarea.titulo, tarea.descripcion, tarea.importancia, tarea.fecha);
                arbolTareas.insertar(tarea);
                tablaHashTareas.set(tarea.titulo, tarea);
            } );
            displayTasks();
        }
    }


    // Función para buscar una tarea
    function buscarTarea(titulo) {
        const tarea = tablaHashTareas.get(titulo);
        const taskContainer = document.getElementById('task-list');
        taskContainer.innerHTML = '';

        if (tarea) {
            const importanciaTexto = convertirImportancia(tarea.importancia);
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <p><strong>Título:</strong> ${escapeTask(titulo)}</p>
                <p><strong>Descripción:</strong> ${escapeTask(tarea.descripcion)}</p>
                <p><strong>Importancia:</strong> ${importanciaTexto}</p>
                <p><strong>Fecha:</strong> ${escapeTask(tarea.fecha)}</p>
                <button class="delete-task" data-title="${escapeTask(titulo)}">Eliminar</button>
            `;
            taskContainer.appendChild(taskItem);

            // Añadir evento de eliminación
            taskItem.querySelector('.delete-task').addEventListener('click', function() {
                eliminarTarea(titulo);
            });
        } else {
            taskContainer.innerHTML = '<p class:"no-tarea" >No se encontró la tarea.</p>';
        }
    }

    // Evento para el botón de búsqueda
    document.getElementById('search-button').addEventListener('click', function() {
        const titulo = document.getElementById('search-task').value;
        buscarTarea(titulo);
    });
});
