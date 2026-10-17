import {
    constante, 
    ctx, 
    estado,
    estadoFantasmas, 
    objeto, 
    colores
} from '../constants.js';

//  Funciones de dibujado en Canvas
// ------------------------------------------------------------------------
function canvasPacMan(x, y, r, pacColor) {
    let corr = 2;

    const gradi = ctx.createRadialGradient(x + r, y + r, 10, x + r, y + r, r);
    gradi.addColorStop(0, '#FA1');
    gradi.addColorStop(1, '#FE1');

    ctx.beginPath();
    ctx.arc(x + r + corr, y + r + corr, r, 0, Math.PI * 2);
    ctx.fillStyle = gradi;
    ctx.fill();
    ctx.closePath();
}

function canvasPacManRi(x, y, r, pacColor, animaPacMan) {
    let corr = 2;

    if (!animaPacMan) {
        for (let i = 0; i < 10; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i * 2, y + r + corr + i, parseInt(constante.bsx / 2) - i * 2, 1);
            ctx.fillRect(x + r + corr + i * 2, y + r + corr - i, parseInt(constante.bsx / 2) - i * 2, 1);
        }

    } else {

        for (let i = 0; i < 18; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i, y + r + corr + i, parseInt(constante.bsx / 2) - i, 1);
            ctx.fillRect(x + r + corr + i, y + r + corr - i, parseInt(constante.bsx / 2) - i, 1);
        }
    }
}

function canvasPacManLe(x, y, r, pacColor, animaPacMan) {
    let corr = 2;

    if (!animaPacMan) {
        for (let i = 0; i < 10; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr - i * 2, y + r + corr + i, -(parseInt(constante.bsx / 2) - i * 2), 1);
            ctx.fillRect(x + r + corr - i * 2, y + r + corr - i, -(parseInt(constante.bsx / 2) - i * 2), 1);
        }

    } else {

        for (let i = 0; i < 18; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr - i, y + r + corr + i, -(parseInt(constante.bsx / 2) - i), 1);
            ctx.fillRect(x + r + corr - i, y + r + corr - i, -(parseInt(constante.bsx / 2) - i), 1);
        }
    }
}

function canvasPacManDo(x, y, r, pacColor, animaPacMan) {
    let corr = 2;

    if (!animaPacMan) {
        for (let i = 0; i < 10; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i, y + r + corr + i * 2, 1, parseInt(constante.bsx / 2) - i * 2);
            ctx.fillRect(x + r + corr - i, y + r + corr + i * 2, 1, parseInt(constante.bsx / 2) - i * 2);
        }

    } else {

        for (let i = 0; i < 18; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i, y + r + corr + i, 1, parseInt(constante.bsx / 2) - i);
            ctx.fillRect(x + r + corr - i, y + r + corr + i, 1, parseInt(constante.bsx / 2) - i);
        }
    }
    
}

function canvasPacManUp(x, y, r, pacColor, animaPacMan) {
    let corr = 2;

    if (!animaPacMan) {
        for (let i = 0; i < 10; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i, y + r + corr - i * 2, 1, -(parseInt(constante.bsx / 2) - i * 2));
            ctx.fillRect(x + r + corr - i, y + r + corr - i * 2, 1, -(parseInt(constante.bsx / 2) - i * 2));
        }

    } else {

        for (let i = 0; i < 18; i ++) {
            ctx.fillStyle = colores.sueloColor;
            ctx.fillRect(x + r + corr + i, y + r + corr - i, 1, -(parseInt(constante.bsx / 2) - i));
            ctx.fillRect(x + r + corr - i, y + r + corr - i, 1, -(parseInt(constante.bsx / 2) - i));
        }
    }
}

// =========================================================================
function canvasFantasma(x, y, r, fantasmaColor, comido) {
    let corr = 2;
    let v = 15;

    fantasmaColor = fantasmaColor[0];

    if (estadoFantasmas.azules && !estadoFantasmas.intermitentes) {
        fantasmaColor = 'royalblue';
    } else if (estadoFantasmas.azules && !objeto.animaPacMan && estadoFantasmas.intermitentes) {
        fantasmaColor = 'lightblue';
    } else if (estadoFantasmas.azules && objeto.animaPacMan && estadoFantasmas.intermitentes) {
        fantasmaColor = 'royalblue';
    }

    if (estado.actual == -1 && objeto.pacman.velX > 0) fantasmaColor = 'royalblue';

    if (!comido) {
        ctx.beginPath();
        ctx.arc(x + r + corr, y + r + corr, r, Math.PI, 0);
        ctx.fillStyle = fantasmaColor;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = fantasmaColor;
        ctx.fillRect(x + corr, y + r + corr, r * 2, parseInt(r));
    } 

    ctx.beginPath();
    ctx.arc(x + r + corr - 8, y + v, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x + r + corr + 8, y + v, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function canvasOjosFantasma(x, y, r, iz, de, vert) {
    let corr = 2;
    let v = 15 - 1;


    ctx.beginPath();
    ctx.arc(x + r + corr - iz, y + v + vert, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x + r + corr + de, y + v + vert, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

}

// ========================================================================
function canvasFruta(x, y, r) {
    let corr = 2;
    let radCerezas = 11;

    const gradi = ctx.createRadialGradient(x + r + corr - 6, y + r + corr + 4, 3, x + r + corr - 6, 
        y + r + corr + 4, r);
    gradi.addColorStop(0, colores.rojo);
    gradi.addColorStop(1, '#F52');

    ctx.beginPath();
    ctx.moveTo(x + r + corr - 6, y + r + corr + 4);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x + r + corr + 3, y + r);
    ctx.strokeStyle = 'seagreen';
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x + r + corr + 3, y + r + corr + 4, radCerezas, 0, Math.PI * 2);
    ctx.fillStyle = colores.rojo;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x + r + corr - 6, y + r + corr + 4, radCerezas, 0, Math.PI * 2);
    ctx.fillStyle = gradi;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x + r + corr - 6, y + r + corr + 4, radCerezas + 1, Math.PI * 1.5, Math.PI / 2);
    ctx.strokeStyle = colores.sueloColor;
    ctx.stroke();
    ctx.closePath();
}

export {
    canvasPacMan, canvasPacManUp, canvasPacManDo,
    canvasPacManLe, canvasPacManRi, canvasFantasma,
    canvasOjosFantasma, canvasFruta
};

