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

function onClick(x,y) {
    return function() {
        buttonPressed(x,y);
    };
}

function buttonPressed(x,y){
    if (dir == SOUTH){
        for(let row = HEIGHT - 1; row > -1; --row){
            if (values[x][row] == 0){
                updateColor(x,row, COLORS[player], player);
                player = 3 - player;
                return;
            }
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
            element.addEventListener("click", onClick(i,j));
            col.appendChild(element);
            values[i].push(0);
        }
        g.appendChild(col);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    addButtonsToBoard();
});