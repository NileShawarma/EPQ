const IS_CSCLUB_EVENT_RUNNING = true
let event_details = {
    //The set session: AI difficulty for each round, played in order
    "levels": [
        {difficulty: "easy"},
        {difficulty: "medium"},
        {difficulty: "medium"},
        {difficulty: "hard"},
        {difficulty: "master"}
    ],
    "current_level": -1 // -1 = free play, otherwise the index of the active round
}

function updateRoundCard(difficultyText){
    let disp = document.getElementById("round-disp")
    let label = document.getElementById("round-label")

    if (!disp || !label){
        return
    }

    if (IS_CSCLUB_EVENT_RUNNING==true && event_details.current_level >= 0){
        disp.textContent = `${event_details.current_level+1}/${event_details.levels.length}`
        label.textContent = `Round · ${difficultyText}`
    }else{
        disp.textContent = "FREE"
        label.textContent = "Play Mode"
    }
}

//Builds e.g. "1 round on easy, 2 rounds on medium, ..."
function describeSessionPlan(){
    let counts = {}
    let order = []

    for (let level of event_details.levels){
        if (counts[level.difficulty] == undefined){
            order.push(level.difficulty)
        }
        counts[level.difficulty] = (counts[level.difficulty] || 0) + 1
    }

    return order.map((difficulty)=>{
        let n = counts[difficulty]
        return `${n} round${n > 1 ? "s" : ""} on ${difficulty}`
    }).join(", ")
}

function setBackground(color){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = color
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function getThemeColour(name, fallback){
    let value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()

    if (value == ""){
        return fallback
    }

    return value
}

function drawBoard(connect4){
    let bg_col = getThemeColour("--surface", "#ffe0cc")
    let board_col = getThemeColour("--wall", "#a8765f")
    let border_col = getThemeColour("--border", "#5c4a42")

    setBackground(bg_col)

    ctx.fillStyle = board_col
    ctx.strokeStyle = border_col
    ctx.lineWidth = 4
    ctx.beginPath()
    if (typeof ctx.roundRect == "function"){
        ctx.roundRect(BOARD_LEFT, BOARD_TOP, BOARD_WIDTH, BOARD_HEIGHT, 8)
    }else{
        ctx.rect(BOARD_LEFT, BOARD_TOP, BOARD_WIDTH, BOARD_HEIGHT)
    }
    ctx.fill()
    ctx.stroke()

    for (let row = 0; row < connect4.ROWS; row++){
        for (let col = 0; col < connect4.COLS; col++){
            let cell = connect4.grid[row][col]
            drawSlot(row, col, cell.State, connect4.is_winning_cell(row, col))
        }
    }

    if (!connect4.GameOver && connect4.CurrentTurn == connect4.PLAYER && !connect4.WaitingForAI){
        drawPreviewPiece(connect4.SelectedColumn, connect4.PLAYER)
    }
}

function drawSlot(row, col, state, isWinningCell){
    let center = getCellCenter(row, col)
    let empty_col = getThemeColour("--bg", "#fff1e6")
    let player_col = getThemeColour("--player", "#ffb88c")
    let ai_col = getThemeColour("--accent2", "#7fd8c4")
    let outline_col = getThemeColour("--border", "#5c4a42")

    ctx.beginPath()
    ctx.arc(center.x, center.y, PIECE_RADIUS, 0, 2 * Math.PI, false)

    if (state == PLAYER_PIECE){
        ctx.fillStyle = player_col
    }else if (state == AI_PIECE){
        ctx.fillStyle = ai_col
    }else{
        ctx.fillStyle = empty_col
    }

    ctx.fill()
    ctx.strokeStyle = isWinningCell ? "#ffffff" : outline_col
    ctx.lineWidth = isWinningCell ? 4 : 2
    ctx.stroke()
}

function drawPreviewPiece(col, piece){
    let center = getCellCenter(-1, col)
    let player_col = getThemeColour("--player", "#ffb88c")
    let ai_col = getThemeColour("--accent2", "#7fd8c4")

    ctx.beginPath()
    ctx.arc(center.x, center.y + 8, PIECE_RADIUS * 0.72, 0, 2 * Math.PI, false)
    ctx.fillStyle = piece == PLAYER_PIECE ? player_col : ai_col
    ctx.globalAlpha = 0.72
    ctx.fill()
    ctx.globalAlpha = 1
}

function getCellCenter(row, col){
    return {
        x: BOARD_LEFT + (col * CELL_SIZE) + (CELL_SIZE / 2),
        y: BOARD_TOP + (row * CELL_SIZE) + (CELL_SIZE / 2)
    }
}

function restartGame(connect4){
    let difficulty = document.getElementById("size-sel").value

    connect4.set_difficulty(difficulty)
    connect4.generate_empty_grid()
    connect4.heartbeat(connect4)
    unlock_username_input()
}

function showUsernameWarning(){
    let warningText = document.getElementById("warning")
    warningText.textContent = "Please Enter A Valid Username Before Playing"

    setTimeout(()=>{
        warningText.textContent = ""
    }, 4000)
}

function validUsername(){
    let input = document.getElementById("username")
    let contents = input.value

    try {
        let validName = true
        let year = contents.substring(0, 2)
        
        year = Number(year)

        if (isNaN(year)){
            validName = false
        }else if (contents.length <= 4 || contents.length > 8){
            validName = false
        }

        if (!validName){
            throw new Error("Invalid name")
        }

        return lock_username_input()
    } catch (error) {
        showUsernameWarning()
        return false
    }
}

function lock_username_input(){
    let input = document.getElementById("username")
    let usernameTitle = document.getElementsByClassName("username")[0]
    
    input.classList.add("confirmed")
    usernameTitle.classList.add("confirmed")
    input.disabled = true
    return true
}

function unlock_username_input(){
    let input = document.getElementById("username")
    let usernameTitle = document.getElementsByClassName("username")[0]
    
    input.classList.remove("confirmed")
    usernameTitle.classList.remove("confirmed")
    input.disabled = false
    return true
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
        await new Promise(resolve => setTimeout(resolve, Math.random() * 60))
        if (!document.getElementById("overlay").classList.contains("active")){
            return
        }
    }
}

class Connect4 {
    constructor() {
        this.ROWS = 6
        this.COLS = 7
        this.EMPTY = EMPTY_PIECE
        this.PLAYER = PLAYER_PIECE
        this.AI = AI_PIECE

        this.grid = []
        this.SelectedColumn = 3
        this.CurrentTurn = this.PLAYER
        this.Difficulty = "medium"
        this.WaitingForAI = false
        this._GameOver = false
        this.WinningCells = []
        this.resolveOnGameOver = null
        this.interval_clock = null
        this.pending_ai_turn = null

        this.LastMoveTime = -1

        this.DataCollection = {
            Username: "",
            Difficulty: "medium",
            StartTime: -1,
            EndTime: -1,
            Winner: 0,
            TotalMoves: 0,
            PlayerMoves: [],
            MoveTimings: [],
            FinalBoard: [],
            OptimalMoves: [],
            MoveAgreementRate: 0,
            CriticalMistakes: []
        }
    }

    generate_empty_grid(){
        let grid = []

        clearInterval(this.interval_clock)
        clearTimeout(this.pending_ai_turn)

        for (let row = 0; row < this.ROWS; row++){
            let full_row = []

            for (let col = 0; col < this.COLS; col++){
                full_row.push(
                    new Cell(this, {"row": row, "col": col})
                )
            }
            grid.push(full_row)
        }

        this.grid = grid
        this.SelectedColumn = 3
        this.CurrentTurn = this.PLAYER
        this.WaitingForAI = false
        this.GameOver = false
        this.WinningCells = []
        this.LastMoveTime = -1
        this.DataCollection = {
            Username: "",
            Difficulty: document.getElementById("size-sel").value,
            StartTime: -1,
            EndTime: -1,
            Winner: 0,
            TotalMoves: 0,
            PlayerMoves: [],
            MoveTimings: [],
            FinalBoard: [],
            OptimalMoves: [],
            MoveAgreementRate: 0,
            CriticalMistakes: []
        }

        let msg_line = document.getElementById("msg")
        msg_line.textContent = ""
        msg_line.classList.remove("won")
    }

    set_difficulty(newDifficulty){
        let difficulties = ["easy", "medium", "hard", "master"]

        if (!difficulties.includes(newDifficulty)){
            newDifficulty = "medium"
        }

        this.Difficulty = newDifficulty
    }

    get_cell_by_ID(newID){
        let r = newID.row
        let c = newID.col

        if (this.grid[r] && this.grid[r][c]){
            return this.grid[r][c]
        }

        return -1
    }

    move_selection(dir){
        if (this.GameOver || this.WaitingForAI){
            return
        }

        let next_col = this.SelectedColumn + dir

        while (next_col >= 0 && next_col < this.COLS && this.column_is_full(next_col)){
            next_col += dir
        }

        if (next_col >= 0 && next_col < this.COLS){
            this.SelectedColumn = next_col
        }

        this.heartbeat(this)
    }

    player_drop_selected(){
        this.player_drop_piece(this.SelectedColumn)
    }

    player_drop_piece(col){
        if (this.GameOver || this.WaitingForAI || this.CurrentTurn != this.PLAYER){
            return
        }

        if (this.GameStarted == false){
            if (validUsername() == false){
                return
            }

            this.start_game_clock()
        }

        if (!this.apply_move(col, this.PLAYER)){
            return
        }

        if (this.resolve_game_state(this.PLAYER)){
            this.heartbeat(this)
            return
        }

        this.CurrentTurn = this.AI
        this.WaitingForAI = true
        this.heartbeat(this)

        this.pending_ai_turn = setTimeout(() => {
            this.play_ai_turn()
        }, 450)
    }

    play_ai_turn(){
        if (this.GameOver){
            return
        }

        let board = this.get_board_state()
        let ai = new Connect4AI()
        let col = ai.choose_move(board, this.AI, this.PLAYER, this.Difficulty)

        this.apply_move(col, this.AI)

        if (this.resolve_game_state(this.AI)){
            this.WaitingForAI = false
            this.heartbeat(this)
            return
        }

        this.CurrentTurn = this.PLAYER
        this.WaitingForAI = false
        this.SelectedColumn = this.get_nearest_open_column(this.SelectedColumn)
        this.heartbeat(this)
    }

    apply_move(col, piece){
        if (col < 0 || col >= this.COLS){
            return false
        }

        for (let row = this.ROWS - 1; row >= 0; row--){
            let cell = this.grid[row][col]

            if (cell.State == this.EMPTY){
                cell.State = piece
                this.DataCollection.TotalMoves++
                if (piece == this.PLAYER){
                    let now = Date.now()
                    this.DataCollection.PlayerMoves.push(col)
                    this.DataCollection.MoveTimings.push(Math.floor(now - this.LastMoveTime))
                    this.LastMoveTime = now
                }
                return true
            }
        }

        return false
    }

    resolve_game_state(piece){
        let winning_cells = this.find_winning_cells(piece)

        if (winning_cells.length > 0){
            this.WinningCells = winning_cells
            this.GameOver = true
            this.DataCollection.EndTime = Math.floor(Date.now() / 1000)
            this.DataCollection.Winner = piece == this.PLAYER ? "player" : "ai"
            this.DataCollection.FinalBoard = this.get_board_state()
            this.DataCollection.Username = document.getElementById("username").value
            this.save_game_data()
            this.game_over(piece)
            return true
        }

        if (this.board_is_full()){
            this.GameOver = true
            this.DataCollection.EndTime = Math.floor(Date.now() / 1000)
            this.DataCollection.Winner = "draw"
            this.DataCollection.FinalBoard = this.get_board_state()
            this.DataCollection.Username = document.getElementById("username").value
            this.save_game_data()
            this.game_drawn()
            return true
        }

        return false
    }

    save_game_data(){
        let ai = new Connect4AI()
        let analysis = ai.replay_human_game(this.DataCollection.PlayerMoves, this.DataCollection.Difficulty)

        this.DataCollection.OptimalMoves = analysis.OptimalMoves
        this.DataCollection.MoveAgreementRate = analysis.MoveAgreementRate
        this.DataCollection.CriticalMistakes = analysis.CriticalMistakes

        saveConnect4Score(this.DataCollection.Username, this.DataCollection)
    }

    game_over(piece){
        let msg_line = document.getElementById("msg")
        let time_taken = this.DataCollection.EndTime - this.DataCollection.StartTime

        if (piece == this.PLAYER){
            msg_line.textContent = `//PLAYER WINS IN ${time_taken}s`
            if (typeof confetti == "function"){
                confetti()
            }
        }else{
            msg_line.textContent = `//AI WINS ON ${this.Difficulty.toUpperCase()}`
        }

        msg_line.classList.add("won")
        clearInterval(this.interval_clock)
    }

    game_drawn(){
        let msg_line = document.getElementById("msg")
        msg_line.textContent = "//DRAW - BOARD FILLED"
        msg_line.classList.add("won")
        clearInterval(this.interval_clock)
    }

    start_game_clock(){
        this.DataCollection.StartTime = Math.floor(Date.now() / 1000)
        this.LastMoveTime = Date.now()
        this.interval_clock = setInterval(() => {
            this.heartbeat(this)
        }, 1000)
    }

    get GameStarted(){
        return this.DataCollection.StartTime != -1
    }

    get GameOver(){
        return this._GameOver
    }

    set GameOver(newVal){
        if (this._GameOver !== newVal){
            this._GameOver = newVal

            if (newVal == true && typeof(this.resolveOnGameOver) == "function"){
                this.resolveOnGameOver()
                this.resolveOnGameOver = null
            }
        }
    }

    find_winning_cells(piece){
        let directions = [
            {"r": 0, "c": 1},
            {"r": 1, "c": 0},
            {"r": 1, "c": 1},
            {"r": -1, "c": 1}
        ]

        for (let row = 0; row < this.ROWS; row++){
            for (let col = 0; col < this.COLS; col++){
                if (this.grid[row][col].State != piece){
                    continue
                }

                for (let dir of directions){
                    let cells = []

                    for (let offset = 0; offset < 4; offset++){
                        let r = row + (dir.r * offset)
                        let c = col + (dir.c * offset)
                        let cell = this.get_cell_by_ID({"row": r, "col": c})

                        if (cell == -1 || cell.State != piece){
                            cells = []
                            break
                        }

                        cells.push({"row": r, "col": c})
                    }

                    if (cells.length == 4){
                        return cells
                    }
                }
            }
        }

        return []
    }

    is_winning_cell(row, col){
        for (let cell of this.WinningCells){
            if (cell.row == row && cell.col == col){
                return true
            }
        }

        return false
    }

    board_is_full(){
        return this.get_valid_columns().length == 0
    }

    column_is_full(col){
        return this.grid[0][col].State != this.EMPTY
    }

    get_valid_columns(){
        let valid_cols = []

        for (let col = 0; col < this.COLS; col++){
            if (!this.column_is_full(col)){
                valid_cols.push(col)
            }
        }

        return valid_cols
    }

    get_nearest_open_column(col){
        if (!this.column_is_full(col)){
            return col
        }

        let valid_cols = this.get_valid_columns()
        let best_col = valid_cols[0]
        let best_distance = Infinity

        for (let valid_col of valid_cols){
            let distance = Math.abs(valid_col - col)

            if (distance < best_distance){
                best_distance = distance
                best_col = valid_col
            }
        }

        return best_col
    }

    get_board_state(){
        let board = []

        for (let row = 0; row < this.ROWS; row++){
            let board_row = []

            for (let col = 0; col < this.COLS; col++){
                board_row.push(this.grid[row][col].State)
            }

            board.push(board_row)
        }

        return board
    }

    heartbeat(connect4){
        if (!connect4.GameOver){
            let startTime = connect4.DataCollection.StartTime

            if (startTime == -1){
                startTime = Math.floor(Date.now() / 1000)
            }

            document.getElementById("timer").textContent = Math.floor(Date.now() / 1000) - startTime + "s"
        }

        document.getElementById("size-disp").textContent = "7x6"
        document.getElementById("steps").textContent = connect4.DataCollection.TotalMoves

        updateRoundCard(connect4.Difficulty.charAt(0).toUpperCase() + connect4.Difficulty.slice(1))

        let msg_line = document.getElementById("msg")

        if (!connect4.GameOver){
            if (connect4.WaitingForAI){
                msg_line.textContent = `//AI THINKING - ${connect4.Difficulty.toUpperCase()}`
            }else if (connect4.GameStarted){
                msg_line.textContent = "//YOUR TURN"
            }
        }

        drawBoard(connect4)
    }
}

class Cell {
    constructor(Parent, id) {
        this.Parent = Parent
        this.ID = id
        this.State = Parent.EMPTY
    }
}

const ROWS = 6
const COLS = 7
const EMPTY_PIECE = "."
const PLAYER_PIECE = "R"
const AI_PIECE = "Y"

const CELL_SIZE = 70
const BOARD_LEFT = 10
const BOARD_TOP = 60
const BOARD_WIDTH = COLS * CELL_SIZE
const BOARD_HEIGHT = ROWS * CELL_SIZE
const PIECE_RADIUS = CELL_SIZE * 0.38
const CANVAS_WIDTH = BOARD_WIDTH + (BOARD_LEFT * 2)
const CANVAS_HEIGHT = BOARD_HEIGHT + BOARD_TOP + 20

const canvas = document.getElementById("maze-canvas")
const ctx = canvas.getContext("2d")

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT

const connect4 = new Connect4()

restartGame(connect4)

let arrowKeys = document.querySelectorAll(".arrow-pad button")

for (let arrowKey of arrowKeys){
    arrowKey.addEventListener("click", ()=>{
        if (arrowKey.id == "W"){
            connect4.move_selection(-1)
        }
        if (arrowKey.id == "E"){
            connect4.move_selection(1)
        }
        if (arrowKey.id == "S"){
            connect4.player_drop_selected()
        }

        arrowKey.classList.add("is-active")
        setTimeout(() =>{
            arrowKey.classList.remove("is-active")
        }, 250)
    })
}

canvas.addEventListener("mousemove", e => {
    if (connect4.GameOver || connect4.WaitingForAI){
        return
    }

    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let col = Math.floor((x - BOARD_LEFT) / CELL_SIZE)

    if (col >= 0 && col < COLS && !connect4.column_is_full(col)){
        connect4.SelectedColumn = col
        connect4.heartbeat(connect4)
    }
})

canvas.addEventListener("click", e => {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let col = Math.floor((x - BOARD_LEFT) / CELL_SIZE)

    if (col >= 0 && col < COLS){
        connect4.player_drop_piece(col)
    }
})

document.addEventListener("keydown", e=>{
    let key = e.key

    if (e.target.tagName == "INPUT"){
        return
    }

    if (key == "ArrowLeft" || key == "a" || key == "A"){
        connect4.move_selection(-1)
    }
    if (key == "ArrowRight" || key == "d" || key == "D"){
        connect4.move_selection(1)
    }
    if (key == "ArrowDown" || key == "s" || key == "S" || key == "Enter" || key == " "){
        e.preventDefault()
        connect4.player_drop_selected()
    }

    if (Number(key) >= 1 && Number(key) <= 7){
        connect4.player_drop_piece(Number(key) - 1)
    }
})

document.getElementById("new-btn").addEventListener("click", ()=>restartGame(connect4))
document.getElementById("size-sel").addEventListener("change", ()=>restartGame(connect4))
document.getElementById("overlay").addEventListener("click", (e)=>{
    if (e.target == document.getElementById("overlay")){
        close_popup()
    }
})

async function skillsTest(){
    document.getElementById("size-sel").disabled = true
    document.getElementById("new-btn").disabled = true

    await popup_text(`welcome to the connect 4 section of the skills test! you will play ${event_details.levels.length} rounds against the AI: ${describeSessionPlan()}. line up four pieces in a row - horizontally, vertically or diagonally - before the AI does. enter your username, then pick a column with the arrow keys or your mouse. good luck!`)

    for (let i = 0; i < event_details.levels.length; i++){
        let level = event_details.levels[i]

        event_details.current_level = i
        //Keep the dropdown in sync - generate_empty_grid reads the difficulty from it
        document.getElementById("size-sel").value = level.difficulty

        connect4.set_difficulty(level.difficulty)
        connect4.generate_empty_grid()
        connect4.heartbeat(connect4)
        unlock_username_input()

        await new Promise((resolve)=>{
            connect4.resolveOnGameOver = resolve
        })

        //Leave the round result on screen before moving on
        await new Promise(resolve => setTimeout(resolve, 2500))
    }

    event_details.current_level = -1
    document.getElementById("size-sel").disabled = false
    document.getElementById("new-btn").disabled = false
    if (typeof confetti == "function"){
        confetti()
    }
    await popup_text("congratulations for completing the connect 4 section! you can stay and play freely, but for now head back to the menu to play the other games!")
}

if (IS_CSCLUB_EVENT_RUNNING==true){
    skillsTest()
}else{
    popup_text("welcome to connect 4! drop your pieces into the board and line up four in a row - horizontally, vertically or diagonally - before the AI does. use the arrow keys or your mouse to pick a column, and choose a difficulty from the dropdown. enter your username, then click anywhere outside this box to begin!")
}
