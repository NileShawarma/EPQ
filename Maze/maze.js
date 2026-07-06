const supabaseURL = "https://lnmficqjmkhukjqugnxl.supabase.co/rest/v1/maze_event"

const IS_CSCLUB_EVENT_RUNNING = true
let event_details = {
    "levels": [
        {
            type: "recursive_backtracker",
            size: 15
        },
        {
            type: "recursive_backtracker",
            size: 21
        },
        {
            type: "wilsons",
            size: 19
        },
        {
            type: "wilsons",
            size: 25
        },
        {
            type: "wilsons",
            size: 31
        }
    ],
    "current_level": 0
}
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

   maze.heartbeat(maze)
   unlock_username_input()
}
function showUsernameWarning(){
    let warningText = document.getElementById("warning");
    warningText.textContent = "Please Enter A Valid Username Before Playing"

    setTimeout(()=>{
        warningText.textContent = ""
    },4000)
}
function validUsername(){
    let input = document.getElementById("username");
    let usernameTitle = document.getElementsByClassName("username")[0]
    let contents = input.value;
    try {
        let validName = true;
        let year = contents.substring(0,2);
        let initials = contents.substring(2);
        
        year = Number(year);

        if (isNaN(year)){
            validName = false;
        }else if (contents.length<=4 || contents.length> 8){
            validName = false;
        }

        if (!validName){
            throw new Error("Invalid name")
        }
        return lock_username_input()
    } catch (error) {
        showUsernameWarning();
        return false;
    }
}
function lock_username_input(){
    let input = document.getElementById("username");
    let usernameTitle = document.getElementsByClassName("username")[0]
    
    input.classList.add('confirmed')
    usernameTitle.classList.add('confirmed')
    input.disabled = true;
    return true;
}
function unlock_username_input(){
    let input = document.getElementById("username");
    let usernameTitle = document.getElementsByClassName("username")[0]
    
    input.classList.remove('confirmed')
    usernameTitle.classList.remove('confirmed')
    input.disabled = false;
    return true;
}
function open_popup(){
    let overlay = document.getElementById("overlay")
    overlay.classList.add("active")
}
function close_popup(){
    let overlay = document.getElementById("overlay")
    overlay.classList.remove("active")
}
async function popup_text(text){
    let popup = document.getElementById("popup")
    open_popup()

    popup.textContent = ""

    text = text.split("")
    for (const char of text){
        popup.textContent += char
        await new Promise(resolve => setTimeout(resolve, Math.random()*100))
        if (!document.getElementById("overlay").classList.contains("active")){
            return
        }
    }
}
async function skillsTest(){
    document.getElementById("size-sel").disabled=true
    document.getElementById("new-btn").disabled=true
    await popup_text("hello there welcome to the maze section of the skills test, here you will be faced with 5 mazes, each of increasing difficulty. for the duration of the test you will not be able to change the maze's size nor restarting. Happy testing and good luck!")

    for (let i=0; i<event_details.levels.length; i++){
        let level = event_details.levels[i]
        let gen_type = level.type
        let size = level.size
        
        maze.GenerationMode = gen_type
        maze.generate_empty_grid(size, size);
        maze.generate_maze();

        const CELL_SIZE = CANVAS_WIDTH / size; 

        maze.heartbeat(maze)
        unlock_username_input()

        await new Promise((resolve)=>{
                maze.resolveOnGameOver = resolve
            })
    }
    document.getElementById("size-sel").disabled=false
    document.getElementById("new-btn").disabled=false
    confetti()
    await popup_text("Congratulations for completing the maze section! You can return to play again whenever you'd like, but for now head back to the menu to play the other games!")
}
function findOptimalPath(maze) {
    let startID = maze.STARTING_SQUARE_ID;
    let endID = maze.END_SQUARE_ID;
    let startCell = maze.get_cell_by_ID(startID);

    let visited = new Set();
    let queue = [{ cell: startCell, path: [] }];
    visited.add(`${startCell.ID.row},${startCell.ID.col}`);

    while (queue.length > 0) {
        let { cell, path } = queue.shift();

        if (cell.ID.row === endID.row && cell.ID.col === endID.col) {
            return {
                moveCount: path.length,
                path: path.join("")   // e.g. "EESSWN" - same format as your GameSeed
            };
        }

        for (let [dirLet, neighborCell] of cell.GetAdjacentCells()) {
            if (neighborCell === -1) continue;               // off-grid
            if (!cell.ValidPathInDir(dirLet)) continue;       // wall blocks this move
            let key = `${neighborCell.ID.row},${neighborCell.ID.col}`;
            if (visited.has(key)) continue;

            visited.add(key);
            queue.push({ cell: neighborCell, path: [...path, dirLet] });
        }
    }

    return null; // shouldn't happen on a valid maze, but worth handling
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
        this._GameOver = false
        this.GameStarted = false
        this.resolveOnGameOver = null;

        this.interval_clock = null

        this.GenerationMode = "recursive_backtracker"
        this.DataCollection = {
            TotalMoves: 0,
            StartTime: -1,
            EndTime: Math.floor(Date.now()/1000),
            GridSize: 5,
            GameSeed: "",
            GenerationType: "recursive_backtracker",
            OptimalPath: "",
            OptimalPathLength: 0,
            PlayerMovement: ""
        }
    }

    generate_empty_grid(size){
        let grid = [];
        this.CELL_SIZE = CANVAS_WIDTH / size; 
        this.DataCollection = {
            TotalMoves: 0,
            StartTime: -1,
            EndTime: Math.floor(Date.now()/1000),
            GridSize: 5,
            GameSeed: "",
            GenerationType: "recursive_backtracker",
            OptimalPath: "",
            OptimalPathLength: 0,
            PlayerMovement: ""
        }
        clearInterval(this.interval_clock)
        for (let row = 0; row < size; row ++){
            let full_row = [];

            for (let col =0; col < size; col++){
                full_row.push(
                    new Cell(this, {"row": row, "col": col})
                )
            }
            grid.push(full_row)
        }
        this.END_SQUARE_ID = {"row": size-1, "col": size-1}
        this.grid = grid
        this.DataCollection.GridSize = size
        document.getElementById("msg").textContent = ""
        document.getElementById("msg").classList.remove("won")
    }

    load_maze_seed(size, seed_string, mode = "recursive_backtracker"){
        for (const row of this.grid){
            for (const cell of row){
                cell.Visited = false;
            }
        }
        this.GameOver = false;

        this.generate_empty_grid(size)

        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID)

        let stack = new Stack()
        stack.push(STARTING_CELL)

        for (let char of seed_string){
            let current_cell = stack.peek()

            if (char!="<"){
                current_cell.BreakWallInDir(dirLetter_to_dirArr(char))
                stack.push(current_cell.GetCellInDir(dirLetter_to_dirArr(char)))
            }else{
                stack.pop()
            }
        }

        this.DataCollection.GridSize = size
        this.DataCollection.GameSeed = seed_string
        this.PlayerCell = this.STARTING_SQUARE_ID
        this.grid[0][0].State = this.PLAYER
    }
    generate_recursive_backtracker(){
        this.DataCollection.GenerationType = "recursive_backtracker"

        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID);

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

            if (sanitised_adj_cells.length == 0 || current_cell == this.get_cell_by_ID(this.END_SQUARE_ID)){
                stack.pop()
                this.DataCollection.GameSeed = this.DataCollection.GameSeed + "<"
                continue
            }

            let cell_to_go_to_details = sanitised_adj_cells[Math.floor(
                Math.random() * sanitised_adj_cells.length
              )];
                        
            let cell_to_go_to_dir = cell_to_go_to_details[0]
            let cell_to_go_to = cell_to_go_to_details[1]
            
            this.DataCollection.GameSeed = this.DataCollection.GameSeed + cell_to_go_to_dir

            current_cell.BreakWallInDir(dirLetter_to_dirArr(cell_to_go_to_dir))

            stack.push(cell_to_go_to)

            cell_to_go_to.Visited = true
        }

    }
    generate_wilsons(){
        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID);
        STARTING_CELL.Visited = true;

        let non_maze_cells = this.grid.flat();
        let remove_from_non_maze = (cell) => {
            let index = non_maze_cells.indexOf(cell);
            if (index != -1){
                non_maze_cells.splice(index, 1);
            }
        };
        let get_random_cell = () => {
            return non_maze_cells[Math.floor(
                Math.random() * non_maze_cells.length
            )];
        };

        remove_from_non_maze(STARTING_CELL);
        this.DataCollection.GenerationType = "wilsons";

        while (non_maze_cells.length != 0){
            let random_starting_cell = get_random_cell();
            let current_cell = random_starting_cell;
            let path = [current_cell];
            let path_dirs = [];

            while (current_cell.Visited != true){
                let sanitised_adj_cells = current_cell.GetAdjacentCells().filter((cell) => {
                    return cell[1] != -1;
                });

                let cell_to_go_to_details = sanitised_adj_cells[Math.floor(
                    Math.random() * sanitised_adj_cells.length
                )];

                let cell_to_go_to_dir = cell_to_go_to_details[0];
                let cell_to_go_to = cell_to_go_to_details[1];
                let loop_start_index = path.indexOf(cell_to_go_to);

                if (loop_start_index != -1){
                    path = path.slice(0, loop_start_index + 1);
                    path_dirs = path_dirs.slice(0, loop_start_index);
                }else{
                    path.push(cell_to_go_to);
                    path_dirs.push(cell_to_go_to_dir);
                }

                current_cell = cell_to_go_to;
            }

            current_cell = random_starting_cell;
            current_cell.Visited = true;
            remove_from_non_maze(current_cell);

            for (let dir of path_dirs){
                current_cell.BreakWallInDir(dirLetter_to_dirArr(dir));
                current_cell = current_cell.GetCellInDir(dirLetter_to_dirArr(dir));
                current_cell.Visited = true;
                remove_from_non_maze(current_cell);
            }

            this.DataCollection.GameSeed = this.DataCollection.GameSeed + path_dirs.join("") + "<";
        }
    }
    generate_maze(){
        for (const row of this.grid){
            for (const cell of row){
                cell.Visited = false;
            }
        }
        this.GameOver = false;
        this.GameStarted = false;

        let STARTING_CELL = this.get_cell_by_ID(this.STARTING_SQUARE_ID);
        STARTING_CELL.Visited = true;
        this.PlayerCell = this.STARTING_SQUARE_ID
        
        switch (this.GenerationMode) {
            case "recursive_backtracker":
                this.generate_recursive_backtracker();
                break;
            case "wilsons":
                this.generate_wilsons();
                break;
            default:
                this.generate_recursive_backtracker();
        }
        let optimalPath = findOptimalPath(this)
        this.DataCollection.OptimalPath = optimalPath.path
        this.DataCollection.OptimalPathLength = optimalPath.moveCount

        this.grid[0][0].State = this.PLAYER
    }
    set_difficulty_easy(){
        this.GenerationMode = "recursive_backtracker"
    }
    set_difficulty_hard(){
        this.GenerationMode = "wilsons"
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
        if (this.GameOver){ //If game is over, dont try and do anything
            return;
        }

        if (this.GameStarted==false){ //If we just started, check if the user is valid before doing anything
            if (validUsername()==false){
                return;
            }
        }
        this.heartbeat(this)        
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
            if (this.GameStarted==true){
                this.DataCollection.TotalMoves++
            }
            return;
        }else{
            this.DataCollection.TotalMoves++
            this.DataCollection.PlayerMovement += dirLet
        }
        if (this.GameStarted==false){

            this.GameStarted = true
            this.DataCollection.StartTime = Math.floor(Date.now()/1000)
            this.interval_clock = setInterval(() => {
                this.heartbeat(this)
            }, 1000);
        }

        this.PlayerCell = next_cell.ID
        
        if (this.PlayerCell.row==this.END_SQUARE_ID.row & this.PlayerCell.col==this.END_SQUARE_ID.col){
            //Player has won so uhm do something
            this.GameOver = true;
            this.DataCollection.EndTime = Math.floor(Date.now()/1000)
            console.log("Game won!")
            console.log(this.DataCollection)
            this.game_won()

        }
        this.heartbeat(this)    
    }

    game_won(){
        let time_taken = this.DataCollection.EndTime-this.DataCollection.StartTime
        let msg_line = document.getElementById("msg");
        msg_line.textContent = `//MAZE ESCAPED IN ${time_taken}s`

        msg_line.classList.add('won')
        saveScore(document.getElementById("username").value, this.DataCollection)
        clearInterval(this.interval_clock)
    }
    get GameOver(){
        return this._GameOver;
    }
    set GameOver(newVal){
        if (this._GameOver !== newVal){
            this._GameOver = newVal;

            if (newVal == true && typeof(this.resolveOnGameOver) == "function"){
                this.resolveOnGameOver()
                this.resolveOnGameOver = null
            }
        }
    }
    //idk the convention but ive seen hearbeat used as a
    //function name, so here its js used to render the screen
    heartbeat(maze){
        if (!maze.GameOver){ //Only modify displayed time IF the game is still in progress
            let startTime = maze.DataCollection.StartTime;
            if (startTime == -1){ // -1 indicates the game hasnt started yet
                startTime = Math.floor(Date.now()/1000)
            }
            document.getElementById("timer").textContent = Math.floor(Date.now()/1000) - startTime + "s"
        }
        
        let size = maze.DataCollection.GridSize
        document.getElementById("size-disp").textContent = `${size}x${size}`

        document.getElementById("steps").textContent = maze.DataCollection.TotalMoves

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
    if (e.target.tagName == "INPUT"){
        return;
    }
    maze.move_player(mappings[key])

    btn.classList.add("is-active")
    setTimeout(() =>{
        btn.classList.remove("is-active")
    }, 500)
    
})

document.getElementById("new-btn").addEventListener("click", ()=>restartGame(maze))
document.getElementById("overlay").addEventListener("click", (e)=>{
    if (e.target == document.getElementById("overlay")){
        close_popup()
    }
})

if (IS_CSCLUB_EVENT_RUNNING==true){
    skillsTest()
}