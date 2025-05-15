//pure
export function inBounds(x, y, width, height) {
    return 0 <= x && x < width && 0 <= y && y < height;
}

//pure
export function intArrayEquals(a,b){
    if (a.length != b.length){
        return false;
    }
    for(let i = 0; i < a.length; ++i){
        if (a[i] != b[i]){
            return false;
        }
    }
    return true;
}

//pure
export function min(a, b) {
    return a < b ? a : b;
}

export function logBoard(board){
    for (let row of board){
        let s = "";
        for (let entry of row){
            s += `${entry} `;
        }
        console.log(s);
    }
}