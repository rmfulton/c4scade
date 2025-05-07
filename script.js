const COLORS = ["nocolor", "yellow", "red"]
const SOUTH = "S";
const NORTH = "N";
const WEST = "W";
const EAST = "E";
const NE = "NE";
const NW = "NW";
const SE = "SE";
const SW = "SW";
const directions = [NORTH, SOUTH, EAST, WEST, NE, NW, SE, SW];
const DIR2DELTA = { 'N': [0, -1], 'S': [0, 1], 'E': [1, 0], 'W': [-1, 0], 'NW': [-1, -1], 'SW': [-1, 1], 'SE': [1, 1], 'NE': [1, -1] }
const DIR2ROT = { 'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': 225, 'W': 270, 'SW': 315 }
const WAIT = 70;
const WIDTH = 7;
const HEIGHT = 6;
const SEARCH_DEPTH = 3;
let state = {
    updating: false,
    player: 1,
    dir: SOUTH,
    values: [],
    controlsAvailable: true,
    gameOver: false,
    playComputer: true
}

function delay(milliseconds) {
    return new Promise(resolve => { setTimeout(resolve, milliseconds); });
}

function onClickBoard(x, y) {
    return async function () {
        await buttonPressed(x, y);
        if (state.playComputer){
            computerAction = computerMove(state.values, state.dir, state.player);
            newDir = computerAction[0];
            newCoords = computerAction[1];
            await rotateTo(newDir);
            await buttonPressed(newCoords[0], newCoords[1]);
            
        }
    };
}

function inBounds(x, y) {
    return 0 <= x && x < WIDTH && 0 <= y && y < HEIGHT;
}

async function swapColors(x1, y1, x2, y2) {
    v1 = state.values[x1][y1]
    v2 = state.values[x2][y2]
    updateColor(x1, y1, COLORS[v2], v2);
    updateColor(x2, y2, COLORS[v1], v1);
    await delay(WAIT);
}

async function moveInDirection(x, y, dx, dy) {
    let newx = x + dx;
    let newy = y + dy;

    while (inBounds(newx, newy) && state.values[newx][newy] == 0) {
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
    if (state.updating || state.gameOver) {
        return;
    }
    state.updating = true;
    coordinates = getStartingLocation(x,y,state.dir);
    x = coordinates[0];
    y = coordinates[2];
    const dx = coordinates[1];
    const dy = coordinates[3];
    await playPiece(x,y,dx,dy);
    updateControlAvailability(true);
    checkForEndOfGame();
    state.updating = false;
}

async function playPiece(x,y,dx,dy){
    if (state.values[x][y] == 0) {
        updateColor(x, y, COLORS[state.player], state.player);
        await moveInDirection(x, y, dx, dy);
        state.player = getOtherPlayer(state.player);
    }
}

// pure
function getStartingLocation(pressed_x,pressed_y,current_direction){
    let dx = 0, dy = 0, m = 0, x = pressed_x, y = pressed_y;
    switch (current_direction) {
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
    return [x,dx,y,dy];
}
//pure
function getOtherPlayer(current_player){
    return 3 - current_player;
}
/*
This function should return 
- the direction to rotate the board in, and
- the i,j indices to click given the state of the board
*/
function computerMove(currentBoard, current_dir, playerTurn){
    // if there's a winning move in one turn, play it
    let okayMoves = [];
    for(let direction of directions){
        const afterRotating = simulateRotation(currentBoard, direction);
        result =  isGameOver(afterRotating, HEIGHT, WIDTH);
        if ( intArrayEquals(result, [playerTurn])){
            return [direction,firstAvailableMove(currentBoard)]
        }
        else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
            continue;
        }
        // TODO: optimize from time w*h to MAX(w,h))
        for (let i = 0; i < WIDTH; ++i){
            for (let j = 0; j < HEIGHT; ++j){
                if (afterRotating[i][j] == 0){
                    // TODO: enable removing the piece you play
                    let afterPlaying = deepcopy(afterRotating);
                    simulateAddition(afterPlaying, direction, playerTurn, i,j);
                    result = isGameOver(afterPlaying, HEIGHT, WIDTH);
                    if (intArrayEquals(result, [playerTurn])){
                        return [direction,[i,j]];
                    }
                    else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
                        continue;
                    } else{
                        okayMoves.push([direction,[i,j]])
                    }
                }
            }
        }
    }
    // otherwise, play a random move
    return randomChoice(okayMoves)
}

function randomChoice(array){
    const L = array.length;
    const i = Math.floor(Math.random()*L);
    return array[i];
}

function intArrayEquals(a,b){
    if (a.length != b.length){
        return false;
    }
    for(let i = 0; i < a.length; ++i){
        if (a[i] != b[i]){
            return false;
        }
    }
    return true;
}

function simulateMoveInDirection(x, y, dx, dy, board) {
    let newx = x + dx;
    let newy = y + dy;

    while (inBounds(newx, newy) && board[newx][newy] == 0) {
        swapValues(x, y, newx, newy, board);
        x = newx;
        y = newy;
        newx += dx;
        newy += dy;
    }
}

function swapValues(x,y,a,b,board){
    tmp = board[x][y];
    board[x][y] = board[a][b];
    board[a][b] = tmp;
}

function simulateAddition(board, direction, playerTurn, i,j){
    dx = DIR2DELTA[direction][0];
    dy = DIR2DELTA[direction][1];
    board[i][j] = playerTurn;
    simulateMoveInDirection(i,j,dx,dy, board)
}


function simulateRotation(values, newDirection){
    values = deepcopy(values);
    dx = DIR2DELTA[newDirection][0];
    dy = DIR2DELTA[newDirection][1];
    xStart = dx == 1 ? WIDTH - 1 : 0;
    yStart = dy == 1 ? HEIGHT - 1 : 0;
    xdelta = dx == 1 ? -1 : 1;
    ydelta = dy == 1 ? -1 : 1;
    tasks = []
    for (let i = xStart; i * xdelta < WIDTH - xStart; i += xdelta) {
        for (let j = yStart; j * ydelta < HEIGHT - yStart; j += ydelta) {
            if (values[i][j]) {
                simulateMoveInDirection(i, j, dx, dy,values);
            }
        }
    }
    return values;
}

function deepcopy(values){
    let newValues = [];
    for (let i = 0; i < values.length; ++i){
        let element = []
        for (let j = 0; j < values[i].length; ++j){
            element.push(values[i][j]);
        }
        newValues.push(element);
    }
    return newValues;
}

function firstAvailableMove(currentBoard){
    for (let i = 0; i < WIDTH; ++i){
        for (let j = 0; j < HEIGHT; ++j){
            if (currentBoard[i][j] == 0){
                return [i,j];
            }
        }
    }
}

function updateColor(x, j, newColor, number) {
    state.values[x][j] = number;

    g = document.getElementsByClassName('grid')[0];
    c = g.children[x];
    c.children[j].className = 'circle ' + newColor;

}

async function reset() {
    for (let i = 0; i < WIDTH; ++i) {
        for (let j = 0; j < HEIGHT; ++j) {
            updateColor(i, j, COLORS[0], 0);
        }
    }
    state.dir = SOUTH;
    state.player = 1;
    controls = document.getElementsByClassName('controls')[0];
    controls.className = 'controls yellow';
    for (let child of controls.children) {
        child.className = 'arrow white';
    }
    indicator = document.getElementById('indicator');
    indicator.className = 'circle yellow';
    state.controlsAvailable = true;
    await rotateAllTo(0, 0);
    state.gameOver = false;
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
        indicator.className = 'circle ' + COLORS[state.player];
    }
    c = document.getElementsByClassName('controls')[0];
    c.className = 'controls ' + COLORS[state.player];
    buttons = c.children;
    for (let j = 0; j < 9; ++j) {

        button = buttons[j]
        button.className = "arrow " + shading;
        resetIndex = 4;
        if (j == resetIndex && !boardPressed) {
            button.className = "arrow white";
        }
    }
    state.controlsAvailable = boardPressed;
}

function addButtonsToBoard() {
    const g = document.getElementsByClassName('grid')[0];
    let col;
    let element;
    for (let i = 0; i < WIDTH; ++i) {
        col = document.createElement('div');
        col.className = 'col';
        state.values.push([])
        for (let j = 0; j < HEIGHT; ++j) {
            element = document.createElement("div");
            element.className = 'circle ' + COLORS[0];
            element.addEventListener("click", onClickBoard(i, j));
            col.appendChild(element);
            state.values[i].push(0);
        }
        g.appendChild(col);
    }
}

async function rotateTo(newDir) {
    state.updating = true;
    if (!state.controlsAvailable || state.gameOver) {
        return;
    }
    state.dir = newDir;
    updateControlAvailability(false);
    await rotateAllTo(DIR2ROT[newDir]);
    await moveTowards();
    checkForEndOfGame();
    if (state.gameOver){
        console.log("gameOver...");
    }
    state.updating = false;
}
async function moveTowards() {
    dx = DIR2DELTA[state.dir][0];
    dy = DIR2DELTA[state.dir][1];
    xStart = dx == 1 ? WIDTH - 1 : 0;
    yStart = dy == 1 ? HEIGHT - 1 : 0;
    xdelta = dx == 1 ? -1 : 1;
    ydelta = dy == 1 ? -1 : 1;
    tasks = []
    for (let i = xStart; i * xdelta < WIDTH - xStart; i += xdelta) {
        for (let j = yStart; j * ydelta < HEIGHT - yStart; j += ydelta) {
            if (state.values[i][j]) {
                tasks.push(moveInDirection(i, j, dx, dy));
            }
        }
    }
    await whenAllDone(tasks);
}

async function whenAllDone(tasks){
    for (let t of tasks){
        await t;
    }
}

function checkForEndOfGame(){
    winners = isGameOver(state.values, HEIGHT, WIDTH);
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
    state.gameOver = true;
}
// pure
function isGameOver(boardArray, height, width) {
    byVert = wonByTower(boardArray, height, width);
    byHoriz = wonByWall(boardArray, height, width);
    diagUp = wonByDiagUp(boardArray, height, width);
    diagDown = wonByDiagDown(boardArray, height, width);
    hasWon = []
    for (let player of [1,2]){
        if ((byVert.includes(player)) || (byHoriz.includes(player)) || (diagUp.includes(player)) || diagDown.includes(player)) {
            hasWon.push(player)
        } 
    }
    if (hasWon.length == 0 && noMoreSpace(boardArray)){
        hasWon = [1,2];
    }
    return hasWon
}
// pure
function noMoreSpace(boardArray){
    for (let a of boardArray){
        for (let b of a){
            if (b == 0){
                return false
            }
        }
    }
    return true;
}
// pure
function wonByTower(boardArray, height, width) {
    let winners = [];
    for (let i = 0; i < width; ++i) {
        j = 0;
        while (j < height - 3) {
            v = boardArray[i][j];
            if (v == 0) {
                j += 1;
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k) {
                if (v != boardArray[i][j + k]) {
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
// pure
function wonByWall(boardArray, height, width) {
    let winners = [];
    for (let j = 0; j < height; ++j) {
        i = 0;
        while (i < width - 3) {
            v = boardArray[i][j];
            if (v == 0) {
                i += 1;
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k) {
                if (v != boardArray[i+k][j]) {
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
// pure
function wonByDiagUp(boardArray,width,height) {
    let winners = [];
    for(let i = 0; i < width-3; ++i){
        for(let j = 0; j < height-3; ++j){
            v = boardArray[i][j];
            if (v == 0){
                continue;
            }
            allEqual = true;
            for(let k = 1; k < 4; ++k){
                if (v != boardArray[i+k][j+k]){
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
// pure
function wonByDiagDown(boardArray, height, width) {
    let winners = [];
    for(let i = 0; i < width-3; ++i){
        for(let j = height - 1; j >2; --j){
            v = boardArray[i][j];
            if (v == 0){
                continue;
            }
            allEqual = true;
            for(let k = 1; k < 4; ++k){
                if (v != boardArray[i+k][j-k]){
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
    // these happen concurrently
    animateRotation(b, d_angle, time);
    await animateRotation(c, d_angle, time);
}

document.addEventListener("DOMContentLoaded", function () {
    addButtonsToBoard();
});