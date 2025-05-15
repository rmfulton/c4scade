import { inBounds, min } from './utils.js';
import { COLORS,SOUTH,NORTH,EAST,WEST,NW,SW,NE,SE,DIRECTIONS,DIR2DELTA, DIR2ROT,WAIT,WIDTH,HEIGHT} from './constants.js';
import { isGameOver, getOtherPlayer } from './lib.js';
import { computerMove } from './lookahead.js';
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
            const computerAction = computerMove(state.values, state.dir, state.player, config.SEARCH_DEPTH);
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

    while (inBounds(newx, newy, WIDTH, HEIGHT) && state.values[newx][newy] == 0) {
        await swapColors(x, y, newx, newy);
        x = newx;
        y = newy;
        newx = x + dx;
        newy = y + dy;
    }
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

async function playPiece(x,y,dx,dy){
    if (state.values[x][y] == 0) {
        updateColor(x, y, COLORS[state.player], state.player);
        await moveInDirection(x, y, dx, dy);
        state.player = getOtherPlayer(state.player);
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
        addDirectionArrow(control,styles[i], DIRECTIONS[i]);
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
        addDirectionArrow(control,styles[i], DIRECTIONS[i]);
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