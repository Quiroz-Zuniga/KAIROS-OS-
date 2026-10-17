//  import --> clases
// ----------------------------------------------------------------------------
import {Level, Puntitos, PtosGordos} from './classes/laberinto.js';
import {Fruta} from './classes/fruta.js';
import {PacMan} from './classes/pacman.js';
import {Fantasma} from './classes/fantasmas.js';

//  import --> constantes/variables
// ----------------------------------------------------------------------------
import {
    constante, 
    resolucion, 
    array_laberinto,
    objeto, 
    canvas, 
    ctx, 
    marcadores,
    estado, 
    estadoFantasmas, 
    colores,
    sonidos
} from './constants.js';

//  import --> funciones varias
// ----------------------------------------------------------------------------
import {
    dibujarFantasmas, 
    dibujaTodosPuntitos, 
    checkComerFruta, 
    checkColision,
    comprobarNivelSuperado, 
    elNivelSuperado,
    nuevaPartida, 
    elGameOver, 
    mostrarMarcadores,
    reescalaCanvas, 
    borraCanvas, 
    laPresentacion,
    nuevaPartidaLocationReload,
    playSonidos,
    playSonidosLoop
} from './functions.js';

//  import --> funciones dibujado en Canvas
// ----------------------------------------------------------------------------
import {
    canvasPacMan, 
    canvasPacManUp, 
    canvasPacManDo,
    canvasPacManLe, 
    canvasPacManRi, 
    canvasFantasma,
    canvasOjosFantasma, 
    canvasFruta
} from './canvasDraw/dibujaCanvas.js';


//  Control mediante Teclado
// ----------------------------------------------------------------------------
document.addEventListener('keydown', function(tecla) {
    const volumen_sirenaFondo = 0.1;
    
    switch(tecla.keyCode){
        case 38:
            objeto.pacman.arriba();
        break;
        
        case 40:
            objeto.pacman.abajo();
        break;
        
        case 39:
            objeto.pacman.derecha();
        break;
        
        case 37:
            objeto.pacman.izquierda();
        break;

        case 89:
            reescalaCanvas();
        break;

        case 13:
            if (estado.actual == -1) {
                estado.actual = 0;
                marcadores.botonNewGame.style.display = 'none';
                playSonidos(sonidos.preparado);
                objeto.pacman.valoresIniciales();

                setTimeout(() => {
                    if (estado.actual == 0) estado.actual = 1;
                    playSonidosLoop(sonidos.sirena_fondo, true, 0.1);
                }, constante.pausa_preparado);

            } else if (estado.gameover) {
                marcadores.botonNewGame.style.display = 'none';
                playSonidos(sonidos.preparado);
                nuevaPartida();

                setTimeout(() => {
                    estado.actual = 1;
                    playSonidosLoop(sonidos.sirena_fondo, true, 0.1);
                }, constante.pausa_preparado);
            }
        break;
    }
});


//  Control mediante botones
// ----------------------------------------------------------------------------
document.addEventListener('click', function(event) {
    const volumen_sirenaFondo = 0.1;

    if (event.target.id === 'boton__newGame') {
        if (estado.actual === -1) {
            estado.actual = 0;
            marcadores.botonNewGame.style.display = 'none';
            playSonidos(sonidos.preparado);
            objeto.pacman.valoresIniciales();

            setTimeout(() => {
                if (estado.actual == 0) estado.actual = 1;
                playSonidosLoop(sonidos.sirena_fondo, true, 0.1);
            }, constante.pausa_preparado);

        } else if (estado.gameover) {
            marcadores.botonNewGame.style.display = 'none';
            playSonidos(sonidos.preparado);
            nuevaPartida();

            setTimeout(() => {
                estado.actual = 1;
                playSonidosLoop(sonidos.sirena_fondo, true, 0.1);
            }, constante.pausa_preparado);
        }
    }

    if (event.target.id === 'boton__le' || event.target.parentElement.id === 'boton__le') {
        objeto.pacman.izquierda();

    } else if (event.target.id === 'boton__ri' || event.target.parentElement.id === 'boton__ri') {
        objeto.pacman.derecha();

    } else if (event.target.id === 'boton__up' || event.target.parentElement.id === 'boton__up') {
        objeto.pacman.arriba();

    } else if (event.target.id === 'boton__do' || event.target.parentElement.id === 'boton__do') {
        objeto.pacman.abajo();
    } 
});

// ================================================================================
window.onload = () => {
    canvas.width = resolucion[0];
    canvas.height = resolucion[1] - constante.bsy;


    // INSTANCIAR (Laberinto) ----------------------------------------
    objeto.laberinto = new Level(array_laberinto);

    // INSTANCIAR TODOS los Puntitos ---------------------------------
    let contador = 0;
    let contador_gordos = 0;

    for (let y = 0; y < array_laberinto.length; y ++) {
        for (let x = 0; x < array_laberinto[0].length; x ++) {
            
            if (array_laberinto[y][x] == 1) {
                objeto.puntito[contador] = new Puntitos(x, y);
                objeto.array_puntitos.push(objeto.puntito);
                contador ++;
             
            }

            if (array_laberinto[y][x] == 5) {
                objeto.ptoGordo[contador_gordos] = new PtosGordos(x, y);
                objeto.array_ptosGordos.push(objeto.ptoGordo);
                contador_gordos ++;
            }        
        }
    }

    // INSTANCIAR FRUTA ----------------------------------------------
    objeto.fruta = new Fruta();

    // INSTANCIAR PAC-MAN --------------------------------------------
    objeto.pacman = new PacMan(objeto.animaPacMan);

    // INSTANCIAR (FANTASMAS) ----------------------------------------
    objeto.fantasma[0] = new Fantasma(3 * constante.bsx, 8 * constante.bsy, 0, 0);
    objeto.fantasma[1] = new Fantasma(5 * constante.bsx, 8 * constante.bsy, 1, 0);
    objeto.fantasma[2] = new Fantasma(9 * constante.bsx, 8 * constante.bsy, 2, 1);
    objeto.fantasma[3] = new Fantasma(11 * constante.bsx, 8 * constante.bsy, 3, 1);

    // --- Ejecutamos BUCLE PRINCIPAL (Intervalo cada 1000/FPS) ------
    setInterval(function() {
        bucle_principal();
    }, 1000 / constante.fps);

    setInterval(function() {
        if (objeto.animaPacMan) {
            objeto.animaPacMan = false;
        } else {
            objeto.animaPacMan = true;
        }

        objeto.pacman.diesAnima ++;
        if (objeto.pacman.diesAnima > 3) objeto.pacman.diesAnima = 0;
        
    }, 150);

    setInterval(function () {
        if (estado.actual != 0) {
            estado.nivel_superado = comprobarNivelSuperado();
        }
    }, 200);
}

// ========================================================================
function bucle_principal() {
    borraCanvas();

    if (estado.actual == -1) {
        laPresentacion(objeto.animaPacMan);
    }

    if (estado.actual != -1) {
        objeto.laberinto.dibuja();
        dibujaTodosPuntitos();
        objeto.fruta.dibuja();
        objeto.pacman.dibuja(objeto.animaPacMan);
        dibujarFantasmas();

        checkComerFruta();
        elNivelSuperado();
        elGameOver();
        mostrarMarcadores();
    }
}

