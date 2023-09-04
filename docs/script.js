const COLORS = ["whiteCircle","yellowCircle","redCircle"]
const SOUTH = "SOUTH";
const NORTH = "NORTH";
const WEST = "WEST";
const EAST = "EAST";
const NE = "NORTHEAST";
const NW = "NORTHWEST";
const SE = "SOUTHEAST";
const SW = "SOUTHWEST";
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
    let emptySpace;
    for(let i = 0; i < WIDTH; ++i){
        emptySpace = 0;
        for(;emptySpace < HEIGHT; ++emptySpace){
            if (values[i][emptySpace]){
                break;
            }
        }
        for (let j = emptySpace; j < HEIGHT; ++j){
            updateColor(i,j-emptySpace,COLORS[values[i][j]], values[i][j]);
            if (emptySpace){
                updateColor(i,j,COLORS[0], 0);
            }
            await delay(200);
        }
    }
    dir = NORTH;
}

async function moveEast(){
    let emptySpace;
    for(let j = 0; j < HEIGHT; ++j){
        emptySpace = 0;
        for(;emptySpace < WIDTH; ++emptySpace){
            if (values[WIDTH - 1 - emptySpace][j]){
                break;
            }
        }
        for (let i = WIDTH - 1 - emptySpace; i > -1; --i){
            updateColor(i + emptySpace,j,COLORS[values[i][j]], values[i][j]);
            if (emptySpace){
                updateColor(i,j,COLORS[0], 0);
            }
            await delay(200);
        }
    }
    dir = EAST;
}

async function moveSouth(){
    let emptySpace;
    for(let i = 0; i < WIDTH; ++i){
        emptySpace = 0;
        for(;emptySpace < HEIGHT; ++emptySpace){
            if (values[i][HEIGHT - 1 - emptySpace]){
                break;
            }
        }
        for (let j = HEIGHT - 1 - emptySpace; j > -1; --j){
            updateColor(i,j+emptySpace,COLORS[values[i][j]], values[i][j]);
            if (emptySpace){
                updateColor(i,j,COLORS[0], 0);
            }
            await delay(200);
        }
    }
    dir = SOUTH;
}
async function moveWest(){
    let emptySpace;
    for(let y = 0; y < HEIGHT; ++y){
        emptySpace = 0;
        for(;emptySpace < WIDTH; ++emptySpace){
            if (values[emptySpace][y]){
                break;
            }
        }
        for (let x = emptySpace; x < WIDTH; ++x){
            updateColor(x - emptySpace,y,COLORS[values[x][y]], values[x][y]);
            if (emptySpace){
                updateColor(x,y,COLORS[0], 0);
            }
            await delay(200);
        }
    }
    dir = WEST;
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
    addControlPanel();
});