const COLORS = ["nocolor", "yellow", "red"]
const SOUTH = "S";
const NORTH = "N";
const WEST = "W";
const EAST = "E";
const NE = "NE";
const NW = "NW";
const SE = "SE";
const SW = "SW";
DIR2DELTA = { 'N': [0, -1], 'S': [0, 1], 'E': [1, 0], 'W': [-1, 0], 'NW': [-1, -1], 'SW': [-1, 1], 'SE': [1, 1], 'NE': [1, -1] }
DIR2ROT = { 'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': 225, 'W': 270, 'SW': 315 }
const WAIT = 70;
const WIDTH = 7;
const HEIGHT = 6;
const SEARCH_DEPTH = 3;

let updating = false;
let player = 1;
let dir = SOUTH;
let values = [];
let controlsAvailable = true;
let gameOver = false;
let playComputer = false;

function delay(milliseconds) {
    return new Promise(resolve => { setTimeout(resolve, milliseconds); });
}

function onClickBoard(x, y) {
    return async function () {
        await buttonPressed(x, y);
    };
}

function inBounds(x, y) {
    return 0 <= x && x < WIDTH && 0 <= y && y < HEIGHT;
}

async function swapColors(x1, y1, x2, y2) {
    v1 = values[x1][y1]
    v2 = values[x2][y2]
    updateColor(x1, y1, COLORS[v2], v2);
    updateColor(x2, y2, COLORS[v1], v1);
    await delay(WAIT);
}

async function moveInDirection(x, y, dx, dy) {
    let newx = x + dx;
    let newy = y + dy;

    while (inBounds(newx, newy) && values[newx][newy] == 0) {
        await swapColors(x, y, newx, newy);
        x = newx;
        y = newy;
        newx = x + dx;
        newy = y + dy;
    }
}
function min(a, b) {
    return a < b ? a : b;
}

async function buttonPressed(x, y) {
    if (updating || gameOver) {
        return;
    }
    updating = true;
    let dx = 0, dy = 0, m = 0;
    switch (dir) {
        case SOUTH:
            y = 0;
            dy = 1;
            break;
        case NORTH:
            y = HEIGHT - 1;
            dy = -1;
            break;
        case EAST:
            x = 0;
            dx = 1;
            break;
        case WEST:
            x = WIDTH - 1;
            dx = -1;
            break;
        case SE:
            m = min(x, y);
            x -= m;
            y -= m;
            dx = 1;
            dy = 1;
            break;
        case NW:
            m = min(WIDTH - 1 - x, HEIGHT - 1 - y);
            x += m;
            y += m;
            dx = -1;
            dy = -1;
            break;
        case NE:
            m = min(x, HEIGHT - 1 - y);
            x -= m;
            y += m;
            dx = 1;
            dy = -1;
            break;
        case SW:
            m = min(WIDTH - 1 - x, y);
            x += m;
            y -= m;
            dx = -1;
            dy = 1;
            break;

    }
    if (values[x][y] == 0) {
        updateColor(x, y, COLORS[player], player);
        await moveInDirection(x, y, dx, dy);
        player = 3 - player;
        updateControlAvailability(true);
    }
    checkForEndOfGame();
    if (playComputer){
        computerMove();
        checkForEndOfGame()
    }
    updating = false;
}

async function computerMove(){
    
}

function updateColor(x, j, newColor, number) {
    values[x][j] = number;

    g = document.getElementsByClassName('grid')[0];
    c = g.children[x];
    c.children[j].className = 'circle ' + newColor;

}

function reset() {
    for (let i = 0; i < WIDTH; ++i) {
        for (let j = 0; j < HEIGHT; ++j) {
            updateColor(i, j, COLORS[0], 0);
        }
    }
    dir = SOUTH;
    player = 1;
    controls = document.getElementsByClassName('controls')[0];
    controls.className = 'controls yellow';
    for (let child of controls.children) {
        child.className = 'arrow white';
    }
    indicator = document.getElementById('indicator');
    indicator.className = 'circle yellow';
    controlsAvailable = true;
    rotateAllTo(0, 0);
    gameOver = false;
    game_over_message = document.getElementById('gameover')
    console.log(game_over_message)
    try {
        document.getElementsByClassName('before-board')[0].removeChild(document.getElementById('gameover'));
    } catch (error){
        console.log(error)
    }
}

function updateControlAvailability(boardPressed) {
    shading = 'gray'
    if (boardPressed) {
        shading = 'white';
        indicator = document.getElementById('indicator');
        indicator.className = 'circle ' + COLORS[player];
    }
    c = document.getElementsByClassName('controls')[0];
    c.className = 'controls ' + COLORS[player];
    buttons = c.children;
    for (let j = 0; j < 9; ++j) {

        button = buttons[j]
        button.className = "arrow " + shading;
        resetIndex = 4;
        if (j == resetIndex && !boardPressed) {
            button.className = "arrow white";
        }
    }
    controlsAvailable = boardPressed;
}

function addButtonsToBoard() {
    const g = document.getElementsByClassName('grid')[0];
    let col;
    let element;
    for (let i = 0; i < WIDTH; ++i) {
        col = document.createElement('div');
        col.className = 'col';
        values.push([])
        for (let j = 0; j < HEIGHT; ++j) {
            element = document.createElement("div");
            element.className = 'circle ' + COLORS[0];
            element.addEventListener("click", onClickBoard(i, j));
            col.appendChild(element);
            values[i].push(0);
        }
        g.appendChild(col);
    }
}

async function move(newDir) {
    updating = true;
    if (!controlsAvailable || gameOver) {
        return;
    }
    dir = newDir;
    updateControlAvailability(false);
    await rotateAllTo(DIR2ROT[newDir]);
    const stashPlayer = player;
    await moveTowards();

    player = stashPlayer;
    await checkForEndOfGame();
    if (gameOver){
        console.log("gameOver...");
    }
    updating = false;
}
async function moveTowards() {
    dx = DIR2DELTA[dir][0];
    dy = DIR2DELTA[dir][1];
    xStart = dx == 1 ? WIDTH - 1 : 0;
    yStart = dy == 1 ? HEIGHT - 1 : 0;
    xdelta = dx == 1 ? -1 : 1;
    ydelta = dy == 1 ? -1 : 1;
    for (let i = xStart; i * xdelta < WIDTH - xStart; i += xdelta) {
        for (let j = yStart; j * ydelta < HEIGHT - yStart; j += ydelta) {
            if (values[i][j]) {
                player = values[i][j];
                moveInDirection(i, j, dx, dy);
            }
        }
    }
    await delay(WAIT*4);
}

async function checkForEndOfGame(){
    winners = isGameOver();
    if (winners.length == 0){
        return
    }
    let message;
    if (winners.length == 2){
        message = "TIE GAME";
    } else if (winners.length == 1){
        message = COLORS[winners[0]] + ' wins!'
    }
    m = document.createElement('h1');
    m.id = 'gameover';
    m.appendChild(document.createTextNode(message));
    document.getElementsByClassName('before-board')[0].appendChild(m);
    gameOver = true;
}

function isGameOver() {
    byVert = wonByTower();
    byHoriz = wonByWall();
    diagUp = wonByDiagUp();
    diagDown = wonByDiagDown();
    hasWon = []
    for (let player of [1,2]){
        if ((byVert.includes(player)) || (byHoriz.includes(player)) || (diagUp.includes(player)) || diagDown.includes(player)) {
            hasWon.push(player)
        } 
    }
    if (hasWon.length == 0 && noMoreSpace()){
        hasWon = [1,2];
    }
    return hasWon
}

function noMoreSpace(){
    for (let a of values){
        for (let b of a){
            if (b == 0){
                return false
            }
        }
    }
    return true;
}

function wonByTower() {
    let winners = [];
    for (let i = 0; i < WIDTH; ++i) {
        j = 0;
        while (j < HEIGHT - 3) {
            v = values[i][j];
            if (v == 0) {
                j += 1;
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k) {
                if (v != values[i][j + k]) {
                    j += k
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(winners.includes(v))) {
                winners.push(v);
                j += 4;
            }
        }
    }
    return winners;
}

function wonByWall() {
    let winners = [];
    for (let j = 0; j < HEIGHT; ++j) {
        i = 0;
        while (i < WIDTH - 3) {
            v = values[i][j];
            if (v == 0) {
                i += 1;
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k) {
                if (v != values[i+k][j]) {
                    i += k
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(winners.includes(v))) {
                winners.push(v);
                i += 4
            }
        }
    }
    return winners;
}

function wonByDiagUp() {
    let winners = [];
    for(let i = 0; i < WIDTH-3; ++i){
        for(let j = 0; j < WIDTH-3; ++j){
            v = values[i][j];
            if (v == 0){
                continue;
            }
            allEqual = true;
            for(let k = 1; k < 4; ++k){
                if (v != values[i+k][j+k]){
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(winners.includes(v))) {
                winners.push(v);
            }
        }
    }
    return winners;
}

function wonByDiagDown() {
    let winners = [];
    for(let i = 0; i < WIDTH-3; ++i){
        for(let j = HEIGHT - 1; j >2; --j){
            v = values[i][j];
            if (v == 0){
                continue;
            }
            allEqual = true;
            for(let k = 1; k < 4; ++k){
                if (v != values[i+k][j-k]){
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(winners.includes(v))) {
                winners.push(v);
            }
        }
    }
    return winners;
}


async function animateRotation(element, angle, time = 2) {
    wait = time / angle; console.log(element.style);
    base = '';
    for (let i = 1; i < angle + 1; ++i) {
        element.style = base + "rotate:" + i + "deg;";
    }
}
/*
Expects positive inputs
*/
async function animateRotation(element, rotate, time = 0.5) {
    delta = 1;
    if (rotate > 180) {
        rotate = rotate - 360;
        delta = -1;
    }
    wait = time * 1000 / Math.abs(rotate);
    rot = element.style.rotate;
    initialAngle = Number(rot.slice(0, rot.length - 3))
    let angle = initialAngle;
    while (angle != initialAngle + rotate) {
        angle += delta
        x = angle % 360;
        element.style = "rotate:" + x + "deg;";
        await delay(wait);
    }
}

async function rotateAllTo(angle, time = 1) {
    b = document.getElementsByClassName('square')[0];
    c = document.getElementsByClassName('controls')[0];
    rot = b.style.rotate;
    initialAngle = Number(rot.slice(0, rot.length - 3));
    d_angle = (360 + angle - initialAngle) % 360;
    animateRotation(b, d_angle, time);
    await animateRotation(c, d_angle, time);
}

document.addEventListener("DOMContentLoaded", function () {
    addButtonsToBoard();
});