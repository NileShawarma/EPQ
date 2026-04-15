class Stack {
    constructor() {
        this.stack = [];
        this.stack_size = 0;
    }

    push(item){
        this.stack.push(item);
        this.stack_size += 1
    }

    peek(){
        if (this.stack_size == 0){
            console.error("Stack is empty!");            
        }

        return this.stack.at(-1);
    }

    pop(){
        if (this.stack_size == 0){
            console.error("Stack is empty!");
        }

        this.stack_size -= 1;
        return this.stack.pop()
    }

    is_empty(){
        return (this.stack_size == 0)
    }
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function setBackground(color){
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    ctx.fillStyle = color
    ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
}


function drawGrid(lineWidth, cellWidth, cellHeight, color){
    setBackground("#12121a")

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    let width = canvas.width;
    let height = canvas.height;

    for (let x = 0; x<= width; x += cellWidth){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += cellHeight){
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

//drawGrid(3,50,50,"#2a2a3e")


function dirArr_to_dirLetter(dirArr){
    const [r, c] = dirArr;
    if (r === -1 && c === 0) return "N";
    if (r === 1 && c === 0) return "S";
    if (r === 0 && c === 1) return "E";
    if (r === 0 && c === -1) return "W";

    console.error("Invalid direction given.");
}
function dirLetter_to_dirArr(dirLet){
    switch (dirLet) {
        case "N":
            return [-1,0];
        case "S":
            return [1,0]
        case "E":
            return [0,1]
        case "W":
            return [0,-1]

        default:
            console.error("Invalid direction given.");
    }
}

class Maze {
    constructor() {
        this.grid = [];

        this.END_SQUARE = "+"
        this.START_SQUARE = "+"
        this.WALL = "#"
        this.PATH = "█"
        this.PLAYER = "*"
        this.STARTING_SQUARE_ID = {"row": 0, "col": 0}
        this.END_SQUARE_ID = {"row": 9, "col": 9}
    }

    generate_empty_grid(rows, cols){
        let grid = [];

        for (let row = 0; row < rows; row ++){
            let full_row = [];

            for (let col =0; col < cols; col++){
                full_row.push(
                    new Cell(this, {"row": row, "col": col})
                )
            }
            grid.push(full_row)
        }

        this.grid = grid
    }

    generate_maze(){
        for (const row of this.grid){
            for (const cell of row){
                cell.Visited = false;
            }
        }

        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID);
        STARTING_CELL.Visited = true;

        let stack = new Stack();
        stack.push(STARTING_CELL);

        while (!stack.is_empty()) {
            let current_cell = stack.peek();
            let adj_cells = current_cell.GetAdjacentCells();

            let sanitised_adj_cells = []

            adj_cells.forEach((cell, i) => {
                if (cell[1] != -1 && cell[1].Visited == false){
                    sanitised_adj_cells.push(cell);
                }
            });

            if (sanitised_adj_cells.length == 0){
                stack.pop()
                continue
            }

            let cell_to_go_to_details = sanitised_adj_cells[Math.floor(
                Math.random() * sanitised_adj_cells.length
              )];
                        
            let cell_to_go_to_dir = cell_to_go_to_details[0]
            let cell_to_go_to = cell_to_go_to_details[1]

            current_cell.BreakWallInDir(dirLetter_to_dirArr(cell_to_go_to_dir))

            stack.push(cell_to_go_to)

            cell_to_go_to.Visited = true
        }
    }
    output_grid() {
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        // Create a buffer grid (2*nodes + 1) to account for walls between nodes
        let display = Array.from({ length: rows * 2 + 1 }, () => 
            Array(cols * 2 + 1).fill(this.WALL)
        );

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.grid[r][c];
                const dr = r * 2 + 1;
                const dc = c * 2 + 1;

                // Mark the cell path
                display[dr][dc] = this.PATH;

                // Check walls and punch holes in the display grid
                if (cell.Walls["N"] === 0) display[dr - 1][dc] = this.PATH;
                if (cell.Walls["S"] === 0) display[dr + 1][dc] = this.PATH;
                if (cell.Walls["E"] === 0) display[dr][dc + 1] = this.PATH;
                if (cell.Walls["W"] === 0) display[dr][dc - 1] = this.PATH;
            }
        }
        return display;
    }
    get_cell_by_ID(newID){
        let r = newID.row;
        let c = newID.col;

        if (this.grid[r] && this.grid[r][c]){
            return this.grid[r][c];
        }

        return -1;
    }
}

class Cell {
    constructor(Parent, id) {
        this.Parent = Parent;
        this.ID = id;
        this.Visited = false;
        this.State = Parent.PATH;
        this.Walls = {"N":1,"E":1,"S":1,"W":1}
    }

    MoveUp(){
        return this.GetCellInDir(dirLetter_to_dirArr("N"))
    }

    MoveDown(){
        return this.GetCellInDir(dirLetter_to_dirArr("S"))        
    }

    MoveLeft(){
        return this.GetCellInDir(dirLetter_to_dirArr("W"))        
    }

    MoveRight(){
        return this.GetCellInDir(dirLetter_to_dirArr("E"))
    }

    BreakWallInDir(dir){
        let dirLetter = dirArr_to_dirLetter(dir);
        let next_square = this.GetCellInDir(dir);

        if (next_square == -1){
            console.error("Directed Square is out of range!");
            return
        }

        let anti_dir = [dir[0]*-1, dir[1]*-1];
        let anti_dirLet = dirArr_to_dirLetter(anti_dir);

        this.Walls[dirLetter] = 0;
        next_square.Walls[anti_dirLet] = 0;
    }

    GetCellInDir(dir){
        let NewID = {"row": this.ID["row"]+dir[0], "col": this.ID["col"]+dir[1]}

        return this.Parent.get_cell_by_ID(NewID)
    }

    GetAdjacentCells(){
        return [
            ["N",this.MoveUp()], 
            ["E",this.MoveRight()], 
            ["S",this.MoveDown()], 
            ["W",this.MoveLeft()]
        ]
    }
}

function drawMazeWalls(maze, cellSize, wallColor, wallWidth) {
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = wallWidth;
    ctx.lineCap = "round"; // Makes the corners look smoother

    for (let r = 0; r < maze.grid.length; r++) {
        for (let c = 0; c < maze.grid[r].length; c++) {
            const cell = maze.grid[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            // Coordinates for the four corners of the cell
            const top    = y;
            const bottom = y + cellSize;
            const left   = x;
            const right  = x + cellSize;

            // Draw North Wall
            if (cell.Walls["N"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, top);
                ctx.lineTo(right, top);
                ctx.stroke();
            }
            // Draw East Wall
            if (cell.Walls["E"] === 1) {
                ctx.beginPath();
                ctx.moveTo(right, top);
                ctx.lineTo(right, bottom);
                ctx.stroke();
            }
            // Draw South Wall
            if (cell.Walls["S"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, bottom);
                ctx.lineTo(right, bottom);
                ctx.stroke();
            }
            // Draw West Wall
            if (cell.Walls["W"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, top);
                ctx.lineTo(left, bottom);
                ctx.stroke();
            }
        }
    }
}
// 1. Initialize Maze
const maze = new Maze();
const ROWS = 50;
const COLS = 50;
const CELL_SIZE = CANVAS_WIDTH / COLS; // Calculates 50px if canvas is 500px

maze.generate_empty_grid(ROWS, COLS);
maze.generate_maze();

canvas.width = CANVAS_WIDTH+1;
canvas.height = CANVAS_HEIGHT+1;

// 2. Draw Background Grid (The dark blue lines you already have)
drawGrid(1, CELL_SIZE, CELL_SIZE, "#2a2a3e");

// 3. Draw the actual Maze Walls (The borders)
// Using a brighter color like white or cyan to make them pop
drawMazeWalls(maze, CELL_SIZE, "#3f3f5e", 4);