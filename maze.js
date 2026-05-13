function setBackground(color){
    ctx.clearRect(0,0,CANVAS_WIDTH+10,CANVAS_HEIGHT+10)
    ctx.fillStyle = color
    ctx.fillRect(0,0,CANVAS_WIDTH+10,CANVAS_HEIGHT+10)
}

function drawGrid(lineWidth, cellWidth, cellHeight, color){
    setBackground("#12121a")

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    let width = canvas.width;
    let height = canvas.height;

    for (let x = 0; x<= width; x += cellWidth){
        ctx.beginPath();
        ctx.moveTo(x+5, 0);
        ctx.lineTo(x+5, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += cellHeight){
        ctx.beginPath();
        ctx.moveTo(0, y+5);
        ctx.lineTo(width, y+5);
        ctx.stroke();
    }
}

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

function drawMazeWalls(maze, cellSize, wallColour, wallWidth) {
    ctx.strokeStyle = wallColour;
    ctx.lineWidth = wallWidth;
    ctx.lineCap = "round";

    for (let r = 0; r < maze.grid.length; r++) {
        for (let c = 0; c < maze.grid[r].length; c++) {
            let cell = maze.grid[r][c];
            let x = c * cellSize+5;
            let y = r * cellSize+5;

            let top = y;
            let bottom = y + cellSize;
            let left = x;
            let right = x + cellSize;

            if (cell.Walls["N"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, top);
                ctx.lineTo(right, top);
                ctx.stroke();
            }
            if (cell.Walls["E"] === 1) {
                ctx.beginPath();
                ctx.moveTo(right, top);
                ctx.lineTo(right, bottom);
                ctx.stroke();
            }
            if (cell.Walls["S"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, bottom);
                ctx.lineTo(right, bottom);
                ctx.stroke();
            }
            if (cell.Walls["W"] === 1) {
                ctx.beginPath();
                ctx.moveTo(left, top);
                ctx.lineTo(left, bottom);
                ctx.stroke();
            }
        }
    }
    //Draws the end and start corners
    let startr = maze.STARTING_SQUARE_ID["row"]
    let startc = maze.STARTING_SQUARE_ID["col"]
    let x = startr * cellSize +5 ;
    let y = startc * cellSize +5 ;

    let top = y;
    let bottom = y + cellSize;
    let left = x;
    let right = x + cellSize;

    ctx.strokeStyle = "#ce0101";
    ctx.lineWidth = 2
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left,top);
    ctx.lineTo(left,bottom);
    ctx.stroke();

    let endr = maze.END_SQUARE_ID["row"]
    let endc = maze.END_SQUARE_ID["col"]
    x = endr * cellSize +5 ;
    y = endc * cellSize +5 ;

    top = y;
    bottom = y + cellSize;
    left = x;
    right = x + cellSize;

    ctx.strokeStyle = "#1deef5";
    ctx.lineWidth = 2
    ctx.beginPath();
    ctx.moveTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left,bottom);
    ctx.lineTo(right,bottom);
    ctx.stroke();

    top += 4
    bottom -= 5
    right -= 4
    left += 4

    ctx.fillStyle = "#338a8de8"
    ctx.fillRect(left,top,right-left,bottom - top)

   let radius = cellSize/2 - 2
   let centerY = y+radius +2
   let centerX = x + radius +2

   ctx.beginPath()
   ctx.arc(centerX, centerY, radius*0.65, 0, 2 * Math.PI, false);
   ctx.fillStyle = "#1deef5";
   ///ctx.fill();

}

function drawPlayer(maze, cellSize, playerColour){
   let playerCellID = maze.PlayerCell

   let top = playerCellID["row"]*cellSize
   let left = playerCellID["col"]*cellSize

   let radius = cellSize/2
   let centerY = top + radius +5
   let centerX = left + radius +5

   ctx.beginPath()
   ctx.arc(centerX, centerY, radius*0.65, 0, 2 * Math.PI, false);
   ctx.fillStyle = playerColour;
   ctx.fill();

   ctx.strokeStyle = "#000"
   ctx.lineWidth = 2
   ctx.stroke()
}

function restartGame(maze){
   let COLS, ROWS;

   COLS = document.getElementById("size-sel").value
   ROWS = COLS

   maze.generate_empty_grid(ROWS, COLS);
   maze.generate_maze();

   const CELL_SIZE = CANVAS_WIDTH / COLS; 

   drawGrid(1, CELL_SIZE, CELL_SIZE, "#2a2a3e");

   drawMazeWalls(maze, CELL_SIZE, "#3f3f5e", 4);

   drawPlayer(maze, CELL_SIZE, "#c8ff00") ;
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
        this.PlayerCell = this.STARTING_SQUARE_ID
        this.GameOver = false
    
        this.DataCollection = {
            TotalMoves: 0,
            StartTime: Math.floor(Date.now()/1000),
            EndTime: Math.floor(Date.now()/1000),
            GridSize: '{"row": 5, "col": 5}'
        }
    }

    generate_empty_grid(rows, cols){
        let grid = [];
        this.CELL_SIZE = CANVAS_WIDTH / cols; 

        for (let row = 0; row < rows; row ++){
            let full_row = [];

            for (let col =0; col < cols; col++){
                full_row.push(
                    new Cell(this, {"row": row, "col": col})
                )
            }
            grid.push(full_row)
        }
        this.END_SQUARE_ID = {"row": rows-1, "col": cols-1}
        this.grid = grid
        this.DataCollection.GridSize = `{"row": ${rows}, "col": ${cols}}`
    }

    generate_maze(){
        for (const row of this.grid){
            for (const cell of row){
                cell.Visited = false;
            }
        }
        this.GameOver = false;

        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID);
        STARTING_CELL.Visited = true;
        this.PlayerCell = this.STARTING_SQUARE_ID

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

            if (sanitised_adj_cells.length == 0 || current_cell == this.get_cell_by_ID(this.END_SQUARE_ID) ){
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

        this.grid[0][0].State = this.PLAYER
    }

    get_cell_by_ID(newID){
        let r = newID.row;
        let c = newID.col;

        if (this.grid[r] && this.grid[r][c]){
            return this.grid[r][c];
        }

        return -1;
    }

    move_player(dirLet){
        if (this.GameOver){
            return;
        }
        this.DataCollection.TotalMoves++
        let player_cell = this.get_cell_by_ID(this.PlayerCell)
        let next_cell;

        if (dirLet == "N"){
            next_cell = player_cell.MovePlayerUp()
        }
        if (dirLet == "E"){
            next_cell = player_cell.MovePlayerRight()
        }
        if (dirLet == "S"){
            next_cell = player_cell.MovePlayerDown()
        }
        if (dirLet == "W"){
            next_cell = player_cell.MovePlayerLeft()
        }
        if (!next_cell){
            return
        }

        this.PlayerCell = next_cell.ID
        
        if (this.PlayerCell.row==this.END_SQUARE_ID.row & this.PlayerCell.col==this.END_SQUARE_ID.col){
            //Player has won so uhm do something
            this.GameOver = true;
            this.DataCollection.EndTime = Math.floor(Date.now()/1000)
            console.log("Game won!")
            console.log(this.DataCollection)
            saveScore(null, this.DataCollection)
        }

        drawGrid(1, this.CELL_SIZE, this.CELL_SIZE, "#2a2a3e");

        drawMazeWalls(this, this.CELL_SIZE, "#3f3f5e", 4);

        drawPlayer(this, this.CELL_SIZE, "#c8ff00")
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

    ValidPathInDir(dir){
        return (this.Walls[dir] == 0);
    }

    MovePlayerUp(){
        if (!(this.State == this.Parent.PLAYER)){
            return;
        }
        if (!this.ValidPathInDir("N")) return

        let next_cell = this.GetCellInDir(dirLetter_to_dirArr("N"));
        next_cell.State = this.Parent.PLAYER;
        this.State = this.Parent.PATH

        return next_cell
    }
    MovePlayerRight(){
        if (!(this.State == this.Parent.PLAYER)){
            return;
        }
        if (!this.ValidPathInDir("E")) return

        let next_cell = this.GetCellInDir(dirLetter_to_dirArr("E"));
        next_cell.State = this.Parent.PLAYER;
        this.State = this.Parent.PATH

        return next_cell
    }
    MovePlayerDown(){
        if (!(this.State == this.Parent.PLAYER)){
            return;
        }
        if (!this.ValidPathInDir("S")) return

        let next_cell = this.GetCellInDir(dirLetter_to_dirArr("S"));
        next_cell.State = this.Parent.PLAYER;
        this.State = this.Parent.PATH

        return next_cell
    }
    MovePlayerLeft(){
        if (!(this.State == this.Parent.PLAYER)){
            return;
        }
        if (!this.ValidPathInDir("W")) return

        let next_cell = this.GetCellInDir(dirLetter_to_dirArr("W"));
        next_cell.State = this.Parent.PLAYER;
        this.State = this.Parent.PATH
    
        return next_cell
    }
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH+10;
canvas.height = CANVAS_HEIGHT+10;

const maze = new Maze();

restartGame(maze)

let arrowKeys = document.querySelectorAll(".arrow-pad button")

for (let arrowKey of arrowKeys){
    arrowKey.addEventListener("click", ()=>maze.move_player(arrowKey.id))
}

document.addEventListener("keydown", e=>{
    let key = e.key;
    let mappings = {
        "ArrowUp": 'N',
        "ArrowDown": 'S',
        "ArrowLeft": 'W',
        "ArrowRight": 'E',
    
        "W": "N",
        "A": "W",
        "S": "S",
        "D": "E",

        "w": "N",
        "a": "W",
        "s": "S",
        "d": "E"
    }
    let btn = document.getElementById(mappings[key])

    if (!mappings[key]){
        return
    }
    maze.move_player(mappings[key])

    btn.classList.add("is-active")
    setTimeout(() =>{
        btn.classList.remove("is-active")
    }, 500)
    
})

document.getElementById("new-btn").addEventListener("click", ()=>restartGame(maze))
