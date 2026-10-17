import {
    constante, 
    resolucion, 
    estado, 
    objeto
} from '../constants.js';

import {
    canvasPacMan, 
    canvasPacManDo, 
    canvasPacManUp,
    canvasPacManLe, 
    canvasPacManRi
} from '../canvasDraw/dibujaCanvas.js';

//  clase PacMan
// ----------------------------------------------------------------------------
export class PacMan {
    constructor(animaPacMan) {
        this.x = 9 * constante.bsx;
        this.y = 4 * constante.bsy;

        this.ancho = constante.bsx;
        this.alto = constante.bsy;
        this.radio = Math.floor(constante.bsy / 2.2);

        this.color = 'yellow';

        this.direccion = {
            ri : [1, 0, 1, 0, 1, 6],
            le : [-1, 0, 0, 0, 7, 12],
            up : [0, -1, 0, 0, 13, 18],
            do : [0, 1, 0, 1, 19, 24]
        }

        this.pulsada = 'ri';
        this.orientacion = this.pulsada;
        this.diesAnima = 0;

        this.velX = 1;
        this.velY = 0;
        this.sumarAncho = 1;
        this.sumarAlto = 0;
    }

    actualiza() {
        let x = 0;
        let y = 0;

        if (this.x % constante.bsx == 0 && this.y % constante.bsy == 0) {

            x = parseInt(this.x / constante.bsx) + this.direccion[this.pulsada][0];
            y = parseInt(this.y / constante.bsy) + this.direccion[this.pulsada][1];

            if (!(objeto.laberinto.colision(x, y))) {
                this.velX = this.direccion[this.pulsada][0];
                this.velY = this.direccion[this.pulsada][1];
                this.sumarAncho = this.direccion[this.pulsada][2];
                this.sumarAlto = this.direccion[this.pulsada][3];
                this.orientacion = this.pulsada;
            }
        }

        x = parseInt((this.x + this.velX + this.ancho * this.sumarAncho) / constante.bsx);
        y = parseInt((this.y + this.velY + this.alto * this.sumarAlto) / constante.bsy);

        if (!(objeto.laberinto.colision(x, y))) {
            this.x += this.velX * 2;
            this.y += this.velY * 2;

            if (this.x > constante.nro_columnas * constante.bsx && this.velX > 0) this.x = -constante.bsx;
            if (this.x < -constante.bsx && this.velX < 0) this.x = constante.nro_columnas * constante.bsx;
        }
    }

    dibuja(animaPacMan) {

        if (estado.actual == 2) {
            this.pacManDies(animaPacMan);
            return;
        }

        if (estado.actual == 1) this.actualiza();

        canvasPacMan(this.x, this.y, this.radio, this.color);

        if (this.velX == 1) {
            canvasPacManRi(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velX == -1) {
            canvasPacManLe(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velY == 1) {
            canvasPacManDo(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velY == -1) {
            canvasPacManUp(this.x, this.y, this.radio, this.color, animaPacMan);
        }

    }

    pacManDies(animaPacMan) {
        canvasPacMan(this.x, this.y, this.radio, this.color);

        if (this.diesAnima == 0) {
            canvasPacManRi(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.diesAnima == 2) {
            canvasPacManLe(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.diesAnima == 1) {
            canvasPacManDo(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.diesAnima == 3) {
            canvasPacManUp(this.x, this.y, this.radio, this.color, animaPacMan);
        }
    }

    revivirPacMan() {
        this.x = 9 * constante.bsx;
        this.y = 4 * constante.bsy;
        this.pulsada = 'ri';
        this.velX = 1;
        this.velY = 0;
        this.sumarAncho = 1;
        this.sumarAlto = 0;
    }

    secuenciaPresentacion(animaPacMan) {
        this.x = this.x + this.velX;

        if ((this.x > resolucion[0] && this.velX > 0) || (this.x < -99 && this.velX < 0)) 
            this.velX = -this.velX;

        canvasPacMan(this.x, this.y, this.radio, this.color);

        if (this.velX == 1) {
            canvasPacManRi(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velX == -1) {
            canvasPacManLe(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velY == 1) {
            canvasPacManDo(this.x, this.y, this.radio, this.color, animaPacMan);
        } else if (this.velY == -1) {
            canvasPacManUp(this.x, this.y, this.radio, this.color, animaPacMan);
        }

    }

    valoresIniciales() {
        this.x = 9 * constante.bsx;
        this.velX = 1;
    }

    // ---- Leer Teclado -----
    arriba() {this.pulsada = 'up';}

    abajo() {this.pulsada = 'do';}

    izquierda() {this.pulsada = 'le';}

    derecha() {this.pulsada = 'ri';}
}

