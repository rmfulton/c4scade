const COLORS = ["nocolor","yellow","red"]
const SOUTH = "S";
const NORTH = "N";
const WEST = "W";
const EAST = "E";
const NE = "NE";
const NW = "NW";
const SE = "SE";
const SW = "SW";
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
    console.log(x1,y1,"swap with", x2, y2);
    v1 = values[x1][y1]
    v2 = values[x2][y2]
    updateColor(x1,y1,COLORS[v2],v2);
    updateColor(x2,y2, COLORS[v1],v1);
    await delay(WAIT);
}

async function moveInDirection(x,y,dx,dy){
    console.log(x,y,dx,dy);
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
}

function updateControlAvailability(status){
    colors = ['gray','gray'];
    if (status){
        colors[player-1] = 'white';
    } 
    for (let i = 0; i < 2; ++i){
        c = document.getElementsByClassName('controls')[i];
        buttons = c.children;
        for(let button of buttons){
            button.className = "dirButton " + colors[i];
        }
        controlsAvailable = status;
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

async function move(newDir) {
    if (!controlsAvailable){
        return;
    }
    dir = newDir;
    const stashPlayer = player;
    switch (dir){
        case SOUTH:
            await moveSouth();
            break
        case NORTH:
            await moveNorth();
            break;
        case EAST:
            await moveEast()
            break;
        case WEST:
            await moveWest();
            break;
        case SE:
            await moveSE();
            break;
        case NW:
            await moveNW();
            break;
        case NE:
            await moveNE();
            break;
        case SW:
            await moveSW();
            break;

    }
    player = stashPlayer;
    updateControlAvailability(false);
    highlightDirection(dir);
}
async function moveNorth(){
    for(let i = 0; i < WIDTH; ++i){
        for(let j = 0; j < HEIGHT; ++j){
            if(values[i][j]){
                player = values[i][j];
                moveInDirection(i,j,0,-1);
            }
        }
    }
}

async function moveEast(){
    for(let y = 0; y < HEIGHT; ++y){
        for (let x = WIDTH - 1; x > -1; --x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,1,0);
            }
        }
    }
}

async function moveSouth(){
    for(let x = 0; x < WIDTH; ++x){
        for(let y = HEIGHT - 1; y > -1; --y){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,0,1);
            }
        }
    }
}
async function moveWest(){
    for(let y = 0; y < HEIGHT; ++y){
        for(let x = 0; x < WIDTH; ++x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,-1,0);
            }
        }
    }
}

async function moveSE(){
    for(let y = HEIGHT-1; y > -1; --y){
        for(let x = 0; x < WIDTH; ++x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,1,1);
            }
        }
    }
}

async function moveNW(){
    for(let y = 0; y < HEIGHT; ++y){
        for(let x = 0; x < WIDTH; ++x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,-1,-1);
            }
        }
    }
}

async function moveNE(){
    for(let y = 0; y < HEIGHT; ++y){
        for(let x = WIDTH - 1; x > -1; --x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,1,-1);
            }
        }
    }
}

async function moveSW(){
    for(let y = HEIGHT - 1; y > -1; --y){
        for(let x = 0; x < WIDTH; ++x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,-1,1);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});