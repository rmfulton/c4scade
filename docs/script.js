const COLORS = ["whiteCircle","yellowCircle","redCircle"]
const SOUTH = "SOUTH";
const NORTH = "NORTH";
const WEST = "WEST";
const EAST = "EAST";
const NE = "NORTHEAST";
const NW = "NORTHWEST";
const SE = "SOUTHEAST";
const SW = "SOUTHWEST";
const WAIT = 100;
const WIDTH = 7;
const HEIGHT = 6;

let player = 1;
let dir = SOUTH;
let values = [];

function delay(milliseconds){
    return new Promise(resolve => {setTimeout(resolve, milliseconds);});
}

function onClickBoard(x,y) {
    return function() {
        buttonPressed(x,y);
    };
}

function buttonPressed(x,y){
    if (dir == SOUTH){

        let row = HEIGHT - 1;
        while (row > -1 && values[x][row] != 0){
            --row;
        }
        if (row > -1){
            updateColor(x,row,COLORS[player],player);
            player = 3 - player;
        }
    }
    else if (dir == NORTH){
        let row = 0;
        while (row < HEIGHT && values[x][row] != 0){
            ++row;
        }
        if (row < HEIGHT){
            updateColor(x,row,COLORS[player],player);
            player = 3 - player;
        }
    } else if (dir == EAST){
        let col = WIDTH - 1;
        while(col > -1 && values[col][y] != 0){
            --col;
        }
        if (col > -1){
            updateColor(col,y,COLORS[player],player);
            player = 3 - player;
        }
    } else if (dir == WEST){
        let col = 0;
        while(col < WIDTH && values[col][y] != 0){
            ++col;
        }
        if (col < WIDTH){
            updateColor(col,y,COLORS[player],player);
            player = 3 - player;
        }
    }
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

function translate(dx, dy){
    xstart = dx == -1 ? 0 : WIDTH - 1;
    xend = dx == -1 ? WIDTH : -1;

}

async function moveNorth(){
    dir = NORTH
    const stashPlayer = player;
    for(let i = 0; i < WIDTH; ++i){
        for(let j = 0; j < HEIGHT; ++j){
            if(values[i][j]){
                player = values[i][j];
                updateColor(i,j,COLORS[0],0);
                buttonPressed(i,j);
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
                updateColor(x,y,COLORS[0],0);
                buttonPressed(x,y);
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
                updateColor(x,y,COLORS[0],0);
                buttonPressed(x,y);
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
                updateColor(x,y,COLORS[0],0);
                buttonPressed(x,y);
            }
        }
    }
    player = stashPlayer;
}

function makeDirButton(direction, callback, parent){
    let b = document.createElement('button');
    b.className = 'square';
    b.textContent = direction;
    b.addEventListener("click",callback);
    parent.appendChild(b);
}

function addControlPanel(){
    let control = document.getElementById("control-panel");
    makeDirButton(NORTH, moveNorth, control);
    makeDirButton(SOUTH, moveSouth, control);
    makeDirButton(EAST, moveEast, control);
    makeDirButton(WEST, moveWest, control);
}

document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});