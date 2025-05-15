import { noMoreSpace, wonByTower } from './lib.js';
const COLORS = ["nocolor", "yellow", "red"]
const SOUTH = "S";
const NORTH = "N";
const WEST = "W";
const EAST = "E";
const NE = "NE";
const NW = "NW";
const SE = "SE";
const SW = "SW";
const directions = [NW, NORTH, NE, WEST, EAST, SW, SOUTH, SE];
const DIR2DELTA = { 'N': [0, -1], 'S': [0, 1], 'E': [1, 0], 'W': [-1, 0], 'NW': [-1, -1], 'SW': [-1, 1], 'SE': [1, 1], 'NE': [1, -1] }
const DIR2ROT = { 'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': 225, 'W': 270, 'SW': 315 }
const WAIT = 70;
const WIDTH = 7;
const HEIGHT = 6;
const COLUMN_SEEDS = getAllColumnSeeds(WIDTH, HEIGHT);
let state = {
    updating: false,
    player: 1,
    dir: SOUTH,
    values: [],
    controlsAvailable: true,
    gameOver: false,
    boardBlank: true,
}
const config = {
    PLAY_COMPUTER: false,
    SEARCH_DEPTH: 3
}

let memo = {};

function delay(milliseconds) {
    return new Promise(resolve => { setTimeout(resolve, milliseconds); });
}

function onClickBoard(x, y) {
    return async function () {
        if (state.updating || state.gameOver) {
            return;
        }
        state.updating = true;
        state.boardBlank = false;
        await playAt(x, y);
        if (config.PLAY_COMPUTER && !state.gameOver){
            state.updating = true;
            const computerAction = computerMove(state.values, state.dir, state.player);
            const newDir = computerAction[0];
            const newCoords = computerAction[1];
            await rotateTo(newDir);
            if (state.gameOver == false){
                await playAt(newCoords[0], newCoords[1]);
            }
        }
        state.updating = false;
    };
}

function inBounds(x, y) {
    return 0 <= x && x < WIDTH && 0 <= y && y < HEIGHT;
}

function coordInBounds(pair){
    return inBounds(pair[0], pair[1]);
}

async function swapColors(x1, y1, x2, y2) {
    const v1 = state.values[x1][y1]
    const v2 = state.values[x2][y2]
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

async function playAt(x, y) {
    const coordinates = getStartingLocation(x,y,state.dir);
    x = coordinates[0];
    y = coordinates[2];
    const dx = coordinates[1];
    const dy = coordinates[3];
    await playPiece(x,y,dx,dy);
    updateControlAvailability(true);
    checkForEndOfGame();
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
    const d = new Date();
    const t = d.getTime();
    console.log("thinking...");
    let okayMoves = [];
    for(let direction of directions){
        const afterRotating = simulateRotation(currentBoard, direction);
        const result =  isGameOver(afterRotating);
        if ( intArrayEquals(result, [playerTurn])){
            printThinkingTime(t);
            console.log("found a forced win");
            return [direction,firstAvailableMove(currentBoard)]
        }
        else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
            continue;
        }
        for (let move of COLUMN_SEEDS[direction]){
            let i = move[0], j = move[1];
            if (afterRotating[i][j] == 0){
                // TODO: enable removing the piece you play
                let afterPlaying = deepcopy(afterRotating);
                simulateAddition(afterPlaying, direction, playerTurn, i,j);
                const result = guaranteed_winners(afterPlaying, getOtherPlayer(playerTurn), config.SEARCH_DEPTH);
                if (intArrayEquals(result, [playerTurn])){
                    printThinkingTime(t);
                    console.log("found a forced win");
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
    // otherwise, play a random move
    if (okayMoves.length  > 0){
        printThinkingTime(t);
        return randomChoice(okayMoves);
    }
    else {
        printThinkingTime(t);
        console.log("we're cooked");
        return [current_dir,firstAvailableMove(currentBoard)]
    }
}

function printThinkingTime(t){
    const d2 = new Date();
    console.log(`thought for ${(d2.getTime() - t)/1000} seconds`)
}
// a generalization of isGameOver
function guaranteed_winners(currentBoard, playerTurn, num_moves){
    const preliminary_result = isGameOver(currentBoard);
    if (preliminary_result.length > 0 || num_moves == 0){
        return preliminary_result;
    }

    let tying_possible = false;
    let undetermined_outcome = false;
    for (let direction of directions){
        const afterRotating = simulateRotation(currentBoard, direction);
        const result = isGameOver(afterRotating);
        if ( intArrayEquals(result, [playerTurn])){
            return result;
        }
        else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
            continue;
        } else if (result.length == 2){
            tying_possible = true;
            continue;
        }
        for (let move of COLUMN_SEEDS[direction]){
            let i = move[0], j = move[1];
            if (afterRotating[i][j] == 0){
                // TODO: enable removing the piece you play
                let afterPlaying = deepcopy(afterRotating);
                simulateAddition(afterPlaying, direction, playerTurn, i,j);
                const result = guaranteed_winners(afterPlaying, getOtherPlayer(playerTurn), num_moves - 1);
                if (intArrayEquals(result, [playerTurn])){
                    return result;
                }
                else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
                    continue;
                } else if (result.length == 2){
                    tying_possible = true;
                } else {
                    undetermined_outcome = true;
                }
            }
        }
    }
    // we play for a win
    if (undetermined_outcome){
        return [];
    } else if (tying_possible){
        return [playerTurn, getOtherPlayer(playerTurn)];
    } else {
        return [getOtherPlayer(playerTurn)];
    }

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
    const tmp = board[x][y];
    board[x][y] = board[a][b];
    board[a][b] = tmp;
}

function simulateAddition(board, direction, playerTurn, i,j){
    const dx = DIR2DELTA[direction][0];
    const dy = DIR2DELTA[direction][1];
    board[i][j] = playerTurn;
    simulateMoveInDirection(i,j,dx,dy, board)
}


function simulateRotation(values, newDirection){
    values = deepcopy(values);
    const dx = DIR2DELTA[newDirection][0];
    const dy = DIR2DELTA[newDirection][1];
    const xStart = dx == 1 ? WIDTH - 1 : 0;
    const yStart = dy == 1 ? HEIGHT - 1 : 0;
    const xdelta = dx == 1 ? -1 : 1;
    const ydelta = dy == 1 ? -1 : 1;
    const tasks = []
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

    const g = document.getElementsByClassName('grid')[0];
    const c = g.children[x];
    c.children[j].className = 'circle ' + newColor;

}

async function reset() {
    for (let i = 0; i < WIDTH; ++i) {
        for (let j = 0; j < HEIGHT; ++j) {
            updateColor(i, j, COLORS[0], 0);
        }
    }
    state.boardBlank = true;
    state.dir = SOUTH;
    state.player = 1;
    const controls = document.getElementsByClassName('controls')[0];
    controls.className = 'controls yellow';
    for (let child of controls.children) {
        child.className = 'arrow white';
    }
    const indicator = document.getElementById('indicator');
    indicator.className = 'circle yellow';
    state.controlsAvailable = true;
    await rotateAllTo(0, 0);
    state.gameOver = false;
    const game_over_message = document.getElementById('gameover')
    console.log(game_over_message)
    try {
        document.getElementsByClassName('before-board')[0].removeChild(document.getElementById('gameover'));
    } catch (error){
        console.log(error)
    }
}

function updateControlAvailability(boardPressed) {
    let shading = 'gray'
    if (boardPressed) {
        shading = 'white';
        const indicator = document.getElementById('indicator');
        indicator.className = 'circle ' + COLORS[state.player];
    }
    const c = document.getElementsByClassName('controls')[0];
    c.className = 'controls ' + COLORS[state.player];
    const buttons = c.children;
    for (let j = 0; j < 9; ++j) {

        const button = buttons[j]
        button.className = "arrow " + shading;
        const resetIndex = 4;
        if (j == resetIndex && !boardPressed) {
            button.className = "arrow white";
        }
    }
    state.controlsAvailable = boardPressed;
}

function addButtonsToBoard() {
    // provide binding for the opponent toggle
    const toggle = document.getElementById('setOpponent');
    toggle.onchange = (event) => setOpponent(event.target.value);
    
    // add the connect 4 board
    const g = document.getElementsByClassName('grid')[0];
    let col;
    let childElement;
    for (let i = 0; i < WIDTH; ++i) {
        col = document.createElement('div');
        col.className = 'col';
        state.values.push([])
        for (let j = 0; j < HEIGHT; ++j) {
            childElement = document.createElement("div");
            childElement.className = 'circle ' + COLORS[0];
            childElement.addEventListener("click", onClickBoard(i, j));
            col.appendChild(childElement);
            state.values[i].push(0);
        }
        g.appendChild(col);
    }
    // add the rotation and reset controls
    const control = document.getElementsByClassName('controls')[0];
    const styles = ["rotate:225deg", "rotate:270deg", "rotate:315deg", "rotate:180deg", "rotate:0deg","rotate:135deg", "rotate:90deg", "rotate:45deg"];
    for (let i = 0; i < 4; ++i){
        addDirectionArrow(control,styles[i], directions[i]);
    }
    childElement = document.createElement('div');
    childElement.id = "center1";
    childElement.className = "arrow white";
    childElement.onclick = reset;
    const gchild = document.createElement('img');
    gchild.className = 'rotate';
    gchild.src = "./arrow-rotate.svg";
    childElement.appendChild(gchild);
    control.appendChild(childElement);
    for (let i = 4; i < 8; ++i){
        addDirectionArrow(control,styles[i], directions[i]);
    }
}
function addDirectionArrow(parent, styleString, dirString){
    const childElement = document.createElement('img');
    childElement.src = "arrow-right.svg";
    childElement.style = styleString;
    childElement.className = "arrow white";
    childElement.onclick = () => rotateTo(dirString);
    parent.appendChild(childElement);
}

async function rotateTo(newDir) {
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
}
async function moveTowards() {
    const dx = DIR2DELTA[state.dir][0];
    const dy = DIR2DELTA[state.dir][1];
    const xStart = dx == 1 ? WIDTH - 1 : 0;
    const yStart = dy == 1 ? HEIGHT - 1 : 0;
    const xdelta = dx == 1 ? -1 : 1;
    const ydelta = dy == 1 ? -1 : 1;
    const tasks = []
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
    const winners = isGameOver(state.values);
    if (winners.length == 0){
        return
    }
    let message;
    if (winners.length == 2){
        message = "TIE GAME";
    } else if (winners.length == 1){
        message = COLORS[winners[0]] + ' wins!'
    }
    const m = document.createElement('h1');
    m.id = 'gameover';
    m.appendChild(document.createTextNode(message));
    document.getElementsByClassName('before-board')[0].appendChild(m);
    state.gameOver = true;
}
// pure
function isGameOver(boardArray) {
    const byVert = wonByTower(boardArray);
    const byHoriz = wonByWall(boardArray);
    const diagUp = wonByDiagUp(boardArray);
    const diagDown = wonByDiagDown(boardArray);
    let hasWon = []
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
function wonByWall(boardArray) {
    let winners = [];
    const width = boardArray.length;
    const height = boardArray[0].length;
    for (let j = 0; j < height; ++j) {
        let i = 0;
        while (i < width - 3) {
            const v = boardArray[i][j];
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
function wonByDiagUp(boardArray) {
    let winners = [];
    const width = boardArray.length;
    const height = boardArray[0].length;
    for(let i = 0; i < width-3; ++i){
        for(let j = 0; j < height-3; ++j){
            const v = boardArray[i][j];
            if (v == 0){
                continue;
            }
            let allEqual = true;
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
function wonByDiagDown(boardArray) {
    let winners = [];
    const width = boardArray.length;
    const height = boardArray[0].length;
    for(let i = 0; i < width-3; ++i){
        for(let j = height - 1; j >2; --j){
            const v = boardArray[i][j];
            if (v == 0){
                continue;
            }
            let allEqual = true;
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

function getAllColumnSeeds(dimension0, dimension1){
    let result = {};
    for(let direction of directions){
        let seeds = [];
        for(let i = 0; i < dimension0; ++i){
            for (let j = 0; j < dimension1; ++j){
                let coords;
                let parentCoords = [i,j];
                do {
                    coords = parentCoords;
                    parentCoords = [coords[0]-DIR2DELTA[direction][0], coords[1] - DIR2DELTA[direction][1]];
                }
                while (coordInBounds(parentCoords));
                let alreadyContains = false;
                for(let seed of seeds){
                    if (intArrayEquals(seed, coords)){
                        alreadyContains = true;
                    }
                }
                if (alreadyContains == false){
                    seeds.push(coords);
                }
            }
        }
        result[direction] = seeds;
    }
    return result;

}

/*
Expects positive inputs
*/
async function animateRotation(element, rotate, time = 0.5) {
    let delta = 1;
    if (rotate > 180) {
        rotate = rotate - 360;
        delta = -1;
    }
    const wait = time * 1000 / Math.abs(rotate);
    const rot = element.style.rotate;
    const initialAngle = Number(rot.slice(0, rot.length - 3))
    let angle = initialAngle;
    while (angle != initialAngle + rotate) {
        angle += delta
        let x = angle % 360;
        element.style = "rotate:" + x + "deg;";
        await delay(wait);
    }
}

async function setOpponent(newOpponent){
    await reset();
    if (newOpponent == "human"){
        config.PLAY_COMPUTER = false;
        return;
    }
    config.PLAY_COMPUTER = true;
    config.SEARCH_DEPTH = parseSearchDepth(newOpponent);
}

function parseSearchDepth(newOpponent){
    const length = newOpponent.length;
    return parseInt(newOpponent.slice(length - 1))
}

async function rotateAllTo(angle, time = 1) {
    let b = document.getElementsByClassName('square')[0];
    let c = document.getElementsByClassName('controls')[0];
    const rot = b.style.rotate;
    const initialAngle = Number(rot.slice(0, rot.length - 3));
    const d_angle = (360 + angle - initialAngle) % 360;
    // these happen concurrently
    animateRotation(b, d_angle, time);
    await animateRotation(c, d_angle, time);
}

document.addEventListener("DOMContentLoaded", function () {
    addButtonsToBoard();
});