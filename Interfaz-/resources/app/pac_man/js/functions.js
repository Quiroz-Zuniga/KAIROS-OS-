import {
    estado, 
    canvas, 
    ctx, 
    colores, 
    resolucion, 
    estadoFantasmas,
    marcadores, 
    objeto, 
    constante,
    sonidos
} from './constants.js';

//  Funciones varias
function dibujarFantasmas() {
    for (let i = 0; i < constante.nro_fantasmas; i ++) {
        let corr = 9;

        if (checkColision(objeto.fantasma[i], objeto.pacman, corr) && estado.actual == 1) {

            if (!estadoFantasmas.azules) {
                estado.actual = 2;  // Secuencia PacMan Dies...
                estadoFantasmas.azules = false;
                estadoFantasmas.ptosComeFantasmas = 100;
                playSonidos(sonidos.pacman_dies);
                sonidos.pacman_dies.volume = 0.6;
                marcadores.vidas --;
                marcadores.scoreVidas.innerHTML = `Vidas: ${marcadores.vidas}`;

                if (marcadores.vidas >= 0) {
                    setTimeout(() => {
                        estado.actual = 1;
                        objeto.pacman.revivirPacMan();

                        objeto.fantasma[0].revivirFantasmas(3, 8, 0, 0);
                        objeto.fantasma[1].revivirFantasmas(5, 8, 1, 0);
                        objeto.fantasma[2].revivirFantasmas(9, 8, 2, 1);
                        objeto.fantasma[3].revivirFantasmas(11, 8, 3, 1);
                    }, 3000);

                } else {
                    estado.actual = 4;  // Game Over
                    estado.gameover = true;
                    marcadores.vidas = 0;
                    marcadores.scoreVidas.innerHTML = `Vidas: ${marcadores.vidas}`;
                    marcadores.botonNewGame.style.display = 'flex';
                    sonidos.sirena_fondo.loop = false;
                    playSonidos(sonidos.game_over);
                }

            } else {
                //console.log('azules');
                if (!objeto.fantasma[i].comido) {
                    playSonidos(sonidos.eating_ghost);
                    objeto.fantasma[i].comido = true;
                    objeto.fantasma[i].showPtos = true;
                    objeto.fantasma[i].showX = objeto.fantasma[i].x 
                    objeto.fantasma[i].showY = objeto.fantasma[i].y

                    estadoFantasmas.ptosComeFantasmas *= 2;
                    marcadores.puntos += estadoFantasmas.ptosComeFantasmas;
                    objeto.fantasma[i].showx2 = estadoFantasmas.ptosComeFantasmas;

                    setTimeout(() => {
                        objeto.fantasma[i].showPtos = false;
                    }, 2000);

                }
            }
        }

        objeto.fantasma[i].dibuja();
    }
}

// --------------------------------------------------------------------------
function dibujaTodosPuntitos() {
    for (let i = 0; i < objeto.array_puntitos.length; i ++) {
        let corr = 0;

        if (objeto.puntito[i].visible && estado.actual != 3) {
            if (checkColision(objeto.puntito[i], objeto.pacman, corr)) {
                objeto.puntito[i].visible = false;
                objeto.contPuntitosComidos ++;
                marcadores.puntos += objeto.puntito[i].sumaPtos
                marcadores.scorePtos.innerHTML = `Puntos: ${marcadores.puntos}`;
                playSonidos(sonidos.wakawaka);
            }

            objeto.puntito[i].dibuja();
        }

        if (i < 4) {
            if (objeto.ptoGordo[i].visible && estado.actual != 3) {

                if (checkColision(objeto.ptoGordo[i], objeto.pacman, corr)) {
                    objeto.ptoGordo[i].visible = false;
                    objeto.contPuntitosComidos ++;
                    marcadores.puntos += objeto.ptoGordo[i].sumaPtos
                    estadoFantasmas.azules = true;
                    playSonidos(sonidos.eating_ghost);
                    playSonidos(sonidos.azules);
                    sonidos.azules.loop = true;

                    setTimeout(() => {
                        estadoFantasmas.azules = false;
                        estadoFantasmas.intermitentes = false;
                        estadoFantasmas.ptosComeFantasmas = 100;
                        sonidos.azules.loop = false;

                        objeto.fantasma.forEach(fant => {
                            fant.comido = false;
                        });

                    }, estadoFantasmas.duracionAzules);

                    setTimeout(() => {
                        estadoFantasmas.intermitentes = true;
                    }, Math.floor(estadoFantasmas.duracionAzules / 1.6));
                }

                objeto.ptoGordo[i].dibuja();
            }
        }
    }
}

// --------------------------------------------------------------------------
function checkComerFruta() {
    let corr = 5;

    if (checkColision(objeto.fruta, objeto.pacman, corr) && estado.actual == 1 && !objeto.fruta.comido) {
        objeto.fruta.comido = true;
        objeto.fruta.showPtos = true;
        objeto.fruta.showX = objeto.fruta.x 
        objeto.fruta.showY = objeto.fruta.y
        playSonidos(sonidos.eating_cherry);

        marcadores.puntos += estadoFantasmas.ptosComeFruta;

        setTimeout(() => {
            objeto.fruta.showPtos = false;

            setTimeout(() => {
                objeto.fruta.comido = false
                objeto.fruta.x = 9 * constante.bsx;
                objeto.fruta.y = 11 * constante.bsy;
            }, 9000);

        }, 3000);
    }
}

// --------------------------------------------------------------------------
function checkColision(obj1, obj2, corr) {
    return obj1.x + corr < obj2.x + obj2.ancho - corr && 
            obj1.x + obj1.ancho - corr > obj2.x + corr &&
            obj1.y + corr < obj2.y + obj2.alto - corr && 
            obj1.y + obj1.alto - corr > obj2.y + corr;
}

// --------------------------------------------------------------------------
function comprobarNivelSuperado() {
    let puntitosMasGordos = objeto.array_puntitos.length + objeto.array_ptosGordos.length;

    if (objeto.contPuntitosComidos >= puntitosMasGordos) {
        return true;
    } else {
        return false;
    }
}

// --------------------------------------------------------------------------
function elNivelSuperado() {
    if (!estado.nivel_superado) return;

    marcadores.nivel ++;
    marcadores.scoreNivel.innerHTML = `Nivel: ${marcadores.nivel}`;
    estadoFantasmas.ptosComeFruta *= 2;
    objeto.fruta.comido = false;
    estadoFantasmas.duracionAzules -= marcadores.nivel * 1000;
    estado.nivel_superado = false;
    objeto.contPuntitosComidos = 0;
    estado.actual = 3;

    if (estadoFantasmas.duracionAzules < 2000) estadoFantasmas.duracionAzules = 2000;

    objeto.puntito.forEach(punto => {
        punto.visible = true;
    });

    objeto.ptoGordo.forEach(gordo => {
        gordo.visible = true;
    });

    setTimeout(() => {
        estado.actual = 1;
        objeto.pacman.revivirPacMan();

        objeto.fantasma[0].revivirFantasmas(3, 8, 0, 0);
        objeto.fantasma[1].revivirFantasmas(5, 8, 1, 0);
        objeto.fantasma[2].revivirFantasmas(9, 8, 2, 1);
        objeto.fantasma[3].revivirFantasmas(11, 8, 3, 1);
    }, 5000);
}

// -------------------------------------------------------------------------
function nuevaPartidaLocationReload() {
    if (estado.gameover || estado.actual == 0) location.reload();
}

function nuevaPartida() {
    estado.actual = 0;
    estado.gameover = false;

    marcadores.puntos = 0;
    marcadores.scorePtos.innerHTML = `Puntos: ${marcadores.puntos}`;
    marcadores.nivel = 1;
    marcadores.scoreNivel.innerHTML = `Nivel: ${marcadores.nivel}`;
    marcadores.vidas = 3;
    marcadores.scoreVidas.innerHTML = `Vidas: ${marcadores.vidas}`;

    estadoFantasmas.ptosComeFruta = 200;
    objeto.fruta.comido = false;
    estadoFantasmas.duracionAzules = 8000;
    estado.nivel_superado = false;
    objeto.contPuntitosComidos = 0;

    objeto.puntito.forEach(punto => {
        punto.visible = true;
    });

    objeto.ptoGordo.forEach(gordo => {
        gordo.visible = true;
    });

    objeto.pacman.revivirPacMan();

    objeto.fantasma[0].revivirFantasmas(3, 8, 0, 0);
    objeto.fantasma[1].revivirFantasmas(5, 8, 1, 0);
    objeto.fantasma[2].revivirFantasmas(9, 8, 2, 1);
    objeto.fantasma[3].revivirFantasmas(11, 8, 3, 1);
}

// -------------------------------------------------------------------------
function elGameOver() {
    if (!estado.gameover) return;

    const gradi = ctx.createLinearGradient(parseInt(resolucion[0] / 5) + 5, 
        parseInt(resolucion[1] / 4), parseInt(resolucion[0] / 5) + 5, parseInt(resolucion[1] / 1.5));
    gradi.addColorStop(0, 'orangered');
    gradi.addColorStop(1, 'yellow');

    ctx.font = '100px seriff';
    ctx.fillStyle = gradi;
    ctx.fillText('Game Over', parseInt(resolucion[0] / 5) + 5, 
        parseInt(resolucion[1] / 2));
}

// ------------------------------------------------------------------------
function mostrarMarcadores() {
    if (estado.actual == 0) {

        const gradi = ctx.createLinearGradient(parseInt(resolucion[0] / 5) + 5, 
            parseInt(resolucion[1] / 4), parseInt(resolucion[0] / 5) + 5, parseInt(resolucion[1] / 1.5));
        gradi.addColorStop(0, 'orangered');
        gradi.addColorStop(1, 'yellow');

        ctx.font = '100px seriff';
        ctx.fillStyle = gradi;
        ctx.fillText('Preparado!', parseInt(resolucion[0] / 5) + 5, 
            parseInt(resolucion[1] / 2));
    }

    if (estado.actual == 3) {
        ctx.font = '100px seriff';
        ctx.fillStyle = 'yellow';
        ctx.fillText('Nivel Superado!', parseInt(resolucion[0] / 9) + 5, 
            parseInt(resolucion[1] / 2));
    }

    objeto.fantasma.forEach(fant => {
        if (fant.showPtos) {
            ctx.font = '30px seriff';
            ctx.fillStyle = 'orangered';
            ctx.fillText(fant.showx2, fant.showX, fant.showY);
        }
    });

    if (objeto.fruta.showPtos) {
        ctx.font = '32px seriff';
        ctx.fillStyle = 'orangered';
        ctx.fillText(estadoFantasmas.ptosComeFruta, objeto.fruta.showX, objeto.fruta.showY);
    }
}

function playSonidos(sonido) {
    sonido.play();
}

function playSonidosLoop(sonido, loop, volumen) {
    sonido.play();
    sonido.loop = loop;
    sonido.volume = volumen;
}

// ------------------------------------------------------------------------
function reescalaCanvas() {
    return;
}

// ------------------------------------------------------------------------
function borraCanvas() {
    ctx.fillStyle = colores.sueloColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Presentacion / Menu Principal
//------------------------------------------------------------------------
function laPresentacion(animaPacMan) {
    ctx.font = '120px seriff';
    ctx.fillStyle = 'orangered';
    ctx.fillText('PAC MAN', parseInt(resolucion[0] / 5) + 5, 
        parseInt(resolucion[1] / 2));

    ctx.font = '30px seriff';
    ctx.fillStyle = 'white';
    ctx.fillText('Pulse INTRO o Nueva Partida para comenzar...', parseInt(resolucion[0] / 9) + 5, 
        resolucion[1] - constante.bsy * 2);

    objeto.pacman.secuenciaPresentacion(animaPacMan);
    objeto.fantasma[1].secuenciaPresentacion();
}

export {
	dibujarFantasmas, dibujaTodosPuntitos, 
	checkComerFruta, checkColision,
	comprobarNivelSuperado, elNivelSuperado,
	nuevaPartida, elGameOver, mostrarMarcadores,
	reescalaCanvas, borraCanvas, laPresentacion,
    nuevaPartidaLocationReload, playSonidos,
    playSonidosLoop
};

