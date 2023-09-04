const COLORS = ["whiteCircle","yellowCircle","redCircle"]
const SOUTH = "SOUTH";
const NORTH = "NORTH";
const WEST = "WEST";
const EAST = "EAST";
const NE = "NORTHEAST";
const NW = "NORTHWEST";
const SE = "SOUTHEAST";
const SW = "SOUTHWEST";
const WAIT = 50;
const WIDTH = 7;
const HEIGHT = 6;

let updating = false;
let player = 1;
let dir = SOUTH;
let values = [];

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

async function buttonPressed(x,y){
    if (updating){
        return;
    }
    updating = true;
    let dx = 0, dy = 0;
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
    }
    if (values[x][y] == 0){
        updateColor(x,y,COLORS[player], player);
        await moveInDirection(x,y,dx,dy);
        player = 3 - player;
    }
    updating = false;
}

function updateColor(x,j,newColor,number){
    values[x][j] = number;

    g = document.getElementsByClassName('grid')[0];
    c = g.children[x];
    c.children[j].className = newColor;

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
            element = document.createElement("button");
            element.className =  COLORS[0];
            element.addEventListener("click", onClickBoard(i,j));
            col.appendChild(element);
            values[i].push(0);
        }
        g.appendChild(col);
    }
}

async function moveNorth(){
    dir = NORTH
    const stashPlayer = player;
    for(let i = 0; i < WIDTH; ++i){
        for(let j = 0; j < HEIGHT; ++j){
            if(values[i][j]){
                player = values[i][j];
                moveInDirection(i,j,0,-1);
            }
        }
    }
    player = stashPlayer;
}

async function moveEast(){
    dir = EAST;
    const stashPlayer = player;
    for(let y = 0; y < HEIGHT; ++y){
        for (let x = WIDTH - 1; x > -1; --x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,1,0);
            }
        }
    }
    player = stashPlayer;
}

async function moveSouth(){
    dir = SOUTH
    const stashPlayer = player;
    for(let x = 0; x < WIDTH; ++x){
        for(let y = HEIGHT - 1; y > -1; --y){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,0,1);
            }
        }
    }
    player = stashPlayer;
}
async function moveWest(){
    dir = WEST
    const stashPlayer = player;
    for(let y = 0; y < HEIGHT; ++y){
        for(let x = 0; x < WIDTH; ++x){
            if(values[x][y]){
                player = values[x][y];
                moveInDirection(x,y,-1,0);
            }
        }
    }
    player = stashPlayer;
}

document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});