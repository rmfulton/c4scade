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