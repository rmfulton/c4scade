const COLORS = ["nocolor","yellow","red"]
const SOUTH = "S";
const NORTH = "N";
const WEST = "W";
const EAST = "E";
const NE = "NE";
const NW = "NW";
const SE = "SE";
const SW = "SW";
DIR2DELTA = {'N': [0,-1], 'S': [0,1], 'E': [1,0], 'W': [-1,0], 'NW': [-1,-1], 'SW':[-1,1], 'SE': [1,1], 'NE': [1,-1]}
DIR2ROT = {'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': 225, 'W': 270, 'SW': 315}
const WAIT = 70;
const WIDTH = 7;
const HEIGHT = 6;

let updating = false;
let player = 1;
let dir = SOUTH;
let values = [];
let controlsAvailable = true;

function delay(milliseconds){
    return new Promise(resolve => {setTimeout(resolve, milliseconds);});
}

function onClickBoard(x,y) {
    return async function() {
        await buttonPressed(x,y);
    };
}

function inBounds(x,y){
    return 0 <= x && x < WIDTH && 0 <= y && y < HEIGHT;
}

async function swapColors(x1,y1,x2,y2){
    v1 = values[x1][y1]
    v2 = values[x2][y2]
    updateColor(x1,y1,COLORS[v2],v2);
    updateColor(x2,y2, COLORS[v1],v1);
    await delay(WAIT);
}

async function moveInDirection(x,y,dx,dy){
    let newx = x + dx;
    let newy = y + dy;

    while (inBounds(newx,newy) && values[newx][newy] == 0){
        await swapColors(x,y,newx,newy);
        x = newx;
        y = newy;
        newx = x + dx;
        newy = y + dy;
    }
}
function min(a,b){
    return a < b ? a : b;
}

async function buttonPressed(x,y){
    if (updating){
        return;
    }
    updating = true;
    let dx = 0, dy = 0, m = 0;
    switch (dir){
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
            m = min(x,y);
            x -= m;
            y -= m;
            dx = 1;
            dy = 1;
            break;
        case NW:
            m = min(WIDTH - 1- x, HEIGHT - 1 - y);
            x += m;
            y += m;
            dx = -1;
            dy = -1;
            break;
        case NE:
            m = min(x, HEIGHT-1-y);
            x -= m;
            y += m;
            dx = 1;
            dy = -1;
            break;
        case SW:
            m = min(WIDTH - 1-x, y);
            x += m;
            y -= m;
            dx = -1;
            dy = 1;
            break;

    }
    if (values[x][y] == 0){
        updateColor(x,y,COLORS[player], player);
        await moveInDirection(x,y,dx,dy);
        player = 3 - player;
        updateControlAvailability(true);
    }
    updating = false;
}

function updateColor(x,j,newColor,number){
    values[x][j] = number;

    g = document.getElementsByClassName('grid')[0];
    c = g.children[x];
    c.children[j].className = 'circle ' + newColor;

}

function reset(){
    for(let i = 0; i < WIDTH; ++i){
        for(let j = 0; j < HEIGHT; ++j){
            updateColor(i,j,COLORS[0],0);
        }
    }
    dir=SOUTH;
    player = 1;
    controls = document.getElementsByClassName('controls')[0];
    controls.className = 'controls yellow';
    for (let child of controls.children){
        child.className = 'arrow white';
    }
    indicator = document.getElementById('indicator');
    indicator.className = 'circle yellow';
    controlsAvailable = true;
    rotateAllTo(0,0)
}

function updateControlAvailability(boardPressed){
    shading = 'gray'
    if (boardPressed){
        shading = 'white';
        indicator = document.getElementById('indicator');
        indicator.className =  'circle ' + COLORS[player];
    } 
    c = document.getElementsByClassName('controls')[0];
    c.className = 'controls ' + COLORS[player];
    buttons = c.children;
    for(let j = 0; j < 9; ++j){

        button = buttons[j]
        button.className = "arrow " + shading;
        resetIndex = 4;
        if (j == resetIndex && !boardPressed){
            button.className = "arrow white";
        }
    }
    controlsAvailable = boardPressed;
}

function addButtonsToBoard(){
    const g = document.getElementsByClassName('grid')[0];
    let col;
    let element;
    for (let i = 0; i < WIDTH; ++i){
        col = document.createElement('div');
        col.className = 'col';
        values.push([])
        for (let j = 0; j < HEIGHT; ++j){
            element = document.createElement("div");
            element.className =  'circle ' + COLORS[0];
            element.addEventListener("click", onClickBoard(i,j));
            col.appendChild(element);
            values[i].push(0);
        }
        g.appendChild(col);
    }
}

async function move(newDir) {
    if (!controlsAvailable){
        return;
    }
    dir = newDir;
    updateControlAvailability(false);
    await rotateAllTo(DIR2ROT[newDir]);
    const stashPlayer = player;
    await moveTowards();

    player = stashPlayer;
}
async function moveTowards() {
    dx = DIR2DELTA[dir][0];
    dy = DIR2DELTA[dir][1];
    xStart = dx == 1 ? WIDTH-1 : 0;
    yStart = dy == 1 ? HEIGHT-1: 0;
    xdelta = dx == 1 ? -1: 1;
    ydelta = dy == 1 ? -1: 1;
    for (let i = xStart; i*xdelta < WIDTH - xStart; i += xdelta){
        for (let j = yStart; j*ydelta < HEIGHT - yStart; j += ydelta){
            if(values[i][j]){
                player = values[i][j];
                moveInDirection(i,j,dx,dy);
            }
        }
    }

}

function isGameOver(){
    byVert = wonByTower();
    byHoriz = wonByWall();
    byDiag = wonByDiag(); 

}

function wonByTower(){
    i = 0;
    let winners = [];
    for(let i = 0; i < WIDTH; ++i){
        j = 0;
        while (j < HEIGHT - 4){
            v = values[i][j];
            if (v == 0){
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k){
                if (v != values[i][j+k]) {
                    j += k
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(v  in winners)){
                winners.push(v);
            }
            j += 4;
        }
    }
    return winners;
}

async function animateRotation(element, angle,time=2){
    wait = time/angle;console.log(element.style);
    base =  '';
    for (let i = 1; i < angle+1; ++i){
        element.style = base + "rotate:" + i  + "deg;";
    }
}
/*
Expects positive inputs
*/
async function animateRotation(element, rotate,time=0.5){
    delta = 1;
    if (rotate > 180){
        rotate = rotate - 360;
        delta = -1;
    }
    wait = time*1000/Math.abs(rotate);
    rot = element.style.rotate;
    initialAngle = Number( rot.slice(0,rot.length - 3))
    let angle = initialAngle;
    while (angle != initialAngle + rotate){
        angle += delta
        x = angle % 360;
        element.style = "rotate:" + x  + "deg;";
        await delay(wait);
    }
}

async function rotateAllTo(angle, time=1){
    b = document.getElementsByClassName('square')[0];
    c = document.getElementsByClassName('controls')[0];
    rot = b.style.rotate;
    initialAngle = Number( rot.slice(0,rot.length - 3));
    d_angle = (360 + angle - initialAngle) % 360;
    animateRotation(b, d_angle, time);
    await animateRotation(c, d_angle, time);
}

document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});