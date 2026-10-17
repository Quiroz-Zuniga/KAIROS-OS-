//  Constantes & Variables
const constante = {
    bsx: 40,
    bsy: 40,
    nro_filas: 15,
    nro_columnas: 19,
    nro_fantasmas: 4,
    fps: 60,
    pausa_preparado: 5000
}

const resolucion = [
    constante.bsx * constante.nro_columnas, 
    constante.bsy * constante.nro_filas
];

const array_laberinto = [
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
    [9,5,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,5,9],
    [9,1,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,1,9],

    [9,1,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,1,9],
    [9,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,9],
    [9,1,9,9,1,9,1,9,9,9,9,9,1,9,1,9,9,1,9],

    [9,1,1,1,1,9,1,1,1,9,1,1,1,9,1,1,1,1,9],
    [9,9,9,9,1,9,9,9,1,9,1,9,9,9,1,9,9,9,9],
    [9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9],

    [9,1,9,9,1,9,1,9,1,9,1,9,1,9,1,9,9,1,9],
    [9,1,9,9,1,9,1,9,1,9,1,9,1,9,1,9,9,1,9],
    [0,1,1,1,1,9,1,1,1,1,1,1,1,9,1,1,1,1,0],

    [9,1,9,9,1,9,1,9,9,9,9,9,1,9,1,9,9,1,9],
    [9,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,9],
    [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const objeto = {
    laberinto: null,
    pacman: null,
    fantasma: [],
    puntito: [],
    array_puntitos: [],
    ptoGordo: [],
    array_ptosGordos: [],
    fruta: null,
    animaPacman: false,
    contPuntitosComidos: 0
};

const marcadores = {
    puntos: 0,
    nivel: 1,
    vidas: 3,
    scorePtos: document.getElementById('puntos'),
    scoreNivel: document.getElementById('nivel'),
    scoreVidas: document.getElementById('vidas'),
    botonNewGame: document.getElementById('boton__newGame'),
    contenedorControles: document.getElementById('contenedor2__botonesControl')
}

const estado = {
    actual: -1,
    gameover: false,
    nivel_superado: false
}

const estadoFantasmas = {
    azules: false,
    intermitentes: false,
    duracionAzules: 8000,
    ptosComeFantasmas: 100,
    ptosComeFruta: 200
}

const colores = {
    paredColor: '#9D9D62',
    paredColorOscuro: '#808052',
    sueloColor: '#484848',
    rojo: '#D32111'
}

const sonidos = {
    preparado: new Audio('./audio/pacmaninicionivel.ogg'),
    game_over: new Audio('./audio/gameoveretro.ogg'),
    azules: new Audio('./audio/pacmanazules.ogg'),
    pacman_dies: new Audio('./audio/pacmandies.ogg'),
    eating_cherry: new Audio('./audio/pacmaneatingcherry.mp3'),
    eating_ghost: new Audio('./audio/pacmaneatinghost.ogg'),
    presentacion: new Audio('./audio/pacmanintermision.ogg'),
    sirena_fondo: new Audio('./audio/pacmansirena.ogg'),
    wakawaka: new Audio('./audio/pacmanwakawaka.mp3')
}

export {
    constante, resolucion, array_laberinto,
    objeto, canvas, ctx, marcadores,
    estado, estadoFantasmas, colores,
    sonidos
};

