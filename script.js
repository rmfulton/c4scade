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

function reset(p){
    if (p != player){
        return
    }
    for(let i = 0; i < WIDTH; ++i){
        for(let j = 0; j < HEIGHT; ++j){
            updateColor(i,j,COLORS[0],0);
        }
    }
    dir=SOUTH;
    player = 1;
    controls = document.getElementsByClassName('controls');
    for (let child of controls[0].children){
        child.className = 'dirButton white';
    }
    for(let child of controls[1].children){
        child.className = 'dirButton gray';
    }
    arrow = document.getElementById('arrow');
    arrow.className = 'S yellow';
    controlsAvailable = true;
}

function updateControlAvailability(boardPressed){
    colors = ['gray','gray'];
    if (boardPressed){
        colors[player-1] = 'white';
        arrow = document.getElementById('arrow');
        arrow.className = arrow.className.split(' ')[0] + ' ' + COLORS[player];
    } 
    for (let i = 0; i < 2; ++i){
        c = document.getElementsByClassName('controls')[i];
        buttons = c.children;
        for(let j = 0; j < 9; ++j){

            button = buttons[j]
            button.className = "dirButton " + colors[i];
            resetIndex = 4;
            if (j == resetIndex && !boardPressed && i == player-1){
                button.className = "dirButton white";
            }
        }
        controlsAvailable = boardPressed;
    }
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

async function move(newDir, p) {
    if (!controlsAvailable){
        return;
    }
    if (p != player){
        return
    }
    dir = newDir;
    const stashPlayer = player;
    await moveTowards();

    player = stashPlayer;
    updateControlAvailability(false);
}
async function moveTowards() {
    dx = DIR2DELTA[dir][0];
    dy = DIR2DELTA[dir][1];
    xStart = dx == 1 ? WIDTH-1 : 0;
    yStart = dy == 1 ? HEIGHT-1: 0;
    xdelta = dx == 1 ? -1: 1;
    ydelta = dy == 1 ? -1: 1;
    document.getElementById('arrow').className = dir + ' ' + COLORS[player];
    for (let i = xStart; i*xdelta < WIDTH - xStart; i += xdelta){
        for (let j = yStart; j*ydelta < HEIGHT - yStart; j += ydelta){
            if(values[i][j]){
                player = values[i][j];
                moveInDirection(i,j,dx,dy);
            }
        }
    }

}


document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});