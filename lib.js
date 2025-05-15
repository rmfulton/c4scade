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