import { inBounds, intArrayEquals } from './utils.js';
import { DIR2DELTA, STARTING_MOVES, DIRECTIONS } from './constants.js';
import { isGameOver, getOtherPlayer } from './lib.js';
/*
This function should return 
- the direction to rotate the board in, and
- the i,j indices to click given the state of the board
*/
export function computerMove(currentBoard, current_dir, playerTurn, depth){
    // if there's a winning move in one turn, play it
    const width = currentBoard.length;
    const height = currentBoard[0].length;
    const d = new Date();
    const t = d.getTime();
    console.log("thinking...");
    let okayMoves = [];
    for(let direction of DIRECTIONS){
        const afterRotating = simulateRotation(currentBoard, direction);
        const result =  isGameOver(afterRotating);
        if ( intArrayEquals(result, [playerTurn])){
            printThinkingTime(t);
            console.log("found a forced win");
            return [direction,firstAvailableMove(currentBoard, width, height), current]
        }
        else if (intArrayEquals(result, [getOtherPlayer(playerTurn)])){
            continue;
        }
        for (let move of STARTING_MOVES[direction]){
            let i = move[0], j = move[1];
            if (afterRotating[i][j] == 0){
                // TODO: enable removing the piece you play
                let afterPlaying = deepcopy(afterRotating);
                simulateAddition(afterPlaying, direction, playerTurn, i,j);
                const result = guaranteed_winners(afterPlaying, getOtherPlayer(playerTurn), depth);
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
        return [current_dir,firstAvailableMove(currentBoard, width, height)]
    }
}


export function simulateRotation(values, newDirection, dir2delta){
    values = deepcopy(values);
    const width = values.length;
    const height = values[0].length;
    const dx = DIR2DELTA[newDirection][0];
    const dy = DIR2DELTA[newDirection][1];
    const xStart = dx == 1 ? width - 1 : 0;
    const yStart = dy == 1 ? height - 1 : 0;
    const xdelta = dx == 1 ? -1 : 1;
    const ydelta = dy == 1 ? -1 : 1;
    const tasks = []
    for (let i = xStart; i * xdelta < width - xStart; i += xdelta) {
        for (let j = yStart; j * ydelta < height - yStart; j += ydelta) {
            if (values[i][j]) {
                simulateMoveInDirection(i, j, dx, dy,values);
            }
        }
    }
    return values;
}

export function simulateAddition(board, direction, playerTurn, i,j){
    const dx = DIR2DELTA[direction][0];
    const dy = DIR2DELTA[direction][1];
    board[i][j] = playerTurn;
    simulateMoveInDirection(i,j,dx,dy, board)
}

// a generalization of isGameOver
export function guaranteed_winners(currentBoard, playerTurn, num_moves){
    const preliminary_result = isGameOver(currentBoard);
    if (preliminary_result.length > 0 || num_moves == 0){
        return preliminary_result;
    }

    let tying_possible = false;
    let undetermined_outcome = false;
    for (let direction of DIRECTIONS){
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
        for (let move of STARTING_MOVES[direction]){
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

export function printThinkingTime(t){
    const d2 = new Date();
    console.log(`thought for ${(d2.getTime() - t)/1000} seconds`)
}

export function randomChoice(array){
    const L = array.length;
    const i = Math.floor(Math.random()*L);
    return array[i];
}

export function simulateMoveInDirection(x, y, dx, dy, board) {
    let newx = x + dx;
    let newy = y + dy;

    while (board.length > 0 && inBounds(newx, newy, board.length, board[0].length) && board[newx][newy] == 0) {
        swapValues(x, y, newx, newy, board);
        x = newx;
        y = newy;
        newx += dx;
        newy += dy;
    }
}

export function swapValues(x,y,a,b,board){
    const tmp = board[x][y];
    board[x][y] = board[a][b];
    board[a][b] = tmp;
}


export function deepcopy(values){
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

export function firstAvailableMove(currentBoard, width, height){
    for (let i = 0; i < width; ++i){
        for (let j = 0; j < height; ++j){
            if (currentBoard[i][j] == 0){
                return [i,j];
            }
        }
    }
}