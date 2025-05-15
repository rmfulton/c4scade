import { inBounds, intArrayEquals } from "./utils.js";

export const COLORS = ["nocolor", "yellow", "red"]
export const SOUTH = "S";
export const NORTH = "N";
export const WEST = "W";
export const EAST = "E";
export const NE = "NE";
export const NW = "NW";
export const SE = "SE";
export const SW = "SW";
export const DIRECTIONS = [NW, NORTH, NE, WEST, EAST, SW, SOUTH, SE]; // order facilitates a sensible UI.
export const DIR2DELTA = { 'N': [0, -1], 'S': [0, 1], 'E': [1, 0], 'W': [-1, 0], 'NW': [-1, -1], 'SW': [-1, 1], 'SE': [1, 1], 'NE': [1, -1] }
export const DIR2ROT = { 'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': 225, 'W': 270, 'SW': 315 }
export const WAIT = 70;
export const WIDTH = 7;
export const HEIGHT = 6;
export const STARTING_MOVES = getAllColumnSeeds(WIDTH, HEIGHT);

function getAllColumnSeeds(dimension0, dimension1){
    let result = {};
    for(let direction of DIRECTIONS){
        let seeds = [];
        for(let i = 0; i < dimension0; ++i){
            for (let j = 0; j < dimension1; ++j){
                let coords;
                let parentCoords = [i,j];
                do {
                    coords = parentCoords;
                    parentCoords = [coords[0]-DIR2DELTA[direction][0], coords[1] - DIR2DELTA[direction][1]];
                }
                while (coordInBounds(parentCoords, WIDTH, HEIGHT));
                let alreadyContains = false;
                for(let seed of seeds){
                    if (intArrayEquals(seed, coords)){
                        alreadyContains = true;
                    }
                }
                if (alreadyContains == false){
                    seeds.push(coords);
                }
            }
        }
        result[direction] = seeds;
    }
    return result;
}


function coordInBounds(pair, width, height){
    return inBounds(pair[0], pair[1], width, height);
}
