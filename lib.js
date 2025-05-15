// pure
export function isGameOver(boardArray) {
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
export function wonByWall(boardArray) {
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
export function wonByDiagUp(boardArray) {
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
export function wonByDiagDown(boardArray) {
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

// pure
export function wonByTower(boardArray) {
    const winners = [];
    const width = boardArray.length;
    const height = boardArray[0].length;
    for (let i = 0; i < width; ++i) {
        let j = 0;
        while (j < height - 3) {
            const v = boardArray[i][j];
            if (v == 0) {
                j += 1;
                continue;
            }
            let allEqual = true;
            for (let k = 1; k < 4; ++k) {
                if (v != boardArray[i][j + k]) {
                    j += k
                    allEqual = false;
                    break;
                }
            }
            if (allEqual && !(winners.includes(v))) {
                winners.push(v);
                j += 4;
            }
        }
    }
    return winners;
}

// pure
export function noMoreSpace(boardArray){
    for (let a of boardArray){
        for (let b of a){
            if (b == 0){
                return false
            }
        }
    }
    return true;
}