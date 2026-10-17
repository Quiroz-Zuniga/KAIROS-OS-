import {
    constante, 
    objeto, 
    colores,
    marcadores, 
    estado,
    ctx
} from '../constants.js';

import {
    canvasFantasma, 
    canvasOjosFantasma
} from '../canvasDraw/dibujaCanvas.js';

//  clase Fantasma
// ----------------------------------------------------------------------------
export class Fantasma {
    constructor(x, y, tipoFantasma, direccion) {
        this.tipoF = tipoFantasma;
        this.direccion = direccion;

        this.ancho = constante.bsx;
        this.alto = constante.bsy;
        this.radio = Math.floor(constante.bsy / 2.2);

        this.listaColores = [
            ['pink', '#E7C'],
            [colores.rojo, '#F42'], 
            ['orange', '#FC0'], 
            ['seagreen', '#1B4']
        ];

        this.color = this.listaColores[this.tipoF];

        this.comido = false;
        this.showPtos = false;
        this.showX = 0;
        this.showY = 0;
        this.showx2 = 0;

        // Orden array: Left, right, up, down
        this.hacia_donde = [
            '231',
            '230',
            '013',
            '012'
        ];

        this.hacia_donde_velXY = [
            [-1, 0, 0, 0, 7, 12],
            [1, 0, 1, 0, 1, 6],
            [0, -1, 0, 0, 13, 18],
            [0, 1, 0, 1, 7, 12]
        ];

        this.ptosClave = [
            [4, 1], [14, 1],
            [4, 4], [6, 4], [12, 4], [14, 4],
            [4, 8], [6, 8], [12, 8], [14, 8],
            [1, 11], [4, 11], [6, 11], [12, 11], [14, 11], [17, 11],
            [4, 13], [6, 13], [12, 13], [14, 13]
        ];

        this.x = x;
        this.y = y;

        this.velX = this.hacia_donde_velXY[this.direccion][0];
        this.velY = this.hacia_donde_velXY[this.direccion][1];
        this.sumarAncho = this.hacia_donde_velXY[this.direccion][2];
        this.sumarAlto = this.hacia_donde_velXY[this.direccion][3];
    }

    actualiza() {
        let x = 0;
        let y = 0;

        for (let i = 0; i < this.ptosClave.length; i ++) {
            let pClaveX = this.ptosClave[i][0] * constante.bsx;
            let pClaveY = this.ptosClave[i][1] * constante.bsy;

            if (this.x == pClaveX && this.y == pClaveY) {
                let perseguir = Math.floor(Math.random()*10);

                if (perseguir < 7 + marcadores.nivel) {
                    this.fantasma_persigue();
                    this.nuevos_valores();
                }
            }
        }

        x = parseInt((this.x + this.velX + this.ancho * this.sumarAncho) / constante.bsx);
        y = parseInt((this.y + this.velY + this.alto * this.sumarAlto) / constante.bsy);

        if (!(objeto.laberinto.colision(x, y))) {
            this.x += this.velX * 2;
            this.y += this.velY * 2;

            if (this.x > constante.nro_columnas * constante.bsx && this.velX > 0) this.x = -constante.bsx;
            if (this.x < -constante.bsx && this.velX < 0) this.x = constante.nro_columnas * constante.bsx;

        } else {

            let perseguir = Math.floor(Math.random()*10);

            if (perseguir < 5 + marcadores.nivel) {
                this.fantasma_persigue();
            } else {
                this.elegir_otra_direccion();
            }

            this.nuevos_valores();
        }
    }

    dibuja() {

        let iz = 0;
        let de = 0;
        let vert = 0;

        if (estado.actual == 1) this.actualiza();

        canvasFantasma(this.x, this.y, this.radio, this.color, this.comido);

        if (this.velX == 1) {
            iz = 5;
            de = 11;
            vert = 0;
        } else if (this.velX == -1) {
            iz = 11;
            de = 4;
            vert = 0;
        } else if (this.velY == -1) {
            iz = 8;
            de = 8;
            vert = -2;
        } else if (this.velY == 1) {
            iz = 8;
            de = 8;
            vert = 4;
        }

        canvasOjosFantasma(this.x, this.y, this.radio, iz, de, vert);

    }

    elegir_otra_direccion() {
        let direcc = this.hacia_donde[this.direccion];
        let num_rnd = Math.floor(Math.random()*3);
        let nuevaDireccion = direcc.charAt(num_rnd);

        this.direccion = parseInt(nuevaDireccion);
    }

    nuevos_valores() {
        this.velX = this.hacia_donde_velXY[this.direccion][0];
        this.velY = this.hacia_donde_velXY[this.direccion][1];
        this.sumarAncho = this.hacia_donde_velXY[this.direccion][2];
        this.sumarAlto = this.hacia_donde_velXY[this.direccion][3];
    }

    fantasma_persigue() {
        let hor_ver = Math.floor(Math.random()*10);

        if (hor_ver < 5) {
            if (this.y < objeto.pacman.y) {
                this.direccion = 3;
            } else {
                this.direccion = 2;
            }

        } else {
            if (this.x < objeto.pacman.x) {
                this.direccion = 1;
            } else {
                this.direccion = 0;
            }
        }
    }

    revivirFantasmas(x, y, tipoFantasma, direccion) {
        this.tipoF = tipoFantasma;
        this.direccion = direccion;

        this.x = x * constante.bsx;
        this.y = y * constante.bsy;

        this.velX = this.hacia_donde_velXY[this.direccion][0];
        this.velY = this.hacia_donde_velXY[this.direccion][1];
        this.sumarAncho = this.hacia_donde_velXY[this.direccion][2];
        this.sumarAlto = this.hacia_donde_velXY[this.direccion][3];
    }

    secuenciaPresentacion() {
        let iz = 0;
        let de = 0;
        let vert = 0;

        canvasFantasma(objeto.pacman.x + 50, objeto.pacman.y, this.radio, this.color, this.comido);

        if (objeto.pacman.velX == 1) {
            iz = 5;
            de = 11;
            
        } else if (objeto.pacman.velX == -1) {
            iz = 11;
            de = 4;
        }

        canvasOjosFantasma(objeto.pacman.x + 50, objeto.pacman.y, this.radio, iz, de, vert);
    }
}
