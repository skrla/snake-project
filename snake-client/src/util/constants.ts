
import { Directions } from "./types";

const CANVAS_SIZE = [600, 600];
const SNAKE_START = [[8, 7]];
const APPLE_START = [4, 3];
const SCALE = 30;
const SPEED = 250; //250
const DIRECTIONS: Directions = {
    38: [0, -1],
    40: [0, 1],
    37: [-1, 0],
    39: [1, 0],
};

export { CANVAS_SIZE, SNAKE_START, APPLE_START, SCALE, SPEED, DIRECTIONS };
